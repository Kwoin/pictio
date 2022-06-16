import pg from "pg";

const {Pool} = pg;

const pool = new Pool();

export async function query(text, params) {
  return pool.query(text, params);
}

export async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  client.query = (...args) => {
    return query.apply(client, args)
        .then(res => {
          console.log(`query: ${args[0]}`);
          return res;
        })
        .catch(e => {
          console.log(`query: ${args[0]}`);
        })
  };
  client.release = (...args) => {
    client.query = query;
    client.release = release;
    return release.apply(client, args);
  }
  return client;
}

export async function transaction(...queries) {

  const client = await getClient();
  let res = null;
  try {
    await client.query("BEGIN;");

    for (let i = 0; i < queries.length; i++) {
      res = await queries[i](client, res);
      console.log("resultat intermédiaire", res);
    }

    await client.query("COMMIT;");
  } catch (e) {
    await client.query("ROLLBACK;");
    throw e;
  } finally {
    client.release();
  }
  return res;

}

export async function insert(table, entries, client) {
  const columns = Object.keys(entries).map(column => `"${column}"`).join();
  const params = Object.entries(entries)
      .map((_, i) => `$${i + 1}`)
      .join();
  return client.query(
      `INSERT INTO ${table}(${columns})
       VALUES (${params}) RETURNING *;`,
      Object.values(entries)
  )
}
