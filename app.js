'use strict';
/* ================= setup ================= */
const DEMO=!!(window.DEMO_ONLY||new URLSearchParams(location.search).has('demo')),CF=window.CFG||{bucket:'question-images'};
const sb=DEMO?makeDemoClient():supabase.createClient(CF.url,CF.key,{auth:{persistSession:true,autoRefreshToken:true}});
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const uid=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c=='x'?r:r&3|8).toString(16)});
const DEV=LS.get('dev')||(()=>{const d=uid();LS.set('dev',d);return d})();
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof t==='string'?new TextEncoder().encode(t):t))].map(b=>b.toString(16).padStart(2,'0')).join('');
function dl(name,obj){const b=new Blob([typeof obj==='string'?obj:JSON.stringify(obj,null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),8000)}
async function fetchAll(mk){let out=[],f=0;for(;;){const{data,error}=await mk().range(f,f+999);if(error)throw error;out.push(...data);if(data.length<1000)break;f+=1000}return out}
const top0=()=>{scrollTo(0,0);const m=document.querySelector('#app');if(m)m.scrollTop=0};
const day=()=>new Date().toISOString().slice(0,10);
/* ================= i18n ================= */
const T={en:{study:'Study',progress:'Progress',library:'Library',settings:'Settings',part:'Part',allSources:'All sources',source:'Source',branch:'Branch',chapter:'Chapter',branches:'Branches',chapters:'Chapters',allChapters:'All chapters (mixed)',unclassified:'No chapter',cont:'Continue where you left off',start:'Start',all:'All',unanswered:'Unanswered',incorrect:'Incorrect',marked:'Marked',correct:'Correct',qs:'questions',answered:'answered',accuracy:'accuracy',overall:'Overall progress',question:'Question',check:'Check answer',next:'Next',prev:'Previous',finish:'Finish',reattempt:'Reattempt',mark:'Mark for review',unmark:'Marked for review',pickFirst:'Choose an answer first',attempts:'Attempts',history:'Attempt history',noKey:'No answer key set',answerIs:'Correct answer',back:'Back',jump:'Jump to question',empty:'No questions here yet.',emptyHint:'Open Library to add questions.',done:'Done',left:'Left',recent:'Recent attempts',wrongList:'Incorrect questions',markedList:'Marked for review',none:'None',open:'Open',retry:'Retry',branchWord:'Branch',search:'Search by number, branch, chapter or source…',tabQ:'Questions',tabTrash:'Trash',tabTax:'Divisions',tabDl:'Downloads',tabLog:'Activity',add:'Add',importQ:'Import',edit:'Edit',del:'Delete',restore:'Restore',moveSel:'Move',selected:'selected',selectAll:'Select all',clear:'Clear',noMatch:'No matching questions',showMore:'Show more',any:'Any',state:'State',trashEmpty:'Trash is empty.',trashNote:'Deleted questions stay here and keep their answer history. Nothing is erased permanently.',cancel:'Cancel',confirm:'Confirm',save:'Save',close:'Close',delTitle:'Move to Trash?',delBody:'{n} question(s) will be moved to Trash. Answer history is never deleted ({h} with history).',moveTrash:'Move to Trash',pinNeeded:'Deletion PIN',enterPin:'Enter your PIN',newPin:'New PIN (4+ digits)',confirmPin:'Repeat PIN',createPinMsg:'Create a PIN to protect deletions. You can change it in Settings.',wrongPin:'Incorrect PIN',pinShort:'PIN must be at least 4 characters',pinMismatch:'PINs do not match',backupAuto:'A safety snapshot is saved in the app, and the items stay recoverable.',taxDelTitle:'Delete this item?',taxDelBody:'“{n}” is used by {c} question(s). They will be hidden from study, but their answers and history are kept. You can restore the item later.',taxRename:'Rename',taxHidden:'Hidden',addQ:'Add question',fromText:'From text',fromImages:'From images',stem:'Question text',optionN:'Option',addOpt:'+ Option',answerKey:'Correct answer',explanation:'Explanation',qImage:'Question image',aImage:'Answer / explanation image',preview:'Preview',saved:'Saved',saveFail:'Could not save',impTitle:'Import questions',impFile:'Spreadsheet or JSON',impPack:'Image pack',impPick:'Choose a file (CSV, JSON or Excel)',impCols:'Columns: question, a, b, c, d, e, answer, explanation — optional: part, source, year, branch, chapter',defaults:'Used when a row has no value:',valid:'Valid',dup:'Duplicate',err:'Error',rows:'rows',willCreate:'will be created',confirmImp:'Import {n} questions',summary:'Import summary',added:'Added',skipped:'Skipped',errorsN:'With errors',dlErrors:'Download errors',fileInvalid:'Could not read this file',editQ:'Edit question',changeImg:'Replace image (optional)',classif:'Classification',nOpts:'Options',noLog:'No activity yet.',logLocal:'Activity is stored on this device only. Run the optional activity-log SQL to sync it.',lang:'Language',appearance:'Appearance',auto:'Auto',light:'Light',dark:'Dark',pageSize:'Page size',defaults2:'Study defaults',defPart:'Default part',defSrc:'Default source',pin:'Deletion PIN',pinSet:'PIN is set',pinUnset:'No PIN yet',setPin:'Set PIN',changePin:'Change PIN',removePin:'Remove PIN',offline:'Offline — download by branch',download:'Download',remove:'Remove',notDl:'Not downloaded',onDevice:'On device ✓',partial:'Partial',offNote:'Images are stored on this device only when you press Download. Remove deletes them from this device only.',backup:'Backup & recovery',expP:'Export my progress',impP:'Import progress (merge)',expB:'Export question bank (metadata)',syncNow:'Retry sync',account:'Account',signOut:'Sign out',refresh:'Refresh data',demoBanner:'Demo mode — sample data, nothing is saved',signIn:'Sign in',email:'Email',password:'Password',forgot:'Forgot password',tryDemo:'Try the demo',resetSent:'Reset link sent',offlineMode:'Offline — using saved data',pending:'pending',synced:'Synced',syncing:'Syncing',offlineS:'Offline',num:'#',files:'files',pairs:'questions',newQ:'New',dupQ:'Already in library',noAns:'No answer image',startImp:'Import now',picked:'Selected',movedOk:'Updated',trashed:'Moved to Trash',restored:'Restored',impBlocked:'Nothing valid to import',classWhere:'Classification for new questions',apply:'Apply',moveTitle:'Move selected questions',keep:'Keep as is',weakest:'Needs attention',streak:'Today',todayN:'answered today',snaps:'Safety snapshots',snapNote:'Saved automatically before bulk deletes and moves (last 5). Undo puts the questions back.',undo:'Undo',sources:'Sources',trashQ:'Questions',trashT:'Divisions',addTax:'Add division',whereAdd:'Where to add',namesHint:'one name per line',name:'Name',year:'Year (optional)',dlAll:'Download all',taxEmpty:'Nothing here yet.',taxSearch:'Search…',default:'Default',defBr:'Default branch',defNote:'Used in Study, Progress, Library and when adding questions.',exists:'Already exists',addedN:'Added {n}',taxTrashNote:'Deleted divisions keep their questions and history. Restore anytime.',purge:'Delete forever',purgeTitle:'Delete permanently?',purgeBody:'{n} question(s) will be erased for good, with their images and answer history ({h} with history). This cannot be undone.',purged:'Deleted permanently',snapEmpty:'No snapshots yet.'},
ar:{study:'الدراسة',progress:'التقدم',library:'المكتبة',settings:'الإعدادات',part:'الجزء',allSources:'كل المصادر',source:'المصدر',branch:'التخصص',chapter:'الموضوع',branches:'التخصصات',chapters:'المواضيع',allChapters:'كل المواضيع (مختلطة)',unclassified:'بدون موضوع',cont:'تابع من حيث توقفت',start:'ابدأ',all:'الكل',unanswered:'لم تُحل',incorrect:'الخاطئة',marked:'المعلّمة',correct:'صحيح',qs:'سؤال',answered:'تمت الإجابة',accuracy:'الدقة',overall:'التقدم العام',question:'السؤال',check:'تحقق من الإجابة',next:'التالي',prev:'السابق',finish:'إنهاء',reattempt:'أعد المحاولة',mark:'علّم للمراجعة',unmark:'معلّم للمراجعة',pickFirst:'اختر إجابة أولاً',attempts:'المحاولات',history:'سجل المحاولات',noKey:'لم تُحدد الإجابة الصحيحة',answerIs:'الإجابة الصحيحة',back:'رجوع',jump:'انتقل إلى سؤال',empty:'لا توجد أسئلة هنا بعد.',emptyHint:'افتح المكتبة لإضافة الأسئلة.',done:'المنجز',left:'المتبقي',recent:'آخر المحاولات',wrongList:'الأسئلة الخاطئة',markedList:'المعلّمة للمراجعة',none:'لا يوجد',open:'فتح',retry:'إعادة',branchWord:'التخصص',search:'ابحث برقم السؤال أو التخصص أو الموضوع أو المصدر…',tabQ:'الأسئلة',tabTrash:'المحذوفات',tabTax:'التقسيمات',tabDl:'التحميلات',tabLog:'السجل',add:'إضافة',importQ:'استيراد',edit:'تعديل',del:'حذف',restore:'استعادة',moveSel:'نقل',selected:'محدد',selectAll:'تحديد الكل',clear:'مسح',noMatch:'لا توجد أسئلة مطابقة',showMore:'عرض المزيد',any:'الكل',state:'الحالة',trashEmpty:'سلة المحذوفات فارغة.',trashNote:'تبقى الأسئلة المحذوفة هنا مع سجل إجاباتها، ولا يُمحى شيء نهائياً.',cancel:'إلغاء',confirm:'تأكيد',save:'حفظ',close:'إغلاق',delTitle:'نقل إلى المحذوفات؟',delBody:'سيتم نقل {n} سؤال إلى سلة المحذوفات. لا يُحذف سجل الإجابات أبداً (منها {h} لها سجل).',moveTrash:'نقل إلى المحذوفات',pinNeeded:'رمز الحذف',enterPin:'أدخل الرمز السري',newPin:'رمز جديد (٤ خانات فأكثر)',confirmPin:'أعد إدخال الرمز',createPinMsg:'أنشئ رمزاً سرياً لحماية عمليات الحذف، ويمكنك تغييره من الإعدادات.',wrongPin:'الرمز غير صحيح',pinShort:'يجب ألا يقل الرمز عن ٤ خانات',pinMismatch:'الرمزان غير متطابقين',backupAuto:'تُحفظ نسخة أمان داخل التطبيق، وتبقى العناصر قابلة للاسترجاع.',taxDelTitle:'حذف هذا العنصر؟',taxDelBody:'«{n}» مرتبط بـ {c} سؤال. ستختفي من الدراسة لكن إجاباتك وسجلك يبقيان محفوظين، ويمكن استعادة العنصر لاحقاً.',taxRename:'إعادة تسمية',taxHidden:'مخفي',addQ:'إضافة سؤال',fromText:'من نص',fromImages:'من صور',stem:'نص السؤال',optionN:'الخيار',addOpt:'+ خيار',answerKey:'الإجابة الصحيحة',explanation:'التفسير',qImage:'صورة السؤال',aImage:'صورة الإجابة / التفسير',preview:'معاينة',saved:'تم الحفظ',saveFail:'تعذر الحفظ',impTitle:'استيراد الأسئلة',impFile:'جدول أو JSON',impPack:'حزمة صور',impPick:'اختر ملفاً (CSV أو JSON أو Excel)',impCols:'الأعمدة: question، a، b، c، d، e، answer، explanation — واختيارياً: part، source، year، branch، chapter',defaults:'تُستخدم عند غياب القيمة في الصف:',valid:'صالح',dup:'مكرر',err:'خطأ',rows:'صف',willCreate:'سيُنشأ',confirmImp:'استيراد {n} سؤال',summary:'ملخص الاستيراد',added:'أُضيف',skipped:'تم تخطيه',errorsN:'فيه أخطاء',dlErrors:'تنزيل الأخطاء',fileInvalid:'تعذرت قراءة هذا الملف',editQ:'تعديل السؤال',changeImg:'استبدال الصورة (اختياري)',classif:'التصنيف',nOpts:'عدد الخيارات',noLog:'لا يوجد نشاط بعد.',logLocal:'السجل محفوظ على هذا الجهاز فقط. شغّل ملف SQL الاختياري لمزامنته.',lang:'اللغة',appearance:'المظهر',auto:'تلقائي',light:'فاتح',dark:'داكن',pageSize:'حجم الصفحة',defaults2:'الإعدادات الافتراضية',defPart:'الجزء الافتراضي',defSrc:'المصدر الافتراضي',pin:'رمز الحذف',pinSet:'الرمز مُفعّل',pinUnset:'لم يُعيَّن رمز بعد',setPin:'تعيين رمز',changePin:'تغيير الرمز',removePin:'إزالة الرمز',offline:'بدون إنترنت — تنزيل حسب التخصص',download:'تنزيل',remove:'إزالة',notDl:'غير منزّل',onDevice:'على الجهاز ✓',partial:'جزئي',offNote:'لا تُحفظ الصور على هذا الجهاز إلا عند الضغط على تنزيل، والإزالة تحذفها من الجهاز فقط.',backup:'النسخ الاحتياطي والاستعادة',expP:'تصدير تقدمي',impP:'استيراد التقدم (دمج)',expB:'تصدير بنك الأسئلة (بيانات وصفية)',syncNow:'أعد المزامنة',account:'الحساب',signOut:'تسجيل الخروج',refresh:'تحديث البيانات',demoBanner:'وضع تجريبي — بيانات نموذجية ولا يُحفظ شيء',signIn:'تسجيل الدخول',email:'البريد الإلكتروني',password:'كلمة المرور',forgot:'نسيت كلمة المرور',tryDemo:'جرّب النسخة التجريبية',resetSent:'أُرسل رابط الاستعادة',offlineMode:'بدون إنترنت — نعرض البيانات المحفوظة',pending:'معلّق',synced:'تمت المزامنة',syncing:'جارٍ المزامنة',offlineS:'بدون إنترنت',num:'رقم',files:'ملف',pairs:'سؤال',newQ:'جديد',dupQ:'موجود في المكتبة',noAns:'بدون صورة إجابة',startImp:'ابدأ الاستيراد',picked:'المحدد',movedOk:'تم التحديث',trashed:'نُقل إلى المحذوفات',restored:'تمت الاستعادة',impBlocked:'لا يوجد ما يمكن استيراده',classWhere:'تصنيف الأسئلة الجديدة',apply:'تطبيق',moveTitle:'نقل الأسئلة المحددة',keep:'بدون تغيير',weakest:'يحتاج اهتماماً',streak:'اليوم',todayN:'سؤال اليوم',snaps:'نسخ الأمان',snapNote:'تُحفظ تلقائياً قبل الحذف والنقل الجماعي (آخر ٥). التراجع يعيد الأسئلة كما كانت.',undo:'تراجع',sources:'المصادر',trashQ:'الأسئلة',trashT:'التقسيمات',addTax:'إضافة تقسيم',whereAdd:'مكان الإضافة',namesHint:'اسم واحد في كل سطر',name:'الاسم',year:'السنة (اختياري)',dlAll:'تنزيل الكل',taxEmpty:'لا يوجد شيء هنا بعد.',taxSearch:'ابحث…',default:'افتراضي',defBr:'التخصص الافتراضي',defNote:'يُطبَّق في الدراسة والتقدم والمكتبة وعند إضافة الأسئلة.',exists:'موجود مسبقاً',addedN:'أُضيف {n}',taxTrashNote:'تبقى أسئلة وسجل التقسيمات المحذوفة محفوظة، ويمكن استعادتها في أي وقت.',purge:'حذف نهائي',purgeTitle:'حذف نهائي؟',purgeBody:'سيتم حذف {n} سؤال نهائياً مع صورها وسجل إجاباتها (منها {h} لها سجل). لا يمكن التراجع عن هذا.',purged:'تم الحذف نهائياً',snapEmpty:'لا توجد نسخ بعد.'}};
const t=k=>(T[S.lang]&&T[S.lang][k])||T.en[k]||k,tf=(k,o)=>t(k).replace(/\{(\w+)\}/g,(_,x)=>o[x]);
/* ================= state ================= */
let R={sources:[],branches:[],chapters:[]},Q=[],QA=[],A={},M=new Set(),ME={},cur={},QU=LS.get('queue2',[]),urlc={},hist={},qMap={},ACT=true,actLog=[];
let S={lang:LS.get('lang')||((navigator.language||'').startsWith('ar')?'ar':'en'),theme:'auto',zoom:100,dpart:1,dsrc:'',dbr:'',pin:null,page:'study',part:1,src:'all',br:null,kind:'all',sess:LS.get('sess2',null),nav:false,rail:LS.get('rail',null)===null?innerWidth<1200:!!LS.get('rail',null),
 lib:{tab:'q',q:'',src:'',br:'',ch:'',st:'',sel:new Set(),n:60,tt:'q',tk:'src',tq:''},sheet:null,dlg:null,prog:{tab:'wrong'}};
const toast=m=>{const e=$('#toast');e.innerHTML=`<div class=tt>${esc(m)}</div>`;clearTimeout(toast.t);toast.t=setTimeout(()=>e.innerHTML='',3200)};
const label=s=>s?s.name+(s.year?' '+s.year:''):'';
const byId=(a,id)=>a.find(x=>x.id===id),bn=id=>(byId(R.branches,id)||{}).name||'',cn=id=>(byId(R.chapters,id)||{}).name||'',sn=id=>label(byId(R.sources,id));
const srcs=()=>[...R.sources].sort((a,b)=>(b.year??-1)-(a.year??-1)||a.sort_order-b.sort_order);
const sOrder=()=>{const m={};srcs().forEach((s,i)=>m[s.id]=i);return m};
/* one-time migration: unsynced answers/marks queued by the previous version are kept, never lost */
(()=>{const o=LS.get('queue',[]);if(Array.isArray(o)&&o.length){QU=[...QU,...o.filter(x=>x.k==='att'||x.k==='mark')];LS.set('queue2',QU);LS.set('queue',[])}})();
/* ================= sync queue ================= */
const saveQ=()=>{LS.set('queue2',QU);badge()};
function enqueue(o){if(o.k==='pos'||o.k==='set')QU=QU.filter(x=>x.k!==o.k);QU.push(o);saveQ();flush()}
let flushing=false;
async function flush(){if(flushing||!QU.length||!navigator.onLine)return;flushing=true;
try{while(QU.length){const o=QU[0];let r;
if(o.k==='att')r=await sb.from('attempts').upsert(o.row,{onConflict:'id',ignoreDuplicates:true});
else if(o.k==='mark')r=await sb.rpc('set_mark',{p_question:o.q,p_marked:o.m,p_at:o.at});
else if(o.k==='set')r=await sb.rpc('save_settings',{p_settings:o.s,p_at:o.at});
else if(o.k==='pos')r=await sb.rpc('save_position',{p_position:o.p,p_at:o.at});
if(r.error){if(String(r.error.code||'').startsWith('23'))QU.shift();else break}else QU.shift();LS.set('queue2',QU)}}catch(e){}finally{flushing=false;saveQ()}}
const badge=()=>{const b=$('#sy');if(b){b.textContent=!navigator.onLine?t('offlineS')+(QU.length?` · ${QU.length} ${t('pending')}`:''):QU.length?`${t('syncing')} ${QU.length}…`:t('synced')+' ✓';b.className='sy'+(!navigator.onLine||QU.length?' w':'')}};
addEventListener('online',()=>{flush();badge()});addEventListener('offline',badge);
const savePos=()=>{LS.set('sess2',S.sess);clearTimeout(savePos.t);savePos.t=setTimeout(()=>{if(S.sess)enqueue({k:'pos',p:{part:S.sess.part,src:S.sess.src,br:S.sess.br,ch:S.sess.ch,kind:S.sess.kind,idx:S.sess.idx},at:new Date().toISOString()})},1500)};
const saveSet=()=>{const base={...(ME.settings||{})};Object.assign(base,{dark:S.theme==='dark',zoom:S.zoom,default_part:S.dpart,default_source:S.dsrc||null,default_branch:S.dbr||null,lang:S.lang,theme:S.theme,pin:S.pin});ME.settings=base;LS.set('lang',S.lang);enqueue({k:'set',s:base,at:new Date().toISOString()})};
/* ================= activity log ================= */
function log(action,entity,details){const e={action,entity,details:details||{},at:new Date().toISOString()};const l=LS.get('log2',[]);l.unshift(e);LS.set('log2',l.slice(0,300));
 if(ACT)sb.from('activity_log').insert({action,entity,details:details||{}}).then(r=>{if(r&&r.error)ACT=false})}
/* ================= auth & data ================= */
function loginView(msg){$('#nav').innerHTML='';$('#app').innerHTML=`<div class=lg><div class=brand>MRCP <span>Prep</span></div><h1>${t('signIn')}</h1><input type=email id=em placeholder="${t('email')}" autocomplete=username><input type=password id=pw placeholder="${t('password')}" autocomplete=current-password><button class="btn p" data-a=login>${t('signIn')}</button><button class="btn g" data-a=forgot>${t('forgot')}</button><button class="btn g" data-a=demo>${t('tryDemo')}</button><p class=t>${esc(msg||'')}</p><p class=t><button class=lk data-a=lang data-v=${S.lang==='ar'?'en':'ar'}>${S.lang==='ar'?'English':'العربية'}</button></p></div>`}
async function boot(){applyUI();let session;try{const r=await Promise.race([sb.auth.getSession(),new Promise((_,no)=>setTimeout(()=>no(Error('auth timeout')),6000))]);session=r.data.session}catch(e){const d=LS.get('cache2');if(d){apply(d);render();return toast(t('offlineMode'))}return loginView(String(e.message||e))}
if(!session){const d=LS.get('cache2');if(!navigator.onLine&&d){apply(d);render();return toast(t('offlineMode'))}return loginView()}
const cached=LS.get('cache2');
if(cached){apply(cached);render();flush();load().then(ch=>{if(ch)render()}).catch(()=>{})}
else{try{await load()}catch(e){return loginView('Could not load data: '+(e.message||e))}render();flush()}}
sb.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT')loginView()});
function apply(d){R=d.R;QA=d.QA;A={};d.A.forEach(a=>A[a.question_id]={sel:a.selected,ok:a.is_correct,at:a.answered_at});M=new Set(d.M);ME=d.ME||{};
const ok=q=>R.sources.some(x=>x.id===q.source_id)&&R.branches.some(x=>x.id===q.branch_id);Q=QA.filter(q=>q.status==='published'&&ok(q));qMap={};QA.forEach(q=>qMap[q.id]=q);
QU.forEach(o=>{if(o.k==='att'){const q=qMap[o.row.question_id];A[o.row.question_id]={sel:o.row.selected,ok:q&&q.correct_option?o.row.selected===q.correct_option:null,at:o.row.answered_at}}if(o.k==='mark')o.m?M.add(o.q):M.delete(o.q)});
const st=ME.settings||{};if(!QU.some(o=>o.k==='set')){S.theme=st.theme||(st.dark?'dark':'auto');S.zoom=st.zoom||100;S.dpart=st.default_part||1;S.dsrc=st.default_source||'';S.dbr=st.default_branch||'';S.pin=st.pin||null;if(st.lang)S.lang=st.lang}
if(!apply.done){S.part=S.dpart;S.src=S.dsrc||'all';S.br=S.dbr||null;S.lib.src=S.dsrc;S.lib.br=S.dbr;if(!S.dsrc&&S.sess&&S.sess.part){S.part=S.sess.part;S.src=S.sess.src}apply.done=1}fixSel();applyUI()}
function fixSel(){const hs=id=>R.sources.some(x=>x.id===id),hb=id=>R.branches.some(x=>x.id===id);if(S.dsrc&&!hs(S.dsrc))S.dsrc='';if(S.dbr&&!hb(S.dbr))S.dbr='';if(S.src!=='all'&&!hs(S.src))S.src=S.dsrc||'all';if(S.br&&!hb(S.br))S.br=null;if(S.lib.src&&!hs(S.lib.src))S.lib.src=S.dsrc;if(S.lib.br&&!hb(S.lib.br))S.lib.br=S.dbr;if(S.lib.ch&&S.lib.ch!=='-'&&!R.chapters.some(x=>x.id===S.lib.ch))S.lib.ch=''}
async function load(){try{
const[s,b,c,qs,at,mk,pf]=await Promise.all([sb.from('sources').select('*').is('deleted_at',null),sb.from('branches').select('*').is('deleted_at',null).order('sort_order'),sb.from('chapters').select('*').is('deleted_at',null).order('sort_order'),
fetchAll(()=>sb.from('questions').select('id,part,source_id,branch_id,chapter_id,position,n_options,correct_option,question_img,answer_img,status').order('position').order('id')),
fetchAll(()=>sb.from('latest_attempts').select('question_id,selected,is_correct,answered_at').order('question_id')),
fetchAll(()=>sb.from('question_state').select('question_id').eq('marked',true).order('question_id')),sb.from('profiles').select('*').single()]);
for(const x of[s,b,c,pf])if(x.error)throw x.error;
const d={R:{sources:s.data,branches:b.data,chapters:c.data},QA:qs,A:at,M:mk.map(x=>x.question_id),ME:pf.data},str=JSON.stringify(d),changed=str!==localStorage.getItem('cache2');try{localStorage.setItem('cache2',str)}catch(e){}apply(d);return changed}
catch(e){const d=LS.get('cache2');if(!d)throw e;apply(d);toast(t('offlineMode'));return true}}
function applyUI(){document.body.classList.toggle('rail',S.rail);const dk=S.theme==='dark'||(S.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.body.classList.toggle('dark',dk);LS.set('theme2',S.theme);const mc=document.querySelector('meta[name=theme-color]');if(mc)mc.content=dk?'#0b0b0d':'#ffffff';document.documentElement.style.background=dk?'#0b0b0d':'#ffffff';document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==='ar'?'rtl':'ltr'}
let HASH=null;async function hashes(){if(!HASH){const r=await fetchAll(()=>sb.from('questions').select('id,content_hash').order('id'));HASH=new Set(r.map(x=>x.content_hash).filter(Boolean))}return HASH}
/* ================= helpers ================= */
const stat=L=>{const a=L.filter(q=>A[q.id]&&A[q.id].ok!=null),c=a.filter(q=>A[q.id].ok).length;return{n:a.length,c,w:a.length-c,pct:a.length?Math.round(c/a.length*100):0,tot:L.length,prog:L.length?Math.round(a.length/L.length*100):0}};
const base=()=>Q.filter(q=>q.part===S.part&&(S.src==='all'||q.source_id===S.src));
const kindOf=(q,k)=>k==='all'||(k==='unanswered'&&!A[q.id])||(k==='wrong'&&A[q.id]&&A[q.id].ok===false)||(k==='marked'&&M.has(q.id));
const letters=q=>'ABCDEFGH'.slice(0,q.n_options||5).split('');
const IC={home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',lib:'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',cog:'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',flag:'M5 21V4h11l-1.5 4L16 12H5',check:'M5 12l5 5 9-10',x:'M6 6l12 12M18 6L6 18',plus:'M12 5v14M5 12h14',trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',chev:'M9 6l6 6-6 6',back:'M15 6l-6 6 6 6',grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',edit:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',up:'M12 16V4M7 9l5-5 5 5M4 20h16',undo:'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z',more:'M5 12h.01M12 12h.01M19 12h.01',menu:'M4 6h16M4 12h16M4 18h16',down:'M12 4v12M7 11l5 5 5-5M4 20h16'};
const ic=(n,s=20)=>`<svg width=${s} height=${s} viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=1.9 stroke-linecap=round stroke-linejoin=round aria-hidden=true><path d="${IC[n]}"/></svg>`;
const ring=(p,sz=84)=>{const r=sz/2-7,c=2*Math.PI*r;return`<svg width=${sz} height=${sz} viewBox="0 0 ${sz} ${sz}" class=ring><circle cx=${sz/2} cy=${sz/2} r=${r} fill=none stroke="var(--ln)" stroke-width=7 /><circle cx=${sz/2} cy=${sz/2} r=${r} fill=none stroke="var(--ac)" stroke-width=7 stroke-linecap=round stroke-dasharray="${c*p/100} ${c}" transform="rotate(-90 ${sz/2} ${sz/2})"/><text x=50% y=50% text-anchor=middle dominant-baseline=central font-size=${sz/4.2} font-weight=700 fill="var(--tx)">${p}%</text></svg>`};
const sig={};
function primeUrls(paths,warm){const need=[...new Set(paths.filter(p=>p&&!sig[p]&&!urlc[p]))].slice(0,40);if(need.length&&navigator.onLine){const pr=sb.storage.from(CF.bucket).createSignedUrls(need,21600).then(r=>{const m={};((r&&r.data)||[]).forEach(d=>{if(d.signedUrl)m[d.path]=d.signedUrl});return m}).catch(()=>({}));need.forEach(x=>{sig[x]=pr.then(m=>m[x]||'')})}
 (warm||[]).forEach(p=>{if(sig[p])sig[p].then(u=>{if(u){const i=new Image();i.src=u}})})}
function img(path){if(!path)return Promise.resolve('');if(urlc[path])return urlc[path];
return urlc[path]=(async()=>{try{const r=await(await caches.open('mrcp-img-v1')).match('https://img.cache/'+path);if(r)return URL.createObjectURL(await r.blob())}catch(e){}
if(!navigator.onLine)return'';if(sig[path]){const u=await sig[path];if(u)return u}const{data}=await sb.storage.from(CF.bucket).createSignedUrl(path,21600);return data?data.signedUrl:''})().then(u=>{if(!u)delete urlc[path];return u})}
async function hydrate(){for(const el of document.querySelectorAll('img[data-p]')){const u=await img(el.dataset.p);if(u)el.src=u;else el.alt='…'}}
/* ================= nav / shell ================= */
const flip=n=>`<span class=flip>${ic(n)}</span>`;
function navHtml(){const it=[['study','home'],['progress','chart'],['library','lib'],['settings','cog']];
return`<button class="ni tog" data-a=navtoggle aria-label="Menu">${ic('menu',22)}</button><div class=brand>MRCP <span>Prep</span></div>`+it.map(([k,i])=>`<button class="ni ${S.page===k||(k==='study'&&S.page==='practice')?'on':''}" data-a=page data-v=${k}>${ic(i,22)}<span>${t(k)}</span></button>`).join('')+`<span class=sp></span><span class=sy id=sy></span>`}
const demoChip=()=>DEMO?`<span class=chip>${t('demoBanner')}</span>`:'';
const ctl=()=>`<div class=ctl><div class=seg>${[1,2].map(p=>`<button class="${S.part===p?'on':''}" data-a=part data-v=${p}>${t('part')} ${p}</button>`).join('')}</div><select data-c=src aria-label="${t('source')}"><option value=all ${S.src==='all'?'selected':''}>${t('allSources')}</option>${srcs().map(s=>`<option value="${s.id}" ${S.src===s.id?'selected':''}>${esc(label(s))}</option>`).join('')}</select></div>`;
const bar_=(p,c)=>`<div class=bar2><i style="width:${p}%;${c?'background:'+c:''}"></i></div>`;
const accC=p=>p>=70?'var(--ok)':p>=50?'var(--am)':'var(--no)';
/* ================= study ================= */
const sessIds=()=>S.sess?S.sess.ids.filter(id=>qMap[id]&&qMap[id].status==='published'):[];
const sessTitle=()=>{const s=S.sess;if(!s)return'';const c=s.ch&&s.ch!=='*'&&s.ch!=='-'?cn(s.ch):bn(s.br);return c+(s.kind!=='all'?' · '+t({unanswered:'unanswered',wrong:'incorrect',marked:'marked'}[s.kind]):'')};
function vStudy(){const b=base(),st=stat(b);let h=`<header class=ph>${S.br?`<button class=ib data-a=brback aria-label="${t('back')}">${flip('back')}</button>`:''}<h1>${S.br?esc(bn(S.br)):t('study')}</h1>${demoChip()}</header>`+ctl();
if(!S.br){const ids=sessIds();
 if(ids.length&&S.sess.idx<ids.length)h+=`<button class="card cont" data-a=resume><div><small>${t('cont')}</small><b>${esc(sessTitle())}</b><span>${t('question')} ${S.sess.idx+1} / ${ids.length}</span></div>${flip('chev')}</button>`;
 if(!b.length)return h+`<div class=em><b>${t('empty')}</b><br>${t('emptyHint')}</div>`;
 h+=`<div class="card ovw">${ring(st.prog)}<div class=ovt><b>${t('overall')}</b><span>${st.n} / ${st.tot} ${t('answered')}</span><span style="color:${st.n?accC(st.pct):'var(--mu)'}">${st.n?st.pct+'% '+t('accuracy'):'—'}</span></div></div><h2>${t('branches')}</h2><div class=grid>`;
 R.branches.forEach(br=>{const l=b.filter(q=>q.branch_id===br.id);if(!l.length)return;const s=stat(l);h+=`<button class="card bc" data-a=br data-v=${br.id}><b>${esc(br.name)}</b><span class=t>${s.n} / ${s.tot} ${t('qs')}</span>${bar_(s.prog)}<span class=acc style="color:${s.n?accC(s.pct):'var(--mu)'}">${s.n?s.pct+'% '+t('accuracy'):'—'}</span></button>`});
 return h+'</div>'}
{const ids=sessIds();if(ids.length&&S.sess.idx<ids.length)h+=`<button class="card cont" data-a=resume><div><small>${t('cont')}</small><b>${esc(sessTitle())}</b><span>${t('question')} ${S.sess.idx+1} / ${ids.length}</span></div>${flip('chev')}</button>`}
const L=b.filter(q=>q.branch_id===S.br),cnt=k=>L.filter(q=>kindOf(q,k)).length;
h+=`<div class=chips>${['all','unanswered','wrong','marked'].map(k=>`<button class="chp ${S.kind===k?'on':''}" data-a=kind data-v=${k}>${t({all:'all',unanswered:'unanswered',wrong:'incorrect',marked:'marked'}[k])} <b>${cnt(k)}</b></button>`).join('')}</div><div class=list>`;
const row=(title,l,ch)=>{const s=stat(l),n=l.filter(q=>kindOf(q,S.kind)).length;return`<button class="row card" data-a=start data-v="${ch}" ${n?'':'disabled'}><div class=rt><b>${esc(title)}</b><span class=t>${s.n} / ${s.tot} · ${n} ${t('qs')}</span>${bar_(s.prog)}</div>${flip('chev')}</button>`};
h+=row(t('allChapters'),L,'*');
R.chapters.filter(c=>c.branch_id===S.br).forEach(c=>{const l=L.filter(q=>q.chapter_id===c.id);if(l.length)h+=row(c.name,l,c.id)});
const nc=L.filter(q=>!q.chapter_id);if(nc.length&&nc.length<L.length)h+=row(t('unclassified'),nc,'-');
return h+'</div>'}
function startSession(ch){const o=sOrder();let l=base().filter(q=>q.branch_id===S.br&&kindOf(q,S.kind));if(ch==='-')l=l.filter(q=>!q.chapter_id);else if(ch!=='*')l=l.filter(q=>q.chapter_id===ch);
if(!l.length)return toast(t('none'));l.sort((a,b)=>o[a.source_id]-o[b.source_id]||a.position-b.position);S.sess={part:S.part,src:S.src,br:S.br,ch,kind:S.kind,ids:l.map(q=>q.id),idx:0};S.page='practice';savePos()}
function openFrom(ids,id){S.sess={part:S.part,src:S.src,br:(qMap[id]||{}).branch_id,ch:'*',kind:'all',ids,idx:Math.max(0,ids.indexOf(id))};S.page='practice';savePos()}
/* ================= practice ================= */
const stOf=q=>{const c=cur[q.id],a=A[q.id];return c?{sel:c.sel,rev:false}:a?{sel:a.sel,rev:true}:{sel:null,rev:false}};
const when=d=>new Date(d).toLocaleDateString(S.lang==='ar'?'ar':'en-GB',{day:'numeric',month:'short'});
function loadHist(id){sb.from('attempts').select('selected,is_correct,answered_at').eq('question_id',id).order('answered_at',{ascending:false}).limit(8).then(r=>{if(r&&!r.error){hist[id]=r.data;if(S.page==='practice')render()}})}
function vPractice(){const ids=sessIds();if(!ids.length){S.page='study';return vStudy()}const se=S.sess;if(se.idx>=ids.length)se.idx=ids.length-1;
const q=qMap[ids[se.idx]],s=stOf(q),a=A[q.id],last=se.idx===ids.length-1,chapMode=se.ch&&se.ch!=='*'&&se.ch!=='-';
let h=`<div class=ph2><button class=ib data-a=exit aria-label="${t('back')}">${flip('back')}</button><div class=ttl><b>${esc(chapMode?cn(se.ch):bn(se.br))}</b><small>${t('question')} ${se.idx+1} / ${ids.length}</small></div><button class="ib ${M.has(q.id)?'fl':''}" data-a=mark aria-label="${t('mark')}" title="${t('mark')}">${ic('flag')}</button><button class=ib data-a=navsheet aria-label="${t('jump')}">${ic('grid')}</button></div>${bar_(Math.round((se.idx+1)/ids.length*100))}`;
h+=`<div class=qcard><img class=qi data-p="${esc(q.question_img)}" alt=""></div><div class=ops>${letters(q).map(l=>`<button class="op ${s.sel===l?'sel':''} ${s.rev&&q.correct_option===l?'good':''} ${s.rev&&s.sel===l&&q.correct_option&&q.correct_option!==l?'bad':''}" data-a=sel data-v=${l} ${s.rev?'disabled':''}>${l}</button>`).join('')}</div>`;
if(s.rev){h+=`<div class="res ${a.ok?'g':a.ok===false?'r':''}">${a.ok?ic('check',20)+' '+t('correct'):a.ok===false?ic('x',20)+' '+t('incorrect'):t('noKey')}${q.correct_option?` <span>· ${t('answerIs')}: <b>${q.correct_option}</b></span>`:''}</div>`;
 if(q.answer_img)h+=`<div class=qcard><img class=qi data-p="${esc(q.answer_img)}" alt=""></div>`;
 if(!hist[q.id])loadHist(q.id);const hh=hist[q.id]||[];
 h+=`<div class=card><div class=row2><b>${t('history')}</b><button class="btn s g" data-a=retry data-v=${q.id}>${ic('undo',16)} ${t('reattempt')}</button></div><div class=hist>${hh.length?hh.map(x=>`<span class="hp ${x.is_correct?'ok':x.is_correct===false?'no':''}">${x.is_correct?'✓':x.is_correct===false?'✗':'•'} ${x.selected} <small>${when(x.answered_at)}</small></span>`).join(''):`<span class=t>${t('attempts')}: 1</span>`}</div></div>`}
return h}
/* ================= progress ================= */
function vProgress(){const b=base(),st=stat(b);let h=`<header class=ph><h1>${t('progress')}</h1>${demoChip()}</header>`+ctl();
h+=`<div class="card ovw">${ring(st.prog)}<div class=ovt><b>${t('overall')}</b><span>${st.n} / ${st.tot} ${t('answered')}</span><span style="color:${st.n?accC(st.pct):'var(--mu)'}">${st.n?st.pct+'% '+t('accuracy'):'—'}</span></div></div><h2>${t('branches')}</h2><div class=card>`;
R.branches.forEach(br=>{const l=b.filter(q=>q.branch_id===br.id);if(!l.length)return;const s=stat(l);h+=`<button class=prow data-a=br data-v=${br.id}><span>${esc(br.name)}</span>${bar_(s.prog,s.n?accC(s.pct):null)}<b>${s.n?s.pct+'%':'—'}</b><small>${s.n}/${s.tot}</small></button>`});
const W=b.filter(q=>A[q.id]&&A[q.id].ok===false),K=b.filter(q=>M.has(q.id)),tab=S.prog.tab;
h+=`</div><div class=chips>${[['wrong',t('incorrect'),W.length],['marked',t('marked'),K.length],['recent',t('recent'),'']].map(([k,l,n])=>`<button class="chp ${tab===k?'on':''}" data-a=ptab data-v=${k}>${l} <b>${n}</b></button>`).join('')}</div>`;
const item=(q,l)=>`<div class="rw"><span><b>${esc(bn(q.branch_id))}</b> · #${q.position}<small>${esc(sn(q.source_id))}${cn(q.chapter_id)?' · '+esc(cn(q.chapter_id)):''}</small></span><span class=f2><button class="btn s g" data-a=openl data-v=${q.id} data-l="${tab}">${t('open')}</button></span></div>`;
if(tab==='recent'){if(!S.recent){sb.from('attempts').select('question_id,selected,is_correct,answered_at').order('answered_at',{ascending:false}).limit(60).then(r=>{if(r&&!r.error){S.recent=r.data;render()}});h+=`<div class=em>…</div>`}
 else h+=`<div class=card>${S.recent.filter(x=>qMap[x.question_id]).map(x=>{const q=qMap[x.question_id];return`<button class=prow data-a=openl data-v=${q.id} data-l=recent><span>${x.is_correct?'<b style="color:var(--ok)">✓</b>':'<b style="color:var(--no)">✗</b>'} ${esc(bn(q.branch_id))} · #${q.position}</span><small>${x.selected} · ${when(x.answered_at)}</small></button>`}).join('')||`<span class=t>${t('none')}</span>`}</div>`}
else h+=(tab==='wrong'?W:K).map(item).join('')||`<div class=em>${t('none')}</div>`;
return h}
function openList(tab,id){const b=base(),ids=(tab==='wrong'?b.filter(q=>A[q.id]&&A[q.id].ok===false):tab==='marked'?b.filter(q=>M.has(q.id)):[qMap[id]]).map(q=>q.id);openFrom(ids,id)}
function bottomBar(){if(S.page==='practice'){const ids=sessIds();if(!ids.length)return'';const se=S.sess,q=qMap[ids[se.idx]];if(!q)return'';const s=stOf(q),last=se.idx===ids.length-1;
 return`<div class=abar><button class="btn g ic" data-a=prev ${se.idx?'':'disabled'} aria-label="${t('prev')}">${flip('back')}</button><button class="btn p grow" data-a=${s.rev?'next':'ans'}>${s.rev?(last?t('finish'):t('next')):t('check')}</button><button class="btn g ic" data-a=skip ${last?'disabled':''} aria-label="${t('next')}">${flip('chev')}</button></div>`}
 if(S.page==='library'&&S.lib.sel.size&&(S.lib.tab==='q'||S.lib.tab==='trash')){const trash=S.lib.tab==='trash';return`<div class=abar><div class=selbar><b>${S.lib.sel.size} ${t('selected')}</b>${trash?`<button class="btn s a" data-a=lresel>${t('restore')}</button><button class="btn s d" data-a=lpurgesel>${t('purge')}</button>`:`<button class="btn s g" data-a=lmove>${t('moveSel')}</button><button class="btn s d" data-a=ldelsel>${t('del')}</button>`}<button class="btn s g" data-a=lclear>${t('clear')}</button></div></div>`}return''}
/* ================= render ================= */
function render(){document.body.classList.remove('abhide');document.body.dataset.page=S.page;if($('#nav').firstChild||S.page)$('#nav').innerHTML=navHtml();$('#app').style.zoom=S.zoom/100;
const v={study:vStudy,practice:vPractice,progress:vProgress,library:vLibrary,settings:vSettings}[S.page]||vStudy;$("#app").innerHTML=v();$("#abar").innerHTML=bottomBar();if(S.page==='practice'){const ids=sessIds(),i=S.sess.idx,w=ids.slice(i,i+6).map(x=>qMap[x]).filter(Boolean);primeUrls(w.flatMap(q=>[q.question_img,q.answer_img]),w.slice(1,3).map(q=>q.question_img))}hydrate();badge();if(S.page==='settings'||(S.page==='library'&&S.lib.tab==='dl'))afterSettings()}
/* ================= dialogs (PIN protected confirmations) ================= */
function dialog(o){return new Promise(res=>{S.dlg={...o,res};drawDlg();setTimeout(()=>{const i=$('#pin1');if(i)i.focus()},60)})}
function drawDlg(){const d=S.dlg,el=$('#modal');if(!d){el.innerHTML='';return}const need=d.pin&&!S.pin;
el.innerHTML=`<div class=ov><div class=dlg role=dialog aria-modal=true><h3>${esc(d.title)}</h3><div class=dm>${d.body||''}</div>${d.pin?`<div class=pinw>${need?`<p class=t>${t('createPinMsg')}</p><input id=pin1 type=password inputmode=numeric autocomplete=off placeholder="${t('newPin')}"><input id=pin2 type=password inputmode=numeric autocomplete=off placeholder="${t('confirmPin')}">`:`<input id=pin1 type=password inputmode=numeric autocomplete=off placeholder="${t('enterPin')}">`}</div>`:''}<p class=err id=dlgerr></p><div class=dac><button class="btn g" data-a=dno>${t('cancel')}</button><button class="btn ${d.danger?'d':'a'}" data-a=dyes>${esc(d.ok||t('confirm'))}</button></div></div></div>`}
const dErr=m=>{$('#dlgerr').textContent=m};
async function setPin(p){const salt=uid();S.pin={salt,hash:await sha(salt+':'+p)};saveSet()}
const checkPin=async p=>S.pin&&(await sha(S.pin.salt+':'+p))===S.pin.hash;
async function dyes(){const d=S.dlg;if(!d)return;if(d.pin){const a=($('#pin1')||{}).value||'';if(!S.pin){const b=$('#pin2').value;if(a.length<4)return dErr(t('pinShort'));if(a!==b)return dErr(t('pinMismatch'));await setPin(a)}else if(!(await checkPin(a)))return dErr(t('wrongPin'))}
 S.dlg=null;drawDlg();d.res(true)}
const dno=()=>{const d=S.dlg;S.dlg=null;drawDlg();if(d)d.res(false)};
/* ================= sheets ================= */
function openSheet(s){S.sheet=s;drawSheet()}
function closeSheet(){S.sheet=null;drawSheet()}
function drawSheet(){const s=S.sheet,el=$('#sheet');if(!s){el.innerHTML='';document.body.classList.remove('lock');return}document.body.classList.add('lock');
const body={nav:shNav,add:shAdd,edit:shEdit,imp:shImp,move:shMove,pv:shPv,tax:shTax}[s.type](s);
el.innerHTML=`<div class=ov2 data-a=sclose><div class=sh2 role=dialog aria-modal=true><div class=shh><b>${esc(body.title)}</b><button class=ib data-a=sclose aria-label="${t('close')}">${ic('x')}</button></div><div class=shb>${body.html}</div></div></div>`;
document.querySelectorAll('#sheet img[data-p]').forEach(async el=>{const u=await img(el.dataset.p);if(u)el.src=u});if(body.after)body.after()}
const opts_=(arr,v,f)=>arr.map(x=>`<option value="${x.id}" ${x.id===v?'selected':''}>${esc(f(x))}</option>`).join('');
function classSel(p){p=p||{};const br=p.br||S.dbr||(R.branches[0]||{}).id;return`<div class=fg><label>${t('part')}<select id=f_part>${[1,2].map(n=>`<option value=${n} ${(p.part||S.dpart||S.part)===n?'selected':''}>${t('part')} ${n}</option>`).join('')}</select></label><label>${t('source')}<select id=f_src>${opts_(srcs(),p.src||S.dsrc||(S.src!=='all'?S.src:(srcs()[0]||{}).id),label)}</select></label><label>${t('branch')}<select id=f_br data-c=fbr>${opts_(R.branches,br,x=>x.name)}</select></label><label>${t('chapter')}<select id=f_ch><option value="">${t('unclassified')}</option>${opts_(R.chapters.filter(c=>c.branch_id===br),p.ch,x=>x.name)}</select></label></div>`}
const readClass=()=>({part:+$('#f_part').value,source_id:$('#f_src').value,branch_id:$('#f_br').value,chapter_id:$('#f_ch').value||null});
function shNav(){const ids=sessIds(),se=S.sess;return{title:t('jump'),html:`<div class=nv>${ids.map((id,i)=>{const a=A[id]||{};return`<button class="nb ${a.ok===true?'ok':a.ok===false?'no':''} ${M.has(id)?'mk':''} ${i===se.idx?'on':''}" data-a=jump data-v=${i}>${i+1}</button>`}).join('')}</div>`}}
function shPv(s){return{title:t('preview'),html:`<img class=qi data-p="${esc(qMap[s.id].question_img)}" alt=""><img class=qi data-p="${esc(qMap[s.id].answer_img||'')}" alt="">`}}
/* ---- text -> image rendering (keeps the app image based, no schema change) ---- */
function wrapL(x,text,mw){const out=[];String(text).split('\n').forEach(p=>{if(!p.trim()){out.push('');return}let l='';p.split(/\s+/).forEach(w=>{const tt=l?l+' '+w:w;if(x.measureText(tt).width>mw&&l){out.push(l);l=w}else l=tt});out.push(l)});return out}
const F16='16px -apple-system,Helvetica,Arial,sans-serif';
function toBlob(c){return new Promise(r=>c.toBlob(b=>r(b),'image/webp',.85))}
async function drawQuestion(stem,opts,key,expl){const W=640,P=30,m=document.createElement('canvas').getContext('2d');m.font=F16;const sl=stem?wrapL(m,stem,W-2*P):[],ol=opts.map(o=>wrapL(m,o,W-140)),el=expl?wrapL(m,expl,W-2*P):[];
 const rowH=l=>Math.max(44,l.length*22+22);const mk=(withStem,hl,exp)=>{const H=P+(withStem?sl.length*24+20:0)+ol.reduce((a,l)=>a+rowH(l),0)+(exp?el.length*22+44:10)+10,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);x.font=F16;x.textBaseline='alphabetic';let y=P;
  if(withStem){x.fillStyle='#222';sl.forEach(l=>{x.fillText(l,P,y);y+=24});y+=14}
  ol.forEach((l,i)=>{const h=rowH(l),on=hl&&'ABCDEFGH'[i]===key;x.fillStyle=on?'#b6f18a':'#fff';x.strokeStyle='#e3e0ee';x.beginPath();x.roundRect?x.roundRect(70,y-14,540,h-8,8):x.rect(70,y-14,540,h-8);x.fill();x.stroke();
   x.fillStyle='#efebff';x.strokeStyle='#7451ed';x.lineWidth=2;x.beginPath();x.arc(42,y-14+(h-8)/2,13,0,7);x.fill();x.stroke();x.lineWidth=1;x.fillStyle='#7451ed';x.font='bold 13px Helvetica,Arial,sans-serif';x.textAlign='center';x.fillText('ABCDEFGH'[i],42,y-14+(h-8)/2+5);x.textAlign='left';
   x.font=F16;x.fillStyle='#222';l.forEach((s,j)=>x.fillText(s,86,y+3+j*22));y+=h});
  if(exp){y+=14;x.fillStyle='#222';x.font='bold 15px Helvetica,Arial,sans-serif';x.fillText(t('explanation'),P,y);x.font=F16;y+=26;el.forEach(l=>{x.fillText(l,P,y);y+=22})}return c};
 return{q:await toBlob(mk(true,false,false)),a:await toBlob(mk(false,true,true))}}
const ext=b=>b.type==='image/png'?'png':'webp';
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
async function insertQ(c,o){const id=uid(),qp=`${id}/q.${ext(o.qBlob)}`,ap=o.aBlob?`${id}/a.${ext(o.aBlob)}`:null;
 let r=await sb.storage.from(CF.bucket).upload(qp,o.qBlob,{contentType:o.qBlob.type||'image/webp'});if(r.error)throw r.error;
 if(ap){r=await sb.storage.from(CF.bucket).upload(ap,o.aBlob,{contentType:o.aBlob.type||'image/webp'});if(r.error)throw r.error}
 const pos=Math.max(0,...QA.filter(q=>q.part===c.part&&q.source_id===c.source_id&&q.branch_id===c.branch_id).map(q=>q.position))+1;
 const row={id,part:c.part,source_id:c.source_id,branch_id:c.branch_id,chapter_id:c.chapter_id,position:pos,n_options:o.n,correct_option:o.key||null,question_img:qp,answer_img:ap,content_hash:o.hash};
 r=await sb.from('questions').insert(row);if(r.error)throw r.error;QA.push({...row,status:'published',current_version:1});if(HASH&&o.hash)HASH.add(o.hash);return row}
/* ---- add one question ---- */
function shAdd(s){const txt=s.mode==='text';return{title:t('addQ'),html:`<div class=seg><button class="${txt?'on':''}" data-a=addmode data-v=text>${t('fromText')}</button><button class="${!txt?'on':''}" data-a=addmode data-v=img>${t('fromImages')}</button></div><h4>${t('classif')}</h4>${classSel()}`+
(txt?`<label class=fl>${t('stem')}<textarea id=a_stem rows=5></textarea></label><div id=a_opts>${[0,1,2,3,4].map(i=>`<label class=fl>${t('optionN')} ${'ABCDEFGH'[i]}<input type=text class=a_o></label>`).join('')}</div><div class=f2><button class="btn s g" data-a=addopt>${t('addOpt')}</button></div><div class=fg><label>${t('answerKey')}<select id=a_key>${'ABCDEFGH'.split('').map(l=>`<option>${l}</option>`).join('')}</select></label></div><label class=fl>${t('explanation')}<textarea id=a_exp rows=4></textarea></label><div class=f2><button class="btn g" data-a=addprev>${t('preview')}</button></div><div id=a_pv></div>`
:`<label class=fl>${t('qImage')}<input type=file id=a_qf accept="image/*"></label><label class=fl>${t('aImage')}<input type=file id=a_af accept="image/*"></label><div class=fg><label>${t('answerKey')}<select id=a_key>${'ABCDEFGH'.split('').map(l=>`<option>${l}</option>`).join('')}</select></label><label>${t('nOpts')}<select id=a_n>${[2,3,4,5,6,7,8].map(n=>`<option ${n===5?'selected':''}>${n}</option>`).join('')}</select></label></div>`)+
`<div class=dac><button class="btn g" data-a=sclose>${t('cancel')}</button><button class="btn a" data-a=addsave>${t('save')}</button></div><p class=err id=a_err></p>`}}
async function addPreview(){const o=[...document.querySelectorAll('.a_o')].map(i=>i.value.trim()).filter(Boolean);const r=await drawQuestion($('#a_stem').value.trim(),o,$('#a_key').value,$('#a_exp').value.trim());$('#a_pv').innerHTML=`<img class=qi src="${URL.createObjectURL(r.q)}" alt=""><img class=qi src="${URL.createObjectURL(r.a)}" alt="">`}
async function addSave(){const e=$('#a_err'),c=readClass();try{let qB,aB,n,key=$('#a_key').value,hash;
 if(S.sheet.mode==='text'){const stem=$('#a_stem').value.trim(),o=[...document.querySelectorAll('.a_o')].map(i=>i.value.trim()).filter(Boolean);if(stem.length<8)return e.textContent=t('stem');if(o.length<2)return e.textContent=t('optionN');if('ABCDEFGH'.indexOf(key)>=o.length)return e.textContent=t('answerKey');
  const r=await drawQuestion(stem,o,key,$('#a_exp').value.trim());qB=r.q;aB=r.a;n=o.length;hash=await sha(norm(stem)+'|'+o.map(norm).join('|'))}
 else{const f=$('#a_qf').files[0];if(!f)return e.textContent=t('qImage');qB=f;aB=$('#a_af').files[0]||null;n=+$('#a_n').value;hash=await sha(await f.arrayBuffer())}
 if((await hashes()).has(hash))return e.textContent=t('dupQ');
 const row=await insertQ(c,{qBlob:qB,aBlob:aB,key,n,hash});log('add','question',{id:row.id,mode:S.sheet.mode});closeSheet();await load();render();toast(t('saved'))}catch(x){e.textContent=t('saveFail')+': '+(x.message||x)}}
/* ---- edit ---- */
function shEdit(s){const q=qMap[s.id];return{title:t('editQ'),html:`<img class=qi data-p="${esc(q.question_img)}" alt="">`+classSel({part:q.part,src:q.source_id,br:q.branch_id,ch:q.chapter_id})+`<div class=fg><label>${t('answerKey')}<select id=e_key><option value="">—</option>${'ABCDEFGH'.split('').map(l=>`<option ${q.correct_option===l?'selected':''}>${l}</option>`).join('')}</select></label><label>${t('nOpts')}<select id=e_n>${[2,3,4,5,6,7,8].map(n=>`<option ${n===(q.n_options||5)?'selected':''}>${n}</option>`).join('')}</select></label></div><label class=fl>${t('qImage')} — ${t('changeImg')}<input type=file id=e_qf accept="image/*"></label><label class=fl>${t('aImage')} — ${t('changeImg')}<input type=file id=e_af accept="image/*"></label><div class=dac><button class="btn g" data-a=sclose>${t('cancel')}</button><button class="btn a" data-a=editsave>${t('save')}</button></div><p class=err id=a_err></p>`}}
async function editSave(){const q=qMap[S.sheet.id],c=readClass(),patch={...c,correct_option:$('#e_key').value||null,n_options:+$('#e_n').value};try{
 for(const[id,col]of[['e_qf','question_img'],['e_af','answer_img']]){const f=$('#'+id).files[0];if(f){const p=`${q.id}/${col[0]}-${Date.now()}.${ext(f)}`,r=await sb.storage.from(CF.bucket).upload(p,f,{contentType:f.type||'image/webp'});if(r.error)throw r.error;patch[col]=p}}
 const r=await sb.from('questions').update(patch).eq('id',q.id);if(r.error)throw r.error;log('edit','question',{id:q.id,patch:Object.keys(patch)});closeSheet();await load();render();toast(t('saved'))}catch(x){$('#a_err').textContent=t('saveFail')+': '+(x.message||x)}}
/* ---- bulk move ---- */
function shMove(s){return{title:t('moveTitle'),html:`<p class=t>${s.ids.length} ${t('selected')} — ${t('backupAuto')}</p>`+classSel().replace('<option value="">'+t('unclassified')+'</option>',`<option value="">${t('unclassified')}</option>`)+`<div class=dac><button class="btn g" data-a=sclose>${t('cancel')}</button><button class="btn a" data-a=movesave>${t('apply')}</button></div>`}}
async function bulkUpdate(ids,patch){for(let i=0;i<ids.length;i+=100){const r=await sb.from('questions').update(patch).in('id',ids.slice(i,i+100));if(r.error)throw r.error}}
function snap(name,ids){try{const items=ids.map(id=>{const q=qMap[id]||{};return{id,part:q.part,source_id:q.source_id,branch_id:q.branch_id,chapter_id:q.chapter_id}}),l=LS.get('snaps',[]);l.unshift({name,at:new Date().toISOString(),items});LS.set('snaps',l.slice(0,5))}catch(e){}}
async function snapUndo(i){const x=LS.get('snaps',[])[i];if(!x||!confirm(`${t('undo')}? ${x.items.length} ${t('qs')}`))return;try{
 if(x.name==='delete')await bulkUpdate(x.items.map(y=>y.id),{status:'published'});
 else{const g={};x.items.forEach(y=>{const k=JSON.stringify({part:y.part,source_id:y.source_id,branch_id:y.branch_id,chapter_id:y.chapter_id});(g[k]=g[k]||[]).push(y.id)});for(const k in g)await bulkUpdate(g[k],JSON.parse(k))}
 log('undo',x.name,{n:x.items.length});await load();render();toast(t('movedOk'))}catch(e){toast(t('saveFail')+': '+(e.message||e))}}
async function moveSave(){const ids=S.sheet.ids,c=readClass();try{if(ids.length>1)snap('move',ids);await bulkUpdate(ids,c);log('move','questions',{n:ids.length,to:c});S.lib.sel=new Set();closeSheet();await load();render();toast(t('movedOk'))}catch(x){toast(t('saveFail')+': '+(x.message||x))}}
/* ---- trash / restore ---- */
async function trashIds(ids){const withH=ids.filter(id=>A[id]).length;const ok=await dialog({title:t('delTitle'),body:`<p>${tf('delBody',{n:ids.length,h:withH})}</p>${ids.length>1?`<p class=t>${t('backupAuto')}</p>`:''}`,pin:true,danger:true,ok:t('moveTrash')});if(!ok)return;
 try{if(ids.length>1)snap('delete',ids);await bulkUpdate(ids,{status:'archived'});log('trash','questions',{n:ids.length,ids:ids.slice(0,20)});S.lib.sel=new Set();await load();render();toast(t('trashed'))}catch(x){toast(t('saveFail')+': '+(x.message||x))}}
async function purgeIds(ids){ids=ids.filter(id=>qMap[id]&&qMap[id].status==='archived');if(!ids.length)return;const withH=ids.filter(id=>A[id]).length;
 const ok=await dialog({title:t('purgeTitle'),body:`<p>${tf('purgeBody',{n:ids.length,h:withH})}</p>`,pin:true,danger:true,ok:t('purge')});if(!ok)return;
 try{const paths=[];ids.forEach(id=>{const q=qMap[id];if(q.question_img)paths.push(q.question_img);if(q.answer_img)paths.push(q.answer_img)});
  for(let i=0;i<ids.length;i+=100){const c=ids.slice(i,i+100);await sb.from('attempts').delete().in('question_id',c);await sb.from('question_state').delete().in('question_id',c);const r=await sb.from('questions').delete().in('id',c);if(r.error)throw r.error}
  try{for(let i=0;i<paths.length;i+=100)await sb.storage.from(CF.bucket).remove(paths.slice(i,i+100))}catch(e){}
  log('purge','questions',{n:ids.length});S.lib.sel=new Set();HASH=null;await load();render();toast(t('purged'))}catch(x){toast(t('saveFail')+': '+(x.message||x))}}
async function restoreIds(ids){try{await bulkUpdate(ids,{status:'published'});log('restore','questions',{n:ids.length});S.lib.sel=new Set();await load();render();toast(t('restored'))}catch(x){toast(t('saveFail')+': '+(x.message||x))}}
/* ================= library ================= */
const stOk=(q,st)=>!st||(st==='correct'?!!(A[q.id]&&A[q.id].ok===true):kindOf(q,st));
const live=x=>R.sources.some(s=>s.id===x.source_id)&&R.branches.some(b=>b.id===x.branch_id);
function libFiltered(){const f=S.lib,qs=f.q.trim().toLowerCase(),o=sOrder();let l=QA.filter(x=>f.tab==='trash'?x.status==='archived':(x.status!=='archived'&&live(x)));
 if(f.src)l=l.filter(x=>x.source_id===f.src);if(f.br)l=l.filter(x=>x.branch_id===f.br);if(f.ch)l=l.filter(x=>f.ch==='-'?!x.chapter_id:x.chapter_id===f.ch);if(f.st)l=l.filter(x=>stOk(x,f.st));
 if(qs){const m=qs.match(/^#?(\d+)$/);l=l.filter(x=>m?x.position===+m[1]:`${bn(x.branch_id)} ${cn(x.chapter_id)} ${sn(x.source_id)} part ${x.part} #${x.position}`.toLowerCase().includes(qs))}
 return l.sort((a,b)=>a.part-b.part||(o[a.source_id]??99)-(o[b.source_id]??99)||a.position-b.position)}
function libList(){const f=S.lib,l=libFiltered(),sel=f.sel,trash=f.tab==='trash';if(!l.length)return`<div class=em>${trash?t('trashEmpty'):t('noMatch')}</div>`;
let h=(trash?`<p class=t>${t('trashNote')}</p>`:'')+`<div class=lhead><span class=t>${l.length} ${t('qs')}</span><button class=lk data-a=selall>${t('selectAll')}</button></div>`+l.slice(0,f.n).map(q=>{const a=A[q.id],on=sel.has(q.id);
 return`<div class="lrow ${on?'sel':''}"><button class="cb ${on?'on':''}" data-a=tog data-v=${q.id} aria-label="select" aria-pressed=${on}>${on?ic('check',16):''}</button><button class=lb data-a=pv data-v=${q.id}><b>#${q.position} · ${esc(bn(q.branch_id))}</b><small>${esc(sn(q.source_id))} · ${t('part')} ${q.part}${cn(q.chapter_id)?' · '+esc(cn(q.chapter_id)):''}</small></button><span class="dot ${a?(a.ok===false?'no':'ok'):''}"></span>${trash?`<button class=ib data-a=lres data-v=${q.id} aria-label="${t('restore')}">${ic('undo')}</button><button class="ib dn" data-a=lpurge data-v=${q.id} aria-label="${t('purge')}">${ic('trash')}</button>`:`<button class=ib data-a=ledit data-v=${q.id} aria-label="${t('edit')}">${ic('edit')}</button><button class="ib dn" data-a=ldel data-v=${q.id} aria-label="${t('del')}">${ic('trash')}</button>`}</div>`}).join('');
if(l.length>f.n)h+=`<button class="btn g wide" data-a=more>${t('showMore')} (${l.length-f.n})</button>`;
return h}
function vLibrary(){const f=S.lib;let h=`<header class=ph><h1>${t('library')}</h1>${demoChip()}</header><div class=tabs>${[['q','tabQ'],['dl','tabDl'],['tax','tabTax'],['trash','tabTrash']].map(([k,l])=>`<button class="${f.tab===k?'on':''}" data-a=ltab data-v=${k}>${t(l)}</button>`).join('')}</div>`;
if(f.tab==='tax')return h+vTax();if(f.tab==='dl')return h+vDl();
if(f.tab==='trash'){h+=`<div class=f2 style="margin-bottom:12px"><div class=seg>${[['q','trashQ'],['t','trashT']].map(([k,l])=>`<button class="${f.tt===k?'on':''}" data-a=ttab data-v=${k}>${t(l)}</button>`).join('')}</div></div>`;if(f.tt==='t')return h+vTaxTrash()}
if(f.tab==='q')h+=`<div class=f2 style="margin-bottom:12px"><button class="btn a" data-a=addq>${ic('plus',18)} ${t('add')}</button><button class="btn g" data-a=impq>${ic('up',18)} ${t('importQ')}</button></div>`;
h+=`<div class=srch>${ic('search',18)}<input type=search id=lq data-c=lq value="${esc(f.q)}" placeholder="${t('search')}"></div><div class=fg4><select data-c=lsrc><option value="">${t('allSources')}</option>${opts_(srcs(),f.src,label)}</select><select data-c=lbr><option value="">${t('branches')}</option>${opts_(R.branches,f.br,x=>x.name)}</select><select data-c=lch><option value="">${t('chapters')}</option><option value="-" ${f.ch==='-'?'selected':''}>${t('unclassified')}</option>${opts_(R.chapters.filter(c=>!f.br||c.branch_id===f.br),f.ch,x=>(f.br?'':bn(x.branch_id)+' · ')+x.name)}</select><select data-c=lst><option value="">${t('state')}</option>${[['unanswered','unanswered'],['wrong','incorrect'],['correct','correct'],['marked','marked']].map(([k,l])=>`<option value=${k} ${f.st===k?'selected':''}>${t(l)}</option>`).join('')}</select></div><div id=liblist>${libList()}</div>`;return h}
/* ---- downloads (offline) ---- */
function vDl(){const f=S.lib;return`<div class=fg4><select data-c=lsrc><option value="">${t('allSources')}</option>${opts_(srcs(),f.src,label)}</select><select data-c=lbr><option value="">${t('branches')}</option>${opts_(R.branches,f.br,x=>x.name)}</select></div><div class=lhead><span class=t id=ou></span><button class=lk data-a=dlall>${t('dlAll')}</button></div>`+offList()+`<p class=t>${t('offNote')}</p>`}
/* ---- divisions (taxonomy) ---- */
async function loadTaxDel(){const r=await Promise.all(['sources','branches','chapters'].map(n=>sb.from(n).select('*')));S.taxDel={sources:[],branches:[],chapters:[]};['sources','branches','chapters'].forEach((n,i)=>{S.taxDel[n]=(r[i].data||[]).filter(x=>x.deleted_at)});render()}
const kindName=k=>k==='src'?t('source'):k==='br'?t('branch'):t('chapter');
function taxItems(k){const f=S.lib,q=(f.tq||'').trim().toLowerCase();let l=k==='src'?srcs():k==='br'?R.branches:R.chapters.filter(c=>!f.br||c.branch_id===f.br);
 return q?l.filter(x=>(k==='src'?label(x):k==='ch'?bn(x.branch_id)+' '+x.name:x.name).toLowerCase().includes(q)):l}
function taxList(){const k=S.lib.tk||'src',l=taxItems(k);if(!l.length)return`<div class=em>${t('taxEmpty')}</div>`;
 const cm={};QA.forEach(q=>{if(q.status==='archived')return;[q.source_id,q.branch_id,q.chapter_id].forEach(i=>{if(i)cm[i]=(cm[i]||0)+1})});const qn=id=>(cm[id]||0)+' '+t('qs');
 return`<div class=lhead><span class=t>${l.length} · ${t({src:'sources',br:'branches',ch:'chapters'}[k])}</span></div>`+l.map(x=>{
  const title=k==='src'?label(x):x.name,sub=k==='src'?qn(x.id):k==='br'?qn(x.id)+' · '+R.chapters.filter(c=>c.branch_id===x.id).length+' '+t('chapters'):bn(x.branch_id)+' · '+qn(x.id),
  def=(k==='src'&&x.id===S.dsrc)||(k==='br'&&x.id===S.dbr)?`<span class=chip>${t('default')}</span>`:'';
  return`<div class=lrow><button class=lb data-a=${k==='br'?'taxdrill':'taxedit'} data-k=${k} data-v=${x.id}><b>${esc(title)}</b><small>${esc(sub)}</small></button>${def}<button class=ib data-a=taxedit data-k=${k} data-v=${x.id} aria-label="${t('taxRename')}">${ic('edit')}</button><button class="ib dn" data-a=taxdel data-k=${k} data-v=${x.id} aria-label="${t('del')}">${ic('trash')}</button></div>`}).join('')}
function vTax(){const f=S.lib,k=f.tk||'src';
 return`<div class=row2 style="margin-bottom:12px"><div class=seg>${[['src','sources'],['br','branches'],['ch','chapters']].map(([x,l])=>`<button class="${k===x?'on':''}" data-a=taxkind data-v=${x}>${t(l)}</button>`).join('')}</div><button class="btn a" data-a=taxnew>${ic('plus',18)} ${t('add')}</button></div>`
 +`<div class=srch>${ic('search',18)}<input type=search data-c=tq value="${esc(f.tq||'')}" placeholder="${t('taxSearch')}"></div>`
 +(k==='ch'?`<div class=fg4><select data-c=lbr><option value="">${t('branches')}</option>${opts_(R.branches,f.br,x=>x.name)}</select></div>`:'')
 +`<div id=taxlist>${taxList()}</div>`}
function vTaxTrash(){if(!S.taxDel){loadTaxDel();return`<div class=em>…</div>`}const D=S.taxDel,pb=id=>bn(id)||((D.branches.find(b=>b.id===id)||{}).name||'');
 const it=[...D.sources.map(x=>({k:'src',x,title:label(x),sub:kindName('src')})),...D.branches.map(x=>({k:'br',x,title:x.name,sub:kindName('br')})),...D.chapters.map(x=>({k:'ch',x,title:x.name,sub:kindName('ch')+' · '+pb(x.branch_id)}))];
 if(!it.length)return`<div class=em>${t('trashEmpty')}</div>`;
 return`<p class=t>${t('taxTrashNote')}</p>`+it.map(y=>`<div class=lrow><span class=lb><b>${esc(y.title)}</b><small>${esc(y.sub)}</small></span><button class=ib data-a=taxres data-k=${y.k} data-v=${y.x.id} aria-label="${t('restore')}">${ic('undo')}</button></div>`).join('')}
function shTax(s){const k=s.k;
 if(s.mode==='edit'){const o=byId({src:R.sources,br:R.branches,ch:R.chapters}[k],s.id);if(!o)return{title:t('taxRename'),html:''};
  return{title:t('taxRename'),html:`<p class=t>${esc(kindName(k))}${k==='ch'?' · '+esc(bn(o.branch_id)):''}</p><label class=fl>${t('name')}<input type=text id=tx_name value="${esc(o.name)}"></label>${k==='src'?`<label class=fl>${t('year')}<input type=text inputmode=numeric id=tx_year value="${o.year||''}"></label>`:''}<div class=dac><button class="btn g" data-a=sclose>${t('cancel')}</button><button class="btn a" data-a=taxesave>${t('save')}</button></div><p class=err id=tx_err></p>`}}
 return{title:t('addTax'),html:`<div class=seg>${[['src','source'],['br','branch'],['ch','chapter']].map(([x,l])=>`<button class="${k===x?'on':''}" data-a=taxsk data-v=${x}>${t(l)}</button>`).join('')}</div>`
  +(k==='ch'?`<label class=fl>${t('whereAdd')} — ${t('branch')}<select id=tx_br>${opts_(R.branches,s.br,x=>x.name)}</select></label>`:'')
  +(k==='src'?`<label class=fl>${t('name')}<input type=text id=tx_name></label><label class=fl>${t('year')}<input type=text inputmode=numeric id=tx_year></label>`:`<label class=fl>${t('name')} — ${t('namesHint')}<textarea id=tx_names rows=4></textarea></label>`)
  +`<div class=dac><button class="btn g" data-a=sclose>${t('cancel')}</button><button class="btn a" data-a=taxsave>${t('save')}</button></div><p class=err id=tx_err></p>`}}
const TB={src:'sources',br:'branches',ch:'chapters'};
async function taxAct(a,k,id){
 if(a==='taxkind'){S.lib.tk=id;S.lib.tq='';return render()}
 if(a==='taxdrill'){S.lib.br=id;S.lib.tk='ch';S.lib.tq='';return render()}
 if(a==='taxnew')return openSheet({type:'tax',mode:'add',k:S.lib.tk||'src',br:S.lib.br||S.dbr||(R.branches[0]||{}).id});
 if(a==='taxsk')return openSheet({type:'tax',mode:'add',k:id,br:S.sheet.br});
 if(a==='taxedit')return openSheet({type:'tax',mode:'edit',k,id});
 const K=(a==='taxsave'||a==='taxesave')?S.sheet.k:k,tb=TB[K],arr={src:R.sources,br:R.branches,ch:R.chapters}[K];let r;
 if(a==='taxsave'){const e=$('#tx_err'),nm=(K==='src'?[$('#tx_name').value]:$('#tx_names').value.split('\n')).map(x=>x.trim()).filter(Boolean);
  if(!nm.length)return e.textContent=t('name');const br=K==='ch'?$('#tx_br').value:null;if(K==='ch'&&!br)return e.textContent=t('branch');
  const yr=K==='src'?(+$('#tx_year').value.trim()||null):null,pool=K==='ch'?arr.filter(x=>x.branch_id===br):arr,yk=y=>K==='src'?'|'+(y||''):'';
  let mx=Math.max(0,...arr.map(x=>x.sort_order||0));const seen=new Set(pool.map(x=>norm(x.name)+yk(x.year))),rows=[];
  for(const n of nm){const key=norm(n)+yk(yr);if(seen.has(key))continue;seen.add(key);mx++;rows.push(K==='src'?{name:n,year:yr,sort_order:mx}:K==='br'?{name:n,sort_order:mx}:{branch_id:br,name:n,sort_order:mx})}
  if(!rows.length)return e.textContent=t('exists');
  r=await sb.from(tb).insert(rows);if(r.error)return e.textContent=t('saveFail')+': '+r.error.message;
  log('taxonomy-add',tb,{n:rows.length});closeSheet();S.taxDel=null;await load();render();return toast(tf('addedN',{n:rows.length}))}
 if(a==='taxesave'){const e=$('#tx_err'),n=$('#tx_name').value.trim();if(!n)return e.textContent=t('name');const u={name:n};if(K==='src'){const y=$('#tx_year').value.trim();u.year=y?(+y||null):null}
  r=await sb.from(tb).update(u).eq('id',S.sheet.id);if(r.error)return e.textContent=t('saveFail')+': '+r.error.message;
  log('taxonomy-rename',tb,{id:S.sheet.id});closeSheet();S.taxDel=null;await load();render();return toast(t('saved'))}
 if(a==='taxres')r=await sb.from(tb).update({deleted_at:null}).eq('id',id);
 else if(a==='taxdel'){const o=byId(arr,id),c=QA.filter(q=>q.status!=='archived'&&q[{src:'source_id',br:'branch_id',ch:'chapter_id'}[K]]===id).length;
  const ok=await dialog({title:t('taxDelTitle'),body:`<p>${tf('taxDelBody',{n:K==='src'?label(o):o.name,c})}</p>`,pin:true,danger:true,ok:t('del')});if(!ok)return;
  const wasDef=(K==='src'&&S.dsrc===id)||(K==='br'&&S.dbr===id);
  r=await sb.from(tb).update({deleted_at:new Date().toISOString()}).eq('id',id);if(r&&r.error)return toast(t('saveFail')+': '+r.error.message);
  log('taxonomy-delete',tb,{id,name:o.name,questions:c});S.taxDel=null;await load();if(wasDef)saveSet();return render()}
 if(r&&r.error)return toast(t('saveFail')+': '+r.error.message);log(a,tb,{id});S.taxDel=null;await load();render()}

/* ---- activity log ---- */
function vLog(){let rows;if(ACT){if(!S.logRows){sb.from('activity_log').select('*').order('created_at',{ascending:false}).limit(100).then(r=>{if(r&&!r.error)S.logRows=r.data;else ACT=false;render()});return`<div class=em>…</div>`}rows=S.logRows.map(x=>({action:x.action,entity:x.entity,details:x.details,at:x.created_at}))}
 else rows=LS.get('log2',[]);
 return(ACT?'':`<p class=t>${t('logLocal')}</p>`)+(rows.length?rows.map(x=>`<div class=rw><span><b>${esc(x.action)}</b> · ${esc(x.entity)}<small>${esc(JSON.stringify(x.details||{}).slice(0,110))}</small></span><small>${new Date(x.at).toLocaleString(S.lang==='ar'?'ar':'en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></div>`).join(''):`<div class=em>${t('noLog')}</div>`)}
/* ================= import ================= */
function parseCSV(txt){txt=txt.replace(/^\uFEFF/,'');const first=txt.split('\n')[0],d=[',',';','\t'].map(c=>[c,first.split(c).length]).sort((a,b)=>b[1]-a[1])[0][0],rows=[];let r=[],f='',q=false;
 for(let i=0;i<txt.length;i++){const c=txt[i];if(q){if(c=='"'){if(txt[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==d){r.push(f);f=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&txt[i+1]=='\n')i++;r.push(f);f='';if(r.some(x=>x.trim()))rows.push(r);r=[]}else f+=c}
 r.push(f);if(r.some(x=>x.trim()))rows.push(r);const h=(rows.shift()||[]).map(x=>x.trim().toLowerCase());return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||'').trim()])))}
async function readRows(file){const n=file.name.toLowerCase();
 if(n.endsWith('.json')){let j=JSON.parse(await file.text());if(!Array.isArray(j))j=j.questions||[];return j.map(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k.toLowerCase().trim(),v])))}
 if(n.endsWith('.xlsx')||n.endsWith('.xls')){if(!window.XLSX)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=ok;s.onerror=()=>no(Error('Excel reader needs internet'));document.head.appendChild(s)});
  const wb=XLSX.read(await file.arrayBuffer());return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''}).map(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k.toLowerCase().trim(),v])))}
 return parseCSV(await file.text())}
