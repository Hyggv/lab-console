import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const configured = process.env.LAB_API_ORIGIN?.trim();
const api = configured ? new URL(configured) : null;
if (api && (api.protocol !== "https:" || api.username || api.password || api.pathname !== "/" || api.search || api.hash)) {
  throw new Error("LAB_API_ORIGIN must be an HTTPS origin without a path, credentials, query, or fragment.");
}

const output = new URL("out/github-pages/", root);
const html = await readFile(new URL("web/index.html", root), "utf8");
const connectPolicy = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src ${api?.origin ?? "'none'"}; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'">`;
const mode = api ? `<meta name="lab-api-origin" content="${api.origin}">` : '<meta name="lab-preview" content="true">';
const page = html.replace(
  '<meta name="lab-api-origin" content="">',
  mode + "\n  " + connectPolicy,
);
await mkdir(output, { recursive: true });
await Promise.all([
  writeFile(new URL("index.html", output), page),
  writeFile(new URL(".nojekyll", output), ""),
  copyFile(new URL("web/app.js", root), new URL("app.js", output)),
  copyFile(new URL("web/environment.js", root), new URL("environment.js", output)),
  copyFile(new URL("web/styles.css", root), new URL("styles.css", output)),
]);
