import { createServer } from "node:http";
import { Readable } from "node:stream";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

await import("./build.mjs");
const { default: worker } = await import("../dist/server/index.js");
const local = new URL("../.sites-runtime/", import.meta.url);
mkdirSync(local, { recursive: true });
const db = new DatabaseSync(fileURLToPath(new URL("lab.sqlite", local)));
if (db.prepare("PRAGMA user_version").get().user_version === 0) {
  db.exec("BEGIN");
  try {
    db.exec(readFileSync(new URL("../drizzle/0000_lab.sql", import.meta.url), "utf8"));
    db.exec("PRAGMA user_version=1; COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}
const DB = {
  prepare(sql) {
    const statement = db.prepare(sql);
    const run = (args) => statement.columns().length
      ? { results: statement.all(...args) }
      : { meta: { changes: statement.run(...args).changes } };
    return { run: () => run([]), execute: () => run([]),
      bind: (...args) => ({ run: () => run(args), execute: () => run(args) }) };
  },
  batch(statements) {
    db.exec("BEGIN");
    try {
      const results = statements.map((statement) => statement.execute());
      db.exec("COMMIT");
      return results;
    } catch (error) { db.exec("ROLLBACK"); throw error; }
  },
};
const port = Number(process.env.PORT || 4173);
const host = process.env.LAB_HOST || "127.0.0.1";
const server = createServer(async (incoming, outgoing) => {
  try {
    const headers = new Headers(incoming.headers);
    const hasBody = !["GET","HEAD"].includes(incoming.method);
    const request = new Request("http://" + incoming.headers.host + incoming.url, {
      method: incoming.method, headers,
      ...(hasBody ? { body: Readable.toWeb(incoming), duplex: "half" } : {}),
    });
    const response = await worker.fetch(request, {
      DB, LAB_EDIT_KEY: process.env.LAB_EDIT_KEY, LAB_WEB_ORIGIN: process.env.LAB_WEB_ORIGIN,
    });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
    else outgoing.end();
  } catch (error) { console.error(error); outgoing.writeHead(500).end(); }
});
server.listen(port, host, () => console.log("Local: http://" + host + ":" + port));

