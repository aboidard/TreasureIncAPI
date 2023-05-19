import * as pg from "pg"
const { Pool } = pg

const pool = new Pool()

export default pool;