import { useState, useEffect, useCallback } from "react";

const LIME = "#CCFF00";
const CARD = "#111111";
const BORDER = "#1e1e1e";
const DIM = "#4a4a4a";
const RED = "#FF4444";
const ORANGE = "#FF9500";
const BLUE = "#4A9EFF";

const PLAN = [
  { type:"rest",       label:"DESCANSO",             icon:"🛌", exercises:[] },
  { type:"gym",        label:"PIERNA",               icon:"🦵", exercises:[
    {id:"l1",name:"Sentadilla en Smith",                         s:4, r:"12/10/8/6",  note:"Piramidal · Muslo paralelo al piso · Descanso 90s"},
    {id:"l2",name:"Prensa 45° + Extensión Cuáds (BISERIE)",      s:4, r:"12+15",      note:"Sin descanso entre ejercicios · Descanso 75s entre rondas"},
    {id:"l3",name:"Curl Femoral + Desplantes Caminando (BISERIE)",s:3, r:"12+12",     note:"Sin descanso entre ejercicios · Descanso 75s entre rondas"},
    {id:"l4",name:"Goblet + Pantorrillas + Plancha (TRISERIE)",  s:3, r:"15+20+45s", note:"Sin descanso entre ejercicios · Descanso 90s entre rondas"},
  ]},
  { type:"gym",        label:"PECHO + HOMBRO + TRÍCEPS", icon:"🏋️", exercises:[
    {id:"p1",name:"Press Plano (Máquina Matrix o Barra)",        s:4, r:"12/10/8/6", note:"Piramidal · +2-3 kg vs semana pasada · Descanso 90s"},
    {id:"p2",name:"Press Inclinado + Pec Fly (BISERIE)",         s:3, r:"10+15",     note:"Squeeze 2s en pec fly · Descanso 75s entre rondas"},
    {id:"p3",name:"Press Militar + Laterales + Pájaros (TRISERIE)", s:3, r:"10+15+15", note:"3 cabezas deltoides · Descanso 90s entre rondas"},
    {id:"p4",name:"Fondos Máquina + Extensión Polea (BISERIE)",  s:3, r:"12+15",     note:"Sin descanso entre ejercicios · Descanso 60s entre rondas"},
  ]},
  { type:"gym",        label:"ESPALDA + BÍCEPS",      icon:"💪", exercises:[
    {id:"e1",name:"Jalón al Pecho Polea Alta",                   s:4, r:"12/10/8/6", note:"Piramidal · Agarre ancho · Aprieta omóplatos · Descanso 90s"},
    {id:"e2",name:"Remo en Máquina",                             s:4, r:"10",        note:"Pecho contra pad · Jala al ombligo · Squeeze 1s · Descanso 75s"},
    {id:"e3",name:"Remo Mancuerna a Una Mano",                   s:3, r:"12c/lado",  note:"Rodilla y mano en banco · Jala hacia cadera · Descanso 60s"},
    {id:"e4",name:"Jalón Agarre Cerrado (Triángulo)",            s:3, r:"12",        note:"Grosor espalda media · Descanso 60s"},
    {id:"e5",name:"Hiperextensiones 45°",                        s:3, r:"15",        note:"Aprieta glúteos y espalda arriba · Sin peso extra"},
    {id:"e6",name:"Curl Barra Z de Pie",                         s:3, r:"10",        note:"Sin balancear torso · Descanso 60s"},
    {id:"e7",name:"Curl Mancuernas Alterno Sentado",             s:3, r:"12c/brazo", note:"Banco 90° para no hacer trampa · Descanso 45s"},
  ]},
  { type:"gym",        label:"HOMBROS + CORE",        icon:"🎯", exercises:[
    {id:"h1",name:"Press Militar Smith",                         s:4, r:"12/10/8/6", note:"Piramidal · Press pesado del día · Descanso 90s"},
    {id:"h2",name:"Elevaciones Laterales",                       s:4, r:"15",        note:"Técnica estricta · Sin impulso · Descanso 45s"},
    {id:"h3",name:"Elevaciones Frontales con Disco",             s:3, r:"12",        note:"Disco 10-15kg · Sube a altura de ojos · Descanso 60s"},
    {id:"h4",name:"Pájaros Rear Delt",                           s:3, r:"15",        note:"Inclinado · Abre brazos · Peso ligero · Descanso 45s"},
    {id:"h5",name:"Plancha Frontal",                             s:3, r:"45s",       note:"Si aguantas más, aguanta más · Descanso 45s"},
    {id:"h6",name:"Crunches con Peso en Pecho",                  s:3, r:"20",        note:"Disco 10-15kg · Omóplatos se despegan del piso · Descanso 45s"},
    {id:"h7",name:"Elevación de Piernas Colgado",                s:3, r:"15",        note:"En silla romana o barra · Descanso 45s"},
    {id:"h8",name:"Plancha Lateral",                             s:2, r:"30s c/lado",note:"Oblicuos · Descanso 30s"},
  ]},
  { type:"gym",        label:"PIERNA (x2)",           icon:"🔥", exercises:[
    {id:"l2a",name:"Sentadilla Libre",                           s:4, r:"12/10/8/6", note:"Piramidal · Baja hasta paralelo · Descanso 90s"},
    {id:"l2b",name:"Prensa 45° + RDL (BISERIE)",                 s:4, r:"10+10",     note:"Prensa → directo a RDL · Descanso 75s entre rondas"},
    {id:"l2c",name:"Curl Femoral Acostado",                      s:3, r:"12",        note:"Controlado en bajada · Explosivo en subida · Descanso 60s"},
    {id:"l2d",name:"Zancadas Caminando",                         s:3, r:"12c/pierna",note:"Paso largo para glúteo · Descanso 60s"},
    {id:"l2e",name:"Elevación Pantorrillas Prensa",              s:4, r:"20",        note:"Talón abajo máximo · 2s arriba · Descanso 45s"},
  ]},
  { type:"active",     label:"DESCANSO ACTIVO",       icon:"🚶", exercises:[] },
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
  return { date:d, dayType:plan.type, status:(plan.type==="rest"||plan.type==="active")?"rest":"pending",
    exercises:plan.exercises.map(ex=>({id:ex.id,name:ex.name,status:"pending",moveToNext:false,note:ex.note||"",
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

const generateInsight = (log, week, plan) => {
  const gymDays = week.filter(d => d.dayType === "gym");
  const trained = gymDays.filter(d => d.status === "trained").length;
  const missed = gymDays.filter(d => d.status === "missed").length;
  const suppVals = week.map(d => Object.values(d.supplements).filter(Boolean).length);
  const suppAvg = Math.round(suppVals.reduce((a,b)=>a+b,0) / week.length);
  const ahiVals = week.map(d=>d.sleep.ahi).filter(Boolean).map(Number);
  const ahiAvg = ahiVals.length ? (ahiVals.reduce((a,b)=>a+b,0)/ahiVals.length) : null;
  const hrsVals = week.map(d=>calcHours(d.sleep.bedtime,d.sleep.wake)).filter(Boolean).map(Number);
  const hrsAvg = hrsVals.length ? (hrsVals.reduce((a,b)=>a+b,0)/hrsVals.length) : null;
  const suppToday = Object.values(log.supplements).filter(Boolean).length;

  const lines = [];

  // Entrenos
  if (gymDays.length === 0 || (trained === 0 && missed === 0)) {
    lines.push("Semana sin datos suficientes de entreno — empieza a registrar hoy.");
  } else if (trained === gymDays.length) {
    lines.push(`Semana perfecta: ${trained}/${gymDays.length} entrenos completados.`);
  } else if (missed >= 2) {
    lines.push(`${missed} entrenos perdidos esta semana — el físico de Troy no se negocia. Recupera el ritmo hoy.`);
  } else if (trained > 0) {
    lines.push(`${trained}/${gymDays.length} entrenos completados. Consistencia aceptable, pero hay margen.`);
  }

  // Suplementos
  if (suppToday === 0) {
    lines.push("Suplementos de hoy: ninguno registrado. El minoxidil PM es lo más crítico si ya es noche.");
  } else if (suppToday < 5) {
    lines.push(`Suplementos hoy: ${suppToday}/9. Verifica si falta el magnesio glicinato antes de dormir.`);
  } else if (suppToday === SUPPS.length) {
    lines.push("Stack de suplementos completo hoy. Así se mantiene la consistencia.");
  }

  // Sueño / AHI
  if (ahiAvg !== null) {
    if (ahiAvg < 2) {
      lines.push(`AHI promedio ${ahiAvg.toFixed(1)} — por debajo del target de 2.0. El APAP está funcionando.`);
    } else if (ahiAvg <= 5) {
      lines.push(`AHI promedio ${ahiAvg.toFixed(1)} — aceptable pero sobre tu baseline de 4.10. Revisa posición al dormir.`);
    } else {
      lines.push(`AHI promedio ${ahiAvg.toFixed(1)} — por encima de 5. Contacta a tu médico si persiste.`);
    }
  }

  if (hrsAvg !== null) {
    if (hrsAvg < 6.5) {
      lines.push(`Promedio de sueño ${hrsAvg}h — insuficiente para recuperación muscular. El músculo crece mientras duermes.`);
    } else if (hrsAvg >= 7.5) {
      lines.push(`Sueño promedio ${hrsAvg}h — excelente. La recuperación está optimizada.`);
    }
  }

  // Acción de hoy
  if (log.dayType === "gym" && log.status === "pending") {
    lines.push(`Hoy toca ${plan.label}. Pendiente de registrar.`);
  } else if (log.dayType === "active") {
    lines.push("Hoy es descanso activo. Sal a caminar 40-45 min — quema grasa sin generar fatiga.");
  }

  return lines.slice(0, 4).join(" ");
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
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"JetBrains Mono,monospace",fontSize:size*0.19,fontWeight:700,color}}>{Math.round(pct)}%</div>
      </div>
      {label&&<div style={{fontSize:"0.55rem",color:DIM,letterSpacing:"0.1em"}}>{label}</div>}
      {sublabel&&<div style={{fontSize:"0.62rem",color,fontFamily:"JetBrains Mono,monospace"}}>{sublabel}</div>}
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

  useEffect(()=>{
    if(ready&&log&&week.length){
      setAiInsight(generateInsight(log, week, plan));
    }
  },[ready, log, week]);

  const upd = fn => setLog(prev=>({...fn({...prev})}));

  if(!ready||!log) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080808",color:LIME,fontSize:"1.1rem",letterSpacing:"0.35em",fontFamily:"Barlow Condensed,sans-serif"}}>CARGANDO...</div>
  );

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

  const dashView=(
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"1.2rem"}}>
        <div style={{fontSize:"0.6rem",color:DIM,letterSpacing:"0.2em",marginBottom:"1rem"}}>SEMANA EN CURSO</div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          <Ring pct={trainPct} color={LIME} size={72} label="ENTRENOS" sublabel={`${trained}/${gymDays.length}`}/>
          <Ring pct={suppPct}  color={BLUE} size={72} label="SUPLS"    sublabel={`${suppPct}%`}/>
          <Ring pct={hrsAvg?Math.min(100,parseFloat(hrsAvg)/8*100):0} color={ORANGE} size={72} label="SUEÑO" sublabel={hrsAvg?`${hrsAvg}h`:"—"}/>
        </div>
      </div>
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
                <div style={{fontSize:"0.52rem",color:isToday?LIME:DIM,fontWeight:isToday?700:400}}>{DAY_NAMES[getDow(d.date)]}</div>
                <div style={{width:"100%",aspectRatio:"1",borderRadius:"0.4rem",background:bg,border:`1px solid ${isToday?`${LIME}55`:BORDER}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:dot}}/>
                </div>
                <div style={{fontSize:"0.48rem",color:suppD===SUPPS.length?LIME:DIM,fontFamily:"JetBrains Mono,monospace"}}>{suppD}/{SUPPS.length}</div>
              </div>
            );
          })}
        </div>
      </div>
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
      {missed>=2&&(
        <div style={{background:`${RED}0e`,border:`1px solid ${RED}33`,borderRadius:"0.7rem",padding:"0.85rem",display:"flex",gap:"0.6rem",alignItems:"flex-start"}}>
          <div style={{fontSize:"1rem",flexShrink:0,marginTop:"0.1rem"}}>⚠</div>
          <div>
            <div style={{fontSize:"0.85rem",fontWeight:700,color:RED,letterSpacing:"0.04em"}}>ALERTA — {missed} DÍAS PERDIDOS</div>
            <div style={{fontSize:"0.75rem",color:"#ccc",marginTop:"0.2rem",lineHeight:1.5}}>El físico de Troy no se negocia. Recupera el ritmo hoy.</div>
          </div>
        </div>
      )}
      <div style={{background:CARD,border:`1px solid ${LIME}25`,borderRadius:"0.8rem",padding:"1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
          <div>
            <div style={{fontSize:"0.6rem",color:LIME,letterSpacing:"0.2em"}}>ANÁLISIS</div>
            <div style={{fontSize:"0.58rem",color:DIM,marginTop:"0.1rem"}}>Basado en tus últimos 7 días</div>
          </div>
        </div>
        {aiInsight
          ?(<div style={{fontSize:"0.92rem",lineHeight:1.7,color:"#ddd"}}>{aiInsight}</div>)
          :(<div style={{color:DIM,fontSize:"0.78rem"}}>Registra algunos días para activar el análisis.</div>)}
      </div>
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
        {log.status==="pending"&&log.dayType==="gym"&&(
          <div style={{display:"flex",gap:"0.5rem"}}>
            <button onClick={()=>upd(l=>({...l,status:"trained"}))} style={{flex:1,padding:"0.7rem",background:`${LIME}12`,border:`1px solid ${LIME}`,color:LIME,borderRadius:"0.45rem",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.1em",cursor:"pointer"}}>✓ ENTRENADO</button>
            <button onClick={()=>upd(l=>({...l,status:"missed"}))}  style={{flex:1,padding:"0.7rem",background:`${RED}12`,border:`1px solid ${RED}`,color:RED,borderRadius:"0.45rem",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.1em",cursor:"pointer"}}>✗ NO FUI</button>
          </div>
        )}
        {log.status!=="pending"&&log.dayType==="gym"&&(
          <button onClick={()=>upd(l=>({...l,status:"pending"}))} style={{width:"100%",padding:"0.45rem",background:"transparent",border:`1px solid ${BORDER}`,color:DIM,borderRadius:"0.4rem",fontFamily:"Barlow Condensed,sans-serif",fontSize:"0.7rem",letterSpacing:"0.1em",cursor:"pointer",marginTop:"0.4rem"}}>RESETEAR ESTADO</button>
        )}
      </div>
    </div>
  );

  const entrenoView=(
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"0.7rem"}}>
      {log.dayType==="gym"&&(
        <div style={{background:CARD,border:`1px solid ${log.cardio.done?`${LIME}44`:BORDER}`,borderRadius:"0.8rem",padding:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
            <div>
              <div style={{fontSize:"0.7rem",color:DIM,letterSpacing:"0.16em"}}>CARDIO</div>
              <div style={{fontSize:"0.62rem",color:DIM,marginTop:"0.1rem"}}>Caminadora inclinación 10 · velocidad 5.5</div>
            </div>
            <Chk checked={log.cardio.done} onClick={()=>upd(l=>({...l,cardio:{...l.cardio,done:!l.cardio.done}}))}/>
          </div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <input value={log.cardio.type} onChange={e=>upd(l=>({...l,cardio:{...l.cardio,type:e.target.value}}))} placeholder="Tipo (Caminadora, HIIT...)" style={{flex:2,background:"#161616",border:`1px solid ${BORDER}`,borderRadius:"0.35rem",padding:"0.5rem 0.75rem",color:"#fff",fontFamily:"JetBrains Mono,monospace",fontSize:"0.9rem",outline:"none"}}/>
            <input value={log.cardio.mins} onChange={e=>upd(l=>({...l,cardio:{...l.cardio,mins:e.target.value}}))} placeholder="min" type="number" style={{width:"70px",background:"#161616",border:`1px solid ${BORDER}`,borderRadius:"0.35rem",padding:"0.5rem",color:LIME,fontFamily:"JetBrains Mono,monospace",fontSize:"0.9rem",textAlign:"center",outline:"none"}}/>
          </div>
        </div>
      )}
      {log.exercises.length===0&&(
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"0.8rem",padding:"2.5rem 1rem",textAlign:"center"}}>
          <div style={{fontSize:"2.8rem"}}>{plan.icon}</div>
          <div style={{fontSize:"1.4rem",fontWeight:700,marginTop:"0.5rem"}}>{plan.label}</div>
          <div style={{fontSize:"0.8rem",color:DIM,marginTop:"0.3rem",lineHeight:1.7}}>
            {plan.type==="rest"&&"Recuperación total. Duerme bien y deja que el músculo crezca."}
            {plan.type==="active"&&"Sal a caminar 40-45 minutos a paso moderado.\nSin inclinación forzada, sin gym, al aire libre.\nQuema grasa sin generar fatiga nueva."}
          </div>
        </div>
      )}
      {log.exercises.map((ex,ei)=>{
        const isOpen=expandedEx===ei; const sc=ex.status==="done"?LIME:ex.status==="skipped"?RED:"#fff";
        const setsDone=ex.sets.filter(s=>s.done).length;
        const planEx=plan.exercises.find(p=>p.id===ex.id);
        return(
          <div key={ex.id} style={{background:CARD,border:`1px solid ${ex.status==="done"?`${LIME}44`:ex.status==="skipped"?`${RED}33`:BORDER}`,borderRadius:"0.8rem",overflow:"hidden",opacity:ex.status==="skipped"?0.55:1,transition:"opacity 0.2s"}}>
            <div onClick={()=>setExpandedEx(isOpen?null:ei)} style={{padding:"0.9rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <div style={{flex:1,paddingRight:"0.5rem"}}>
                <div style={{fontSize:"1rem",fontWeight:700,color:sc,lineHeight:1.25}}>{ex.name}</div>
                {planEx?.note&&<div style={{fontSize:"0.58rem",color:DIM,marginTop:"0.25rem",lineHeight:1.4}}>{planEx.note}</div>}
                <div style={{fontSize:"0.6rem",color:DIM,marginTop:"0.2rem",fontFamily:"JetBrains Mono,monospace"}}>{ex.sets.length} SERIES · <span style={{color:setsDone===ex.sets.length&&setsDone>0?LIME:DIM}}>{setsDone}/{ex.sets.length}</span></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexShrink:0}}>
                {ex.status==="done"&&<span style={{color:LIME,fontSize:"1.1rem"}}>✓</span>}
                {ex.status==="skipped"&&<span style={{color:RED,fontSize:"0.65rem"}}>SKIP</span>}
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

  const TABS=[{id:"dash",label:"DASH",icon:"◈"},{id:"entreno",label:"GYM",icon:"◉"},{id:"suple",label:"SUPLS",icon:"◎"},{id:"sueno",label:"SUEÑO",icon:"◐"}];

  return(
    <div style={{maxWidth:"440px",margin:"0 auto",minHeight:"100vh",background:"#080808",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"0.9rem 1rem 0.6rem",background:"#080808",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${BORDER}`}}>
        <div style={{fontSize:"0.52rem",color:"#252525",letterSpacing:"0.35em"}}>JT · PERFORMANCE TRACKER</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:"0.12rem"}}>
          <div style={{fontSize:"1.95rem",fontWeight:900,letterSpacing:"0.04em",lineHeight:1.1}}>
            {DAY_NAMES[dow]} <span style={{color:sm.color,fontSize:"0.95rem",fontWeight:600}}>· {sm.label}</span>
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