function normRow(o){const g=(...ks)=>{for(const k of ks){const v=o[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v).trim()}return''};let opts=[];
 if(Array.isArray(o.options))opts=o.options.map(String);else if(o.options&&typeof o.options==='object')opts=Object.values(o.options).map(String);
 else for(let i=0;i<8;i++){const L='abcdefgh'[i],v=g(L,'option '+L,'option_'+L,'opt '+L,'opt_'+L,'option'+L,L+')','choice '+L);if(!v)break;opts.push(v)}
 return{stem:g('question','stem','q','text','question text'),opts,ans:g('answer','key','correct','correct answer','correct_option','correct option'),expl:g('explanation','rationale','exp','explain'),part:g('part','mrcp part'),source:g('source'),year:g('year'),branch:g('branch','specialty','speciality','category'),chapter:g('chapter','topic')}}
async function analyzeRows(raw,d){const seen=new Set(await hashes()),out=[];
 for(let i=0;i<raw.length;i++){const r=normRow(raw[i]),msgs=[],info=[];let part=d.part;if(r.part){const m=String(r.part).match(/[12]/);if(m)part=+m[0];else msgs.push('part')}
  if(r.stem.length<8)msgs.push(t('stem'));if(r.opts.length<2)msgs.push(t('optionN'));
  let key=null;if(r.ans){const a=r.ans.trim();if(/^[A-Ha-h]$/.test(a))key=a.toUpperCase();else if(/^[1-8]$/.test(a))key='ABCDEFGH'[+a-1];else{const ix=r.opts.findIndex(o=>norm(o)===norm(a));if(ix>=0)key='ABCDEFGH'[ix]}}
  if(!key)msgs.push(t('answerKey'));else if('ABCDEFGH'.indexOf(key)>=r.opts.length)msgs.push(t('answerKey'));
  let sName=d.src.name,sYear=d.src.year||null;if(r.source){sName=r.source;sYear=r.year?+r.year:null;const m=r.source.match(/^(.*\S)\s+(20\d\d)$/);if(m&&!r.year){sName=m[1];sYear=+m[2]}}
  const brName=r.branch||d.br.name,chName=r.chapter||(r.branch?'':(d.ch?d.ch.name:''));
  if(r.source&&!R.sources.some(x=>norm(x.name)===norm(sName)&&(x.year||null)===sYear))info.push(t('willCreate')+': '+sName+(sYear?' '+sYear:''));
  if(r.branch&&!R.branches.some(x=>norm(x.name)===norm(brName)))info.push(t('willCreate')+': '+brName);
  const hash=await sha(norm(r.stem)+'|'+r.opts.map(norm).join('|'));let status=msgs.length?'err':'ok';if(!msgs.length&&seen.has(hash))status='dup';seen.add(hash);
  out.push({i:i+1,r,key,part,sName,sYear,brName,chName,hash,status,msgs,info})}return out}
