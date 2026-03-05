import { useState, useEffect, useCallback } from "react";

const LIME = "#CCFF00";
const CARD = "#111111";
const BORDER = "#1e1e1e";
const DIM = "#4a4a4a";
const RED = "#FF4444";
const ORANGE = "#FF9500";
const BLUE = "#4A9EFF";

const PLAN = [
  { type:"rest",      label:"DESCANSO",        icon:"🛌", exercises:[] },
  { type:"gym",       label:"PECHO + TRÍCEPS", icon:"🏋️", exercises:[
    {id:"a1",name:"Press Banca Plano",        s:4,r:"8" },
    {id:"a2",name:"Press Inclinado Mancuerna",s:3,r:"10"},
    {id:"a3",name:"Aperturas Cable",          s:3,r:"12"},
    {id:"a4",name:"Tríceps Polea Alta",       s:3,r:"12"},
    {id:"a5",name:"Press Agarre Cerrado",     s:3,r:"10"},
  ]},
  { type:"gym",       label:"ESPALDA + BÍCEPS",icon:"💪", exercises:[
    {id:"b1",name:"Peso Muerto",              s:4,r:"6" },
    {id:"b2",name:"Remo con Barra",           s:4,r:"8" },
    {id:"b3",name:"Jalón al Pecho",           s:3,r:"10"},
    {id:"b4",name:"Curl con Barra",           s:3,r:"10"},
    {id:"b5",name:"Curl Inclinado",           s:3,r:"12"},
  ]},
  { type:"gym",       label:"PIERNAS",          icon:"🦵", exercises:[
    {id:"c1",name:"Sentadilla Libre",         s:5,r:"8" },
    {id:"c2",name:"Prensa 45°",              s:4,r:"10"},
    {id:"c3",name:"RDL con Barra",            s:3,r:"10"},
    {id:"c4",name:"Curl Femoral",             s:3,r:"12"},
    {id:"c5",name:"Elevación de Talones",     s:4,r:"20"},
  ]},
  { type:"gym",       label:"HOMBROS + CORE",  icon:"🎯", exercises:[
    {id:"d1",name:"Press Militar",            s:4,r:"8" },
    {id:"d2",name:"Elevaciones Laterales",    s:4,r:"15"},
    {id:"d3",name:"Face Pull Cable",          s:3,r:"15"},
    {id:"d4",name:"Plancha",                  s:3,r:"60s"},
    {id:"d5",name:"Colgado Elevación Piernas",s:3,r:"12"},
  ]},
  { type:"gym",       label:"FULL BODY",        icon:"⚡", exercises:[
    {id:"e1",name:"Hang Clean",               s:4,r:"5" },
    {id:"e2",name:"Dominadas",                s:4,r:"8" },
    {id:"e3",name:"Remo con Mancuerna",       s:3,r:"10"},
    {id:"e4",name:"Zancadas Caminando",       s:3,r:"12"},
    {id:"e5",name:"Rueda Abdominal",          s:3,r:"10"},
  ]},
  { type:"kickboxing",label:"KICKBOXING",       icon:"🥊", exercises:[] },
];

const SUPPS = [
  {id:"d3k2",   name:"D3 + K2",        note:"Con desayuno",             time:"morning"},
  {id:"omega3", name:"Omega-3",        note:"Con comida",               time:"morning"},
  {id:"zinc",   name:"Zinc + Selenio", note:"Con comida, no en ayunas", time:"morning"},
  {id:"colagen",name:"Colágeno",       note:"Con vitamina C",           time:"morning"},
  {id:"minoxam",name:"Minoxidil AM",   note:"Cuero cabelludo seco",     time:"morning"},
  {id:"creatin",name:"Creatina 5g",    note:"Antes de entrenar",        time:"prework"},
  {id:"electro",name:"Electrolitos",   note:"Antes / durante entreno",  time:"prework"},
  {id:"magnesi",name:"Mg Glicinato",   note:"30-60 min antes de dormir",time:"night"  },
  {id:"minoxpm",name:"Minoxidil PM",   note:"2a aplicación — crítico",  time:"night"  },
];

const DAY_NAMES = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
const todayStr = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const getDow = s => new Date(s+"T12:00:00").getDay();
const calcHours = (b,w) => { if(!b||!w) return null; const [bh,bm]=b.split(":").map(Number),[wh,wm]=w.split(":").map(Number); let m=(wh*60+wm)-(bh*60+bm); if(m<0)m+=1440; return (m/60).toFixed(1); };

const buildLog = d => {
  const plan = PLAN[getDow(d)];
  return { date:d, dayType:plan.type, status:plan.type==="rest"?"rest":"pending",
    exercises:plan.exercises.map(ex=>({id:ex.id,name:ex.name,status:"pending",moveToNext:false,
      sets:Array.from({length:ex.s},(_,i)=>({n:i+1,weight:"",reps:ex.r,done:false}))})),
    cardio:{done:false,type:"",mins:""}, supplements:{}, sleep:{bedtime:"",wake:"",ahi:"",hrv:""} };
};

