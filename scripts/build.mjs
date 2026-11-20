import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const locations = ["index.html", "styles.css", "app.js", "environment.js"];
const assets = Object.fromEntries(await Promise.all(locations.map(async (name) => [
  name === "index.html" ? "/" : "/" + name,
  await readFile(new URL("web/" + name, root), "utf8"),
])));
await mkdir(new URL("dist/server/", root), { recursive: true });
const worker = await readFile(new URL("worker/index.js", root), "utf8");
await writeFile(new URL("dist/server/index.js", root),
  "const assets = " + JSON.stringify(assets) + ";\n" + assets["/environment.js"] + "\n" + worker);

const manifest = new URL(".openai/hosting.json", root);
const hosting = await readFile(manifest).catch((error) => {
  if (error.code === "ENOENT") return null;
  throw error;
});
if (hosting) {
  await mkdir(new URL("dist/.openai/", root), { recursive: true });
  await writeFile(new URL("dist/.openai/hosting.json", root), hosting);
}

