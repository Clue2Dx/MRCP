const sb=supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true}});
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const uid=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c=='x'?r:r&3|8).toString(16)});
const DEV=LS.get('dev')||(()=>{const d=uid();LS.set('dev',d);return d})();
let R={sources:[],branches:[],chapters:[]},Q=[],A={},M=new Set(),ME={},cur={},menu=null,QU=LS.get('queue',[]),urlc={};
let S={part:1,src:'all',br:'all',mode:'branch',ch:null,tab:'q',idx:0,dark:false,zoom:100};
const toast=m=>{const t=$('#tt');t.innerHTML=`<div class=tt>${esc(m)}</div>`;setTimeout(()=>t.innerHTML='',3200)};
const label=s=>s.name+(s.year?' '+s.year:'');
const srcs=()=>[...R.sources].sort((a,b)=>(b.year??-1)-(a.year??-1)||a.sort_order-b.sort_order);
const byId=(a,id)=>a.find(x=>x.id===id);
async function fetchAll(mk){let out=[],f=0;for(;;){const{data,error}=await mk().range(f,f+999);if(error)throw error;out.push(...data);if(data.length<1000)break;f+=1000}return out}

/* ---------- sync queue (offline-safe, idempotent) ---------- */
const saveQ=()=>{LS.set('queue',QU);badge()};
function enqueue(o){if(o.k==='pos'||o.k==='set')QU=QU.filter(x=>x.k!==o.k);QU.push(o);saveQ();flush()}
let flushing=false;
async function flush(){if(flushing||!QU.length||!navigator.onLine)return;flushing=true;
try{while(QU.length){const o=QU[0];let r;
if(o.k==='att')r=await sb.from('attempts').upsert(o.row,{onConflict:'id',ignoreDuplicates:true});
else if(o.k==='mark')r=await sb.rpc('set_mark',{p_question:o.q,p_marked:o.m,p_at:o.at});
else if(o.k==='set')r=await sb.rpc('save_settings',{p_settings:o.s,p_at:o.at});
else if(o.k==='pos')r=await sb.rpc('save_position',{p_position:o.p,p_at:o.at});
if(r.error){if(String(r.error.code||'').startsWith('23'))QU.shift();else break}else QU.shift();LS.set('queue',QU)}}
catch(e){}finally{flushing=false;saveQ()}}
const badge=()=>{const b=$('#sy');if(b){b.textContent=!navigator.onLine?'Offline'+(QU.length?` · ${QU.length} pending`:''):QU.length?`Syncing ${QU.length}…`:'Synced ✓';b.className='sy'+(!navigator.onLine||QU.length?' w':'')}};
addEventListener('online',()=>{flush();badge()});addEventListener('offline',badge);
const savePos=()=>{clearTimeout(savePos.t);savePos.t=setTimeout(()=>enqueue({k:'pos',p:{part:S.part,src:S.src,br:S.br,mode:S.mode,ch:S.ch,idx:S.idx},at:new Date().toISOString()}),1500)};
const saveSet=()=>enqueue({k:'set',s:{dark:S.dark,zoom:S.zoom},at:new Date().toISOString()});

/* ---------- auth ---------- */
function loginView(msg){$('#mb').innerHTML='';$('#app').style.zoom=1;$('#app').innerHTML=`<div class=lg><h1>MRCP Prep</h1><input type=email id=em placeholder="Email" autocomplete=username><input type=password id=pw placeholder="Password" autocomplete=current-password><button class=btn data-a=login>Sign in</button><button class="btn g" data-a=forgot>Forgot password</button><p class=t>${esc(msg||'')}</p></div>`}
function recoverView(){$('#mb').innerHTML='';$('#app').innerHTML=`<div class=lg><h1>New password</h1><input type=password id=pw placeholder="New password (8+ chars)"><button class=btn data-a=newpw>Save password</button></div>`}
async function boot(){const{data:{session}}=await sb.auth.getSession();if(!session)return loginView();
try{await load()}catch(e){return loginView('Could not load data: '+(e.message||e))}render();flush()}
sb.auth.onAuthStateChange((ev)=>{if(ev==='PASSWORD_RECOVERY')recoverView();else if(ev==='SIGNED_OUT')loginView()});

