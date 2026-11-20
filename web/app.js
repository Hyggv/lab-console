const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const paths = {
  flask:'<path d="M9 3h6m-5 0v6l-5.1 8.5A2.3 2.3 0 0 0 6.9 21h10.2a2.3 2.3 0 0 0 2-3.5L14 9V3M7.7 13.8h8.6"/><path d="M10 17h.01m4-1h.01"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  book:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M8 3v18m3-13h6m-6 4h6m-6 4h4"/>',
  activity:'<path d="M2 12h4l3-7 4.5 14 3-7H22"/>',
  box:'<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zm0 0 9 4.5 9-4.5M12 12v9M7.5 5.2l9 4.6"/>',
  settings:'<path d="M10 3h4l.4 2.1 2 .9 1.9-1 2.8 2.8-1 1.9.8 2.1 2.1.4v4l-2.1.4-.8 2.1 1 1.9-2.8 2.8-1.9-1-2 .9-.4 2.1h-4l-.4-2.1-2-.9-1.9 1-2.8-2.8 1-1.9-.8-2.1-2.1-.4v-4l2.1-.4.8-2.1-1-1.9 2.8-2.8 1.9 1 2-.9z" transform="translate(2 0) scale(.83)"/><circle cx="12" cy="11.7" r="3"/>',
  building:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M8 9h.01m4 0h.01m4 0h.01M8 12h.01m4 0h.01m4 0h.01"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 4h2m4 0h2m-8 3h2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  thermometer:'<path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0zM12 9v8"/><circle cx="12" cy="18" r="1"/>',
  droplet:'<path d="M12 3C10 6.1 5 10.8 5 15a7 7 0 0 0 14 0c0-4.2-5-8.9-7-12zM8.7 15.8a3.4 3.4 0 0 0 2.2 2.7"/>',
  "chevron-right":'<path d="m9 5 7 7-7 7"/>',
  "chevron-left":'<path d="m15 5-7 7 7 7"/>',
  wrench:'<path d="M14.7 6.8a4.9 4.9 0 0 1 6.1-3.1l-3 3 2.5 2.5 3-3a4.9 4.9 0 0 1-6.2 6.2l-8.7 8.7a2 2 0 0 1-2.8-2.8l8.7-8.7z" transform="translate(-1 0)"/>',
  user:'<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>',
  check:'<path d="m5 12 4 4L19 6"/>', x:'<path d="m6 6 12 12M18 6 6 18"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  share:'<path d="M12 15V3m-4 4 4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ""}</svg>`;
for (const element of $$("[data-icon]")) element.innerHTML = icon(element.dataset.icon);

const shanghai = { timeZone: "Asia/Shanghai" };
const dayFormat = new Intl.DateTimeFormat("sv-SE", { ...shanghai, year:"numeric", month:"2-digit", day:"2-digit" });
const readableDay = new Intl.DateTimeFormat("zh-CN", { ...shanghai, month:"long", day:"numeric", weekday:"long" });
const clock = new Intl.DateTimeFormat("zh-CN", { ...shanghai, hour:"2-digit", minute:"2-digit", hour12:false });
const clockSeconds = new Intl.DateTimeFormat("zh-CN", { ...shanghai, hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });
const dayMs = 86_400_000;
const hourMs = 3_600_000;
const today = () => dayFormat.format(new Date());
const byDay = (day) => new Date(day + "T12:00:00+08:00");
const esc = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[character]));
const startMinute = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
function endTime(time, duration) {
  const minutes = startMinute(time) + duration;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
function durationText(minutes) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return [h && h + " 小时", m && m + " 分钟"].filter(Boolean).join(" ");
}
function setHtml(selector, html) {
  const element = $(selector);
  if (element.dataset.rendered !== html) {
    element.innerHTML = html;
    element.dataset.rendered = html;
  }
}