function shImp(s){const tab=s.tab||'file',head=`<div class=seg><button class="${tab==='file'?'on':''}" data-a=imptab data-v=file>${t('impFile')}</button><button class="${tab==='pack'?'on':''}" data-a=imptab data-v=pack>${t('impPack')}</button></div>`;
 if(s.step==='run')return{title:t('impTitle'),html:head+`<div class=em>${esc(s.msg||'…')}</div>`};
 if(s.step==='done'){const x=s.res;return{title:t('summary'),html:`<div class=sum><div><b>${x.added}</b><span>${t('added')}</span></div><div><b>${x.dup}</b><span>${t('skipped')}</span></div><div><b>${x.err}</b><span>${t('errorsN')}</span></div></div>${x.err?`<button class="btn g wide" data-a=errdl>${t('dlErrors')}</button>`:''}<div class=dac><button class="btn a" data-a=sclose>${t('close')}</button></div>`}}
 if(s.step==='preview'){const it=s.items,ok=it.filter(x=>x.status==='ok'),dp=it.filter(x=>x.status==='dup'),er=it.filter(x=>x.status==='err');
  if(tab==='pack')return{title:t('impTitle'),html:head+`<div class=sum><div><b>${ok.length}</b><span>${t('newQ')}</span></div><div><b>${dp.length}</b><span>${t('dupQ')}</span></div><div><b>${it.filter(x=>!x.a).length}</b><span>${t('noAns')}</span></div></div>${s.meta?`<p class=t>${esc(s.meta.branch)} · ${esc(s.meta.source.name)} ${s.meta.source.year||''} · ${t('part')} ${s.meta.part} · ${(s.meta.chapters||[]).length} ${t('chapters')}</p>`:`<h4>${t('classif')}</h4>${classSel()}`}<div class=thumbs>${ok.slice(0,6).map(x=>`<img src="${URL.createObjectURL(x.q)}" alt="">`).join('')}</div><div class=dac><button class="btn g" data-a=imptab data-v=pack>${t('cancel')}</button><button class="btn a" data-a=${ok.length?'runpack':'sclose'}>${ok.length?tf('confirmImp',{n:ok.length}):t('impBlocked')}</button></div>`};
  return{title:t('impTitle'),html:head+`<div class=sum><div><b>${ok.length}</b><span>${t('valid')}</span></div><div><b>${dp.length}</b><span>${t('dup')}</span></div><div><b>${er.length}</b><span>${t('err')}</span></div></div><div class=tw><table><tr><th>${t('num')}</th><th>${t('question')}</th><th>${t('answerKey')}</th><th></th></tr>${it.slice(0,150).map(x=>`<tr class="${x.status}"><td>${x.i}</td><td dir=auto>${esc(x.r.stem.slice(0,70))}${x.info.length?`<small>${esc(x.info.join(' · '))}</small>`:''}</td><td>${x.key||'—'}</td><td>${x.status==='ok'?'✓':x.status==='dup'?t('dup'):esc(x.msgs.join(', '))}</td></tr>`).join('')}</table></div><div class=dac><button class="btn g" data-a=imptab data-v=file>${t('cancel')}</button><button class="btn a" data-a=${ok.length?'runfile':'sclose'}>${ok.length?tf('confirmImp',{n:ok.length}):t('impBlocked')}</button></div>`}}
 return{title:t('impTitle'),html:head+(tab==='file'?`<p class=t>${t('impCols')}</p><p class=t>${t('defaults')}</p>${classSel()}<label class=fl>${t('impPick')}<input type=file id=i_f accept=".csv,.json,.xlsx,.xls,.txt"></label>`:`<h4>${t('classif')}</h4>${classSel()}<label class=fl>${t('impPack')} (0001_…_q.webp, 0001_a.webp, pack.json)<input type=file id=i_p multiple accept="image/*,.json"></label>`)+`<p class=err id=i_err></p>`}}