/* ---------- data ---------- */
function apply(d){R=d.R;Q=d.Q;A={};d.A.forEach(a=>A[a.question_id]={sel:a.selected,ok:a.is_correct,at:a.answered_at});M=new Set(d.M);ME=d.ME;
QU.forEach(o=>{if(o.k==='att')A[o.row.question_id]={sel:o.row.selected,ok:(byId(Q,o.row.question_id)||{}).correct_option?o.row.selected===byId(Q,o.row.question_id).correct_option:null,at:o.row.answered_at};if(o.k==='mark')o.m?M.add(o.q):M.delete(o.q)});
const st=ME.settings||{};if(!QU.some(o=>o.k==='set')){S.dark=!!st.dark;S.zoom=st.zoom||100}
const p=ME.position||{};if(!QU.some(o=>o.k==='pos')&&p.part){Object.assign(S,{part:p.part,src:p.src||'all',br:p.br||'all',mode:p.mode||'branch',ch:p.ch||null,idx:p.idx||0})}}
async function load(){try{
const[s,b,c,qs,at,mk,pf]=await Promise.all([sb.from('sources').select('*').is('deleted_at',null),sb.from('branches').select('*').is('deleted_at',null).order('sort_order'),sb.from('chapters').select('*').is('deleted_at',null).order('sort_order'),
fetchAll(()=>sb.from('questions').select('id,part,source_id,branch_id,chapter_id,position,n_options,correct_option,question_img,answer_img').eq('status','published').order('position').order('id')),
fetchAll(()=>sb.from('latest_attempts').select('question_id,selected,is_correct,answered_at').order('question_id')),
fetchAll(()=>sb.from('question_state').select('question_id').eq('marked',true).order('question_id')),sb.from('profiles').select('*').single()]);
for(const x of[s,b,c,pf])if(x.error)throw x.error;
const d={R:{sources:s.data,branches:b.data,chapters:c.data},Q:qs,A:at,M:mk.map(x=>x.question_id),ME:pf.data};LS.set('cache',d);apply(d)}
catch(e){const d=LS.get('cache');if(!d)throw e;apply(d);toast('Offline — using saved data')}}

/* ---------- helpers ---------- */
const sOrder=()=>{const m={};srcs().forEach((s,i)=>m[s.id]=i);return m};
const inF=q=>q.part===S.part&&(S.src==='all'||q.source_id===S.src);
const list=()=>{const o=sOrder();return Q.filter(q=>inF(q)&&(S.br==='all'||q.branch_id===S.br)&&(S.mode==='branch'||!S.ch||q.chapter_id===S.ch)).sort((a,b)=>o[a.source_id]-o[b.source_id]||a.position-b.position)};
const stat=L=>{const a=L.filter(q=>A[q.id]&&A[q.id].ok!=null),c=a.filter(q=>A[q.id].ok).length;return{n:a.length,c,w:a.length-c,pct:a.length?Math.round(c/a.length*100):0}};
const stOf=q=>{const c=cur[q.id],a=A[q.id];return c?{sel:c.sel,rev:false}:a?{sel:a.sel,rev:true}:{sel:null,rev:false}};
const LET=q=>'ABCDEFGH'.slice(0,q.n_options||5).split('');
const bn=id=>(byId(R.branches,id)||{}).name||'';const cn=id=>(byId(R.chapters,id)||{}).name||'';
function img(path){if(!path)return'';if(urlc[path])return urlc[path];return urlc[path]=sb.storage.from(CFG.bucket).createSignedUrl(path,21600).then(r=>r.data?r.data.signedUrl:'')}
async function hydrate(){for(const el of document.querySelectorAll('img[data-p]')){const u=await img(el.dataset.p);if(u)el.src=u;else el.alt='Image unavailable offline'}}
const title=()=>S.mode==='chapter'&&S.ch?cn(S.ch):S.br==='all'?'All branches':bn(S.br);
const crumb=()=>`${S.src==='all'?'All sources':label(byId(R.sources,S.src)||{name:''})} · Part ${S.part}${S.mode==='chapter'&&S.br!=='all'?' · '+bn(S.br):''}`;