const views = {
  overview: ["实验室总览", "实时掌握环境、实验排程和物资设备状态。"],
  experiments: ["实验日志", "按日期查看实验排程、占用时间和所需物资。"],
  environment: ["环境监测", "查看最新温湿度读数与近 24 小时变化。"],
  resources: ["物资与设备", "跟进需要补货的药品和需要维修的仪器。"],
  settings: ["模拟传感器", "查看模拟温湿度的数据来源和刷新时间。"],
};
const states = { planned:"已安排", active:"进行中", done:"已完成", cancelled:"已取消" };
const taskLabels = { stock:"待补货", repair:"待维修" };
const state = { day:today(), view:"overview", hours:6, task:"all", data:null, error:false, sequence:0 };
function keyFromHash() {
  const key = new URLSearchParams(location.hash.split("?", 2)[1]).get("edit") ?? "";
  return /^[A-Za-z0-9_-]{43}$/.test(key) ? key : "";
}
let editKey = keyFromHash();
function viewHash(view) {
  return "#" + view + (editKey ? "?edit=" + editKey : "");
}
const samples = [
  { id:"demo-a", title:"标准溶液配制", owner:"示例 · 林同学", start:"09:00", duration:90, state:"done", equipment:"电子分析天平、移液器", chemicals:"氯化钠、去离子水", notes:"使用后清理称量区。" },
  { id:"demo-b", title:"水样吸光度测定", owner:"示例 · 陈同学", start:"13:30", duration:120, state:"active", equipment:"紫外可见分光光度计", chemicals:"去离子水、标准溶液", notes:"14:00–15:00 使用分光光度计。" },
  { id:"demo-c", title:"样品预处理", owner:"示例 · 许同学", start:"16:00", duration:60, state:"planned", equipment:"台式离心机、移液器", chemicals:"去离子水", notes:"" },
];
const sampleTasks = [
  { id:"demo-r1", kind:"stock", name:"无水乙醇", detail:"余量不足，需补充一瓶。", reporter:"示例 · 林同学" },
  { id:"demo-r2", kind:"repair", name:"紫外可见分光光度计", detail:"2 号仪器开机自检异常。", reporter:"示例 · 陈同学" },
  { id:"demo-r3", kind:"stock", name:"去离子水", detail:"备料区存量偏低。", reporter:"示例 · 许同学" },
];
const demoSchedule = () => state.data && !state.data.used.experiments && state.day === today();
const demoTasks = () => state.data && !state.data.used.reports;
const schedule = () => demoSchedule() ? samples.map((record) => ({ ...record, day:state.day })) : state.data?.experiments ?? [];
const reports = () => demoTasks() ? sampleTasks : state.data?.reports ?? [];
const apiOrigin = ($('meta[name="lab-api-origin"]')?.content || location.origin);
const pagesPreview = Boolean($('meta[name="lab-preview"]'));

