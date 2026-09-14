/* BIG BROTHER — Daily Sale Summary Mobile V1 */
(async function(){
'use strict';
const SUPABASE_URL='https://sjfhlaclgmkwwofzstok.supabase.co';
const SUPABASE_KEY='sb_publishable_w762jR65CWwlO30fKQsYOw_6L9grx8S';
const SESSION_KEY='BB_SUPABASE_DEV_SESSION_V1';
const frame=document.getElementById('dailySaleFrame');
const boot=document.getElementById('boot');
const bootCard=document.getElementById('bootCard');
let session=null;

function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(_){return null}}
function saveSession(s){session=s||null;try{if(!s){localStorage.removeItem(SESSION_KEY);return}if(!s.expires_at&&s.expires_in)s.expires_at=Math.floor(Date.now()/1000)+Number(s.expires_in);localStorage.setItem(SESSION_KEY,JSON.stringify(s))}catch(_){}}
async function parse(r){const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch(_){d={message:t}}if(!r.ok)throw new Error(d.message||d.error_description||d.error||('Request failed ('+r.status+')'));return d}
async function refreshSession(){const s=readSession();if(!s?.refresh_token)throw new Error('Please sign in to BIG BROTHER first.');const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token}),cache:'no-store'});const next=await parse(r);saveSession(next);return next}
async function ensureSession(){session=readSession();if(!session?.access_token)throw new Error('Please sign in to BIG BROTHER first.');if(session.expires_at&&Number(session.expires_at)<Math.floor(Date.now()/1000)+45)await refreshSession();return session}
async function rpc(fn,args={}){await ensureSession();const call=()=>fetch(SUPABASE_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify(args||{}),cache:'no-store'});let r=await call();if(r.status===401){await refreshSession();r=await call()}return parse(r)}
function norm(v){return String(v||'').trim().toLowerCase()}
async function assertPermission(){const p=await rpc('bb_current_access_profile');if(p?.user?.isAdmin===true||norm(p?.user?.role)==='admin')return;const mods=Array.isArray(p?.modules)?p.modules:[];const grant=mods.find(x=>norm(x.moduleKey??x.module_key)==='*')||mods.find(x=>norm(x.moduleKey??x.module_key)==='route.daily-sale-summary')||mods.find(x=>norm(x.moduleKey??x.module_key)==='daily_sale_summary');const canView=grant?.canView??grant?.can_view;if(canView!==true)throw new Error('You do not have permission to view Daily Sale Summary.')}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function showError(message){bootCard.innerHTML='Could not open Daily Sale Summary<div class="bb-sub">'+escapeHtml(message||'Unknown error')+'</div>'}

function polishSummaryRows(doc){const body=doc.getElementById('summaryBody');if(!body)return;body.querySelectorAll(':scope>tr').forEach(tr=>tr.classList.toggle('bb-empty-row',!!tr.querySelector('td.empty')))}
function fitInvoice(doc){const overlay=doc.getElementById('invoiceOverlay');if(!overlay||overlay.classList.contains('hidden'))return;const sheet=doc.getElementById('invoiceSheet');if(!sheet)return;const modal=overlay.querySelector('.modal');const actions=overlay.querySelector('.modal-actions');if(!modal)return;let scroll=modal.querySelector('.bb-daily-invoice-scroll');let stage=modal.querySelector('.bb-daily-invoice-stage');if(!scroll){scroll=doc.createElement('div');scroll.className='bb-daily-invoice-scroll';if(actions?.nextSibling)modal.insertBefore(scroll,actions.nextSibling);else modal.appendChild(scroll)}if(!stage){stage=doc.createElement('div');stage.className='bb-daily-invoice-stage';scroll.appendChild(stage)}if(sheet.parentNode!==stage)stage.appendChild(sheet);const BASE=794;const available=Math.max(260,scroll.clientWidth-2);const scale=Math.min(1,available/BASE);stage.style.setProperty('--bb-invoice-scale',String(scale));const h=Math.max(sheet.scrollHeight,sheet.offsetHeight,1);stage.style.width=Math.ceil(BASE*scale)+'px';stage.style.height=Math.ceil(h*scale)+'px'}

