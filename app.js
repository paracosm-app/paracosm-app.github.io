const STORAGE_KEY = 'paracosm_v2';
const SPACES = ['dashboard','alters','fronting','board','journal','innerworld','vault','safety','settings'];
let activeSpace='dashboard';
let state=load();

function defaults(){return{system:{name:'',pronouns:'',notes:'',color:'#e94560'},activeAlterId:'',alters:[],frontLog:[],board:[],journal:[],innerworld:[],vault:[],safety:{blur:true,lowStim:false}}}
function load(){try{return {...defaults(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return defaults()}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
const id=()=>crypto.randomUUID(); const now=()=>new Date().toISOString();
const esc=s=>{const d=document.createElement('div');d.textContent=s||'';return d.innerHTML};

function render(){renderAlterSelect();renderSpaces();renderHeader();renderWorkspace();document.body.style.filter=state.safety.lowStim?'saturate(.8) contrast(.95)':'none'}
function renderAlterSelect(){const el=document.getElementById('activeAlterSelect');el.innerHTML='<option value="">-- Active front --</option>'+state.alters.map(a=>`<option ${a.id===state.activeAlterId?'selected':''} value="${a.id}">${esc(a.name)}</option>`).join('')}
function renderSpaces(){const el=document.getElementById('spaceList');el.innerHTML=SPACES.map(s=>`<div class="board-item ${s===activeSpace?'active':''}" data-space="${s}"><span>${s}</span><span>›</span></div>`).join('');el.querySelectorAll('.board-item').forEach(n=>n.onclick=()=>{activeSpace=n.dataset.space;render();closeSidebar();});}
function renderHeader(){document.getElementById('headerTitle').textContent=activeSpace[0].toUpperCase()+activeSpace.slice(1);document.getElementById('headerSub').textContent='Everything is local-only. Export regularly for backups.'}

function addForm(fields,submitText,onSubmit){return `<form class="card" onsubmit="${onSubmit}(event)">${fields.map(f=>`<label>${f}<input name="${f}" /></label>`).join('')}<button>${submitText}</button></form>`}

function renderWorkspace(){const w=document.getElementById('workspace');
if(activeSpace==='dashboard'){w.innerHTML=`<div class="cards"><div class="card"><h3>System</h3><p>${esc(state.system.name||'Unnamed System')}</p><p>${esc(state.system.notes||'No notes yet')}</p></div><div class="card"><h3>Insights</h3><p>Alters: ${state.alters.length}</p><p>Front logs: ${state.frontLog.length}</p><p>Journal entries: ${state.journal.length}</p></div></div>`;return}
if(activeSpace==='alters'){w.innerHTML=`<div class="cards"><form class="card" id="alterForm"><h3>Add Alter</h3><input name="name" placeholder="Name" required/><input name="pronouns" placeholder="Pronouns"/><input name="role" placeholder="Role"/><input name="color" type="color" value="#e94560"/><textarea name="notes" placeholder="Notes"></textarea><button>Add</button></form>${state.alters.map(a=>`<div class="card"><h3>${esc(a.name)}</h3><p>${esc(a.pronouns||'')}</p><p>${esc(a.role||'')}</p><button onclick="delAlter('${a.id}')">Delete</button></div>`).join('')}</div>`;document.getElementById('alterForm').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target).entries());state.alters.push({id:id(),...v});save();render()};return}
if(activeSpace==='fronting'){w.innerHTML=`<div class="cards"><form class="card" id="frontForm"><h3>Log Front</h3><select name="alterId">${state.alters.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select><input name="duration" placeholder="Duration minutes"/><textarea name="notes" placeholder="Notes"></textarea><button>Save</button></form>${state.frontLog.slice().reverse().map(f=>`<div class="card"><p>${new Date(f.time).toLocaleString()}</p><p>${esc(findAlter(f.alterId)?.name||'Unknown')}</p><p>${esc(f.notes||'')}</p></div>`).join('')}</div>`;document.getElementById('frontForm').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target).entries());state.frontLog.push({id:id(),time:now(),...v});save();render()};return}
const map={board:'message',journal:'entry',innerworld:'location',vault:'item'};if(map[activeSpace]){const key=activeSpace;w.innerHTML=`<div class="cards"><form class="card" id="genericForm"><h3>Add ${key}</h3><input name="title" placeholder="Title / tag"/><textarea name="text" placeholder="Write..."></textarea><button>Add</button></form>${state[key].slice().reverse().map(x=>`<div class="card"><p>${new Date(x.time).toLocaleString()}</p><h4>${esc(x.title||'')}</h4><p class="${state.safety.blur&&/trigger/i.test(x.text||'')?'blur':''}">${esc(x.text||'')}</p></div>`).join('')}</div>`;document.getElementById('genericForm').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target).entries());state[key].push({id:id(),time:now(),...v});save();render()};return}
if(activeSpace==='safety'){w.innerHTML=`<div class="cards"><div class="card"><h3>Safety</h3><label><input type="checkbox" id="blurT" ${state.safety.blur?'checked':''}/> Blur trigger text</label><label><input type="checkbox" id="stimT" ${state.safety.lowStim?'checked':''}/> Low stimulation</label></div></div>`;document.getElementById('blurT').onchange=e=>{state.safety.blur=e.target.checked;save();render()};document.getElementById('stimT').onchange=e=>{state.safety.lowStim=e.target.checked;save();render()};return}
if(activeSpace==='settings'){w.innerHTML=`<div class="cards"><form class="card" id="sysForm"><h3>System profile</h3><input name="name" value="${esc(state.system.name)}" placeholder="System name"/><input name="pronouns" value="${esc(state.system.pronouns)}" placeholder="Pronouns"/><input type="color" name="color" value="${state.system.color}"/><textarea name="notes" placeholder="Shared notes">${esc(state.system.notes)}</textarea><button>Save</button></form></div>`;document.getElementById('sysForm').onsubmit=e=>{e.preventDefault();state.system=Object.fromEntries(new FormData(e.target).entries());save();render()};}
}
function findAlter(i){return state.alters.find(a=>a.id===i)}
function delAlter(i){state.alters=state.alters.filter(a=>a.id!==i);if(state.activeAlterId===i)state.activeAlterId='';save();render()}
function exportData(){const b=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`paracosm-export-${Date.now()}.json`;a.click()}
function importData(file){const r=new FileReader();r.onload=()=>{try{state={...defaults(),...JSON.parse(r.result)};save();render();alert('Import complete')}catch{alert('Invalid file')}};r.readAsText(file)}
function quickPin(){const txt=document.getElementById('quickInput');if(!txt.value.trim())return;state.board.push({id:id(),time:now(),title:findAlter(state.activeAlterId)?.name||'System',text:txt.value.trim()});txt.value='';save();if(activeSpace!=='board')activeSpace='board';render()}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('mobileOverlay').classList.add('hidden')}

document.getElementById('activeAlterSelect').onchange=e=>{state.activeAlterId=e.target.value;save();render()};
document.getElementById('exportBtn').onclick=exportData;
document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();
document.getElementById('importFile').onchange=e=>e.target.files[0]&&importData(e.target.files[0]);
document.getElementById('quickSendBtn').onclick=quickPin;
document.getElementById('quickFrontBtn').onclick=()=>{if(!state.activeAlterId)return alert('Select active alter first');state.frontLog.push({id:id(),time:now(),alterId:state.activeAlterId,duration:'',notes:'Quick front log'});save();activeSpace='fronting';render()};
document.getElementById('openSidebarBtn').onclick=()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('mobileOverlay').classList.remove('hidden')};
document.getElementById('mobileOverlay').onclick=closeSidebar;
document.getElementById('addAlterBtn').onclick=()=>{activeSpace='alters';render()};
render();