const defaults=()=>{const c=readClass();return{part:c.part,src:byId(R.sources,c.source_id)||R.sources[0],br:byId(R.branches,c.branch_id)||R.branches[0],ch:c.chapter_id?byId(R.chapters,c.chapter_id):null}};
async function ensure(kind,name,year,brId){const arr=kind==='src'?R.sources:kind==='br'?R.branches:R.chapters,f=arr.find(x=>norm(x.name)===norm(name)&&(kind==='src'?(x.year||null)===(year||null):kind==='ch'?x.branch_id===brId:true));if(f)return f;
 const row=kind==='src'?{name,year:year||null,sort_order:arr.length+1}:kind==='br'?{name,sort_order:arr.length+1}:{branch_id:brId,name,sort_order:arr.length+1};const r=await sb.from(TB[kind]).insert(row).select().single();if(r.error)throw r.error;arr.push(r.data);return r.data}
async function onFilePicked(f){const e=$('#i_err');try{const d=defaults(),raw=await readRows(f);if(!raw.length)throw Error(t('fileInvalid'));S.sheet.items=await analyzeRows(raw,d);S.sheet.d=d;S.sheet.step='preview';S.sheet.fname=f.name;drawSheet()}catch(x){e.textContent=t('fileInvalid')+': '+(x.message||x)}}
async function runFile(){const s=S.sheet,ok=s.items.filter(x=>x.status==='ok'),res={added:0,dup:s.items.filter(x=>x.status==='dup').length,err:s.items.filter(x=>x.status==='err').length},errs=s.items.filter(x=>x.status==='err').map(x=>({row:x.i,problem:x.msgs.join('; ')}));
 s.step='run';for(let i=0;i<ok.length;i++){const x=ok[i];s.msg=`${i+1} / ${ok.length}`;drawSheet();try{const so=await ensure('src',x.sName,x.sYear),br=await ensure('br',x.brName),ch=x.chName?await ensure('ch',x.chName,null,br.id):null;
  const o=x.r.opts,im=await drawQuestion(x.r.stem,o,x.key,x.r.expl);await insertQ({part:x.part,source_id:so.id,branch_id:br.id,chapter_id:ch?ch.id:null},{qBlob:im.q,aBlob:im.a,key:x.key,n:o.length,hash:x.hash});res.added++}catch(e){res.err++;errs.push({row:x.i,problem:String(e.message||e)})}}
 s.errs=errs;s.res=res;s.step='done';log('import','questions',{file:s.fname,...res});await load();drawSheet();render()}
