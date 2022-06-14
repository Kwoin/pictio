import pg from "pg";
const { Pool } = pg;

const pool = new Pool();

export async function query(text, params) {
  return pool.query(text, params);
}

export async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  client.query = (...args) => {
    return query.apply(client, args)
        .then(res => {
          console.log(`query: ${args[0]}, ${args[1]}`);
          return res;
        })
  }
  return client;
}

export async function transaction(...queries) {

  const client = await getClient();
  try {
    await client.query("BEGIN");

    let res = null;
    for (let i = 0; i < queries.length; i++) {
      res = await queries[i](client, res);
      console.log("transaction", i)
    }

    await client.query("COMMIT");
  } catch(e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export function insert(table, entries) {
  const columns = Object.keys(entries).join();
  const params = Object.entries(entries)
      .map((_, i) => `$${i + 1}`)
      .join();
  return (client) => {
    return client.query(
        `INSERT INTO ${table}(${columns}) VALUES (${params}) RETURNING *;`,
        Object.values(entries)
    )
  }

}