const sg = async k => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):null; }catch{ return null; } };
const ss = async (k,v) => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

const getPast7 = async () => {
  const days=[]; const today=new Date();
  for(let i=6;i>=0;i--){
    const d=new Date(today); d.setDate(d.getDate()-i);
    const s=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const log=await sg(`jt:${s}`); days.push(log||buildLog(s));
  }
  return days;
};

const Chk = ({checked,onClick,size=24})=>(
  <div onClick={e=>{e.stopPropagation();onClick();}} style={{width:size,height:size,flexShrink:0,borderRadius:"50%",background:checked?LIME:"transparent",border:`2px solid ${checked?LIME:BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontWeight:700,fontSize:size*0.38,cursor:"pointer",transition:"all 0.15s"}}>
    {checked?"✓":""}
  </div>
);

const Ring = ({pct,color=LIME,size=70,stroke=6,label,sublabel}) => {
  const r=size/2-stroke; const circ=2*Math.PI*r; const dash=circ*(Math.min(pct,100)/100);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.25rem"}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct>0?color:"transparent"} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"JetBrains Mono, monospace",fontSize:size*0.19,fontWeight:700,color}}>{Math.round(pct)}%</div>
      </div>
      {label&&<div style={{fontSize:"0.55rem",color:DIM,letterSpacing:"0.1em"}}>{label}</div>}
      {sublabel&&<div style={{fontSize:"0.62rem",color,fontFamily:"JetBrains Mono, monospace"}}>{sublabel}</div>}
    </div>
  );
};

const Spark = ({data,color=LIME,h=32,w=120}) => {
  if(!data||data.length<2) return null;
  const max=Math.max(...data,0.01); const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v/max))*(h-6)+3}`).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-((data[data.length-1]/max))*(h-6)+3} r="2.5" fill={color}/>
    </svg>
  );
};

