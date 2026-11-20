const dayMs = 86_400_000;
const textTypes = { "/": "text/html", "/styles.css": "text/css", "/app.js": "text/javascript", "/environment.js": "text/javascript" };
const tz = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" });

class InputError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const json = (body, status = 200) => Response.json(body, {
  status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex" },
});
const replyError = (message, status) => json({ error: message }, status);

function checkDay(day) {
  if (typeof day !== "string" || !/^20\d{2}-\d\d-\d\d$/.test(day)) throw new InputError("请选择有效日期。");
  const parsed = new Date(day);
  if (!Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== day) throw new InputError("请选择有效日期。");
  return day;
}
function string(value, limit, label, required = false) {
  if (value === undefined && !required) return "";
  if (typeof value !== "string" || value.trim().length > limit || (required && !value.trim())) {
    throw new InputError(label + "请填写 1 至 " + limit + " 个字符。");
  }
  return value.trim();
}
async function bodyOf(request) {
  const raw = await request.text();
  if (raw.length > 16_000) throw new InputError("提交内容过长。", 413);
  const data = JSON.parse(raw);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new InputError("请求内容无效。");
  return data;
}

function canEdit(request, env) {
  const secret = env.LAB_EDIT_KEY;
  const supplied = request.headers.get("Authorization") ?? "";
  if (!secret || supplied.length !== secret.length + 7 || !supplied.startsWith("Bearer ")) return false;
  let difference = 0;
  for (let i = 0; i < secret.length; i++) difference |= supplied.charCodeAt(i + 7) ^ secret.charCodeAt(i);
  return difference === 0;
}

async function dashboard(db, day, canWrite) {
  const now = Date.now();
  const queries = [
    db.prepare("SELECT id,title,owner,day,start,duration,state,chemicals,equipment,notes,revision FROM experiments WHERE day=? ORDER BY start,id").bind(day),
    db.prepare("SELECT id,kind,name,detail,reporter,created_at,resolved_at,experiment_id FROM reports WHERE resolved_at IS NULL OR resolved_at >= ? ORDER BY (resolved_at IS NOT NULL), created_at DESC").bind(now - 30 * dayMs),
    db.prepare("SELECT EXISTS(SELECT 1 FROM experiments) AS experiments, EXISTS(SELECT 1 FROM reports) AS reports"),
  ];
  const [experiments, reports, used] = await db.batch(queries);
  return json({
    experiments: experiments.results, reports: reports.results, canWrite,
    ...simulatedEnvironment(now), used: used.results[0],
  });
}