async function onPackPicked(files){const e=$('#i_err');files=[...files];try{files=await Promise.all(files.map(async f=>new File([await f.arrayBuffer()],f.name,{type:f.type||(/\.json$/i.test(f.name)?'application/json':/\.png$/i.test(f.name)?'image/png':'image/webp')})))}catch(x){return e.textContent=t('fileInvalid')+': '+(x.message||x)}const emp=files.filter(f=>!f.size);if(emp.length)return e.textContent='Empty files ('+emp.length+'): '+emp.slice(0,3).map(f=>f.name).join(', ');const pj=files.find(f=>f.name==='pack.json');let meta=null;if(pj)try{meta=JSON.parse(await pj.text())}catch(x){return e.textContent='pack.json'}
 const re=/^(\d+).*?_([qa])\.\w+$/i,im=files.filter(f=>f!==pj);if(!im.length||!im.every(f=>re.test(f.name)))return e.textContent=t('fileInvalid');
 const d={};im.forEach(f=>{const x=f.name.match(re);(d[+x[1]]=d[+x[1]]||{})[x[2].toLowerCase()]=f});const keys=Object.keys(d).map(Number).sort((a,b)=>a-b).filter(k=>d[k].q),seen=new Set(await hashes()),items=[];
 S.sheet.step='run';for(let i=0;i<keys.length;i++){const f=d[keys[i]];if(i%20==0){S.sheet.msg=`${t('files')}: ${i} / ${keys.length}`;drawSheet()}const h=await sha(await f.q.arrayBuffer()),k=f.q.name.match(/_k([A-H])_/i),n=f.q.name.match(/_n(\d)_/),c=f.q.name.match(/_(c\d+)_/);
  items.push({q:f.q,a:f.a||null,hash:h,key:k?k[1].toUpperCase():null,n:n?+n[1]:5,cid:c?c[1]:null,status:seen.has(h)?'dup':'ok'});seen.add(h)}
 S.sheet.items=items;S.sheet.meta=meta;S.sheet.step='preview';S.sheet.tab='pack';drawSheet()}
