"use strict";
/* HOST: "web" (GitHub Pages / locale) oppure "artifact" (pagina claude.ai: niente microfono né iframe YouTube, progressi sincronizzati online). */
const HOST = window.SHADOW_HOST || "web";
const HAS_MIC = HOST!=="artifact" && !!(navigator.mediaDevices && window.MediaRecorder);
const HAS_YT = false; // niente YouTube: pubblicità e minuti non sincronizzabili. Audio originale solo da TED (file ufficiali).
/* ---------------- Stato e persistenza ---------------- */
const LS_KEY = "shadowing-en-v1";
const DEFAULTS = { cards:{}, yt:[], days:{}, dict:{}, comp:{}, miss:{}, ev:{}, full:{}, prog:{}, voice:{},
  settings:{ voice:"", neural:true, original:true, judge:true, rate:0.9, reps:3, gap:1.3, blindLast:true, unlockAll:false, remindTime:"19:00" } };
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){ const s = JSON.parse(raw);
      return { ...clone(DEFAULTS), ...s, settings:{ ...DEFAULTS.settings, ...(s.settings||{}) } }; }
  }catch(e){}
  return clone(DEFAULTS);
}
let S = load();
function save(){
  S.updated=Date.now();
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){ if(!SYNC.doc) toast("Salvataggio non riuscito: esporta un backup."); }
  pushRemote();
}
/* Sincronizzazione su claude.ai: un documento privato per persona (data/users/<id>/progress). */
const SYNC={ doc:null, busy:false, again:false, timer:null, status:HOST==="artifact"?"Connessione…":"" };
function syncLabel(t){ SYNC.status=t; const e=document.getElementById("sync"); if(e) e.textContent=t; }
/* Sincronizzazione nella versione GitHub: un file progress.json in un repository PRIVATO dell'utente,
   scritto con un token "fine-grained" limitato a quel repository (Contents: read/write).
   Il token resta solo in questo browser (localStorage), non entra mai nei progressi né nel codice. */
const GH={ sha:null, file:"progress.json" };
const lsGet=k=>{ try{ return localStorage.getItem(k)||""; }catch(e){ return ""; } };
const lsSet=(k,v)=>{ try{ v?localStorage.setItem(k,v):localStorage.removeItem(k); }catch(e){} };
const ghToken=()=>lsGet("gh-token"), ghRepo=()=>lsGet("gh-repo");
const b64e=str=>{ const b=new TextEncoder().encode(str); let s=""; for(let i=0;i<b.length;i+=0x8000) s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000)); return btoa(s); };
const b64d=str=>new TextDecoder().decode(Uint8Array.from(atob(str.replace(/\s/g,"")),c=>c.charCodeAt(0)));
function ghFetch(method, body){
  return fetch(`https://api.github.com/repos/${ghRepo()}/contents/${GH.file}`, { method, cache:"no-store",
    headers:{ Authorization:`Bearer ${ghToken()}`, Accept:"application/vnd.github+json", "X-GitHub-Api-Version":"2022-11-28" },
    body: body?JSON.stringify(body):undefined });
}
async function ghRead(){
  const r=await ghFetch("GET"); if(r.status===404){ GH.sha=null; return null; }
  if(!r.ok) throw new Error("HTTP "+r.status);
  const j=await r.json(); GH.sha=j.sha; return JSON.parse(b64d(j.content));
}
async function ghWrite(){
  const body=()=>({ message:"Progressi "+new Date().toISOString().slice(0,16).replace("T"," "), content:b64e(JSON.stringify({ updated:S.updated, coach:coachSummary(), state:S })), ...(GH.sha?{ sha:GH.sha }:{}) });
  let r=await ghFetch("PUT", body());
  if(r.status===409 || r.status===422){ const g=await ghFetch("GET"); GH.sha = g.ok ? (await g.json()).sha : null; r=await ghFetch("PUT", body()); }
  if(!r.ok) throw new Error("HTTP "+r.status);
  GH.sha=(await r.json()).content.sha;
}
function pushRemote(){
  if(!SYNC.doc && !SYNC.gh) return;
  clearTimeout(SYNC.timer);
  SYNC.timer=setTimeout(async()=>{
    if(SYNC.busy){ SYNC.again=true; return; }
    SYNC.busy=true; syncLabel("Salvataggio…");
    if(SYNC.gh){
      try{ await ghWrite(); syncLabel("Sincronizzato"); }catch(e){ syncLabel("Sincronizzazione non riuscita"); }
      SYNC.busy=false; if(SYNC.again){ SYNC.again=false; pushRemote(); } return;
    }
    try{ await SYNC.doc.set({ state:JSON.stringify(S), updated:S.updated });
      if(SYNC.coach){ try{ await SYNC.coach.set(coachSummary()); }catch(e){} }
      syncLabel("Sincronizzato"); }
    catch(e){ syncLabel(e && e.code==="invalid_argument" ? "Solo su questo dispositivo" : "Sincronizzazione non riuscita"); if(e && e.code==="invalid_argument") SYNC.doc=null; }
    SYNC.busy=false; if(SYNC.again){ SYNC.again=false; pushRemote(); }
  }, SYNC.gh ? 15000 : 1200); // su GitHub ogni salvataggio è un commit: si raggruppano 15 secondi di attività
}
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden" && SYNC.gh && SYNC.timer){ clearTimeout(SYNC.timer); SYNC.timer=null; ghWrite().catch(()=>{}); } });
function adopt(r){ S={ ...clone(DEFAULTS), ...r, settings:{ ...DEFAULTS.settings, ...(r.settings||{}) } }; try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
async function initSync(){
  if(HOST!=="artifact"){
    if(!ghToken() || !ghRepo()){ syncLabel("Solo su questo dispositivo"); return; }
    syncLabel("Connessione…");
    try{
      const d=await ghRead(); SYNC.gh=true;
      if(d && (d.updated||0)>(S.updated||0)){ adopt(d.state); syncLabel("Sincronizzato"); if(!inSession()) render(); return; }
      if(S.updated) pushRemote(); else syncLabel("Sincronizzato");
    }catch(e){ SYNC.gh=false; syncLabel("GitHub non raggiungibile: controlla il token"); }
    return;
  }
  for(let i=0;i<30 && !(window.claude && window.claude.use);i++) await sleep(100);
  if(!(window.claude && window.claude.use)){ syncLabel("Solo su questo dispositivo"); return; }
  try{
    const [db,user]=await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    const uid = user ? await user.id() : null;
    if(!db || !uid){ syncLabel("Solo su questo dispositivo"); return; }
    const doc=db.doc("data/users/"+uid+"/progress");
    SYNC.coach=db.doc("coach/summary");
    const snap=await doc.get();
    SYNC.doc=doc;
    if(snap.exists){
      const d=snap.data();
      if((d.updated||0) > (S.updated||0)){
        adopt(JSON.parse(d.state));
        syncLabel("Sincronizzato"); if(!inSession()) render(); return;
      }
    }
    if(S.updated) pushRemote(); else syncLabel("Sincronizzato");
  }catch(e){ syncLabel("Solo su questo dispositivo"); }
}

/* ---------------- Utilità ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2600); }
function dayStart(t=Date.now()){ const d=new Date(t); d.setHours(0,0,0,0); return d.getTime(); }
function addDays(n){ const d=new Date(dayStart()); d.setDate(d.getDate()+n); return d.getTime(); }
function dayKey(t=Date.now()){ const d=new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtDays(n){ return n<=1 ? "1 g" : n<30 ? `${n} g` : n<365 ? `${Math.round(n/30)} mesi` : "1 anno"; }
function mmss(sec){ sec=Math.max(0,Math.round(sec*10)/10); const m=Math.floor(sec/60), s=(sec%60).toFixed(1).replace(/\.0$/,""); return `${m}:${String(s).padStart(2,"0")}`; }
function clock(sec){ sec=Math.max(0,Math.floor(sec)); return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`; }
function parseTime(v){ v=String(v||"").trim(); if(!v) return NaN; if(v.includes(":")){ const [m,s]=v.split(":"); return (+m)*60+(+s); } return +v; }

/* ---------------- Contenuti ---------------- */
const SENT = {};
UNITS.forEach(u => u.s.forEach((x,i) => { const id=`${u.id}-${i+1}`;
  SENT[id]={ id, unit:u, en:x[0], it:x[1], note:x[2]||"", type:"tts" };
  if(u.track==="tech" || u.track==="ted" || u.track==="prog"){ const e=x[3]||{}; Object.assign(SENT[id], { tech:true, x:e, videoId:u.src.yt,
    start: e.t!=null && !u.src.approx ? e.t : null,
    end: e.t!=null ? (e.tEnd || e.t + Math.ceil(x[0].split(/\s+/).length/2.6) + 2) : null }); }
}));
function item(id){
  if(SENT[id]) return SENT[id];
  const y = S.yt.find(y => y.id===id);
  return y ? { ...y, type:"yt", unit:UNITS.find(u=>u.id===y.unitId) } : null;
}
const unitIds = u => u.s.map((_,i)=>`${u.id}-${i+1}`);
const unitLearned = u => unitIds(u).filter(id=>S.cards[id]).length;
const unitDone = u => u.full ? progOf(u).b>=u.full.length : unitLearned(u)===u.s.length;
const unitIdx = id => UNITS.findIndex(u=>u.id===id);
const trackOf = u => u.track || "grammar";
function prevSame(i){ for(let j=i-1;j>=0;j--) if(trackOf(UNITS[j])===trackOf(UNITS[i])) return UNITS[j]; return null; }
const unitUnlocked = i => { if(S.settings.unlockAll) return true; const p=prevSame(i); return !p || unitDone(p); };
const nextUnit = (tr="grammar") => UNITS.find((u,i)=>trackOf(u)===tr && unitUnlocked(i) && !unitDone(u));

/* ---------------- Ripetizione dilazionata (SM-2 semplificato) ----------------
   Dopo lo shadowing iniziale: ripasso a 1 g, poi ~3, ~8, ~20, ~50 giorni se ricordi bene. */
function newCard(){ return { ef:2.5, interval:1, reps:1, lapses:0, due:addDays(1), learned:Date.now() }; }
function schedule(card, g){ // g: 1 di nuovo, 2 difficile, 3 bene, 4 facile
  const q=[0,1,3,4,5][g];
  let { ef=2.5, interval=1, reps=0, lapses=0 } = card;
  if(q<3){ reps=0; interval=1; lapses++; }
  else{
    if(reps===0) interval = q===5?3:1;
    else if(reps===1) interval = q===5?6 : q===3?2 : 3;
    else interval = q===5 ? Math.round(interval*ef*1.3) : q===3 ? Math.max(interval+1, Math.round(interval*1.2)) : Math.round(interval*ef);
    reps++;
  }
  ef = Math.max(1.3, ef + (0.1-(5-q)*(0.08+(5-q)*0.02)));
  interval = Math.min(interval, 365);
  return { ...card, ef:+ef.toFixed(2), interval, reps, lapses, due:addDays(interval), last:Date.now() };
}
function dueIds(){ const end=addDays(1);
  return Object.entries(S.cards).filter(([id,c])=>c.due<end && item(id)).sort((a,b)=>a[1].due-b[1].due).map(([id])=>id); }
function markActivity(){ const k=dayKey(); S.days[k]=(S.days[k]||0)+1; }
function streak(){ let n=0; const d=new Date(dayStart()); if(!S.days[dayKey(d)]) d.setDate(d.getDate()-1);
  while(S.days[dayKey(d)]){ n++; d.setDate(d.getDate()-1); } return n; }

/* ---------------- Audio: sintesi vocale ---------------- */
let voices=[], runId=0;
function loadVoices(){ if(!("speechSynthesis" in window)) return; voices=speechSynthesis.getVoices().filter(v=>/^en([-_]|$)/i.test(v.lang)); }
if("speechSynthesis" in window){ loadVoices(); speechSynthesis.onvoiceschanged=()=>{ loadVoices(); if(view()==="settings") render(); }; }
function pickVoice(us){ return voices.find(v=>v.voiceURI===S.settings.voice) || (us && voices.find(v=>/en[-_]US/i.test(v.lang))) || voices.find(v=>/en[-_]GB/i.test(v.lang)) || voices[0]; }
function speak(text, rate, us){
  return new Promise(res=>{
    if(!("speechSynthesis" in window)){ toast("Sintesi vocale non disponibile in questo browser."); res(0); return; }
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text), v=pickVoice(us);
    if(v){ u.voice=v; u.lang=v.lang; } else u.lang="en-GB";
    u.rate=rate; const t0=performance.now(); let done=false;
    const fin=()=>{ if(done) return; done=true; res(performance.now()-t0); };
    u.onend=fin; u.onerror=fin; speechSynthesis.speak(u);
    setTimeout(fin, 4000 + text.length*160/rate);
  });
}

/* ---------------- Audio: voce neurale pre-generata (Kokoro af_heart, file per unità) ---------------- */
const HAS_NEURAL = typeof AUDIO!=="undefined";
let neuralBroken=false, actx=null, curSrc=null;
const bufs={};
/* Web Audio: il file dell'unità viene decodificato per intero e la frase è tagliata al campione esatto
   (il seek sugli MP3 dei browser mobili è impreciso di qualche centinaio di millisecondi). */
/* iPhone: senza questa impostazione l'audio Web Audio tace con l'interruttore silenzioso attivo. */
/* "playback" fa suonare l'audio anche con l'interruttore silenzioso, ma impedisce di usare il microfono:
   si passa a "play-and-record" solo mentre il microfono è aperto. */