/* ---------- views ---------- */
function bar(){const f=S,cnt=fn=>Q.filter(fn).length;
const M_={part:[[1,'Part 1'],[2,'Part 2']].map(([v,l])=>[v,l,cnt(q=>q.part===v)]),src:[['all','All sources',cnt(q=>q.part===f.part)],...srcs().map(s=>[s.id,label(s),cnt(q=>q.part===f.part&&q.source_id===s.id)])],
br:[['all','All branches',cnt(inF)],...R.branches.map(b=>[b.id,b.name,cnt(q=>inF(q)&&q.branch_id===b.id)])],
ch:R.chapters.filter(c=>c.branch_id===f.br).map(c=>[c.id,c.name,cnt(q=>inF(q)&&q.chapter_id===c.id)])};
const L={part:'Part '+f.part,src:f.src==='all'?'All sources':label(byId(R.sources,f.src)||{name:'?'}),br:f.br==='all'?'All branches':bn(f.br),ch:f.ch?cn(f.ch):'Choose chapter'};
const keys=['part','src','br'].concat(f.mode==='chapter'&&f.br!=='all'?['ch']:[]);
let h=keys.map(m=>`<div class=mg><button class="mt ${menu===m?'o':''}" data-a=menu data-v=${m}>${esc(L[m])} <small>▾</small></button>${menu===m?`<div class=pop id=pop>${M_[m].map(([v,l,n])=>`<button class="mi2 ${f[m]===v?'s':''}" data-a=pick data-m=${m} data-v="${v}">${esc(l)}<b>${n}</b></button>`).join('')||'<div class=t style="padding:12px">No chapters</div>'}</div>`:''}</div>`).join('');
h+=`<button class=mt data-a=mode>${f.mode==='branch'?'Branch mode':'Chapter mode'} ⇄</button><span class=sp></span><span class=sy id=sy></span>`+Object.entries({q:'Questions',p:'Performance',r:'Review',s:'Settings'}).map(([k,v])=>`<button class="mt ${f.tab===k?'on':''}" data-a=tab data-v=${k}>${v}</button>`).join('');
$('#mb').innerHTML=h;badge();const p=$('#pop');if(p){const r=p.parentElement.getBoundingClientRect();p.style.top=r.bottom+'px';p.style.left=Math.max(8,Math.min(r.left,innerWidth-p.offsetWidth-8))+'px'}}
const tools=L=>{const s=stat(L);return`<div class=tools><label>Page size <input type=range min=70 max=160 step=5 value=${S.zoom} data-c=zoom> <b id=zv>${S.zoom}%</b></label><span>Score <b>${s.c} / ${s.n}</b></span><button class=tg data-a=dark>${S.dark?'☀':'☾'}</button></div>`};
const item=q=>`<div class=rw><span><b>${esc(bn(q.branch_id))}</b> · ${esc(cn(q.chapter_id))||'—'}<small>${esc(label(byId(R.sources,q.source_id)||{name:''}))} · Part ${q.part} · #${q.position}</small></span><span class=f style="flex:none;min-width:0"><button class="btn s g" data-a=open data-v=${q.id}>Open</button><button class="btn s" data-a=retry data-v=${q.id}>Retry</button></span></div>`;