function inject(){let doc,win;try{doc=frame.contentDocument||frame.contentWindow.document;win=frame.contentWindow}catch(_){return false}if(!doc?.head||!doc?.body)return false;const panel=doc.querySelector('.panel');const filters=doc.querySelector('.filters');if(!panel||!filters)return false;
  if(!doc.getElementById('bb-daily-mobile-css')){const link=doc.createElement('link');link.id='bb-daily-mobile-css';link.rel='stylesheet';link.href='mobile-daily-sale.css?v=20260915-1';doc.head.appendChild(link)}
  let backdrop=doc.getElementById('bbDailyFilterBackdrop');if(!backdrop){backdrop=doc.createElement('div');backdrop.id='bbDailyFilterBackdrop';backdrop.className='bb-daily-filter-backdrop';doc.body.appendChild(backdrop)}
  if(!filters.querySelector('.bb-daily-filter-head')){const h=doc.createElement('div');h.className='bb-daily-filter-head';h.innerHTML='<div><strong>Filter Daily Sales</strong><span>Date, salesman and location</span></div><button type="button" class="bb-daily-filter-close" aria-label="Close">×</button>';filters.insertBefore(h,filters.firstChild)}
  if(!filters.querySelector('.bb-daily-filter-actions')){const a=doc.createElement('div');a.className='bb-daily-filter-actions';a.innerHTML='<button type="button" class="bb-daily-tool" data-bb-clear>Clear</button><button type="button" class="bb-daily-tool primary" data-bb-done>Done</button>';filters.appendChild(a)}
  let bar=doc.getElementById('bbDailyMobileBar');if(!bar){bar=doc.createElement('div');bar.id='bbDailyMobileBar';bar.innerHTML='<div class="bb-daily-title"><strong>Daily Sale Summary</strong><span>Sale Date · Salesman · Location</span></div><button type="button" class="bb-daily-tool" data-bb-filter>☷ Filters</button><button type="button" class="bb-daily-tool primary" data-bb-refresh>↻</button>';panel.parentNode.insertBefore(bar,panel)}
  const openFilters=()=>{filters.classList.add('bb-mobile-open');backdrop.classList.add('show')};const closeFilters=()=>{filters.classList.remove('bb-mobile-open');backdrop.classList.remove('show')};
  bar.querySelector('[data-bb-filter]').onclick=openFilters;bar.querySelector('[data-bb-refresh]').onclick=()=>doc.getElementById('refreshBtn')?.click();backdrop.onclick=closeFilters;filters.querySelector('.bb-daily-filter-close').onclick=closeFilters;filters.querySelector('[data-bb-done]').onclick=closeFilters;filters.querySelector('[data-bb-clear]').onclick=()=>{try{win.clearFilters()}catch(_){['dateFrom','dateTo','salesmanFilter','locationFilter'].forEach(id=>{const el=doc.getElementById(id);if(el)el.value=''})}};
  const body=doc.getElementById('summaryBody');if(body&&!body.dataset.bbMobileWatch){body.dataset.bbMobileWatch='1';new win.MutationObserver(()=>polishSummaryRows(doc)).observe(body,{childList:true,subtree:true})}polishSummaryRows(doc);
  const invoiceOverlay=doc.getElementById('invoiceOverlay');if(invoiceOverlay&&!invoiceOverlay.dataset.bbMobileWatch){invoiceOverlay.dataset.bbMobileWatch='1';const run=()=>{if(!invoiceOverlay.classList.contains('hidden')){win.requestAnimationFrame(()=>fitInvoice(doc));setTimeout(()=>fitInvoice(doc),120);setTimeout(()=>fitInvoice(doc),400)}};new win.MutationObserver(run).observe(invoiceOverlay,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});const sheet=doc.getElementById('invoiceSheet');if(sheet)new win.MutationObserver(run).observe(sheet,{childList:true,subtree:true,characterData:true});win.addEventListener('resize',()=>fitInvoice(doc));run()}
  boot.classList.add('hide');frame.style.display='block';return true
}

try{
  await assertPermission();
  frame.addEventListener('load',()=>{setTimeout(inject,60);setTimeout(inject,300);setTimeout(inject,900)});
  frame.src='index.html?embed=1&mobileSkin=1&v=20260915-1';
  let tries=0;const timer=setInterval(()=>{tries++;try{if(inject()||tries>20)clearInterval(timer)}catch(_){if(tries>20)clearInterval(timer)}},150);
}catch(error){console.error('Daily Sale Summary Mobile:',error);showError(error?.message||error)}
})();
