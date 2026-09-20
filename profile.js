function setPosterImage(id,ref){const src=asset(ref),el=$(id);el.hidden=!src;if(src)el.src=src;else el.removeAttribute('src');}
function bookArtwork(){return '<svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi kitab"><rect x="5" y="4" width="70" height="82" rx="3" fill="#0b594d"/><rect x="10" y="9" width="60" height="72" rx="2" fill="none" stroke="#d9bd68" stroke-width="2"/><path d="M40 18L60 40L40 62L20 40Z" fill="none" stroke="#d9bd68"/><path d="M20 32Q30 28 40 35Q50 28 60 32V48Q50 44 40 51Q30 44 20 48Z" fill="#e7d695"/><path d="M40 35V51" stroke="#0b594d"/><path d="M26 71H54" stroke="#d9bd68" stroke-width="2"/></svg>';}
function examplePortrait(){const c=document.createElement('canvas');c.width=180;c.height=200;const x=c.getContext('2d');x.fillStyle='#dbe5de';x.fillRect(0,0,180,200);x.fillStyle='#8ca69b';x.beginPath();x.arc(90,69,34,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(90,200,72,88,0,0,Math.PI*2);x.fill();return c.toDataURL('image/png');}
function setSlotType(type){const known=[...$('typeSel').options].some(x=>x.value===type);$('typeSel').value=known?type:'__custom__';$('customTypeInput').hidden=known;$('customTypeInput').value=known?'':type;}
function ruleLabel(r){return dayLabel(r.day)+(r.nth?(appLanguage==='en'?' '+['','first','second','third','fourth','fifth'][r.nth]:' ke-'+r.nth):(appLanguage==='en'?' every week':' setiap minggu'))+' · '+r.type;}
function ruleConflict(rules){
 for(let day=0;day<7;day++)for(let nth=1;nth<=5;nth++)if(rules.filter(r=>r.day===day&&(r.nth===0||r.nth===nth)).length>2)return 'Lebih dua sesi pada '+DAYS[day]+' ke-'+nth+'. Ubah aturan supaya setiap tarikh mempunyai maksimum dua sesi.';
 return '';
}
function refreshProfileUI(){
 $('profileSel').innerHTML=workspace.projects.map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.profile.masjidName)}</option>`).join('');$('profileSel').value=project.id;
 $('librarySel').innerHTML='<option value="">Nama sendiri / penceramah lain</option>'+project.library.map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.speaker.replace(/\n/g,' '))}</option>`).join('');
 $('rulesList').innerHTML=project.rules.length?project.rules.slice().sort((a,b)=>((a.day+6)%7)-((b.day+6)%7)||a.nth-b.nth).map(r=>`<div class="rule-item"><b>${escapeHtml(ruleLabel(r))}</b>${escapeHtml(r.speaker||r.topic)}</div>`).join(''):'<p class="muted">Belum ada aturan. Tambah sesi mingguan atau hari tertentu dalam bulan.</p>';
 $('setupHint').hidden=project.profile.masjidName!==DEFAULT_PROFILE.masjidName||project.rules.length>0||Object.values(current?.entries||{}).some(x=>x.length);
 $('applyRulesBtn').disabled=!project.rules.length;$('profileBrand').textContent=project.profile.masjidName;
}
function activateProject(id){
 if(!discardDraft()){$('profileSel').value=project.id;return false;}
 const next=workspace.projects.find(p=>p.id===id);if(!next)return false;project=next;current=project.months[project.active];selectedDate=1;selectedSlot=0;editMode='slot';formDirty=false;syncMonthControls();refreshProfileUI();renderPoster();fillEditor();persist();return true;
}
function newProfile(example=false){
 if(!example){$('newProfileName').value='';$('newProfileDialog').showModal();return;}
 if(!discardDraft())return;formDirty=false;
 const q=createProject('MASJID CONTOH');q.profile.address='PROFIL DEMONSTRASI · BOLEH DISUNTING';
 const examples=[['PENCERAMAH A','Tafsir Al-Quran',1,1,'Kuliah Maghrib'],['PENCERAMAH B','Fiqh Ibadah',3,2,'Kuliah Maghrib'],['PENCERAMAH C','Adab & Akhlak',0,1,'Kuliah Subuh'],['PENCERAMAH D','Pengajian Hadis',6,3,'Kuliah Subuh']];
 const photo=examplePortrait();q.library=examples.map(([speaker,topic,,,type])=>({...normalSlot({speaker,topic,type,photo}),id:uid()}));
 q.rules=examples.map(([speaker,topic,day,nth,type])=>({...normalSlot({speaker,topic,type,photo}),id:uid(),day,nth}));
 q.rules.push({...normalSlot({type:'Bacaan Yasin & Tahlil',topic:'BACAAN YASIN\n& TAHLIL'}),id:uid(),day:4,nth:0},{...normalSlot({type:'Tazkirah Jumaat',topic:'UMUM'}),id:uid(),day:5,nth:0});
 q.active=monthKey(current.year,current.month);q.months={[q.active]:generateMonth(current.year,current.month,q.rules)};
 workspace.projects.push(q);activateProject(q.id);toast('Profil contoh ditambah. Semua nama ialah contoh.');
}
function applyRules(){
 if(!discardDraft())return;const fresh=generateMonth(current.year,current.month),keep=new Set(current.changedDays);
 for(const d of Object.keys(current.banners))keep.add(+d);
 for(const day of keep){if(current.entries[day])fresh.entries[day]=clone(current.entries[day]);else delete fresh.entries[day];if(current.banners[day])fresh.banners[day]=clone(current.banners[day]);}
 fresh.changedDays=[...keep];fresh.dirty=keep.size>0;current=fresh;project.months[project.active]=current;selectedSlot=0;editMode='slot';persist();renderPoster();fillEditor();refreshProfileUI();toast('Aturan diterapkan. '+keep.size+' tarikh yang disunting dikekalkan.');
}
function openSettings(){
 const p=project.profile,s=project.settings;$('posterTitleInput').value=p.posterTitle;$('masjidNameInput').value=p.masjidName;$('addressInput').value=p.address;$('phoneInput').value=p.phone;$('bgColorInput').value=s.bgTop;$('bgBottomInput').value=s.bgBottom;$('compactCheck').checked=s.compact;
 ['clearBgCheck','clearLogosCheck','clearMosqueCheck'].forEach(id=>$(id).checked=false);['logosInput','mosqueInput','bgImageInput'].forEach(id=>$(id).value='');
 $('colorPickers').innerHTML=Object.entries(s.colors).map(([type,color],i)=>`<div class="color-setting"><label for="color-${i}">${escapeHtml(type)}</label><input id="color-${i}" data-color="${escapeHtml(type)}" type="color" value="${colorValue(color,'#576a80')}"></div>`).join('');$('settingsDialog').showModal();
}
async function saveSettings(e){
 e.preventDefault();const owner=project,form=e.currentTarget,button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;
 try{
  const p=clone(owner.profile),s=clone(owner.settings),logo=$('logosInput').files[0],mosque=$('mosqueInput').files[0],bg=$('bgImageInput').files[0];p.posterTitle=$('posterTitleInput').value.trim()||DEFAULT_PROFILE.posterTitle;p.masjidName=$('masjidNameInput').value.trim()||DEFAULT_PROFILE.masjidName;p.address=$('addressInput').value.trim();p.phone=$('phoneInput').value.trim();
  if($('clearLogosCheck').checked)p.logos=null;if($('clearMosqueCheck').checked)p.masjidPhoto=null;if($('clearBgCheck').checked)s.bgImage=null;
  s.bgTop=$('bgColorInput').value;s.bgBottom=$('bgBottomInput').value;s.compact=$('compactCheck').checked;form.querySelectorAll('[data-color]').forEach(el=>s.colors[el.dataset.color]=el.value);
  if(logo)p.logos=await upload(logo,900);if(mosque)p.masjidPhoto=await upload(mosque,1400);if(bg)s.bgImage=await upload(bg,2200);
  owner.profile=p;owner.settings=s;persist();if(project===owner){refreshProfileUI();renderPoster();$('settingsDialog').close();}toast('Profil dan tetapan poster disimpan.');
 }catch(e){toast(e.message);}finally{button.disabled=false;}
}
let editingLibraryId=null,editingRuleId=null,libraryPhoto=null,rulePhoto=null;
function libraryList(){
 $('libraryItems').innerHTML=project.library.length?project.library.map(p=>`<button type="button" class="manager-item ${p.id===editingLibraryId?'active':''}" data-person="${escapeHtml(p.id)}"><strong>${escapeHtml(p.speaker)}</strong><span>${escapeHtml(p.topic)}</span></button>`).join(''):'<p class="muted">Simpan nama dan gambar supaya boleh digunakan semula.</p>';
}
function editLibrary(id=null){
 editingLibraryId=id;const p=project.library.find(p=>p.id===id)||{speaker:'',topic:'',type:'Kuliah Maghrib',photo:null};libraryPhoto=p.photo;$('personName').value=p.speaker;$('personTopic').value=p.topic;$('personType').value=p.type;$('personPhotoInput').value='';$('personRemovePhoto').checked=false;setPosterImage('personPhotoPreview',p.photo);$('deletePersonBtn').hidden=!id;libraryList();
}
function openLibrary(){editLibrary();$('libraryDialog').showModal();}
async function savePerson(e){
 e.preventDefault();const owner=project,id=editingLibraryId,button=$('savePersonBtn');if(button.disabled)return;button.disabled=true;
 try{const data={...normalSlot({speaker:$('personName').value.trim(),topic:$('personTopic').value.trim(),type:$('personType').value.trim(),photo:$('personRemovePhoto').checked?null:libraryPhoto}),id:id||uid()},file=$('personPhotoInput').files[0];if(!data.speaker)throw Error('Isi nama penceramah.');if(file)data.photo=await upload(file,900);
  const index=owner.library.findIndex(p=>p.id===id);if(index<0)owner.library.push(data);else owner.library[index]=data;persist();if(project===owner){refreshProfileUI();editLibrary(data.id);}toast('Penceramah disimpan. Kuliah sedia ada kekal seperti disunting.');
 }catch(e){toast(e.message);}finally{button.disabled=false;}
}
function rulesManagerList(){
 $('ruleItems').innerHTML=project.rules.length?project.rules.map(r=>`<button type="button" class="manager-item ${r.id===editingRuleId?'active':''}" data-rule="${escapeHtml(r.id)}"><strong>${escapeHtml(ruleLabel(r))}</strong><span>${escapeHtml(r.speaker||r.topic)}</span></button>`).join(''):'<p class="muted">Contoh: Kuliah Maghrib pada Isnin ketiga, atau Yasin setiap Khamis.</p>';
}
function editRule(id=null){
 editingRuleId=id;const r=project.rules.find(r=>r.id===id)||{day:1,nth:1,type:'Kuliah Maghrib',speaker:'',topic:'',photo:null};rulePhoto=r.photo;
 $('ruleDay').value=r.day;$('ruleNth').value=r.nth;$('ruleType').value=r.type;$('ruleSpeaker').value=r.speaker;$('ruleTopic').value=r.topic;$('rulePhotoInput').value='';$('ruleRemovePhoto').checked=false;setPosterImage('rulePhotoPreview',r.photo);
 $('ruleLibrary').innerHTML='<option value="">Isi sendiri / tanpa penceramah</option>'+project.library.map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.speaker)}</option>`).join('');$('deleteRuleBtn').hidden=!id;rulesManagerList();
}
function openRules(){editRule();$('rulesDialog').showModal();}
async function saveRule(e){
 e.preventDefault();const owner=project,id=editingRuleId,button=$('saveRuleBtn');if(button.disabled)return;button.disabled=true;
 try{const type=$('ruleType').value.trim();if(!type)throw Error('Isi sesi / program.');const r={...normalSlot({type,speaker:$('ruleSpeaker').value.trim(),topic:$('ruleTopic').value.trim(),photo:$('ruleRemovePhoto').checked?null:rulePhoto}),id:id||uid(),day:+$('ruleDay').value,nth:+$('ruleNth').value},file=$('rulePhotoInput').files[0];if(file)r.photo=await upload(file,900);
  const next=owner.rules.filter(x=>x.id!==id);next.push(r);const conflict=ruleConflict(next);if(conflict)throw Error(conflict);owner.rules=next;if(!Object.hasOwn(owner.settings.colors,type))Object.defineProperty(owner.settings.colors,type,{value:'#73509e',writable:true,enumerable:true,configurable:true});persist();if(project===owner){refreshProfileUI();editRule(r.id);}toast('Aturan disimpan. Terapkan pada bulan ini apabila sedia.');
 }catch(e){toast(e.message);}finally{button.disabled=false;}
}
function bindProfiles(){
 $('profileSel').onchange=()=>activateProject($('profileSel').value);$('newProfileBtn').onclick=()=>newProfile();$('exampleBtn').onclick=()=>newProfile(true);$('setupBtn').onclick=openSettings;
 $('newProfileForm').onsubmit=e=>{e.preventDefault();const name=$('newProfileName').value.trim();if(!name||!discardDraft())return;formDirty=false;const q=createProject(name);workspace.projects.push(q);$('newProfileDialog').close();activateProject(q.id);openSettings();};
 $('deleteProfileBtn').onclick=()=>{if(!discardDraft()||!confirm('Padam profil '+project.profile.masjidName+' dan semua jadualnya pada peranti ini? Simpan Data dahulu jika diperlukan.'))return;workspace.projects=workspace.projects.filter(p=>p!==project);if(!workspace.projects.length)workspace.projects.push(createProject());formDirty=false;activateProject(workspace.projects[0].id);};
 $('applyRulesBtn').onclick=applyRules;$('rulesBtn').onclick=openRules;$('quickRulesBtn').onclick=openRules;$('libraryBtn').onclick=openLibrary;$('saveAllDataBtn').onclick=()=>{if(formDirty)toast('Simpan perubahan borang dahulu sebelum membuat sandaran.');else exportWorkspace();};
 $('personForm').onsubmit=savePerson;$('newPersonBtn').onclick=()=>editLibrary();$('libraryItems').onclick=e=>{const b=e.target.closest('[data-person]');if(b)editLibrary(b.dataset.person);};
 $('deletePersonBtn').onclick=()=>{if(!confirm('Buang penceramah daripada senarai? Jadual dan aturan sedia ada dikekalkan.'))return;project.library=project.library.filter(p=>p.id!==editingLibraryId);persist();refreshProfileUI();editLibrary();};
 $('ruleDay').innerHTML=[1,2,3,4,5,6,0].map(d=>`<option value="${d}">${dayLabel(d)}</option>`).join('');$('ruleForm').onsubmit=saveRule;$('newRuleBtn').onclick=()=>editRule();$('ruleItems').onclick=e=>{const b=e.target.closest('[data-rule]');if(b)editRule(b.dataset.rule);};
 $('ruleLibrary').onchange=()=>{const p=project.library.find(x=>x.id===$('ruleLibrary').value);if(!p)return;$('ruleSpeaker').value=p.speaker;$('ruleTopic').value=p.topic;$('ruleType').value=p.type;rulePhoto=p.photo;$('rulePhotoInput').value='';$('ruleRemovePhoto').checked=false;setPosterImage('rulePhotoPreview',p.photo);};
 $('deleteRuleBtn').onclick=()=>{if(!confirm('Padam aturan ini? Bulan yang sudah dijana dikekalkan sehingga aturan diterapkan semula.'))return;project.rules=project.rules.filter(r=>r.id!==editingRuleId);persist();refreshProfileUI();editRule();};
 $('applyRulesDialogBtn').onclick=()=>{applyRules();$('rulesDialog').close();};
}