async function runPack(){const s=S.sheet,ok=s.items.filter(x=>x.status==='ok'),res={added:0,dup:s.items.filter(x=>x.status==='dup').length,err:0},errs=[],cls=s.meta?null:readClass();let so,br,cm={},part=1,def=null;
 s.step='run';s.msg='…';drawSheet();try{if(s.meta){const m=s.meta;part=m.part||1;so=await ensure('src',m.source.name,m.source.year);br=await ensure('br',m.branch);for(const c of m.chapters||[])cm[c.id]=(await ensure('ch',c.name,null,br.id)).id}
 else{part=cls.part;so={id:cls.source_id};br={id:cls.branch_id};def=cls.chapter_id}}catch(e){s.step='preview';drawSheet();return toast(e.message||e)}
 for(let i=0;i<ok.length;i++){const x=ok[i];s.msg=`${i+1} / ${ok.length}`;if(i%5==0)drawSheet();try{await insertQ({part,source_id:so.id,branch_id:br.id,chapter_id:(x.cid&&cm[x.cid])||def},{qBlob:x.q,aBlob:x.a,key:x.key,n:x.n,hash:x.hash});res.added++}catch(e){res.err++;errs.push({row:i+1,problem:String(e.message||e)})}}
 s.errs=errs;s.res=res;s.step='done';log('import','pack',res);await load();drawSheet();render()}
