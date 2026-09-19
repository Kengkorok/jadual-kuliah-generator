function updateStatus(){
 $('setupHint').hidden=project.profile.masjidName!==DEFAULT_PROFILE.masjidName||project.rules.length>0||Object.values(current.entries).some(x=>x.length);
 $('previewTitle').textContent=MONTH_NAMES[current.month]+' '+current.year;$('previewSubtitle').textContent='Pratonton poster · '+project.settings.paperSize+' landskap';
 const count=Object.entries(current.entries).filter(([d])=>current.banners[d]?.mode!=='full').flatMap(([,s])=>s).filter(s=>s.type==='Tazkirah Jumaat'&&!s.speaker).length;
 $('pendingNotice').hidden=!count;$('pendingNotice').textContent=count+' penceramah Jumaat belum ditetapkan.';
 $('monthSource').textContent=(current.source==='import'?'Data yang diimport':project.rules.length?project.rules.length+' aturan berulang dalam profil ini':'Mulakan dengan aturan berulang atau isi tarikh sendiri')+(current.dirty?' · ada perubahan bulan ini':'');
 $('dayChangeNote').textContent=current.changedDays.includes(selectedDate)?'Tarikh ini telah diubah untuk bulan ini sahaja.':'';
}
function syncMonthControls(){
 $('monthSel').value=current.month;$('yearInput').value=current.year;$('paperSizeSel').value=project.settings.paperSize;
 $('dateSel').innerHTML=Array.from({length:daysInMonth(current.year,current.month)},(_,i)=>`<option value="${i+1}">${i+1} hb</option>`).join('');selectedDate=Math.min(selectedDate,daysInMonth(current.year,current.month));$('dateSel').value=selectedDate;
}
function discardDraft(){return !formDirty||confirm('Perubahan dalam borang belum disimpan. Abaikan perubahan ini?');}
function switchMonth(year,month){if(!discardDraft()){syncMonthControls();return;}year=clamp(year,2020,2100,2026)|0;const key=monthKey(year,month);if(!project.months[key])project.months[key]=generateMonth(year,month);project.active=key;current=project.months[key];selectedDate=1;selectedSlot=0;editMode='slot';syncMonthControls();renderPoster();fillEditor();persist();}
function selectDay(day){if(!discardDraft())return;selectedDate=+day;selectedSlot=0;editMode=current.banners[day]?'banner':'slot';$('dateSel').value=selectedDate;renderPoster();fillEditor();}
function fillEditor(){
 formDirty=false;$('saveStatus').textContent=$('storageWarning').hidden?'Disimpan pada peranti ini':'Belum disimpan';const slots=current.entries[selectedDate]||[],banner=current.banners[selectedDate];
 $('selectedDayHeading').textContent=DAYS[new Date(current.year,current.month,selectedDate).getDay()]+' '+selectedDate+' hb';
 $('slotTabs').innerHTML=slots.map((s,i)=>`<button type="button" data-slot="${i}" class="${editMode==='slot'&&selectedSlot===i?'active':''}">${escapeHtml(s.type.replace('Kuliah ',''))}</button>`).join('')+(banner?`<button type="button" data-banner class="${editMode==='banner'?'active':''}">Acara</button>`:'');
 $('slotForm').hidden=editMode!=='slot';$('bannerForm').hidden=editMode!=='banner';
 $('addSlotBtn').disabled=slots.length>=2||banner?.mode==='full'||(banner?.mode==='mixed'&&slots.length>=1);$('addBannerBtn').disabled=!!banner;
 if(editMode==='banner'){
  draftBanner=clone(banner||{img:null,mode:'full',imgFit:'cover',topic:''});$('bannerMode').value=draftBanner.mode;$('bannerImgFitSel').value=draftBanner.imgFit;$('bannerTopicInput').value=draftBanner.topic||'';$('bannerPreview').hidden=!asset(draftBanner.img);if(asset(draftBanner.img))$('bannerPreview').src=asset(draftBanner.img);$('bannerImgInput').value='';$('deleteBannerBtn').hidden=!banner;
 }else{
  const slot=slots[selectedSlot]||{type:'Kuliah Maghrib',speaker:'',topic:'',photo:null,photoFit:'cover',fontScale:1,photoZoom:1,photoY:50};
  const known=[...$('typeSel').options].some(o=>o.value===slot.type);$('typeSel').value=known?slot.type:'__custom__';$('customTypeInput').hidden=known;$('customTypeInput').value=known?'':slot.type;
  $('speakerInput').value=slot.speaker;$('topicInput').value=slot.topic;$('photoFitSel').value=slot.photoFit||'cover';$('photoZoom').value=slot.photoZoom||1;$('photoY').value=slot.photoY??50;$('slotFontScale').value=String(slot.fontScale||1);$('zoomValue').value=Math.round((slot.photoZoom||1)*100)+'%';draftPhoto=slot.photo||null;updatePhotoPreview();$('photoInput').value='';
  const match=project.library.find(p=>p.photo===slot.photo&&p.speaker.replace(/\s/g,'')===slot.speaker.replace(/\s/g,''));$('librarySel').value=match?.id||'';$('deleteSlotBtn').hidden=!slots[selectedSlot];$('saveSlotBtn').textContent=slots[selectedSlot]?'Simpan perubahan':'Tambah kuliah';
 }
 updateStatus();
}
function updatePhotoPreview(){const src=asset(draftPhoto);$('photoPreview').hidden=!src;if(src)$('photoPreview').src=src;}
async function upload(file,max=900){
 if(!file)return null;if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Pilih gambar PNG, JPG atau WebP.');if(file.size>25*1024*1024)throw Error('Gambar terlalu besar. Had ialah 25 MB.');
 const url=URL.createObjectURL(file);try{const im=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Gambar tidak dapat dibuka.'));im.src=url;});const scale=Math.min(1,max/Math.max(im.width,im.height));const canvas=document.createElement('canvas');canvas.width=Math.round(im.width*scale);canvas.height=Math.round(im.height*scale);canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.94);}finally{URL.revokeObjectURL(url);}
}
async function handleUpload(id,callback,max){const owner=project,day=selectedDate,slot=selectedSlot,mode=editMode;try{const value=await upload($(id).files[0],max);if(value&&project===owner&&selectedDate===day&&selectedSlot===slot&&editMode===mode)callback(value);}catch(e){toast(e.message);}$(id).value='';}
function saveSlot(event){
 event.preventDefault();const slots=current.entries[selectedDate]||[];if(selectedSlot>=slots.length&&(slots.length>=2||current.banners[selectedDate]?.mode==='full'||(current.banners[selectedDate]?.mode==='mixed'&&slots.length>=1))){toast('Petak ini sudah penuh.');return;}
 const type=$('typeSel').value==='__custom__'?$('customTypeInput').value.trim():$('typeSel').value;if(!type){toast('Isi tajuk program dahulu.');return;}
 const slot=normalSlot({type,speaker:$('speakerInput').value.trim(),topic:$('topicInput').value.trim(),photo:draftPhoto,photoFit:$('photoFitSel').value,photoZoom:$('photoZoom').value,photoY:$('photoY').value,fontScale:$('slotFontScale').value,source:'manual'});
 if(slots[selectedSlot])slots[selectedSlot]=slot;else{slots.push(slot);selectedSlot=slots.length-1;}current.entries[selectedDate]=slots;if(!Object.hasOwn(project.settings.colors,type))Object.defineProperty(project.settings.colors,type,{value:'#73509e',writable:true,enumerable:true,configurable:true});markChanged();renderPoster();fillEditor();toast('Perubahan '+selectedDate+' hb disimpan.');
}
function restoreDay(){if(!discardDraft())return;if(!confirm('Pulihkan kuliah default pada '+selectedDate+' hb? Acara dan perubahan pada tarikh ini akan dibuang.'))return;const defaults=generateMonth(current.year,current.month);if(defaults.entries[selectedDate])current.entries[selectedDate]=defaults.entries[selectedDate];else delete current.entries[selectedDate];delete current.banners[selectedDate];current.changedDays=current.changedDays.filter(d=>d!==selectedDate);current.dirty=true;selectedSlot=0;editMode='slot';persist();renderPoster();fillEditor();toast('Default tarikh ini dipulihkan.');}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function printDensity(blob){
 // PNG stores pixels/metre; canvas otherwise writes a misleading 96-dpi print size.
 const bytes=new Uint8Array(await blob.arrayBuffer()),parts=[bytes.slice(0,8)],chunk=new Uint8Array(21),view=new DataView(chunk.buffer);view.setUint32(0,9);chunk.set([112,72,89,115],4);view.setUint32(8,11811);view.setUint32(12,11811);chunk[16]=1;
 let crc=0xffffffff;for(const value of chunk.slice(4,17)){crc^=value;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}view.setUint32(17,(crc^0xffffffff)>>>0);
 const data=new DataView(bytes.buffer);let inserted=false;for(let offset=8;offset<bytes.length;){const len=data.getUint32(offset),type=String.fromCharCode(...bytes.slice(offset+4,offset+8));if(type!=='pHYs')parts.push(bytes.slice(offset,offset+len+12));if(type==='IHDR'&&!inserted){parts.push(chunk);inserted=true;}offset+=len+12;}
 return new Blob(parts,{type:'image/png'});
}
function safeFilename(name){return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'masjid';}
function exportData(){downloadBlob(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),'jadual-'+safeFilename(project.profile.masjidName)+'.json');toast('Profil, semua bulan dan gambar dimuat turun.');}
function exportWorkspace(){if(!discardDraft())return;downloadBlob(new Blob([JSON.stringify(workspace,null,2)],{type:'application/json'}),'jadual-semua-profil.json');}
async function importData(file){
 if(!file)return;if(file.size>60*1024*1024)throw Error('Fail data terlalu besar.');const data=JSON.parse(await file.text());let incoming=[];
 if(data?.format==='jadual-kuliah-workspace'&&Array.isArray(data.projects))incoming=data.projects.map(normalProject);
 else if(data?.format==='jadual-kuliah-generator')incoming=[normalProject(data)];
 else if(data?.format==='jadual-kuliah-talhah')throw Error('Fail ini menggunakan grafik terbina dalam edisi Talhah. Buka menggunakan HTML Talhah yang disimpan berasingan.');
 else if(data&&Number.isInteger(data.month)&&Number.isInteger(data.year)&&data.entries&&typeof data.entries==='object'){
  const q=createProject(String(data.profile?.masjidName||'Profil import').slice(0,140)),m=normalMonth({...data,source:'import',dirty:true});m.changedDays=Array.from({length:daysInMonth(m.year,m.month)},(_,i)=>i+1);q.active=monthKey(m.year,m.month);q.months={[q.active]:m};q.profile.address=String(data.profile?.address||'').slice(0,240);q.profile.phone=String(data.profile?.phone||'').slice(0,35);if(asset(data.profile?.masjidPhoto))q.profile.masjidPhoto=data.profile.masjidPhoto;
  const logos=[data.profile?.logoJabatan,data.profile?.logoMasjid].filter(x=>asset(x));if(logos.length)q.profile.logos=await combineLogos(logos);
  for(const [k,v] of Object.entries(data.colors||{}))if(k.length<=80&&/^#[0-9a-f]{6}$/i.test(v))Object.defineProperty(q.settings.colors,k,{value:v,writable:true,enumerable:true,configurable:true});if(asset(data.bg?.image))q.settings.bgImage=data.bg.image;incoming=[q];
 }else throw Error('Fail ini bukan data jadual yang disokong.');
 if(!incoming.length)throw Error('Fail tiada profil.');if(!discardDraft())return;formDirty=false;
 for(const p of incoming){p.id=uid();workspace.projects.push(p);}activateProject(incoming[0].id);toast(incoming.length+' profil dibuka sebagai salinan baru.');
}
async function combineLogos(refs){const c=document.createElement('canvas');c.width=700;c.height=390;const ctx=c.getContext('2d');for(let i=0;i<refs.length;i++){const im=await new Promise((r,j)=>{const x=new Image();x.onload=()=>r(x);x.onerror=j;x.src=asset(refs[i]);});const scale=Math.min(330/im.width,370/im.height),w=im.width*scale,h=im.height*scale;ctx.drawImage(im,i*350+(350-w)/2,(390-h)/2,w,h);}return c.toDataURL('image/png');}
const EXPORT_CDNS={html2canvas:'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',jspdf:'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'};
const exportLibraryPromises={};
function loadScriptOnce(key,url){
 if(window[key])return Promise.resolve();
 if(exportLibraryPromises[key])return exportLibraryPromises[key];
 exportLibraryPromises[key]=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=url;script.async=true;script.onload=()=>window[key]?resolve():reject(Error('Pustaka eksport tidak lengkap.'));script.onerror=()=>reject(Error('Tidak dapat memuatkan pustaka eksport. Semak sambungan internet.'));
  document.head.append(script);
 });
 return exportLibraryPromises[key];
}
async function ensureExportLibraries(){await loadScriptOnce('html2canvas',EXPORT_CDNS.html2canvas);await loadScriptOnce('jspdf',EXPORT_CDNS.jspdf);}
async function exportCanvas(){
 if(formDirty)throw Error('Simpan perubahan borang dahulu sebelum eksport.');await document.fonts.ready;await titleReady;drawCellShadows();
 const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:0;width:1240px;height:877px;';
 const copy=$('poster').cloneNode(true);copy.classList.add('exporting');copy.style.transform='none';holder.append(copy);document.body.append(holder);
 try{await Promise.all([...copy.querySelectorAll('img')].map(im=>im.decode().catch(()=>{})));const warnings=fitText(copy);if(warnings.length)throw Error('Teks terlalu panjang pada '+layoutWarningLabel(warnings)+'. Pendekkan teks sebelum eksport.');
  const width=project.settings.paperSize==='A4'?3508:4961,height=project.settings.paperSize==='A4'?2480:3508;const canvas=await html2canvas(copy,{scale:width/1240,width:1240,height:877,backgroundColor:null,logging:false,useCORS:true});
  if(canvas.width===width&&canvas.height===height)return canvas;
  const exact=document.createElement('canvas');exact.width=width;exact.height=height;exact.getContext('2d').drawImage(canvas,0,0,width,height);return exact;
 }finally{holder.remove();}
}
async function doExport(kind){
 if(saving)return;saving=true;const button=kind==='png'?$('exportPngBtn'):$('exportPdfBtn'),label=button.textContent;button.textContent='Sedang jana…';$('exportPngBtn').disabled=true;$('exportPdfBtn').disabled=true;
 try{await ensureExportLibraries();const canvas=await exportCanvas(),name=safeFilename(project.profile.masjidName)+'-jadual-kuliah-'+MONTH_NAMES[current.month].toLowerCase()+'-'+current.year+'-'+project.settings.paperSize;
  if(kind==='png')downloadBlob(await printDensity(await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))),name+'.png');
  else{const size=project.settings.paperSize==='A4'?[297,210]:[420,297],pdf=new jspdf.jsPDF({orientation:'landscape',unit:'mm',format:size,compress:true});pdf.addImage(canvas.toDataURL('image/jpeg',.97),'JPEG',0,0,size[0],size[1]);downloadBlob(pdf.output('blob'),name+'.pdf');}
  toast('Poster '+kind.toUpperCase()+' siap dimuat turun.');
 }catch(e){toast('Eksport gagal: '+e.message);}finally{saving=false;button.textContent=label;$('exportPngBtn').disabled=false;$('exportPdfBtn').disabled=false;}
}
function openDonation(){
 const d=normalDonation(project.profile.donation);donationUploadVersion++;donationUploadPending=false;$('saveDonationBtn').disabled=false;$('defaultDonationQrBtn').disabled=false;
 draftDonationQr=d.qr;$('donationEnabled').checked=d.enabled;$('donationHeading').value=d.heading;$('donationMessage').value=d.message;$('donationRecipient').value=d.recipient||project.profile.masjidName;$('donationPlacement').value=d.placement;$('donationFallback').value=d.fallback;$('donationFallbackField').hidden=d.placement==='footer';$('donationQrInput').value='';updateDonationPreview();$('donationDialog').showModal();
}
function updateDonationPreview(){const src=asset(draftDonationQr);$('donationQrPreview').hidden=!src;if(src)$('donationQrPreview').src=src;}
async function readDonationQr(file){
 if(!file)return null;if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Pilih QR dalam format PNG, JPG atau WebP.');if(file.size>8*1024*1024)throw Error('Gambar QR melebihi 8 MB. Pilih fail asal yang lebih kecil.');
 const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Gambar QR tidak dapat dibaca.'));reader.readAsDataURL(file);});
 await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>im.width>=64&&im.height>=64?resolve():reject(Error('Gambar QR terlalu kecil. Gunakan gambar asal sekurang-kurangnya 64 × 64 piksel.'));im.onerror=()=>reject(Error('Gambar QR tidak dapat dibuka.'));im.src=data;});
 return data;
}
async function changeDonationQr(){
 const file=$('donationQrInput').files[0];if(!file)return;const version=++donationUploadVersion;donationUploadPending=true;$('saveDonationBtn').disabled=true;$('defaultDonationQrBtn').disabled=true;
 try{const data=await readDonationQr(file);if(version!==donationUploadVersion)return;draftDonationQr=data;updateDonationPreview();}
 catch(e){if(version===donationUploadVersion)toast(e.message);}
 finally{if(version===donationUploadVersion){donationUploadPending=false;$('saveDonationBtn').disabled=false;$('defaultDonationQrBtn').disabled=false;$('donationQrInput').value='';}}
}
function saveDonation(e){
 e.preventDefault();if(donationUploadPending)return;if($('donationEnabled').checked&&!asset(draftDonationQr)){toast('Pilih gambar QR dahulu.');return;}
 project.profile.donation=normalDonation({enabled:$('donationEnabled').checked,qr:draftDonationQr,heading:$('donationHeading').value.trim(),message:$('donationMessage').value.trim(),recipient:$('donationRecipient').value.trim(),placement:$('donationPlacement').value,fallback:$('donationFallback').value});persist();renderPoster();$('donationDialog').close();toast('Tetapan infaq disimpan.');
}
function bind(){
 $('monthSel').innerHTML=MONTH_NAMES.map((m,i)=>`<option value="${i}">${m}</option>`).join('');refreshProfileUI();
 $('monthSel').onchange=()=>switchMonth(+$('yearInput').value,+$('monthSel').value);$('yearInput').onchange=()=>switchMonth(+$('yearInput').value,+$('monthSel').value);$('dateSel').onchange=()=>{const d=+$('dateSel').value;selectDay(d);$('dateSel').value=selectedDate;};
 $('grid').onclick=e=>{const cell=e.target.closest('[data-day]');if(cell)selectDay(+cell.dataset.day);};$('grid').onkeydown=e=>{if(['Enter',' '].includes(e.key)&&e.target.dataset.day){e.preventDefault();selectDay(+e.target.dataset.day);}};
 $('slotTabs').onclick=e=>{const slot=e.target.closest('[data-slot]'),banner=e.target.closest('[data-banner]');if((!slot&&!banner)||!discardDraft())return;editMode=banner?'banner':'slot';if(slot)selectedSlot=+slot.dataset.slot;fillEditor();};
 $('addSlotBtn').onclick=()=>{if(!discardDraft())return;selectedSlot=(current.entries[selectedDate]||[]).length;editMode='slot';fillEditor();};$('addBannerBtn').onclick=()=>{if(!discardDraft())return;editMode='banner';fillEditor();};
 const dirty=()=>{formDirty=true;$('saveStatus').textContent='Perubahan borang belum disimpan';};$('slotForm').oninput=dirty;$('slotForm').onchange=dirty;$('bannerForm').oninput=dirty;$('bannerForm').onchange=dirty;
 $('typeSel').onchange=()=>{$('customTypeInput').hidden=$('typeSel').value!=='__custom__';formDirty=true;};
 $('librarySel').onchange=()=>{const p=project.library.find(x=>x.id===$('librarySel').value);if(!p)return;$('speakerInput').value=p.speaker;$('topicInput').value=p.topic;setSlotType(p.type);draftPhoto=p.photo;$('photoZoom').value=1;$('photoY').value=50;$('zoomValue').value='100%';updatePhotoPreview();formDirty=true;};
 $('photoInput').onchange=()=>handleUpload('photoInput',v=>{draftPhoto=v;updatePhotoPreview();formDirty=true;});$('clearPhotoBtn').onclick=()=>{draftPhoto=null;updatePhotoPreview();formDirty=true;};$('photoZoom').oninput=()=>{$('zoomValue').value=Math.round(+$('photoZoom').value*100)+'%';};
 $('slotForm').onsubmit=saveSlot;$('cancelSlotBtn').onclick=()=>fillEditor();$('deleteSlotBtn').onclick=()=>{const slots=current.entries[selectedDate];if(!slots?.[selectedSlot])return;if(!confirm('Padam slot ini daripada '+selectedDate+' hb?'))return;slots.splice(selectedSlot,1);if(!slots.length)delete current.entries[selectedDate];selectedSlot=0;markChanged();renderPoster();fillEditor();};$('restoreDayBtn').onclick=restoreDay;
 $('bannerImgInput').onchange=()=>handleUpload('bannerImgInput',v=>{draftBanner.img=v;$('bannerPreview').src=v;$('bannerPreview').hidden=false;formDirty=true;},1400);
 $('bannerForm').onsubmit=e=>{e.preventDefault();if(!draftBanner?.img){toast('Pilih gambar acara dahulu.');return;}const mode=$('bannerMode').value,slots=current.entries[selectedDate]||[];if(mode==='mixed'&&slots.length>1){toast('Susunan gabungan memerlukan satu kuliah sahaja. Padam slot yang digantikan acara terlebih dahulu.');return;}current.banners[selectedDate]={...draftBanner,mode,imgFit:$('bannerImgFitSel').value,topic:$('bannerTopicInput').value.trim()};markChanged();renderPoster();fillEditor();toast('Acara disimpan.');};
 $('deleteBannerBtn').onclick=()=>{if(!confirm('Buang acara ini? Kuliah yang tersimpan pada tarikh ini akan dipaparkan semula.'))return;delete current.banners[selectedDate];editMode='slot';selectedSlot=0;markChanged();renderPoster();fillEditor();};
 $('defaultMonthBtn').onclick=()=>{if(!discardDraft())return;if(!confirm('Pulihkan seluruh bulan kepada aturan tetap terbaru? Semua perubahan dan acara bulan ini akan diganti.'))return;current=generateMonth(current.year,current.month);project.months[project.active]=current;selectedSlot=0;editMode='slot';persist();renderPoster();fillEditor();toast('Default bulan dipulihkan.');};
 bindProfiles();
 $('settingsBtn').onclick=openSettings;$('settingsForm').onsubmit=saveSettings;$('helpBtn').onclick=()=>$('helpDialog').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
 $('donationBtn').onclick=openDonation;$('donationForm').onsubmit=saveDonation;$('donationQrInput').onchange=changeDonationQr;$('donationPlacement').onchange=()=>{$('donationFallbackField').hidden=$('donationPlacement').value==='footer';};$('defaultDonationQrBtn').onclick=()=>{draftDonationQr=null;$('donationEnabled').checked=false;updateDonationPreview();};
 $('paperSizeSel').onchange=()=>{project.settings.paperSize=$('paperSizeSel').value;persist();updateStatus();};$('exportPngBtn').onclick=()=>doExport('png');$('exportPdfBtn').onclick=()=>doExport('pdf');$('saveDataBtn').onclick=()=>{if(formDirty)toast('Perubahan borang belum disimpan. Simpan perubahan dahulu untuk memasukkannya dalam sandaran.');else exportData();};$('loadDataBtn').onclick=()=>$('uploadDataInput').click();$('uploadDataInput').onchange=async()=>{try{await importData($('uploadDataInput').files[0]);}catch(e){toast('Gagal membuka data: '+e.message);}$('uploadDataInput').value='';};
 window.addEventListener('beforeunload',e=>{if(formDirty){e.preventDefault();e.returnValue='';}});window.addEventListener('resize',resizePreview);new ResizeObserver(resizePreview).observe($('previewViewport'));syncMonthControls();renderPoster();fillEditor();document.fonts.ready.then(()=>{drawTitle();fitText();});
}