async function request(path, options = {}) {
  const response = await fetch(new URL(path, apiOrigin), {
    ...options, redirect:"error",
    headers: { Accept:"application/json", ...(options.body ? { "Content-Type":"application/json" } : {}),
      ...(editKey ? { Authorization:"Bearer " + editKey } : {}) },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || "暂时无法连接数据服务，请稍后重试。");
  return data;
}
async function load() {
  const sequence = ++state.sequence;
  try {
    const data = pagesPreview
      ? { ...simulatedEnvironment(Date.now()), experiments:[], reports:[], used:{ experiments:false, reports:false }, canWrite:false }
      : await request("/api/dashboard?day=" + encodeURIComponent(state.day), { cache:"no-store" });
    if (sequence !== state.sequence) return;
    state.data = data;
    state.error = false;
    $("#last-refresh").textContent = "数据更新于 " + clockSeconds.format(new Date()) + " · 北京时间";
  } catch {
    if (sequence !== state.sequence) return;
    state.error = true;
  }
  render();
}
function navigate() {
  const previousKey = editKey;
  editKey = keyFromHash();
  if (editKey !== previousKey) {
    if (state.data) state.data = { ...state.data, canWrite:false };
    if ($("#dialog").open) close();
    void load();
  }
  const section = location.hash.slice(1).split("?", 1)[0];
  state.view = Object.hasOwn(views, section) ? section : "overview";
  const [title, description] = views[state.view];
  $("#crumb-view").textContent = title;
  $("#page-title").textContent = title;
  $("#page-description").textContent = description;
  for (const link of $$("[data-view]")) {
    link.hash = viewHash(link.dataset.view);
    const active = link.dataset.view === state.view;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
  }
  for (const link of $$("[data-destination]")) link.hash = viewHash(link.dataset.destination);
  $("#environment").hidden = !["overview","environment"].includes(state.view);
  $("#experiments").hidden = !["overview","experiments"].includes(state.view);
  $("#resources").hidden = !["overview","resources"].includes(state.view);
  $("#work-grid").hidden = !["overview","experiments","resources"].includes(state.view);
  $("#work-grid").classList.toggle("single", state.view !== "overview");
  $("#settings").hidden = state.view !== "settings";
  for (const link of $$("[data-overview-link]")) link.hidden = state.view !== "overview";
  $("#sidebar").classList.remove("open");
  $("#menu").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
  render();
}
function selectDay(day) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(day) || day === state.day) return;
  state.day = day;
  state.data = state.data && { ...state.data, experiments:[], loadingDay:true };
  render();
  void load();
}
function render() {
  const banner = $("#banner");
  const bannerText = pagesPreview ? "网站预览 · 温湿度和日志均为示例。连接数据服务后即可登记和编辑共享日志。"
    : state.error ? "暂时无法同步，页面保留上次成功读取的数据。" : "";
  banner.hidden = !bannerText;
  banner.textContent = bannerText;
  const day = today();
  $("#top-date").textContent = day.replaceAll("-", ".");
  $("#top-date").dateTime = day;
  $("#read-only").hidden = !state.data || state.data.canWrite;
  for (const control of $$("[data-write]")) control.hidden = !state.data?.canWrite;
  renderEnvironment();
  renderSchedule();
  renderTasks();
}

