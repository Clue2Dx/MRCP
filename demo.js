/* In-memory demo backend: same calls the app makes to Supabase, nothing is saved or sent anywhere. */
window.makeDemoClient=function(){
const uid=()=>crypto.randomUUID(),now=()=>new Date().toISOString(),T={},files={};
const wrap=(s,n)=>{const w=s.split(' ');const o=[];let l='';w.forEach(x=>{if((l+' '+x).length>n){o.push(l);l=x}else l=(l?l+' ':'')+x});if(l)o.push(l);return o};
const svg=(lines,h)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="${h}"><rect width="100%" height="100%" fill="#fff"/>${lines}</svg>`);
const tx=(y,s,x=30,sz=16,c='#222',w='normal')=>`<text x="${x}" y="${y}" font-family="Helvetica,Arial,sans-serif" font-size="${sz}" fill="${c}" font-weight="${w}">${s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
const bank=[
['Cardiology','Arrhythmias','A 68-year-old man with atrial fibrillation has a CHA2DS2-VASc score of 3. Which is the most appropriate stroke prevention?',['Aspirin','Direct oral anticoagulant','Clopidogrel','No treatment','Dual antiplatelet therapy'],'B','For men with a CHA2DS2-VASc score of 2 or more, anticoagulation is recommended. A direct oral anticoagulant is first-line.'],
['Cardiology','Valvular heart disease','Which pulse character is most typical of severe aortic stenosis?',['Collapsing pulse','Slow-rising pulse','Pulsus paradoxus','Bisferiens pulse','Pulsus alternans'],'B','Aortic stenosis causes a slow-rising, low-volume pulse with a narrow pulse pressure.'],
['Cardiology','Heart failure','Which combination is first-line for heart failure with reduced ejection fraction?',['ACE inhibitor and beta-blocker','Calcium channel blocker and digoxin','Thiazide and amlodipine','Nifedipine and doxazosin','Aspirin and clopidogrel'],'A','ACE inhibitors (or ARBs) and evidence-based beta-blockers improve survival in HFrEF.'],
['Cardiology',null,'Which ECG change is typical of hyperkalaemia?',['Tall tented T waves','U waves','Short PR with delta wave','Prolonged QT interval','Inverted P waves'],'A','Hyperkalaemia produces peaked T waves, then PR prolongation, P-wave flattening and a wide QRS.'],
['Neurology','Stroke','Sudden right-sided weakness began 90 minutes ago and CT shows no haemorrhage. What is the best next step?',['Aspirin 300 mg only','IV thrombolysis','Warfarin','Observation','Lumbar puncture'],'B','Within 4.5 hours of onset and with haemorrhage excluded, thrombolysis is indicated.'],
['Neurology','Epilepsy','Which is first-line for generalised tonic-clonic seizures in a man?',['Sodium valproate','Carbamazepine','Phenytoin','Ethosuximide','Gabapentin'],'A','Sodium valproate is first-line in men; lamotrigine or levetiracetam are used in women of childbearing potential.'],
['Neurology',null,'Unilateral throbbing headache with aura, nausea and photophobia is most likely:',['Migraine','Cluster headache','Tension-type headache','Temporal arteritis','Subarachnoid haemorrhage'],'A','This is a classic migraine with aura presentation.'],
['Respiratory','Obstructive lung disease','Which spirometry result is typical of COPD?',['FEV1/FVC below 0.7','FEV1/FVC above 0.8 with low FVC','Raised TLCO','Normal flow-volume loop','Raised FVC'],'A','COPD gives a post-bronchodilator FEV1/FVC ratio below 0.7 with limited reversibility.'],
['Respiratory',null,'Which organism most commonly causes community-acquired pneumonia?',['Streptococcus pneumoniae','Staphylococcus aureus','Klebsiella pneumoniae','Pseudomonas aeruginosa','Legionella pneumophila'],'A','Streptococcus pneumoniae is the commonest cause.'],
['Respiratory','Obstructive lung disease','First-line treatment of acute severe asthma includes:',['Oxygen, nebulised salbutamol and steroids','Antibiotics only','Montelukast only','Intravenous aminophylline first','Observation only'],'A','Give oxygen, high-dose bronchodilators and systemic corticosteroids immediately.'],
['Respiratory',null,'Type 1 respiratory failure is defined by:',['Low PaO2 with normal or low PaCO2','Low PaO2 with high PaCO2','Normal PaO2 with high PaCO2','High PaO2','Low pH only'],'A','Type 1 failure shows hypoxia without hypercapnia (V/Q mismatch).'],
['Neurology','Stroke','Which artery is most often involved in a lateral medullary (Wallenberg) syndrome?',['Posterior inferior cerebellar artery','Anterior cerebral artery','Middle cerebral artery','Basilar tip','Anterior spinal artery'],'A','PICA (or vertebral) occlusion causes Wallenberg syndrome.']];
function mkQ(b,i){const [br,ch,stem,opts,key,exp]=b;let y=34,L='';wrap(stem,78).forEach(s=>{L+=tx(y,s);y+=24});y+=14;
 opts.forEach((o,k)=>{L+=`<rect x="70" y="${y-20}" width="540" height="34" rx="8" fill="#fff" stroke="#e3e0ee"/><circle cx="42" cy="${y-3}" r="13" fill="#efebff" stroke="#7451ed"/>`+tx(y+2,'ABCDEF'[k],37,13,'#7451ed','bold')+tx(y+2,o,86,15);y+=44});
 const q=svg(L,y+6);let a='',ay=34;opts.forEach((o,k)=>{a+=`<rect x="30" y="${ay-20}" width="580" height="34" rx="8" fill="${'ABCDEF'[k]===key?'#b6f18a':'#f3f3f3'}"/>`+tx(ay+2,o,44,15)+tx(ay+2,(k===0?'42%':k===1?'31%':'9%'),560,12,'#555');ay+=40});
 ay+=14;wrap(exp,80).forEach(s=>{a+=tx(ay,s,30,14,'#333');ay+=22});return{q,a:svg(a,ay+10)}}
const D={sources:[],branches:[],chapters:[],questions:[],attempts:[],question_state:[],question_versions:[],activity_log:[],profiles:[{id:'demo',is_admin:true,settings:{},settings_updated_at:'2000-01-01T00:00:00Z',position:{},position_updated_at:'2000-01-01T00:00:00Z'}]};
const S1={id:uid(),name:'PassMedicine',year:2026,sort_order:1,is_default:true,deleted_at:null},S2={id:uid(),name:'PassMedicine',year:2024,sort_order:2,is_default:false,deleted_at:null},S3={id:uid(),name:'Pastest',year:null,sort_order:3,is_default:false,deleted_at:null};D.sources.push(S1,S2,S3);
const BR={};['Cardiology','Neurology','Respiratory'].forEach((n,i)=>{BR[n]={id:uid(),name:n,sort_order:i+1,deleted_at:null};D.branches.push(BR[n])});
const CH={};bank.forEach(b=>{if(b[1]&&!CH[b[0]+b[1]]){CH[b[0]+b[1]]={id:uid(),branch_id:BR[b[0]].id,name:b[1],sort_order:Object.keys(CH).length+1,deleted_at:null};D.chapters.push(CH[b[0]+b[1]])}});
let pos={};
[[S1,bank],[S2,bank.filter((_,i)=>i%2===0)]].forEach(([s,list])=>list.forEach(b=>{const id=uid(),im=mkQ(b),k=s.id+b[0];pos[k]=(pos[k]||0)+1;files['demo/'+id+'/q']=im.q;files['demo/'+id+'/a']=im.a;
 D.questions.push({id,part:1,source_id:s.id,branch_id:BR[b[0]].id,chapter_id:b[1]?CH[b[0]+b[1]].id:null,position:pos[k],n_options:b[3].length,correct_option:b[4],question_img:'demo/'+id+'/q',answer_img:'demo/'+id+'/a',content_hash:'demo'+id,status:'published',current_version:1,created_at:now(),updated_at:now()})}));
const ret=(data)=>({data,error:null}),cp=o=>JSON.parse(JSON.stringify(o));
function qb(t){const st={f:[],ord:null,asc:true,lo:0,hi:1e9,op:'select',row:null,patch:null,opt:{},single:false},b={};
 b.select=()=>b;b.eq=(c,v)=>{st.f.push(r=>r[c]===v);return b};b.is=(c,v)=>{st.f.push(r=>(r[c]??null)===v);return b};b.in=(c,a)=>{st.f.push(r=>a.includes(r[c]));return b};
 b.order=(c,o)=>{if(!st.ord){st.ord=c;st.asc=!(o&&o.ascending===false)}return b};b.range=(a,z)=>{st.lo=a;st.hi=z;return b};b.limit=n=>{st.hi=n-1;return b};b.single=()=>{st.single=true;return b};
 b.insert=r=>{st.op='insert';st.row=r;return b};b.update=p=>{st.op='update';st.patch=p;return b};b.upsert=(r,o)=>{st.op='upsert';st.row=r;st.opt=o||{};return b};
 function src(){if(t==='latest_attempts'){const m={};D.attempts.slice().sort((x,y)=>x.answered_at<y.answered_at?-1:1).forEach(a=>m[a.question_id]=a);return Object.values(m)}return D[t]||[]}
 function run(){try{
  if(st.op==='select'){let r=src().filter(x=>st.f.every(f=>f(x)));if(st.ord)r=r.slice().sort((x,y)=>(x[st.ord]>y[st.ord]?1:x[st.ord]<y[st.ord]?-1:0)*(st.asc?1:-1));r=cp(r.slice(st.lo,st.hi+1));if(st.single)return r.length?ret(r[0]):{data:null,error:{message:'No rows'}};return ret(r)}
  const rows=[].concat(st.row||[]);
  if(st.op==='insert'||st.op==='upsert'){const out=[];rows.forEach(r=>{r={...r};if(t==='activity_log'){r.id=r.id||uid();r.created_at=now()}
   if(t==='attempts'){if(D.attempts.some(x=>x.id===r.id))return;const q=D.questions.find(x=>x.id===r.question_id);r.is_correct=q&&q.correct_option?r.selected===q.correct_option:null}
   if(t==='questions'){r.id=r.id||uid();r.status=r.status||'published';r.current_version=1;r.created_at=r.updated_at=now()}
   if(['sources','branches','chapters'].includes(t)){r.id=r.id||uid();r.deleted_at=null}
   D[t].push(r);out.push(r)});return ret(st.single?cp(out[0]):cp(out))}
  if(st.op==='update'){const hit=D[t].filter(x=>st.f.every(f=>f(x)));hit.forEach(x=>{Object.assign(x,st.patch);if(t==='questions')x.updated_at=now()});return ret(cp(hit))}
 }catch(e){return{data:null,error:{message:String(e)}}}}
 b.then=(a,z)=>Promise.resolve(run()).then(a,z);return b}
return{auth:{getSession:async()=>ret({session:{user:{email:'demo@example.com'}}}),onAuthStateChange:()=>{},signOut:async()=>{location.href=location.pathname},signInWithPassword:async()=>({error:null}),resetPasswordForEmail:async()=>({error:null}),updateUser:async()=>({error:null})},
 from:qb,
 rpc:async(n,a)=>{if(n==='set_mark'){const r=D.question_state.find(x=>x.question_id===a.p_question);if(r){r.marked=a.p_marked;r.updated_at=a.p_at}else D.question_state.push({question_id:a.p_question,marked:a.p_marked,updated_at:a.p_at})}
  if(n==='save_settings'){D.profiles[0].settings=a.p_settings}if(n==='save_position'){D.profiles[0].position=a.p_position}return{error:null}},
 storage:{from:()=>({upload:async(p,f)=>{files[p]=URL.createObjectURL(f);return{error:null}},createSignedUrl:async p=>ret({signedUrl:files[p]||''}),createSignedUrls:async ps=>ret(ps.map(p=>({path:p,signedUrl:files[p]||''})))})}}};