function vQ(){if(S.mode==='chapter'&&(S.br==='all'||!S.ch))return tools([])+`<div class=em>Chapter mode: choose a <b>Branch</b> then a <b>Chapter</b> from the top bar.</div>`;
const L=list();if(S.idx>=L.length)S.idx=Math.max(0,L.length-1);const q=L[S.idx],st=stat(L),s=q?stOf(q):{};
let h=tools(L)+`<div class=bc>${esc(crumb())}</div><div class=hero><h1>${esc(title())}</h1><div class=pr>${st.n} of ${L.length} completed · ✓ ${st.c} · ✗ ${st.w} · ${st.pct}%<u><i style="width:${L.length?st.n/L.length*100:0}%"></i></u></div></div>`;
if(!q)return h+'<div class=em>No questions here yet.</div>';
h+=`<div class=nv>${L.map((x,i)=>{const a=A[x.id]||{};return`<button class="nb ${a.ok===true?'ok':a.ok===false?'no':''} ${M.has(x.id)?'mk':''} ${i===S.idx?'on':''}" data-a=go data-v=${i}>${i+1}</button>`}).join('')}</div>
<div class=qh><span class=qw>QUESTION</span><b>${String(S.idx+1).padStart(2,'0')}</b><span>/ ${L.length}</span><em>${S.mode==='chapter'?esc(cn(q.chapter_id)):esc(bn(q.branch_id))}</em></div>
<img class=qi data-p="${esc(q.question_img)}"><div class=ops>${LET(q).map(l=>`<button class="op ${s.sel===l?'sel':''} ${s.rev&&q.correct_option===l?'good':''} ${s.rev&&s.sel===l&&q.correct_option!==l?'bad':''}" data-a=sel data-v=${l} ${s.rev?'disabled':''}>${l}</button>`).join('')}</div>
<div class=ac><button class=btn data-a=ans ${s.rev?'disabled':''}>Answer</button><button class="btn ${M.has(q.id)?'m':'g'}" data-a=mark>${M.has(q.id)?'★ Marked for Review':'☆ Mark for Review'}</button>${s.rev?`<button class="btn g" data-a=retry data-v=${q.id}>Reattempt</button>`:''}</div>`;
if(s.rev){const a=A[q.id];h+=`<div class="rs ${a.ok?'g':a.ok===false?'r':''}">${a.ok?'✓ Correct':a.ok===false?'✗ Wrong':'Recorded'}${q.correct_option?' — Answer: '+q.correct_option:''}</div>`;if(q.answer_img)h+=`<img class=qi data-p="${esc(q.answer_img)}">`}
return h+`<div class=ft><button class="btn g" data-a=prev ${S.idx?'':'disabled'}>← Previous</button><button class=btn data-a=next ${S.idx<L.length-1?'':'disabled'}>Next →</button></div>`}

function vP(){const base=Q.filter(inF),row=(n,l)=>{const s=stat(l);return`<tr><td>${esc(n)}</td><td>${s.n}/${l.length}</td><td>${s.c}</td><td>${s.w}</td><td>${l.length-s.n}</td><td>${s.pct}%</td></tr>`};
const th='<tr><th></th><th>Done</th><th>✓</th><th>✗</th><th>Left</th><th>%</th></tr>';
const br=R.branches.map(b=>[b,base.filter(q=>q.branch_id===b.id)]).filter(x=>x[1].length);
let h=tools(base)+`<div class=bc>${esc(crumb())}</div><h1>Performance</h1><div class=sec><h3>Overall</h3><table>${th}${row('All',base)}</table></div><div class=sec><h3>Branches</h3><table>${th}${br.map(([b,l])=>row(b.name,l)).join('')||'<tr><td colspan=6 class=em>No data</td></tr>'}</table></div>`;
if(S.br!=='all'){const ch=R.chapters.filter(c=>c.branch_id===S.br).map(c=>[c,base.filter(q=>q.chapter_id===c.id)]).filter(x=>x[1].length);h+=`<div class=sec><h3>${esc(bn(S.br))} — chapters</h3><table>${th}${ch.map(([c,l])=>row(c.name,l)).join('')||'<tr><td colspan=6 class=em>No chapters assigned</td></tr>'}</table></div>`}
return h+rev(base)}
function rev(base){const f=base.filter(q=>(S.br==='all'||q.branch_id===S.br)&&(S.mode==='branch'||!S.ch||q.chapter_id===S.ch)),W=f.filter(q=>A[q.id]&&A[q.id].ok===false),K=f.filter(q=>M.has(q.id));
return`<div class=sec><h3>Incorrect (${W.length})</h3>${W.map(item).join('')||'<span class=t>None</span>'}</div><div class=sec><h3>Marked for review (${K.length})</h3>${K.map(item).join('')||'<span class=t>None</span>'}</div>`}
const vR=()=>{const b=Q.filter(inF);return tools(b)+`<div class=bc>${esc(crumb())}</div><h1>Review</h1>`+rev(b)};