function seriesPath(values, x, y) {
  return values.map((value, index) => (index ? "L" : "M") + x(value, index).toFixed(1) + " " + y(value).toFixed(1)).join(" ");
}
function spark(selector, series, key, color, id) {
  if (series.length < 2) { setHtml(selector, ""); return; }
  const vals = series.map((v) => v[key]);
  const low = Math.min(...vals), spread = Math.max(Math.max(...vals) - low, .4);
  const d = seriesPath(vals, (_, i) => i * 200 / (vals.length - 1), (v) => 40 - (v - low) / spread * 29);
  setHtml(selector, `<svg viewBox="0 0 200 50" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="${color}" stop-opacity=".19"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${d} L200 50 L0 50 Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`);
}
function trendChart(series, end) {
  if (!series.length) {
    setHtml("#chart", '<div class="chart-empty">等待采集趋势数据</div>');
    return;
  }
  const width = Math.max(250, $("#chart").clientWidth || 424);
  const left = 35, right = width - 36, bottom = 110, top = 12;
  const start = end - state.hours * hourMs;
  const x = (v) => left + (v - start) / (end - start) * (right - left);
  const bounds = (key, minSpread) => {
    const values = series.map((item) => item[key]);
    const floor = Math.floor(Math.min(...values) - minSpread / 4);
    const ceiling = Math.ceil(Math.max(...values) + minSpread / 4);
    return [floor, Math.max(floor + minSpread, ceiling)];
  };
  const [tMin,tMax] = bounds("temperature", 3), [hMin,hMax] = bounds("humidity", 9);
  const y = (v, min, max) => bottom - (v - min) / (max - min) * (bottom - top);
  const grid = Array.from({ length:4 }, (_, i) => {
    const Y = top + i * (bottom - top) / 3;
    const temp = tMax - i * (tMax - tMin) / 3;
    const humid = hMax - i * (hMax - hMin) / 3;
    return `<path d="M${left} ${Y}H${right}" stroke="#ececf4" stroke-dasharray="3 4"/><text x="${left-5}" y="${Y+4}" text-anchor="end">${Math.round(temp)}°</text><text x="${right+5}" y="${Y+4}">${Math.round(humid)}%</text>`;
  }).join("");
  const labels = Array.from({ length:5 }, (_, i) => {
    const time = start + i * (end - start) / 4;
    return `<text x="${x(time)}" y="133" text-anchor="middle">${clock.format(time)}</text>`;
  }).join("");
  const draw = (key, min, max, color) => {
    const d = seriesPath(series, (v) => x(v.measured_at), (v) => y(v[key], min, max));
    const last = series.at(-1);
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x(last.measured_at)}" cy="${y(last[key], min, max)}" r="2.6" fill="${color}"/>`;
  };
  setHtml("#chart", `<svg viewBox="0 0 ${width} 139" aria-hidden="true">${grid}${labels}${draw("temperature", tMin, tMax, "#7457e8")}${draw("humidity", hMin, hMax, "#278bc2")}</svg>`);
}
function renderEnvironment() {
  const { latest, trend = [] } = state.data ?? {};
  const end = latest?.measured_at ?? Date.now();
  const recent = trend.filter((v) => v.measured_at >= end - state.hours * hourMs);
  const status = latest ? (state.error ? "模拟数据 · 同步暂停" : "模拟数据") : state.error ? "同步失败" : "读取中";
  const badge = $("#sensor-badge");
  badge.classList.toggle("stale", state.error);
  badge.lastElementChild.textContent = status;
  $("#settings-update").textContent = latest ? clockSeconds.format(latest.measured_at) : "—";
  for (const [key, prefix, color] of [["temperature","temp","#7457e8"],["humidity","humidity","#278bc2"]]) {
    $("#" + key).textContent = latest ? latest[key].toFixed(1) : "—";
    const series = trend.filter((v) => v.measured_at >= end - 6 * hourMs);
    spark("#" + prefix + "-spark", series, key, color, prefix + "-gradient");
    $("#" + prefix + "-caption").textContent = latest ? "模拟 · " + clockSeconds.format(latest.measured_at) : "等待读数";
    const numbers = series.map((v) => v[key]);
    $("#" + prefix + "-range").textContent = numbers.length > 1
      ? `${Math.min(...numbers).toFixed(1)}–${Math.max(...numbers).toFixed(1)} ${key === "temperature" ? "°C" : "%"}` : "";
  }
  for (const button of $$("[data-hours]")) button.setAttribute("aria-pressed", String(+button.dataset.hours === state.hours));
  if (!$("#environment").hidden) trendChart(recent, end);
}