export default function App() {
  const [tab, setTab] = useState("dash");
  const [log, setLog] = useState(null);
  const [week, setWeek] = useState([]);
  const [ready, setReady] = useState(false);
  const [expandedEx, setExpandedEx] = useState(null);
  const [aiInsight, setAiInsight] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const date=todayStr(); const dow=getDow(date); const plan=PLAN[dow];

  useEffect(()=>{
    const el=document.createElement("style");
    el.textContent=`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#080808;color:#fff;font-family:'Barlow Condensed',sans-serif;}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;}input[type=number]{-moz-appearance:textfield;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#222;border-radius:2px;}input[type="time"]{color-scheme:dark;}`;
    document.head.appendChild(el); return()=>el.remove();
  },[]);

  useEffect(()=>{
    Promise.all([sg(`jt:${date}`),getPast7()]).then(([saved,w])=>{
      setLog(saved||buildLog(date)); setWeek(w); setReady(true);
    });
  },[]);

  useEffect(()=>{ if(log&&ready){ ss(`jt:${date}`,log); setWeek(prev=>prev.map(d=>d.date===date?log:d)); } },[log,ready]);

  const upd = fn => setLog(prev=>({...fn({...prev})}));

  const fetchAI = useCallback(async (currentLog, currentWeek) => {
    if(!currentLog||!currentWeek.length) return;
    setLoadingAI(true); setAiInsight("");
    const gymDays=currentWeek.filter(d=>d.dayType==="gym");
    const trained=gymDays.filter(d=>d.status==="trained").length;
    const missed=gymDays.filter(d=>d.status==="missed").length;
    const suppAvg=Math.round(currentWeek.reduce((acc,d)=>acc+(Object.values(d.supplements).filter(Boolean).length/SUPPS.length*100),0)/currentWeek.length);
    const ahiVals=currentWeek.map(d=>d.sleep.ahi).filter(Boolean).map(Number);
    const ahiAvg=ahiVals.length?(ahiVals.reduce((a,b)=>a+b,0)/ahiVals.length).toFixed(1):"sin datos";
    const hrsVals=currentWeek.map(d=>calcHours(d.sleep.bedtime,d.sleep.wake)).filter(Boolean).map(Number);
    const hrsAvg=hrsVals.length?(hrsVals.reduce((a,b)=>a+b,0)/hrsVals.length).toFixed(1):"sin datos";
    const hoySupp=Object.values(currentLog.supplements).filter(Boolean).length;
    const prompt=`Eres el coach personal de Jesús Tec, 35 años, CFO en Mérida México, entrenando objetivo físico Brad Pitt Troy (atlético, no voluminoso). Usa APAP, AHI baseline 4.10 target <2. Perfil stoico, alta exigencia. NO condescendas. Directo y brutal.\n\nDatos 7 días:\n- Gym: ${trained}/${gymDays.length} completados, ${missed} perdidos\n- Suplementos: ${suppAvg}% adherencia semanal, hoy ${hoySupp}/${SUPPS.length}\n- Sueño promedio: ${hrsAvg}h\n- AHI promedio: ${ahiAvg}\n- Hoy: ${plan.label}, estado: ${currentLog.status}\n\nMáximo 4 oraciones. 1 observación positiva real si la hay, 1 área crítica, 1 acción concreta para HOY. Sin emojis, sin bullets, habla de "tú" directo. Español.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setAiInsight(data.content?.[0]?.text||"Sin datos suficientes.");
    }catch{ setAiInsight("Error al conectar."); }
    setLoadingAI(false);
  },[plan]);

  useEffect(()=>{ if(ready&&log&&week.length) fetchAI(log,week); },[ready]);

  if(!ready||!log) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080808",color:LIME,fontSize:"1.1rem",letterSpacing:"0.35em",fontFamily:"Barlow Condensed,sans-serif"}}>CARGANDO...</div>
  );

  // Derived stats
  const gymDays=week.filter(d=>d.dayType==="gym");
  const trained=gymDays.filter(d=>d.status==="trained").length;
  const missed=gymDays.filter(d=>d.status==="missed").length;
  const trainPct=gymDays.length?Math.round(trained/gymDays.length*100):0;
  const suppPct=Math.round(week.reduce((acc,d)=>acc+(Object.values(d.supplements).filter(Boolean).length/SUPPS.length*100),0)/week.length);
  const suppToday=Object.values(log.supplements).filter(Boolean).length;
  const ahiVals=week.map(d=>d.sleep.ahi).filter(Boolean).map(Number);
  const ahiAvg=ahiVals.length?(ahiVals.reduce((a,b)=>a+b,0)/ahiVals.length).toFixed(1):null;
  const hrsVals=week.map(d=>calcHours(d.sleep.bedtime,d.sleep.wake)).filter(Boolean).map(Number);
  const hrsAvg=hrsVals.length?(hrsVals.reduce((a,b)=>a+b,0)/hrsVals.length).toFixed(1):null;
  const exDone=log.exercises.filter(e=>e.status==="done").length;
  const hours=calcHours(log.sleep.bedtime,log.sleep.wake);
  const ahiNum=parseFloat(log.sleep.ahi);
  const ahiColor=!log.sleep.ahi?DIM:ahiNum<2?LIME:ahiNum<=5?ORANGE:RED;
  const sm={pending:{color:ORANGE,label:"PENDIENTE"},trained:{color:LIME,label:"ENTRENADO ✓"},missed:{color:RED,label:"NO FUI ✗"},rest:{color:DIM,label:"DESCANSO"}}[log.status]||{color:ORANGE,label:"PENDIENTE"};

  // ─── DASHBOARD ───────────────────────────────────────────────────────────
  const dashView=(
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>

      {/* 3 rings */}
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"1.2rem"}}>
        <div style={{fontSize:"0.6rem",color:DIM,letterSpacing:"0.2em",marginBottom:"1rem"}}>SEMANA EN CURSO</div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          <Ring pct={trainPct} color={LIME}   size={72} label="ENTRENOS" sublabel={`${trained}/${gymDays.length}`}/>
          <Ring pct={suppPct}  color={BLUE}   size={72} label="SUPLS"    sublabel={`${suppPct}%`}/>
          <Ring pct={hrsAvg?Math.min(100,parseFloat(hrsAvg)/8*100):0} color={ORANGE} size={72} label="SUEÑO" sublabel={hrsAvg?`${hrsAvg}h`:"—"}/>
        </div>
      </div>

      {/* 7-day calendar dots */}
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"1rem"}}>
        <div style={{fontSize:"0.6rem",color:DIM,letterSpacing:"0.2em",marginBottom:"0.75rem"}}>ÚLTIMOS 7 DÍAS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"0.35rem"}}>
          {week.map((d,i)=>{
            const isToday=d.date===date;
            const dot=d.status==="trained"?LIME:d.status==="rest"?DIM:d.status==="missed"?RED:ORANGE;
            const bg=d.status==="trained"?`${LIME}18`:d.status==="rest"?`${DIM}0a`:d.status==="missed"?`${RED}18`:"#141414";
            const suppD=Object.values(d.supplements).filter(Boolean).length;
            return(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.22rem"}}>
                <div style={{fontSize:"0.52rem",color:isToday?LIME:DIM,fontWeight:isToday?700:400,letterSpacing:"0.04em"}}>{DAY_NAMES[getDow(d.date)]}</div>
                <div style={{width:"100%",aspectRatio:"1",borderRadius:"0.4rem",background:bg,border:`1px solid ${isToday?`${LIME}55`:BORDER}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:dot}}/>
                </div>
                <div style={{fontSize:"0.48rem",color:suppD===SUPPS.length?LIME:DIM,fontFamily:"JetBrains Mono,monospace"}}>{suppD}/{SUPPS.length}</div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:"0.85rem",marginTop:"0.65rem",flexWrap:"wrap"}}>
          {[[LIME,"Entrenado"],[RED,"No fui"],[DIM,"Descanso"],[ORANGE,"Pendiente"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:"0.28rem"}}><div style={{width:6,height:6,borderRadius:"50%",background:c}}/><div style={{fontSize:"0.52rem",color:DIM}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* KPI sparklines */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
        {[
          {label:"AHI PROM 7D",val:ahiAvg||"—",sub:"baseline 4.10 · target <2",color:ahiAvg?(parseFloat(ahiAvg)<2?LIME:parseFloat(ahiAvg)<=5?ORANGE:RED):"#fff",spark:ahiVals},
          {label:"SUEÑO PROM",val:hrsAvg?`${hrsAvg}h`:"—",sub:"target ≥7h",color:hrsAvg?(parseFloat(hrsAvg)>=7?LIME:parseFloat(hrsAvg)>=6?ORANGE:RED):"#fff",spark:hrsVals},
        ].map((k,i)=>(
          <div key={i} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.7rem",padding:"0.85rem"}}>
            <div style={{fontSize:"0.52rem",color:DIM,letterSpacing:"0.12em",marginBottom:"0.35rem"}}>{k.label}</div>
            <div style={{fontSize:"1.85rem",fontWeight:900,fontFamily:"JetBrains Mono,monospace",color:k.color,lineHeight:1}}>{k.val}</div>
            <div style={{marginTop:"0.45rem"}}><Spark data={k.spark} color={k.color} h={28} w={100}/></div>
            <div style={{fontSize:"0.56rem",color:DIM,marginTop:"0.3rem"}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerta adherencia */}
      {missed>=2&&(
        <div style={{background:`${RED}0e`,border:`1px solid ${RED}33`,borderRadius:"0.7rem",padding:"0.85rem",display:"flex",gap:"0.6rem",alignItems:"flex-start"}}>
          <div style={{fontSize:"1rem",flexShrink:0,marginTop:"0.1rem"}}>⚠</div>
          <div>
            <div style={{fontSize:"0.85rem",fontWeight:700,color:RED,letterSpacing:"0.04em"}}>ALERTA — {missed} DÍAS PERDIDOS</div>
            <div style={{fontSize:"0.75rem",color:"#ccc",marginTop:"0.2rem",lineHeight:1.5}}>El físico de Troy no se negocia con el gimnasio. Recupera el ritmo hoy.</div>
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div style={{background:CARD,border:`1px solid ${LIME}25`,borderRadius:"0.8rem",padding:"1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
          <div>
            <div style={{fontSize:"0.6rem",color:LIME,letterSpacing:"0.2em"}}>ANÁLISIS IA</div>
            <div style={{fontSize:"0.58rem",color:DIM,marginTop:"0.1rem"}}>Basado en tus últimos 7 días</div>
          </div>
          <button onClick={()=>fetchAI(log,week)} disabled={loadingAI}
            style={{background:"transparent",border:`1px solid ${BORDER}`,borderRadius:"0.35rem",padding:"0.22rem 0.65rem",color:loadingAI?DIM:LIME,fontSize:"0.62rem",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",transition:"color 0.2s"}}>
            {loadingAI?"ANALIZANDO...":"↻ ACTUALIZAR"}
          </button>
        </div>
        {loadingAI?(
          <div style={{display:"flex",gap:"0.4rem",alignItems:"center"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:LIME,animation:"pulse 1s infinite"}}/>
            <div style={{color:DIM,fontSize:"0.8rem",fontStyle:"italic"}}>Procesando tu semana...</div>
          </div>
        ):aiInsight?(
          <div style={{fontSize:"0.92rem",lineHeight:1.7,color:"#ddd",fontStyle:"normal"}}>{aiInsight}</div>
        ):(
          <div style={{color:DIM,fontSize:"0.78rem"}}>Registra algunos días para activar el análisis.</div>
        )}
      </div>

      {/* Estado de hoy + acciones rápidas */}
      <div style={{background:CARD,border:`1px solid ${sm.color}33`,borderRadius:"0.8rem",padding:"1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.65rem"}}>
          <div>
            <div style={{fontSize:"0.58rem",color:DIM,letterSpacing:"0.14em"}}>{plan.icon} HOY · {plan.label}</div>
            <span style={{marginTop:"0.3rem",display:"inline-block",padding:"0.18rem 0.65rem",borderRadius:"999px",background:`${sm.color}18`,border:`1px solid ${sm.color}`,color:sm.color,fontSize:"0.65rem",letterSpacing:"0.1em",fontWeight:700}}>{sm.label}</span>
          </div>
          <div style={{textAlign:"right"}}>
            {log.exercises.length>0&&<div style={{fontSize:"0.65rem",color:exDone===log.exercises.length&&log.exercises.length>0?LIME:DIM,fontFamily:"JetBrains Mono,monospace"}}>{exDone}/{log.exercises.length} ejercicios</div>}
            <div style={{fontSize:"1.6rem",fontWeight:900,fontFamily:"JetBrains Mono,monospace",color:suppToday===SUPPS.length?LIME:ORANGE,lineHeight:1}}>{suppToday}/{SUPPS.length}</div>
            <div style={{fontSize:"0.52rem",color:DIM,letterSpacing:"0.1em"}}>SUPLS HOY</div>
          </div>
        </div>
        {log.status==="pending"&&log.dayType!=="rest"&&(
          <div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>upd(l=>({...l,status:"trained"}))} style={{flex:1,padding:"0.7rem",background:`${LIME}12`,border:`1px solid ${LIME}`,color:LIME,borderRadius:"0.45rem",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.1em",cursor:"pointer"}}>✓ ENTRENADO</button>
            <button onClick={()=>upd(l=>({...l,status:"missed"}))}  style={{flex:1,padding:"0.7rem",background:`${RED}12`,border:`1px solid ${RED}`,color:RED,borderRadius:"0.45rem",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.1em",cursor:"pointer"}}>✗ NO FUI</button>
          </div>
        )}
        {log.status!=="pending"&&log.dayType!=="rest"&&(
          <button onClick={()=>upd(l=>({...l,status:"pending"}))} style={{width:"100%",padding:"0.45rem",background:"transparent",border:`1px solid ${BORDER}`,color:DIM,borderRadius:"0.4rem",fontFamily:"Barlow Condensed,sans-serif",fontSize:"0.7rem",letterSpacing:"0.1em",cursor:"pointer",marginTop:"0.4rem"}}>RESETEAR ESTADO</button>
        )}
      </div>
    </div>
  );

  // ─── ENTRENO ─────────────────────────────────────────────────────────────
  const entrenoView=(
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.7rem"}}>
      {log.dayType!=="rest"&&(
        <div style={{background:CARD,border:`1px solid ${log.cardio.done?`${LIME}44`:BORDER}`,borderRadius:"0.8rem",padding:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
            <div style={{fontSize:"0.7rem",color:DIM,letterSpacing:"0.16em"}}>CARDIO</div>
            <Chk checked={log.cardio.done} onClick={()=>upd(l=>({...l,cardio:{...l.cardio,done:!l.cardio.done}}))}/>
          </div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <input value={log.cardio.type} onChange={e=>upd(l=>({...l,cardio:{...l.cardio,type:e.target.value}}))} placeholder="Tipo (Correr, HIIT...)" style={{flex:2,background:"#161616",border:`1px solid ${BORDER}`,borderRadius:"0.35rem",padding:"0.5rem 0.75rem",color:"#fff",fontFamily:"JetBrains Mono,monospace",fontSize:"0.9rem",outline:"none"}}/>
            <input value={log.cardio.mins} onChange={e=>upd(l=>({...l,cardio:{...l.cardio,mins:e.target.value}}))} placeholder="min" type="number" style={{width:"70px",background:"#161616",border:`1px solid ${BORDER}`,borderRadius:"0.35rem",padding:"0.5rem",color:LIME,fontFamily:"JetBrains Mono,monospace",fontSize:"0.9rem",textAlign:"center",outline:"none"}}/>
          </div>
        </div>
      )}
      {log.exercises.length===0&&(
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"2.5rem 1rem",textAlign:"center"}}>
          <div style={{fontSize:"2.8rem"}}>{plan.icon}</div>
          <div style={{fontSize:"1.4rem",fontWeight:700,marginTop:"0.5rem"}}>{plan.label}</div>
          <div style={{fontSize:"0.8rem",color:DIM,marginTop:"0.3rem"}}>Sin pesas hoy — dale al cardio.</div>
        </div>
      )}
      {log.exercises.map((ex,ei)=>{
        const isOpen=expandedEx===ei; const sc=ex.status==="done"?LIME:ex.status==="skipped"?RED:"#fff";
        const setsDone=ex.sets.filter(s=>s.done).length;
        return(
          <div key={ex.id} style={{background:CARD,border:`1px solid ${ex.status==="done"?`${LIME}44`:ex.status==="skipped"?`${RED}33`:BORDER}`,borderRadius:"0.8rem",overflow:"hidden",opacity:ex.status==="skipped"?0.55:1,transition:"opacity 0.2s"}}>
            <div onClick={()=>setExpandedEx(isOpen?null:ei)} style={{padding:"0.9rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <div>
                <div style={{fontSize:"1.1rem",fontWeight:700,color:sc}}>{ex.name}</div>
                <div style={{fontSize:"0.6rem",color:DIM,marginTop:"0.15rem",fontFamily:"JetBrains Mono,monospace"}}>{ex.sets.length} SERIES · <span style={{color:setsDone===ex.sets.length&&setsDone>0?LIME:DIM}}>{setsDone}/{ex.sets.length}</span></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                {ex.status==="done"&&<span style={{color:LIME,fontSize:"1.1rem"}}>✓</span>}
                {ex.status==="skipped"&&<span style={{color:RED,fontSize:"0.65rem",letterSpacing:"0.08em"}}>SKIP</span>}
                <span style={{color:DIM,fontSize:"0.7rem"}}>{isOpen?"▲":"▼"}</span>
              </div>
            </div>
            {isOpen&&(
              <div style={{borderTop:`1px solid ${BORDER}`}}>
                <div style={{display:"grid",gridTemplateColumns:"1.6rem 1fr 1fr 1.8rem",gap:"0.4rem",padding:"0.4rem 1rem 0.2rem",fontSize:"0.58rem",color:DIM,letterSpacing:"0.13em"}}>
                  <div>#</div><div>KG</div><div>REPS</div><div/>
                </div>
                {ex.sets.map((set,si)=>(
                  <div key={si} style={{display:"grid",gridTemplateColumns:"1.6rem 1fr 1fr 1.8rem",gap:"0.4rem",padding:"0.32rem 1rem",alignItems:"center",background:set.done?`${LIME}08`:"transparent"}}>
                    <div style={{fontSize:"0.78rem",color:DIM,fontFamily:"JetBrains Mono,monospace"}}>{set.n}</div>
                    <input value={set.weight} type="number" placeholder="—" onChange={e=>upd(l=>({...l,exercises:l.exercises.map((x,xi)=>xi!==ei?x:{...x,sets:x.sets.map((s,ssi)=>ssi!==si?s:{...s,weight:e.target.value})})}))} style={{background:"#161616",border:`1px solid ${set.done?`${LIME}44`:BORDER}`,borderRadius:"0.35rem",padding:"0.45rem",color:LIME,fontFamily:"JetBrains Mono,monospace",fontSize:"0.9rem",textAlign:"center",outline:"none"}}/>
                    <input value={set.reps} placeholder="—" onChange={e=>upd(l=>({...l,exercises:l.exercises.map((x,xi)=>xi!==ei?x:{...x,sets:x.sets.map((s,ssi)=>ssi!==si?s:{...s,reps:e.target.value})})}))} style={{background:"#161616",border:`1px solid ${set.done?`${LIME}44`:BORDER}`,borderRadius:"0.35rem",padding:"0.45rem",color:"#fff",fontFamily:"JetBrains Mono,monospace",fontSize:"0.9rem",textAlign:"center",outline:"none"}}/>
                    <Chk size={22} checked={set.done} onClick={()=>upd(l=>({...l,exercises:l.exercises.map((x,xi)=>{if(xi!==ei)return x;const ns=x.sets.map((s,ssi)=>ssi!==si?s:{...s,done:!s.done});return{...x,sets:ns,status:ns.every(s=>s.done)?"done":"pending"};})}))}/>
                  </div>
                ))}
                <div style={{padding:"0.6rem 1rem",borderTop:`1px solid ${BORDER}`,display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                  <button onClick={()=>upd(l=>({...l,exercises:l.exercises.map((x,xi)=>xi!==ei?x:{...x,status:x.status==="skipped"?"pending":"skipped",moveToNext:false})}))} style={{padding:"0.32rem 0.7rem",background:"transparent",border:`1px solid ${ex.status==="skipped"?LIME:RED}`,color:ex.status==="skipped"?LIME:RED,borderRadius:"0.35rem",fontSize:"0.68rem",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:"0.1em",cursor:"pointer"}}>
                    {ex.status==="skipped"?"↩ RESTAURAR":"✗ SKIP"}
                  </button>
                  {ex.status==="skipped"&&(
                    <button onClick={()=>upd(l=>({...l,exercises:l.exercises.map((x,xi)=>xi!==ei?x:{...x,moveToNext:!x.moveToNext})}))} style={{padding:"0.32rem 0.7rem",background:ex.moveToNext?`${ORANGE}18`:"transparent",border:`1px solid ${ORANGE}`,color:ORANGE,borderRadius:"0.35rem",fontSize:"0.68rem",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:"0.1em",cursor:"pointer"}}>
                      {ex.moveToNext?"✓ AL SIGUIENTE":"→ MOVER SIGUIENTE"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ─── SUPLEMENTOS ─────────────────────────────────────────────────────────
  const supleView=(()=>{
    const sects=[{key:"morning",label:"☀️  MAÑANA",items:SUPPS.filter(s=>s.time==="morning")},{key:"prework",label:"⚡  PRE-ENTRENO",items:SUPPS.filter(s=>s.time==="prework")},{key:"night",label:"🌙  NOCHE",items:SUPPS.filter(s=>s.time==="night")}];
    const toggle=id=>upd(l=>({...l,supplements:{...l.supplements,[id]:!l.supplements[id]}}));
    return(
      <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.7rem"}}>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}>
            <div style={{fontSize:"0.65rem",color:DIM,letterSpacing:"0.16em"}}>HOY</div>
            <div style={{fontSize:"0.78rem",fontFamily:"JetBrains Mono,monospace",color:suppToday===SUPPS.length?LIME:"#fff"}}>{suppToday}/{SUPPS.length}</div>
          </div>
          <div style={{background:"#1a1a1a",borderRadius:"999px",height:"5px",marginBottom:"0.55rem"}}>
            <div style={{height:"100%",width:`${suppToday/SUPPS.length*100}%`,background:LIME,borderRadius:"999px",transition:"width 0.3s"}}/>
          </div>
          <div style={{display:"flex",gap:"0.35rem",flexWrap:"wrap"}}>
            {SUPPS.map(s=>(<div key={s.id} style={{width:8,height:8,borderRadius:"50%",background:log.supplements[s.id]?LIME:"#222",transition:"background 0.2s"}}/>))}
          </div>
        </div>
        {sects.map(sec=>{
          const sd=sec.items.filter(s=>log.supplements[s.id]).length;
          return(
            <div key={sec.key} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",overflow:"hidden"}}>
              <div style={{padding:"0.7rem 1rem",borderBottom:`1px solid ${BORDER}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"0.88rem",fontWeight:700,letterSpacing:"0.08em"}}>{sec.label}</div>
                <div style={{fontSize:"0.7rem",fontFamily:"JetBrains Mono,monospace",color:sd===sec.items.length?LIME:DIM}}>{sd}/{sec.items.length}</div>
              </div>
              {sec.items.map((sup,i)=>{
                const chk=!!log.supplements[sup.id];
                return(
                  <div key={sup.id} onClick={()=>toggle(sup.id)} style={{padding:"0.78rem 1rem",display:"flex",alignItems:"center",gap:"0.8rem",cursor:"pointer",borderBottom:i<sec.items.length-1?`1px solid ${BORDER}`:"none",background:chk?`${LIME}07`:"transparent",transition:"background 0.15s"}}>
                    <Chk checked={chk} onClick={()=>toggle(sup.id)}/>
                    <div>
                      <div style={{fontSize:"1rem",color:chk?LIME:"#fff",fontWeight:chk?600:400,transition:"color 0.15s"}}>{sup.name}</div>
                      <div style={{fontSize:"0.67rem",color:DIM,marginTop:"0.1rem"}}>{sup.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  })();

  // ─── SUEÑO ───────────────────────────────────────────────────────────────
  const suenoView=(()=>{
    const su=(f,v)=>upd(l=>({...l,sleep:{...l.sleep,[f]:v}}));
    const ahi=parseFloat(log.sleep.ahi); const ahiC=!log.sleep.ahi?DIM:ahi<2?LIME:ahi<=5?ORANGE:RED;
    const ahiL=!log.sleep.ahi?null:ahi<2?"ÓPTIMO":ahi<=5?"ACEPTABLE":"ALTO";
    const hrsColor=!hours?"#fff":parseFloat(hours)>=7?LIME:parseFloat(hours)>=6?ORANGE:RED;
    return(
      <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.7rem"}}>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"1rem"}}>
          <div style={{fontSize:"0.65rem",color:DIM,letterSpacing:"0.16em",marginBottom:"0.85rem"}}>HORARIO</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
            {[["bedtime","DORMÍ"],["wake","DESPERTÉ"]].map(([f,lbl])=>(
              <div key={f}><div style={{fontSize:"0.6rem",color:DIM,marginBottom:"0.3rem",letterSpacing:"0.12em"}}>{lbl}</div>
              <input type="time" value={log.sleep[f]} onChange={e=>su(f,e.target.value)} style={{width:"100%",background:"#161616",border:`1px solid ${BORDER}`,borderRadius:"0.4rem",padding:"0.6rem 0.5rem",color:"#fff",fontFamily:"JetBrains Mono,monospace",fontSize:"1rem",outline:"none"}}/></div>
            ))}
          </div>
          {hours&&(
            <div style={{marginTop:"0.85rem",padding:"0.85rem",background:"#161616",borderRadius:"0.5rem",textAlign:"center",border:`1px solid ${hrsColor}33`}}>
              <div style={{fontSize:"3rem",fontWeight:900,fontFamily:"JetBrains Mono,monospace",color:hrsColor,lineHeight:1}}>{hours}<span style={{fontSize:"1.2rem"}}>h</span></div>
              <div style={{fontSize:"0.6rem",color:DIM,letterSpacing:"0.15em",marginTop:"0.3rem"}}>TOTAL SUEÑO</div>
            </div>
          )}
        </div>
        <div style={{background:CARD,border:`1px solid ${log.sleep.ahi?`${ahiC}44`:BORDER}`,borderRadius:"0.8rem",padding:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem"}}>
            <div><div style={{fontSize:"0.65rem",color:DIM,letterSpacing:"0.16em"}}>IAH / AHI</div><div style={{fontSize:"0.6rem",color:DIM,marginTop:"0.12rem"}}>Del reporte myAir</div></div>
            {ahiL&&<span style={{padding:"0.2rem 0.65rem",background:`${ahiC}1a`,border:`1px solid ${ahiC}`,color:ahiC,borderRadius:"999px",fontSize:"0.65rem",letterSpacing:"0.1em",fontWeight:700}}>{ahiL}</span>}
          </div>
          <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
            <input type="number" step="0.1" value={log.sleep.ahi} onChange={e=>su("ahi",e.target.value)} placeholder="0.0" style={{flex:1,background:"#161616",border:`1px solid ${BORDER}`,borderRadius:"0.4rem",padding:"0.7rem",color:ahiC,fontFamily:"JetBrains Mono,monospace",fontSize:"1.8rem",textAlign:"center",outline:"none"}}/>
            <div style={{fontSize:"0.68rem",color:DIM,lineHeight:1.9}}><div><span style={{color:LIME}}>{"<"} 2</span> óptimo</div><div><span style={{color:ORANGE}}>2–5</span> aceptable</div><div><span style={{color:RED}}>{">"} 5</span> alto</div></div>
          </div>
          {ahiVals.length>1&&<div style={{marginTop:"0.7rem"}}><Spark data={ahiVals} color={ahiColor} h={32} w={200}/></div>}
          <div style={{marginTop:"0.5rem",fontSize:"0.63rem",color:DIM}}>Promedio 30d: <span style={{color:ORANGE}}>4.10</span> · Target: <span style={{color:LIME}}>{"<"} 2.0</span></div>
        </div>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"1rem"}}>
          <div style={{fontSize:"0.65rem",color:DIM,letterSpacing:"0.16em",marginBottom:"0.75rem"}}>HRV MATUTINO</div>
          <input type="number" value={log.sleep.hrv} onChange={e=>su("hrv",e.target.value)} placeholder="ms" style={{width:"100%",background:"#161616",border:`1px solid ${BORDER}`,borderRadius:"0.4rem",padding:"0.7rem",color:"#fff",fontFamily:"JetBrains Mono,monospace",fontSize:"1.8rem",textAlign:"center",outline:"none"}}/>
          {hrsVals.length>1&&<div style={{marginTop:"0.7rem"}}><Spark data={hrsVals} color={ORANGE} h={32} w={200}/></div>}
          <div style={{marginTop:"0.4rem",fontSize:"0.63rem",color:DIM}}>Del reloj · Indicador de recuperación y readiness</div>
        </div>
      </div>
    );
  })();

  // ─── NAV ─────────────────────────────────────────────────────────────────
  const TABS=[{id:"dash",label:"DASH",icon:"◈"},{id:"entreno",label:"GYM",icon:"◉"},{id:"suple",label:"SUPLS",icon:"◎"},{id:"sueno",label:"SUEÑO",icon:"◐"}];

  return(
    <div style={{maxWidth:"440px",margin:"0 auto",minHeight:"100vh",background:"#080808",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"0.9rem 1rem 0.6rem",background:"#080808",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${BORDER}`}}>
        <div style={{fontSize:"0.52rem",color:"#252525",letterSpacing:"0.35em"}}>JT · PERFORMANCE TRACKER</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:"0.12rem"}}>
          <div style={{fontSize:"1.95rem",fontWeight:900,letterSpacing:"0.04em",lineHeight:1.1}}>
            {DAY_NAMES[dow]} <span style={{color:sm.color,fontSize:"0.95rem",fontWeight:600,letterSpacing:"0.02em"}}>· {sm.label}</span>
          </div>
          <div style={{fontSize:"0.62rem",color:DIM,fontFamily:"JetBrains Mono,monospace"}}>{date}</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",paddingBottom:"5.5rem"}}>
        {tab==="dash"    && dashView}
        {tab==="entreno" && entrenoView}
        {tab==="suple"   && supleView}
        {tab==="sueno"   && suenoView}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"440px",background:"#0b0b0b",borderTop:`1px solid ${BORDER}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"0.55rem 0 0.85rem"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem",padding:"0.25rem"}}>
            <div style={{fontSize:"0.95rem",color:tab===t.id?LIME:DIM,transition:"color 0.2s"}}>{t.icon}</div>
            <div style={{fontSize:"0.58rem",letterSpacing:"0.1em",color:tab===t.id?LIME:DIM,fontWeight:tab===t.id?700:400,fontFamily:"Barlow Condensed,sans-serif",transition:"color 0.2s"}}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