async function saveExperiment(request, db, id) {
  const input = await bodyOf(request);
  const title = string(input.title, 80, "实验名称", true);
  const owner = string(input.owner, 30, "登记人", true);
  const day = checkDay(input.day);
  const start = input.start;
  const duration = input.duration;
  if (typeof start !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)) throw new InputError("请输入有效的开始时间。");
  const [hours, minutes] = start.split(":").map(Number);
  if (!Number.isInteger(duration) || duration < 5 || duration > 1440 || hours * 60 + minutes + duration > 1440) {
    throw new InputError("预计时长至少 5 分钟，结束时间须在当天 24:00 之前。");
  }
  const state = input.state;
  if (!["planned","active","done","cancelled"].includes(state)) throw new InputError("请选择实验状态。");
  const values = [title, owner, day, start, duration, state,
    string(input.chemicals, 300, "药品"), string(input.equipment, 300, "仪器"), string(input.notes, 1000, "备注")];
  const reportEntries = [
    ["stock", string(input.stock, 500, "补货事项")],
    ["repair", string(input.repair, 500, "报修事项")],
  ].flatMap(([kind, raw]) => raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const separator = line.search(/[：:]/);
    return { kind, name: string(separator < 0 ? line : line.slice(0, separator), 80, "事项名称", true),
      detail: string(separator < 0 ? "" : line.slice(separator + 1), 400, "事项说明") };
  }));
  if (reportEntries.length > 20) throw new InputError("一次最多登记 20 项补货或报修。");
  const now = Date.now();
  const mutation = crypto.randomUUID();
  let revision = 1;
  let write;
  if (id) {
    if (!Number.isSafeInteger(input.revision) || input.revision < 1) throw new InputError("请重新打开这条记录。");
    revision = input.revision + 1;
    write = db.prepare(`UPDATE experiments SET title=?,owner=?,day=?,start=?,duration=?,state=?,chemicals=?,equipment=?,notes=?,revision=?,mutation=?
      WHERE id=? AND revision=?`).bind(...values, revision, mutation, id, input.revision);
  } else {
    id = crypto.randomUUID();
    write = db.prepare(`INSERT INTO experiments(title,owner,day,start,duration,state,chemicals,equipment,notes,id,author,mutation,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(...values, id, "shared-link", mutation, now);
  }
  // The mutation ID guards linked inserts if another edit won the revision check.
  const linked = reportEntries.map(({ kind, name, detail }) => db.prepare(`
    INSERT INTO reports(id,kind,name,detail,reporter,created_at,experiment_id,experiment_revision)
    SELECT ?,?,?,?,?,?,id,revision FROM experiments WHERE id=? AND mutation=?`
  ).bind(crypto.randomUUID(), kind, name, detail, owner, now, id, mutation));
  const [written] = await db.batch([write, ...linked]);
  if (!written.meta.changes) throw new InputError("记录已被更新，请重新打开后再编辑。", 409);
  return json({ id, day, revision }, input.revision ? 200 : 201);
}

async function saveReport(request, db) {
  const input = await bodyOf(request);
  const kind = input.kind;
  if (kind !== "stock" && kind !== "repair") throw new InputError("请选择事项类型。");
  await db.prepare("INSERT INTO reports(id,kind,name,detail,reporter,created_at) VALUES (?,?,?,?,?,?)")
    .bind(crypto.randomUUID(), kind, string(input.name, 80, "事项名称", true),
      string(input.detail, 400, "事项说明"), string(input.reporter, 30, "登记人", true), Date.now()).run();
  return json({ ok: true }, 201);
}

async function handleApi(request, env, url) {
  const path = url.pathname;
  const method = request.method;
  try {
    if (method === "GET" && path === "/api/dashboard") {
      return await dashboard(env.DB, checkDay(url.searchParams.get("day") ?? tz.format(new Date())), canEdit(request, env));
    }
    if (method !== "POST" && method !== "PUT") return replyError("未找到此页面。", 404);
    if (!canEdit(request, env)) return replyError("请打开有编辑权限的协作链接。", 403);
    if (method === "POST" && path === "/api/experiments") return await saveExperiment(request, env.DB);
    const edit = path.match(/^\/api\/experiments\/([\da-f-]{36})$/);
    if (method === "PUT" && edit) return await saveExperiment(request, env.DB, edit[1]);
    if (method === "POST" && path === "/api/reports") return await saveReport(request, env.DB);
    const resolve = path.match(/^\/api\/reports\/([\da-f-]{36})\/resolve$/);
    if (method === "POST" && resolve) {
      const result = await env.DB.prepare("UPDATE reports SET resolved_at=COALESCE(resolved_at,?) WHERE id=?")
        .bind(Date.now(), resolve[1]).run();
      return result.meta.changes ? json({ ok: true }) : replyError("找不到该事项。", 404);
    }
    return replyError("未找到此页面。", 404);
  } catch (error) {
    if (error instanceof InputError) return replyError(error.message, error.status);
    if (error instanceof SyntaxError) return replyError("请求内容应为有效的 JSON。", 400);
    console.error(error);
    return replyError("暂时无法连接数据服务，请稍后重试。", 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "GET" && Object.hasOwn(textTypes, path)) {
      return new Response(assets[path], { headers: {
        "Content-Type": textTypes[path] + "; charset=utf-8", "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'",
      } });
    }
    if (!path.startsWith("/api/")) return replyError("未找到此页面。", 404);
    const origin = request.headers.get("Origin");
    const crossOrigin = Boolean(origin && origin !== url.origin);
    if (crossOrigin && origin !== env.LAB_WEB_ORIGIN) return replyError("请从协作台页面访问。", 403);
    if (request.method === "OPTIONS") {
      if (!crossOrigin) return new Response(null, { status:204 });
      return new Response(null, { status:204, headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "600",
        "Vary": "Origin",
      } });
    }
    const response = await handleApi(request, env, url);
    if (crossOrigin) response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.append("Vary", "Origin");
    return response;
  },
};