function vS(){const adm=ME.is_admin,o=(a,l)=>a.map(x=>`<option value="${x.id}">${esc(l(x))}</option>`).join('');
return`<div class=bc>Preferences</div><h1>Settings</h1><div class=sec><h3>Display</h3><div class=rw><label><input type=checkbox data-c=dark ${S.dark?'checked':''}> Dark mode</label><label>Zoom <b>${S.zoom}%</b> <input type=range min=70 max=160 step=5 value=${S.zoom} data-c=zoom></label></div></div>
<div class=sec><h3>Account</h3><button class="btn g" data-a=logout>Sign out</button> <button class="btn g" data-a=refresh>Refresh data</button></div>`+(adm?`<div class=sec><h3>Admin — classification</h3><div class=f><button class="btn g" data-a=addsrc>+ Source</button><button class="btn g" data-a=addbr>+ Branch</button><button class="btn g" data-a=addch>+ Chapter (current branch)</button></div></div>
<div class=sec><h3>Admin — import questions</h3><div class=f><select id=ip><option value=1>Part 1<option value=2>Part 2</select><select id=is>${o(srcs(),label)}</select><select id=ib>${o(R.branches,x=>x.name)}</select><select id=ic><option value="">No chapter</option>${o(R.chapters,x=>bn(x.branch_id)+' · '+x.name)}</select></div>
<p class=t>Select all pack images (0001_kE_n5_q.webp + 0001_a.webp). Duplicates are skipped automatically.</p><input type=file id=fq accept="image/*" multiple><p><button class="btn a" data-a=imp>Import</button> <span id=msg class=t></span></p></div>`:'')}

function render(){document.body.classList.toggle('dark',S.dark);bar();$('#app').style.zoom=S.zoom/100;$('#app').innerHTML={q:vQ,p:vP,r:vR,s:vS}[S.tab]();hydrate();
if(S.tab==='q'){const L=list(),n=L[S.idx+1];if(n){img(n.question_img);img(n.answer_img)}}}
function open(id,retry){const q=byId(Q,id);Object.assign(S,{part:q.part,src:q.source_id,br:q.branch_id,mode:'branch',ch:null,tab:'q'});S.idx=list().findIndex(x=>x.id===id);if(retry)cur[id]={sel:null};savePos();render();scrollTo(0,0)}

/* ---------- actions ---------- */
async function act(a,v,el){const L=S.tab==='q'?list():[],q=L[S.idx];
if(a==='menu'){menu=menu===v?null:v;return bar()}menu=null;
if(a==='login'){const{error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});return error?loginView(error.message):boot()}
if(a==='forgot'){const e=$('#em').value.trim();if(!e)return toast('Enter your email first');const{error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin+location.pathname});return toast(error?error.message:'Reset link sent to your email')}
if(a==='newpw'){const{error}=await sb.auth.updateUser({password:$('#pw').value});return error?toast(error.message):boot()}
if(a==='logout'){await sb.auth.signOut();return}
if(a==='refresh'){await flush();await load();return render()}
if(a==='pick'){const m=el.dataset.m;S[m]=m==='part'?+v:v;if(m==='br')S.ch=null;S.idx=0;if(S.tab==='s')S.tab='q';savePos()}
else if(a==='mode'){S.mode=S.mode==='branch'?'chapter':'branch';S.idx=0;S.ch=null;savePos()}
else if(a==='tab')S.tab=v;
else if(a==='dark'){S.dark=!S.dark;saveSet()}
else if(a==='go'){S.idx=+v;savePos()}
else if(a==='sel'&&q&&!stOf(q).rev)cur[q.id]={sel:v};
else if(a==='ans'&&q){const s=stOf(q);if(!s.sel||s.rev)return toast('Pick an option first');const at=new Date().toISOString(),row={id:uid(),question_id:q.id,selected:s.sel,answered_at:at,device_id:DEV};
A[q.id]={sel:s.sel,ok:q.correct_option?s.sel===q.correct_option:null,at};delete cur[q.id];enqueue({k:'att',row})}
else if(a==='mark'&&q){const m=!M.has(q.id);m?M.add(q.id):M.delete(q.id);enqueue({k:'mark',q:q.id,m,at:new Date().toISOString()})}
else if(a==='prev'){S.idx=Math.max(0,S.idx-1);savePos()}
else if(a==='next'){S.idx=Math.min(L.length-1,S.idx+1);savePos()}
else if(a==='open')return open(v);else if(a==='retry'){if(S.tab==='q'&&q&&q.id===v)cur[v]={sel:null};else return open(v,1)}
else if(a==='imp')return doImp();
else if(a==='addsrc'||a==='addbr'||a==='addch')return addClass(a);
render();if(['go','next','prev','pick'].includes(a))scrollTo(0,0)}