/* ================= settings ================= */
const gk=q=>q.part+'|'+q.source_id+'|'+q.branch_id,pathsOf=l=>[...new Set(l.flatMap(q=>[q.question_img,q.answer_img]).filter(Boolean))],gmap=()=>{const g={};Q.forEach(q=>(g[gk(q)]=g[gk(q)]||[]).push(q));return g};
const CS=()=>self.caches?caches.open('mrcp-img-v1'):Promise.reject(),ik=p=>'https://img.cache/'+p;
const offKeys=()=>{const f=S.lib,o=sOrder();return Object.entries(gmap()).filter(([k,l])=>(!f.src||l[0].source_id===f.src)&&(!f.br||l[0].branch_id===f.br)).sort((x,y)=>x[1][0].part-y[1][0].part||o[x[1][0].source_id]-o[y[1][0].source_id]||bn(x[1][0].branch_id).localeCompare(bn(y[1][0].branch_id)))};
function offList(){return offKeys().map(([k,l])=>`<div class=lrow><span class=lb><b>${esc(bn(l[0].branch_id))} · ${esc(sn(l[0].source_id))}</b><small>${t('part')} ${l[0].part} · ${l.length} ${t('qs')} · <span data-st="${esc(k)}">…</span></small></span><button class=ib data-a=dlg data-v="${esc(k)}" aria-label="${t('download')}">${ic('down')}</button><button class=ib data-a=rmg data-v="${esc(k)}" aria-label="${t('remove')}">${ic('x')}</button></div>`).join('')||`<div class=em>${t('empty')}</div>`}
async function dlAll(){for(const [k] of offKeys())await dlGroup(k)}
const stEl=k=>[...document.querySelectorAll('[data-st]')].find(e=>e.dataset.st===k);
async function usage(){const el=$('#ou');if(!el||!navigator.storage||!navigator.storage.estimate)return;const e=await navigator.storage.estimate();el.textContent=`${Math.round((e.usage||0)/1048576)} MB / ${Math.round((e.quota||0)/1048576)} MB`;try{navigator.storage.persist&&navigator.storage.persist()}catch(x){}}
async function offStatus(){const have=new Set();try{(await(await CS()).keys()).forEach(r=>have.add(r.url.replace('https://img.cache/','')))}catch(e){}
const g=gmap();document.querySelectorAll('[data-st]').forEach(el=>{const ps=pathsOf(g[el.dataset.st]||[]),n=ps.filter(x=>have.has(x)).length;el.textContent=n&&n===ps.length?t('onDevice'):n?`${t('partial')} ${n}/${ps.length}`:t('notDl')})}
async function dlGroup(k){const l=gmap()[k],el=stEl(k);if(!l)return;if(DEMO)return toast(t('demoBanner'));if(!navigator.onLine)return toast(t('offlineS'));let c;try{c=await CS()}catch(e){return toast('HTTPS')}
const paths=pathsOf(l),todo=[];for(const p of paths)if(!(await c.match(ik(p))))todo.push(p);let done=0;
for(let i=0;i<todo.length;i+=20){const ch=todo.slice(i,i+20),{data,error}=await sb.storage.from(CF.bucket).createSignedUrls(ch,21600);if(error){el.textContent=error.message;return}
await Promise.all(data.map(async d=>{try{if(d.signedUrl){const r=await fetch(d.signedUrl);if(r.ok)await c.put(ik(d.path),r)}}catch(e){}done++;el.textContent=`${done} / ${todo.length}…`}))}
await offStatus();usage()}
async function rmGroup(k){const l=gmap()[k];if(!l||!confirm(`${bn(l[0].branch_id)} — ${t('remove')}?`))return;try{const c=await CS();for(const p of pathsOf(l)){await c.delete(ik(p));delete urlc[p]}}catch(e){}await offStatus();usage()}
const afterSettings=()=>{usage();offStatus()};
function vSettings(){const sg=(k,vals,cur)=>`<div class=seg>${vals.map(([v,l])=>`<button class="${cur===v?'on':''}" data-a=${k} data-v=${v}>${l}</button>`).join('')}</div>`;
return`<header class=ph><h1>${t('settings')}</h1>${demoChip()}</header>
<div class=card><h3>${t('lang')}</h3>${sg('lang',[['en','English'],['ar','العربية']],S.lang)}</div>
<div class=card><h3>${t('appearance')}</h3>${sg('theme',[['auto',t('auto')],['light',t('light')],['dark',t('dark')]],S.theme)}<label class=rng>${t('pageSize')} <b id=zv>${S.zoom}%</b><input type=range min=70 max=160 step=5 value=${S.zoom} data-c=zoom></label></div>
<div class=card><h3>${t('defaults2')}</h3><div class=fg><label>${t('defPart')}<select data-c=dpart>${[1,2].map(n=>`<option value=${n} ${S.dpart===n?'selected':''}>${t('part')} ${n}</option>`).join('')}</select></label><label>${t('defSrc')}<select data-c=dsrc><option value="">—</option>${opts_(srcs(),S.dsrc,label)}</select></label><label>${t('defBr')}<select data-c=dbr><option value="">—</option>${opts_(R.branches,S.dbr,x=>x.name)}</select></label></div><p class=t>${t('defNote')}</p></div>
<div class=card><h3>${t('pin')}</h3><p class=t>${S.pin?t('pinSet'):t('pinUnset')}</p><div class=f2><button class="btn g" data-a=setpin>${S.pin?t('changePin'):t('setPin')}</button>${S.pin?`<button class="btn g" data-a=rmpin>${t('removePin')}</button>`:''}</div></div>
<div class=card><h3>${t('backup')}</h3><div class=f2><button class="btn g" data-a=expp>${t('expP')}</button><label class="btn g" style="cursor:pointer">${t('impP')}<input type=file accept=".json" data-c=pimp hidden></label><button class="btn g" data-a=expb>${t('expB')}</button><button class="btn g" data-a=sync>${t('syncNow')} (${QU.length})</button></div><p class=t id=bmsg></p></div>
<div class=card><h3>${t('snaps')}</h3><p class=t>${t('snapNote')}</p>${LS.get('snaps',[]).map((x,i)=>`<div class=rw><span><b>${esc(x.name)}</b><small>${new Date(x.at).toLocaleString(S.lang==='ar'?'ar':'en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · ${x.items.length} ${t('qs')}</small></span><span class=f2><button class="btn s g" data-a=snapundo data-v=${i}>${t('undo')}</button><button class="btn s g" data-a=snapdl data-v=${i}>${t('download')}</button></span></div>`).join('')||`<span class=t>${t('snapEmpty')}</span>`}</div>
<div class=card><h3>${t('account')}</h3><div class=f2><button class="btn g" data-a=refresh>${t('refresh')}</button><button class="btn g" data-a=logout>${t('signOut')}</button></div></div>`}
async function changePin(){const old=S.pin;if(old&&!(await dialog({title:t('changePin'),pin:true})))return;S.pin=null;const ok=await dialog({title:t('setPin'),pin:true,ok:t('save')});if(!ok)S.pin=old;render()}
async function exportProgress(){const m=$('#bmsg');m.textContent='…';try{const at=await fetchAll(()=>sb.from('attempts').select('id,question_id,selected,answered_at,device_id').order('answered_at').order('id'));const ids=new Set(at.map(a=>a.id));QU.filter(o=>o.k==='att'&&!ids.has(o.row.id)).forEach(o=>at.push(o.row));
 const marks=await fetchAll(()=>sb.from('question_state').select('question_id,marked,updated_at').order('question_id')),data={attempts:at,marks};dl(`mrcp-progress-${day()}.json`,{format:'mrcp-progress',v:1,exported_at:new Date().toISOString(),checksum:await sha(JSON.stringify(data)),data});m.textContent=`${at.length} / ${marks.length}`}catch(e){m.textContent=e.message}}
async function importProgress(file){const m=$('#bmsg');try{const j=JSON.parse(await file.text());if(j.format!=='mrcp-progress'||!j.data||!Array.isArray(j.data.attempts))throw Error('Not a progress backup file');if(await sha(JSON.stringify(j.data))!==j.checksum)throw Error('Backup is damaged (checksum mismatch). Nothing was imported.');
 const qids=new Set(QA.map(q=>q.id)),good=j.data.attempts.filter(a=>a.id&&qids.has(a.question_id)&&/^[A-H]$/.test(a.selected)&&a.answered_at),have=new Set((await fetchAll(()=>sb.from('attempts').select('id').order('id'))).map(x=>x.id)),fresh=good.filter(a=>!have.has(a.id)),mk=(j.data.marks||[]).filter(x=>qids.has(x.question_id));
 if(!confirm(`${good.length} attempts (${fresh.length} new), ${mk.length} marks.\nMerge only — nothing existing is deleted or overwritten.`))return;
 for(let i=0;i<fresh.length;i+=200){m.textContent=`${Math.min(i+200,fresh.length)} / ${fresh.length}`;const r=await sb.from('attempts').upsert(fresh.slice(i,i+200).map(a=>({id:a.id,question_id:a.question_id,selected:a.selected,answered_at:a.answered_at,device_id:a.device_id||'restore'})),{onConflict:'id',ignoreDuplicates:true});if(r.error)throw r.error}
 for(let i=0;i<mk.length;i+=10)await Promise.all(mk.slice(i,i+10).map(x=>sb.rpc('set_mark',{p_question:x.question_id,p_marked:x.marked,p_at:x.updated_at})));log('restore-progress','attempts',{n:fresh.length});await load();render();toast(t('saved'))}catch(e){m.textContent=e.message||String(e)}}
async function exportBank(){try{const[s,b,c]=await Promise.all(['sources','branches','chapters'].map(n=>sb.from(n).select('*')));dl(`mrcp-question-bank-${day()}.json`,{format:'mrcp-bank',v:1,sources:s.data,branches:b.data,chapters:c.data,questions:QA});toast(t('saved'))}catch(e){toast(e.message)}}
/* ================= actions ================= */
const curQ=()=>{const ids=sessIds();return S.sess&&ids.length?qMap[ids[S.sess.idx]]:null};
async function act(a,v,el){const q=curQ(),se=S.sess;
if(a==='sclose'){if(el&&el.classList.contains('ov2')&&S.evt!==el)return;closeSheet();return}
if(a==='dyes')return dyes();if(a==='dno')return dno();
if(a==='lang'){S.lang=v;LS.set('lang',v);applyUI();if(ME&&ME.id)saveSet();return ME&&ME.id?render():loginView()}
if(a==='login'){const{error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});return error?loginView(error.message):boot()}
if(a==='forgot'){const e=$('#em').value.trim();if(!e)return toast(t('email'));const{error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin+location.pathname});return toast(error?error.message:t('resetSent'))}
if(a==='demo'){location.href=location.pathname+'?demo=1';return}
if(a==='logout'){await sb.auth.signOut();return}
if(a==='refresh'){await flush();await load();return render()}
if(a==='sync'){await flush();toast(QU.length?`${t('pending')}: ${QU.length}`:t('synced'));return render()}
if(a==='navtoggle'){S.rail=!S.rail;LS.set('rail',S.rail);return applyUI()}
if(a==='page'){if(v==='study'&&S.page==='study')S.br=null;S.page=v;if(v==='library')S.logRows=null}
else if(a==='part'){S.part=+v;S.br=null}
else if(a==='br'){S.br=v;S.kind='all';S.page='study'}
else if(a==='brback')S.br=null;
else if(a==='kind')S.kind=v;
else if(a==='start')startSession(v);
else if(a==='resume')S.page='practice';
else if(a==='exit')S.page='study';
else if(a==='sel'&&q&&!stOf(q).rev)cur[q.id]={sel:v};
else if(a==='ans'&&q){const s=stOf(q);if(!s.sel)return toast(t('pickFirst'));const at=new Date().toISOString(),row={id:uid(),question_id:q.id,selected:s.sel,answered_at:at,device_id:DEV};
 A[q.id]={sel:s.sel,ok:q.correct_option?s.sel===q.correct_option:null,at};delete cur[q.id];hist[q.id]=[{selected:s.sel,is_correct:A[q.id].ok,answered_at:at},...(hist[q.id]||[])].slice(0,8);enqueue({k:'att',row})}
else if(a==='next'||a==='skip'){const ids=sessIds();if(se.idx>=ids.length-1){S.page='study';savePos()}else{se.idx++;savePos();top0()}}
else if(a==='prev'){se.idx=Math.max(0,se.idx-1);savePos();top0()}
else if(a==='jump'){se.idx=+v;closeSheet();savePos();top0()}
else if(a==='navsheet')return openSheet({type:'nav'});
else if(a==='mark'&&q){const m=!M.has(q.id);m?M.add(q.id):M.delete(q.id);enqueue({k:'mark',q:q.id,m,at:new Date().toISOString()})}
else if(a==='retry'){if(q&&q.id===v)cur[v]={sel:null};else{openFrom([v],v);cur[v]={sel:null}}}
else if(a==='ptab'){S.prog.tab=v}
else if(a==='openl')openList(el.dataset.l,v);
else if(a==='theme'){S.theme=v;applyUI();saveSet()}
else if(a==='setpin')return changePin();
else if(a==='rmpin'){if(await dialog({title:t('removePin'),pin:true,danger:true,ok:t('removePin')})){S.pin=null;saveSet()}}
else if(a==='snapundo')return snapUndo(+v);else if(a==='snapdl'){dl(`mrcp-snapshot-${day()}.json`,LS.get('snaps',[])[+v]);return}
else if(a==='dlg')return dlGroup(v);else if(a==='rmg')return rmGroup(v);
else if(a==='expp')return exportProgress();else if(a==='expb')return exportBank();
/* library */
else if(a==='ltab'){S.lib.tab=v;S.lib.sel=new Set();S.lib.n=60;S.logRows=null;S.taxDel=null}
else if(a==='tog'){S.lib.sel.has(v)?S.lib.sel.delete(v):S.lib.sel.add(v)}
else if(a==='selall')libFiltered().forEach(x=>S.lib.sel.add(x.id));
else if(a==='lclear')S.lib.sel=new Set();
else if(a==='more')S.lib.n+=60;
else if(a==='ttab'){S.lib.tt=v;S.lib.sel=new Set()}
else if(a==='dlall')return dlAll();
else if(a==='pv')return openSheet({type:'pv',id:v});
else if(a==='ledit')return openSheet({type:'edit',id:v});
else if(a==='ldel')return trashIds([v]);else if(a==='ldelsel')return trashIds([...S.lib.sel]);
else if(a==='lpurge')return purgeIds([v]);else if(a==='lpurgesel')return purgeIds([...S.lib.sel]);else if(a==='lres')return restoreIds([v]);else if(a==='lresel')return restoreIds([...S.lib.sel]);
else if(a==='lmove')return openSheet({type:'move',ids:[...S.lib.sel]});
else if(a==='addq')return openSheet({type:'add',mode:'text'});
else if(a==='addmode')return openSheet({type:'add',mode:v});
else if(a==='addopt'){const n=document.querySelectorAll('.a_o').length;if(n<8){const l=document.createElement('label');l.className='fl';l.innerHTML=`${t('optionN')} ${'ABCDEFGH'[n]}<input type=text class=a_o>`;$('#a_opts').appendChild(l)}return}
else if(a==='addprev')return addPreview();else if(a==='addsave')return addSave();else if(a==='editsave')return editSave();else if(a==='movesave')return moveSave();
else if(a==='impq')return openSheet({type:'imp',tab:'file',step:'pick'});
else if(a==='imptab')return openSheet({type:'imp',tab:v,step:'pick'});
else if(a==='runfile')return runFile();else if(a==='runpack')return runPack();
else if(a==='errdl'){const r=S.sheet.errs||[];dl(`import-errors-${day()}.csv`,'row,problem\n'+r.map(x=>`${x.row},"${String(x.problem).replace(/"/g,'""')}"`).join('\n'));return}
else if(a.startsWith('tax'))return taxAct(a,el.dataset.k,v);
else return;
if(S.page!=='library'||['ltab','tog','selall','lclear','more','page'].includes(a)||a==='page'){render()}else render();
if(['next','prev','skip','jump','start','br','page'].includes(a))top0()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;S.evt=e.target;const a=b.dataset.a;if(a==='sclose'&&b.classList.contains('ov2')&&e.target!==b)return;act(a,b.dataset.v,b)});
document.addEventListener('input',e=>{const c=e.target.dataset.c;if(c==='zoom'){S.zoom=+e.target.value;$('#app').style.zoom=S.zoom/100;const z=$('#zv');if(z)z.textContent=S.zoom+'%'}
 else if(c==='lq'){S.lib.q=e.target.value;S.lib.n=60;$('#liblist').innerHTML=libList()}else if(c==='tq'){S.lib.tq=e.target.value;$('#taxlist').innerHTML=taxList()}});