function audioSession(t){ try{ if(navigator.audioSession) navigator.audioSession.type=t; }catch(e){} }
audioSession("playback");
let wakeLock=null;
async function keepAwake(on){
  try{
    if(on && !wakeLock && navigator.wakeLock){ wakeLock=await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release",()=>{ wakeLock=null; }); }
    if(!on && wakeLock){ await wakeLock.release(); wakeLock=null; }
  }catch(e){ wakeLock=null; }
}
function audioCtx(){ if(!actx){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; actx=new C(); } if(actx.state==="suspended") actx.resume().catch(()=>{}); return actx; }
function getBuf(name){
  if(!bufs[name]) bufs[name]=fetch("audio/"+name+".mp3").then(r=>{ if(!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(b=>new Promise((res,rej)=>audioCtx().decodeAudioData(b,res,rej)));
  bufs[name].catch(()=>{ delete bufs[name]; });
  return bufs[name];
}
function prefetch(it){ if(!it || !audioCtx()) return; if(hasOrig(it)) prefetchOrig(it.unit, it.x.ot, it.x.oe); if(HAS_NEURAL && S.settings.neural && AUDIO[it.id]) getBuf(AUDIO[it.id][0]).catch(()=>{}); }
function stopNeural(){ if(curSrc){ try{ curSrc.onended=null; curSrc.stop(); }catch(e){} curSrc=null; } curPlay=null; }
let curPlay=null, lastRef=null; // { t0 (tempo del contesto audio all'avvio), st, en } per mostrare l'avanzamento
async function playRange(name, st, en, my, base=0){
  const c=audioCtx(); if(!c) return -1;
  let buf; try{ buf=await getBuf(name); }catch(x){ return -1; }
  if(my!==runId) return 0;
  stopNeural();
  en=Math.min(en, buf.duration);
  return new Promise(res=>{
    const src=c.createBufferSource(); src.buffer=buf; src.connect(c.destination);
    const dur=Math.max(0.05, en-st);
    src.onended=()=>{ if(curSrc===src){ curSrc=null; curPlay=null; } res(dur*1000); };
    curSrc=src; curPlay={ t0:c.currentTime, st:st+base, en:en+base }; lastRef={ buf, st, en }; src.start(0, st, dur);
    const h=setInterval(()=>{ if(my!==runId){ clearInterval(h); stopNeural(); res(0); } else if(curSrc!==src) clearInterval(h); },50);
  });
}
async function playNeural(key, rate, my){
  const e=AUDIO[key];
  const slow = rate<0.85 && e.length>=5;
  const d=await playRange(e[0]+(slow?"-slow":""), slow?e[3]:e[1], slow?e[4]:e[2], my);
  if(d<0) neuralBroken=true;
  return d;
}
/* Audio originale dei talk TED (licenza CC BY-NC-ND), in un file per pezzo: su iPhone decodificare il talk
   intero in memoria fallisce. playTimeline suona un intervallo del talk passando da un file al successivo. */
const hasOrig = it => it && it.unit && it.unit.track==="ted" && it.unit.src.parts && it.x && it.x.ot!=null;
const partsIn = (u,a,z) => u.src.parts.filter(p=>p[2]>a+0.01 && p[1]<z-0.01);
function prefetchOrig(u,a,z){ for(const p of partsIn(u,a,z).slice(0,2)) getBuf(p[0]).catch(()=>{}); }
async function playTimeline(u, a, z, my){
  const ps=partsIn(u,a,z); if(!ps.length) return -1;
  let total=0;
  for(let i=0;i<ps.length;i++){
    const [name,p0,p1]=ps[i];
    if(ps[i+1]) getBuf(ps[i+1][0]).catch(()=>{});
    const d=await playRange(name, Math.max(0,a-p0), Math.min(z,p1)-p0, my, p0);
    if(d<0) return i===0 ? -1 : total;
    if(my!==runId) return 0;
    total+=d;
  }
  return total;
}
/* Pronuncia una frase: voce neurale se disponibile, altrimenti voce di sistema. */
async function say(key, text, rate, us){
  const my=runId;
  if(HAS_NEURAL && S.settings.neural && !neuralBroken && AUDIO[key]){
    const d=await playNeural(key, rate, my);
    if(d>=0) return d;
    if(my!==runId) return 0;
  }
  return speak(text, rate, us);
}

/* ---------------- Audio: YouTube (player ufficiale incorporato) ---------------- */
let ytReady=null, ytPlayer=null;
function loadYT(){
  if(ytReady) return ytReady;
  ytReady=new Promise((res,rej)=>{
    window.onYouTubeIframeAPIReady=()=>res();
    const s=document.createElement("script"); s.src="https://www.youtube.com/iframe_api";
    s.onerror=()=>{ ytReady=null; rej(new Error("YouTube non raggiungibile")); };
    document.head.appendChild(s);
  });
  return ytReady;
}
let ytPending=null;
function ytAlive(){ try{ return !!(ytPlayer && ytPlayer.getIframe && document.body.contains(ytPlayer.getIframe())); }catch(e){ return false; } }
async function ensurePlayer(){
  await loadYT();
  if(ytAlive() && ytPlayer.getCurrentTime) return ytPlayer;
  const host=document.getElementById("yt-player");
  if(ytPending && !(host && host.tagName==="DIV")) return ytPending;
  if(!host) throw new Error("player assente");
  ytPending=new Promise(res=>{
    const p=new YT.Player("yt-player",{ width:"100%", height:"100%",
      playerVars:{ playsinline:1, rel:0, modestbranding:1 }, events:{ onReady:()=>{ ytPlayer=p; ytPending=null; res(p); } } });
  });
  return ytPending;
}
function ytId(url){
  url=String(url||"").trim(); if(/^[\w-]{11}$/.test(url)) return url;
  const m=url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/); return m?m[1]:null;
}
function ytStart(url){ const m=String(url).match(/[?&#]t=(\d+)(?:s)?/); return m?+m[1]:null; }
async function playSegment(seg, rate, my){
  let p; try{ p=await ensurePlayer(); }catch(e){ toast("Impossibile caricare YouTube: serve connessione e pagina servita via http(s)."); return 0; }
  const cur = p.getVideoData && p.getVideoData().video_id;
  if(cur===seg.videoId){ p.seekTo(seg.start,true); p.playVideo(); }
  else p.loadVideoById({ videoId:seg.videoId, startSeconds:seg.start });
  const yr = rate<0.9 ? 0.75 : 1;
  const len=(seg.end-seg.start)/yr*1000, t0=Date.now();
  let started=false, blocked=false;
  await new Promise(res=>{
    const h=setInterval(()=>{
      if(my!==runId){ clearInterval(h); try{p.pauseVideo();}catch(e){} res(); return; }
      const stt=p.getPlayerState ? p.getPlayerState() : -1;
      if(stt===1) started=true;
      if(!started && Date.now()-t0>3000){ clearInterval(h); blocked=true; res(); return; }
      try{ if(p.getPlaybackRate()!==yr) p.setPlaybackRate(yr); }catch(e){}
      const t=p.getCurrentTime ? p.getCurrentTime() : 0;
      if((t>=seg.end && t>0) || Date.now()-t0>len+10000){ clearInterval(h); p.pauseVideo(); res(); }
    },100);
  });
  if(blocked){ setPhase("Il telefono blocca l'avvio del video: tocca una volta ▶ dentro il riquadro del video, mettilo in pausa, poi premi di nuovo Ascolta."); toast("Tocca una volta il video per attivarlo."); return -1; }
  return len;
}
const useOriginal = it => HAS_YT && ((it.type==="yt") || (it.tech && it.start!=null && S.settings.original));
async function play(it, rate, my){
  track(it,"plays");
  if(hasOrig(it) && S.settings.original && rate>=0.85){ const d=await playTimeline(it.unit, it.x.ot, it.x.oe, my); if(d>=0) return d; toast("Audio originale non caricato: uso la voce chiara."); }
  return useOriginal(it) ? playSegment(it, rate, my) : say(it.id, it.en, rate, !!it.tech);
}

function stopAll(){
  runId++;
  if("speechSynthesis" in window) speechSynthesis.cancel();
  stopNeural(); clearInterval(turnTimer);
  { const tt=document.getElementById("turn"); if(tt && !tt.classList.contains("idle")){ tt.className="turn idle"; tt.querySelector(".tl").textContent="In pausa"; setLevel(0); } }
  try{ ytPlayer && ytPlayer.pauseVideo && ytPlayer.pauseVideo(); }catch(e){}
  if(rec && rec.state==="recording") rec.stop();
  setPhase("");
}

/* ---------------- Fasi visive dello shadowing ---------------- */
function setPhase(text, ms){
  const el=$("#phase"); if(!el) return;
  el.innerHTML = text ? `<div class="lbl">${esc(text)}</div>${ms?'<div class="bar"><i></i></div>':""}` : "";
  if(ms){ const i=el.querySelector("i"); i.style.transition="none"; i.style.width="0";
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ i.style.transition=`width ${ms}ms linear`; i.style.width="100%"; })); }
}
function setBlind(on){ const e=$("#en-text"); if(e) e.classList.toggle("blind", on); }

async function shadowLoop(it){
  stopAll(); const my=runId; keepAwake(true); const n=Math.max(1,+S.settings.reps), base=+S.settings.rate;
  for(let k=0;k<n;k++){
    if(my!==runId) return;
    const rate = n===1 ? base : Math.max(0.6, base-0.15 + 0.3*k/(n-1));
    const blind = S.settings.blindLast && n>1 && k===n-1;
    setBlind(blind);
    setPhase(`Giro ${k+1} di ${n} · velocità ${rate.toFixed(2)}${blind?" · senza testo":""}`);
    setTurn("listen","ASCOLTA — non parlare");
    lastRef=null;
    const d = await play(it, rate, my);
    if(my!==runId) return;
    if(d<0){ keepAwake(false); setBlind(false); return; }
    const gap = Math.round(Math.max(d,1200)*S.settings.gap)+400;
    const ref=lastRef, refDur=d/1000;
    beep();
    await sleep(180);
    const cap = judgeOn() ? await startCapture() : null;
    setPhase("Ripeti la frase ad alta voce, stessa intonazione e ritmo", gap);
    setTurn("speak", cap ? "PARLA ORA — ti sto ascoltando" : "PARLA ORA", gap);
    await sleep(gap);
    setTurn("idle", cap ? "Stop — sto valutando…" : "Stop");
    if(cap){ const res=await cap.stop(); if(my!==runId) return; showVote(it, k+1, scoreVoice(it, res, ref, refDur)); }
  }
  if(my!==runId) return;
  keepAwake(false); setBlind(false); beep(520,160); setTurn("done","Fine dello shadowing: non devi più parlare"); setPhase(judgeOn() ? "I voti sono qui sotto." : "Registrati e confronta, oppure verifica la pronuncia.");
  markActivity(); save();
}

/* ---------------- Voto automatico della tua voce durante lo shadowing ----------------
   Nessuna registrazione viene salvata. Mentre ripeti nella pausa:
   - parole: riconoscimento vocale del browser confrontato con il testo originale;
   - ritmo: inviluppo dell'energia della tua voce (pause, accenti, durata) confrontato con quello
     dell'audio appena ascoltato (voce originale TED o voce neurale) con allineamento DTW. */
let micStream=null, srBroken=false;
const judgeOn = () => HAS_MIC && S.settings.judge;
let micP=null;
function micError(e){
  const n=e && e.name;
  if(n==="NotAllowedError" || n==="SecurityError") return "Permesso del microfono negato. Su iPhone: tocca «aA» nella barra di Safari → Impostazioni sito web → Microfono: Consenti, poi ricarica la pagina.";
  if(n==="NotFoundError") return "Nessun microfono trovato.";
  if(n==="NotReadableError") return "Il microfono è usato da un'altra app (chiamata, registratore): chiudila e riprova.";
  return "Microfono non disponibile ("+(n||"errore")+").";
}
/* Va chiamata dentro il tocco dell'utente (Safari chiede il permesso solo lì). */
function mic(){
  if(micStream && micStream.getTracks().some(t=>t.readyState==="live")) return Promise.resolve(micStream);
  if(!micP){
    audioSession("play-and-record");
    micP=navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true } })
      .then(s=>{ micStream=s; micP=null; micBadge(); return s; })
      .catch(e=>{ micP=null; audioSession("playback"); throw e; });
  }
  return micP;
}
function releaseMic(){ if(micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null; audioSession("playback"); } micBadge(); }
async function startCapture(){
  let stream; try{ stream=await mic(); }catch(e){ setPhase(micError(e)); toast("Voto della voce sospeso: "+micError(e)); return null; }
  const c=audioCtx(); const srcN=c.createMediaStreamSource(stream), an=c.createAnalyser(); an.fftSize=1024; srcN.connect(an);
  const buf=new Float32Array(an.fftSize), env=[];
  const h=setInterval(()=>{ an.getFloatTimeDomainData(buf); let s2=0; for(const v of buf) s2+=v*v; const rms=Math.sqrt(s2/buf.length); env.push(rms); setLevel(rms); },40);
  let words=null, r=null;
  if(SR && !srBroken){
    try{ r=new SR(); r.lang="en-US"; r.continuous=true; r.interimResults=false; r.maxAlternatives=3;
      const got=[]; r.onresult=e=>{ for(let i=e.resultIndex;i<e.results.length;i++) got.push([...e.results[i]].map(a=>a.transcript)); words=got; };
      r.onerror=e=>{ if(e.error==="not-allowed"||e.error==="service-not-allowed"||e.error==="audio-capture") srBroken=true; };
      r.start(); }catch(e){ srBroken=true; r=null; }
  }
  return { stop: async()=>{
    clearInterval(h); setLevel(0); try{ srcN.disconnect(); }catch(e){}
    if(r){ try{ r.stop(); }catch(e){} await sleep(900); }
    const said = words ? words.map(alts=>alts[0]).join(" ") : null;
    return { env, said, alts: words };
  } };
}
function refEnvelope(ref){
  if(!ref) return null;
  const d=ref.buf.getChannelData(0), sr=ref.buf.sampleRate, step=Math.round(sr*0.04), a=Math.floor(ref.st*sr), z=Math.min(d.length, Math.floor(ref.en*sr)), out=[];
  for(let i=a;i+step<=z;i+=step){ let s2=0; for(let j=i;j<i+step;j++) s2+=d[j]*d[j]; out.push(Math.sqrt(s2/step)); }
  return out;
}
function trimNorm(env){
  if(!env || !env.length) return [];
  const mx=Math.max(...env); if(mx<=0) return [];
  const thr=mx*0.12; let a=0, z=env.length-1;
  while(a<z && env[a]<thr) a++; while(z>a && env[z]<thr) z--;
  return env.slice(a,z+1).map(v=>v/mx);
}
function dtw(a,b){
  const n=a.length, m=b.length, w=Math.max(Math.abs(n-m), Math.ceil(Math.max(n,m)*0.25)), INF=1e9;
  let prev=new Float64Array(m+1).fill(INF); prev[0]=0;
  for(let i=1;i<=n;i++){ const cur=new Float64Array(m+1).fill(INF);
    for(let j=Math.max(1,i-w); j<=Math.min(m,i+w); j++){ const c=Math.abs(a[i-1]-b[j-1]); cur[j]=c+Math.min(prev[j], cur[j-1], prev[j-1]); }
    prev=cur; }
  return prev[m]/(n+m);
}
function scoreVoice(it, res, ref, refDur){
  const me=trimNorm(res.env), mxRaw=res.env.length?Math.max(...res.env):0;
  if(mxRaw<0.01 || me.length<5) return { silent:true };
  const myDur=me.length*0.04, ro=trimNorm(refEnvelope(ref));
  const target = ro.length ? ro.length*0.04 : refDur*0.9;
  const durScore=Math.round(100*Math.exp(-Math.abs(Math.log(myDur/target))*2.5));
  let shape=null; if(ro.length>4){ shape=Math.round(Math.max(0, 100*(1-dtw(me,ro)/0.2))); }
  const rhythm = shape==null ? durScore : Math.round(0.4*durScore+0.6*shape);
  let words=null;
  if(res.alts && res.alts.length){
    const cands=[res.said, ...res.alts.flat()].filter(Boolean);
    words=Math.round(100*Math.max(...cands.map(t=>matchWords(it.en,t).score)));
  }
  const vote = words==null ? rhythm : Math.round(0.6*words+0.4*rhythm);
  return { vote, words, rhythm, said:res.said };
}
function showVote(it, rep, v){
  const box=$("#votes"); if(!box) return;
  if(v.silent){ box.insertAdjacentHTML("beforeend", `<div class="vote small muted">Ripetizione ${rep}: non ti ho sentito. Parla più vicino al telefono.</div>`); return; }
  const cls=v.vote>=80?"ok":v.vote>=60?"mid":"low";
  box.insertAdjacentHTML("beforeend", `<div class="vote"><b class="${cls}">${v.vote}</b><span class="small">Ripetizione ${rep} · ${v.words!=null?`parole ${v.words}% · `:""}ritmo ${v.rhythm}%</span>${v.said?`<div class="small muted">Ho capito: “${esc(v.said)}”</div>`:""}</div>`);
  const r=S.voice[it.id]||(S.voice[it.id]={ n:0, best:0 });
  r.n++; r.last=v.vote; r.best=Math.max(r.best,v.vote); r.words=v.words; r.rhythm=v.rhythm; r.at=Date.now();
  markActivity(); save();
}