function renderSchedule() {
  const isToday = state.day === today();
  const rows = schedule();
  $("#experiment-title").lastChild.textContent = state.view === "overview" && isToday ? "今日实验安排" : "实验安排";
  $("#day-label").textContent = readableDay.format(byDay(state.day));
  $("[data-action=today]").hidden = isToday;
  $("#date-input").value = state.day;
  const loading = !state.data || state.data.loadingDay;
  $("#schedule-count").textContent = loading ? (state.error ? "同步失败" : "正在读取记录")
    : `${rows.length} 条实验记录${demoSchedule() ? " · 示例" : ""}`;
  if (loading || !rows.length) {
    setHtml("#schedules", loading
      ? `<div class="loading">${state.error ? "暂时无法读取实验记录。" : "正在加载实验安排…"}</div>`
      : '<div class="empty"><strong>这一天还没有实验安排</strong>有计划时可登记实验时段。</div>');
    return;
  }
  setHtml("#schedules", rows.map((row) => `<button class="schedule-row" data-experiment-id="${esc(row.id)}">
    <span class="schedule-time"><strong>${esc(row.start)}</strong><small>至 ${endTime(row.start, row.duration)}</small></span>
    <span class="schedule-name"><strong>${esc(row.title)}</strong><span class="schedule-meta">${icon("user")}<span>${esc(row.owner)} · ${durationText(row.duration)}${row.equipment ? " · " + esc(row.equipment) : ""}</span></span></span>
    <span class="tag ${esc(row.state)}">${states[row.state]}</span></button>`).join(""));
}
function renderTasks() {
  const all = reports();
  const open = all.filter((r) => !r.resolved_at);
  const count = open.length;
  $("#all-count").textContent = count;
  $("#stock-count").textContent = open.filter((r) => r.kind === "stock").length;
  $("#repair-count").textContent = open.filter((r) => r.kind === "repair").length;
  $("#nav-count").textContent = count;
  $("#nav-count").hidden = !count;
  for (const button of $$("[data-task]")) button.setAttribute("aria-pressed", String(button.dataset.task === state.task));
  const show = state.task === "done" ? all.filter((r) => r.resolved_at) : open.filter((r) => state.task === "all" || state.task === r.kind);
  if (!show.length) {
    setHtml("#tasks", `<div class="empty"><strong>${!state.data ? (state.error ? "暂时无法读取事项" : "正在加载事项…") : state.task === "done" ? "暂无已处理事项" : "暂无待处理事项"}</strong></div>`);
    return;
  }
  setHtml("#tasks", show.map((task) => {
    const appearance = task.resolved_at ? "done" : task.kind;
    const label = task.resolved_at ? "已处理" : taskLabels[task.kind];
    const symbol = task.resolved_at ? "check" : task.kind === "stock" ? "box" : "wrench";
    return `<div class="task-row"><span class="task-icon ${appearance}" data-icon>${icon(symbol)}</span>
      <div class="task-text"><strong>${esc(task.name)}</strong>${task.detail ? "<p>" + esc(task.detail) + "</p>" : ""}<div class="task-sub">${esc(task.reporter)}${task.created_at ? " · " + readableDay.format(task.created_at) : ""}</div></div>
      <div class="task-right"><span class="tag ${appearance}">${label}</span>
      ${!task.resolved_at && !task.id.startsWith("demo-") && state.data.canWrite ? `<button class="text-link" data-resolve="${esc(task.id)}" aria-label="处理${esc(task.name)}">标为已处理</button>` : ""}</div></div>`;
  }).join(""));
}

