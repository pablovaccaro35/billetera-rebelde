import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from "recharts";

var MN=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
var YRS=[2023,2024,2025,2026,2027];
var CI=["Sueldo","Aguinaldo","Horas Extra","Bono","Trinchi","Prestamo","Venta USD","Otro"];
var CG=["Servicios","Comida","Tarjeta RIO","Tarjeta GALICIA","Tarjeta VISA","Tarjeta AMEX","BRUBANK","Madre","ANSES","Alquiler","TV Cuotas","Ropa Perfumes","Transporte","TUENTI","LUZ","WIFI","Otro"];
var CLRS=["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316","#06b6d4","#84cc16","#e11d2d","#7c3aed","#0ea5e9","#d946ef","#facc15","#22d3ee","#fb923c"];
var ASSET_TYPES=["USDT","Crypto","Acciones"];
var TD=15,TM=2,TY=2026;
var DEFREC={sueldo:1756634,acta:0,jubPct:11,ley19032Pct:3,osPct:2.55,anssalPct:0.45,copago:2200};

function gid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fmt(n){if(n==null||isNaN(n))return"$0";return"$"+Math.round(n).toLocaleString("es-AR")}
function fk(y,m){return y+"-"+m}
function fs(n){if(n==null||isNaN(n))return"$0";var a=Math.abs(n);if(a>=1e6)return"$"+(n/1e6).toFixed(1)+"M";if(a>=1e3)return"$"+(n/1e3).toFixed(0)+"K";return"$"+Math.round(n)}
function calcNeto(r){var b=r.sueldo+r.acta;return b-(b*r.jubPct/100+b*r.ley19032Pct/100+b*r.osPct/100+b*r.anssalPct/100+r.copago)}
function cloneM(months){return months.map(function(m){return{y:m.y,m:m.m,ahorro:m.ahorro||0,items:m.items.map(function(i){return Object.assign({},i)})}})}

function SH(uid){
  var px="br2_"+uid+"_";
  return{
    ld:function(k,fb){return Promise.resolve().then(function(){try{var v=localStorage.getItem(px+k);return v?JSON.parse(v):fb}catch(e){return fb}})},
    sv:function(k,v){return Promise.resolve().then(function(){try{localStorage.setItem(px+k,JSON.stringify(v))}catch(e){}})}
  };
}

