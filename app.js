const STORAGE_KEY = "paracosm_state_v1";

const defaultState = {
  settings: { lowStim: false, blurTriggers: true },
  system: { name: "", pronouns: "", roles: "", color: "#6c8cff", notes: "" },
  alters: [],
  frontLog: [],
  messages: [],
  journal: [],
  innerworld: [],
  memoryVault: [],
  reminders: []
};

let state = loadState();
let activeTab = "alters";

const tabs = ["alters", "front", "board", "journal", "innerworld", "vault", "insights", "safety"];

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return structuredClone(defaultState); }
}

function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function download(name, payload) {
  const blob = new Blob([payload], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
}

function renderTabs() {
  const el = document.getElementById("tabs");
  el.innerHTML = "";
  tabs.forEach((t) => {
    const b = document.createElement("button");
    b.textContent = t;
    b.className = t === activeTab ? "active" : "";
    b.onclick = () => { activeTab = t; render(); };
    el.appendChild(b);
  });
}

function render() {
  document.body.classList.toggle("low-stim", state.settings.lowStim);
  renderTabs(); renderSystem(); renderFrontPicker(); renderCurrentFront();
  const c = document.getElementById("tabContent");
  c.innerHTML = "";
  if (activeTab === "alters") c.append(renderAlters());
  if (activeTab === "front") c.append(renderFront());
  if (activeTab === "board") c.append(renderBoard());
  if (activeTab === "journal") c.append(renderJournal());
  if (activeTab === "innerworld") c.append(renderInnerworld());
  if (activeTab === "vault") c.append(renderVault());
  if (activeTab === "insights") c.append(renderInsights());
  if (activeTab === "safety") c.append(renderSafety());
}

function renderSystem() {
  const form = document.getElementById("systemForm");
  Object.entries(state.system).forEach(([k,v]) => form.elements[k].value = v || "");
}

function renderFrontPicker() {
  const s = document.getElementById("frontSelect");
  s.innerHTML = state.alters.map(a=>`<option value="${a.id}">${a.name}</option>`).join("");
}

function renderCurrentFront() {
  const last = state.frontLog.at(-1);
  const name = state.alters.find(a=>a.id===last?.alterId)?.name || "None";
  document.getElementById("currentFront").textContent = `Current Front: ${name}`;
}

function addQuickForm(fields, onSubmitText, onSubmit) {
  const form = document.createElement("form"); form.className = "card form-grid";
  form.innerHTML = fields.map(f => `<label>${f.label}<${f.type||"input"} name="${f.name}" ${f.attrs||""}></${f.type||"input"}></label>`).join("") + `<button>${onSubmitText}</button>`;
  form.onsubmit = (e) => { e.preventDefault(); const fd = Object.fromEntries(new FormData(form).entries()); onSubmit(fd); form.reset(); };
  return form;
}

function renderAlters() {
  const wrap = document.createElement("section");
  wrap.append(addQuickForm([
    {name:"name",label:"Name",attrs:"required"},{name:"pronouns",label:"Pronouns"},{name:"role",label:"Role"},{name:"trigger",label:"Triggers"},{name:"preferences",label:"Preferences"},{name:"color",label:"Color",attrs:'type="color" value="#6c8cff"'},{name:"notes",label:"Notes",type:"textarea"}
  ], "Add Alter", (v)=>{ state.alters.push({id:uid(), ...v}); saveState(); render(); }));
  const grid = document.createElement("div"); grid.className = "grid";
  state.alters.forEach(a => {
    const t = document.getElementById("alterCardTemplate").content.cloneNode(true);
    t.querySelector("h3").textContent = a.name;
    t.querySelector(".tag").textContent = a.role || "alter";
    t.querySelector(".tag").style.background = a.color || "#6c8cff";
    t.querySelector(".meta").textContent = `${a.pronouns || ""} • ${a.preferences || ""}`;
    const notes = t.querySelector(".notes"); notes.textContent = a.notes || "";
    if (state.settings.blurTriggers && a.trigger) notes.classList.add("warning");
    t.querySelector(".delete").onclick = ()=>{ state.alters = state.alters.filter(x=>x.id!==a.id); saveState(); render(); };
    t.querySelector(".edit").onclick = ()=> alert("Edit can be done by deleting and recreating for this demo.");
    grid.append(t);
  });
  wrap.append(grid); return wrap;
}

function renderFront() {
  const wrap = document.createElement("section");
  wrap.append(addQuickForm([{name:"alterId",label:"Alter Id"},{name:"cofront",label:"Co-front IDs"},{name:"duration",label:"Duration (min)"},{name:"notes",label:"Notes",type:"textarea"}], "Log Front", (v)=>{ state.frontLog.push({id:uid(), time:now(), ...v}); saveState(); render(); }));
  const list = document.createElement("div"); list.className = "list";
  state.frontLog.slice().reverse().forEach(f => {
    const item = document.createElement("div"); item.className = "item";
    const alterName = state.alters.find(a=>a.id===f.alterId)?.name || f.alterId;
    item.textContent = `${new Date(f.time).toLocaleString()} — ${alterName} (${f.duration||"?"}m) ${f.notes||""}`;
    list.append(item);
  });
  wrap.append(list); return wrap;
}

const boardRenderer = (key, fields, label) => {
  const wrap = document.createElement("section");
  wrap.append(addQuickForm(fields, `Add ${label}`, (v)=>{ state[key].push({id:uid(), time:now(), ...v}); saveState(); render(); }));
  const list = document.createElement("div"); list.className = "list";
  state[key].slice().reverse().forEach(m=>{ const d=document.createElement("div"); d.className="item"; d.textContent=`${new Date(m.time).toLocaleString()} — ${Object.values(m).filter(Boolean).slice(2).join(" | ")}`; list.append(d); });
  wrap.append(list); return wrap;
};

function renderBoard(){ return boardRenderer("messages", [{name:"from",label:"From Alter"},{name:"thread",label:"Thread"},{name:"message",label:"Message",type:"textarea"}], "Message"); }
function renderJournal(){ return boardRenderer("journal", [{name:"alter",label:"Alter or System"},{name:"mood",label:"Mood"},{name:"tags",label:"Tags"},{name:"entry",label:"Entry",type:"textarea"}], "Journal Entry"); }
function renderInnerworld(){ return boardRenderer("innerworld", [{name:"location",label:"Location"},{name:"assigned",label:"Assigned Alters"},{name:"memory",label:"Associated Note",type:"textarea"}], "Location"); }
function renderVault(){ return boardRenderer("memoryVault", [{name:"title",label:"Title"},{name:"tags",label:"Tags"},{name:"content",label:"Secure Text",type:"textarea"}], "Vault Item"); }

function renderInsights(){
  const s = document.createElement("section"); s.className = "card";
  const countByAlter = state.frontLog.reduce((acc, x)=>{acc[x.alterId]=(acc[x.alterId]||0)+1; return acc;},{});
  const lines = Object.entries(countByAlter).map(([id,c])=>`${state.alters.find(a=>a.id===id)?.name||id}: ${c}`).join("\n") || "No front data yet.";
  s.innerHTML = `<h2>Pattern Insights</h2><pre>${lines}</pre><p>Total journal entries: ${state.journal.length}</p>`;
  return s;
}

function renderSafety(){
  const s = document.createElement("section"); s.className = "card";
  s.innerHTML = `<h2>Safety & Accessibility</h2>
  <label><input type="checkbox" id="blurToggle" ${state.settings.blurTriggers?"checked":""}/> Blur trigger-related note blocks</label>
  <p>Use low stimulation mode from the header for reduced visual load.</p>`;
  setTimeout(()=>document.getElementById("blurToggle").onchange=(e)=>{state.settings.blurTriggers=e.target.checked; saveState(); render();},0);
  return s;
}

document.getElementById("systemForm").onsubmit = (e)=>{
  e.preventDefault();
  state.system = Object.fromEntries(new FormData(e.target).entries());
  saveState(); render();
};

document.getElementById("setFrontBtn").onclick = ()=>{
  const alterId = document.getElementById("frontSelect").value;
  if (!alterId) return;
  state.frontLog.push({ id: uid(), time: now(), alterId, duration: "", notes: "fast switch" });
  saveState(); render();
};

document.getElementById("toggleLowStimBtn").onclick = ()=>{ state.settings.lowStim = !state.settings.lowStim; saveState(); render(); };
document.getElementById("exportBtn").onclick = ()=> download(`paracosm-export-${Date.now()}.json`, JSON.stringify(state, null, 2));
document.getElementById("backupBtn").onclick = ()=> download(`paracosm-backup-${Date.now()}.json`, JSON.stringify({snapshotAt:now(), state}, null, 2));
document.getElementById("importFile").onchange = (e)=>{
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state = imported.state ? imported.state : imported;
      saveState(); render(); alert("Import complete.");
    } catch { alert("Invalid import file."); }
  };
  reader.readAsText(file);
};

render();
