// Load test: a player's journey through the game API.
// Each virtual user (VU) plays with its own account, created in setup().
// WARNING: it creates accounts and writes game data. Never run it against a database you care about
// without planning how to clean it up.
import http from 'k6/http';
import { check, fail, group, sleep } from 'k6';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';
const USERS = Number(__ENV.USERS || 10);
const RAMP = __ENV.RAMP || '30s';
const HOLD = __ENV.HOLD || '3m';
const THINK = Number(__ENV.THINK || 5); // mean pause between two player actions, in seconds

const ENDPOINTS = [
  'login', 'characters', 'items', 'quests', 'gifts', 'events',
  'dig', 'expedition', 'openChest', 'sellItems',
];

export const options = {
  scenarios: {
    players: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP, target: USERS },
        { duration: HOLD, target: USERS },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '60s',
      gracefulStop: '60s',
    },
  },
  setupTimeout: '5m',
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
  thresholds: Object.assign(
    {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<500'],
      checks: ['rate>0.99'],
    },
    // one threshold per endpoint, so that the summary details each of them
    ...ENDPOINTS.map((n) => ({ [`http_req_duration{name:${n}}`]: ['p(95)<500'] })),
  ),
};

export function setup() {
  const users = [];
  for (let i = 0; i < USERS; i++) {
    const res = http.get(`${BASE_URL}/V1/user/create/`, { tags: { name: 'createUser' } });
    if (res.status !== 201) {
      fail(`user creation failed: ${res.status} ${res.body}`);
    }
    users.push({ publicKey: res.json('public_key'), privateKey: res.json('private_key') });
  }
  return { users };
}

// random pause around THINK seconds (between 0.5x and 1.5x)
const think = () => sleep(THINK * (0.5 + Math.random()));

export default function (data) {
  const user = data.users[(exec.vu.idInTest - 1) % data.users.length];
  const base = `${BASE_URL}/V1/user/${user.publicKey}`;

  const params = (name) => ({
    headers: { 'Content-Type': 'application/json', 'X-PRIVATE-KEY': user.privateKey },
    tags: { name },
  });
  const verify = (res, name, status) => {
    const ok = check(res, { [`${name} -> ${status}`]: (r) => r.status === status });
    if (!ok) {
      console.warn(`${name}: ${res.status} ${String(res.body).slice(0, 200)}`);
    }
    return ok;
  };
  const get = (name, url) => {
    const res = http.get(url, params(name));
    return verify(res, name, 200) ? res : null;
  };
  const post = (name, url, body, status = 200) => {
    const res = http.post(url, JSON.stringify(body), params(name));
    return verify(res, name, status) ? res : null;
  };

  let characters;
  group('open the game', () => {
    get('login', `${BASE_URL}/V1/login/${user.publicKey}`);
    characters = get('characters', `${base}/characters/`);
    get('quests', `${base}/quests/`);
    get('gifts', `${base}/gifts/`);
    get('events', `${base}/events/`);
  });
  think();

  group('expedition', () => {
    if (!characters) return;
    const free = characters.json().find((c) => c.expeditionId === null);
    if (!free) return;

    // mordak is a level 1 location: expeditions there are free, a player never runs out of money
    const location = 'mordak';
    const caseId = Math.floor(Math.random() * 18);
    post('dig', `${base}/expedition/dig/`, { location, caseId, cost: 0 });
    think();

    const sent = post('expedition', `${base}/expedition/`, {
      location, caseId, character: free.num, difficulty: 1 + Math.floor(Math.random() * 3),
    });
    if (!sent) return;
    think();

    post('openChest', `${base}/items/`, { expeditionId: sent.json('expeditionId') }, 201);
  });
  think();

  group('inventory', () => {
    const items = get('items', `${base}/items/?page=0&limit=50`);
    if (!items) return;
    // sells the ordinary items, so that the inventory does not grow without end
    const toSell = items.json().filter((i) => !i.stats).slice(0, 10).map((i) => ({ id: i.id }));
    if (toSell.length === 0) return;
    think();
    post('sellItems', `${base}/sellitems/`, toSell);
  });
  think();
}

// Characters left on an expedition by an interrupted iteration stay busy: use fresh accounts for each run
// (setup() does).
