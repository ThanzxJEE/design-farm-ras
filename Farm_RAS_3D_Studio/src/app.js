'use strict';
// Farm RAS Studio V7.6 - cấu hình RAS mẫu có xả cặn và nguồn oxy riêng; bản độc lập, không dùng thư viện CDN.
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = (n, digits=2) => Number.isFinite(Number(n)) ? Number(n).toLocaleString('vi-VN',{minimumFractionDigits:digits,maximumFractionDigits:digits}) : '—';
const uid = () => 'ras-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
const CATALOG = [
 {type:'fishTank',name:'Bể cá tròn',en:'Fish Tank',icon:'◉',group:'Bể & xử lý nước',color:'#68bfc0',defaults:{diameter:2.5,height:1.2,waterLevel:.8,fishCount:500,avgFishWeight:.3,feedRate:1.5,ratedFlow:10}},
 {type:'rectTank',name:'Bể cá chữ nhật',en:'Rectangular Tank',icon:'▭',group:'Bể & xử lý nước',color:'#73b7c6',defaults:{width:3,depth:2,height:1.2,waterLevel:1,fishCount:400,avgFishWeight:.25,feedRate:1.5,ratedFlow:10}},
 {type:'settlingTank',name:'Bể lắng',en:'Settling Tank',icon:'◍',group:'Bể & xử lý nước',color:'#c6a46b',defaults:{diameter:1.25,height:1.5,waterLevel:1.4,designHRT:.2,ratedFlow:10}},
 {type:'drumFilter',name:'Drum filter',en:'Drum Filter',icon:'▤',group:'Bể & xử lý nước',color:'#6a9fb5',defaults:{width:1.2,depth:.8,height:.95,ratedFlow:12,meshMicron:60}},
 {type:'mechanicalFilter',name:'Lọc cơ học',en:'Mechanical Filter',icon:'▥',group:'Bể & xử lý nước',color:'#8ca9a8',defaults:{width:1,depth:.7,height:.9,ratedFlow:10}},
 {type:'biofilter',name:'Lọc vi sinh Kaldnes',en:'Moving Bed Biofilter',icon:'❋',group:'Bể & xử lý nước',color:'#6ea98a',defaults:{diameter:1,height:1.3,waterLevel:1.1,mediaFraction:50,specificSurfaceArea:500,tanLoading:.1,ratedFlow:4}},
 {type:'storageTank',name:'Bể chứa nước',en:'Storage Tank',icon:'◉',group:'Bể & xử lý nước',color:'#76a9c7',defaults:{diameter:1.2,height:1.2,waterLevel:.9,ratedFlow:10}},
 {type:'sludgeTank',name:'Bể thu bùn',en:'Sludge Collection Tank',icon:'◍',group:'Bể & xử lý nước',color:'#9a806f',defaults:{diameter:.8,height:.9,waterLevel:.45}},
 {type:'degassing',name:'Tháp khử khí',en:'Degassing Unit',icon:'≋',group:'Bể & xử lý nước',color:'#7eae9e',defaults:{diameter:.9,height:1.5,waterLevel:1.1,ratedFlow:10}},
 {type:'pump',name:'Bơm tuần hoàn',en:'Water Pump',icon:'✥',group:'Thiết bị vận hành',color:'#6c9dbb',defaults:{width:.75,depth:.56,height:.55,ratedFlow:10,head:4,efficiency:60,motorPower:.25}},
 {type:'blower',name:'Máy sục khí',en:'Air Blower',icon:'≋',group:'Thiết bị vận hành',color:'#a38dbb',defaults:{width:.7,depth:.45,height:.45,power:.37,airFlow:120,airPressure:20}},
 {type:'oxygenCone',name:'Côn hòa tan oxy',en:'Oxygen Cone',icon:'▽',group:'Thiết bị vận hành',color:'#70b8c4',defaults:{diameter:.5,height:1.2,ratedFlow:10,oxygenTransferEfficiency:70}},
 {type:'oxygenSource',name:'Nguồn oxy tinh khiết',en:'Oxygen Supply',icon:'O₂',group:'Thiết bị vận hành',color:'#67aeb9',defaults:{diameter:.38,height:1.1,waterLevel:.08,capacity:.12}},
 {type:'uv',name:'Đèn UV',en:'UV Sterilizer',icon:'☼',group:'Thiết bị vận hành',color:'#9b91bf',defaults:{width:.9,depth:.25,height:.3,ratedFlow:10,power:.12}},
 {type:'valve',name:'Van điều khiển',en:'Valve',icon:'⊗',group:'Đường ống & phụ kiện',color:'#c6a16f',defaults:{width:.25,depth:.25,height:.2}},
 {type:'pipe',name:'Đoạn ống rời',en:'Pipe Segment',icon:'━',group:'Đường ống & phụ kiện',color:'#5aaeb5',defaults:{diameter:.09,length:2,roughness:.0000015}}
];
const byType = type => CATALOG.find(x=>x.type===type);
const ROUND_TYPES = new Set(['fishTank','settlingTank','biofilter','storageTank','degassing','oxygenSource','sludgeTank']);
const VOLUME_TYPES = new Set(['fishTank','rectTank','settlingTank','biofilter','storageTank','degassing']);
const FIELDS = {
 fishTank:[['diameter','Đường kính bể','m',.05],['height','Chiều cao thành bể','m',.05],['waterLevel','Mực nước thực tế','m',.05],['fishCount','Số lượng cá','con',1],['avgFishWeight','Khối lượng TB/con','kg',.01],['feedRate','Tỷ lệ thức ăn/ngày','%',.1],['ratedFlow','Lưu lượng giới hạn','m³/h',.5]],
 rectTank:[['width','Chiều dài bể','m',.05],['depth','Chiều rộng bể','m',.05],['height','Chiều cao thành bể','m',.05],['waterLevel','Mực nước thực tế','m',.05],['fishCount','Số lượng cá','con',1],['avgFishWeight','Khối lượng TB/con','kg',.01],['feedRate','Tỷ lệ thức ăn/ngày','%',.1],['ratedFlow','Lưu lượng giới hạn','m³/h',.5]],
 settlingTank:[['diameter','Đường kính bể','m',.05],['height','Chiều cao bể','m',.05],['waterLevel','Mực nước','m',.05],['designHRT','HRT mục tiêu','giờ',.05],['ratedFlow','Lưu lượng thiết kế','m³/h',.5]],
 drumFilter:[['width','Chiều dài','m',.05],['depth','Chiều rộng','m',.05],['height','Chiều cao','m',.05],['ratedFlow','Công suất lưu lượng','m³/h',.5],['meshMicron','Kích thước lưới','µm',5]],
 mechanicalFilter:[['width','Chiều dài','m',.05],['depth','Chiều rộng','m',.05],['height','Chiều cao','m',.05],['ratedFlow','Lưu lượng thiết kế','m³/h',.5]],
 biofilter:[['diameter','Đường kính bể lọc','m',.05],['height','Chiều cao bể','m',.05],['waterLevel','Mực nước','m',.05],['mediaFraction','Tỷ lệ vật liệu lọc','%',1],['specificSurfaceArea','Diện tích bề mặt riêng','m²/m³',10],['tanLoading','Tải TAN thiết kế','kg TAN/m³ vật liệu/ngày',.01],['ratedFlow','Lưu lượng thiết kế','m³/h',.5]],
 storageTank:[['diameter','Đường kính','m',.05],['height','Chiều cao','m',.05],['waterLevel','Mực nước','m',.05],['ratedFlow','Lưu lượng thiết kế','m³/h',.5]],
 sludgeTank:[['diameter','Đường kính bể','m',.05],['height','Chiều cao bể','m',.05],['waterLevel','Mực bùn/nước tham chiếu','m',.05]],
 degassing:[['diameter','Đường kính','m',.05],['height','Chiều cao','m',.05],['waterLevel','Mực nước','m',.05],['ratedFlow','Lưu lượng thiết kế','m³/h',.5]],
 pump:[['width','Chiều dài','m',.05],['depth','Chiều rộng','m',.05],['height','Chiều cao','m',.05],['ratedFlow','Lưu lượng định mức','m³/h',.5],['head','Cột áp bơm công bố','m',.1],['efficiency','Hiệu suất tổng','%',1],['motorPower','Công suất động cơ','kW',.01]],
 blower:[['width','Chiều dài','m',.05],['depth','Chiều rộng','m',.05],['height','Chiều cao','m',.05],['power','Công suất điện','kW',.05],['airFlow','Lưu lượng khí tại áp suất làm việc','L/min',1],['airPressure','Áp suất làm việc','kPa',1]],
 oxygenCone:[['diameter','Đường kính','m',.05],['height','Chiều cao','m',.05],['ratedFlow','Lưu lượng nước','m³/h',.5],['oxygenTransferEfficiency','Hiệu suất chuyển oxy','%',1]],
 oxygenSource:[['diameter','Đường kính bình / cụm','m',.01],['height','Chiều cao','m',.05],['capacity','Năng lực cấp O₂','kg/h',.01]],
 uv:[['width','Chiều dài','m',.05],['depth','Chiều rộng','m',.05],['height','Chiều cao','m',.05],['ratedFlow','Lưu lượng tối đa','m³/h',.5],['power','Công suất đèn','kW',.01]],
 valve:[['width','Chiều dài','m',.05],['depth','Chiều rộng','m',.05],['height','Chiều cao','m',.05]],
 pipe:[['diameter','Đường kính trong','m',.005],['length','Chiều dài','m',.1],['roughness','Độ nhám tuyệt đối','m',.00001]]
};
const state = {projectName:'Dự án RAS mới',devices:[],connections:[],selectedId:null,selectedConnectionId:null,pipeEditMode:false,viewMode:'2d',gridOn:true,labelsOn:true,flowOn:true,planZoom:1,connectMode:false,pendingConnect:null,activeTab:'device',dirty:false,settings:{turnoverHours:.5,staticHead:2.5,pipeDiameter:.09,pipeLength:30,minorK:8,pumpEfficiency:60,feedRate:1.5,tanPerKgFeed:.03,oxygenConsumption:.35,oxygenEfficiency:70,doCurrent:5.5,doTarget:6,frictionFactor:.025,maxVelocity:2,maxHeadLoss:5}};
let toastTimer=null;
function toast(message){const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),2200)}
function markDirty(){state.dirty=true}
function escNum(v, fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback}
function volumeOf(d){const p=d.params||{},water=Math.max(0,escNum(p.waterLevel,escNum(p.height,0)));if(d.type==='rectTank')return Math.max(0,escNum(p.width))*Math.max(0,escNum(p.depth))*water;if(ROUND_TYPES.has(d.type))return Math.PI*Math.pow(Math.max(0,escNum(p.diameter))/2,2)*water;return 0}
function calc(){
 const dev=state.devices,s=state.settings;
 const tanks=dev.filter(d=>d.type==='fishTank'||d.type==='rectTank');
 const tankVolume=tanks.reduce((a,d)=>a+volumeOf(d),0);
 const otherVolumes=dev.filter(d=>['settlingTank','biofilter','storageTank','degassing'].includes(d.type)).reduce((a,d)=>a+volumeOf(d),0);
 const totalVolume=tankVolume+otherVolumes;
 const biomass=tanks.reduce((a,d)=>a+escNum(d.params.fishCount)*escNum(d.params.avgFishWeight),0);
 const feed=tanks.reduce((a,d)=>a+escNum(d.params.fishCount)*escNum(d.params.avgFishWeight)*escNum(d.params.feedRate,s.feedRate)/100,0);
 const turnover=Math.max(.05,escNum(s.turnoverHours,.5));
 // Turnover target applies to culture-tank working volume, not every vessel in the treatment loop.
 const flow=tankVolume/turnover;
 const settler=dev.find(d=>d.type==='settlingTank');
 const settlingVolume=settler?volumeOf(settler):0;
 const hrt=flow>0?settlingVolume/flow:0;
 const tan=feed*Math.max(0,escNum(s.tanPerKgFeed));
 const biofilters=dev.filter(d=>d.type==='biofilter');
 const bioVolume=biofilters.reduce((sum,b)=>sum+volumeOf(b),0);
 const mediaVol=biofilters.reduce((sum,b)=>sum+volumeOf(b)*Math.max(0,escNum(b.params.mediaFraction))/100,0);
 const tanCapacity=biofilters.reduce((sum,b)=>sum+volumeOf(b)*Math.max(0,escNum(b.params.mediaFraction))/100*Math.max(0,escNum(b.params.tanLoading)),0);
 const avgTanLoading=mediaVol>0?tanCapacity/mediaVol:0;
 const mediaRequired=avgTanLoading>0?tan/avgTanLoading:0;
 const avgMediaFraction=bioVolume>0?mediaVol/bioVolume:0;
 const bioTankRequired=avgMediaFraction>0?mediaRequired/avgMediaFraction:0;
 const bioSurface=biofilters.reduce((sum,b)=>sum+volumeOf(b)*Math.max(0,escNum(b.params.mediaFraction))/100*Math.max(0,escNum(b.params.specificSurfaceArea)),0);
 const avgSurface=mediaVol>0?bioSurface/mediaVol:0;
 const bioSurfaceRequired=mediaRequired*avgSurface;
 const pump=dev.find(d=>d.type==='pump');
 const qPump=pump?escNum(pump.params.ratedFlow):flow;
 const qM3s=flow/3600;
 const D=Math.max(.01,escNum(s.pipeDiameter,.09));
 const area=Math.PI*D*D/4;
 const velocity=qM3s/area;
 const f=Math.max(.0001,escNum(s.frictionFactor,.025));
 const L=Math.max(0,escNum(s.pipeLength));
 const K=Math.max(0,escNum(s.minorK));
 const dynamic=velocity*velocity/(2*9.81);
 const frictionHead=f*(L/D)*dynamic;
 const minorHead=K*dynamic;
 const staticHead=Math.max(0,escNum(s.staticHead));
 const tdh=staticHead+frictionHead+minorHead;
 const efficiency=(pump?escNum(pump.params.efficiency,60):escNum(s.pumpEfficiency,60))/100;
 const hydraulic=1000*9.81*qM3s*tdh;
 const electrical=efficiency>0?hydraulic/efficiency/1000:0;
 const motorPower=pump?Math.max(0,escNum(pump.params.motorPower,0)):0;
 const oxygen=biomass*Math.max(0,escNum(s.oxygenConsumption,.35))*24/1000;
 const oxygenGap=Math.max(0,escNum(s.doTarget,6)-escNum(s.doCurrent,5.5));
 const oxygenDeficitKg=oxygenGap*totalVolume/1000;
 const oxygenUnit=dev.find(d=>d.type==='oxygenCone');
 const oxygenSourceUnit=dev.find(d=>d.type==='oxygenSource');
 const oxygenEta=Math.max(.01,escNum(oxygenUnit?.params.oxygenTransferEfficiency,s.oxygenEfficiency)/100);
 const oxygenSource=oxygen/oxygenEta;
 const oxygenRequiredPerHour=oxygenSource/24;
 const oxygenSourceCapacity=oxygenSourceUnit?Math.max(0,escNum(oxygenSourceUnit.params.capacity)):0;
 const uv=dev.some(d=>d.type==='uv');
 const blower=dev.find(d=>d.type==='blower');
 const degasser=dev.find(d=>d.type==='degassing');
 const sludgeTank=dev.find(d=>d.type==='sludgeTank');
 const warnings=[];
 if(!tanks.length)warnings.push({type:'error',text:'Chưa có bể nuôi cá để xác định thể tích và sinh khối.'});
 if(!pump)warnings.push({type:'warn',text:'Chưa bố trí máy bơm tuần hoàn.'});
 if(!settler)warnings.push({type:'warn',text:'Chưa có bể lắng/tách cặn thô; cần xác định giải pháp loại bỏ chất rắn.'});
 if((settler||dev.some(d=>d.type==='drumFilter'))&&!sludgeTank)warnings.push({type:'warn',text:'Chưa có bể thu bùn/nước rửa từ bể lắng và Drum Filter.'});
 if(!biofilters.length)warnings.push({type:'error',text:'Chưa có biofilter; chưa thể đánh giá tải TAN xử lý.'});
 if(!degasser)warnings.push({type:'warn',text:'Chưa có bộ khử khí CO₂ sau biofilter.'});
 if(!blower)warnings.push({type:'warn',text:'Chưa bố trí máy thổi khí cho bể vi sinh/bể nuôi.'});
 if(!oxygenUnit)warnings.push({type:'warn',text:'Chưa có côn hòa tan oxy; cần xác nhận phương án cấp oxy thay thế.'});
 if(oxygenUnit&&!oxygenSourceUnit)warnings.push({type:'error',text:'Côn hòa tan oxy chưa có nguồn O₂ tinh khiết được khai báo.'});
 if(oxygenSourceUnit&&oxygenSourceCapacity<oxygenRequiredPerHour)warnings.push({type:'error',text:`Nguồn O₂ khai báo ${fmt(oxygenSourceCapacity,3)} kg/h thấp hơn nhu cầu sơ bộ ${fmt(oxygenRequiredPerHour,3)} kg/h.`});
 if(state.connections.length===0&&dev.length>1)warnings.push({type:'warn',text:'Chưa có tuyến ống kết nối giữa các thiết bị.'});
 if(settler&&flow>0&&hrt<escNum(settler.params.designHRT))warnings.push({type:'error',text:`HRT bể lắng ${fmt(hrt*60,1)} phút thấp hơn mục tiêu ${fmt(escNum(settler.params.designHRT)*60,1)} phút.`});
 if(biofilters.length&&tan>tanCapacity)warnings.push({type:'error',text:`Tải TAN dự kiến ${fmt(tan,3)} kg/ngày vượt khả năng tổng của ${biofilters.length} biofilter (${fmt(tanCapacity,3)} kg/ngày).`});
 if(pump&&flow>qPump)warnings.push({type:'error',text:`Lưu lượng yêu cầu ${fmt(flow)} m³/h vượt lưu lượng định mức bơm ${fmt(qPump)} m³/h.`});
 if(pump&&motorPower>0&&motorPower<electrical*1.15)warnings.push({type:'error',text:`Công suất động cơ khai báo ${fmt(motorPower)} kW thấp hơn mức kiểm tra sơ bộ ${fmt(electrical*1.15)} kW.`});
 if(pump&&escNum(pump.params.head)>0&&tdh>escNum(pump.params.head))warnings.push({type:'warn',text:`TDH yêu cầu sơ bộ ${fmt(tdh)} m lớn hơn cột áp công bố của bơm ${fmt(pump.params.head)} m; cần đối chiếu đường đặc tính.`});
 if(velocity>escNum(s.maxVelocity,2))warnings.push({type:'warn',text:`Vận tốc ống chính ${fmt(velocity)} m/s vượt ngưỡng cấu hình ${fmt(s.maxVelocity)} m/s.`});
 if(frictionHead+minorHead>escNum(s.maxHeadLoss,5))warnings.push({type:'warn',text:`Tổn thất dọc + cục bộ sơ bộ ${fmt(frictionHead+minorHead)} m vượt ngưỡng cấu hình.`});
 const bioBranchFlow=biofilters.length?flow/biofilters.length:flow;
 for(const d of dev){
  if(d.params?.ratedFlow){const qDesign=d.type==='biofilter'?bioBranchFlow:flow;if(qDesign>escNum(d.params.ratedFlow))warnings.push({type:'warn',text:`${d.name}: lưu lượng kiểm tra ${fmt(qDesign)} m³/h lớn hơn năng lực tham khảo ${fmt(d.params.ratedFlow)} m³/h.`})}
 }
 const connected=new Set();for(const c of state.connections){connected.add(c.from);connected.add(c.to)}
 for(const d of dev){if(!connected.has(d.id))warnings.push({type:'warn',text:`${d.name} chưa được nối vào sơ đồ đường ống.`})}
 const errors=warnings.filter(w=>w.type==='error').length;
 return {tankVolume,otherVolumes,totalVolume,biomass,feed,flow,settlingVolume,hrt,tan,motorPower,oxygenSourceCapacity,oxygenRequiredPerHour,bioVolume,bioCount:biofilters.length,mediaVol,tanCapacity,mediaRequired,bioTankRequired,bioSurface,bioSurfaceRequired,qPump,velocity,frictionHead,minorHead,staticHead,tdh,hydraulic,electrical,oxygen,oxygenGap,oxygenDeficitKg,oxygenSource,oxygenEta,warnings,status:errors?'Không phù hợp':warnings.length?'Cần kiểm tra':'Bình thường',tanks:tanks.length,deviceCount:dev.length,uv}
}
function refreshDashboard(){const c=calc();$('mVolume').innerHTML=`${fmt(c.totalVolume)} <span class="unit">m³</span>`;$('mTanks').innerHTML=`${c.tanks} <span class="unit">bể</span>`;$('mDevices').innerHTML=`${c.deviceCount} <span class="unit">thiết bị</span>`;$('mFlow').innerHTML=`${fmt(c.flow)} <span class="unit">m³/h</span>`;$('mPower').innerHTML=`${fmt(c.electrical)} <span class="unit">kW</span>`;const cls=c.status==='Bình thường'?'':c.status==='Cần kiểm tra'?'warn':'bad';$('mStatus').innerHTML=`<i class="dot ${cls}"></i>${escapeHTML(c.status)}`;$('systemStatus').textContent='● '+c.status;$('systemStatus').style.color=c.status==='Bình thường'?'#58876b':c.status==='Cần kiểm tra'?'#9b7438':'#a95459';$('warningCount').textContent=c.warnings.length+' mục';$('warningList').innerHTML=c.warnings.length?c.warnings.map(w=>`<div class="warning ${w.type==='error'?'error':''}">${escapeHTML(w.text)}</div>`).join(''):'<div class="warning ok">Không có cảnh báo theo ngưỡng hiện tại. Vẫn cần kỹ sư kiểm tra trước khi thi công.</div>';return c}
function refreshFlow(){const host=$('flowSteps');if(!state.connections.length){host.innerHTML='<span class="muted">Chưa có tuyến ống. Chọn “Nối ống” hoặc “Tạo tuyến mẫu”.</span>';return}const byId=new Map(state.devices.map(d=>[d.id,d]));const start=state.connections[0]?.from;const ordered=[],seen=new Set();let cur=start;for(let i=0;i<state.connections.length+1&&cur&&!seen.has(cur);i++){seen.add(cur);const d=byId.get(cur);if(d)ordered.push(d);cur=state.connections.find(x=>x.from===cur)?.to}for(const d of state.devices)if(!seen.has(d.id)&&state.connections.some(c=>c.from===d.id||c.to===d.id))ordered.push(d);host.innerHTML=ordered.map((d,i)=>`${i?'<span class="flow-arrow">→</span>':''}<div class="flow-node">${escapeHTML(d.name)}<small>${escapeHTML(d.type)}</small></div>`).join('')}
function refreshAll(){refreshDashboard();refreshFlow();renderPlan2D();draw3D();if(state.activeTab==='calc')renderCalculationTab();if(state.activeTab==='settings')renderSettingsTab()}
function renderLibrary(filter=''){const q=filter.trim().toLocaleLowerCase('vi');const groups=[...new Set(CATALOG.map(x=>x.group))];$('libraryGrid').innerHTML=groups.map(group=>{const items=CATALOG.filter(x=>x.group===group&&(x.name+' '+x.en).toLocaleLowerCase('vi').includes(q));return items.length?`<div class="lib-group-title">${escapeHTML(group)}</div>`+items.map(x=>`<button class="lib-item" data-add="${x.type}" title="Thêm ${escapeHTML(x.name)}"><span class="lib-icon" style="color:${x.color}">${x.icon}</span><b>${escapeHTML(x.name)}</b><small>＋ Thêm</small></button>`).join(''):''}).join('');$('libraryGrid').querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>{const d=addDevice(btn.dataset.add);toast('Đã thêm '+d.name)}))}
const PLAN={cx:600,cy:265,scale:45};
const BOARD={x:240,y:62.5,w:720,h:405};
function planXY(d){return {x:PLAN.cx+d.x*PLAN.scale,y:PLAN.cy+d.z*PLAN.scale}}
function selectedConnection(){return state.connections.find(c=>c.id===state.selectedConnectionId)||null}
// Return the exact point where a pipe should meet the device footprint.
// Circular tanks/pumps use a radial port; rectangular equipment respects rotation.
function devicePipePort(device,toward){
 const dx=Number(toward?.[0])-device.x,dz=Number(toward?.[1])-device.z;
 if(!Number.isFinite(dx)||!Number.isFinite(dz)||Math.hypot(dx,dz)<1e-7)return [device.x,device.z];
 const p=device.params||{};
 if(ROUND_TYPES.has(device.type)||device.type==='pump'){
  const r=device.type==='pump'?Math.max(.3,escNum(p.width,.75),escNum(p.depth,.55))/2:Math.max(.22,escNum(p.diameter,1)/2);
  const len=Math.hypot(dx,dz);return [device.x+dx/len*r,device.z+dz/len*r];
 }
 const hw=Math.max(.2,escNum(p.width,.8)/2),hh=Math.max(.175,escNum(p.depth,.55)/2),angle=escNum(device.rotation);
 const ca=Math.cos(angle),sa=Math.sin(angle);
 // Transform direction into the device's unrotated local coordinates.
 const lx=ca*dx+sa*dz,lz=-sa*dx+ca*dz;
 const tx=Math.abs(lx)>1e-9?hw/Math.abs(lx):Infinity;
 const tz=Math.abs(lz)>1e-9?hh/Math.abs(lz):Infinity;
 const scale=Math.min(tx,tz);
 const bx=lx*scale,bz=lz*scale;
 // Transform the boundary point back to world coordinates.
 return [device.x+ca*bx-sa*bz,device.z+sa*bx+ca*bz];
}
function pipeRoute(c){
 const a=state.devices.find(x=>x.id===c.from),b=state.devices.find(x=>x.id===c.to);if(!a||!b)return [];
 let pts;
 if(Array.isArray(c.route)&&c.route.length>=2){pts=c.route.map(p=>[Number(p[0]),Number(p[1])]);}
 else {
  const dx=b.x-a.x,dz=b.z-a.z;
  const pa=devicePipePort(a,[b.x,b.z]),pb=devicePipePort(b,[a.x,a.z]);
  // Orthogonal auto-route between the actual device ports.
  if(Math.abs(dx)>=Math.abs(dz)){const mid=(pa[0]+pb[0])/2;pts=[pa,[mid,pa[1]],[mid,pb[1]],pb];}
  else {const mid=(pa[1]+pb[1])/2;pts=[pa,[pa[0],mid],[pb[0],mid],pb];}
 }
 if(pts.length<2)return [];
 // Recalculate both ends every render. Moving either device therefore keeps
 // the pipe connected while preserving user-created bends in the middle.
 const firstInner=pts.length>2?pts[1]:[b.x,b.z];
 const lastInner=pts.length>2?pts[pts.length-2]:[a.x,a.z];
 pts[0]=devicePipePort(a,firstInner);
 pts[pts.length-1]=devicePipePort(b,lastInner);
 return pts;
}
function pipeLengthM(c){if(Number.isFinite(Number(c.lengthM))&&Number(c.lengthM)>0)return Number(c.lengthM);const pts=pipeRoute(c);let total=0;for(let i=1;i<pts.length;i++)total+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return total}
function selectConnection(id){const c=state.connections.find(x=>x.id===id);if(!c)return;state.selectedConnectionId=id;state.selectedId=null;state.activeTab='device';state.pipeEditMode=true;$('btnPipeEdit')?.classList.add('active');$('canvasStatus').textContent='CHỈNH SỬA ĐƯỜNG ỐNG';$('viewportHint').textContent='Đường ống đã chọn · Hai đầu tự bám vào thiết bị · Kéo nút xanh để đổi tuyến · Bảng bên phải để chỉnh thông số và điểm nối';renderPlan2D();draw3D();renderInspector()}
function clearPipeSelection(){state.selectedConnectionId=null;state.pipeEditMode=false;$('btnPipeEdit')?.classList.remove('active')}

