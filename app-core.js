'use strict';
const $=id=>document.getElementById(id);
const MONTH_NAMES=['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const DAYS=['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const DEFAULT_COLORS={'Kuliah Subuh':'#007aa3','Kuliah Maghrib':'#ed0b58','Tazkirah Jumaat':'#007aa3','Bacaan Yasin & Tahlil':'#00a99d','Ceramah Perdana':'#bd742d','Kuliah Khas':'#73509e'};
const DEFAULT_DONATION={enabled:false,qr:null,heading:'INFAQ UNTUK MASJID',message:'Imbas untuk menyumbang',recipient:'',placement:'auto',fallback:'footer'};
const DEFAULT_PROFILE={masjidName:'MASJID ANDA',posterTitle:'JADUAL KULIAH PENGAJIAN',address:'',phone:'',logos:null,masjidPhoto:null,donation:{...DEFAULT_DONATION}};
const DEFAULT_SETTINGS={colors:{...DEFAULT_COLORS},bgTop:'#0e2642',bgBottom:'#537793',bgImage:null,compact:true,paperSize:'A3'};
const STORAGE_KEY='jkg_public_v3';
const uid=()=>crypto.randomUUID?crypto.randomUUID():'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const clone=value=>JSON.parse(JSON.stringify(value));
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,min,max,def)=>Number.isFinite(Number(n))?Math.min(max,Math.max(min,Number(n))):def;
const colorValue=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:fallback;
function asset(ref){if(typeof ref!=='string')return '';if(ref.startsWith('@'))return ASSETS[ref.slice(1)]||'';return /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(ref)?ref:'';}
function imageHTML(ref,attrs=''){const src=asset(ref);return src?`<img src="${src}" ${attrs}>`:'';}
function monthKey(year,month){return year+'-'+String(month+1).padStart(2,'0');}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function nthDay(y,m,day,nth){const n=1+(day-new Date(y,m,1).getDay()+7)%7+(nth-1)*7;return n<=daysInMonth(y,m)?n:null;}
function storedRuleConflict(rules){
 for(let day=0;day<7;day++)for(let nth=1;nth<=5;nth++)if(rules.filter(r=>r.day===day&&(r.nth===0||r.nth===nth)).length>2)return true;
 return false;
}
function slotFrom(person){return {type:person.type,speaker:person.speaker,topic:person.topic,photo:person.photo||null,photoFit:'cover',photoZoom:1,photoY:50,fontScale:1,source:'default'};}
function generateMonth(year,month,rules=project.rules){
 const entries={};
 for(const rule of rules)for(const nth of (rule.nth===0?[1,2,3,4,5]:[rule.nth])){
  const day=nthDay(year,month,rule.day,nth);if(day)(entries[day]??=[]).push({...normalSlot(rule),source:'default'});
 }
 for(const slots of Object.values(entries))slots.sort((a,b)=>sessionOrder(a.type)-sessionOrder(b.type));
 return {year,month,entries,banners:{},changedDays:[],source:'default',dirty:false};
}
function sessionOrder(type){return ({'Kuliah Subuh':0,'Tazkirah Jumaat':1,'Kuliah Maghrib':2,'Bacaan Yasin & Tahlil':2})[type]??3;}
function createProject(name='MASJID ANDA'){
 const now=new Date(),year=now.getFullYear(),month=now.getMonth(),active=monthKey(year,month);
 return {format:'jadual-kuliah-generator',version:3,id:uid(),active,profile:{...clone(DEFAULT_PROFILE),masjidName:name},settings:clone(DEFAULT_SETTINGS),library:[],rules:[],months:{[active]:generateMonth(year,month,[])}};
}
let project=createProject();
let workspace={format:'jadual-kuliah-workspace',version:3,activeId:project.id,projects:[project]};
let current,selectedDate=1,selectedSlot=0,editMode='slot',draftPhoto=null,draftBanner=null,formDirty=false,saving=false,toastTimer,saveTimer,draftDonationQr=null,donationUploadPending=false,donationUploadVersion=0;
const titleReady=Promise.resolve();
function drawTitle(){
 const text=project.profile.posterTitle||DEFAULT_PROFILE.posterTitle,c=document.createElement('canvas');c.width=2100;c.height=170;
 const ctx=c.getContext('2d');let size=112;ctx.font=`900 ${size}px "Arial Black", Arial, sans-serif`;
 while(ctx.measureText(text.toUpperCase()).width>2020&&size>30)ctx.font=`900 ${--size}px "Arial Black", Arial, sans-serif`;
 ctx.fillStyle='#ffe222';ctx.shadowColor='#0009';ctx.shadowBlur=10;ctx.shadowOffsetY=9;ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(text.toUpperCase(),2070,78);
 $('posterTitleArtwork').src=c.toDataURL('image/png');$('posterTitleArtwork').alt=text;
}
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4000);}
function normalSlot(s){return {type:String(s.type||'Kuliah Maghrib').slice(0,80),speaker:String(s.speaker||'').slice(0,120),topic:String(s.topic||'').slice(0,200),photo:asset(s.photo)?s.photo:null,photoFit:s.photoFit==='contain'?'contain':'cover',photoZoom:clamp(s.photoZoom,1,1.6,1),photoY:clamp(s.photoY,0,100,50),fontScale:clamp(s.fontScale,.85,1.2,1),source:s.source==='default'?'default':'manual'};}
function normalMonth(m){
 const year=clamp(m.year,2020,2100,2026)|0,month=clamp(m.month,0,11,0)|0,n=daysInMonth(year,month);const out={year,month,entries:{},banners:{},changedDays:Array.isArray(m.changedDays)?m.changedDays.filter(d=>Number.isInteger(d)&&d>=1&&d<=n):[],source:['import','default','example'].includes(m.source)?m.source:'import',dirty:!!m.dirty};
 for(const [d,slots] of Object.entries(m.entries||{}))if(/^\d+$/.test(d)&&+d>=1&&+d<=n&&Array.isArray(slots))out.entries[d]=slots.slice(0,2).map(normalSlot);
 for(const [d,b] of Object.entries(m.banners||{}))if(/^\d+$/.test(d)&&+d>=1&&+d<=n&&b&&asset(b.img))out.banners[d]={img:b.img,imgFit:b.imgFit==='contain'?'contain':'cover',mode:b.mode==='mixed'?'mixed':'full',topic:String(b.topic||'').slice(0,120),speaker:String(b.speaker||'').slice(0,120),speakerPhoto:asset(b.speakerPhoto)?b.speakerPhoto:null};
 return out;
}
function normalProject(p){
 if(!p||p.format!=='jadual-kuliah-generator'||!p.months||typeof p.months!=='object')throw Error('Format data tidak dikenali.');
 const q=createProject();q.id=typeof p.id==='string'&&/^[a-z0-9-]{1,80}$/i.test(p.id)?p.id:uid();q.months={};
 for(const m of Object.values(p.months)){if(!m||typeof m!=='object')continue;const n=normalMonth(m);q.months[monthKey(n.year,n.month)]=n;}
 if(!Object.keys(q.months).length)throw Error('Fail tiada jadual yang boleh dibuka.');
 q.active=Object.hasOwn(q.months,p.active)?p.active:Object.keys(q.months)[0];const pr=p.profile||{};
 q.profile={masjidName:String(pr.masjidName||DEFAULT_PROFILE.masjidName).slice(0,140),posterTitle:String(pr.posterTitle||DEFAULT_PROFILE.posterTitle).slice(0,70),address:String(pr.address??'').slice(0,240),phone:String(pr.phone??'').slice(0,35),logos:asset(pr.logos)?pr.logos:null,masjidPhoto:asset(pr.masjidPhoto)?pr.masjidPhoto:null,donation:normalDonation(pr.donation)};
 const st=p.settings||{};q.settings={...clone(DEFAULT_SETTINGS),bgTop:colorValue(st.bgTop,DEFAULT_SETTINGS.bgTop),bgBottom:colorValue(st.bgBottom,DEFAULT_SETTINGS.bgBottom),bgImage:asset(st.bgImage)?st.bgImage:null,compact:st.compact!==false,paperSize:st.paperSize==='A4'?'A4':'A3'};
 for(const [key,value] of Object.entries(st.colors||{}))if(key.length<=80&&/^#[0-9a-f]{6}$/i.test(value))Object.defineProperty(q.settings.colors,key,{value,writable:true,enumerable:true,configurable:true});
 q.library=(Array.isArray(p.library)?p.library:[]).slice(0,300).filter(x=>x&&typeof x==='object').map(x=>({...normalSlot(x),id:uid()}));
 q.rules=(Array.isArray(p.rules)?p.rules:[]).slice(0,100).filter(x=>x&&typeof x==='object').map(x=>({...normalSlot(x),id:uid(),day:clamp(x.day,0,6,1)|0,nth:clamp(x.nth,0,5,0)|0}));
 if(storedRuleConflict(q.rules))throw Error('Aturan mempunyai lebih dua sesi pada tarikh yang sama.');return q;
}
function normalDonation(value){
 if(!value||typeof value!=='object')return {...DEFAULT_DONATION};
 return {enabled:value.enabled!==false,qr:asset(value.qr)?value.qr:null,heading:String(value.heading??DEFAULT_DONATION.heading).slice(0,48),message:String(value.message??DEFAULT_DONATION.message).slice(0,96),recipient:String(value.recipient??DEFAULT_DONATION.recipient).slice(0,140),placement:value.placement==='footer'?'footer':'auto',fallback:value.fallback==='hide'?'hide':'footer'};
}
try{
 const stored=localStorage.getItem(STORAGE_KEY);if(stored){const w=JSON.parse(stored);if(w.format!=='jadual-kuliah-workspace'||!Array.isArray(w.projects)||!w.projects.length)throw Error('Data tidak sah.');
  const projects=w.projects.map(normalProject);if(new Set(projects.map(p=>p.id)).size!==projects.length)throw Error('Profil bertindih.');workspace={format:'jadual-kuliah-workspace',version:3,activeId:w.activeId,projects};project=projects.find(p=>p.id===w.activeId)||projects[0];workspace.activeId=project.id;
 }
}catch(e){$('storageWarning').hidden=false;$('storageWarning').textContent='Simpanan pelayar tidak dapat dibuka. Gunakan Buka Data jika ada salinan sandaran.';}
current=project.months[project.active];
function persist(){
 clearTimeout(saveTimer);workspace.activeId=project.id;
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(workspace));$('saveStatus').textContent='Disimpan pada peranti ini';$('storageWarning').hidden=true;}
 catch(e){$('saveStatus').textContent='Belum disimpan';$('storageWarning').hidden=false;$('storageWarning').textContent='Storan pelayar penuh atau tidak tersedia. Jadual masih terbuka. Tekan Simpan Data sebelum menutup halaman.';}
}
function markChanged(){current.dirty=true;if(!current.changedDays.includes(selectedDate))current.changedDays.push(selectedDate);persist();}
function resolveColor(type){return colorValue(project.settings.colors[type], '#576a80');}
function slotHTML(slot,dual,index){
 const color=resolveColor(slot.type),photo=asset(slot.photo),pending=slot.type==='Tazkirah Jumaat'&&!slot.speaker;
 if(slot.type==='Bacaan Yasin & Tahlil')return `<div class="slot yasin-slot" style="--slot-color:${color}"><div class="slot-band"><div class="slot-info"><div class="slot-topic">${escapeHtml(slot.topic||'BACAAN YASIN\n& TAHLIL')}</div><div class="slot-name">${escapeHtml(slot.speaker)}</div></div></div><div class="portrait">${photo?imageHTML(slot.photo,'alt="Gambar program"'):bookArtwork()}</div></div>`;
 const typeLabel=dual?slot.type:slot.type.replace('Kuliah ','KULIAH\n').replace('Tazkirah Jumaat','TAZKIRAH\nJUMAAT');
 return `<div class="slot ${dual&&index===1?'reverse':''} ${!photo?'no-photo':''} ${pending?'pending':''}" style="--slot-color:${color};--font-scale:${clamp(slot.fontScale,.85,1.2,1)}"><div class="slot-title">${escapeHtml(typeLabel)}</div><div class="slot-band"><div class="slot-info"><div class="slot-topic">${escapeHtml(pending?'Penceramah belum\nditetapkan':slot.topic)}</div><div class="slot-name">${escapeHtml(slot.speaker)}</div></div></div>${photo?`<div class="portrait"><img src="${photo}" alt="${escapeHtml(slot.speaker.replace(/\n/g,' '))}" style="object-fit:${slot.photoFit==='contain'?'contain':'cover'};object-position:50% ${clamp(slot.photoY,0,100,50)}%;transform:scale(${clamp(slot.photoZoom,1,1.6,1)})"></div>`:''}</div>`;
}
function monthCells(year,month,compact){
 const offset=(new Date(year,month,1).getDay()+6)%7,n=daysInMonth(year,month),rows=Math.ceil((offset+n)/7),lastStart=(rows-1)*7-offset+1,lastCount=n-lastStart+1,cells=[];
 if(compact&&offset>0&&rows>4&&lastCount<=offset){for(let d=lastStart;d<=n;d++)cells.push(d);if(offset>lastCount)cells.push({span:offset-lastCount});for(let d=1;d<lastStart;d++)cells.push(d);return {rows:rows-1,cells};}
 if(offset)cells.push({span:offset});for(let d=1;d<=n;d++)cells.push(d);const trailing=rows*7-offset-n;if(trailing)cells.push({span:trailing});return {rows,cells};
}
let layoutFrame;
function donationLocation(layout,donation){
 if(!donation.enabled||!asset(donation.qr))return {kind:'none',reason:donation.enabled?'missing':'disabled'};
 if(donation.placement==='footer')return {kind:'footer'};
 let index=-1,span=1;
 layout.cells.forEach((cell,i)=>{if(typeof cell==='object'&&cell.span>=2&&cell.span>=span){index=i;span=cell.span;}});
 if(index>=0)return {kind:'cell',index,span};
 return donation.fallback==='footer'?{kind:'footer'}:{kind:'none',reason:'space'};
}
function donationHTML(donation){
 return `<div class="donation-block"><div class="donation-content"><div class="donation-code">${imageHTML(donation.qr,'class="donation-qr" alt="QR untuk sumbangan infaq"')}</div><div class="donation-copy"><div class="donation-heading">${escapeHtml(donation.heading)}</div><div class="donation-message">${escapeHtml(donation.message)}</div><div class="donation-recipient">${escapeHtml(donation.recipient)}</div></div></div></div>`;
}
function renderPoster(){
 const st=project.settings,p=project.profile;const el=$('poster');
 el.style.backgroundImage=st.bgImage?`url("${asset(st.bgImage)}")`:`linear-gradient(${st.bgTop} 20%,${st.bgBottom} 100%)`;el.style.backgroundSize='cover';el.style.backgroundPosition='center';
 setPosterImage('headerLogos',p.logos);setPosterImage('headerMasjidPhoto',p.masjidPhoto);$('genericMosque').hidden=!!asset(p.masjidPhoto);drawTitle();$('posterMasjidName').textContent=p.masjidName.toUpperCase();$('profileBrand').textContent=p.masjidName;
 $('monthPillText').textContent=MONTH_NAMES[current.month].toUpperCase()+' '+current.year;$('headerAddressText').textContent=p.address;$('headerPhoneText').textContent=p.phone?'NO. TELEFON:\n'+p.phone:'';$('headerPhoneText').hidden=!p.phone;
 $('dowRow').innerHTML=[1,2,3,4,5,6,0].map(d=>`<div class="dow">${DAYS[d].toUpperCase()}</div>`).join('');
 const layout=monthCells(current.year,current.month,st.compact),donation=normalDonation(p.donation),location=donationLocation(layout,donation),footer=location.kind==='footer';$('grid').style.gridTemplateRows=`repeat(${layout.rows},minmax(0,1fr))`;el.classList.toggle('six-rows',layout.rows===6||(footer&&layout.rows>=5));el.classList.toggle('donation-footer-mode',footer);
 $('donationFooter').hidden=!footer;$('donationFooter').innerHTML=footer?donationHTML(donation):'';
 $('donationStatus').textContent=location.kind==='cell'?'QR di ruang tanpa tarikh ('+location.span+' petak).':footer?'QR di jalur bawah poster.':location.reason==='space'?'QR disembunyikan: tiada ruang tanpa tarikh yang cukup.':location.reason==='missing'?'QR belum dimuat naik.':'Ruang infaq dimatikan.';
 $('grid').innerHTML=layout.cells.map((d,index)=>{
  if(typeof d==='object')return `<div class="cell empty-span ${location.kind==='cell'&&location.index===index?'donation-cell':''}" style="grid-column:span ${d.span}">${location.kind==='cell'&&location.index===index?donationHTML(donation):''}</div>`;
  const slots=current.entries[d]||[],banner=current.banners[d],yasin=!banner&&slots.length===1&&slots[0].type==='Bacaan Yasin & Tahlil';
  let html=`<div class="datebadge">${d}</div>`;
  if(banner){html+=imageHTML(banner.img,`class="event-image" alt="${escapeHtml(banner.topic||'Acara khas')}" style="object-fit:${banner.imgFit==='contain'?'contain':'cover'}"`);if(banner.mode==='mixed')html+=slots.slice(0,1).map(s=>slotHTML(s,true,1)).join('');else if(banner.topic||banner.speaker)html+=`<div class="event-caption">${escapeHtml([banner.topic,banner.speaker].filter(Boolean).join(' · '))}</div>`;}
  else html+=slots.map((s,i)=>slotHTML(s,slots.length>1,i)).join('');
  return `<div class="cell ${slots.length>1&&!banner?'two-slots':''} ${yasin?'yasin-cell':''} ${banner?.mode==='mixed'?'mixed-cell':''} ${d===selectedDate?'selected':''}" data-day="${d}" tabindex="0" role="button" aria-label="Sunting ${DAYS[new Date(current.year,current.month,d).getDay()]} ${d} ${MONTH_NAMES[current.month]}">${html}</div>`;
 }).join('');
 cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{fitText();drawCellShadows();resizePreview();});updateStatus();
}
function drawCellShadows(){
 let im=$('cellShadowArtwork');if(!im){im=document.createElement('img');im.id='cellShadowArtwork';im.alt='';im.setAttribute('aria-hidden','true');$('poster').append(im);}
 const grid=$('grid'),rects=[...grid.querySelectorAll('.cell:not(.empty-span)')].map(c=>`<rect x="${grid.offsetLeft+c.offsetLeft}" y="${grid.offsetTop+c.offsetTop+2}" width="${c.offsetWidth}" height="${c.offsetHeight}" rx="10"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="877"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="1.7"/></filter></defs><g fill="#000" opacity=".42" filter="url(#s)">${rects}</g></svg>`;
 im.src='data:image/svg+xml;base64,'+btoa(svg);
}
function fitText(root=$('poster')){
 const warnings=[];
 for(const title of root.querySelectorAll('.slot-title')){title.style.fontSize='';let guard=0;while((title.scrollHeight>title.clientHeight+1||title.scrollWidth>title.clientWidth+1)&&guard++<25){title.style.fontSize=Math.max(8,parseFloat(getComputedStyle(title).fontSize)-.4)+'px';}if(title.scrollHeight>title.clientHeight+2||title.scrollWidth>title.clientWidth+2)warnings.push(title.closest('.cell')?.dataset.day);}
 for(const box of root.querySelectorAll('.slot-info')){
  const texts=[...box.children];texts.forEach(t=>t.style.fontSize='');
  let guard=0;while((box.scrollHeight>box.clientHeight+1||texts.some(t=>t.scrollWidth>t.clientWidth+1))&&guard++<14){for(const t of texts)t.style.fontSize=Math.max(8,parseFloat(getComputedStyle(t).fontSize)-.3)+'px';}
  if(box.scrollHeight>box.clientHeight+2||texts.some(t=>t.scrollWidth>t.clientWidth+2))warnings.push(box.closest('.cell')?.dataset.day);
 }
 for(const box of root.querySelectorAll('.donation-copy')){
  const texts=[...box.children];texts.forEach(t=>t.style.fontSize='');let guard=0;
  while((box.scrollHeight>box.clientHeight+1||texts.some(t=>t.scrollWidth>t.clientWidth+1))&&guard++<30){for(const t of texts)t.style.fontSize=Math.max(9,parseFloat(getComputedStyle(t).fontSize)-.5)+'px';}
  if(box.scrollHeight>box.clientHeight+2||texts.some(t=>t.scrollWidth>t.clientWidth+2))warnings.push('ruang infaq');
 }
 const name=root.querySelector('#posterMasjidName');if(name&&!name.hidden){name.style.fontSize='26px';let size=26;while(name.scrollWidth>name.clientWidth&&size>13)name.style.fontSize=(size-=.5)+'px';}
 if(name?.scrollWidth>name?.clientWidth+2)warnings.push('nama masjid');
 for(const id of ['headerAddressText','headerPhoneText']){const box=root.querySelector('#'+id);if(!box||box.hidden)continue;box.style.fontSize='10.5px';let size=10.5;while((box.scrollHeight>box.clientHeight+1||box.scrollWidth>box.clientWidth+1)&&size>8)box.style.fontSize=(size-=.25)+'px';if(box.scrollHeight>box.clientHeight+2||box.scrollWidth>box.clientWidth+2)warnings.push(id==='headerAddressText'?'alamat':'telefon');}
 if(root===$('poster')){$('layoutWarning').hidden=!warnings.length;$('layoutWarning').textContent='Teks pada '+layoutWarningLabel(warnings)+' terlalu panjang. Pendekkan teks atau laraskan saiz sebelum eksport.';}
 return warnings;
}
function layoutWarningLabel(warnings){return [...new Set(warnings)].map(value=>/^\d+$/.test(value)?value+' hb':value).join(', ');}
function resizePreview(){const width=$('previewViewport').clientWidth-4,availableHeight=window.innerHeight-$('previewViewport').getBoundingClientRect().top-62,scale=Math.min(width/1240,window.innerWidth>720?Math.max(.3,availableHeight/877):1.35,1.35);$('poster').style.transform=`scale(${scale})`;$('posterWrap').style.width=1240*scale+'px';$('posterWrap').style.height=877*scale+'px';}