/* ---------------- Registrazione e confronto ---------------- */
let rec=null, recChunks=[], recUrl=null;
async function toggleRecord(){
  const b=$("#btn-rec");
  if(rec && rec.state==="recording"){ rec.stop(); return; }
  try{
    const stream=await mic();
    const type=["audio/mp4","audio/webm;codecs=opus","audio/webm"].find(t=>window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    rec=type?new MediaRecorder(stream,{ mimeType:type }):new MediaRecorder(stream); recChunks=[];
    rec.ondataavailable=e=>recChunks.push(e.data);
    rec.onstop=()=>{
      if(recUrl) URL.revokeObjectURL(recUrl);
      recUrl=URL.createObjectURL(new Blob(recChunks,{ type:rec.mimeType }));
      const bb=$("#btn-rec"); if(bb){ bb.textContent="🎙 Registrati"; bb.classList.remove("on"); } setTurn("done","Registrazione finita: ascoltala con «La mia voce»");
      ["#btn-me","#btn-cmp"].forEach(s=>{ const x=$(s); if(x) x.disabled=false; });
    };
    rec.start(); if(b){ b.textContent="⏹ Stop"; b.classList.add("on"); } setTurn("speak","PARLA ORA — registrazione in corso, premi ⏹ Stop per finire");
  }catch(e){ toast(micError(e)); setPhase(micError(e)); }
}
function playMe(){ return new Promise(res=>{ if(!recUrl){ res(); return; } const a=new Audio(recUrl); a.onended=res; a.onerror=res; a.play().catch(res); }); }
async function compare(it){ stopAll(); const my=runId; setPhase("Modello…"); await play(it, +S.settings.rate, my); if(my!==runId) return; setPhase("La tua voce…"); await playMe(); setPhase(""); }

/* ---------------- Verifica pronuncia (riconoscimento vocale del browser) ---------------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const norm = s => s.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(Boolean);
function matchWords(target, said){
  const a=norm(target), b=norm(said), dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
  for(let i=a.length-1;i>=0;i--) for(let j=b.length-1;j>=0;j--) dp[i][j]= a[i]===b[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j],dp[i][j+1]);
  const ok=new Set(); let i=0,j=0;
  while(i<a.length&&j<b.length){ if(a[i]===b[j]){ ok.add(i); i++; j++; } else if(dp[i+1][j]>=dp[i][j+1]) i++; else j++; }
  return { words:a, ok, score: a.length ? ok.size/a.length : 0 };
}
function checkPron(it){
  const out=$("#pron");
  if(!SR){ out.innerHTML=`<p class="small muted">Il riconoscimento vocale non è supportato qui: usa Chrome, Edge o Safari recente.</p>`; return; }
  stopAll();
  const r=new SR(); r.lang=(pickVoice()&&pickVoice().lang)||"en-GB"; r.interimResults=false; r.maxAlternatives=3;
  out.innerHTML=`<p><b>Parla ora…</b> pronuncia la frase in inglese.</p>`;
  let got=false;
  r.onresult=e=>{ got=true;
    const alts=[...e.results[0]].map(x=>x.transcript);
    const best=alts.map(t=>({ t, m:matchWords(it.en,t) })).sort((x,y)=>y.m.score-x.m.score)[0];
    const pct=Math.round(best.m.score*100);
    out.innerHTML=`<p><b>${pct}%</b> delle parole riconosciute ${pct>=90?"— ottimo.":pct>=70?"— buono, ripeti le parole sottolineate.":"— riascolta e rallenta."}</p>
      <p class="words">${best.m.words.map((w,i)=>`<span class="${best.m.ok.has(i)?"ok":"miss"}">${esc(w)}</span>`).join(" ")}</p>
      <p class="small muted">Hai detto: “${esc(best.t)}”. Il riconoscimento misura l'intelligibilità, non l'accento.</p>`;
    markActivity(); save();
  };
  r.onerror=e=>{ out.innerHTML=`<p class="small muted">Errore microfono/riconoscimento: ${esc(e.error)}</p>`; };
  r.onend=()=>{ if(!got && !out.querySelector(".muted")) out.innerHTML=`<p class="small muted">Nessuna voce rilevata. Riprova.</p>`; };
  try{ r.start(); }catch(e){}
}

/* ---------------- Tracciamento automatico dell'ascolto ----------------
   Senza azioni da parte tua: quante volte ascolti una frase prima di guardare il testo, se usi il lento,
   quanto tempo ci passi. Insieme a dettati e ripassi, stimano livello e difficoltà. */
function evOf(id){ return S.ev[id] || (S.ev[id]={}); }
function track(it, k){ if(!it || !SENT[it.id]) return; const ev=evOf(it.id); ev[k]=(ev[k]||0)+1;
  const e=$("#en-text"); if(k==="plays" && e && e.classList.contains("blind") && ev.pre0==null) ev.pre=(ev.pre||0)+1; }
function revealed(it){ if(!it || !SENT[it.id]) return; const ev=evOf(it.id); if(ev.pre0==null){ ev.pre0=ev.pre||0; ev.slow0=ev.slow||0; save(); } }
/* Punteggio di comprensione 0-100 per frase, dal segnale più affidabile disponibile. */
function compScore(id){
  const d=S.dict[id]; if(d) return d.first;
  if(S.comp[id]!=null) return S.comp[id]*45+5;
  const ev=S.ev[id]; if(ev && ev.pre0>0){ return Math.max(25, 90 - 15*(ev.pre0-1) - (ev.slow0>0?10:0)); }
  return null;
}
function levelEstimate(){
  const pts=[]; // [wpm, score]
  for(const id of Object.keys(SENT)){ const it=SENT[id]; if(it.unit.track!=="ted") continue; const sc=compScore(id); if(sc!=null) pts.push([it.unit.src.wpm, sc]); }
  const tech=Object.keys(SENT).filter(id=>SENT[id].unit.track==="tech").map(compScore).filter(v=>v!=null);
  for(const [uid,f] of Object.entries(S.full)){ const u=UNITS[unitIdx(uid)]; if(!u) continue;
    for(const [kk,x] of Object.entries(f)){ if(kk.startsWith("peek") || !x || x.r==null) continue; const sc=[25,55,85][x.r]-(x.peek?10:0);
      if(u.src && u.src.wpm) pts.push([u.src.wpm, sc], [u.src.wpm, sc]); else tech.push(sc, sc); } } // peso doppio: è ascolto reale continuo
  const g={}; for(const [id,c] of Object.entries(S.cards)){ const it=SENT[id]; if(!it || trackOf(it.unit)!=="grammar" || !c.last) continue;
    const l=it.unit.level; (g[l]||(g[l]={ n:0, ok:0 })).n++; if(!(c.lapses>0) && c.reps>=2) g[l].ok++; }
  const n=pts.length+tech.length;
  if(n<5) return { ready:false, n, grammar:g };
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const all=[...pts.map(p=>p[1]), ...tech], score=Math.round(avg(all));
  const wpm=pts.length?Math.round(avg(pts.map(p=>p[0]))):null;
  const band = score>=85 && (wpm||150)>=160 ? "C1" : score>=75 ? "B2" : score>=60 ? "B1+" : "B1";
  return { ready:true, n, score, wpm, band, grammar:g };
}

/* ---------------- Dettato ---------------- */
function checkDict(it){
  const typed=$("#dict-in").value.trim(); if(!typed){ toast("Scrivi prima quello che hai sentito."); return; }
  const m=matchWords(it.en, typed), pct=Math.round(m.score*100);
  const missed=m.words.filter((w,i)=>!m.ok.has(i));
  const prev=S.dict[it.id];
  S.dict[it.id]={ score:pct, at:Date.now(), n:(prev?prev.n:0)+1, first: prev ? prev.first : pct, missed };
  if(!prev) missed.forEach(w=>{ S.miss[w]=(S.miss[w]||0)+1; });
  markActivity(); save();
  $("#dict-out").innerHTML=`<p><b>${pct}%</b> ${pct>=90?"— ottimo.":pct>=70?"— buono: guarda le parole sottolineate.":"— normale all'inizio: riascolta a velocità lenta e riprova."}</p>
    <p class="words">${m.words.map((w,i)=>`<span class="${m.ok.has(i)?"ok":"miss"}">${esc(w)}</span>`).join(" ")}</p>
    ${missed.length?`<p class="small muted">Perse: ${esc(missed.join(", "))}. ${hintFor(missed)}</p>`:""}`;
  revealed(it); const e=$("#en-text"); if(e) e.classList.remove("blind");
  const tb=$("#tech-box"); if(tb) tb.hidden=false;
  const cb=$("#comp-box"); if(cb && it.tech && S.comp[it.id]==null) cb.hidden=false;
}
const FUNC=new Set("a an the of to in on at for and or but that it is was be been have has had do does did you we they he she i my your our their this these those there what if as so with from by will would can could should might must going gonna got just".split(" "));
function hintFor(missed){
  const f=missed.filter(w=>FUNC.has(w)).length;
  return f>=missed.length/2 ? "Sono soprattutto parole grammaticali brevi: nel parlato americano si riducono (to → tə, of → ə, and → n). Leggi la sezione “Come suona”." : "Sono parole di contenuto: probabilmente lessico nuovo o pronuncia non attesa. Ripetile in shadowing lento.";
}

/* ---------------- Difficoltà: aggregati usati dalla pagina e dal giro giornaliero ---------------- */
function aggregates(){
  const byUnit={};
  const add=(u,k,v)=>{ const a=byUnit[u.id]||(byUnit[u.id]={ id:u.id, title:u.title, track:trackOf(u), wpm:u.src&&u.src.wpm||null, dict:[], comp:[], lapses:0, hard:0 }); a[k].push?a[k].push(v):a[k]+=v; };
  for(const [id,d] of Object.entries(S.dict)){ const it=SENT[id]; if(it) add(it.unit,"dict",d.first); }
  for(const [id,c] of Object.entries(S.comp)){ const it=SENT[id]; if(it) add(it.unit,"comp",c); }
  for(const [id,c] of Object.entries(S.cards)){ const it=SENT[id]; if(it){ add(it.unit,"lapses",c.lapses||0); if((c.lapses||0)>0 || c.ef<2.2) add(it.unit,"hard",1); } }
  const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;
  const units=Object.values(byUnit).map(a=>({ id:a.id, title:a.title, track:a.track, wpm:a.wpm,
    dictAvg:avg(a.dict), dictN:a.dict.length, compAvg:a.comp.length?Math.round(avg(a.comp.map(v=>v*50))):null, compN:a.comp.length, lapses:a.lapses, hard:a.hard }));
  const topMissed=Object.entries(S.miss).sort((a,b)=>b[1]-a[1]).slice(0,25);
  const hardIds=Object.keys(SENT).filter(id=>(S.dict[id]&&S.dict[id].score<80) || (S.cards[id]&&(S.cards[id].lapses||0)>=1) || S.comp[id]===0 || (compScore(id)!=null && compScore(id)<60))
    .sort((a,b)=>((S.dict[a]||{}).score??100)-((S.dict[b]||{}).score??100));
  return { units, topMissed, hardIds };
}
function coachSummary(){
  const a=aggregates();
  const evs=Object.values(S.ev).filter(e=>e.pre0!=null);
  const vv=Object.values(S.voice||{});
  const voiceAgg = vv.length ? { sentences:vv.length, avgLast:Math.round(vv.reduce((a,x)=>a+x.last,0)/vv.length), avgWords: (w=>w.length?Math.round(w.reduce((a,b)=>a+b,0)/w.length):null)(vv.map(x=>x.words).filter(x=>x!=null)), avgRhythm:Math.round(vv.reduce((a,x)=>a+(x.rhythm||0),0)/vv.length) } : null;
  return { updated:Date.now(), learned:Object.keys(S.cards).length, streak:streak(), level:levelEstimate(), voice:voiceAgg,
    voiceWeak:Object.entries(S.voice||{}).filter(([id,x])=>SENT[id] && x.best<65).slice(0,20).map(([id,x])=>({ id, en:SENT[id].en, best:x.best, words:x.words, rhythm:x.rhythm })),
    listening:{ items:evs.length, avgListensBeforeText: evs.length? +(evs.reduce((a,e)=>a+e.pre0,0)/evs.length).toFixed(2) : null, slowShare: evs.length? +(evs.filter(e=>e.slow0>0).length/evs.length).toFixed(2) : null },
    units:a.units, topMissed:a.topMissed,
    tedProgress:UNITS.filter(u=>u.full).map(u=>({ id:u.id, blocks:u.full.length, done:progOf(u).b, lastDay:progOf(u).day })),
    full:Object.entries(S.full).map(([uid,f])=>{ const u=UNITS[unitIdx(uid)], r=Object.entries(f).filter(([k,x])=>!k.startsWith("peek") && x && x.r!=null).map(([,x])=>x); return { id:uid, title:u?u.title:uid, wpm:u&&u.src?u.src.wpm||null:null, blocks:u&&u.full?u.full.length:1, rated:r.length, avg: r.length? +(r.reduce((s,x)=>s+x.r,0)/r.length).toFixed(2) : null, peeked:r.filter(x=>x.peek).length }; }), hard:a.hardIds.slice(0,40).map(id=>({ id, en:SENT[id].en, dict:S.dict[id]?S.dict[id].score:null, comp:S.comp[id]??null, lapses:S.cards[id]?S.cards[id].lapses||0:0, missed:S.dict[id]?S.dict[id].missed:[] })) };
}
function vStats(){
  const a=aggregates(), auth=a.units.filter(u=>u.track!=="grammar"), gram=a.units.filter(u=>u.track==="grammar" && u.lapses>0).sort((x,y)=>y.lapses-x.lapses);
  const cell=v=>v==null?`<span class="muted">—</span>`:`${v}%`;
  const lv=levelEstimate();
  $("#app").innerHTML=`<h1>Le tue difficoltà</h1>
  <div class="card">${lv.ready?`<div class="tag">Livello di ascolto stimato</div><div class="stat-big">${lv.band}</div>
    <p class="small muted" style="margin:0">Comprensione media ${lv.score}% su ${lv.n} frasi${lv.wpm?`, a ${lv.wpm} parole/min in media`:""}. È una stima automatica: si affina con ogni sessione.</p>`
    :`<div class="tag">Livello di ascolto stimato</div><p style="margin:.3em 0">Servono ancora ${5-lv.n} frasi ascoltate (voci tech o TED) per una prima stima.</p><p class="small muted" style="margin:0">Non devi fare nulla di speciale: l'app registra da sola quante volte ascolti prima di guardare il testo.</p>`}
    ${Object.keys(lv.grammar).length?`<p class="small" style="margin:.6em 0 0">Grammatica ripassata, frasi solide: ${["B1","B2","C1"].filter(l=>lv.grammar[l]).map(l=>`${l} ${lv.grammar[l].ok}/${lv.grammar[l].n}`).join(" · ")}</p>`:""}</div>
  <p class="muted small">Calcolate da dettati, autovalutazioni e ripassi. Il giro giornaliero le legge per scegliere il talk successivo e le frasi di rinforzo.</p>
  <div class="row"><button class="pri" data-act="drill" ${a.hardIds.length?"":"disabled"}>Allenamento mirato (${Math.min(a.hardIds.length,10)} frasi)</button></div>
  ${(()=>{ const vv=Object.entries(S.voice||{}).filter(([id])=>SENT[id]); if(!vv.length) return HAS_MIC?`<h2>La tua voce</h2><p class="muted">Ancora nessun voto: fai uno shadowing e ripeti ad alta voce nelle pause.</p>`:""; const avg=k=>{ const a=vv.map(([,x])=>x[k]).filter(x=>x!=null); return a.length?Math.round(a.reduce((p,q)=>p+q,0)/a.length):null; };
    const weak=vv.sort((a,b)=>a[1].best-b[1].best).slice(0,5);
    return `<h2>La tua voce</h2><div class="card"><div class="row"><div><div class="tag">Voto medio</div><div class="stat-big">${avg("last")}</div></div><div class="small">Parole ${avg("words")??"—"}% · Ritmo ${avg("rhythm")}% · ${vv.length} frasi</div></div>
      <p class="small muted" style="margin:.5em 0 0">Più difficili da riprodurre:</p>${weak.map(([id,x])=>`<div class="small">${esc(SENT[id].en.slice(0,70))}${SENT[id].en.length>70?"…":""} <b>${x.best}</b></div>`).join("")}</div>`; })()}
  <h2>Comprensione per oratore</h2>
  ${auth.length?`<div class="card tbl"><table><thead><tr><th>Oratore</th><th>Parole/min</th><th>Dettato</th><th>Capito al 1° ascolto</th></tr></thead><tbody>
    ${auth.map(u=>`<tr><td>${esc(u.title.split(" · ")[0].split(" (")[0])}</td><td>${u.wpm||"—"}</td><td>${cell(u.dictAvg)}</td><td>${cell(u.compAvg)}</td></tr>`).join("")}</tbody></table></div>`
   :`<p class="muted">Ancora nessun dato: fai il dettato sulle frasi delle voci tech o dei talk TED.</p>`}
  <h2>Parole che perdi più spesso</h2>
  ${a.topMissed.length?`<p class="words">${a.topMissed.map(([w,n])=>`<span class="miss">${esc(w)} ×${n}</span>`).join(" ")}</p><p class="small muted">${hintFor(a.topMissed.map(x=>x[0]))}</p>`:`<p class="muted">Nessun dettato ancora.</p>`}
  <h2>Grammatica: unità con più errori nei ripassi</h2>
  ${gram.length?`<div class="card">${gram.slice(0,8).map(u=>`<div class="sent"><a href="#" data-act="go" data-to="unit/${u.id}">${esc(u.title)}</a> <span class="small muted">· ${u.lapses} errori</span></div>`).join("")}</div>`:`<p class="muted">Nessun errore registrato nei ripassi.</p>`}`;
}

/* ---------------- Router ---------------- */
let NAV={ v:"home", arg:null };
const parts = () => [NAV.v, NAV.arg];
const view = () => NAV.v;
function go(to){ const i=to.indexOf("/"); NAV = i<0 ? { v:to, arg:null } : { v:to.slice(0,i), arg:to.slice(i+1) }; render(); }
const inSession = () => (NAV.v==="learn" && L) || (NAV.v==="review" && R && R.done>0);
let L=null, R=null; // sessioni: apprendimento e ripasso
function render(){
  stopAll(); if(!(NAV.v==="learn" || NAV.v==="review")) releaseMic();
  const [v,arg]=parts();
  const sy=document.getElementById("sync"); if(sy) sy.textContent=SYNC.status;
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on", a.dataset.v===v || (v==="unit"||v==="learn") && a.dataset.v==="path"));
  const n=dueIds().length; $("#due-badge").textContent = n||"";
  const views={ first:vFirst, cloze:vCloze, cum:vCum, full:vFull, stats:vStats, home:vHome, path:vPath, unit:vUnit, learn:vLearnStart, review:vReviewStart, yt:vYT, settings:vSettings };
  (views[v]||vHome)(arg);
  window.scrollTo(0,0);
}

/* ---------------- Viste ---------------- */
function vHome(){
  const total=Object.keys(SENT).length, learned=Object.keys(S.cards).filter(id=>SENT[id]).length, due=dueIds().length, nu=nextUnit(), nt=nextUnit("tech"), nd=nextUnit("ted"), np=nextUnit("prog");
  const lv=["TECH","TED","B1","B2","C1"].map(l=>{ const us=UNITS.filter(u=>u.level===l), t=us.reduce((a,u)=>a+u.s.length,0), d=us.reduce((a,u)=>a+unitLearned(u),0);
    return `<div class="stat"><span class="lvl ${l}">${l==="TECH"?"Voci tech":l==="TED"?"TED":l}</span> <span class="small muted">${d}/${t} frasi</span><div class="bar" style="margin-top:8px"><i style="width:${t?d/t*100:0}%"></i></div></div>`; }).join("");
  $("#app").innerHTML=`
  <h1>Oggi</h1>
  ${typeof DAILY!=="undefined" && DAILY.focus?`<div class="card daily"><div class="tag">Programma del ${esc(new Date(DAILY.date).toLocaleDateString("it-IT"))}</div><p style="margin:.3em 0">${esc(DAILY.focus)}</p>${DAILY.tip?`<p class="small muted" style="margin:0">${esc(DAILY.tip)}</p>`:""}</div>`:""}
  <div class="grid">
    <div class="stat"><span class="muted small">Ripassi in scadenza</span><b>${due}</b></div>
    <div class="stat"><span class="muted small">Serie di giorni</span><b>${streak()}</b></div>
    <div class="stat"><span class="muted small">Frasi acquisite</span><b>${learned}<span class="small muted">/${total}</span></b></div>
    <a class="stat" href="#" data-act="go" data-to="stats" style="text-decoration:none;color:inherit"><span class="muted small">Ascolto stimato</span><b>${(()=>{ const l=levelEstimate(); return l.ready?l.band:"—"; })()}</b></a>
  </div>
  <div class="card">
    <h2 style="margin-top:0">Piano di oggi</h2>
    <ol class="steps">
      <li><b>Ripasso</b> — ${due? `${due} frasi da richiamare.` : "nessuna frase in scadenza."} ${due?`<a class="btn pri" href="#" data-act="go" data-to="review">Inizia ripasso</a>`:""}</li>
      <li><b>Voci della tecnologia</b> — ${nt? `${esc(nt.title)} <a class="btn" href="#" data-act="go" data-to="unit/${nt.id}">Apri</a>` : "percorso completato."}</li>
      ${np?(()=>{ const st=tedState(np); return `<li><b>Voce tech, ascolto progressivo</b> — ${esc(np.title.split(" · ")[0])} · ${st.waiting?`pezzo ${st.p.b} fatto oggi, il prossimo domani`:`oggi: pezzo ${st.k+1} di ${st.N}`} <a class="btn" href="#" data-act="go" data-to="unit/${np.id}">Apri</a></li>`; })():""}
      <li><b>Talk TED</b> — ${nd? (()=>{ const st=nd.full?tedState(nd):null; return `${esc(nd.title)} <span class="small muted">(${nd.src.wpm} parole/min)</span>${st?` · ${st.waiting?`pezzo ${st.p.b} completato oggi, il ${st.p.b+1} si apre domani`:`oggi: pezzo ${st.k+1} di ${st.N}`}`:""} <a class="btn" href="#" data-act="go" data-to="unit/${nd.id}">Apri</a>`; })() : "nessun talk nuovo: il prossimo arriva domattina."}</li>
      ${(()=>{ const pend=UNITS.find(u=>u.track==="tech" && unitDone(u) && !fullStatus(u).done); return pend?`<li><b>Ascolto integrale</b> — ${esc(pend.title.split(" · ")[0].split(" (")[0])}: lo speech originale completo. <a class="btn" href="#" data-act="go" data-to="full/${pend.id}">Ascolta</a></li>`:""; })()}
      <li><b>Grammatica</b> — ${nu? `<span class="lvl ${nu.level}">${nu.level}</span> ${esc(nu.title)} <a class="btn ${due?"":"pri"}" href="#" data-act="go" data-to="unit/${nu.id}">Apri</a>` : "percorso completato."}</li>
      <li><b>Ascolto autentico</b> — 5 minuti di shadowing su un video reale con la stessa struttura. <a href="#" data-act="go" data-to="yt">${HAS_YT?"Spezzoni":"Fonti"}</a></li>
    </ol>
    <p class="small muted">Ritmo consigliato: prima il ripasso, poi un talk TED o una voce tech con dettato, e una unità di grammatica ogni 1-2 giorni. Le tue difficoltà sono in <a href="#" data-act="go" data-to="stats">Difficoltà</a>. Non aprire unità nuove se i ripassi arretrati superano 40 frasi.</p>
  </div>
  <h2>Livelli</h2><div class="grid">${lv}</div>
  <div class="card small">
    <h3 style="margin-top:0">Il metodo</h3>
    <ol class="steps">
      <li><b>Capisci</b>: leggi regola, traduzione e nota in italiano.</li>
      <li><b>Ascolta</b> la frase a velocità ridotta.</li>
      <li><b>Shadowing</b>: ripeti sopra la voce e nelle pause, con la velocità che sale; l'ultimo giro è senza testo.</li>
      <li><b>Verifica</b>: registrati e confronta, oppure fai controllare la pronuncia.</li>
      <li><b>Richiami</b>: la frase torna dall'italiano dopo 1 giorno, poi circa 3, 8, 20 e 50 giorni; se la sbagli, il ciclo riparte.</li>
    </ol>
  </div>`;
}

function vPath(){
  let h=`<h1>Percorso</h1><p class="muted">Ogni unità si sblocca completando la precedente. ${S.settings.unlockAll?"<b>Sblocco totale attivo.</b>":""}</p>`;
  ["TECH","PROG","TED","B1","B2","C1"].forEach(l=>{
    if(l==="PROG" && typeof LEVELS.PROG==="undefined") return;
    h+= l==="TECH" ? `<h2>Voci della tecnologia</h2><p class="small muted">${esc(LEVELS.TECH)}</p>` : l==="PROG" ? `<h2>Voci tech: ascolto progressivo</h2><p class="small muted">${esc(LEVELS.PROG)}</p>` : l==="TED" ? `<h2>Talk TED</h2><p class="small muted">${esc(LEVELS.TED)}</p>` : `<h2><span class="lvl ${l}">${l}</span> Grammatica</h2><p class="small muted">${esc(LEVELS[l])}</p>`;
    UNITS.forEach((u,i)=>{ if(u.level!==l) return;
      const ok=unitUnlocked(i), dueU=dueIds().filter(id=>id.startsWith(u.id+"-")).length;
      const tedP = u.full ? progOf(u).b : null, d = tedP!=null ? tedP : unitLearned(u), tot = tedP!=null ? u.full.length : u.s.length;
      h+=`<a class="unit ${ok?"":"locked"}" href="#" data-act="go" data-to="unit/${u.id}"><span class="n">${u.track==="tech"?"VOCE "+(+u.id.slice(2)):u.track==="ted"?"TED "+(+u.id.slice(4)):u.track==="prog"?"PROG "+(+u.id.slice(3)):u.id.toUpperCase()}</span>
        <span class="t">${esc(u.title)}<div class="bar" style="margin-top:6px"><i style="width:${d/tot*100}%"></i></div></span>
        <span class="p">${ok? `${d}/${tot}${tedP!=null?" pezzi":""}${dueU?` · ${dueU} da ripassare`:""}` : "🔒"}</span></a>`;
    });
  });
  $("#app").innerHTML=h;
}

function ytSearch(q){ return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`; }
function vUnit(id){
  const i=unitIdx(id), u=UNITS[i]; if(!u){ go("path"); return; }
  if(!unitUnlocked(i)){ const p=prevSame(i); $("#app").innerHTML=`<p>Unità bloccata. Completa prima <a href="#" data-act="go" data-to="unit/${p.id}">${esc(p.title)}</a>.</p>`; return; }
  if(u.full) return vTedUnit(u);
  if(u.track==="tech" || u.track==="ted") return vTechUnit(u);
  const segs=S.yt.filter(y=>y.unitId===u.id);
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="path">← Percorso</a></p>
  <h1><span class="lvl ${u.level}">${u.level}</span> ${esc(u.title)}</h1>
  <div class="card"><dl class="rules"><dt>Forma</dt><dd>${esc(u.f)}</dd><dt>Uso</dt><dd>${esc(u.u)}</dd><dt>Trappola</dt><dd>${esc(u.t)}</dd></dl></div>
  <div class="row"><a class="btn pri" href="#" data-act="go" data-to="learn/${u.id}">${unitDone(u)?"Ripeti lo shadowing":unitLearned(u)?"Continua lo shadowing":"Inizia lo shadowing"}</a>
    <span class="small muted">${unitLearned(u)}/${u.s.length} frasi acquisite</span><button class="mini" data-act="tr">🇮🇹 Mostra traduzioni</button></div>
  <div class="card">${u.s.map((x,k)=>{ const c=S.cards[`${u.id}-${k+1}`];
    return `<div class="sent"><div class="en">${esc(x[0])}</div><div class="it tr" hidden>${esc(x[1])}</div><div class="small muted">${esc(x[2])}${c?` · prossimo richiamo: ${new Date(c.due).toLocaleDateString("it-IT")}`:""}</div></div>`; }).join("")}</div>
  <p class="small muted">Ascolto autentico: la stessa struttura la ritrovi nei talk TED del <a href="#" data-act="go" data-to="path">percorso</a>, con la voce originale.</p>
  ${segs.length?`<div class="card">${segs.map(y=>`<div class="sent"><div class="en">${esc(y.en)}</div><div class="it">${esc(y.it)}</div>
     <div class="row small"><a href="#" data-act="go" data-to="learn/yt:${y.id}">Shadowing</a><span class="muted">${mmss(y.start)}–${mmss(y.end)}</span></div></div>`).join("")}</div>`:""}`;
}

/* ----- Voci della tecnologia ----- */
const ytLink = (id,t) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}${t!=null?`&t=${t}s`:""}`;
function techBox(it){
  if(!it.tech) return "";
  const x=it.x, s=it.unit.src;
  if(!x.sound){ return `<p class="small muted" style="margin-top:12px">Traduzione ufficiale TED (allineata per tempo). ${esc(s.name)}, ${esc(s.date)}.</p>`; }
  const isTed = it.unit.track==="ted";
  const when = x.t==null ? "" : isTed ? ` (circa da ${mmss(x.t)})` : s.approx ? ` (capitolo da ${mmss(x.t)})` : ` da ${mmss(x.t)}`;
  return `<dl class="rules tech">
      <dt>Come suona</dt><dd>${esc(x.sound)}</dd>
      <dt>Costruzione</dt><dd>${esc(x.build)}</dd>
      <dt>Riusala</dt><dd><i>${esc(x.reuse)}</i> <button class="mini" data-act="sayreuse" aria-label="Ascolta l'esempio">▶</button><div class="small muted">Esempio scritto per il tuo lavoro, non è una citazione.</div></dd>
    </dl>
    <div class="row small" style="margin-top:10px">
      ${useOriginal(it)||hasOrig(it)?`<button class="mini" data-act="synth">🤖 Voce chiara (sintetica)</button>`:""}
      ${isTed?`<a target="_blank" rel="noopener" href="${esc(s.talk)}">Talk su TED.com</a>`:""}
      <a target="_blank" rel="noopener" href="${esc(s.tx)}">Trascrizione</a>
    </div>
    <p class="small muted">${esc(s.name)}, ${esc(s.date)}${isTed&&x.t!=null?` · sul player TED la frase inizia a ${mmss(x.t)}; ritmo del talk ${s.wpm} parole/min`:""}.</p>`;
}
function vTechUnit(u){
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="path">← Percorso</a></p>
  <h1>${esc(u.title)}</h1>
  <p class="small muted">${esc(u.src.name)}, ${esc(u.src.date)}${u.src.wpm?` · ${u.src.wpm} parole/min`:""} · <a target="_blank" rel="noopener" href="${esc(u.src.tx)}">Trascrizione ufficiale</a></p>
  <div class="card"><dl class="rules"><dt>Come parla</dt><dd>${esc(u.f)}</dd><dt>Cosa allenare</dt><dd>${esc(u.u)}</dd><dt>Attenzione</dt><dd>${esc(u.t)}</dd></dl></div>
  <div class="row"><a class="btn ${unitDone(u)?"":"pri"}" href="#" data-act="go" data-to="learn/${u.id}">${unitDone(u)?"Ripeti":unitLearned(u)?"Continua":"Inizia"}: ascolto, comprensione, shadowing</a>
    ${unitDone(u)?`<a class="btn pri" href="#" data-act="go" data-to="full/${u.id}">🎧 Ascolto integrale (${fullStatus(u).rated}/${fullStatus(u).n})</a>`:`<span class="small muted">L'ascolto integrale si apre dopo lo shadowing.</span>`}
    <span class="small muted">${unitLearned(u)}/${u.s.length} frasi acquisite</span><button class="mini" data-act="tr">🇮🇹 Mostra traduzioni</button></div>
  <div class="card">${u.s.map((x,k)=>{ const c=S.cards[`${u.id}-${k+1}`], e=x[3]||{};
    return `<div class="sent"><div class="en">${c?esc(x[0]):"<span class='muted'>Testo nascosto fino al primo ascolto</span>"}</div><div class="it tr" hidden>${c?esc(x[1]):""}</div>
      <div class="small muted">${esc(x[2])}${e.t!=null?` · ${u.track==="ted"?"":u.src.approx?"capitolo da ":""}${mmss(e.t)}`:""}${c?` · prossimo richiamo: ${new Date(c.due).toLocaleDateString("it-IT")}`:""}</div></div>`; }).join("")}</div>
  <p class="small muted">Le frasi sono citate parola per parola dalla trascrizione ufficiale, per uso di studio personale.${HAS_YT?" Con l'audio originale attivo, il loop parte dal minuto indicato con una durata stimata: se taglia, usa il link YouTube.":" Su claude.ai i video non si incorporano: lo shadowing usa una voce americana sintetica, l'originale si apre su YouTube nel punto giusto."}</p>`;
}

/* ----- TED: percorso progressivo a pezzi con ascolto cumulativo dell'originale ----- */
function progOf(u){ return S.prog[u.id] || (S.prog[u.id]={ b:0, day:null }); }
const shadowed = id => !!S.cards[id] || !!(S.ev[id] && S.ev[id].sh);
function blockIds(u,k){ const [,,a,z]=u.full[k]; return u.s.map((x,i)=>[`${u.id}-${i+1}`, (x[3]||{}).ot ?? (x[3]||{}).t]).filter(([,t])=>t!=null && t>=a-0.5 && t<z-0.5).map(([id])=>id); }
function tedState(u){
  const p=progOf(u), N=u.full.length, today=dayKey();
  const done=p.b>=N, waiting=!done && p.b>0 && p.day===today && p.force!==today;
  return { p, N, done, waiting, k: done?N-1:p.b };
}
function vTedUnit(u){
  const st=tedState(u), src=u.src, k=st.k, ids=blockIds(u,k), studied=ids.every(shadowed);
  const blocks=u.full.map((b,j)=>{ const ok=j<st.p.b, now=j===st.p.b && !st.waiting && !st.done;
    return `<div class="sent row" style="justify-content:space-between"><span>${ok?"✓":now?"▶":"·"} Pezzo ${j+1} <span class="small muted">${clock(b[2])}–${clock(b[3])} · ${blockIds(u,j).length} frasi</span></span>${ok?`<span class="small muted">${(x=>x?`${x.r0!=null?["poco","metà","quasi tutto"][x.r0]+" → ":""}${["poco","metà","quasi tutto"][x.r]||""}`:"")((S.full[u.id]||{})[j])}</span>`:""}</div>`; }).join("");
  let today;
  if(st.done) today=`<div class="card daily"><b>Discorso completato.</b> <p class="small muted" style="margin:.3em 0 .6em">Riascoltalo intero ogni tanto: è il miglior test di comprensione.</p><a class="btn pri" href="#" data-act="go" data-to="cum/${u.id}">🎧 Ascolta tutto il discorso</a></div>`;
  else if(st.waiting) today=`<div class="card daily"><b>Oggi hai completato il pezzo ${st.p.b}.</b> Il pezzo ${st.p.b+1} si apre domani.
      <div class="row" style="margin-top:8px"><a class="btn" href="#" data-act="go" data-to="cum/${u.id}">🎧 Riascolta dall'inizio</a><button class="mini" data-act="tedforce" data-u="${u.id}">Vai avanti oggi</button></div></div>`;
  else { const f=(S.full[u.id]||{})[k]||{}, s1=f.r0!=null, s3=f.cloze!=null, next = !s1?1 : !studied?2 : !s3?3 : 4;
    const step=(n,done,html)=>`<li class="${done?"stepdone":n===next?"stepnow":""}">${done?"✓ ":""}${html}</li>`;
    today=`<div class="card daily"><div class="tag">Oggi</div><b>Pezzo ${k+1} di ${st.N}</b> <span class="small muted">(${clock(u.full[k][2])}–${clock(u.full[k][3])}, ${Math.round((u.full[k][3]-u.full[k][2])/60*10)/10} min)</span>
      <ol class="steps">
      ${step(1,s1,`<a class="btn ${next===1?"pri":""}" href="#" data-act="go" data-to="first/${u.id}">🎧 Primo ascolto del pezzo nuovo, senza testo</a>${s1?` <span class="small muted">capito: ${["poco","metà","quasi tutto"][f.r0]}</span>`:""}`)}
      ${step(2,studied,ids.length?`<a class="btn ${next===2?"pri":""}" href="#" data-act="go" data-to="learn/${u.id}@${k}">🔁 Shadowing delle ${ids.length} frasi del pezzo, in ordine</a>`:`Nessuna frase in questo pezzo.`)}
      ${step(3,s3,`<a class="btn ${next===3?"pri":""}" href="#" data-act="go" data-to="cloze/${u.id}">✍ Comprensione: completa le parole che senti</a>${s3?` <span class="small muted">${f.cloze}%</span>`:""}`)}
      ${step(4,false,`<a class="btn ${next===4?"pri":""}" href="#" data-act="cumgo" data-u="${u.id}">🎧 Riascolta tutto dall'inizio fino a ${clock(u.full[k][3])}</a>`)}
      </ol>
      <p class="small muted" style="margin:0">Primo ascolto per capire quanto capisci oggi, poi lavoro sulle frasi, poi il riascolto: alla fine vedi la differenza.</p></div>`; }
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="path">← Percorso</a></p>
  <h1>${esc(u.title)}</h1>
  <p class="small muted">${esc(src.name)}, ${esc(src.date)}${src.wpm?` · ${src.wpm} parole/min`:""} · ${src.orig?"audio originale TED":HAS_YT?"video originale incorporato":"video originale su YouTube"}</p>
  ${today}
  <div class="card"><dl class="rules"><dt>Come parla</dt><dd>${esc(u.f)}</dd><dt>Cosa allenare</dt><dd>${esc(u.u)}</dd></dl></div>
  <h2>I pezzi</h2><div class="card">${blocks}</div>
  <p class="small muted">${src.orig?`Audio e trascrizione © TED, licenza <a target="_blank" rel="noopener" href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a>, uso personale non commerciale. <a target="_blank" rel="noopener" href="${esc(src.talk)}">Talk su TED.com</a>`:`Video ufficiale riprodotto con il player YouTube; frasi citate dalla <a target="_blank" rel="noopener" href="${esc(src.tx)}">trascrizione ufficiale</a>.`}</p>`;
}
let CUM=null;
/* Passo 1: primo ascolto del pezzo nuovo, voce originale, senza testo. */
function vFirst(uid){
  const u=UNITS[unitIdx(uid)]; if(!u || !u.full){ go("path"); return; }
  const st=tedState(u), k=st.k, a=u.full[k][2], z=u.full[k][3], f=(S.full[u.id]||{})[k]||{};
  CUM={ u, k, pos:0, a0:a, end:z, first:true };
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="unit/${u.id}">← ${esc(u.title.split(" · ")[0])}</a></p>
  <h1>Primo ascolto · pezzo ${k+1}</h1>
  <p class="muted">${Math.round((z-a)/60*10)/10} minuti di voce originale, senza testo e senza traduzione. Non fermarti sulle parole che non capisci: cerca il senso generale.</p>
  <div class="card">
    <div class="row"><button class="pri" data-act="cumplay" data-from="${a}">▶ Ascolta</button><button data-act="cumresume">⏯ Riprendi</button><button data-act="stop">■ Stop</button></div>
    <div class="bar" style="margin-top:12px"><i id="cum-bar" style="width:0;background:var(--link)"></i></div>
    <div class="row small" style="justify-content:space-between;margin-top:4px"><span id="cum-pos">${clock(a)} / ${clock(z)}</span><span id="cum-blk" class="muted"></span></div>
  </div>
  <div class="card">
    <p style="margin:0 0 6px"><b>Dopo il primo ascolto, quanto hai capito?</b></p>
    <div class="row">${[[2,"Quasi tutto"],[1,"Metà"],[0,"Poco"]].map(([v,l])=>`<button class="${f.r0===v?"on-ok":""}" data-act="firstrate" data-v="${v}">${l}</button>`).join("")}</div>
    <p class="small muted" style="margin:.6em 0 0">È il punto di partenza: alla fine della giornata lo confronti con il riascolto.</p>
  </div>`;
  prefetchOrig(u, a, a+1);
}
/* Passo 3: comprensione all'ascolto — completa le parole mancanti (generato dalle frasi del pezzo). */
function clozeItems(u,k){
  const ids=blockIds(u,k).filter(id=>SENT[id].en.split(/\s+/).length>=7);
  const pick=[...ids.filter(id=>SENT[id].x.key), ...ids.filter(id=>!SENT[id].x.key)].slice(0,8).sort((a,b)=>SENT[a].x.ot-SENT[b].x.ot);
  return pick.map(id=>{
    const words=SENT[id].en.split(/\s+/);
    const cand=words.map((w,i)=>[i,w.replace(/[^A-Za-z'’-]/g,"")]).filter(([i,w])=>i>0 && w.length>=4 && !FUNC.has(w.toLowerCase().replace(/[’']/g,"")));
    cand.sort((a,b)=>b[1].length-a[1].length);
    const holes=[]; for(const c of cand){ if(holes.every(h=>Math.abs(h[0]-c[0])>1)) holes.push(c); if(holes.length===2) break; }
    return { id, words, holes:holes.sort((a,b)=>a[0]-b[0]) };
  });
}
function lev(a,b){ const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]); for(let j=1;j<=b.length;j++) d[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[a.length][b.length]; }
function vCloze(uid){
  const u=UNITS[unitIdx(uid)]; if(!u || !u.full){ go("path"); return; }
  const k=tedState(u).k, items=clozeItems(u,k);
  CUM={ u, k, cloze:items };
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="unit/${u.id}">← ${esc(u.title.split(" · ")[0])}</a></p>
  <h1>Comprensione · pezzo ${k+1}</h1>
  <p class="muted">Ascolta ogni frase con la voce originale e scrivi le parole mancanti. Riascolta quante volte vuoi.</p>
  ${items.map((it,n)=>`<div class="card cz">
    <div class="row" style="margin-bottom:6px"><button class="mini" data-act="czplay" data-n="${n}">▶ Originale</button><button class="mini" data-act="czslow" data-n="${n}">🐢 Lenta</button></div>
    <p class="czs">${it.words.map((w,i)=>{ const h=it.holes.find(x=>x[0]===i); if(!h) return esc(w);
      const pre=w.slice(0,w.indexOf(h[1])), post=w.slice(w.indexOf(h[1])+h[1].length);
      return `${esc(pre)}<input class="czin" data-n="${n}" data-i="${i}" size="${Math.max(4,h[1].length)}" autocomplete="off" autocapitalize="off" spellcheck="false">${esc(post)}`; }).join(" ")}</p>
  </div>`).join("")}
  <div class="row"><button class="pri" data-act="czcheck">Correggi</button></div>
  <div id="czout"></div>`;
  prefetchOrig(u, u.full[k][2], u.full[k][3]);
}
function clozeCheck(){
  const { u, k, cloze }=CUM; let ok=0, tot=0; const missed=[];
  cloze.forEach((it,n)=>it.holes.forEach(([i,w])=>{ tot++;
    const inp=document.querySelector(`.czin[data-n="${n}"][data-i="${i}"]`), v=(inp.value||"").trim().toLowerCase().replace(/[’]/g,"'"), t=w.toLowerCase().replace(/[’]/g,"'");
    const good = v===t || (t.length>=5 && lev(v,t)<=1);
    if(good) ok++; else missed.push(t.replace(/'/g,""));
    inp.classList.toggle("ok",good); inp.classList.toggle("bad",!good); if(!good){ inp.insertAdjacentHTML("afterend",` <span class="czfix">${esc(w)}</span>`); inp.disabled=true; }
  }));
  const pct=tot?Math.round(ok/tot*100):0, f=fullOf(u.id); f[k]=Object.assign(f[k]||{}, { cloze:pct });
  missed.forEach(w=>{ S.miss[w]=(S.miss[w]||0)+1; }); markActivity(); save();
  $("#czout").innerHTML=`<div class="card"><b>${pct}%</b> delle parole riconosciute (${ok} su ${tot}). ${pct>=80?"Ottimo.":pct>=50?"Buono: riascolta le frasi con le parole sbagliate.":"Normale al primo tentativo: riascolta le frasi in versione lenta."}
    <div class="row" style="margin-top:8px"><a class="btn pri" href="#" data-act="cumgo" data-u="${u.id}">🎧 Ultimo passo: riascolta dall'inizio</a></div></div>`;
}
function vCum(uid){
  const u=UNITS[unitIdx(uid)]; if(!u || !u.full){ go("path"); return; }
  const st=tedState(u), k=st.k, end=u.full[k][3], newA=u.full[k][2];
  const rated=(S.full[u.id]||{})[k];
  CUM={ u, k, pos:0 };
  const r0=((S.full[u.id]||{})[k]||{}).r0;
  const blockText=(b,j)=> b[1] ? markStudied(u,b[1]) : blockIds(u,j).map(id=>`<mark>${esc(SENT[id].en)}</mark>`).join(" … ");
  const tx=u.full.slice(0,k+1).map((b,j)=>`<p class="${j===k?"newblk":""}"><span class="small muted">Pezzo ${j+1} · ${clock(b[2])}</span><br>${blockText(b,j)}</p>`).join("")
    + (u.src.orig?"":`<p class="small muted">Qui compaiono solo le frasi studiate; il testo completo è nella <a target="_blank" rel="noopener" href="${esc(u.src.tx)}">trascrizione ufficiale</a>.</p>`);
  const yt=!u.src.orig, canPlay=!yt || HAS_YT;
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="unit/${u.id}">← ${esc(u.title.split(" · ")[0])}</a></p>
  <h1>${st.done?"Il discorso intero":`Ascolto cumulativo · pezzo ${k+1} di ${st.N}`}</h1>
  <p class="muted">Voce originale, ${st.done?"dall'inizio alla fine":`dall'inizio${u.src.orig?"":" dell'estratto"} fino a ${clock(end)}`}. Ascolta senza leggere: i pezzi già studiati ti fanno da appoggio per capire quello nuovo.</p>
  ${yt&&HAS_YT?`<div class="yt-wrap"><div id="yt-player"></div></div>`:""}
  ${canPlay?"":`<div class="card"><p style="margin:0 0 8px">Qui il video non si può incorporare: aprilo su YouTube e ascolta da <b>${clock(u.full[0][2])}</b> a <b>${clock(end)}</b>, senza leggere.</p><a class="btn pri" target="_blank" rel="noopener" href="${ytLink(u.src.yt,Math.floor(u.full[0][2]))}">▶ Apri su YouTube da ${clock(u.full[0][2])}</a></div>`}
  <div class="card" ${canPlay?"":"hidden"}>
    <div class="row">
      <button class="pri" data-act="cumplay" data-from="${u.full[0][2]}">▶ Dall'inizio</button>
      ${k>0?`<button class="mini" data-act="cumplay" data-from="${newA}">Solo il pezzo nuovo</button>`:""}
      <button data-act="cumresume">⏯ Riprendi</button>
      <button data-act="stop">■ Stop</button>
    </div>
    <div class="bar" style="margin-top:12px"><i id="cum-bar" style="width:0;background:var(--link)"></i></div>
    <div class="row small" style="justify-content:space-between;margin-top:4px"><span id="cum-pos">${clock(u.full[0][2])} / ${clock(end)}</span><span id="cum-blk" class="muted"></span></div>
  </div>
  <div class="card">
    <p style="margin:0 0 6px"><b>${st.done?"Quanto hai capito del discorso?":"Quanto hai capito, soprattutto del pezzo nuovo?"}</b></p>
    <div class="row">${[[2,"Quasi tutto"],[1,"Metà"],[0,"Poco"]].map(([v,l])=>`<button class="${rated&&rated.r===v?"on-ok":""}" data-act="cumrate" data-v="${v}">${l}</button>`).join("")}</div>
    <p class="small muted" style="margin:.6em 0 0">${st.done?"":`${r0!=null?`Al primo ascolto avevi detto «${["poco","metà","quasi tutto"][r0]}». `:""}La valutazione chiude il pezzo di oggi: domani si apre il successivo.`}</p>
  </div>
  <div class="row"><button class="mini" data-act="cumtx">📄 Mostra la trascrizione</button></div>
  <div class="ftx" id="cum-tx" hidden>${tx}</div>
  <p class="small muted">${u.src.orig?"Audio e trascrizione © TED, licenza CC BY-NC-ND 4.0.":"Video ufficiale tramite player YouTube."}</p>`;
  if(u.src.parts) prefetchOrig(u, 0, 1);
  else if(HAS_YT) ensurePlayer().then(p=>p.cueVideoById({ videoId:u.src.yt, startSeconds:Math.floor(u.full[0][2]) })).catch(()=>{});
}
async function cumPlay(from){
  if(!CUM) return; const { u, k }=CUM, end=CUM.end ?? u.full[k][3];
  stopAll(); const my=runId; keepAwake(true);
  const yt=!u.src.orig, a0=CUM.a0 ?? u.full[0][2], span=end-a0;
  const tick=setInterval(()=>{
    if(my!==runId) return;
    let pos;
    if(yt){ if(!ytPlayer || !ytPlayer.getCurrentTime) return; pos=ytPlayer.getCurrentTime(); if(pos<a0-1) return; }
    else { if(!curPlay) return; pos=curPlay.st + (actx.currentTime-curPlay.t0); }
    CUM.pos=pos;
    const b=$("#cum-bar"), l=$("#cum-pos"), z=$("#cum-blk"); if(!b){ clearInterval(tick); return; }
    b.style.width=Math.max(0,Math.min(100,(pos-a0)/span*100))+"%"; l.textContent=`${clock(pos)} / ${clock(end)}`;
    const j=u.full.findIndex(x=>pos>=x[2] && pos<x[3]); z.textContent= j>=0 ? `pezzo ${j+1}${j===k?" (nuovo)":""}` : "";
  },250);
  const d= yt ? await playSegment({ videoId:u.src.yt, start:from, end }, 1, my) : await playTimeline(u, from, end, my);
  clearInterval(tick); keepAwake(false);
  if(d<0) toast("Audio originale non disponibile.");
  if(my===runId){ CUM.pos=0; const l=$("#cum-pos"); if(l) l.textContent=`fine · ${clock(end)}`; const t=$("#cum-blk"); if(t) t.textContent="Ora valuta quanto hai capito."; }
}

/* ----- Ascolto integrale dello speech originale (dopo lo shadowing) ----- */
const fullOf = uid => S.full[uid] || (S.full[uid]={});
function fullStatus(u){
  const f=S.full[u.id]||{}, n = u.full ? u.full.length : 1, rated=Object.entries(f).filter(([k,x])=>!k.startsWith("peek") && x && x.r!=null).length;
  return { n, rated, done: rated>=n };
}
function markStudied(u, text){
  let h=esc(text);
  for(const x of u.s){ const e=esc(x[0]); if(h.includes(e)) h=h.replace(e, `<mark>${e}</mark>`); }
  return h;
}
function vFull(uid){
  const u=UNITS[unitIdx(uid)]; if(!u || !(u.track==="ted"||u.track==="tech")){ go("path"); return; }
  if(u.full) return vCum(uid);
  const f=fullOf(u.id), st=fullStatus(u), src=u.src;
  const rate=(k,lbl,v)=>`<button class="mini${f[k]&&f[k].r===v?" on-ok":""}" data-act="frate" data-u="${u.id}" data-k="${k}" data-v="${v}">${lbl}</button>`;
  let body;
  if(u.full){
    body=u.full.map(([t,txt],k)=>{ const next=u.full[k+1]?u.full[k+1][0]:null;
      return `<div class="card blk">
        <div class="row" style="justify-content:space-between"><b>Blocco ${k+1} di ${u.full.length}</b><span class="small muted">${mmss(t)}${next!=null?`–${mmss(next)}`:" → fine"}</span></div>
        <div class="row small" style="margin:8px 0">
          ${HAS_YT?`<button data-act="fplay" data-u="${u.id}" data-k="${k}">▶ Ascolta il blocco</button>`:""}
          <a class="btn" target="_blank" rel="noopener" href="${ytLink(src.yt,Math.max(0,t-2))}">▶ YouTube da ${mmss(Math.max(0,t-2))}</a>
          <button class="mini" data-act="ftx" data-k="${k}">📄 Trascrizione</button>
        </div>
        <div class="ftx small" id="ftx-${k}" hidden>${markStudied(u,txt)}</div>
        <div class="row small" style="margin-top:8px"><span class="muted">Quanto hai capito?</span>${rate(k,"Quasi tutto",2)}${rate(k,"Metà",1)}${rate(k,"Poco",0)}</div>
      </div>`; }).join("");
  }else{
    const ts=u.s.map(x=>(x[3]||{}).t).filter(v=>v!=null), t0=ts.length?Math.max(0,Math.min(...ts)-60):0;
    body=`<div class="card">
      <p>Ascolta <b>15 minuti</b> dell'episodio originale${ts.length?` a partire da <b>${mmss(t0)}</b>, un minuto prima della prima frase che hai studiato`:" dall'inizio"}. Senza testo: quando perdi il filo, non fermarti, aspetta la frase successiva.</p>
      <div class="row small"><a class="btn pri" target="_blank" rel="noopener" href="${ytLink(src.yt,ts.length?t0:null)}">▶ Apri l'episodio${ts.length?` da ${mmss(t0)}`:""}</a><a target="_blank" rel="noopener" href="${esc(src.tx)}">Trascrizione ufficiale</a></div>
      <p class="small muted">Riconoscerai le frasi studiate: è il segnale che lo shadowing sta funzionando. La trascrizione completa non è riportata qui perché non è libera da diritti.</p>
      <div class="row small" style="margin-top:8px"><span class="muted">Quanto hai capito?</span>${rate(0,"Quasi tutto",2)}${rate(0,"Metà",1)}${rate(0,"Poco",0)}</div></div>`;
  }
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="unit/${u.id}">← ${esc(u.title.split(" · ")[0].split(" (")[0])}</a></p>
  <h1>Ascolto integrale</h1>
  <p class="muted">${esc(src.name)}${src.wpm?` · ${src.wpm} parole/min`:""}. Ora che hai lavorato le frasi in shadowing, ascolta lo speech originale com'è, senza testo, e prova a seguirlo.</p>
  ${u.full?`<ol class="steps small"><li>Apri il blocco su YouTube${src.talk?` (o il <a target="_blank" rel="noopener" href="${esc(src.talk)}">talk su TED.com</a>)`:""} e ascoltalo senza leggere.</li><li>Valuta quanto hai capito: lo uso per tarare i talk dei prossimi giorni.</li><li>Solo dopo, se vuoi, apri la trascrizione: le frasi che hai studiato sono evidenziate.</li></ol>
  ${HAS_YT?`<div class="yt-wrap"><div id="yt-player"></div></div><div id="phase" class="phase"></div>`:""}`:""}
  ${body}
  <p class="small muted">${st.rated}/${st.n} ${u.full?"blocchi valutati":"valutazione"}.${u.full?` Trascrizione © TED, licenza <a target="_blank" rel="noopener" href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a>; i minuti su YouTube possono differire di qualche secondo.`:""}</p>`;
  if(HAS_YT && u.full) ensurePlayer().then(p=>p.cueVideoById({ videoId:src.yt, startSeconds:0 })).catch(()=>{});
}

/* ----- Sessione di apprendimento ----- */
function vLearnStart(arg){
  if(!arg && L && L.drill){ renderLearn(); return; }
  if(arg && arg.startsWith("yt:")){ const y=item(arg.slice(3)); if(!y){ go("yt"); return; } L={ ids:[y.id], idx:0, back:"yt" }; }
  else if(arg && arg.includes("@")){ const [uid,kk]=arg.split("@"), u=UNITS[unitIdx(uid)], k=+kk; if(!u || !u.full){ go("path"); return; }
    const ids=blockIds(u,k), first=ids.findIndex(id=>!shadowed(id)); if(!ids.length){ go("cum/"+u.id); return; }
    L={ ids, idx:first<0?0:first, unit:u, block:k, back:`unit/${u.id}` }; }
  else{ const u=UNITS[unitIdx(arg)]; if(!u || !unitUnlocked(unitIdx(arg))){ go("path"); return; }
    if(u.full){ go("unit/"+u.id); return; }
    const ids=unitIds(u), first=ids.findIndex(id=>!S.cards[id]);
    L={ ids:[...ids, ...S.yt.filter(y=>y.unitId===u.id && !S.cards[y.id]).map(y=>y.id)], idx:first<0?0:first, unit:u, back:`unit/${u.id}` }; }
  renderLearn();
}
function controls(){
  return `  <div id="turn" class="turn idle" aria-live="polite"><span class="ti">●</span><span class="tl">${judgeOn()?"Premi «Shadowing»: ti dico io quando ascoltare e quando parlare":"Premi «Shadowing» per iniziare"}</span><span class="tm"><i></i></span></div>
  <div class="row">
    <button data-act="listen">▶ Ascolta</button>
    <button data-act="slow">🐢 Lento</button>
    <button class="pri" data-act="shadow">🔁 Shadowing ×${S.settings.reps}</button>
    <button data-act="stop">■ Stop</button>
    <button data-act="blind">👁 Testo</button>
    <button data-act="ita">🇮🇹 Traduzione</button>
  </div>
  ${HAS_MIC?`<div class="row" style="margin-top:8px">
    <button id="btn-rec" data-act="rec">🎙 Registrati</button>
    <button id="btn-me" data-act="me" ${recUrl?"":"disabled"}>▶ La mia voce</button>
    <button id="btn-cmp" data-act="cmp" ${recUrl?"":"disabled"}>⇄ Modello + me</button>
    <button data-act="pron">✓ Verifica pronuncia</button>
  </div>`:""}
  <div class="row" style="margin-top:8px"><button data-act="dict">✍ Dettato</button></div>
  <div id="dict-box" hidden>
    <label for="dict-in">Scrivi quello che senti (numeri in cifre; puoi riascoltare quante volte vuoi)</label>
    <textarea id="dict-in" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>
    <div class="row" style="margin-top:6px"><button class="pri" data-act="dictcheck">Correggi</button></div>
    <div id="dict-out"></div>
  </div>
  <div id="phase" class="phase"></div><div id="votes" class="votes"></div><div id="pron"></div>`;
}
/* Stato del turno, ben visibile: ASCOLTA (non parlare) / PARLA ORA (microfono acceso, barra del volume) / fine. */
let turnTimer=null;
function setTurn(kind, label, ms){
  const t=$("#turn"); if(!t) return;
  t.className="turn "+kind; t.querySelector(".tl").textContent=label;
  t.querySelector(".ti").textContent = kind==="speak" ? "🎙" : kind==="listen" ? "🔊" : "●";
  clearInterval(turnTimer);
  if(ms){ const end=Date.now()+ms; const upd=()=>{ const r=Math.max(0,Math.ceil((end-Date.now())/1000)); const l=t.querySelector(".tl"); if(l) l.textContent=`${label} · ${r}s`; if(r<=0) clearInterval(turnTimer); }; upd(); turnTimer=setInterval(upd,250); }
  micBadge();
}
function setLevel(v){ const i=document.querySelector("#turn .tm i"); if(i) i.style.width=Math.min(100,Math.round(v*400))+"%"; }
function micBadge(){ const b=document.getElementById("micbadge"); if(!b) return; const on=!!(micStream && micStream.getTracks().some(t=>t.readyState==="live")); b.hidden=!on; }
function beep(freq=880, ms=120){ try{ const c=audioCtx(); const o=c.createOscillator(), g=c.createGain(); o.frequency.value=freq; g.gain.value=0.08; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+ms/1000); }catch(e){} if(navigator.vibrate) try{ navigator.vibrate(60); }catch(e){} }
function itemCard(it, showEn=true){
  const vid = it.type==="yt" || (it.tech && it.start!=null && HAS_YT);
  return `${!vid?"": HAS_YT?`<div class="yt-wrap"><div id="yt-player"></div></div>`:`<p class="small"><a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${esc(it.videoId)}&t=${Math.floor(it.start)}s">Apri lo spezzone su YouTube</a> · qui viene letto dalla voce sintetica</p>`}
    <div class="tag">${it.unit?`<span class="lvl ${it.unit.level}">${it.unit.level}</span> ${esc(it.unit.title)}`:"Spezzone YouTube"}</div>
    ${showEn?`<div id="en-text" class="big${it.tech&&showEn==="hide"?" blind":""}">${esc(it.en)}</div>`:""}`;
}
function renderLearn(){
  L.t0=Date.now();
  stopAll(); if(recUrl){ URL.revokeObjectURL(recUrl); recUrl=null; }
  const it=item(L.ids[L.idx]), learned=shadowed(it.id), last=L.idx===L.ids.length-1;
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="${L.back}">← Esci</a> · Frase ${L.idx+1}/${L.ids.length}</p>
  <div class="card">
    ${L.drill?`<p class="small muted">Allenamento mirato: frasi dove hai avuto difficoltà. Ascolta, fai il dettato, poi shadowing.</p>`:""}
    ${it.tech && !L.drill?`<p class="small muted">Prima ascolta senza leggere e prova a capire. Poi tocca “👁 Testo”, leggi le note e fai lo shadowing.</p>`:""}
    ${itemCard(it, (it.tech && !learned) || L.drill ? "hide" : true)}
    <div id="it-text" class="it-big" hidden>🇮🇹 ${esc(it.it)}</div>
    ${it.note && !((it.tech && !learned) || L.drill)?`<div class="note"><b>${it.tech?"Contesto":"Significato e struttura"}:</b> ${esc(it.note)}</div>`:""}
    ${controls()}
    <div id="comp-box" hidden><p class="small" style="margin:10px 0 4px"><b>Al primo ascolto quanto avevi capito?</b></p>
      <div class="row"><button data-act="comp" data-v="2">Quasi tutto</button><button data-act="comp" data-v="1">Metà</button><button data-act="comp" data-v="0">Poco o niente</button></div></div>
    <div id="tech-box" ${(it.tech && !learned) || L.drill?"hidden":""}>${techBox(it)}</div>
  </div>
  <div class="row">
    <button data-act="prev" ${L.idx?"":"disabled"}>← Precedente</button>
    <button class="pri" data-act="done">${learned?"Avanti →": it.unit && it.unit.track==="ted" && it.x && !it.x.key ? "Fatto, frase successiva →" : "Acquisita, programma i richiami →"}</button>
    ${learned?`<span class="small muted">${S.cards[it.id]?"già nei ripassi":"già fatta"}</span>`:""}
    ${L.block!=null?`<span class="small muted">Pezzo ${L.block+1}: frase ${L.idx+1} di ${L.ids.length}</span>`:""}
  </div>`;
  prefetch(it);
  if((it.type==="yt" || it.tech && it.start!=null) && HAS_YT) ensurePlayer().then(p=>p.cueVideoById({ videoId:it.videoId, startSeconds:it.start })).catch(()=>{});
}
function learnDone(){
  const id=L.ids[L.idx];
  { const ev=evOf(id); ev.ms=(ev.ms||0)+Math.min(Date.now()-(L.t0||Date.now()), 600000); }
  const itx=SENT[id];
  if(itx && itx.unit.track==="ted" && itx.x && !itx.x.key){ const ev=evOf(id); if(!ev.sh){ ev.sh=1; markActivity(); save(); } }
  else if(!S.cards[id]){ S.cards[id]=newCard(); markActivity(); save(); }
  if(L.idx<L.ids.length-1){ L.idx++; renderLearn(); return; }
  stopAll();
  const u=L.unit, nu=nextUnit(u?trackOf(u):"grammar");
  if(L.drill){ L=null; $("#app").innerHTML=`<div class="card"><h1>Allenamento completato</h1><p>I risultati dei dettati aggiornano le tue difficoltà.</p><div class="row"><a class="btn pri" href="#" data-act="go" data-to="stats">Difficoltà</a><a class="btn" href="#" data-act="go" data-to="home">Oggi</a></div></div>`; return; }
  if(u && L.block!=null){
    $("#app").innerHTML=`<div class="card"><h1>Frasi del pezzo ${L.block+1} studiate</h1>
      <p>Ora l'esercizio di comprensione, poi il riascolto dall'inizio.</p>
      <div class="row"><a class="btn pri" href="#" data-act="go" data-to="cloze/${u.id}">✍ Comprensione</a><a class="btn" href="#" data-act="cumgo" data-u="${u.id}">🎧 Riascolta dall'inizio</a></div></div>`;
    $("#due-badge").textContent=dueIds().length||""; return;
  }
  if(u && (u.track==="ted"||u.track==="tech")){
    $("#app").innerHTML=`<div class="card"><h1>Shadowing completato</h1>
      <p>Adesso la parte che allena la comprensione vera: ascolta lo speech originale, com'è, senza testo.</p>
      <div class="row"><a class="btn pri" href="#" data-act="go" data-to="full/${u.id}">🎧 Ascolta lo speech completo</a><a class="btn" href="#" data-act="go" data-to="home">Più tardi</a></div>
      <p class="small muted">Le frasi tornano domani nel ripasso.</p></div>`;
    $("#due-badge").textContent=dueIds().length||""; return;
  }
  $("#app").innerHTML=`<div class="card"><h1>${u?"Unità completata":"Spezzone acquisito"}</h1>
    <p>Le frasi tornano domani nel ripasso, poi a intervalli crescenti.</p>
    <div class="row">${nu?`<a class="btn pri" href="#" data-act="go" data-to="unit/${nu.id}">Prossima: ${esc(nu.title)}</a>`:""}<a class="btn" href="#" data-act="go" data-to="home">Oggi</a></div>
    <p class="small muted">Consiglio: non aprire la prossima unità oggi se hai già fatto 2 unità nuove.</p></div>`;
  $("#due-badge").textContent=dueIds().length||"";
}

/* ----- Sessione di ripasso: dall'italiano all'inglese ----- */
function vReviewStart(){ R={ q:dueIds(), idx:0, shown:false, done:0 }; renderReview(); }
function renderReview(){
  stopAll(); if(recUrl){ URL.revokeObjectURL(recUrl); recUrl=null; }
  if(R.idx>=R.q.length){
    $("#app").innerHTML=`<div class="card"><h1>${R.done?"Ripasso completato":"Nessun ripasso in scadenza"}</h1>
      <p>${R.done?`${R.done} richiami fatti.`:"Torna domani, oppure apri una nuova unità."}</p>
      <div class="row">${nextUnit()?`<a class="btn pri" href="#" data-act="go" data-to="unit/${nextUnit().id}">Nuova unità</a>`:""}<a class="btn" href="#" data-act="go" data-to="home">Oggi</a></div></div>`;
    $("#due-badge").textContent=dueIds().length||""; return;
  }
  const it=item(R.q[R.idx]), c=S.cards[it.id];
  const grades=[["Di nuovo","1 g · ricomincia",1],["Difficile",fmtDays(schedule(c,2).interval),2],["Bene",fmtDays(schedule(c,3).interval),3],["Facile",fmtDays(schedule(c,4).interval),4]];
  $("#app").innerHTML=`
  <p class="small"><a href="#" data-act="go" data-to="home">← Esci</a> · ${R.idx+1}/${R.q.length}</p>
  <div class="card">
    ${itemCard(it, R.shown)}
    <div class="it-big">🇮🇹 ${esc(it.it)}</div>
    ${R.shown ? `${it.note?`<div class="note">${esc(it.note)}</div>`:""}${controls()}${techBox(it)}
      <h3>Quanto bene l'hai detta prima di vederla?</h3>
      <div class="grades">${grades.map(g=>`<button class="g${g[2]}" data-act="grade" data-g="${g[2]}">${g[0]}<small>${g[1]}</small></button>`).join("")}</div>`
    : `<p class="muted">Dilla in inglese ad alta voce, poi controlla.</p><button class="pri" data-act="reveal">Mostra e ascolta</button>`}
  </div>`;
  prefetch(it);
  if((it.type==="yt" || it.tech && it.start!=null) && HAS_YT) ensurePlayer().then(p=>p.cueVideoById({ videoId:it.videoId, startSeconds:it.start })).catch(()=>{});
}
function grade(g){
  const id=R.q[R.idx]; S.cards[id]=schedule(S.cards[id], g); markActivity(); save(); R.done++;
  if(g===1) R.q.push(id); // torna in fondo alla sessione di oggi
  R.idx++; R.shown=false; renderReview();
}

/* ----- Spezzoni YouTube ----- */
function vYT(unitPre){
  if(!HAS_YT){
    $("#app").innerHTML=`<h1>Fonti</h1>
    <p class="muted">Solo fonti con audio ufficiale, trascrizione e licenza che permette l'uso a fini di studio. I talk TED sono già nel percorso con la voce originale; le altre sono per l'ascolto libero.</p>
    <div class="card">${SOURCES.map(s=>`<div class="sent"><a target="_blank" rel="noopener" href="${esc(s.url)}">${esc(s.name)}</a><div class="small muted">${esc(s.note)}</div></div>`).join("")}</div>
    <p class="small muted">Esclusi YouTube e i podcast senza licenza aperta: pubblicità inserite e minuti non sincronizzabili.</p>`;
    return;
  }
  const opts=UNITS.map(u=>`<option value="${u.id}" ${u.id===unitPre?"selected":""}>${u.id.toUpperCase()} · ${esc(u.title)}</option>`).join("");
  $("#app").innerHTML=`
  <h1>Spezzoni da YouTube</h1>
  <p class="muted small">Il video viene riprodotto con il player ufficiale incorporato: nessun download. Scegli 1-2 frasi (3-8 secondi), trascrivile, aggiungi traduzione e nota: lo spezzone entra nello shadowing e nei richiami.</p>
  <div class="card">
    <label>Link YouTube</label>
    <div class="row"><input type="text" id="f-url" placeholder="https://www.youtube.com/watch?v=..." style="flex:1"><button data-act="ytload">Carica</button></div>
    <div class="yt-wrap"><div id="yt-player"></div></div>
    <div class="two">
      <div><label>Inizio (m:ss)</label><div class="row"><input type="text" id="f-start" placeholder="1:23.5" style="flex:1"><button data-act="ytA">⟵ ora</button></div></div>
      <div><label>Fine (m:ss)</label><div class="row"><input type="text" id="f-end" placeholder="1:29" style="flex:1"><button data-act="ytB">⟵ ora</button></div></div>
    </div>
    <div class="row" style="margin-top:8px"><button data-act="yttry">▶ Prova spezzone</button><button data-act="stop">■ Stop</button></div>
    <div id="phase" class="phase"></div>
    <label>Unità di riferimento</label><select id="f-unit">${opts}</select>
    <label>Testo inglese (trascrizione esatta)</label><textarea id="f-en"></textarea>
    <label>Traduzione italiana</label><textarea id="f-it"></textarea>
    <label>Significato e struttura (facoltativo)</label><input type="text" id="f-note">
    <div class="row" style="margin-top:12px"><button class="pri" data-act="ytsave">Salva spezzone</button></div>
  </div>
  <h2>I miei spezzoni (${S.yt.length})</h2>
  ${S.yt.length? S.yt.map(y=>`<div class="card"><div class="tag">${esc(y.unitId.toUpperCase())} · ${mmss(y.start)}–${mmss(y.end)} ${S.cards[y.id]?"· nei ripassi":""}</div>
     <div class="en"><b>${esc(y.en)}</b></div><div class="muted">${esc(y.it)}</div>
     <div class="row" style="margin-top:8px"><a class="btn" href="#" data-act="go" data-to="learn/yt:${y.id}">Shadowing</a><button data-act="ytdel" data-id="${y.id}">Elimina</button></div></div>`).join("")
   : `<p class="muted">Nessuno spezzone salvato.</p>`}
  <h2>Fonti consigliate</h2>
  ${SOURCES.map(s=>`<div class="sent"><a target="_blank" rel="noopener" href="${ytSearch(s.q)}">${esc(s.name)}</a> <span class="small muted">— ${esc(s.note)}</span></div>`).join("")}`;
}
async function ytFormLoad(){
  const url=$("#f-url").value, id=ytId(url); if(!id){ toast("Link YouTube non valido."); return; }
  try{ const p=await ensurePlayer(); const st=ytStart(url)||0; p.loadVideoById({ videoId:id, startSeconds:st }); if(st) $("#f-start").value=mmss(st); }
  catch(e){ toast("YouTube non raggiungibile."); }
}
function ytNow(field){ if(!ytPlayer||!ytPlayer.getCurrentTime){ toast("Carica prima il video."); return; } $(field).value=mmss(ytPlayer.getCurrentTime()); }
function ytForm(){
  const videoId=ytId($("#f-url").value), start=parseTime($("#f-start").value), end=parseTime($("#f-end").value);
  if(!videoId) return [null,"Link YouTube non valido."];
  if(!(start>=0) || !(end>start)) return [null,"Indica inizio e fine (fine dopo l'inizio)."];
  if(end-start>30) return [null,"Spezzone troppo lungo: massimo 30 secondi (ideale 3-8)."];
  return [{ videoId, start, end }, null];
}
async function ytTry(){ const [seg,err]=ytForm(); if(err){ toast(err); return; } stopAll(); const my=runId; setPhase("Riproduzione spezzone…"); await playSegment(seg,1,my); if(my===runId) setPhase(""); }
function ytSave(){
  const [seg,err]=ytForm(); if(err){ toast(err); return; }
  const en=$("#f-en").value.trim(), it=$("#f-it").value.trim();
  if(!en||!it){ toast("Inserisci trascrizione e traduzione."); return; }
  S.yt.push({ id:"y"+Date.now().toString(36), ...seg, unitId:$("#f-unit").value, en, it, note:$("#f-note").value.trim(), url:$("#f-url").value.trim() });
  save(); toast("Spezzone salvato."); vYT($("#f-unit").value);
}

/* ----- Impostazioni ----- */
function vSettings(){
  const st=S.settings;
  $("#app").innerHTML=`
  <h1>Impostazioni</h1>
  <div class="card">
    ${HAS_NEURAL?`<label><input type="checkbox" id="s-neural" ${st.neural?"checked":""}> Voce neurale americana (consigliata; ${neuralBroken?"non caricata in questa vista, uso la voce di sistema":"funziona anche offline una volta caricata"})</label>`:""}
    <label>Voce di sistema (usata solo se la voce neurale è disattivata o manca)</label>
    <select id="s-voice"><option value="">Automatica (preferenza en-GB)</option>${voices.map(v=>`<option value="${esc(v.voiceURI)}" ${v.voiceURI===st.voice?"selected":""}>${esc(v.name)} · ${esc(v.lang)}</option>`).join("")}</select>
    <label>Velocità di base: <b id="s-rate-v">${st.rate}</b> <span class="small">(sotto 0.85 la voce neurale usa la versione lenta registrata, sopra la versione normale)</span></label><input type="range" id="s-rate" min="0.6" max="1.2" step="0.05" value="${st.rate}">
    <div class="two">
      <div><label>Ripetizioni per ciclo</label><input type="number" id="s-reps" min="1" max="8" value="${st.reps}"></div>
      <div><label>Pausa per ripetere (× durata frase)</label><input type="number" id="s-gap" min="0.5" max="3" step="0.1" value="${st.gap}"></div>
    </div>
    <label><input type="checkbox" id="s-blind" ${st.blindLast?"checked":""}> Ultimo giro senza testo</label>
    ${HAS_MIC?`<label><input type="checkbox" id="s-judge" ${st.judge?"checked":""}> Voto automatico della mia voce durante lo shadowing (nessuna registrazione salvata)</label>`:""}
    ${HAS_YT?`<label><input type="checkbox" id="s-orig" ${st.original?"checked":""}> Voci tech: usa l'audio originale di YouTube (altrimenti voce sintetica americana)</label>`:""}
    <label><input type="checkbox" id="s-unlock" ${st.unlockAll?"checked":""}> Sblocca tutte le unità (sconsigliato)</label>
    <div class="row" style="margin-top:10px"><button class="pri" data-act="ssave">Salva</button><button data-act="stest">▶ Prova voce</button></div>
  </div>
  <div class="card">
    <h3 style="margin-top:0">Promemoria quotidiano</h3>
    <p class="small muted">Il browser non può avvisarti ad app chiusa. Scarica un evento ricorrente per il tuo calendario (iPhone, Google, Outlook).</p>
    <div class="row"><input type="time" id="s-time" value="${st.remindTime}" style="max-width:140px"><button data-act="ics">Scarica promemoria .ics</button></div>
  </div>
  ${HOST!=="artifact"?`<div class="card">
    <h3 style="margin-top:0">Sincronizzazione con GitHub</h3>
    <p class="small muted">Salva i progressi nel tuo repository privato, così il programma giornaliero li legge e si adatta a te. Il token resta solo su questo telefono.</p>
    <label for="s-ghrepo">Repository privato dei dati (utente/nome)</label><input type="text" id="s-ghrepo" value="${esc(ghRepo()||"GiovacchinoRosati/inglese-dati")}" autocapitalize="off" autocomplete="off" spellcheck="false">
    <label for="s-ghtoken">Token GitHub (fine-grained, solo quel repository, Contents: Read and write)</label><input type="password" id="s-ghtoken" placeholder="${ghToken()?"•••••••• salvato":"github_pat_…"}" autocomplete="off">
    <div class="row" style="margin-top:10px"><button class="pri" data-act="ghsave">Collega</button>${ghToken()?`<button data-act="ghoff">Scollega</button>`:""}<span class="small muted">${esc(SYNC.status)}</span></div>
  </div>`:""}
  <div class="card">
    <h3 style="margin-top:0">Dati</h3>
    <p class="small muted">${HOST==="artifact"?"I progressi si sincronizzano con il tuo account.":"Senza sincronizzazione i progressi restano solo in questo browser."} Il backup serve per spostarli tra la versione claude.ai e quella GitHub.</p>
    <div class="row"><button data-act="export">Esporta backup</button><label class="btn" style="margin:0">Importa backup<input type="file" id="s-import" accept="application/json" hidden></label><button data-act="reset">Azzera tutto</button></div>
  </div>`;
  $("#s-rate").oninput=e=>$("#s-rate-v").textContent=e.target.value;
  $("#s-import").onchange=importData;
}
function saveSettings(){ const st0=S.settings;
  Object.assign(S.settings,{ neural: $("#s-neural") ? $("#s-neural").checked : st0.neural, voice:$("#s-voice").value, rate:+$("#s-rate").value, reps:Math.min(8,Math.max(1,+$("#s-reps").value||3)),
    gap:Math.min(3,Math.max(0.5,+$("#s-gap").value||1.3)), blindLast:$("#s-blind").checked, judge: $("#s-judge") ? $("#s-judge").checked : st0.judge, original: $("#s-orig") ? $("#s-orig").checked : st0.original, unlockAll:$("#s-unlock").checked });
  save(); toast("Impostazioni salvate.");
}
async function download(name, text, type){
  if(HOST==="artifact"){
    const dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null;
    if(!dl){ toast("Download non disponibile in questa vista."); return; }
    try{ await dl.save({ filename:name, data:new Blob([text],{type}) }); }catch(e){ if(e && e.code!=="cancelled") toast("Download non riuscito."); }
    return;
  }
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function ics(){
  const t=$("#s-time").value||"19:00"; S.settings.remindTime=t; save();
  const d=new Date(), p=n=>String(n).padStart(2,"0"), [hh,mi]=t.split(":");
  const day=`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}`, stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  const link=location.href.split("#")[0];
  download("promemoria-inglese.ics",[ "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Shadowing EN//IT","BEGIN:VEVENT",
    `UID:shadowing-${Date.now()}@local`,`DTSTAMP:${stamp}`,`DTSTART:${day}T${hh}${mi}00`,"DURATION:PT20M","RRULE:FREQ=DAILY",
    "SUMMARY:Inglese: ripasso shadowing (20 min)",`DESCRIPTION:Ripasso del giorno + una nuova unità. ${link}`,
    "BEGIN:VALARM","TRIGGER:PT0M","ACTION:DISPLAY","DESCRIPTION:Ripasso inglese","END:VALARM","END:VEVENT","END:VCALENDAR" ].join("\r\n"),"text/calendar");
}
function importData(e){
  const f=e.target.files[0]; if(!f) return;
  f.text().then(t=>{ const d=JSON.parse(t); if(!d.cards||!d.settings) throw 0; S={ ...clone(DEFAULTS), ...d, settings:{ ...DEFAULTS.settings, ...d.settings } }; save(); toast("Backup importato."); render(); })
   .catch(()=>toast("File non valido."));
}

/* ---------------- Azioni ---------------- */
function armed(b,label){
  if(b.dataset.armed){ return true; }
  const old=b.textContent; b.dataset.armed="1"; b.textContent=label; b.classList.add("on");
  setTimeout(()=>{ if(document.body.contains(b)){ delete b.dataset.armed; b.textContent=old; b.classList.remove("on"); } },4000);
  return false;
}
function cur(){ return view()==="review" ? item(R.q[R.idx]) : item(L.ids[L.idx]); }
const ACTS={
  listen:()=>{ stopAll(); const my=runId; setPhase("Ascolto…"); play(cur(), +S.settings.rate, my).then(()=>{ if(my===runId) setPhase(""); }); },
  slow:()=>{ track(cur(),"slow"); stopAll(); const my=runId; setPhase("Ascolto lento…"); play(cur(), 0.7, my).then(()=>{ if(my===runId) setPhase(""); }); },
  shadow:()=>{ track(cur(),"shadows"); if(judgeOn()) mic().catch(()=>{}); shadowLoop(cur()); },
  stop:()=>stopAll(),
  ita:()=>{ const t=$("#it-text"); if(t){ t.hidden=!t.hidden; if(!t.hidden){ const ev=evOf(cur().id); ev.ita=(ev.ita||0)+1; } } },
  blind:()=>{ const e=$("#en-text"); if(e){ const on=!e.classList.contains("blind"); if(!on) revealed(cur()); e.classList.toggle("blind",on); if(!on){ const tb=$("#tech-box"); if(tb) tb.hidden=false; const it=cur(); const cb=$("#comp-box"); if(cb && it && it.tech && S.comp[it.id]==null) cb.hidden=false; } } },
  dict:()=>{ const b=$("#dict-box"); if(b){ b.hidden=!b.hidden; if(!b.hidden) $("#dict-in").focus(); } },
  dictcheck:()=>checkDict(cur()),
  comp:b=>{ const it=cur(); S.comp[it.id]=+b.dataset.v; save(); const cb=$("#comp-box"); if(cb) cb.innerHTML=`<p class="small muted">Registrato. Lo uso per scegliere i talk dei prossimi giorni.</p>`; },
  sayreuse:()=>{ const it=cur(); if(it&&it.x){ stopAll(); say(it.id+"r", it.x.reuse, +S.settings.rate, true); } },
  synth:()=>{ const it=cur(); stopAll(); const my=runId; setPhase("Voce sintetica…"); say(it.id, it.en, +S.settings.rate, true).then(()=>{ if(my===runId) setPhase(""); }); },
  rec:()=>toggleRecord(),
  me:()=>{ stopAll(); playMe(); },
  cmp:()=>compare(cur()),
  pron:()=>checkPron(cur()),
  prev:()=>{ if(L.idx>0){ L.idx--; renderLearn(); } },
  done:()=>learnDone(),
  reveal:()=>{ R.shown=true; renderReview(); const my=runId; play(cur(), +S.settings.rate, my); },
  grade:b=>grade(+b.dataset.g),
  ytload:()=>ytFormLoad(), ytA:()=>ytNow("#f-start"), ytB:()=>ytNow("#f-end"), yttry:()=>ytTry(), ytsave:()=>ytSave(),
  ytdel:b=>{ if(!armed(b,"Tocca di nuovo per eliminare")) return; S.yt=S.yt.filter(y=>y.id!==b.dataset.id); delete S.cards[b.dataset.id]; save(); vYT(); },
  ssave:()=>saveSettings(),
  stest:()=>{ saveSettings(); stopAll(); say("b2-03-1", "If I had known, I would have told you.", S.settings.rate, true); },
  ics:()=>ics(),
  export:()=>download(`shadowing-backup-${dayKey()}.json`, JSON.stringify(S,null,1), "application/json"),
  reset:b=>{ if(!armed(b,"Confermi? Tocca di nuovo per cancellare tutto")) return; S=clone(DEFAULTS); save(); render(); toast("Progressi azzerati."); },
  go:b=>go(b.dataset.to),
  ghsave:async()=>{ const repo=$("#s-ghrepo").value.trim(), tok=$("#s-ghtoken").value.trim();
    if(!/^[\w.-]+\/[\w.-]+$/.test(repo)){ toast("Scrivi il repository come utente/nome."); return; }
    lsSet("gh-repo",repo); if(tok) lsSet("gh-token",tok);
    if(!ghToken()){ toast("Incolla il token."); return; }
    await initSync(); toast(SYNC.gh?"Collegato a GitHub.":"Collegamento non riuscito: controlla nome del repository e permessi del token."); vSettings(); },
  ghoff:()=>{ lsSet("gh-token",""); SYNC.gh=false; syncLabel("Solo su questo dispositivo"); vSettings(); toast("Token rimosso da questo telefono."); },
  cumplay:b=>cumPlay(+b.dataset.from),
  firstrate:b=>{ if(!CUM) return; const f=fullOf(CUM.u.id); f[CUM.k]=Object.assign(f[CUM.k]||{}, { r0:+b.dataset.v, at0:Date.now() }); markActivity(); save(); stopAll(); toast("Registrato. Ora lo shadowing delle frasi."); go("unit/"+CUM.u.id); },
  czplay:b=>{ const it=CUM.cloze[+b.dataset.n], x=SENT[it.id]; stopAll(); playTimeline(CUM.u, x.x.ot, x.x.oe, runId); },
  czslow:b=>{ const it=CUM.cloze[+b.dataset.n], x=SENT[it.id]; stopAll(); say(x.id, x.en, 0.7, true); },
  czcheck:()=>clozeCheck(),
  cumgo:b=>{ go("cum/"+b.dataset.u); if(CUM) cumPlay(CUM.u.full[0][2]); },
  cumresume:()=>{ if(!CUM) return; const a0=CUM.a0 ?? CUM.u.full[0][2]; cumPlay(CUM.pos>a0+1 ? Math.max(a0,CUM.pos-2) : a0); },
  cumtx:b=>{ const x=$("#cum-tx"); x.hidden=!x.hidden; b.textContent=x.hidden?"📄 Mostra la trascrizione":"📄 Nascondi la trascrizione"; if(!x.hidden && CUM){ const f=fullOf(CUM.u.id); f["peek"+CUM.k]=true; } },
  cumrate:b=>{ if(!CUM) return; const { u, k }=CUM, f=fullOf(u.id), st=tedState(u);
    f[k]=Object.assign(f[k]||{}, { r:+b.dataset.v, at:Date.now(), peek: !!f["peek"+k] });
    if(!st.done && st.p.b===k){ st.p.b=k+1; st.p.day=dayKey(); }
    markActivity(); save(); stopAll();
    const fin=progOf(u).b>=u.full.length;
    $("#app").innerHTML=`<div class="card"><h1>${fin?"Hai ascoltato tutto il discorso":"Pezzo "+(k+1)+" completato"}</h1>
      ${f[k].r0!=null?`<p><b>Primo ascolto: ${["poco","metà","quasi tutto"][f[k].r0]} → riascolto: ${["poco","metà","quasi tutto"][f[k].r]}</b>${f[k].r>f[k].r0?" — lo shadowing ha funzionato.":f[k].r===f[k].r0?"":""}${f[k].cloze!=null?` · comprensione parole ${f[k].cloze}%`:""}</p>`:""}
      <p>${fin?"Da domani entra il prossimo talk. Le frasi studiate restano nei ripassi.":"Domani si apre il pezzo "+(k+2)+": primo ascolto, shadowing, comprensione e riascolto dall'inizio."}</p>
      <div class="row"><a class="btn pri" href="#" data-act="go" data-to="home">Oggi</a><a class="btn" href="#" data-act="go" data-to="unit/${u.id}">Il talk</a></div></div>`; },
  tedforce:b=>{ const u=UNITS[unitIdx(b.dataset.u)]; progOf(u).force=dayKey(); save(); vTedUnit(u); },
  frate:b=>{ const f=fullOf(b.dataset.u), k=b.dataset.k, tx=$("#ftx-"+k); f[k]={ r:+b.dataset.v, at:Date.now(), peek: !!(tx && !tx.hidden) || !!(f[k]&&f[k].peek) }; markActivity(); save();
    b.parentElement.querySelectorAll("button").forEach(x=>x.classList.toggle("on-ok", x===b)); toast("Registrato."); },
  ftx:b=>{ const x=$("#ftx-"+b.dataset.k); if(x){ x.hidden=!x.hidden; b.textContent=x.hidden?"📄 Trascrizione":"📄 Nascondi"; } },
  fplay:async b=>{ const u=UNITS[unitIdx(b.dataset.u)], k=+b.dataset.k, a=u.full[k][0], z=u.full[k+1]?u.full[k+1][0]:a+90; stopAll(); const my=runId; setPhase("Ascolto del blocco…"); await playSegment({ videoId:u.src.yt, start:a, end:z }, 1, my); if(my===runId) setPhase(""); },
  tr:b=>{ const all=document.querySelectorAll(".tr"); const show=[...all].some(x=>x.hidden); all.forEach(x=>x.hidden=!show); b.textContent=show?"🇮🇹 Nascondi traduzioni":"🇮🇹 Mostra traduzioni"; },
  drill:()=>{ const ids=aggregates().hardIds.slice(0,10); if(!ids.length) return; NAV={ v:"learn", arg:null }; L={ ids, idx:0, back:"stats", drill:true }; render(); }
};
document.addEventListener("click", e=>{ const b=e.target.closest("[data-act]"); if(!b||b.disabled) return; const f=ACTS[b.dataset.act]; if(f){ e.preventDefault(); f(b); } });

render();
initSync();