var PRE=[
  {y:2023,m:6,ahorro:0,items:[{id:"p1",t:"i",cat:"Sueldo",amt:171900,note:""},{id:"p2",t:"i",cat:"Aguinaldo",amt:80000,note:""},{id:"p3",t:"g",cat:"TUENTI",amt:2000,note:"",cuotas:0,cuotaN:0},{id:"p4",t:"g",cat:"LUZ",amt:1627,note:"",cuotas:0,cuotaN:0},{id:"p5",t:"g",cat:"WIFI",amt:5500,note:"",cuotas:0,cuotaN:0}]},
  {y:2023,m:7,ahorro:0,items:[{id:"p6",t:"i",cat:"Sueldo",amt:183933,note:""},{id:"p7",t:"g",cat:"WIFI",amt:6700,note:"",cuotas:0,cuotaN:0}]},
  {y:2023,m:8,ahorro:0,items:[{id:"p8",t:"i",cat:"Sueldo",amt:196808,note:""},{id:"p9",t:"g",cat:"Ropa Perfumes",amt:4900,note:"Buzo",cuotas:0,cuotaN:0},{id:"p10",t:"g",cat:"TUENTI",amt:2000,note:"",cuotas:0,cuotaN:0},{id:"p11",t:"g",cat:"LUZ",amt:2100,note:"",cuotas:0,cuotaN:0},{id:"p12",t:"g",cat:"WIFI",amt:6700,note:"",cuotas:0,cuotaN:0}]},
  {y:2023,m:9,ahorro:0,items:[{id:"p13",t:"i",cat:"Sueldo",amt:210585,note:""},{id:"p14",t:"i",cat:"Horas Extra",amt:68000,note:""},{id:"p15",t:"g",cat:"Ropa Perfumes",amt:4900,note:"Buzo",cuotas:0,cuotaN:0},{id:"p16",t:"g",cat:"TUENTI",amt:2100,note:"",cuotas:0,cuotaN:0},{id:"p17",t:"g",cat:"LUZ",amt:2500,note:"",cuotas:0,cuotaN:0},{id:"p18",t:"g",cat:"WIFI",amt:7500,note:"",cuotas:0,cuotaN:0}]},
  {y:2023,m:10,ahorro:0,items:[{id:"p19",t:"i",cat:"Sueldo",amt:238000,note:""},{id:"p20",t:"i",cat:"Bono",amt:30000,note:""},{id:"p21",t:"i",cat:"Venta USD",amt:53600,note:"Binance"},{id:"p22",t:"i",cat:"Trinchi",amt:7300,note:"Pacha"},{id:"p23",t:"g",cat:"TUENTI",amt:2000,note:"",cuotas:0,cuotaN:0},{id:"p24",t:"g",cat:"LUZ",amt:3000,note:"",cuotas:0,cuotaN:0},{id:"p25",t:"g",cat:"WIFI",amt:10000,note:"",cuotas:0,cuotaN:0}]},
  {y:2023,m:11,ahorro:0,items:[{id:"p26",t:"i",cat:"Sueldo",amt:240000,note:""},{id:"p27",t:"i",cat:"Venta USD",amt:29920,note:"34USDT"},{id:"p28",t:"i",cat:"Trinchi",amt:20800,note:""},{id:"p29",t:"i",cat:"Prestamo",amt:94000,note:"Rio"}]},
  {y:2023,m:12,ahorro:0,items:[{id:"p30",t:"i",cat:"Sueldo",amt:288000,note:""},{id:"p31",t:"i",cat:"Aguinaldo",amt:70000,note:""},{id:"p32",t:"i",cat:"Trinchi",amt:27000,note:""},{id:"p33",t:"g",cat:"Transporte",amt:101083,note:"Pasaje",cuotas:0,cuotaN:0}]},
  {y:2024,m:1,ahorro:0,items:[{id:"p34",t:"i",cat:"Sueldo",amt:350000,note:""}]},
  {y:2024,m:2,ahorro:0,items:[{id:"p35",t:"i",cat:"Sueldo",amt:390000,note:""},{id:"p36",t:"i",cat:"Otro",amt:34000,note:"Licha"}]},
  {y:2024,m:3,ahorro:0,items:[{id:"p37",t:"i",cat:"Sueldo",amt:480000,note:""}]},
  {y:2024,m:4,ahorro:0,items:[{id:"p38",t:"i",cat:"Sueldo",amt:499000,note:""},{id:"p39",t:"g",cat:"Tarjeta AMEX",amt:106000,note:"Impago",cuotas:0,cuotaN:0},{id:"p40",t:"g",cat:"BRUBANK",amt:261800,note:"Impago",cuotas:0,cuotaN:0}]},
  {y:2024,m:5,ahorro:0,items:[{id:"p41",t:"i",cat:"Sueldo",amt:682000,note:""},{id:"p42",t:"g",cat:"BRUBANK",amt:100000,note:"CC",cuotas:0,cuotaN:0}]},
  {y:2024,m:6,ahorro:0,items:[{id:"p43",t:"i",cat:"Sueldo",amt:834000,note:""},{id:"p44",t:"g",cat:"Otro",amt:41400,note:"Agents",cuotas:0,cuotaN:0},{id:"p45",t:"g",cat:"Otro",amt:29000,note:"Ca7o",cuotas:0,cuotaN:0}]},
  {y:2024,m:7,ahorro:0,items:[{id:"p46",t:"i",cat:"Sueldo",amt:615000,note:""},{id:"p47",t:"g",cat:"BRUBANK",amt:242000,note:"CC",cuotas:0,cuotaN:0}]},
  {y:2024,m:8,ahorro:0,items:[{id:"p48",t:"i",cat:"Sueldo",amt:676000,note:""}]},
  {y:2024,m:9,ahorro:0,items:[{id:"p49",t:"i",cat:"Sueldo",amt:707000,note:""},{id:"p50",t:"g",cat:"Servicios",amt:40000,note:"",cuotas:0,cuotaN:0},{id:"p51",t:"g",cat:"Alquiler",amt:125000,note:"Alq",cuotas:0,cuotaN:0},{id:"p52",t:"g",cat:"BRUBANK",amt:88600,note:"",cuotas:0,cuotaN:0}]},
  {y:2024,m:10,ahorro:0,items:[{id:"p53",t:"i",cat:"Sueldo",amt:735280,note:""}]},
  {y:2024,m:11,ahorro:0,items:[{id:"p54",t:"i",cat:"Sueldo",amt:764691,note:""},{id:"p55",t:"i",cat:"Otro",amt:215000,note:""},{id:"p56",t:"g",cat:"ANSES",amt:130000,note:"",cuotas:0,cuotaN:0},{id:"p57",t:"g",cat:"Madre",amt:125000,note:"",cuotas:0,cuotaN:0},{id:"p58",t:"g",cat:"Otro",amt:38000,note:"Villi",cuotas:0,cuotaN:0}]},
  {y:2024,m:12,ahorro:0,items:[{id:"p59",t:"i",cat:"Sueldo",amt:795279,note:""},{id:"p60",t:"i",cat:"Otro",amt:410000,note:"Aguilucho"},{id:"p61",t:"g",cat:"ANSES",amt:260000,note:"",cuotas:0,cuotaN:0},{id:"p62",t:"g",cat:"Servicios",amt:20000,note:"",cuotas:0,cuotaN:0},{id:"p63",t:"g",cat:"Otro",amt:16600,note:"grillo",cuotas:0,cuotaN:0}]},
  {y:2025,m:1,ahorro:0,items:[{id:"p64",t:"i",cat:"Sueldo",amt:821210,note:""},{id:"p65",t:"g",cat:"Servicios",amt:42000,note:"",cuotas:0,cuotaN:0},{id:"p66",t:"g",cat:"Otro",amt:45000,note:"Lolla",cuotas:6,cuotaN:1},{id:"p67",t:"g",cat:"Ropa Perfumes",amt:50000,note:"Mochak",cuotas:0,cuotaN:0},{id:"p68",t:"g",cat:"Otro",amt:16600,note:"Bibi",cuotas:6,cuotaN:3},{id:"p69",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p71",t:"g",cat:"Madre",amt:125000,note:"",cuotas:0,cuotaN:0}]},
  {y:2025,m:2,ahorro:0,items:[{id:"p72",t:"i",cat:"Sueldo",amt:896550,note:""},{id:"p73",t:"g",cat:"Otro",amt:45000,note:"Lolla 2/6",cuotas:6,cuotaN:2},{id:"p74",t:"g",cat:"Otro",amt:16600,note:"Bibi 4/6",cuotas:6,cuotaN:4},{id:"p75",t:"g",cat:"Servicios",amt:38200,note:"",cuotas:0,cuotaN:0},{id:"p76",t:"g",cat:"Tarjeta GALICIA",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p77",t:"g",cat:"Madre",amt:145000,note:"",cuotas:0,cuotaN:0}]},
  {y:2025,m:3,ahorro:0,items:[{id:"p78",t:"i",cat:"Sueldo",amt:835606,note:""},{id:"p79",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p80",t:"g",cat:"Otro",amt:45000,note:"Lolla 3/6",cuotas:6,cuotaN:3},{id:"p81",t:"g",cat:"Otro",amt:16600,note:"Bibi 5/6",cuotas:6,cuotaN:5},{id:"p82",t:"g",cat:"Servicios",amt:45000,note:"",cuotas:0,cuotaN:0},{id:"p83",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:2},{id:"p84",t:"g",cat:"Madre",amt:165000,note:"",cuotas:0,cuotaN:0}]},
  {y:2025,m:4,ahorro:0,items:[{id:"p85",t:"i",cat:"Sueldo",amt:849000,note:""},{id:"p86",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p87",t:"g",cat:"Otro",amt:45000,note:"Lolla 4/6",cuotas:6,cuotaN:4},{id:"p88",t:"g",cat:"Servicios",amt:47120,note:"",cuotas:0,cuotaN:0},{id:"p89",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p90",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:3},{id:"p92",t:"g",cat:"Madre",amt:165000,note:"",cuotas:0,cuotaN:0}]},
  {y:2025,m:5,ahorro:0,items:[{id:"p93",t:"i",cat:"Sueldo",amt:849000,note:""},{id:"p94",t:"g",cat:"Servicios",amt:50000,note:"",cuotas:0,cuotaN:0},{id:"p95",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p96",t:"g",cat:"Otro",amt:45000,note:"Lolla 5/6",cuotas:6,cuotaN:5},{id:"p97",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p98",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:4},{id:"p99",t:"g",cat:"Madre",amt:165000,note:"",cuotas:0,cuotaN:0}]},
  {y:2025,m:6,ahorro:0,items:[{id:"p100",t:"i",cat:"Sueldo",amt:933900,note:""},{id:"p101",t:"i",cat:"Aguinaldo",amt:466950,note:""},{id:"p102",t:"g",cat:"Servicios",amt:50000,note:"",cuotas:0,cuotaN:0},{id:"p103",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p104",t:"g",cat:"Otro",amt:45000,note:"Lolla 6/6",cuotas:6,cuotaN:6},{id:"p105",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p106",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:5},{id:"p107",t:"g",cat:"Madre",amt:165000,note:"",cuotas:0,cuotaN:0}]},
  {y:2025,m:7,ahorro:0,items:[{id:"p108",t:"i",cat:"Sueldo",amt:1161000,note:""},{id:"p109",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p110",t:"g",cat:"Servicios",amt:60000,note:"",cuotas:0,cuotaN:0},{id:"p111",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p112",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:6},{id:"p113",t:"g",cat:"Madre",amt:165000,note:"",cuotas:0,cuotaN:0},{id:"p114",t:"g",cat:"BRUBANK",amt:450000,note:"",cuotas:0,cuotaN:0}]},
  {y:2025,m:8,ahorro:0,items:[{id:"p115",t:"i",cat:"Sueldo",amt:1213000,note:""},{id:"p116",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p117",t:"g",cat:"Servicios",amt:85000,note:"",cuotas:0,cuotaN:0},{id:"p118",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p119",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:7},{id:"p120",t:"g",cat:"Madre",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p121",t:"g",cat:"BRUBANK",amt:237300,note:"2/6",cuotas:6,cuotaN:2}]},
  {y:2025,m:9,ahorro:0,items:[{id:"p122",t:"i",cat:"Sueldo",amt:1275000,note:""},{id:"p123",t:"g",cat:"Servicios",amt:50000,note:"",cuotas:0,cuotaN:0},{id:"p124",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p125",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p126",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:8},{id:"p127",t:"g",cat:"Madre",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p128",t:"g",cat:"BRUBANK",amt:237300,note:"3/6",cuotas:6,cuotaN:3}]},
  {y:2025,m:10,ahorro:0,items:[{id:"p129",t:"i",cat:"Sueldo",amt:1275000,note:""},{id:"p130",t:"g",cat:"Servicios",amt:50000,note:"",cuotas:0,cuotaN:0},{id:"p131",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p132",t:"g",cat:"ANSES",amt:61000,note:"",cuotas:0,cuotaN:0},{id:"p133",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:9},{id:"p134",t:"g",cat:"Madre",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p135",t:"g",cat:"BRUBANK",amt:237300,note:"4/6",cuotas:6,cuotaN:4}]},
  {y:2025,m:11,ahorro:0,items:[{id:"p136",t:"i",cat:"Sueldo",amt:1331000,note:""},{id:"p137",t:"g",cat:"Otro",amt:38000,note:"Villi",cuotas:0,cuotaN:0},{id:"p138",t:"g",cat:"TV Cuotas",amt:17847,note:"DNKY 1/3",cuotas:3,cuotaN:1},{id:"p139",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p140",t:"g",cat:"Servicios",amt:60000,note:"",cuotas:0,cuotaN:0},{id:"p141",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:10},{id:"p142",t:"g",cat:"Madre",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p143",t:"g",cat:"BRUBANK",amt:237300,note:"5/6",cuotas:6,cuotaN:5}]},
  {y:2025,m:12,ahorro:0,items:[{id:"p144",t:"i",cat:"Sueldo",amt:1331000,note:""},{id:"p145",t:"i",cat:"Aguinaldo",amt:665500,note:"Aguilucho"},{id:"p146",t:"g",cat:"Transporte",amt:380000,note:"Pasaje",cuotas:0,cuotaN:0},{id:"p147",t:"g",cat:"TV Cuotas",amt:17800,note:"DNKY 2/3",cuotas:3,cuotaN:2},{id:"p148",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p149",t:"g",cat:"Servicios",amt:50000,note:"",cuotas:0,cuotaN:0},{id:"p150",t:"g",cat:"TV Cuotas",amt:17000,note:"ModClix 2/4",cuotas:4,cuotaN:2},{id:"p151",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:11},{id:"p152",t:"g",cat:"Madre",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p153",t:"g",cat:"BRUBANK",amt:237300,note:"6/6",cuotas:6,cuotaN:6}]},
  {y:2026,m:1,ahorro:150000,items:[{id:"p154",t:"i",cat:"Sueldo",amt:1331000,note:""},{id:"p155",t:"g",cat:"Ropa Perfumes",amt:38000,note:"MissDior 1/6",cuotas:6,cuotaN:1},{id:"p156",t:"g",cat:"TV Cuotas",amt:17800,note:"DNKY 3/3",cuotas:3,cuotaN:3},{id:"p157",t:"g",cat:"Servicios",amt:75000,note:"",cuotas:0,cuotaN:0},{id:"p158",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p159",t:"g",cat:"TV Cuotas",amt:17000,note:"ModClix 3/4",cuotas:4,cuotaN:3},{id:"p160",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:12},{id:"p161",t:"g",cat:"Tarjeta GALICIA",amt:256000,note:"",cuotas:0,cuotaN:0},{id:"p162",t:"g",cat:"Madre",amt:265000,note:"",cuotas:0,cuotaN:0}]},
  {y:2026,m:2,ahorro:150000,items:[{id:"p163",t:"i",cat:"Sueldo",amt:1455806,note:""},{id:"p164",t:"g",cat:"Ropa Perfumes",amt:38000,note:"MissDior 2/6",cuotas:6,cuotaN:2},{id:"p165",t:"g",cat:"TV Cuotas",amt:17000,note:"ModClix 4/4",cuotas:4,cuotaN:4},{id:"p166",t:"g",cat:"TV Cuotas",amt:14500,note:"Grazia 3/3",cuotas:3,cuotaN:3},{id:"p167",t:"g",cat:"TV Cuotas",amt:25000,note:"TV 1/12",cuotas:12,cuotaN:1},{id:"p168",t:"g",cat:"Servicios",amt:75000,note:"",cuotas:0,cuotaN:0},{id:"p169",t:"g",cat:"Comida",amt:160000,note:"",cuotas:0,cuotaN:0},{id:"p170",t:"g",cat:"Tarjeta RIO",amt:31000,note:"",cuotas:18,cuotaN:13},{id:"p171",t:"g",cat:"Tarjeta GALICIA",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p172",t:"g",cat:"Madre",amt:265000,note:"",cuotas:0,cuotaN:0},{id:"p173",t:"g",cat:"Alquiler",amt:198000,note:"AIRBNB",cuotas:0,cuotaN:0}]},
];

function LoginScreen(props){
  var _n=useState(""),nm=_n[0],sNm=_n[1];
  var _l=useState(false),ld=_l[0],sLd=_l[1];
  function go(){if(nm.trim()){sLd(true);props.onLogin(nm.trim())}}
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",borderRadius:24,padding:"48px 40px",width:360,border:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:8}}>💰🔥</div>
          <h1 style={{color:"#fff",fontSize:28,fontWeight:800,margin:0}}>Billetera Rebelde</h1>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:14,marginTop:8}}>Tu plata, tus reglas</p>
        </div>
        <input value={nm} onChange={function(e){sNm(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")go()}} placeholder="Tu nombre o alias..."
          style={{width:"100%",padding:"14px 18px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:16,outline:"none",boxSizing:"border-box",marginBottom:16}} />
        <button onClick={go} disabled={!nm.trim()||ld} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:nm.trim()?"linear-gradient(135deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:16,fontWeight:700,cursor:nm.trim()?"pointer":"default",opacity:nm.trim()?1:0.5}}>
          {ld?"Cargando...":"Entrar"}</button>
      </div>
    </div>
  );
}

function ItemEditor(props){
  var item=props.item;
  var _c=useState(item.cat),cat=_c[0],sC=_c[1];
  var _a=useState(item.amt||0),amt=_a[0],sA=_a[1];
  var _n=useState(item.note||""),note=_n[0],sN=_n[1];
  var _q=useState(item.cuotas||0),cuotas=_q[0],sQ=_q[1];
  var _qn=useState(item.cuotaN||1),cuotaN=_qn[0],sQN=_qn[1];
  var cats=item.t==="i"?CI:CG;
  var isCuota=item.t==="g"&&cuotas>1;
  return(
    <div style={{background:"rgba(255,255,255,0.06)",borderRadius:16,padding:20,border:"1px solid rgba(99,102,241,0.3)",marginBottom:16}}>
      <h4 style={{margin:"0 0 12px 0",color:"#fff"}}>{(item.isNew?"Nuevo ":"Editar ")+(item.t==="i"?"Ingreso":"Gasto")}</h4>
      <select value={cat} onChange={function(e){sC(e.target.value)}} style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10}}>
        {cats.map(function(c){return <option key={c} value={c}>{c}</option>})}
      </select>
      <input type="number" value={amt||""} onChange={function(e){sA(parseFloat(e.target.value)||0)}} placeholder="Monto por cuota"
        style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,marginBottom:10,outline:"none",boxSizing:"border-box"}} />
      {item.t==="g"&&(
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{flex:1}}>
            <label style={{color:"rgba(255,255,255,0.5)",fontSize:11,display:"block",marginBottom:4}}>Total cuotas (0=sin cuotas)</label>
            <input type="number" value={cuotas} onChange={function(e){sQ(Math.max(0,parseInt(e.target.value)||0))}}
              style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}} />
          </div>
          {isCuota&&(
            <div style={{flex:1}}>
              <label style={{color:"rgba(255,255,255,0.5)",fontSize:11,display:"block",marginBottom:4}}>Cuota actual</label>
              <input type="number" value={cuotaN} onChange={function(e){sQN(Math.max(1,Math.min(cuotas,parseInt(e.target.value)||1)))}}
                style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}} />
            </div>
          )}
        </div>
      )}
      {isCuota&&item.isNew&&<div style={{color:"#f59e0b",fontSize:12,marginBottom:10}}>{"Se crearan automaticamente las cuotas "+(cuotaN+1)+" a "+cuotas+" en los meses siguientes"}</div>}
      <input value={note} onChange={function(e){sN(e.target.value)}} placeholder="Nota (opcional)"
        style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,marginBottom:14,outline:"none",boxSizing:"border-box"}} />
      <div style={{display:"flex",gap:8}}>
        <button onClick={function(){props.onSave({id:item.id,t:item.t,cat:cat,amt:amt,note:note,cuotas:cuotas,cuotaN:isCuota?cuotaN:0,isNew:item.isNew})}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#6366f1",color:"#fff",fontWeight:700,cursor:"pointer"}}>Guardar</button>
        {!item.isNew&&<button onClick={function(){props.onDel(item.id)}} style={{padding:"10px 16px",borderRadius:10,border:"none",background:"rgba(239,68,68,0.2)",color:"#ef4444",fontWeight:700,cursor:"pointer"}}>Borrar</button>}
        <button onClick={props.onCancel} style={{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"none",color:"rgba(255,255,255,0.5)",cursor:"pointer"}}>X</button>
      </div>
    </div>
  );
}

function AssetEditor(props){
  var item=props.item;
  var _t=useState(item.assetType||"USDT"),at=_t[0],sT=_t[1];
  var _n=useState(item.name||""),nm=_n[0],sN=_n[1];
  var _q=useState(item.qty||0),qty=_q[0],sQ=_q[1];
  var _p=useState(item.priceUsd||0),pr=_p[0],sP=_p[1];
  var _tc=useState(item.tcCompra||1550),tc=_tc[0],sTc=_tc[1];
  return(
    <div style={{background:"rgba(255,255,255,0.06)",borderRadius:16,padding:20,border:"1px solid rgba(245,158,11,0.3)",marginBottom:16}}>
      <h4 style={{margin:"0 0 12px 0",color:"#fff"}}>{item.isNew?"Comprar activo":"Editar activo"}</h4>
      <select value={at} onChange={function(e){sT(e.target.value)}} style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10}}>
        {ASSET_TYPES.map(function(a){return <option key={a} value={a}>{a}</option>})}
      </select>
      <input value={nm} onChange={function(e){sN(e.target.value)}} placeholder={at==="USDT"?"USDT":at==="Crypto"?"Ej: BTC, ETH, SOL":"Ej: AAPL, MELI"}
        style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,marginBottom:10,outline:"none",boxSizing:"border-box"}} />
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <div style={{flex:1}}>
          <label style={{color:"rgba(255,255,255,0.5)",fontSize:11,display:"block",marginBottom:4}}>Cantidad</label>
          <input type="number" value={qty||""} onChange={function(e){sQ(parseFloat(e.target.value)||0)}}
            style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(245,158,11,0.3)",background:"rgba(245,158,11,0.08)",color:"#f59e0b",fontSize:14,outline:"none",boxSizing:"border-box",fontWeight:700}} />
        </div>
        <div style={{flex:1}}>
          <label style={{color:"rgba(255,255,255,0.5)",fontSize:11,display:"block",marginBottom:4}}>Precio USD</label>
          <input type="number" value={pr||""} onChange={function(e){sP(parseFloat(e.target.value)||0)}}
            style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}} />
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <label style={{color:"rgba(255,255,255,0.5)",fontSize:11,display:"block",marginBottom:4}}>TC compra (ARS/USD)</label>
        <input type="number" value={tc||""} onChange={function(e){sTc(parseFloat(e.target.value)||0)}}
          style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}} />
      </div>
      <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginBottom:10}}>{"Valor: USD "+(qty*pr).toFixed(2)+" | Costo ARS: "+fmt(qty*pr*tc)}</div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={function(){props.onSave({id:item.id,assetType:at,name:nm||at,qty:qty,priceUsd:pr,tcCompra:tc,isNew:item.isNew})}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#f59e0b",color:"#000",fontWeight:700,cursor:"pointer"}}>Guardar</button>
        {!item.isNew&&<button onClick={function(){props.onDel(item.id)}} style={{padding:"10px 16px",borderRadius:10,border:"none",background:"rgba(239,68,68,0.2)",color:"#ef4444",fontWeight:700,cursor:"pointer"}}>Borrar</button>}
        <button onClick={props.onCancel} style={{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"none",color:"rgba(255,255,255,0.5)",cursor:"pointer"}}>X</button>
      </div>
    </div>
  );
}

function ReciboTab(props){
  var r=props.recibo,setR=props.setRecibo;
  function up(k,v){var n=Object.assign({},r);n[k]=v;setR(n)}
  var b=r.sueldo+r.acta;var jub=b*r.jubPct/100,ley=b*r.ley19032Pct/100,os=b*r.osPct/100,ans=b*r.anssalPct/100;var neto=b-(jub+ley+os+ans+r.copago);
  function FR(fp){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>{fp.label}</span><div style={{display:"flex",alignItems:"center",gap:4}}>{fp.suf&&<span style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>{fp.suf}</span>}<input type="number" value={fp.val} onChange={function(e){fp.set(parseFloat(e.target.value)||0)}} style={{width:fp.suf?70:130,padding:"6px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,textAlign:"right",outline:"none"}} /></div></div>)}
  function RR(rp){return <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"rgba(255,255,255,0.6)"}}>{rp.label}</span><span style={{color:rp.color,fontWeight:600}}>{rp.value}</span></div>}
  return(
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:24,border:"1px solid rgba(255,255,255,0.08)"}}>
      <h3 style={{color:"#fff",margin:"0 0 20px 0",fontSize:18}}>Calculadora de Recibo</h3>
      <div style={{marginBottom:20}}><div style={{color:"#6366f1",fontSize:12,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Haberes</div>
        <FR label="Sueldo Basico" val={r.sueldo} set={function(v){up("sueldo",v)}} /><FR label="Acta SMG" val={r.acta} set={function(v){up("acta",v)}} /></div>
      <div style={{marginBottom:20}}><div style={{color:"#ef4444",fontSize:12,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Descuentos</div>
        <FR label="Jubilacion" val={r.jubPct} set={function(v){up("jubPct",v)}} suf="%" /><FR label="Ley 19032" val={r.ley19032Pct} set={function(v){up("ley19032Pct",v)}} suf="%" />
        <FR label="Aporte OS" val={r.osPct} set={function(v){up("osPct",v)}} suf="%" /><FR label="ANSSAL" val={r.anssalPct} set={function(v){up("anssalPct",v)}} suf="%" />
        <FR label="Copago" val={r.copago} set={function(v){up("copago",v)}} /></div>
      <div style={{background:"rgba(99,102,241,0.15)",borderRadius:12,padding:16}}>
        <RR label="Bruto" value={fmt(b)} color="#10b981" /><RR label={"Jubilacion ("+r.jubPct+"%)"} value={"-"+fmt(jub)} color="#ef4444" />
        <RR label={"Ley 19032 ("+r.ley19032Pct+"%)"} value={"-"+fmt(ley)} color="#ef4444" /><RR label={"OS ("+r.osPct+"%)"} value={"-"+fmt(os)} color="#ef4444" />
        <RR label={"ANSSAL ("+r.anssalPct+"%)"} value={"-"+fmt(ans)} color="#ef4444" /><RR label="Copago" value={"-"+fmt(r.copago)} color="#ef4444" />
        <div style={{borderTop:"2px solid rgba(255,255,255,0.2)",paddingTop:12,marginTop:8,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:"#fff",fontWeight:800,fontSize:16}}>NETO</span><span style={{color:"#6366f1",fontWeight:800,fontSize:22}}>{fmt(neto)}</span></div>
      </div>
    </div>
  );
}

export default function App(){
  var _u=useState(null),user=_u[0],setUser=_u[1];
  var _t=useState("dashboard"),tab=_t[0],setTab=_t[1];
  var _m=useState([]),months=_m[0],setMonths=_m[1];
  var _sy=useState(TY),selY=_sy[0],setSelY=_sy[1];
  var _sm=useState(TM),selM=_sm[0],setSelM=_sm[1];
  var _ei=useState(null),editItem=_ei[0],setEditItem=_ei[1];
  var _ld=useState(false),loaded=_ld[0],setLoaded=_ld[1];
  var _r=useState(DEFREC),recibo=_r[0],setRecibo=_r[1];
  var _pn=useState(6),projN=_pn[0],setProjN=_pn[1];
  var _st=useState(null),storage=_st[0],setStorage=_st[1];
  var _as=useState([]),assets=_as[0],setAssets=_as[1];
  var _ae=useState(null),assetEdit=_ae[0],setAssetEdit=_ae[1];
  var _lq=useState(0),liqAdj=_lq[0],setLiqAdj=_lq[1];

  function login(name){
    var uid=name.toLowerCase().replace(/[^a-z0-9]/g,"");
    var s=SH(uid);setStorage(s);setUser({name:name,uid:uid});
    Promise.all([s.ld("months",[]),s.ld("recibo",null),s.ld("assets",[]),s.ld("liqAdj",0)]).then(function(res){
      if(res[0]&&res[0].length>0){setMonths(res[0])}else{var p=PRE.map(function(m){return{y:m.y,m:m.m,ahorro:m.ahorro||0,items:m.items.map(function(i){return Object.assign({},i)})}});setMonths(p);s.sv("months",p)}
      if(res[1])setRecibo(res[1]);
      if(res[2])setAssets(res[2]);
      if(res[3])setLiqAdj(res[3]);
      setLoaded(true);
    });
  }
  function persistM(nm){setMonths(nm);if(storage)storage.sv("months",nm)}
  function persistAs(na){setAssets(na);if(storage)storage.sv("assets",na)}
  function persistLiq(v){setLiqAdj(v);if(storage)storage.sv("liqAdj",v)}
  useEffect(function(){if(storage&&loaded)storage.sv("recibo",recibo)},[recibo,storage,loaded]);

  var summaries=useMemo(function(){
    return months.map(function(m){
      var inc=m.items.filter(function(x){return x.t==="i"}).reduce(function(s,x){return s+(x.amt||0)},0);
      var exp=m.items.filter(function(x){return x.t==="g"}).reduce(function(s,x){return s+(x.amt||0)},0);
      return{y:m.y,m:m.m,label:MN[m.m-1]+" "+m.y,inc:inc,exp:exp,bal:inc-exp,ahorro:m.ahorro||0};
    }).sort(function(a,b){return a.y===b.y?a.m-b.m:a.y-b.y});
  },[months]);

  var curSum=summaries.find(function(s){return s.y===TY&&s.m===TM});
  var curInc=curSum?curSum.inc:0,curExp=curSum?curSum.exp:0,curBal=curInc-curExp,curAhorro=curSum?curSum.ahorro:0;

  var liqFromMonths=useMemo(function(){
    return summaries.filter(function(s){return s.y<TY||(s.y===TY&&s.m<=TM)}).reduce(function(a,s){return a+(s.ahorro||0)},0);
  },[summaries]);
  var totalLiq=liqFromMonths+liqAdj;

  var totalAssetsUsd=assets.reduce(function(s,a){return s+(a.qty||0)*(a.priceUsd||0)},0);
  var totalCostArs=assets.reduce(function(s,a){return s+(a.qty||0)*(a.priceUsd||0)*(a.tcCompra||0)},0);

  var dashPie=useMemo(function(){
    var cm=months.find(function(x){return x.y===TY&&x.m===TM});
    if(!cm)return[];
    var byC={};cm.items.filter(function(x){return x.t==="g"}).forEach(function(x){var c=x.cat||"Otro";byC[c]=(byC[c]||0)+(x.amt||0)});
    return Object.keys(byC).map(function(k){return{name:k,value:byC[k]}}).sort(function(a,b){return b.value-a.value});
  },[months]);

  var selMonth=months.find(function(x){return x.y===selY&&x.m===selM});
  var selItems=selMonth?selMonth.items:[];
  var selInc=selItems.filter(function(x){return x.t==="i"}).reduce(function(s,x){return s+(x.amt||0)},0);
  var selExp=selItems.filter(function(x){return x.t==="g"}).reduce(function(s,x){return s+(x.amt||0)},0);
  var selAhorro=selMonth?selMonth.ahorro||0:0;

  var selPie=useMemo(function(){
    var byC={};selItems.filter(function(x){return x.t==="g"}).forEach(function(x){var c=x.cat||"Otro";byC[c]=(byC[c]||0)+(x.amt||0)});
    return Object.keys(byC).map(function(k){return{name:k,value:byC[k]}}).sort(function(a,b){return b.value-a.value});
  },[selItems]);

  function addItem(type){setEditItem({id:gid(),t:type,cat:type==="i"?CI[0]:CG[0],amt:0,note:"",cuotas:0,cuotaN:1,isNew:true})}

  function saveItem(item){
    var nm=cloneM(months);
    var mi=nm.findIndex(function(x){return x.y===selY&&x.m===selM});
    if(mi===-1){nm.push({y:selY,m:selM,ahorro:0,items:[]});mi=nm.length-1}
    var cl={id:item.id,t:item.t,cat:item.cat,amt:item.amt,note:item.note,cuotas:item.cuotas||0,cuotaN:item.cuotaN||0};
    if(item.isNew){
      nm[mi].items.push(cl);
      if(item.t==="g"&&item.cuotas>1&&item.cuotaN<item.cuotas){
        var remaining=item.cuotas-item.cuotaN;
        var cy=selY,cm=selM;
        for(var i=1;i<=remaining;i++){
          cm++;if(cm>12){cm=1;cy++}
          var fmi=nm.findIndex(function(x){return x.y===cy&&x.m===cm});
          if(fmi===-1){nm.push({y:cy,m:cm,ahorro:0,items:[]});fmi=nm.length-1}
          var cn=item.cuotaN+i;
          var fNote=item.note?(item.note.replace(/\s*\d+\/\d+/,"")+" "+cn+"/"+item.cuotas).trim():(item.cat+" "+cn+"/"+item.cuotas);
          nm[fmi].items.push({id:gid(),t:"g",cat:item.cat,amt:item.amt,note:fNote,cuotas:item.cuotas,cuotaN:cn});
        }
      }
    }else{
      var ii=nm[mi].items.findIndex(function(x){return x.id===item.id});
      if(ii>-1)nm[mi].items[ii]=cl;
    }
    persistM(nm);setEditItem(null);
  }

  function delItem(iid){
    var nm=cloneM(months);
    var mi=nm.findIndex(function(x){return x.y===selY&&x.m===selM});
    if(mi===-1)return;
    nm[mi].items=nm[mi].items.filter(function(x){return x.id!==iid});
    persistM(nm);setEditItem(null);
  }

  function setAhorro(val){
    var nm=cloneM(months);
    var mi=nm.findIndex(function(x){return x.y===selY&&x.m===selM});
    if(mi===-1){nm.push({y:selY,m:selM,ahorro:val,items:[]});} else{nm[mi].ahorro=val;}
    persistM(nm);
  }

  function copyPrevMonth(){
    var py=selM===1?selY-1:selY;
    var pm=selM===1?12:selM-1;
    var prev=months.find(function(x){return x.y===py&&x.m===pm});
    if(!prev)return;
    var nm=cloneM(months);
    var mi=nm.findIndex(function(x){return x.y===selY&&x.m===selM});
    if(mi===-1){nm.push({y:selY,m:selM,ahorro:0,items:[]});mi=nm.length-1}
    prev.items.forEach(function(it){
      var newIt=Object.assign({},it,{id:gid()});
      if(newIt.cuotas>0&&newIt.cuotaN>0){
        if(newIt.cuotaN>=newIt.cuotas)return;
        newIt.cuotaN=newIt.cuotaN+1;
        var baseNote=newIt.note.replace(/\s*\d+\/\d+/,"").trim();
        newIt.note=(baseNote+" "+newIt.cuotaN+"/"+newIt.cuotas).trim();
      }
      var exists=nm[mi].items.some(function(x){
        return x.cat===newIt.cat&&x.amt===newIt.amt&&x.cuotas===newIt.cuotas&&x.cuotaN===newIt.cuotaN;
      });
      if(!exists)nm[mi].items.push(newIt);
    });
    persistM(nm);
  }

  function saveAsset(item){
    var na=assets.map(function(a){return Object.assign({},a)});
    var cl={id:item.id,assetType:item.assetType,name:item.name,qty:item.qty,priceUsd:item.priceUsd,tcCompra:item.tcCompra};
    if(item.isNew){na.push(cl)}else{var ii=na.findIndex(function(x){return x.id===item.id});if(ii>-1)na[ii]=cl}
    persistAs(na);setAssetEdit(null);
  }
  function delAsset(aid){persistAs(assets.filter(function(a){return a.id!==aid}));setAssetEdit(null)}

  var projDetailed=useMemo(function(){
    var cur=TY*12+TM;
    var future=months.filter(function(m){return(m.y*12+m.m)>cur}).sort(function(a,b){return a.y===b.y?a.m-b.m:a.y-b.y}).slice(0,projN);
    return future.map(function(m){
      var inc=m.items.filter(function(x){return x.t==="i"}).reduce(function(s,x){return s+(x.amt||0)},0);
      var byCat={};m.items.filter(function(x){return x.t==="g"}).forEach(function(x){var c=x.cat||"Otro";byCat[c]=(byCat[c]||0)+(x.amt||0)});
      var te=Object.values(byCat).reduce(function(s,v){return s+v},0);
      return{y:m.y,m:m.m,label:MN[m.m-1]+" "+m.y,inc:inc,byCat:byCat,totalExp:te,bal:inc-te,ahorro:m.ahorro||0};
    });
  },[months,projN]);

  if(!user)return <LoginScreen onLogin={login} />;
  if(!loaded)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f0c29",color:"#fff",fontFamily:"sans-serif"}}>Cargando...</div>;

  var chartLast6=summaries.slice(-6).map(function(x){return{name:x.label,Ingresos:x.inc,Gastos:x.exp,Saldo:x.bal}});

  function renderTab(k,l){return <button key={k} onClick={function(){setTab(k)}} style={{padding:"10px 16px",borderRadius:12,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:tab===k?"linear-gradient(135deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.06)",color:tab===k?"#fff":"rgba(255,255,255,0.5)",whiteSpace:"nowrap"}}>{l}</button>}
  function renderCard(label,value,color){return <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"14px 12px",border:"1px solid rgba(255,255,255,0.06)",minWidth:0}}><div style={{color:"rgba(255,255,255,0.5)",fontSize:10,fontWeight:600,textTransform:"uppercase"}}>{label}</div><div style={{color:color,fontSize:17,fontWeight:800,marginTop:4}}>{value}</div></div>}
  function renderRow(it,isExp){
    var cuotaLabel=it.cuotas>0?" ("+it.cuotaN+"/"+it.cuotas+")":"";
    return(
      <div key={it.id} onClick={function(){setEditItem(Object.assign({},it))}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10,marginBottom:5,cursor:"pointer",border:"1px solid rgba(255,255,255,0.04)"}}>
        <div><div style={{color:"#fff",fontSize:13,fontWeight:600}}>{it.cat+cuotaLabel}</div>{it.note?<div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{it.note}</div>:null}</div>
        <span style={{color:isExp?"#ef4444":"#10b981",fontWeight:700,fontSize:14}}>{(isExp?"-":"")+fmt(it.amt)}</span>
      </div>
    );
  }

  var bs={background:"rgba(255,255,255,0.04)",borderRadius:16,padding:20,border:"1px solid rgba(255,255,255,0.08)",marginBottom:16};
  var ttStyle={color:"#fff",fontSize:16,fontWeight:700,marginBottom:12};

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",fontFamily:"system-ui,sans-serif",color:"#fff"}}>
      {/* Header */}
      <div style={{padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>💰🔥</span>
          <span style={{fontSize:18,fontWeight:800}}>Billetera Rebelde</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>{user.name}</span>
          <button onClick={function(){setUser(null);setLoaded(false);setStorage(null);setMonths([])}} style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"none",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:12}}>Salir</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:6,padding:"12px 20px",overflowX:"auto"}}>
        {renderTab("dashboard","Dashboard")}
        {renderTab("meses","Meses")}
        {renderTab("proyeccion","Proyeccion")}
        {renderTab("activos","Activos")}
        {renderTab("recibo","Recibo")}
      </div>

      <div style={{padding:"0 20px 40px",maxWidth:800,margin:"0 auto"}}>

        {/* ========== DASHBOARD ========== */}
        {tab==="dashboard"&&(
          <div>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>{MN[TM-1]+" "+TY}</h2>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginBottom:16}}>Resumen del mes actual</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {renderCard("Ingresos",fmt(curInc),"#10b981")}
              {renderCard("Gastos",fmt(curExp),"#ef4444")}
              {renderCard("Saldo",fmt(curBal),curBal>=0?"#6366f1":"#ef4444")}
              {renderCard("Ahorro mes",fmt(curAhorro),"#f59e0b")}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {renderCard("Liquidez ARS",fmt(totalLiq),"#14b8a6")}
              {renderCard("Activos USD","USD "+totalAssetsUsd.toFixed(0),"#f59e0b")}
            </div>

            {/* Liquidez adjustment */}
            <div style={Object.assign({},bs)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>Ajuste liquidez manual</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <input type="number" value={liqAdj} onChange={function(e){persistLiq(parseFloat(e.target.value)||0)}}
                    style={{width:120,padding:"6px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,textAlign:"right",outline:"none"}} />
                </div>
              </div>
            </div>

            {/* Pie chart gastos del mes */}
            {dashPie.length>0&&(
              <div style={Object.assign({},bs)}>
                <div style={ttStyle}>Gastos por categoria</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={dashPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={function(e){return e.name+" "+fs(e.value)}}>
                      {dashPie.map(function(e,i){return <Cell key={i} fill={CLRS[i%CLRS.length]} />})}
                    </Pie>
                    <Tooltip formatter={function(v){return fmt(v)}} contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar chart last 6 months */}
            {chartLast6.length>0&&(
              <div style={Object.assign({},bs)}>
                <div style={ttStyle}>Ultimos 6 meses</div>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={chartLast6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} />
                    <YAxis tickFormatter={fs} tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} />
                    <Tooltip formatter={function(v){return fmt(v)}} contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}} />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="Gastos" fill="#ef4444" radius={[4,4,0,0]} />
                    <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={2} dot={{r:4}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ========== MESES ========== */}
        {tab==="meses"&&(
          <div>
            {/* Year/month selector */}
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <select value={selY} onChange={function(e){setSelY(parseInt(e.target.value))}} style={{padding:"8px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none"}}>
                {YRS.map(function(y){return <option key={y} value={y}>{y}</option>})}
              </select>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {MN.map(function(n,i){return <button key={i} onClick={function(){setSelM(i+1);setEditItem(null)}} style={{padding:"6px 10px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:selM===i+1?"#6366f1":"rgba(255,255,255,0.06)",color:selM===i+1?"#fff":"rgba(255,255,255,0.4)"}}>{n}</button>})}
              </div>
            </div>

            <h3 style={{fontSize:18,fontWeight:800,marginBottom:12}}>{MN[selM-1]+" "+selY}</h3>

            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {renderCard("Ingresos",fmt(selInc),"#10b981")}
              {renderCard("Gastos",fmt(selExp),"#ef4444")}
              {renderCard("Saldo",fmt(selInc-selExp),selInc-selExp>=0?"#6366f1":"#ef4444")}
            </div>

            {/* Ahorro */}
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
              <span style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>Ahorro del mes:</span>
              <input type="number" value={selAhorro} onChange={function(e){setAhorro(parseFloat(e.target.value)||0)}}
                style={{width:120,padding:"6px 10px",borderRadius:8,border:"1px solid rgba(245,158,11,0.3)",background:"rgba(245,158,11,0.08)",color:"#f59e0b",fontSize:14,fontWeight:700,textAlign:"right",outline:"none"}} />
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <button onClick={function(){addItem("i")}} style={{padding:"8px 16px",borderRadius:10,border:"none",background:"#10b981",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>+ Ingreso</button>
              <button onClick={function(){addItem("g")}} style={{padding:"8px 16px",borderRadius:10,border:"none",background:"#ef4444",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>+ Gasto</button>
              <button onClick={copyPrevMonth} style={{padding:"8px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13}}>Copiar mes anterior</button>
            </div>

            {/* Editor */}
            {editItem&&<ItemEditor item={editItem} onSave={saveItem} onDel={delItem} onCancel={function(){setEditItem(null)}} />}

            {/* Income items */}
            {selItems.filter(function(x){return x.t==="i"}).length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{color:"#10b981",fontSize:12,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Ingresos</div>
                {selItems.filter(function(x){return x.t==="i"}).map(function(it){return renderRow(it,false)})}
              </div>
            )}

            {/* Expense items */}
            {selItems.filter(function(x){return x.t==="g"}).length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{color:"#ef4444",fontSize:12,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Gastos</div>
                {selItems.filter(function(x){return x.t==="g"}).map(function(it){return renderRow(it,true)})}
              </div>
            )}

            {/* Pie chart for selected month */}
            {selPie.length>0&&(
              <div style={Object.assign({},bs)}>
                <div style={ttStyle}>Distribucion de gastos</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={selPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={function(e){return e.name+" "+fs(e.value)}}>
                      {selPie.map(function(e,i){return <Cell key={i} fill={CLRS[i%CLRS.length]} />})}
                    </Pie>
                    <Tooltip formatter={function(v){return fmt(v)}} contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {selItems.length===0&&<div style={{textAlign:"center",padding:40,color:"rgba(255,255,255,0.3)"}}>No hay datos para este mes. Usa "+ Ingreso" / "+ Gasto" o "Copiar mes anterior".</div>}
          </div>
        )}

        {/* ========== PROYECCION ========== */}
        {tab==="proyeccion"&&(
          <div>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>Proyeccion</h2>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginBottom:16}}>Meses futuros cargados</p>

            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
              <span style={{color:"rgba(255,255,255,0.6)",fontSize:13}}>Meses a mostrar:</span>
              <input type="number" value={projN} onChange={function(e){setProjN(Math.max(1,Math.min(24,parseInt(e.target.value)||6)))}}
                style={{width:60,padding:"6px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:14,textAlign:"center",outline:"none"}} />
            </div>

            {projDetailed.length>0?(
              <div>
                {/* Projection chart */}
                <div style={Object.assign({},bs)}>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={projDetailed.map(function(p){return{name:p.label,Ingresos:p.inc,Gastos:p.totalExp,Saldo:p.bal}})}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} />
                      <YAxis tickFormatter={fs} tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} />
                      <Tooltip formatter={function(v){return fmt(v)}} contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}} />
                      <Legend />
                      <Bar dataKey="Ingresos" fill="#10b981" radius={[4,4,0,0]} />
                      <Bar dataKey="Gastos" fill="#ef4444" radius={[4,4,0,0]} />
                      <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={2} dot={{r:4}} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Projection details */}
                {projDetailed.map(function(p){
                  var cats=Object.keys(p.byCat).sort(function(a,b){return p.byCat[b]-p.byCat[a]});
                  return(
                    <div key={p.label} style={Object.assign({},bs)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <span style={{color:"#fff",fontWeight:700,fontSize:15}}>{p.label}</span>
                        <span style={{color:p.bal>=0?"#10b981":"#ef4444",fontWeight:800,fontSize:16}}>{fmt(p.bal)}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                        <div style={{color:"#10b981",fontSize:12}}>Ingresos: <b>{fmt(p.inc)}</b></div>
                        <div style={{color:"#ef4444",fontSize:12}}>Gastos: <b>{fmt(p.totalExp)}</b></div>
                      </div>
                      {cats.map(function(c,i){
                        return <div key={c} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:12}}>
                          <span style={{color:"rgba(255,255,255,0.5)"}}>{c}</span>
                          <span style={{color:"#ef4444"}}>{fmt(p.byCat[c])}</span>
                        </div>
                      })}
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{textAlign:"center",padding:40,color:"rgba(255,255,255,0.3)"}}>No hay meses futuros cargados. Agrega datos en la tab "Meses" para meses posteriores a {MN[TM-1]+" "+TY}.</div>
            )}
          </div>
        )}

        {/* ========== ACTIVOS ========== */}
        {tab==="activos"&&(function(){
          // Stats by asset type
          var byType={};var byName={};
          assets.forEach(function(a){
            var val=(a.qty||0)*(a.priceUsd||0);
            var cost=val*(a.tcCompra||0);
            var tp=a.assetType||"Otro";
            if(!byType[tp])byType[tp]={usd:0,ars:0,count:0};
            byType[tp].usd+=val;byType[tp].ars+=cost;byType[tp].count++;
            var nm=a.name||tp;
            if(!byName[nm])byName[nm]={usd:0,ars:0};
            byName[nm].usd+=val;byName[nm].ars+=cost;
          });
          // Pie data by individual asset name
          var assetPie=Object.keys(byName).map(function(k){return{name:k,value:Math.round(byName[k].usd*100)/100}}).filter(function(x){return x.value>0}).sort(function(a,b){return b.value-a.value});
          // Pie data by asset type
          var typePie=Object.keys(byType).map(function(k){return{name:k,value:Math.round(byType[k].usd*100)/100}}).filter(function(x){return x.value>0}).sort(function(a,b){return b.value-a.value});
          // Avg TC
          var avgTc=assets.length>0?(assets.reduce(function(s,a){return s+(a.tcCompra||0)},0)/assets.length):0;
          // Top holding
          var topHolding=assetPie.length>0?assetPie[0]:null;
          var topPct=topHolding&&totalAssetsUsd>0?((topHolding.value/totalAssetsUsd)*100).toFixed(1):0;

          return(
          <div>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>Activos</h2>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginBottom:16}}>USDT, Crypto y Acciones</p>

            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {renderCard("Total USD","USD "+totalAssetsUsd.toFixed(2),"#f59e0b")}
              {renderCard("Costo ARS",fmt(totalCostArs),"#8b5cf6")}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {renderCard("Posiciones",assets.length.toString(),"#06b6d4")}
              {renderCard("TC Promedio","$"+Math.round(avgTc).toLocaleString("es-AR"),"#14b8a6")}
              {renderCard("Top Holding",topHolding?(topHolding.name+" "+topPct+"%"):"--","#ec4899")}
            </div>

            {/* Stats by type */}
            {Object.keys(byType).length>0&&(
              <div style={Object.assign({},bs)}>
                <div style={ttStyle}>Resumen por tipo</div>
                {Object.keys(byType).sort(function(a,b){return byType[b].usd-byType[a].usd}).map(function(tp,i){
                  var d=byType[tp];var pct=totalAssetsUsd>0?((d.usd/totalAssetsUsd)*100).toFixed(1):"0";
                  var typeColors={"USDT":"#10b981","Crypto":"#f59e0b","Acciones":"#6366f1"};
                  var col=typeColors[tp]||"#8b5cf6";
                  return(
                    <div key={tp} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:3,background:col}}></div>
                          <span style={{color:"#fff",fontSize:13,fontWeight:600}}>{tp}</span>
                          <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{d.count+" activo"+(d.count>1?"s":"")}</span>
                        </div>
                        <span style={{color:col,fontWeight:700,fontSize:13}}>{"USD "+d.usd.toFixed(2)+" ("+pct+"%)"}</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:3,background:col,width:pct+"%",transition:"width 0.3s"}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pie chart by asset name */}
            {assetPie.length>1&&(
              <div style={Object.assign({},bs)}>
                <div style={ttStyle}>Distribucion del portfolio</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={assetPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40} label={function(e){var p=totalAssetsUsd>0?((e.value/totalAssetsUsd)*100).toFixed(0):"0";return e.name+" "+p+"%"}}>
                      {assetPie.map(function(e,i){return <Cell key={i} fill={CLRS[i%CLRS.length]} />})}
                    </Pie>
                    <Tooltip formatter={function(v){return"USD "+v.toFixed(2)}} contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie chart by type (only if >1 type) */}
            {typePie.length>1&&(
              <div style={Object.assign({},bs)}>
                <div style={ttStyle}>Distribucion por tipo</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={typePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={function(e){var p=totalAssetsUsd>0?((e.value/totalAssetsUsd)*100).toFixed(0):"0";return e.name+" "+p+"%"}}>
                      {typePie.map(function(e,i){var typeColors={"USDT":"#10b981","Crypto":"#f59e0b","Acciones":"#6366f1"};return <Cell key={i} fill={typeColors[e.name]||CLRS[i%CLRS.length]} />})}
                    </Pie>
                    <Tooltip formatter={function(v){return"USD "+v.toFixed(2)}} contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <button onClick={function(){setAssetEdit({id:gid(),assetType:"USDT",name:"USDT",qty:0,priceUsd:1,tcCompra:1550,isNew:true})}} style={{padding:"8px 16px",borderRadius:10,border:"none",background:"#f59e0b",color:"#000",fontWeight:700,cursor:"pointer",fontSize:13,marginBottom:16}}>+ Comprar activo</button>

            {assetEdit&&<AssetEditor item={assetEdit} onSave={saveAsset} onDel={delAsset} onCancel={function(){setAssetEdit(null)}} />}

            {/* Asset list */}
            {assets.length>0?(
              <div>
                <div style={ttStyle}>Detalle de posiciones</div>
                {assets.map(function(a){
                  var val=(a.qty||0)*(a.priceUsd||0);
                  var pct=totalAssetsUsd>0?((val/totalAssetsUsd)*100).toFixed(1):"0";
                  return(
                    <div key={a.id} onClick={function(){setAssetEdit(Object.assign({},a))}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10,marginBottom:6,cursor:"pointer",border:"1px solid rgba(255,255,255,0.04)"}}>
                      <div>
                        <div style={{color:"#fff",fontSize:13,fontWeight:600}}>{a.name}</div>
                        <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{a.assetType+" | "+a.qty+" x USD"+a.priceUsd+" | TC:"+a.tcCompra}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{color:"#f59e0b",fontWeight:700,fontSize:14}}>{"USD "+val.toFixed(2)}</div>
                        <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{fmt(val*a.tcCompra)+" | "+pct+"%"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{textAlign:"center",padding:40,color:"rgba(255,255,255,0.3)"}}>No hay activos. Usa "+ Comprar activo" para agregar.</div>
            )}
          </div>
          );
        })()}

        {/* ========== RECIBO ========== */}
        {tab==="recibo"&&<ReciboTab recibo={recibo} setRecibo={setRecibo} />}

      </div>
    </div>
  );
}