document.addEventListener('change',async e=>{const el=e.target,c=el.dataset.c;
if(el.id==='i_f'&&el.files[0])return onFilePicked(el.files[0]);if(el.id==='i_p'&&el.files.length)return onPackPicked(el.files);
if(c==='fbr'){const b=el.value;$('#f_ch').innerHTML=`<option value="">${t('unclassified')}</option>`+opts_(R.chapters.filter(x=>x.branch_id===b),'',x=>x.name);return}
if(c==='pimp'){const f=el.files[0];el.value='';if(f)importProgress(f);return}
if(c==='src'){S.src=el.value;S.br=null}else if(c==='zoom'){S.zoom=+el.value;saveSet();return}
else if(c==='dpart'){S.dpart=+el.value;S.part=S.dpart;saveSet();return}else if(c==='dsrc'){S.dsrc=el.value;S.src=S.dsrc||'all';S.lib.src=S.dsrc;S.br=S.dbr||null;saveSet();return}else if(c==='dbr'){S.dbr=el.value;S.br=S.dbr||null;S.lib.br=S.dbr;S.lib.ch='';saveSet();return}
else if(c==='lsrc')S.lib.src=el.value;else if(c==='lbr'){S.lib.br=el.value;S.lib.ch=''}else if(c==='lch')S.lib.ch=el.value;else if(c==='lst')S.lib.st=el.value;else return;
S.lib.n=60;render()});
document.addEventListener('keydown',e=>{if(S.sheet||S.dlg){if(e.key==='Escape'){S.dlg?dno():closeSheet()}if(e.key==='Enter'&&S.dlg&&e.target.tagName==='INPUT')dyes();return}
 if(S.page!=='practice'||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const q=curQ();if(!q)return;const nx=S.lang==='ar'?'ArrowLeft':'ArrowRight',pv=S.lang==='ar'?'ArrowRight':'ArrowLeft';
 if(e.key===nx)act('skip');else if(e.key===pv)act('prev');else if(e.key==='Enter')act(stOf(q).rev?'next':'ans');else{const l=e.key.toUpperCase();if(letters(q).includes(l))act('sel',l)}});
matchMedia('(prefers-color-scheme: dark)').addEventListener&&matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyUI);
if('serviceWorker'in navigator&&!DEMO&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
boot();

/* block double-tap zoom, keep pinch zoom */
(function(){let last=0;const skip='button,a,input,select,textarea,label,summary,[data-a]';
document.addEventListener('touchend',function(e){if(e.touches.length||e.changedTouches.length!==1)return;const n=Date.now();
if(n-last<350&&!(e.target.closest&&e.target.closest(skip)))e.preventDefault();last=n},{passive:false});
document.addEventListener('dblclick',function(e){if(!(e.target.closest&&e.target.closest('input,textarea,select')))e.preventDefault()},{passive:false})})();

/* landscape phones: hide the bottom action bar while scrolling down, show it again on scroll up / at the end */
(function(){const last=new WeakMap();let lw=0;
const PH=matchMedia('(orientation:landscape) and (max-height:500px)');
document.addEventListener('scroll',function(e){if(S.page!=='practice'||!PH.matches)return;const d=e.target===document?document.scrollingElement:e.target;if(!d||d.scrollTop===undefined)return;
 const y=d.scrollTop,p=last.has(d)?last.get(d):y;last.set(d,y);const dy=y-p,end=y+d.clientHeight>=d.scrollHeight-12;
 if(y<40||end||dy<-6)document.body.classList.remove('abhide');else if(dy>6)document.body.classList.add('abhide')},true)})();