let toastTimer;
function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 3700);
}
function openDialog(title, content) {
  $("#dialog-title").textContent = title;
  $("#dialog-body").innerHTML = content;
  if (!$("#dialog").open) $("#dialog").showModal();
  $("#dialog-body").querySelector("input,select,button")?.focus();
}
const close = () => $("#dialog").close();
const actions = (label) => `<div class="dialog-actions"><button class="btn secondary" type="button" data-action="close">取消</button><button class="btn primary" type="submit">${label}</button></div>`;
const field = (label, input, full = false) => `<label class="field${full ? " full" : ""}"><span>${label}</span>${input}</label>`;
const input = (name, value, extra) => `<input name="${name}" value="${esc(value ?? "")}" ${extra}>`;
const area = (name, value, placeholder, max = 300) => `<textarea name="${name}" maxlength="${max}" placeholder="${esc(placeholder)}">${esc(value ?? "")}</textarea>`;
async function shareLink() {
  if (!state.data?.canWrite) return;
  const url = new URL("./", location.href);
  url.hash = viewHash("overview");
  if (navigator.share) {
    try { await navigator.share({ title:"实验室协作台", url:url.href }); return; }
    catch (error) { if (error.name === "AbortError") return; }
  }
  try {
    await navigator.clipboard.writeText(url.href);
    toast("协作链接已复制，可直接发给同学");
  } catch {
    openDialog("分享协作链接", field("可直接转发的链接", input("share-url", url.href, "readonly")));
    $("#dialog-body input").select();
  }
}
function experimentForm(row) {
  if (!state.data?.canWrite) return;
  const selectedState = row?.state ?? "planned";
  openDialog(row ? "编辑实验" : "登记实验", `<form id="experiment-form" data-id="${esc(row?.id ?? "")}" data-revision="${row?.revision ?? ""}">
    <div class="form-grid">
      ${field("实验名称", input("title", row?.title, 'required maxlength="80" placeholder="例如：水样吸光度测定"'))}
      ${field("登记人", input("owner", row?.owner, 'required maxlength="30" placeholder="姓名或组名"'))}
      ${field("实验日期", input("day", row?.day ?? state.day, 'type="date" required'))}
      ${field("开始时间", input("start", row?.start ?? "09:00", 'type="time" step="60" required'))}
      ${field("预计时长（分钟）", input("duration", row?.duration ?? 60, 'type="number" min="5" max="1440" step="1" required'))}
      ${field("状态", '<select name="state">' + Object.entries(states).map(([key,label]) => `<option value="${key}"${key === selectedState ? " selected" : ""}>${label}</option>`).join("") + "</select>")}
      ${field("所需药品", area("chemicals", row?.chemicals, "药品名称，可注明数量"))}
      ${field("所需仪器", area("equipment", row?.equipment, "以顿号、逗号或换行分隔"))}
      <p class="form-note" id="conflict" hidden role="status"></p>
      ${field("登记补货", area("stock", "", "每行一项，例如：去离子水：补充 2 桶", 500))}
      ${field("登记报修", area("repair", "", "每行一项，例如：离心机：无法启动", 500))}
      ${field("实验备注", area("notes", row?.notes, "补充说明、现场情况或实验进度", 1000), true)}
      <p class="form-error" hidden role="alert"></p>
    </div>${actions(row ? "保存更新" : "保存实验")}</form>`);
  const form = $("#experiment-form");
  let pending;
  form.addEventListener("input", () => {
    conflictSequence++;
    clearTimeout(pending);
    pending = setTimeout(() => { if (form.isConnected) void conflicts(form); }, 250);
  });
  conflicts(form);
}
const equipmentNames = (raw) => raw.split(/[、,，;；\r\n]+/).map((piece) => piece.trim().toLowerCase()).filter(Boolean);
let conflictSequence = 0;
async function conflicts(form) {
  const note = form.querySelector("#conflict");
  const sequence = ++conflictSequence;
  const input = Object.fromEntries(new FormData(form));
  const names = equipmentNames(input.equipment);
  if (!input.day || !input.start || !names.length || !Number(input.duration) || input.state === "cancelled") { note.hidden = true; return; }
  const start = startMinute(input.start), end = start + Number(input.duration);
  try {
    const data = await request("/api/dashboard?day=" + encodeURIComponent(input.day));
    if (sequence !== conflictSequence || !form.isConnected) return;
    const rows = data.experiments.filter((row) => row.id !== form.dataset.id && row.state !== "cancelled"
      && start < startMinute(row.start) + row.duration && end > startMinute(row.start)
      && equipmentNames(row.equipment).some((name) => names.includes(name)));
    note.textContent = "仪器占用提醒 · 与 " + rows.map((row) => row.title + "（" + row.start + "–" + endTime(row.start,row.duration) + "）").join("、") + " 的时段重叠。";
    note.hidden = !rows.length;
  } catch { if (sequence === conflictSequence) note.hidden = true; }
}
function detail(row) {
  const values = [
    ["登记人",row.owner],["状态",states[row.state]],["日期",readableDay.format(byDay(row.day))],
    ["时段",row.start + "–" + endTime(row.start,row.duration) + " · " + durationText(row.duration)],
    ["所需药品",row.chemicals],["所需仪器",row.equipment],["备注",row.notes],
  ];
  const related = reports().filter((r) => r.experiment_id === row.id);
  if (related.length) values.push(["补货与报修",related.map((r) => r.name + " · " + (r.resolved_at ? "已处理" : taskLabels[r.kind])).join("\n")]);
  openDialog(row.title, `<dl class="detail-grid">${values.map(([label,value]) => `<div><dt>${label}</dt><dd>${esc(value || "—")}</dd></div>`).join("")}</dl>
    <div class="dialog-actions"><button class="btn secondary" data-action="close">关闭</button>
    ${state.data?.canWrite && !row.id.startsWith("demo-") ? `<button class="btn primary" data-edit="${esc(row.id)}">编辑实验</button>` : ""}</div>`);
}
function reportForm() {
  if (!state.data?.canWrite) return;
  const defaultRepair = state.task === "repair" ? " selected" : "";
  openDialog("登记事项", `<form id="report-form"><div class="form-grid">
    ${field("事项类型", '<select name="kind"><option value="stock">药品补货</option><option value="repair"' + defaultRepair + '>仪器报修</option></select>')}
    ${field("登记人", input("reporter", "", 'required maxlength="30" placeholder="姓名或组名"'))}
    ${field("药品或仪器名称", input("name", "", 'required maxlength="80"'), true)}
    ${field("事项说明", area("detail", "", "填写余量、所需数量或故障现象", 400), true)}
    <p class="form-error" hidden role="alert"></p></div>${actions("保存事项")}</form>`);
}
let busy = false;
document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!["experiment-form","report-form"].includes(form.id)) return;
  event.preventDefault();
  if (busy) return;
  busy = true;
  const data = Object.fromEntries(new FormData(form));
  const edit = form.dataset.id;
  const experiment = form.id === "experiment-form";
  const button = form.querySelector("button[type=submit]");
  const error = form.querySelector(".form-error");
  button.disabled = true;
  error.hidden = true;
  try {
    if (experiment) {
      data.duration = Number(data.duration);
      if (edit) data.revision = Number(form.dataset.revision);
      await request("/api/experiments" + (edit ? "/" + edit : ""), { method:edit ? "PUT" : "POST", body:JSON.stringify(data) });
      location.hash = viewHash("experiments");
      selectDay(data.day);
    } else {
      await request("/api/reports", { method:"POST", body:JSON.stringify(data) });
      state.task = data.kind;
    }
    close();
    toast(experiment ? "实验日志已保存" : "事项已登记");
    await load();
  } catch (failure) {
    error.textContent = failure.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
    busy = false;
  }
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.hours) { state.hours = Number(button.dataset.hours); renderEnvironment(); return; }
  if (button.dataset.task) { state.task = button.dataset.task; renderTasks(); return; }
  if (button.dataset.experimentId) {
    const row = schedule().find((value) => value.id === button.dataset.experimentId);
    if (row) detail(row);
    return;
  }
  if (button.dataset.edit) {
    const row = schedule().find((value) => value.id === button.dataset.edit);
    if (state.data?.canWrite && row && !row.id.startsWith("demo-")) experimentForm(row);
    return;
  }
  if (button.dataset.resolve) {
    button.disabled = true;
    try {
      await request("/api/reports/" + button.dataset.resolve + "/resolve", { method:"POST" });
      toast("事项已处理");
      await load();
    } catch (error) { toast(error.message); }
    finally { button.disabled = false; }
    return;
  }
  const action = button.dataset.action;
  if (action === "share") await shareLink();
  if (action === "experiment") experimentForm();
  if (action === "report") reportForm();
  if (action === "close") close();
  if (action === "today") selectDay(today());
  if (action === "pick-date") {
    const picker = $("#date-input");
    if (typeof picker.showPicker === "function") picker.showPicker();
    else { picker.focus(); picker.click(); }
  }
  if (action === "previous" || action === "next") {
    selectDay(dayFormat.format(+byDay(state.day) + (action === "next" ? dayMs : -dayMs)));
  }
});
$("#date-input").addEventListener("change", (event) => selectDay(event.target.value));
$("#menu").addEventListener("click", () => {
  const open = $("#sidebar").classList.toggle("open");
  $("#menu").setAttribute("aria-expanded", String(open));
});
window.addEventListener("hashchange", navigate);
new ResizeObserver(() => { if (state.data && !$("#environment").hidden) renderEnvironment(); }).observe($("#chart"));
navigate();
void load();
setInterval(() => { if (!document.hidden) void load(); }, 10_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) void load(); });