async function addClass(a){let r;
if(a==='addsrc'){const n=prompt('Source name (e.g. PassMedicine)');if(!n)return;const y=prompt('Publication year (empty if none)');r=await sb.from('sources').insert({name:n.trim(),year:y?+y:null,sort_order:R.sources.length+1})}
else if(a==='addbr'){const n=prompt('Branch name');if(!n)return;r=await sb.from('branches').insert({name:n.trim(),sort_order:R.branches.length+1})}
else{if(S.br==='all')return toast('Select a branch in the top bar first');const n=prompt('Chapter name for '+bn(S.br));if(!n)return;r=await sb.from('chapters').insert({branch_id:S.br,name:n.trim(),sort_order:R.chapters.length+1})}
if(r.error)return toast(r.error.message);await load();render();toast('Added')}

async function doImp(){const m=$('#msg'),files=[...$('#fq').files],re=/^(\d+).*?_([qa])\.\w+$/i;if(!files.length||!files.every(f=>re.test(f.name)))return m.textContent='Select files named like 0001_kE_n5_q.webp / 0001_a.webp';
const d={};files.forEach(f=>{const x=f.name.match(re);(d[+x[1]]=d[+x[1]]||{})[x[2].toLowerCase()]=f});
const keys=Object.keys(d).map(Number).sort((a,b)=>a-b).filter(k=>d[k].q);
const part=+$('#ip').value,src=$('#is').value,br=$('#ib').value,ch=$('#ic').value||null;
let known;try{known=new Set((await fetchAll(()=>sb.from('questions').select('content_hash').order('id'))).map(x=>x.content_hash))}catch(e){return m.textContent=e.message}
let pos=Math.max(0,...Q.filter(q=>q.part===part&&q.source_id===src&&q.branch_id===br).map(q=>q.position)),ok=0,dup=0;
for(let i=0;i<keys.length;i++){const f=d[keys[i]],buf=await f.q.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buf))].map(b=>b.toString(16).padStart(2,'0')).join('');
m.textContent=`Importing ${i+1} / ${keys.length}…`;if(known.has(hash)){dup++;continue}
const id=uid(),qp=`${id}/q.webp`,ap=f.a?`${id}/a.webp`:null,k=f.q.name.match(/_k([A-H])_/i),n=f.q.name.match(/_n(\d)_/);
let r=await sb.storage.from(CFG.bucket).upload(qp,f.q,{contentType:f.q.type||'image/webp'});if(r.error){m.textContent=r.error.message;return}
if(ap){r=await sb.storage.from(CFG.bucket).upload(ap,f.a,{contentType:f.a.type||'image/webp'});if(r.error){m.textContent=r.error.message;return}}
r=await sb.from('questions').insert({id,part,source_id:src,branch_id:br,chapter_id:ch,position:++pos,n_options:n?+n[1]:5,correct_option:k?k[1].toUpperCase():null,question_img:qp,answer_img:ap,content_hash:hash});
if(r.error){m.textContent=r.error.message;return}known.add(hash);ok++}
await load();render();toast(`Imported ${ok}, skipped ${dup} duplicates`)}

document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)act(b.dataset.a,b.dataset.v,b);else if(menu){menu=null;bar()}});
document.addEventListener('input',e=>{if(e.target.dataset.c==='zoom'){S.zoom=+e.target.value;$('#app').style.zoom=S.zoom/100;const z=$('#zv');if(z)z.textContent=S.zoom+'%'}});
document.addEventListener('change',e=>{const c=e.target.dataset.c;if(c==='dark')S.dark=e.target.checked;else if(c==='zoom')S.zoom=+e.target.value;else return;saveSet();render()});
document.addEventListener('keydown',e=>{if(S.tab!=='q'||/INPUT|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')act('next');if(e.key==='ArrowLeft')act('prev')});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
boot();