function planDims(d){const p=d.params||{};if(ROUND_TYPES.has(d.type)||d.type==='pump'){const dia=d.type==='pump'?Math.max(escNum(p.width,.7),escNum(p.depth,.5)):escNum(p.diameter,1);const r=Math.max(.22,dia/2)*PLAN.scale/2*2;return {round:true,r,w:r*2,h:r*2}}return {round:false,r:0,w:Math.max(.4,escNum(p.width,.8))*PLAN.scale,h:Math.max(.35,escNum(p.depth,.55))*PLAN.scale}}
function planDeviceMarkup(d,index){
 const meta=byType(d.type),pt=planXY(d),dim=planDims(d),p=d.params||{},color=meta?.color||'#7aa18c';let sh='';
 if(dim.round){
  sh+=`<ellipse class="tank-shadow" cx="0" cy="${dim.r*.78}" rx="${dim.r*.94}" ry="${dim.r*.28}"/>`;
  const shellFill=d.type==='fishTank'?'#d8efed':d.type==='settlingTank'?'#f4ead8':d.type==='biofilter'?'#e5f1df':d.type==='pump'?'#e8f0f7':d.type==='sludgeTank'?'#efe4dc':'#e0eef4';
  sh+=`<circle class="tank-shell" cx="0" cy="0" r="${dim.r}" style="fill:${shellFill};stroke:${color};stroke-width:${d.type==='fishTank'?3:2.5}"/>`;
  sh+=`<circle class="tank-water" cx="0" cy="0" r="${dim.r*.82}" style="fill:${d.type==='settlingTank'?'#f3dcae':d.type==='pump'?'#cfe1f1':d.type==='sludgeTank'?'#c9a991':'#8bd5d0'}"/>`;
  sh+=`<circle class="tank-rim" cx="0" cy="0" r="${dim.r*.91}"/>`;
  if(d.type==='fishTank'){
   sh+=`<path d="M ${-dim.r*.54} ${-dim.r*.10} Q ${-dim.r*.22} ${-dim.r*.29} 0 ${-dim.r*.10} T ${dim.r*.54} ${-dim.r*.10}" fill="none" stroke="#259d9d" stroke-width="2.4" opacity=".9"/>`;
   sh+=`<path d="M ${-dim.r*.42} ${dim.r*.18} Q ${-dim.r*.12} ${dim.r*.02} ${dim.r*.17} ${dim.r*.18}" fill="none" stroke="#fff" stroke-width="1.8" opacity=".9"/>`;
  }
  if(d.type==='biofilter'){
   for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)sh+=`<circle cx="${i*dim.r*.32}" cy="${j*dim.r*.32}" r="${Math.max(2,dim.r*.055)}" fill="#77a56e" opacity=".85"/>`;
   sh+=`<circle cx="0" cy="0" r="${dim.r*.53}" fill="none" stroke="#9bc18c" stroke-width="1.2" stroke-dasharray="3 3"/>`;
  }
  if(d.type==='settlingTank'){
   sh+=`<path d="M ${-dim.r*.42} ${dim.r*.15} Q 0 ${-dim.r*.18} ${dim.r*.42} ${dim.r*.15}" fill="none" stroke="#c0914d" stroke-width="2"/>`;
   sh+=`<circle cx="0" cy="${dim.r*.22}" r="${dim.r*.12}" fill="#c0914d" opacity=".7"/>`;
  }
  if(d.type==='storageTank')sh+=`<path d="M ${-dim.r*.48} 0 H ${dim.r*.48}" stroke="#fff" stroke-width="2.5" opacity=".9"/>`;
  if(d.type==='oxygenSource')sh+=`<rect x="${-dim.r*.28}" y="${-dim.r*.42}" width="${dim.r*.56}" height="${dim.r*.84}" rx="5" fill="#f6fbfc" stroke="#4f9aa7" stroke-width="1.8"/><text x="0" y="4" font-size="10" font-weight="800" text-anchor="middle" fill="#397e8c">O₂</text>`;
  if(d.type==='sludgeTank')sh+=`<path d="M ${-dim.r*.42} ${dim.r*.12} Q 0 ${dim.r*.42} ${dim.r*.42} ${dim.r*.12}" fill="none" stroke="#9a806f" stroke-width="2.2"/><text x="0" y="-${dim.r*.22}" font-size="8" font-weight="800" text-anchor="middle" fill="#80614e">BÙN</text>`;
  if(d.type==='pump'){
   sh+=`<circle cx="0" cy="0" r="${dim.r*.43}" fill="#fff" stroke="#6f99bd" stroke-width="1.6"/>`;
   for(let k=0;k<4;k++)sh+=`<path d="M 0 -${dim.r*.08} Q ${dim.r*.34} -${dim.r*.31} ${dim.r*.16} 0" transform="rotate(${k*90})" fill="none" stroke="#5e91b7" stroke-width="2.1" stroke-linecap="round"/>`;
   sh+=`<circle cx="0" cy="0" r="${dim.r*.09}" fill="#6d9fc0"/>`;
  }
 }else{
  sh+=`<rect class="equipment-shadow" x="${-dim.w/2+3}" y="${-dim.h/2+5}" width="${dim.w}" height="${dim.h}" rx="9"/>`;
  sh+=`<rect class="equipment-shell" x="${-dim.w/2}" y="${-dim.h/2}" width="${dim.w}" height="${dim.h}" rx="9" style="stroke:${color};fill:#e7efeb"/>`;
  sh+=`<rect class="equipment-face" x="${-dim.w/2+5}" y="${-dim.h/2+5}" width="${Math.max(8,dim.w-10)}" height="${Math.max(8,dim.h-10)}" rx="6"/>`;
  if(d.type==='drumFilter'||d.type==='mechanicalFilter'){
   for(let i=-1;i<=1;i++)sh+=`<path d="M ${i*dim.w*.19} ${-dim.h*.24} V ${dim.h*.24}" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
   sh+=`<path d="M ${-dim.w*.30} 0 H ${dim.w*.30}" stroke="${color}" stroke-width="2" opacity=".7"/>`;
  }else if(d.type==='blower'){
   sh+=`<circle cx="0" cy="0" r="${Math.min(dim.w,dim.h)*.24}" fill="#eee8f5" stroke="#a58bc0" stroke-width="2"/>`;
   for(let k=0;k<4;k++)sh+=`<path d="M 0 0 Q 5 -${Math.min(dim.w,dim.h)*.22} ${Math.min(dim.w,dim.h)*.13} -${Math.min(dim.w,dim.h)*.16}" transform="rotate(${k*90})" fill="none" stroke="#987eb7" stroke-width="2.4" stroke-linecap="round"/>`;
  }else if(d.type==='oxygenCone'){
   sh+=`<path d="M ${-dim.w*.24} ${-dim.h*.23} L 0 ${dim.h*.25} L ${dim.w*.24} ${-dim.h*.23}" fill="#cde9e0" stroke="#5f9f8e" stroke-width="2.1" stroke-linejoin="round"/>`;
  }else if(d.type==='uv'){
   sh+=`<path d="M ${-dim.w*.29} 0 H ${dim.w*.29}" stroke="#8e84bb" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="0" r="3" fill="#fff4b8"/>`;
  }else if(d.type==='valve'){
   sh+=`<path d="M -10 -9 L 10 9 M 10 -9 L -10 9" stroke="#c58b4d" stroke-width="3" stroke-linecap="round"/>`;
  }else{
   sh+=`<path d="M ${-dim.w*.25} 0 H ${dim.w*.25}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  }
 }
 const rawLabel=String(d.name||meta?.name||d.type),label=rawLabel.length>22?rawLabel.slice(0,21)+'…':rawLabel;
 const labelW=Math.max(68,Math.min(148,label.length*5.8+24));
 const labelBase=d.type==='fishTank'?4:(dim.round?dim.r+17:dim.h/2+17);const labelY=d.type==='fishTank'?4:(d.labelSide==='above'?-labelBase:labelBase);
 const insideTank=d.type==='fishTank';
 const secondary=insideTank?`${fmt(volumeOf(d),2)} m³ · Ø${fmt(p.diameter,1)} m`:'';
 const showPlate=!insideTank;
 return `<g class="device-node" data-id="${escapeHTML(d.id)}" tabindex="0" role="button" aria-label="${escapeHTML(rawLabel)}" transform="translate(${pt.x} ${pt.y}) rotate(${(d.rotation||0)*180/Math.PI})">
  <circle class="device-hit-area" cx="0" cy="0" r="${Math.max(dim.r,dim.w/2,dim.h/2)+9}"/>
  ${state.selectedId===d.id?`<rect class="node-select" x="${-Math.max(dim.r,dim.w/2)-10}" y="${-Math.max(dim.r,dim.h/2)-10}" width="${Math.max(dim.r*2,dim.w)+20}" height="${Math.max(dim.r*2,dim.h)+20}" rx="9"/>`:''}
  ${sh}
  ${state.labelsOn?(insideTank?`<g class="device-nameplate"><rect class="label-plate" x="${-labelW/2}" y="-13" width="${labelW}" height="24" rx="7"/><text class="device-label" x="0" y="3">${escapeHTML(label)}</text><text class="device-sub-label" x="0" y="${dim.r*.48}">${escapeHTML(secondary)}</text></g>`:`<g class="device-nameplate"><rect class="label-plate" x="${-labelW/2}" y="${labelY-10}" width="${labelW}" height="20" rx="7"/><circle class="label-dot" cx="${-labelW/2+8}" cy="${labelY}" r="3" fill="${color}"/><text class="device-label" x="4" y="${labelY+3.5}">${escapeHTML(label)}</text></g>`):''}
  <title>${escapeHTML(rawLabel)} · ${escapeHTML(d.id)}</title>
 </g>`;
}
function connectionClass(a,b,c=null){
 if(c?.kind){const k=String(c.kind);return k.startsWith('pipe-')?k:`pipe-${k}`}
 if(a.type==='blower'||b.type==='blower')return 'pipe-air';
 if(['pump','oxygenCone'].includes(a.type)||['pump','oxygenCone'].includes(b.type))return 'pipe-press';
 return 'pipe-water';
}
function planConnectionMarkup(c,index=0){
 const a=state.devices.find(x=>x.id===c.from),b=state.devices.find(x=>x.id===c.to);if(!a||!b)return '';
 const route=pipeRoute(c),pts=route.map(([x,z])=>planXY({x,z}));if(pts.length<2)return '';
 const d=pts.map((p,i)=>(i?'L':'M')+` ${p.x} ${p.y}`).join(' ');
 const cls=connectionClass(a,b,c),marker=cls==='pipe-air'?'arrowAir':cls==='pipe-press'?'arrowPress':cls==='pipe-waste'?'arrowWaste':'arrowWater';
 const color=cls==='pipe-air'?'#a58bc0':cls==='pipe-press'?'#d69a43':cls==='pipe-waste'?'#9a806f':'#299c9b';
 let label='';
 if(c.flowLabel||Number.isFinite(Number(c.flowM3h))){const q=Number.isFinite(Number(c.flowM3h))?Number(c.flowM3h):calc().flow;label=`${fmt(q,2)} m³/h`;}
 if(c.label)label=label?`${label} · ${c.label}`:c.label;
 const dia=c.showDiameterLabel===false?'':(c.diameterMm?`Ø${fmt(c.diameterMm,0)}`:(c.diameterLabel||''));
 if(dia)label=label?`${label} · ${dia}`:dia;
 if(Number.isFinite(Number(c.lengthM))&&Number(c.lengthM)>0)label=label?`${label} · ${fmt(c.lengthM,1)} m`:`${fmt(c.lengthM,1)} m`;
 let labelMarkup='';
 if(label){const at=c.labelAt?planXY({x:c.labelAt[0],z:c.labelAt[1]}):pts[Math.floor((pts.length-1)/2)];const w=Math.max(38,Math.min(190,label.length*5.1+14));labelMarkup=`<g class="pipe-label" transform="translate(${at.x} ${at.y})"><rect x="${-w/2}" y="-9" width="${w}" height="18" rx="5"/><text x="0" y="1">${escapeHTML(label)}</text></g>`;}
 const selected=state.selectedConnectionId===c.id;
 const controls=selected?`<path class="pipe-control-line" d="${d}"/>${pts.slice(1,-1).map((p,i)=>`<circle class="pipe-point-handle" data-pipe-point="${i+1}" data-connection-id="${escapeHTML(c.id)}" cx="${p.x}" cy="${p.y}" r="7"><title>Kéo để chỉnh tuyến ống</title></circle>`).join('')}${pts.length>1?`<circle class="pipe-start-end" cx="${pts[0].x}" cy="${pts[0].y}" r="5"/><circle class="pipe-start-end" cx="${pts.at(-1).x}" cy="${pts.at(-1).y}" r="5"/>`:''}`:'';
 return `<g class="pipe-group${selected?' selected':''}" data-connection-id="${escapeHTML(c.id)}">
  ${selected?`<path class="pipe-selected" d="${d}"/>`:''}
  <path class="pipe-halo" d="${d}"/>
  <path class="${cls}" d="${d}" marker-end="url(#${marker})"/>
  <path class="pipe-hit" data-connection-id="${escapeHTML(c.id)}" d="${d}" aria-label="Chọn đường ống"/>
  <circle cx="${pts[0].x}" cy="${pts[0].y}" r="3.4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
  ${labelMarkup}${controls}<title>${escapeHTML(a.name)} → ${escapeHTML(b.name)} · ${dia||'Đường ống'}</title>
 </g>`;
}
function renderPlan2D(){
 const svg=$('planSvg');if(!svg)return;
 const v=1200/state.planZoom,h=530/state.planZoom;svg.setAttribute('viewBox',`${600-v/2} ${265-h/2} ${v} ${h}`);
 const pipes=state.connections.map(planConnectionMarkup).join('');
 const devices=state.devices.map((d,i)=>planDeviceMarkup(d,i)).join('');
 let ticksX='',ticksY='';
 for(let m=0;m<=16;m+=1){const x=BOARD.x+m*PLAN.scale;ticksX+=`<text class="ruler-label" x="${x}" y="${BOARD.y+BOARD.h+15}" text-anchor="middle">${m}</text>`;}
 for(let m=0;m<=9;m+=1){const y=BOARD.y+m*PLAN.scale;ticksY+=`<text class="ruler-label" x="${BOARD.x-9}" y="${y+3}" text-anchor="end">${m}</text>`;}
 svg.innerHTML=`
 <defs>
  <filter id="boardShadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#46664f" flood-opacity=".09"/></filter>
  <filter id="labelShadow" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.8" flood-color="#3e5b46" flood-opacity=".10"/></filter>
  <pattern id="gridMinor" width="${PLAN.scale/2}" height="${PLAN.scale/2}" patternUnits="userSpaceOnUse"><path d="M${PLAN.scale/2} 0H0V${PLAN.scale/2}" fill="none" stroke="#e9f0e8" stroke-width="1"/></pattern>
  <pattern id="gridMajor" width="${PLAN.scale}" height="${PLAN.scale}" patternUnits="userSpaceOnUse"><path d="M${PLAN.scale} 0H0V${PLAN.scale}" fill="none" stroke="#d9e5d8" stroke-width="1.25"/></pattern>
  <marker id="arrowWater" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#299c9b"/></marker>
  <marker id="arrowPress" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#d69a43"/></marker>
  <marker id="arrowAir" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#a58bc0"/></marker>
  <marker id="arrowWaste" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#9a806f"/></marker>
 </defs>
 <rect class="plan-bg" x="0" y="0" width="1200" height="530"/>
 <text class="plot-title" x="${BOARD.x}" y="26">MẶT BẰNG BỐ TRÍ THIẾT BỊ RAS</text>
 <text class="plot-subtitle" x="${BOARD.x}" y="38">Sơ đồ công nghệ · Lưới 0,5 m · Kích thước khu vực 16 × 9 m</text>
 <rect class="plan-frame" x="${BOARD.x}" y="${BOARD.y}" width="${BOARD.w}" height="${BOARD.h}" rx="8" filter="url(#boardShadow)"/>
 <rect class="plan-board-inner" x="${BOARD.x}" y="${BOARD.y}" width="${BOARD.w}" height="${BOARD.h}" rx="8"/>
 ${state.gridOn?`<rect class="grid-minor" x="${BOARD.x}" y="${BOARD.y}" width="${BOARD.w}" height="${BOARD.h}"/><rect class="grid-major" x="${BOARD.x}" y="${BOARD.y}" width="${BOARD.w}" height="${BOARD.h}"/>`:''}
 <rect class="board-edge" x="${BOARD.x}" y="${BOARD.y}" width="${BOARD.w}" height="${BOARD.h}" rx="8"/>
 ${ticksX}${ticksY}
 <g class="pipe-layer">${pipes}</g>
 <g id="planDevices">${devices}</g>
 <g class="board-dimensions"><text class="dimension" x="600" y="${BOARD.y+BOARD.h+35}" text-anchor="middle">MẶT BẰNG 16 × 9 m</text><text class="board-caption" x="${BOARD.x+BOARD.w}" y="${BOARD.y+BOARD.h+35}" text-anchor="end">Đơn vị: mét</text></g>
 `;
 $('planZoomValue').textContent=Math.round(state.planZoom*100)+'%';
 $('viewportMeta').textContent=state.devices.length+' thiết bị · '+state.connections.length+' đường ống';
}
function addDevice(type,overrides={},position=null){clearPipeSelection();const meta=byType(type);if(!meta)throw new Error('Loại thiết bị không hợp lệ');const n=state.devices.length;const d={id:uid(),type,name:meta.name,params:{...meta.defaults,...overrides},x:position?.x??((n%4-1.5)*3),z:position?.z??(Math.floor(n/4)-1)*2.8,rotation:0,labelSide:'below'};state.devices.push(d);state.selectedId=d.id;markDirty();refreshAll();renderInspector();return d}
function selectedDevice(){return state.devices.find(d=>d.id===state.selectedId)||null}
function renderInspector(){const host=$('inspectorBody'),d=selectedDevice();$('inspectorTitle').textContent=state.activeTab==='device'?(selectedConnection()?'Thông số đường ống':'Thông số thiết bị'):state.activeTab==='calc'?'Tính toán hệ thống':'Cấu hình hệ thống';document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.activeTab));if(state.activeTab==='device'){const pipe=selectedConnection();if(pipe){renderPipeInspector(host,pipe);return}if(!d){host.innerHTML='<div class="empty"><span class="big">⌖</span>Chọn một thiết bị hoặc đường ống trên mô hình để xem và chỉnh sửa thông số.</div>';return}const fields=FIELDS[d.type]||[];host.innerHTML=`<div class="subcard"><h4>Thông tin thiết bị</h4><div class="field"><label>Tên hiển thị</label><input id="deviceName" type="text" maxlength="60" value="${escapeHTML(d.name)}"></div><div class="field-grid">${fields.map(([key,label,unit,step])=>`<div class="field"><label>${escapeHTML(label)} <em>${escapeHTML(unit)}</em></label><input type="number" step="${step}" data-param="${key}" value="${escNum(d.params[key])}"></div>`).join('')}</div><div class="muted">ID: ${escapeHTML(d.id)} · Loại: ${escapeHTML(byType(d.type)?.en||d.type)}</div></div><div class="subcard"><h4>Vị trí mặt bằng</h4><div class="field-grid"><div class="field"><label>Tọa độ X (m)</label><input type="number" step=".1" data-pos="x" value="${Number(d.x).toFixed(2)}"></div><div class="field"><label>Tọa độ Y/Z (m)</label><input type="number" step=".1" data-pos="z" value="${Number(d.z).toFixed(2)}"></div><div class="field"><label>Góc xoay (°)</label><input type="number" step="15" data-pos="rotation" value="${fmt(d.rotation*180/Math.PI,0)}"></div></div></div><div class="button-row"><button id="duplicateDevice">Nhân bản</button><button id="rotateDevice">Xoay 90°</button><button id="deleteDevice" class="danger">Xóa thiết bị</button></div>`;host.querySelector('#deviceName').addEventListener('change',e=>{d.name=e.target.value.trim()||byType(d.type).name;refreshAll();renderInspector();markDirty()});host.querySelectorAll('[data-param]').forEach(inp=>inp.addEventListener('change',()=>{const value=Number(inp.value);if(Number.isFinite(value)){d.params[inp.dataset.param]=value;refreshAll();renderInspector();markDirty()}}));host.querySelectorAll('[data-pos]').forEach(inp=>inp.addEventListener('change',()=>{const k=inp.dataset.pos,v=Number(inp.value);if(Number.isFinite(v)){if(k==='rotation')d.rotation=v*Math.PI/180;else d[k]=k==='x'?Math.max(-7.7,Math.min(7.7,v)):Math.max(-4.2,Math.min(4.2,v));refreshAll();renderInspector();markDirty()}}));host.querySelector('#duplicateDevice').onclick=duplicateSelected;host.querySelector('#rotateDevice').onclick=rotateSelected;host.querySelector('#deleteDevice').onclick=deleteSelected;return}if(state.activeTab==='calc'){renderCalculationTab();return}renderSettingsTab()}
function renderPipeInspector(host,c){
 const route=pipeRoute(c),deviceOptions=state.devices.map(d=>`<option value="${escapeHTML(d.id)}">${escapeHTML(d.name)}</option>`).join('');
 const from=state.devices.find(d=>d.id===c.from),to=state.devices.find(d=>d.id===c.to);
 const kind=String(c.kind||'water').replace(/^pipe-/,'');
 host.innerHTML=`
  <div class="subcard"><h4>Đường ống đang chọn</h4>
   <div class="pipe-type-pill"><span style="display:inline-block;width:18px;height:4px;border-radius:4px;background:${kind==='air'?'#a58bc0':kind==='press'?'#d69a43':kind==='waste'?'#9a806f':'#299c9b'}"></span>${kind==='air'?'Đường khí':kind==='press'?'Nước có áp':kind==='waste'?'Đường xả cặn / bùn':'Nước tự chảy'}</div>
   <div class="field" style="margin-top:10px"><label>Tên / ghi chú tuyến ống</label><input id="pipeName" type="text" maxlength="60" value="${escapeHTML(c.label||'') }" placeholder="Ví dụ: Ống hồi Ø90"></div>
   <div class="field-grid">
    <div class="field"><label>Thiết bị đầu</label><select id="pipeFrom">${deviceOptions}</select></div>
    <div class="field"><label>Thiết bị cuối</label><select id="pipeTo">${deviceOptions}</select></div>
    <div class="field"><label>Loại đường ống</label><select id="pipeKind"><option value="water">Nước tự chảy</option><option value="press">Nước có áp</option><option value="air">Khí</option><option value="waste">Xả cặn / bùn</option></select></div>
    <div class="field"><label>Đường kính trong (mm)</label><input id="pipeDiameter" type="number" min="1" step="1" value="${Number(c.diameterMm)||parseFloat(String(c.diameterLabel||'').replace(/[^0-9.]/g,''))||90}"></div>
    <div class="field"><label>Lưu lượng (m³/h)</label><input id="pipeFlow" type="number" min="0" step="0.1" value="${Number.isFinite(Number(c.flowM3h))?Number(c.flowM3h):''}" placeholder="Dùng lưu lượng hệ thống"></div>
    <div class="field"><label>Chiều dài (m)</label><input id="pipeLength" type="number" min="0.1" step="0.1" value="${fmt(pipeLengthM(c),2).replace(/\./g,'').replace(',','.')}"></div>
   </div>
   <div class="muted">${escapeHTML(from?.name||'Chưa chọn')} → ${escapeHTML(to?.name||'Chưa chọn')} · ID: ${escapeHTML(c.id)}</div>
  </div>
  <div class="subcard"><h4>Chỉnh tuyến trên mặt bằng 2D</h4>
   <div class="pipe-editor-note">Chọn đường ống trên bản vẽ. Kéo các nút tròn màu xanh để đổi hướng tuyến. Hai đầu ống tự bám vào mép thiết bị. Khi di chuyển thiết bị, đầu ống tự chạy theo; các nút xanh ở giữa dùng để chỉnh điểm gấp khúc.</div>
   <div class="muted">Số điểm tuyến: ${route.length} · Chiều dài hình học: ${fmt(pipeLengthM({...c,lengthM:null}),2)} m</div>
   <div class="pipe-editor-actions"><button id="pipeAddBend">＋ Thêm điểm gấp</button><button id="pipeStraight">Tuyến tự động</button><button id="pipeReverse">Đảo chiều</button></div>
   <div class="pipe-editor-actions"><button id="pipeDelete" class="danger">Xóa đường ống</button></div>
  </div>
  <div class="subcard"><h4>Gợi ý thao tác</h4><p class="muted">• Đổi thiết bị đầu/cuối để chuyển kết nối sang thiết bị khác.<br>• Đổi loại ống để thay màu và chú giải.<br>• Đường kính, lưu lượng và chiều dài được lưu trong file JSON của dự án.<br>• Thông số từng tuyến đang phục vụ bản vẽ; phần tính tổn thất thủy lực tổng thể vẫn dùng thông số ống chính ở tab Cấu hình.</p></div>`;
 host.querySelector('#pipeFrom').value=c.from;host.querySelector('#pipeTo').value=c.to;host.querySelector('#pipeKind').value=kind;
 const update=()=>{refreshAll();renderInspector();markDirty()};
 host.querySelector('#pipeName').addEventListener('change',e=>{c.label=e.target.value.trim();update()});
 host.querySelector('#pipeKind').addEventListener('change',e=>{c.kind=e.target.value;update()});
 host.querySelector('#pipeDiameter').addEventListener('change',e=>{const v=Number(e.target.value);if(Number.isFinite(v)&&v>0){c.diameterMm=v;c.diameterLabel=`Ø${fmt(v,0)}`;update()}});
 host.querySelector('#pipeLength').addEventListener('change',e=>{const v=Number(e.target.value);if(Number.isFinite(v)&&v>0){c.lengthM=v;update()}});
 host.querySelector('#pipeFlow').addEventListener('change',e=>{const v=e.target.value.trim()===''?null:Number(e.target.value);if(v===null){delete c.flowM3h;c.flowLabel=false}else if(Number.isFinite(v)&&v>=0){c.flowM3h=v;c.flowLabel=true}update()});
 host.querySelector('#pipeFrom').addEventListener('change',e=>{if(e.target.value===c.to){toast('Đầu nguồn và đầu cuối phải là hai thiết bị khác nhau');e.target.value=c.from;return}c.from=e.target.value;c.route=null;c.lengthM=null;update()});
 host.querySelector('#pipeTo').addEventListener('change',e=>{if(e.target.value===c.from){toast('Đầu nguồn và đầu cuối phải là hai thiết bị khác nhau');e.target.value=c.to;return}c.to=e.target.value;c.route=null;c.lengthM=null;update()});
 host.querySelector('#pipeAddBend').onclick=()=>{const pts=pipeRoute(c).map(p=>[...p]);let best=0,bestLen=-1;for(let i=1;i<pts.length;i++){const len=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(len>bestLen){bestLen=len;best=i}}const a=pts[best-1],b=pts[best],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];pts.splice(best,0,mid);c.route=pts;c.lengthM=null;update();toast('Đã thêm điểm gấp khúc – kéo nút xanh trên bản vẽ để chỉnh')};
 host.querySelector('#pipeStraight').onclick=()=>{c.route=null;c.lengthM=null;update();toast('Đã tạo lại tuyến tự động giữa hai thiết bị')};
 host.querySelector('#pipeReverse').onclick=()=>{const oldFrom=c.from;c.from=c.to;c.to=oldFrom;if(Array.isArray(c.route))c.route=c.route.slice().reverse();update();toast('Đã đảo chiều đường ống')};
 host.querySelector('#pipeDelete').onclick=deleteSelected;
}
function fieldHTML(key,label,unit,step,value){return `<div class="field"><label>${escapeHTML(label)} <em>${escapeHTML(unit)}</em></label><input type="number" step="${step}" data-global="${key}" value="${escNum(value)}"></div>`}
function renderCalculationTab(){const host=$('inspectorBody'),c=calc();host.innerHTML=`<div class="subcard"><h4>Kết quả tính nhanh</h4><div class="stat-line"><span>Thể tích bể nuôi</span><strong>${fmt(c.tankVolume)} m³</strong></div><div class="stat-line"><span>Tổng thể tích</span><strong>${fmt(c.totalVolume)} m³</strong></div><div class="stat-line"><span>Sinh khối cá</span><strong>${fmt(c.biomass)} kg</strong></div><div class="stat-line"><span>Thức ăn/ngày</span><strong>${fmt(c.feed)} kg</strong></div><div class="stat-line"><span>Lưu lượng tuần hoàn</span><strong>${fmt(c.flow)} m³/h</strong></div><div class="stat-line"><span>HRT bể lắng</span><strong>${fmt(c.hrt)} giờ</strong></div><div class="stat-line"><span>Tải TAN dự kiến</span><strong>${fmt(c.tan,3)} kg/ngày</strong></div><div class="stat-line"><span>Số biofilter song song</span><strong>${c.bioCount}</strong></div><div class="stat-line"><span>Vật liệu lọc đang có</span><strong>${fmt(c.mediaVol)} m³</strong></div><div class="stat-line"><span>Vật liệu biofilter cần</span><strong>${fmt(c.mediaRequired)} m³</strong></div><div class="stat-line"><span>TDH</span><strong>${fmt(c.tdh)} m</strong></div><div class="stat-line"><span>Công suất điện bơm</span><strong>${fmt(c.electrical)} kW</strong></div><div class="stat-line"><span>Vận tốc đường ống</span><strong>${fmt(c.velocity)} m/s</strong></div><div class="stat-line"><span>Nhu cầu oxy</span><strong>${fmt(c.oxygen,3)} kg/ngày</strong></div></div><div class="muted">Mở “Cấu hình” để chỉnh hệ số đầu vào. Các kết quả chỉ mang tính ước tính theo dữ liệu đã nhập.</div><button id="btnCalcReport" class="primary" style="width:100%;margin-top:10px">Xem báo cáo đầy đủ</button>`;$('btnCalcReport').onclick=showReport}
function renderSettingsTab(){const s=state.settings,host=$('inspectorBody');host.innerHTML=`<div class="subcard"><h4>Thủy lực & đường ống</h4><div class="field-grid">${fieldHTML('turnoverHours','Thời gian tuần hoàn','giờ',.1,s.turnoverHours)}${fieldHTML('staticHead','Cột áp tĩnh','m',.1,s.staticHead)}${fieldHTML('pipeDiameter','Đường kính ống chính','m',.005,s.pipeDiameter)}${fieldHTML('pipeLength','Tổng chiều dài ống','m',.5,s.pipeLength)}${fieldHTML('minorK','Tổng hệ số tổn thất cục bộ K','—',.5,s.minorK)}${fieldHTML('frictionFactor','Hệ số ma sát Darcy f','—',.001,s.frictionFactor)}${fieldHTML('pumpEfficiency','Hiệu suất bơm mặc định','%',1,s.pumpEfficiency)}</div></div><div class="subcard"><h4>Sinh học & oxy</h4><div class="field-grid">${fieldHTML('feedRate','Tỷ lệ thức ăn mặc định','%',.1,s.feedRate)}${fieldHTML('tanPerKgFeed','TAN phát sinh','kg TAN/kg thức ăn',.001,s.tanPerKgFeed)}${fieldHTML('oxygenConsumption','Tiêu thụ oxy','g O₂/kg cá/giờ',.01,s.oxygenConsumption)}${fieldHTML('oxygenEfficiency','Hiệu suất chuyển oxy mặc định','%',1,s.oxygenEfficiency)}${fieldHTML('doCurrent','DO hiện tại','mg/L',.1,s.doCurrent)}${fieldHTML('doTarget','DO mục tiêu','mg/L',.1,s.doTarget)}</div><p class="muted">Các hệ số TAN và tiêu thụ oxy là dữ liệu đầu vào giả định để khảo sát. Hãy thay bằng số liệu phù hợp với loài nuôi, thức ăn, nhiệt độ và thiết bị thực tế.</p></div><div class="subcard"><h4>Ngưỡng cảnh báo</h4><div class="field-grid">${fieldHTML('maxVelocity','Vận tốc tối đa','m/s',.1,s.maxVelocity)}${fieldHTML('maxHeadLoss','Tổn thất cho phép','m',.1,s.maxHeadLoss)}</div></div>`;host.querySelectorAll('[data-global]').forEach(inp=>inp.addEventListener('change',()=>{const v=Number(inp.value);if(Number.isFinite(v)&&v>=0){s[inp.dataset.global]=v;refreshDashboard();refreshFlow();renderPlan2D();draw3D();renderSettingsTab();markDirty()}}))}
function setTab(tab){state.activeTab=tab;renderInspector()}
function selectDevice(id){clearPipeSelection();state.selectedId=id;renderPlan2D();draw3D();renderInspector()}
function deselect(){state.selectedId=null;clearPipeSelection();renderPlan2D();renderInspector();draw3D()}
function duplicateSelected(){const d=selectedDevice();if(!d){toast('Chưa chọn thiết bị');return}const copy=JSON.parse(JSON.stringify(d));copy.id=uid();copy.name=d.name+' (bản sao)';copy.x=Math.min(11.5,d.x+1.5);copy.z=Math.min(8.5,d.z+1.2);state.devices.push(copy);state.selectedId=copy.id;refreshAll();renderInspector();markDirty();toast('Đã nhân bản thiết bị')}
function deleteSelected(){const pipe=selectedConnection();if(pipe){state.connections=state.connections.filter(c=>c.id!==pipe.id);clearPipeSelection();refreshAll();renderInspector();markDirty();toast('Đã xóa đường ống');return}const d=selectedDevice();if(!d){toast('Chưa chọn thiết bị hoặc đường ống');return}state.devices=state.devices.filter(x=>x.id!==d.id);state.connections=state.connections.filter(c=>c.from!==d.id&&c.to!==d.id);state.selectedId=null;clearPipeSelection();refreshAll();renderInspector();markDirty();toast('Đã xóa thiết bị và các kết nối liên quan')}
function rotateSelected(){const d=selectedDevice();if(!d){toast('Chưa chọn thiết bị');return}d.rotation=(d.rotation+Math.PI/2)%(Math.PI*2);refreshAll();renderInspector();markDirty()}
function autoConnect(){const order=['fishTank','rectTank','settlingTank','drumFilter','mechanicalFilter','biofilter','degassing','oxygenCone','storageTank','pump','uv'];const ordered=[];for(const t of order){const d=state.devices.find(x=>x.type===t&&!ordered.includes(x));if(d)ordered.push(d)}if(ordered.length<2){toast('Cần ít nhất 2 thiết bị để tạo tuyến mẫu');return}state.connections=[];for(let i=0;i<ordered.length-1;i++)state.connections.push({id:uid(),from:ordered[i].id,to:ordered[i+1].id});if(ordered.some(d=>d.type==='uv'))state.connections.push({id:uid(),from:ordered[ordered.length-1].id,to:ordered[0].id});refreshAll();markDirty();toast('Đã tạo tuyến mẫu; hãy kiểm tra lại theo sơ đồ công nghệ thực tế')}
function startConnect(){state.connectMode=true;state.pendingConnect=null;$('btnConnect').classList.add('active');$('viewportHint').textContent='Chế độ nối ống: nhấp thiết bị nguồn, sau đó nhấp thiết bị đích. Nhấn ESC để thoát.';toast('Chọn thiết bị nguồn rồi chọn thiết bị đích')}
function finishConnect(id){clearPipeSelection();if(!state.pendingConnect){state.pendingConnect=id;selectDevice(id);toast('Đã chọn đầu nguồn. Chọn thiết bị đích.');return}if(state.pendingConnect===id){toast('Hãy chọn thiết bị khác');return}if(state.connections.some(c=>c.from===state.pendingConnect&&c.to===id)){toast('Kết nối này đã tồn tại');return}state.connections.push({id:uid(),from:state.pendingConnect,to:id});state.pendingConnect=null;state.connectMode=false;$('btnConnect').classList.remove('active');$('viewportHint').textContent='Nhấp thiết bị hoặc đường ống để chỉnh sửa · Kéo thiết bị để bố trí · Cuộn để phóng to/thu nhỏ';refreshAll();markDirty();toast('Đã nối ống')}
function cancelConnect(){state.connectMode=false;state.pendingConnect=null;$('btnConnect').classList.remove('active');$('viewportHint').textContent='Kéo thiết bị để di chuyển · Nhấp thiết bị hoặc đường ống để chỉnh sửa · Chọn “Xem 3D” để quan sát không gian'}
// 2D interaction
let planDrag=null;
function planPoint(e){const svg=$('planSvg'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=pt.matrixTransform(svg.getScreenCTM().inverse());return {x:(m.x-PLAN.cx)/PLAN.scale,z:(m.y-PLAN.cy)/PLAN.scale}}
let pipeDrag=null;
function nearestPipeAt(p){
 let best=null,bestDistance=Infinity;
 for(const c of state.connections){const route=pipeRoute(c);for(let i=1;i<route.length;i++){const [ax,ay]=route[i-1],[bx,by]=route[i],dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;const t=len2?Math.max(0,Math.min(1,((p.x-ax)*dx+(p.z-ay)*dy)/len2)):0;const qx=ax+t*dx,qy=ay+t*dy,dist=Math.hypot(p.x-qx,p.z-qy);if(dist<bestDistance){bestDistance=dist;best={connection:c,segment:i,point:[qx,qy]}}}
 }
 return bestDistance<=Math.max(.12,.28/state.planZoom)?best:null;
}
$('planSvg').addEventListener('pointerdown',e=>{
 const p=planPoint(e),tol=Math.max(.12,.25/state.planZoom);
 // Handles have priority so they can be dragged even where a pipe crosses another element.
 if(state.selectedConnectionId){const c=selectedConnection(),route=c?pipeRoute(c):[];let handleIndex=-1,handleDist=Infinity;for(let i=1;i<route.length-1;i++){const d=Math.hypot(p.x-route[i][0],p.z-route[i][1]);if(d<handleDist){handleDist=d;handleIndex=i}}if(handleIndex>0&&handleDist<tol){pipeDrag={id:c.id,index:handleIndex,moved:false};$('planSvg').setPointerCapture(e.pointerId);e.preventDefault();return}}
 // Device shapes take priority over nearby pipes.
 const node=e.target.closest?.('[data-id]');
 if(node){const id=node.dataset.id;if(state.connectMode){finishConnect(id);e.preventDefault();return}const d=state.devices.find(x=>x.id===id);if(!d)return;selectDevice(id);planDrag={id,moved:false,pointerId:e.pointerId};$('planSvg').setPointerCapture(e.pointerId);e.preventDefault();return}
 const pipeNode=e.target.closest?.('[data-connection-id]');
 if(pipeNode&&!state.connectMode){selectConnection(pipeNode.dataset.connectionId);e.preventDefault();return}
 // Geometric hit-testing fallback: selecting pipe remains reliable even on SVG transparent strokes.
 if(!state.connectMode){const hit=nearestPipeAt(p);if(hit){selectConnection(hit.connection.id);e.preventDefault();return}}
});
$('planSvg').addEventListener('pointermove',e=>{
 if(pipeDrag){const c=state.connections.find(x=>x.id===pipeDrag.id);if(!c)return;const p=planPoint(e),route=pipeRoute(c).map(q=>[...q]);if(pipeDrag.index>0&&pipeDrag.index<route.length-1){route[pipeDrag.index]=[Math.max(-7.7,Math.min(7.7,p.x)),Math.max(-4.2,Math.min(4.2,p.z))];c.route=route;c.lengthM=null;pipeDrag.moved=true;renderPlan2D();draw3D()}return}
 if(!planDrag)return;const p=planPoint(e),d=state.devices.find(x=>x.id===planDrag.id);if(!d)return;d.x=Math.max(-7.7,Math.min(7.7,p.x));d.z=Math.max(-4.2,Math.min(4.2,p.z));planDrag.moved=true;renderPlan2D()
});
function endPipeDrag(){if(!pipeDrag)return;const moved=pipeDrag.moved;pipeDrag=null;if(moved){refreshDashboard();refreshFlow();renderPlan2D();draw3D();renderInspector();markDirty()}}
function endPlanDrag(){if(!planDrag)return;const moved=planDrag.moved;planDrag=null;if(moved){refreshAll();renderInspector();markDirty()}}
$('planSvg').addEventListener('pointerup',()=>{endPipeDrag();endPlanDrag()});$('planSvg').addEventListener('pointercancel',()=>{endPipeDrag();endPlanDrag()});$('planSvg').addEventListener('wheel',e=>{if(state.viewMode!=='2d')return;e.preventDefault();state.planZoom=Math.max(.65,Math.min(1.8,state.planZoom*(e.deltaY<0?1.08:.92)));renderPlan2D()},{passive:false});
// Lightweight 3D projection engine, works offline: perspective/isometric drawing on Canvas.
const view3d=$('view3d'),ctx=view3d.getContext('2d');const camera3={yaw:-.68,zoom:1,pitch:.52,panX:0,panY:0};let drag3=null,renderFrame=0;
function resizeCanvas(){const r=view3d.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(view3d.width!==w||view3d.height!==h){view3d.width=w;view3d.height=h}draw3D()}
function project3(x,y,z){const co=Math.cos(camera3.yaw),si=Math.sin(camera3.yaw),xr=x*co-z*si,zr=x*si+z*co;const scale=45*camera3.zoom;const cx=view3d.width/(window.devicePixelRatio||1)/2+camera3.panX,cy=view3d.height/(window.devicePixelRatio||1)/2+camera3.panY;return {x:cx+xr*scale,y:cy+zr*scale*Math.sin(camera3.pitch)-y*scale*Math.cos(camera3.pitch),depth:zr}}
function path3(points,stroke,width=2,fill=null){if(!points.length)return;ctx.beginPath();points.forEach((p,i)=>{const q=project3(p[0],p[1],p[2]);if(!i)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y)});if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke()}}
function drawGround(){const W=view3d.width/(window.devicePixelRatio||1),H=view3d.height/(window.devicePixelRatio||1);ctx.fillStyle='#edf3e8';ctx.fillRect(0,0,W,H);const floor=[[-8,0,-4.5],[8,0,-4.5],[8,0,4.5],[-8,0,4.5]];path3(floor,'#c9d9c4',1,'#f5f7ef');if(state.gridOn){for(let x=-8;x<=8;x+=.5)path3([[x,0,-4.5],[x,0,4.5]],Math.abs(x-Math.round(x))<.01?'#c2d5be':'#d9e4d5',Math.abs(x-Math.round(x))<.01?.8:.45);for(let z=-4.5;z<=4.5;z+=.5)path3([[-8,0,z],[8,0,z]],Math.abs(z-Math.round(z))<.01?'#c2d5be':'#d9e4d5',Math.abs(z-Math.round(z))<.01?.8:.45)}path3([[-8,.02,-4.5],[8,.02,-4.5],[8,.02,4.5],[-8,.02,4.5],[-8,.02,-4.5]],'#67aaa0',2)}
function boxFaces(x,z,w,d,h,color){const pts=[[x-w/2,0,z-d/2],[x+w/2,0,z-d/2],[x+w/2,0,z+d/2],[x-w/2,0,z+d/2]];const top=pts.map(p=>[p[0],h,p[2]]);path3([pts[0],pts[1],top[1],top[0]],null,1,'#bfd0c1');path3([pts[1],pts[2],top[2],top[1]],null,1,'#9fbba8');path3(top.concat([top[0]]),color,1.4, color);path3([top[0],top[1],top[2],top[3],top[0]],'#779e8b',1.3)}
function cylinderDevice(d){const p=d.params,x=d.x,z=d.z,r=Math.max(.2,escNum(p.diameter,1)/2),h=Math.max(.25,escNum(p.height,1)),water=Math.min(h,Math.max(0,escNum(p.waterLevel,h*.7)));const N=32,bottom=[],top=[],waterTop=[];for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;bottom.push([xx,.02,zz]);top.push([xx,h,zz]);waterTop.push([xx,water,zz])}const side=[...bottom,...top.slice().reverse()];path3(side,null,1,'#d9e8df');for(let i=0;i<N;i+=4)path3([bottom[i],top[i]],'#8ba99b',1);path3(top,'#609d91',2);path3(waterTop,'#54b8b3',1.2);const waterCenter=project3(x,water,z);ctx.beginPath();ctx.ellipse(waterCenter.x,waterCenter.y,r*29*camera3.zoom,r*29*camera3.zoom*Math.sin(camera3.pitch)*.68,0,0,Math.PI*2);ctx.fillStyle='rgba(87,199,195,.24)';ctx.fill();if(d.type==='biofilter'){for(let i=0;i<14;i++){const a=i*2.4,r2=r*.72,pt=project3(x+Math.cos(a)*r2,water*.7,z+Math.sin(a)*r2);ctx.beginPath();ctx.arc(pt.x,pt.y,2.1,0,Math.PI*2);ctx.fillStyle='#89aa72';ctx.fill()}}}
function drawDevice3(d){const p=d.params,round=ROUND_TYPES.has(d.type);if(round){cylinderDevice(d);return}const w=Math.max(.3,escNum(p.width,.8)),dep=Math.max(.3,escNum(p.depth,.55)),h=Math.max(.25,escNum(p.height,.5));boxFaces(d.x,d.z,w,dep,h,'#c9d9ce');if(d.type==='pump'||d.type==='blower'||d.type==='uv'){const pt=project3(d.x,h*.55,d.z);ctx.beginPath();ctx.arc(pt.x,pt.y,Math.max(5,Math.min(w,dep)*10*camera3.zoom),0,Math.PI*2);ctx.fillStyle=d.type==='pump'?'#80afd0':d.type==='blower'?'#bca8cb':'#92a1c7';ctx.fill();ctx.strokeStyle='#688d9b';ctx.stroke()}if(d.type==='oxygenCone'){path3([[d.x-w*.24,h*.85,d.z],[d.x,h*.25,d.z],[d.x+w*.24,h*.85,d.z]],'#579e92',2)}}
function pipePoints(a,b){const pa=a.params||{},pb=b.params||{},halfA=Math.max(.3,escNum(pa.diameter,Math.max(pa.width||1,pa.depth||.7))*.5),halfB=Math.max(.3,escNum(pb.diameter,Math.max(pb.width||1,pb.depth||.7))*.5);const sy=.35,ey=.35,elev=1.25;return [[a.x+halfA,sy,a.z],[a.x+halfA,elev,a.z],[b.x-halfB,elev,b.z],[b.x-halfB,ey,b.z]]}
function drawPipe3(c){const a=state.devices.find(x=>x.id===c.from),b=state.devices.find(x=>x.id===c.to);if(!a||!b)return;const cls=connectionClass(a,b,c),color=cls==='pipe-air'?'#a58bc0':cls==='pipe-press'?'#d49b47':cls==='pipe-waste'?'#9a806f':'#299c9b';const pts=pipeRoute(c).map(([x,z])=>[x,cls==='pipe-air'?.55:1.0,z]);path3(pts,color,2.8*camera3.zoom);if(state.flowOn){const mid=pts[Math.floor((pts.length-1)/2)];const p=project3(mid[0],mid[1],mid[2]);ctx.beginPath();ctx.arc(p.x,p.y,3.3,0,Math.PI*2);ctx.fillStyle='#fff';ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.fill();ctx.stroke()}}
function draw3D(){if(!view3d||!ctx||state.viewMode!=='3d')return;const dpr=Math.min(window.devicePixelRatio||1,2);const W=view3d.width/dpr,H=view3d.height/dpr;if(!W||!H)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);drawGround();state.connections.forEach(drawPipe3);const sorted=[...state.devices].sort((a,b)=>project3(a.x,0,a.z).depth-project3(b.x,0,b.z).depth);sorted.forEach(d=>drawDevice3(d));for(const d of state.devices){if(state.selectedId===d.id){const p=project3(d.x,1.4,d.z);ctx.beginPath();ctx.ellipse(p.x,p.y,Math.max(18,(d.params.diameter||d.params.width||1)*19*camera3.zoom),10*camera3.zoom,0,0,Math.PI*2);ctx.strokeStyle='#239b82';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([])}if(state.labelsOn){const h=escNum(d.params.height,1);const pt=project3(d.x,h+0.25,d.z);const text=d.name.length>20?d.name.slice(0,19)+'…':d.name;ctx.font='10px Segoe UI,Arial';const tw=ctx.measureText(text).width+12;ctx.fillStyle='rgba(255,255,255,.9)';ctx.strokeStyle='#dce7dc';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(pt.x-tw/2,pt.y-9,tw,18,5);ctx.fill();ctx.stroke();ctx.fillStyle='#526e5d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,pt.x,pt.y)}}}
function hitTest3(x,y){let best=null,dist=30;for(const d of state.devices){const p=project3(d.x,Math.max(.4,escNum(d.params.height,1)*.45),d.z);const dd=Math.hypot(p.x-x,p.y-y);const size=Math.max(20,(d.params.diameter||d.params.width||1)*14*camera3.zoom);if(dd<Math.max(dist,size*.65)){best=d;dist=dd}}return best}
function resizeCanvasIfVisible(){if(state.viewMode==='3d')resizeCanvas()}
view3d.addEventListener('pointerdown',e=>{const rect=view3d.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,hit=hitTest3(x,y);drag3={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,hitId:hit?.id||null,moved:false,mode:hit?'device':'camera'};view3d.setPointerCapture(e.pointerId);if(hit){if(state.connectMode){finishConnect(hit.id);drag3=null;return}selectDevice(hit.id)}});
view3d.addEventListener('pointermove',e=>{if(!drag3)return;const dx=e.clientX-drag3.lastX,dy=e.clientY-drag3.lastY;if(Math.hypot(e.clientX-drag3.x,e.clientY-drag3.y)>3)drag3.moved=true;if(drag3.moved){if(drag3.mode==='camera'&&!drag3.hitId){camera3.yaw+=dx*.008;camera3.panY+=dy*.4;camera3.panX+=dx*.35}else if(drag3.hitId){const d=state.devices.find(x=>x.id===drag3.hitId);if(d){d.x=Math.max(-7.7,Math.min(7.7,d.x+dx/(45*camera3.zoom)));d.z=Math.max(-4.2,Math.min(4.2,d.z+dy/(45*camera3.zoom*Math.max(.25,Math.sin(camera3.pitch)))))}}}drag3.lastX=e.clientX;drag3.lastY=e.clientY;if(drag3.moved)draw3D()});
view3d.addEventListener('pointerup',()=>{if(!drag3)return;if(drag3.moved&&drag3.hitId){refreshAll();renderInspector();markDirty()}drag3=null});view3d.addEventListener('pointercancel',()=>{drag3=null});view3d.addEventListener('wheel',e=>{e.preventDefault();camera3.zoom=Math.max(.55,Math.min(2.2,camera3.zoom*(e.deltaY<0?1.08:.92)));draw3D()},{passive:false});
function setViewMode(mode){state.viewMode=mode==='3d'?'3d':'2d';$('planSvg').style.display=state.viewMode==='2d'?'block':'none';view3d.style.display=state.viewMode==='3d'?'block':'none';$('btnTopView').classList.toggle('active',state.viewMode==='2d');$('btnIso').classList.toggle('active',state.viewMode==='3d');$('canvasStatus').textContent=state.viewMode==='2d'?'KIỂM TRA BỐ TRÍ 2D':'MÔ HÌNH KHÔNG GIAN 3D';$('viewportHint').textContent=state.viewMode==='2d'?'Kéo thiết bị để di chuyển · Nhấp để chỉnh thông số · Cuộn để phóng to':'Kéo nền để xoay/góc nhìn · Kéo thiết bị để di chuyển · Cuộn để phóng to';if(state.viewMode==='3d'){resizeCanvas();draw3D()}else renderPlan2D()}
function projectData(){return {format:'FarmRAS3D',version:2,projectName:$('projectName').value,devices:state.devices,connections:state.connections,settings:state.settings,view:{mode:state.viewMode,planZoom:state.planZoom,camera3},savedAt:new Date().toISOString()}}
function downloadBlob(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function saveLocal(showToast=true){try{localStorage.setItem('farmRAS3D_project_v72',JSON.stringify(projectData()));state.dirty=false;if(showToast)toast('Đã lưu dự án trên trình duyệt này')}catch(err){if(showToast)toast('Không lưu được trong trình duyệt. Hãy xuất JSON để sao lưu.')}}
function loadProject(data){if(!data||!Array.isArray(data.devices))throw new Error('File dự án không có danh sách thiết bị hợp lệ.');const clean=[];for(const src of data.devices){if(!src||!byType(src.type))continue;const meta=byType(src.type);clean.push({id:String(src.id||uid()),type:src.type,name:String(src.name||meta.name),params:{...meta.defaults,...(src.params&&typeof src.params==='object'?src.params:{})},x:escNum(src.x),z:escNum(src.z),rotation:escNum(src.rotation),labelSide:src.labelSide==='above'?'above':'below'})}state.devices=clean;const ids=new Set(clean.map(d=>d.id));state.connections=(Array.isArray(data.connections)?data.connections:[]).filter(c=>c&&ids.has(c.from)&&ids.has(c.to)).map(c=>({id:String(c.id||uid()),from:c.from,to:c.to,...(c.kind?{kind:c.kind}:{}),...(Array.isArray(c.route)?{route:c.route}:{}),...(c.label?{label:c.label}:{}),...(c.flowLabel?{flowLabel:true}:{}),...(c.flowM3h!==undefined?{flowM3h:escNum(c.flowM3h)}:{}),...(c.diameterLabel?{diameterLabel:c.diameterLabel}:{}),...(c.diameterMm!==undefined?{diameterMm:escNum(c.diameterMm)}:{}),...(c.showDiameterLabel===false?{showDiameterLabel:false}:{}),...(c.lengthM!==undefined?{lengthM:escNum(c.lengthM)}:{}),...(Array.isArray(c.labelAt)?{labelAt:c.labelAt}:{})}));state.settings={...state.settings,...(data.settings||{})};state.projectName=String(data.projectName||'Dự án RAS');$('projectName').value=state.projectName;state.selectedId=null;state.selectedConnectionId=null;state.pipeEditMode=false;state.planZoom=Math.max(.65,Math.min(1.8,escNum(data.view?.planZoom,1)));Object.assign(camera3,data.view?.camera3||{});state.activeTab='device';refreshAll();renderInspector();setViewMode(data.view?.mode||'2d');state.dirty=false}
function importJSON(file){const reader=new FileReader();reader.onload=()=>{try{loadProject(JSON.parse(reader.result));saveLocal();toast('Đã mở dự án JSON')}catch(err){alert('Không thể mở dự án: '+err.message)}};reader.readAsText(file)}
function reportRows(){const c=calc();return [['Bể nuôi','Tổng thể tích bể nuôi',fmt(c.tankVolume)+' m³','π × (D/2)² × H nước; bể chữ nhật: L × W × H nước'],['Sinh khối','Tổng trọng lượng cá',fmt(c.biomass)+' kg','Số cá × khối lượng trung bình/con'],['Thức ăn','Lượng thức ăn/ngày',fmt(c.feed)+' kg/ngày','Sinh khối × tỷ lệ thức ăn (%)'],['Lưu lượng','Lưu lượng tuần hoàn yêu cầu',fmt(c.flow)+' m³/h','Q = tổng thể tích làm việc của bể nuôi / thời gian tuần hoàn mục tiêu'],['Bể lắng','Thể tích hữu ích',fmt(c.settlingVolume)+' m³','V = π × (D/2)² × H nước'],['Bể lắng','Thời gian lưu nước HRT',fmt(c.hrt)+' giờ','HRT = V bể lắng / Q'],['Biofilter','Thể tích vật liệu lọc hiện có',fmt(c.mediaVol)+' m³','V bể lọc × tỷ lệ vật liệu'],['Biofilter','Thể tích vật liệu cần theo tải TAN',fmt(c.mediaRequired)+' m³','Tải TAN dự kiến / tải TAN thiết kế trên mỗi m³ vật liệu'],['Biofilter','Thể tích bể lọc gộp cần thiết',fmt(c.bioTankRequired)+' m³','V vật liệu yêu cầu / tỷ lệ vật liệu'],['Biofilter','Diện tích bề mặt vật liệu hiện có',fmt(c.bioSurface)+' m²','V vật liệu hiện có × diện tích bề mặt riêng'],['Biofilter','Tải TAN dự kiến',fmt(c.tan,3)+' kg/ngày','Thức ăn/ngày × hệ số TAN đầu vào'],['Biofilter','Khả năng tải TAN theo hệ số',fmt(c.tanCapacity,3)+' kg/ngày','V vật liệu × tải TAN thiết kế'],['Bơm','Tổng cột áp TDH',fmt(c.tdh)+' m','Cột áp tĩnh + tổn thất dọc + tổn thất cục bộ'],['Bơm','Công suất thủy lực',fmt(c.hydraulic/1000)+' kW','P = ρ × g × Q × H'],['Bơm','Công suất điện ước tính tại điểm làm việc',fmt(c.electrical)+' kW','P điện = P thủy lực / hiệu suất'],['Bơm','Công suất động cơ khai báo',fmt(c.motorPower)+' kW','Giá trị minh họa; cần kiểm tra theo đường đặc tính bơm và dự phòng của nhà sản xuất'],['Đường ống','Vận tốc dòng chảy',fmt(c.velocity)+' m/s','v = Q / A'],['Đường ống','Tổn thất dọc đường',fmt(c.frictionHead)+' m','Darcy–Weisbach: f × (L/D) × v²/(2g)'],['Đường ống','Tổn thất cục bộ',fmt(c.minorHead)+' m','K tổng × v²/(2g)'],['Oxy','Nhu cầu oxy sinh học',fmt(c.oxygen,3)+' kg O₂/ngày','Sinh khối × tiêu thụ oxy × 24 giờ'],['Oxy','Oxy nguồn cần cấp (ước tính)',fmt(c.oxygenSource,3)+' kg O₂/ngày','Nhu cầu oxy / hiệu suất chuyển oxy'],['Oxy','Năng lực nguồn O₂ khai báo',fmt(c.oxygenSourceCapacity,3)+' kg/h','Đối chiếu với nhu cầu nguồn oxy theo giờ; xác nhận theo thiết bị thật'],['Oxy','Oxy bù DO tức thời',fmt(c.oxygenDeficitKg,4)+' kg O₂','(DO mục tiêu − DO hiện tại) × thể tích nước / 1000']]}
function showReport(){const c=calc(),rows=reportRows(),warnings=c.warnings.map(w=>`<li>${escapeHTML(w.text)}</li>`).join('')||'<li>Không có cảnh báo hiện tại.</li>';const table=`<table class="report-table"><thead><tr><th>Nhóm</th><th>Thông số</th><th>Kết quả</th><th>Công thức / cơ sở</th></tr></thead><tbody>${rows.map(r=>'<tr>'+r.map(v=>'<td>'+escapeHTML(v)+'</td>').join('')+'</tr>').join('')}</tbody></table>`;const note=`<p class="report-note"><b>Cơ sở lưu lượng:</b> Q được tính từ tổng thể tích làm việc của các bể nuôi chia cho thời gian tuần hoàn mục tiêu (không cộng thể tích bể lọc vào lưu lượng yêu cầu qua bể nuôi).</p><p class="report-note"><b>Giả định đầu vào:</b> Thời gian tuần hoàn ${fmt(state.settings.turnoverHours)} giờ; cột áp tĩnh ${fmt(state.settings.staticHead)} m; ống chính Ø${fmt(state.settings.pipeDiameter*1000,0)} mm; chiều dài ống ${fmt(state.settings.pipeLength)} m; hệ số ma sát Darcy f=${fmt(state.settings.frictionFactor,4)}; hệ số K=${fmt(state.settings.minorK)}; TAN=${fmt(state.settings.tanPerKgFeed,3)} kg TAN/kg thức ăn; tiêu thụ oxy=${fmt(state.settings.oxygenConsumption,2)} g O₂/kg cá/giờ.</p><p class="report-note"><b>Lưu ý kỹ thuật:</b> Nguồn oxy tinh khiết đã được khai báo riêng cho côn oxy; máy thổi khí chỉ cấp khí cho các MBBR trong sơ đồ mẫu. Nhu cầu oxy hiện chỉ là ước tính theo sinh khối và hệ số người dùng nhập, chưa cộng đầy đủ nhu cầu oxy của vi khuẩn, chất hữu cơ và tải BOD. Kết quả phụ thuộc hoàn toàn vào dữ liệu và hệ số người dùng nhập. Công suất bơm dùng cột áp tĩnh cộng tổn thất ước tính theo Darcy–Weisbach và K tổng; chưa thay thế việc tính từng nhánh, phụ kiện, NPSH và đối chiếu đường đặc tính Q-H của bơm tại điểm làm việc. Cần thẩm tra bởi người có chuyên môn trước khi thi công.</p>`;$('modalTitle').textContent='Báo cáo tính toán RAS';$('modalContent').innerHTML=`<h3>${escapeHTML($('projectName').value)}</h3><p>Ngày lập: ${new Date().toLocaleString('vi-VN')} · Đánh giá sơ bộ: <b>${escapeHTML(c.status)}</b></p>${table}<h4>Cảnh báo & kiểm tra</h4><ul>${warnings}</ul>${note}<div class="button-row"><button class="primary" id="reportPrint">In / Xuất PDF</button><button id="reportCSV">Xuất Excel (CSV)</button><button id="reportJSON">Xuất dự án JSON</button></div>`;$('modalBackdrop').classList.add('show');$('reportPrint').onclick=()=>{$('printArea').innerHTML=`<h2>${escapeHTML($('projectName').value)}</h2>${table}${note}`;window.print()};$('reportCSV').onclick=exportCSV;$('reportJSON').onclick=()=>downloadBlob(JSON.stringify(projectData(),null,2),'Farm_RAS_Project.json','application/json')}
function exportCSV(){const rows=[['Nhóm','Thông số','Kết quả','Công thức / cơ sở'],...reportRows()];const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');downloadBlob(csv,'Farm_RAS_Calculation_Report.csv','text/csv;charset=utf-8');toast('Đã xuất bảng CSV có thể mở bằng Excel')}
function showMore(){ $('modalTitle').textContent='Quản lý dự án';$('modalContent').innerHTML='<div class="subcard"><h4>Lưu và trao đổi dự án</h4><p class="muted">Lưu tại trình duyệt này hoặc xuất JSON để sao lưu/chuyển sang máy khác.</p><div class="button-row"><button class="primary" id="moreExport">Xuất JSON</button><button id="moreImport">Mở JSON</button><button id="moreSave">Lưu trên máy này</button></div></div><div class="subcard"><h4>Công cụ</h4><div class="button-row"><button id="moreCSV">Xuất Excel (CSV)</button><button id="moreClear" class="danger">Tạo dự án trống</button></div></div>';$('modalBackdrop').classList.add('show');$('moreExport').onclick=()=>downloadBlob(JSON.stringify(projectData(),null,2),'Farm_RAS_Project.json','application/json');$('moreImport').onclick=()=>{$('modalBackdrop').classList.remove('show');$('fileImport').click()};$('moreSave').onclick=()=>{saveLocal();$('modalBackdrop').classList.remove('show')};$('moreCSV').onclick=exportCSV;$('moreClear').onclick=()=>{if(confirm('Tạo dự án trống? Hãy xuất JSON trước nếu cần sao lưu.')){state.devices=[];state.connections=[];state.selectedId=null;refreshAll();renderInspector();$('modalBackdrop').classList.remove('show');markDirty()}}}

// ===== Local account module =====
const AUTH_USERS_KEY='farmRAS3D_local_users_v1';
const AUTH_SESSION_KEY='farmRAS3D_local_session_v2'; // buộc xác thực lại khi nâng cấp từ bản cũ
let authMode='login',volatileAuthUsers=[],volatileAuthSession=null;
function readAuthUsers(){try{const v=JSON.parse(localStorage.getItem(AUTH_USERS_KEY)||'[]');volatileAuthUsers=Array.isArray(v)?v:[];return volatileAuthUsers}catch(e){return volatileAuthUsers}}
function writeAuthUsers(users){volatileAuthUsers=users;try{localStorage.setItem(AUTH_USERS_KEY,JSON.stringify(users));}catch(e){/* bộ nhớ tạm trong phiên nếu trình duyệt chặn lưu trữ */}}
function readAuthSession(){try{const s=JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)||'null');volatileAuthSession=s&&s.email?s:null;return volatileAuthSession}catch(e){return volatileAuthSession}}
function writeAuthSession(session){volatileAuthSession=session;try{localStorage.setItem(AUTH_SESSION_KEY,JSON.stringify(session));}catch(e){/* bộ nhớ tạm trong phiên nếu trình duyệt chặn lưu trữ */}}
function authHex(bytes){return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function authFromHex(hex){const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.slice(i*2,i*2+2),16);return out}
function sha256Bytes(message){
 const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 const rotr=(x,n)=>(x>>>n)|(x<<(32-n));
 const bitLen=message.length*8,total=((message.length+9+63)>>6)<<6,data=new Uint8Array(total);data.set(message);data[message.length]=0x80;
 const view=new DataView(data.buffer);view.setUint32(total-8,Math.floor(bitLen/0x100000000),false);view.setUint32(total-4,bitLen>>>0,false);
 let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const W=new Uint32Array(64);
 for(let offset=0;offset<total;offset+=64){
  for(let i=0;i<16;i++)W[i]=view.getUint32(offset+i*4,false);
  for(let i=16;i<64;i++){const x=W[i-15],y=W[i-2],s0=rotr(x,7)^rotr(x,18)^(x>>>3),s1=rotr(y,17)^rotr(y,19)^(y>>>10);W[i]=(W[i-16]+s0+W[i-7]+s1)>>>0;}
  let [a,b,c,d,e,f,g,h]=H;
  for(let i=0;i<64;i++){const S1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+W[i])>>>0,S0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&c)^(b&c),t2=(S0+maj)>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
  H=H.map((v,i)=>(v+[a,b,c,d,e,f,g,h][i])>>>0);
 }
 const result=new Uint8Array(32),outView=new DataView(result.buffer);H.forEach((v,i)=>outView.setUint32(i*4,v,false));return result;
}
function hmacSha256(key,message){
 let k=key.length>64?sha256Bytes(key):new Uint8Array(key);const block=new Uint8Array(64);block.set(k);
 const inner=new Uint8Array(64+message.length),outer=new Uint8Array(64+32);
 for(let i=0;i<64;i++){inner[i]=block[i]^0x36;outer[i]=block[i]^0x5c;}
 inner.set(message,64);outer.set(sha256Bytes(inner),64);return sha256Bytes(outer);
}
function pbkdf2Fallback(passwordBytes,saltBytes,iterations){
 const first=new Uint8Array(saltBytes.length+4);first.set(saltBytes);first.set([0,0,0,1],saltBytes.length);
 let u=hmacSha256(passwordBytes,first),t=new Uint8Array(u);
 for(let i=1;i<iterations;i++){u=hmacSha256(passwordBytes,u);for(let j=0;j<t.length;j++)t[j]^=u[j];}
 return t;
}
async function deriveAuthHash(password,saltHex){
 const salt=authFromHex(saltHex),encoder=new TextEncoder(),pass=encoder.encode(password),iterations=150000;
 if(window.crypto?.subtle){const key=await crypto.subtle.importKey('raw',pass,'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);return authHex(bits);}
 // Fallback chuẩn PBKDF2-HMAC-SHA256 để vẫn đăng ký được khi mở file HTML cục bộ.
 return authHex(pbkdf2Fallback(pass,salt,iterations));
}
function authMessage(message,success=false){const node=$('authMessage');if(!node)return;node.textContent=message;node.className='auth-message'+(success?' success':'');node.hidden=false}
function updateAuthArea(){
 const area=$('authArea'),session=readAuthSession();if(!area)return;
 if(session){const display=(session.name||session.email.split('@')[0]).slice(0,18);area.innerHTML=`<button class="auth-user" id="btnAuthProfile">♙ ${escapeHTML(display)}</button><button id="btnAuthLogout">Đăng xuất</button>`;$('btnAuthProfile').onclick=()=>openAuthModal('profile');$('btnAuthLogout').onclick=logoutLocal;}
 else{area.innerHTML='<button id="btnOpenAuth" class="account-button">♙ Đăng nhập / Đăng ký</button>';$('btnOpenAuth').onclick=()=>openAuthModal('login');}
}
function setAuthMode(mode){
 authMode=mode==='register'?'register':'login';
 $('authTabLogin').classList.toggle('active',authMode==='login');
 $('authTabRegister').classList.toggle('active',authMode==='register');
 $('authTabLogin').setAttribute('aria-selected',String(authMode==='login'));
 $('authTabRegister').setAttribute('aria-selected',String(authMode==='register'));
 $('authHeading').textContent=authMode==='login'?'Chào mừng bạn trở lại':'Tạo tài khoản Farm RAS';
 $('authSubtitle').textContent=authMode==='login'?'Đăng nhập để tiếp tục thiết kế và quản lý hệ thống RAS.':'Tạo tài khoản để lưu và quản lý dự án trên trình duyệt này.';
 const mailIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>';
 const userIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>';
 const lockIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
 const eyeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
 const eyeOffIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.1 0 9.5 6 9.5 6a15 15 0 0 1-3 3.5M6.2 6.3C3.8 8 2.5 12 2.5 12s3.4 6 9.5 6c1.1 0 2.1-.2 3-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
 const field=(id,label,type,placeholder,autocomplete,icon,extra='')=>`<div class="auth-field"><label for="${id}">${label}</label><div class="auth-input-wrap"><span class="auth-field-icon">${icon}</span><input id="${id}" name="${id==='authName'?'name':id==='authEmail'?'email':id==='authConfirm'?'confirm':'password'}" type="${type}" autocomplete="${autocomplete}" placeholder="${placeholder}" ${extra} required>${type==='password'?`<button class="auth-password-toggle" type="button" data-toggle-password="${id}" aria-label="Hiện mật khẩu">${eyeIcon}</button>`:''}</div></div>`;
 if(authMode==='login'){
  $('authFormArea').innerHTML=`<form id="authForm" class="auth-form auth-form-login" novalidate>
   ${field('authEmail','ĐỊA CHỈ EMAIL','email','name@example.com','username',mailIcon,'inputmode="email"')}
   ${field('authPassword','MẬT KHẨU','password','Nhập mật khẩu của bạn','current-password',lockIcon)}
   <div class="auth-form-meta"><span><i class="auth-meta-dot"></i> Truy cập an toàn trên thiết bị này</span><span>LOCAL ACCOUNT</span></div>
   <div id="authMessage" class="auth-message" role="alert" hidden></div>
   <button class="auth-submit" id="authSubmit" type="submit"><span>Đăng nhập hệ thống</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
   <p class="auth-switch">Bạn chưa có tài khoản? <button type="button" id="authSwitch">Đăng ký ngay <span>→</span></button></p>
  </form>`;
  $('authSwitch').onclick=()=>setAuthMode('register');
 }else{
  $('authFormArea').innerHTML=`<form id="authForm" class="auth-form auth-form-register" novalidate>
   ${field('authName','HỌ VÀ TÊN','text','Tên hiển thị của bạn','name',userIcon,'minlength="2" maxlength="60"')}
   ${field('authEmail','ĐỊA CHỈ EMAIL','email','name@example.com','email',mailIcon,'inputmode="email"')}
   ${field('authPassword','MẬT KHẨU','password','Tối thiểu 8 ký tự','new-password',lockIcon,'minlength="8"')}
   ${field('authConfirm','XÁC NHẬN MẬT KHẨU','password','Nhập lại mật khẩu','new-password',lockIcon,'minlength="8"')}
   <div class="auth-register-hint"><span>✓</span> Mật khẩu cần có ít nhất 8 ký tự.</div>
   <div id="authMessage" class="auth-message" role="alert" hidden></div>
   <button class="auth-submit" id="authSubmit" type="submit"><span>Tạo tài khoản</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
   <p class="auth-switch">Bạn đã có tài khoản? <button type="button" id="authSwitch">Đăng nhập <span>→</span></button></p>
  </form>`;
  $('authSwitch').onclick=()=>setAuthMode('login');
 }
 document.querySelectorAll('[data-toggle-password]').forEach(button=>button.addEventListener('click',()=>{
  const input=$(button.dataset.togglePassword);if(!input)return;
  const show=input.type==='password';input.type=show?'text':'password';
  button.innerHTML=show?eyeOffIcon:eyeIcon;button.setAttribute('aria-label',show?'Ẩn mật khẩu':'Hiện mật khẩu');
 }));
 $('authForm').addEventListener('submit',handleAuthSubmit);
}
function setAuthGate(required){
 const backdrop=$('authBackdrop');
 document.body.classList.toggle('auth-locked',!!required);
 backdrop.classList.toggle('auth-gate',!!required);
 if(required){
  backdrop.classList.add('show');backdrop.setAttribute('aria-hidden','false');
  if($('authClose'))$('authClose').hidden=true;
 }else{
  backdrop.classList.remove('auth-gate');backdrop.setAttribute('aria-hidden','true');
  if($('authClose'))$('authClose').hidden=false;
 }
}
function openAuthModal(mode='login'){
 const session=readAuthSession();
 if(!session){setAuthGate(true);setAuthMode(mode==='register'?'register':'login');return;}
 if(mode==='profile'&&session){
  authMode='profile';$('authTabLogin').classList.remove('active');$('authTabRegister').classList.remove('active');$('authHeading').textContent='Tài khoản của bạn';$('authSubtitle').textContent='Thông tin đăng nhập được lưu trên thiết bị này.';
  $('authFormArea').innerHTML=`<div class="subcard"><div class="stat-line"><span>Họ và tên</span><strong>${escapeHTML(session.name||'—')}</strong></div><div class="stat-line"><span>Email</span><strong>${escapeHTML(session.email)}</strong></div><div class="stat-line"><span>Phạm vi</span><strong>Trình duyệt hiện tại</strong></div><button class="auth-submit" id="profileLogout" type="button">Đăng xuất</button></div>`;
  $('profileLogout').onclick=logoutLocal;
 }else{setAuthMode(mode)}
 $('authBackdrop').classList.add('show');$('authBackdrop').setAttribute('aria-hidden','false');
}
function closeAuthModal(){
 // Không cho đóng màn hình xác thực nếu chưa đăng nhập.
 if(!readAuthSession()){setAuthGate(true);return;}
 $('authBackdrop').classList.remove('show');$('authBackdrop').setAttribute('aria-hidden','true');
}
async function handleAuthSubmit(event){
 event.preventDefault();const submit=$('authSubmit');if(!submit)return;submit.disabled=true;submit.textContent=authMode==='register'?'Đang tạo tài khoản…':'Đang đăng nhập…';
 try{
  const email=$('authEmail').value.trim().toLowerCase(),password=$('authPassword').value;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Vui lòng nhập địa chỉ email hợp lệ.');
  const users=readAuthUsers();
  if(authMode==='register'){
   const name=$('authName').value.trim(),confirmPass=$('authConfirm').value;
   if(name.length<2)throw new Error('Họ tên cần có ít nhất 2 ký tự.');
   if(password.length<8)throw new Error('Mật khẩu cần có ít nhất 8 ký tự.');
   if(password!==confirmPass)throw new Error('Mật khẩu nhập lại chưa khớp.');
   if(users.some(u=>u.email===email))throw new Error('Email này đã được đăng ký trên trình duyệt. Hãy đăng nhập.');
   const salt=new Uint8Array(16);if(window.crypto?.getRandomValues)crypto.getRandomValues(salt);else for(let i=0;i<salt.length;i++)salt[i]=Math.floor(Math.random()*256);const saltHex=authHex(salt),hash=await deriveAuthHash(password,saltHex);
   const user={id:uid(),name,email,salt:saltHex,hash,createdAt:new Date().toISOString()};users.push(user);writeAuthUsers(users);
   writeAuthSession({id:user.id,name:user.name,email:user.email,loginAt:new Date().toISOString()});
   setAuthGate(false);closeAuthModal();updateAuthArea();toast('Đăng ký thành công. Bạn đã đăng nhập.');return;
  }
  const user=users.find(u=>u.email===email);if(!user)throw new Error('Không tìm thấy tài khoản này trên trình duyệt. Bạn hãy đăng ký trước.');
  const hash=await deriveAuthHash(password,user.salt);if(hash!==user.hash)throw new Error('Email hoặc mật khẩu không chính xác.');
  writeAuthSession({id:user.id,name:user.name,email:user.email,loginAt:new Date().toISOString()});
  setAuthGate(false);closeAuthModal();updateAuthArea();toast('Đăng nhập thành công.');
 }catch(error){authMessage(error?.message||'Không thể xử lý yêu cầu.');}
 finally{if($('authSubmit')){$('authSubmit').disabled=false;$('authSubmit').innerHTML=`<span>${authMode==='register'?'Tạo tài khoản':'Đăng nhập hệ thống'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>`;}}
}
function logoutLocal(){
 volatileAuthSession=null;try{localStorage.removeItem(AUTH_SESSION_KEY)}catch(e){}
 updateAuthArea();setAuthGate(true);setAuthMode('login');
 toast('Đã đăng xuất. Vui lòng đăng nhập để tiếp tục sử dụng Farm RAS.');
}
function initAuth(){
 updateAuthArea();$('authTabLogin').onclick=()=>setAuthMode('login');$('authTabRegister').onclick=()=>setAuthMode('register');if($('authClose'))$('authClose').onclick=closeAuthModal;
 $('authBackdrop').addEventListener('click',e=>{if(e.target===$('authBackdrop')){if(!readAuthSession())setAuthGate(true);else closeAuthModal()}});
 $('btnOpenAuth')?.addEventListener('click',()=>openAuthModal('login'));
 // First visit or signed-out state: lock the whole workspace and require login/register.
 if(readAuthSession())setAuthGate(false);
 else{setAuthGate(true);setAuthMode('login');}
}


function exportPlanSVG(){
 const svg=$('planSvg').cloneNode(true);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','1200');svg.setAttribute('height','700');
 const style=document.createElementNS('http://www.w3.org/2000/svg','style');
 style.textContent=`.plan-bg{fill:#f3f7f1}.plan-frame{fill:#fff;stroke:#cbd9cb;stroke-width:1.8}.plan-board-inner{fill:#fff;stroke:#d6e2d4;stroke-width:1.2}.grid-minor{fill:url(#gridMinor)}.grid-major{fill:url(#gridMajor)}.board-edge{fill:none;stroke:#8eaa91;stroke-width:2.3}.plot-title{font:700 13px Arial,sans-serif;fill:#496c57;letter-spacing:1.1px}.plot-subtitle{font:10px Arial,sans-serif;fill:#91a193}.dimension{font:700 11px Arial,sans-serif;fill:#6e8c76}.ruler-label{font:9px Arial,sans-serif;fill:#8b9e8d}.ruler-tick{stroke:#a5b9a3;stroke-width:1}.tank-shadow,.equipment-shadow{fill:#8da99a;opacity:.16}.tank-shell{fill:#e8f4f1;stroke:#51aaa1;stroke-width:2.6}.tank-water{fill:#8bd5d0;fill-opacity:.52;stroke:#6ec4bd;stroke-width:1.2}.tank-rim{fill:none;stroke:#fff;stroke-width:2}.equipment-shell{fill:#fff;stroke:#a4b9a7;stroke-width:2.1}.equipment-face{fill:#edf4ed;stroke:#d4e1d5}.device-label{font:650 11px Arial,sans-serif;fill:#3d5b49;text-anchor:middle}.label-plate{fill:#fff;stroke:#dce7dc}.label-dot{stroke:#fff;stroke-width:1.5}.pipe-halo{fill:none;stroke:#fff;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}.pipe-water{fill:none;stroke:#299c9b;stroke-width:4.2}.pipe-press{fill:none;stroke:#d69a43;stroke-width:4}.pipe-air{fill:none;stroke:#a58bc0;stroke-width:3.2;stroke-dasharray:7 6}.pipe-waste{fill:none;stroke:#9a806f;stroke-width:3;stroke-dasharray:3 5}.node-select{fill:#39a58d;fill-opacity:.07;stroke:#239b82;stroke-width:2.8;stroke-dasharray:7 5}.selection-tag{fill:#e8f5ed;stroke:#b8dac4}.selection-text{font:700 9px Arial,sans-serif;fill:#34775f}.port-dot{fill:#fff;stroke:#6daaa0;stroke-width:1.5}.board-caption{font:10px Arial,sans-serif;fill:#91a393}.pipe-label rect{fill:#fff;stroke:#deeadf;stroke-width:1}.pipe-label text{font:600 9px Arial,sans-serif;fill:#5e7d70;text-anchor:middle}`;
 svg.insertBefore(style,svg.firstChild);const xml=new XMLSerializer().serializeToString(svg);downloadBlob(xml,'Farm_RAS_2D_Plan.svg','image/svg+xml;charset=utf-8');toast('Đã xuất sơ đồ 2D SVG');
}

// Main UI events
$('libSearch').addEventListener('input',e=>renderLibrary(e.target.value));$('projectName').addEventListener('change',markDirty);$('btnTopView').onclick=()=>setViewMode('2d');$('btnIso').onclick=()=>setViewMode('3d');$('btnHome').onclick=()=>{camera3.yaw=-.68;camera3.zoom=1;camera3.panX=0;camera3.panY=0;state.planZoom=1;draw3D();renderPlan2D()};$('btnGrid').onclick=()=>{state.gridOn=!state.gridOn;$('btnGrid').classList.toggle('active',state.gridOn);$('btnGrid').textContent=state.gridOn?'Lưới 0,5 m':'Lưới: Tắt';renderPlan2D();draw3D()};$('btnLabels').onclick=()=>{state.labelsOn=!state.labelsOn;$('btnLabels').classList.toggle('active',state.labelsOn);$('btnLabels').textContent='Nhãn: '+(state.labelsOn?'Bật':'Tắt');renderPlan2D();draw3D()};$('btnFit').onclick=()=>{state.planZoom=1;camera3.zoom=1;camera3.panX=0;camera3.panY=0;renderPlan2D();draw3D()};$('btnScreenshot').onclick=()=>{if(state.viewMode==='2d'){exportPlanSVG()}else{draw3D();view3d.toBlob(blob=>{if(blob)downloadBlob(blob,'Farm_RAS_3D_View.png','image/png')})}};$('btnPlanZoomIn').onclick=()=>{state.planZoom=Math.min(1.8,state.planZoom*1.12);renderPlan2D()};$('btnPlanZoomOut').onclick=()=>{state.planZoom=Math.max(.65,state.planZoom/1.12);renderPlan2D()};$('btnDuplicate').onclick=duplicateSelected;$('btnRotate').onclick=rotateSelected;$('btnDelete').onclick=deleteSelected;$('btnDeselect').onclick=()=>{state.selectedId=null;clearPipeSelection();renderInspector();refreshAll()};$('btnPipeEdit').onclick=()=>{state.pipeEditMode=!state.pipeEditMode;$('btnPipeEdit').classList.toggle('active',state.pipeEditMode);$('viewportHint').textContent=state.pipeEditMode?'Chế độ chỉnh ống: nhấp đường ống để chọn · kéo các nút xanh để đổi tuyến':'Nhấp vào đường ống để mở bảng chỉnh sửa';toast(state.pipeEditMode?'Đã bật chọn và chỉnh sửa đường ống':'Đã tắt chế độ chỉnh ống')};$('btnResetLayout').onclick=loadReferenceLayout;$('btnConnect').onclick=startConnect;$('btnAutoFlow').onclick=autoConnect;$('btnReferenceLayout').onclick=loadReferenceLayout;$('btnFlowToggle').onclick=()=>{state.flowOn=!state.flowOn;$('btnFlowToggle').textContent='Dòng chảy: '+(state.flowOn?'Bật':'Tắt');$('btnFlowToggle').classList.toggle('primary',state.flowOn);draw3D()};$('btnFlowDiagram').onclick=refreshFlow;$('btnSave').onclick=saveLocal;$('btnReport').onclick=showReport;$('btnMore').onclick=showMore;$('modalClose').onclick=()=>$('modalBackdrop').classList.remove('show');$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))$('modalBackdrop').classList.remove('show')});$('fileImport').addEventListener('change',e=>{if(e.target.files[0])importJSON(e.target.files[0]);e.target.value=''});document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>setTab(btn.dataset.tab)));window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!readAuthSession()){setAuthGate(true);return;}if(e.key==='Escape'&&state.connectMode)cancelConnect();else if(e.key==='Escape'&&state.selectedConnectionId){clearPipeSelection();renderPlan2D();renderInspector();draw3D()}if((e.key==='Delete'||e.key==='Backspace')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))deleteSelected()});window.addEventListener('resize',resizeCanvasIfVisible);
$('modalBackdrop').addEventListener('keydown',e=>{if(e.key==='Escape')$('modalBackdrop').classList.remove('show')});
// Reference 2D layout: recreated from the user's supplied engineering drawing.
function loadReferenceLayout(){
 const make=(type,name,params,x,z,labelSide='below')=>{const m=byType(type);return {id:uid(),type,name,params:{...m.defaults,...params},x,z,rotation:0,labelSide}};
 // Demo basis: one tank D=2.5m, working depth 0.8m, 500 fish x 0.30kg, feed 1.5%/day.
 const tank=make('fishTank','Bể nuôi 01',{diameter:2.5,height:1.2,waterLevel:.8,fishCount:500,avgFishWeight:.3,feedRate:1.5,ratedFlow:10},-6,-1.5);
 const settler=make('settlingTank','Bể lắng',{diameter:1.25,height:1.5,waterLevel:1.4,designHRT:.2,ratedFlow:10},-3.7,-1.5,'above');
 const drum=make('drumFilter','Drum 60 µm',{width:1.2,depth:.8,height:.95,ratedFlow:12,meshMicron:60},-1.65,-1.5);
 const valve1=make('valve','Van VS01',{width:.28,depth:.28,height:.2},0,-3,'below');
 const valve2=make('valve','Van VS02',{width:.28,depth:.28,height:.2},0,-1.5,'above');
 const valve3=make('valve','Van VS03',{width:.28,depth:.28,height:.2},0,0,'above');
 const bio1=make('biofilter','MBBR 01',{diameter:1,height:1.3,waterLevel:1.1,mediaFraction:50,specificSurfaceArea:500,tanLoading:.1,ratedFlow:4},1.8,-3,'above');
 const bio2=make('biofilter','MBBR 02',{diameter:1,height:1.3,waterLevel:1.1,mediaFraction:50,specificSurfaceArea:500,tanLoading:.1,ratedFlow:4},1.8,-1.5,'below');
 const bio3=make('biofilter','MBBR 03',{diameter:1,height:1.3,waterLevel:1.1,mediaFraction:50,specificSurfaceArea:500,tanLoading:.1,ratedFlow:4},1.8,0,'below');
 const degas=make('degassing','Khử khí CO₂',{diameter:.9,height:1.5,waterLevel:1.1,ratedFlow:10},3.8,-1.5,'above');
 const sump=make('storageTank','Sump nước sạch',{diameter:1.5,height:1.2,waterLevel:1,ratedFlow:10},5.35,-1.5,'below');
 const pump=make('pump','Bơm chính',{width:.75,depth:.56,height:.55,ratedFlow:10,head:4,efficiency:60,motorPower:.25},6.8,-1.5,'above');
 const uv=make('uv','UV (tùy chọn)',{width:.9,depth:.25,height:.3,ratedFlow:10,power:.12},7.05,.15,'below');
 const oxygen=make('oxygenCone','Côn O₂',{diameter:.5,height:1.2,ratedFlow:10,oxygenTransferEfficiency:70},6.25,2,'above');
 const oxygenSource=make('oxygenSource','Nguồn O₂',{diameter:.38,height:1.1,waterLevel:.08,capacity:.12},4.25,3.2,'below');
 const blower=make('blower','Máy thổi khí',{width:.7,depth:.45,height:.45,power:.37,airFlow:120,airPressure:20},-1.4,3,'below');
 const airManifold=make('valve','Chia khí 3 nhánh',{width:.5,depth:.25,height:.2},.25,3,'above');
 const sludge=make('sludgeTank','Bể thu bùn',{diameter:.8,height:.9,waterLevel:.45},-3.7,3.2,'below');
 state.devices=[tank,settler,drum,valve1,valve2,valve3,bio1,bio2,bio3,degas,sump,pump,uv,oxygen,oxygenSource,blower,airManifold,sludge];
 const link=(from,to,kind,extra={})=>({id:uid(),from:from.id,to:to.id,kind,...extra});
 const main=(from,to,kind,diameterMm,flowM3h=null)=>link(from,to,kind,{diameterMm,diameterLabel:`Ø${diameterMm}`,...(flowM3h!==null?{flowM3h,flowLabel:true}:{})});
 const route=(from,to,kind,diameterMm,points,label='')=>link(from,to,kind,{diameterMm,diameterLabel:`Ø${diameterMm}`,route:points,...(label?{label}:{})});
 state.connections=[
  main(tank,settler,'water',110,7.85), main(settler,drum,'water',110),
  route(drum,valve1,'water',63,[[-1.05,-1.5],[-.55,-1.5],[-.55,-3],[-.14,-3]]), main(valve1,bio1,'water',63),
  main(drum,valve2,'water',63), main(valve2,bio2,'water',63),
  route(drum,valve3,'water',63,[[-1.05,-1.5],[-.55,-1.5],[-.55,0],[-.14,0]]), main(valve3,bio3,'water',63),
  route(bio1,degas,'water',75,[[2.3,-3],[2.9,-3],[2.9,-1.5],[3.35,-1.5]]), main(bio2,degas,'water',75),
  route(bio3,degas,'water',75,[[2.3,0],[2.9,0],[2.9,-1.5],[3.35,-1.5]]), main(degas,sump,'water',90),
  main(sump,pump,'water',90), route(pump,uv,'press',90,[[7.2,-1.5],[7.65,-1.5],[7.65,.15],[7.5,.15]]),
  main(uv,oxygen,'press',90), route(oxygen,tank,'press',90,[[6.25,2],[6.25,-4.05],[-7.35,-4.05],[-7.35,-1.5]]),
  link(blower,airManifold,'air',{diameterMm:32,diameterLabel:'Ø32',label:'120 L/min'}),
  route(airManifold,bio1,'air',20,[[.5,3],[1,3],[1,-3],[1.55,-3]]),
  route(airManifold,bio2,'air',20,[[.5,3],[1.2,3],[1.2,-1.5],[1.55,-1.5]]),
  route(airManifold,bio3,'air',20,[[.5,3],[1.4,3],[1.4,0],[1.55,0]]),
  route(oxygenSource,oxygen,'air',10,[[4.55,3.2],[5.3,3.2],[5.3,2],[5.85,2]],'O₂ 0,075 kg/h'),
  route(settler,sludge,'waste',50,[[-3.7,-1.5],[-3.7,2.6],[-3.7,2.85]],'Xả cặn bể lắng'),
  route(drum,sludge,'waste',50,[[-1.65,-1.5],[-2.35,-1.5],[-2.35,3.2],[-3.3,3.2]],'Nước rửa Drum')
 ];
 state.connections.forEach((c,i)=>{if(i>=2&&i<=10)c.showDiameterLabel=false});
 const o2line=state.connections.find(c=>c.from===oxygenSource.id&&c.to===oxygen.id);if(o2line)o2line.labelAt=[5.3,2.55];
 state.settings={...state.settings,turnoverHours:.5,staticHead:2.5,pipeDiameter:.09,pipeLength:30,minorK:8,pumpEfficiency:60,feedRate:1.5,tanPerKgFeed:.03,oxygenConsumption:.35,oxygenEfficiency:70,doCurrent:5.5,doTarget:6,frictionFactor:.025,maxVelocity:2,maxHeadLoss:5};
 state.projectName='Farm RAS – 150 kg cá · 3 MBBR · thu bùn + khử khí + UV + O₂';$('projectName').value=state.projectName;
 state.selectedId=tank.id;state.planZoom=1;camera3.yaw=-.68;camera3.zoom=.82;camera3.panX=0;camera3.panY=0;
 refreshAll();renderInspector();state.dirty=true;saveLocal(false);toast('Đã nạp cấu hình RAS V7.2 · 18 thiết bị · 23 tuyến ống');
}
function init(){
 renderLibrary();
 const saved=(()=>{try{return localStorage.getItem('farmRAS3D_project_v72')}catch(e){return null}})();
 if(saved){try{loadProject(JSON.parse(saved));state.dirty=false;return}catch(err){console.warn('Không thể đọc dự án V4 đã lưu:',err)}}
 loadReferenceLayout();state.dirty=false;
}
initAuth();
init();
