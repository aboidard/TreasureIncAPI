#!/usr/bin/env bash
# Load test of the LOCAL Treasure Inc stack with k6.
# usage: run.sh <users> [hold duration, e.g. 5m]
# env overrides: RAMP, HOLD, THINK (seconds)
set -u -o pipefail
export MSYS_NO_PATHCONV=1

# the folder of this script, as a Windows path under Git Bash (docker mounts it)
TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && { pwd -W 2>/dev/null || pwd; })"
NETWORK=server_default
CONTAINERS="api engine maestro postgres redis"

die() { echo "ERROR: $*" >&2; exit 2; }

USERS="${1:-}"
[[ "$USERS" =~ ^[1-9][0-9]*$ ]] || die "usage: run.sh <users> [hold duration, e.g. 5m]"
HOLD="${2:-${HOLD:-5m}}"
[[ "$HOLD" =~ ^([0-9]+(h|m|s))+$ ]] || die "invalid duration '$HOLD' (examples: 90s, 5m)"
# ramp up: 30s up to 100 users, 1m up to 500, 2m beyond
if [ -z "${RAMP:-}" ]; then
  if [ "$USERS" -le 100 ]; then RAMP=30s; elif [ "$USERS" -le 500 ]; then RAMP=1m; else RAMP=2m; fi
fi
THINK="${THINK:-5}"

# ---- preflight: local docker, running stack, healthy game, no other test
[ -f "$TESTS/player-journey.js" ] || die "scenario not found: $TESTS/player-journey.js"
ENDPOINT="${DOCKER_HOST:-$(docker context inspect --format '{{.Endpoints.docker.Host}}')}"
case "$ENDPOINT" in
  npipe://*|unix://*) ;;
  *) die "docker points to a remote host ($ENDPOINT): this test only runs on the local stack" ;;
esac
for c in $CONTAINERS; do
  [ "$(docker inspect -f '{{.State.Running}}' "treasure-inc-$c" 2>/dev/null)" = true ] \
    || die "container treasure-inc-$c is not running (docker compose up -d in treasure-inc-conf/server)"
done
HEALTH=$(curl -s -m 10 http://localhost:8081/healthcheck) || die "the API does not answer on localhost:8081"
echo "$HEALTH" | grep -q '"dbStatus":"OK"' || die "database not OK: $HEALTH"
echo "$HEALTH" | grep -q '"status":"UP"' || die "engine not UP: $HEALTH"
echo "$HEALTH" | grep -q '"maintenance":{"status":"off"' || die "maintenance is on: $HEALTH"
[ -z "$(docker ps -q -f name='^k6-load$')" ] || die "a load test is already running (container k6-load)"

OUT_NAME="$(date +%Y%m%d-%H%M%S)-${USERS}users"
OUT="$TESTS/results/$OUT_NAME"
mkdir -p "$OUT" || die "cannot create $OUT"
START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "users=$USERS ramp=$RAMP hold=$HOLD think=${THINK}s start=$START"
echo "results: $OUT"
docker ps --format '{{.Names}} {{.Image}}' | grep treasure-inc | tee "$OUT/images.txt"

# ---- the error lines of the logs are collected during the test: the logs rotate, reading them only at the end
# would lose errors. Each call reads what was written since the previous one (no `logs -f`: on Windows such a
# background process outlives the script).
SINCE="$START"
collect_errors() {
  local now c
  now=$(date -u +%Y-%m-%dT%H:%M:%S.%NZ)
  for c in $CONTAINERS; do
    docker logs --since "$SINCE" --until "$now" "treasure-inc-$c" 2>&1 \
      | grep -v '^{"level":"info"' | grep -iE '\berror\b|exception|lock_timeout|no reply for' | cut -c1-400 >> "$OUT/errors-$c.log"
  done
  SINCE="$now"
}
# an interrupted script must not leave the test running
trap 'docker rm -f k6-load >/dev/null 2>&1' EXIT
trap 'exit 130' INT TERM

# ---- run k6, sampling the containers
docker run --rm --name k6-load --network "$NETWORK" -v "$TESTS:/scripts" \
  -e BASE_URL=http://treasure-inc-api:8081 -e USERS="$USERS" -e RAMP="$RAMP" -e HOLD="$HOLD" -e THINK="$THINK" \
  grafana/k6 run --quiet --summary-export "/scripts/results/$OUT_NAME/summary.json" /scripts/player-journey.js \
  > "$OUT/k6.log" 2>&1 &
K6=$!
while kill -0 "$K6" 2>/dev/null; do
  docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' >> "$OUT/stats.csv"
  collect_errors
  sleep 3
done
wait "$K6"; CODE=$?
sleep 2
collect_errors

# ---- report
echo; echo "=== k6 (exit $CODE: 0 = success, 99 = thresholds crossed, other = the test failed to run)"
# the warnings of failed requests can be thousands: the summary, then a sample of them
sed -n '/THRESHOLDS/,$p' "$OUT/k6.log"
grep -q THRESHOLDS "$OUT/k6.log" || tail -n 30 "$OUT/k6.log"
echo; echo "=== failed requests (warnings: $(grep -c 'level=warning' "$OUT/k6.log"), first 10)"
grep 'level=warning' "$OUT/k6.log" | head -10 | cut -c1-300
echo; echo "=== container peaks (cpu: 100% = one core, $(docker info --format '{{.NCPU}}') cores available)"
awk -F, '{c=$2+0; split($3,m," "); v=m[1]+0; if(m[1]~/GiB/)v*=1024; if(c>C[$1])C[$1]=c; if(v>M[$1])M[$1]=v}
  END{for(n in C)printf "%s cpu=%.1f%% mem=%.1fMiB\n",n,C[n],M[n]}' "$OUT/stats.csv" | sort
echo; echo "=== error lines in the container logs"
for c in $CONTAINERS; do
  echo "$c: $(wc -l < "$OUT/errors-$c.log")"
  head -3 "$OUT/errors-$c.log" | cut -c1-300
done
echo; echo "=== containers after the test (restarts included)"
for c in $CONTAINERS; do
  docker inspect -f '{{.Name}} {{.State.Status}} restarts={{.RestartCount}} oomKilled={{.State.OOMKilled}} started={{.State.StartedAt}}' "treasure-inc-$c"
done
curl -s -m 10 http://localhost:8081/healthcheck || echo "the API does not answer any more"
echo
exit "$CODE"
