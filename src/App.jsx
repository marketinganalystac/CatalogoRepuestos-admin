// ============================================================
//  Auto Centro — Catálogo de Repuestos
//  App.jsx  |  Firebase Firestore + XLSX + CSV
//  Homologado desde autocentro_buscador_v8.html
// ============================================================

import React, {
  useState, useEffect, useMemo, useRef, useCallback
} from 'react';

// ── Firebase ──────────────────────────────────────────────
import { initializeApp }              from 'firebase/app';
import {
  getFirestore, collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, writeBatch, serverTimestamp, query, orderBy
} from 'firebase/firestore';

// ── XLSX: carga dinámica desde CDN (sin dependencia npm) ──────────────
let XLSX = null;
const loadXLSX = () => new Promise((resolve, reject) => {
  if (XLSX) { resolve(XLSX); return; }
  if (window.XLSX) { XLSX = window.XLSX; resolve(XLSX); return; }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  script.onload  = () => { XLSX = window.XLSX; resolve(XLSX); };
  script.onerror = () => reject(new Error('No se pudo cargar la librería XLSX'));
  document.head.appendChild(script);
});

// ============================================================
//  🔥 FIREBASE CONFIG — reemplaza con los datos de tu proyecto
// ============================================================
const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT.firebaseapp.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const db_fs       = getFirestore(firebaseApp);

// ============================================================
//  CONSTANTES
// ============================================================
const PAGE_SIZE = 50;

const MARCAS = ['CHEVROLET','DAIHATSU','FORD','HONDA','HYUNDAI',
  'ISUZU','KIA','MAZDA','MITSUBISHI','NISSAN','SUZUKI','TOYOTA'];

const CLASIFICACIONES = ['BATERÍAS','BUJÍAS E IGNICIÓN','CLUTCH Y TRANSMISIÓN',
  'COMBUSTIBLE Y DIESEL','EJES Y RUEDAS','FILTROS','FRENOS',
  'MOTOR Y DISTRIBUCIÓN','SISTEMA ELÉCTRICO','SUSPENSIÓN Y DIRECCIÓN','ZUNCHOS'];

const SUBCLASIFICACIONES = [
  'Amortiguadores','Balinera de Clutch','Balineras','Bandas de Freno',
  'Barra Estabilizadora','Barra Suspensión','Base de Motor',
  'Bases de Amortiguador','Baterías AGM','Baterías Especiales','Baterías MF',
  'Baterías UMF','Bolas / Rótulas','Bomba de Agua','Brazos y Links','Bujes',
  'Bujías','Bujías Iridium','Bujías Original','Bujías Platino','Bujías Racing',
  'Bujías de Cobre','Calibración','Cilindros de Freno','Correas','Cremallera',
  'Disco de Clutch','Discos de Freno','Esclavo de Clutch','Filtro A/C',
  'Filtro de Aceite','Filtro de Aire','Filtro de Combustible','Hub / Cubos',
  'Kit de Buje','Kit de Tiempo','Master de Clutch','Master de Freno',
  'Muñequilla / Ejes','Pastillas / Tacos','Pernos','Plato de Clutch','Relay',
  'Retenedoras','Tambores','Tensores','Terminales de Batería','Terminales y V',
  'Trampa de Diesel','Zunchos'
];

// Índice de columnas de un registro (array de 9 campos)
// [0]marca [1]modelo [2]modelo_orig [3]anio [4]desc_orig [5]codigo [6]desc_std [7]clasi [8]sub
const COL_DEFS = [
  { key: 0, label: 'Marca',            show: true  },
  { key: 1, label: 'Modelo',           show: true  },
  { key: 2, label: 'Modelo Original',  show: false },
  { key: 3, label: 'Año',             show: true  },
  { key: 4, label: 'Descripción',      show: true  },
  { key: 5, label: 'Código',           show: true  },
  { key: 6, label: 'Desc. Estándar',   show: false },
  { key: 7, label: 'Clasificación',    show: true  },
  { key: 8, label: 'Subclasificación', show: true  },
];

// ============================================================
//  UTILITARIOS
// ============================================================
const escH = (s) => String(s ?? '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const nowDateTime = () => {
  const d = new Date();
  return {
    fecha: d.toLocaleDateString('es-PA'),
    hora:  d.toLocaleTimeString('es-PA', { hour:'2-digit', minute:'2-digit' })
  };
};

const highlightText = (text, query) => {
  if (!query || !text) return text ?? '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="ac-mark">{p}</mark>
      : p
  );
};

// ============================================================
//  CSS-IN-JS — inyectado una sola vez
// ============================================================
const STYLES = `
:root {
  --bd:#1A3F6F; --bm:#0060A0; --bl:#E8F2FA;
  --gold:#D4A800; --gl:#FDF6DC;
  --w:#fff; --g1:#F5F7FA; --g2:#E8ECF0; --g3:#CFD8DC;
  --g5:#78909C; --g7:#37474F; --g9:#1A2530;
  --red:#C62828; --grn:#2E7D32; --org:#D84315;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:var(--g1);color:var(--g9);min-height:100vh}

/* ─ Header ─ */
.ac-header{background:linear-gradient(135deg,var(--bd) 0%,var(--bm) 100%);padding:0 24px;
  border-bottom:3px solid var(--gold);box-shadow:0 2px 10px rgba(0,0,0,.25);
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;min-height:58px}
.ac-hl{display:flex;align-items:center;gap:16px}
.ac-logo{height:42px;border-radius:5px}
.ac-hdiv{width:1px;height:30px;background:rgba(255,255,255,.3)}
.ac-htitle{display:flex;flex-direction:column}
.ac-htitle .s1{font-size:.62rem;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1px;font-weight:600}
.ac-htitle .s2{font-size:.92rem;color:#fff;font-weight:700}
.ac-badge{background:rgba(255,255,255,.15);color:#fff;font-size:.74rem;font-weight:700;
  padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.25)}
.ac-hact{display:flex;gap:7px;flex-wrap:wrap;align-items:center}

/* ─ Buttons ─ */
.btn{padding:7px 15px;border:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer;transition:.18s;white-space:nowrap}
.btn-p{background:var(--bm);color:#fff}.btn-p:hover{background:var(--bd)}
.btn-g{background:var(--gold);color:var(--bd)}.btn-g:hover{background:#c49a00}
.btn-c{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.25)}.btn-c:hover{background:rgba(255,255,255,.25)}
.btn-r{background:var(--red);color:#fff}.btn-r:hover{background:#8B0000}
.btn-o{background:#fff;border:1.5px solid var(--bm);color:var(--bm)}.btn-o:hover{background:var(--bl)}
.btn-sm{padding:3px 9px;font-size:.7rem;border-radius:5px}
.btn-dark{background:var(--bd);color:#fff;border:none}.btn-dark:hover{background:#102a50}
.btn-org{background:var(--org);color:#fff}.btn-org:hover{background:#b23610}
.btn-slate{background:#546E7A;color:#fff}.btn-slate:hover{background:#37474F}
.btn-edit{padding:3px 9px;background:var(--bm);color:#fff;border:none;border-radius:5px;font-size:.7rem;cursor:pointer;font-weight:600}
.btn-edit:hover{background:var(--bd)}
.btn-del{padding:3px 9px;background:#FFEBEE;color:var(--red);border:1px solid #FFCDD2;border-radius:5px;font-size:.7rem;cursor:pointer;font-weight:600;margin-left:4px}
.btn-del:hover{background:var(--red);color:#fff}
.btn-copy{padding:2px 6px;background:var(--bl);border:1px solid #90CAF9;border-radius:4px;font-size:.68rem;cursor:pointer;color:var(--bm);font-weight:600;margin-left:5px}
.btn-copy:hover{background:var(--bm);color:#fff}
.btn:disabled{opacity:.45;cursor:default}

/* ─ Search Panel ─ */
.ac-sp{background:#fff;border-bottom:1px solid var(--g2);padding:14px 24px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.ac-fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px;margin-bottom:10px}
.ac-fl{display:flex;flex-direction:column;gap:3px}
.ac-fl label{font-size:.67rem;color:var(--bm);font-weight:700;text-transform:uppercase;letter-spacing:.6px}
select,input[type=text]{background:var(--g1);border:1.5px solid var(--g3);color:var(--g9);
  padding:7px 10px;border-radius:6px;font-size:.82rem;outline:none;transition:.18s;width:100%}
select:focus,input[type=text]:focus{border-color:var(--bm);background:#fff;box-shadow:0 0 0 3px rgba(0,96,160,.12)}
.ac-sr{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
.ac-sr .ac-fl{flex:1;min-width:200px}

/* ─ Status Bar ─ */
.ac-sb{background:var(--bd);padding:6px 24px;display:flex;align-items:center;gap:14px;font-size:.76rem;color:rgba(255,255,255,.7);flex-wrap:wrap}
.ac-sb strong{color:#fff}
.ac-sep{color:rgba(255,255,255,.3)}
.ac-tag{display:inline-flex;align-items:center;padding:2px 9px;border-radius:10px;font-size:.68rem;font-weight:700;color:#fff}

/* ─ Quick Stats ─ */
.ac-qs{background:#fff;border-bottom:1px solid var(--g2);padding:8px 24px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.ac-qi{display:flex;align-items:center;gap:6px;background:var(--bl);border:1px solid #B3D4F0;border-radius:8px;padding:5px 12px}
.ac-qi .n{font-size:1rem;font-weight:800;color:var(--bd);line-height:1}
.ac-qi .l{color:var(--bm);font-size:.67rem;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.ac-qsep{width:1px;height:24px;background:var(--g2)}

/* ─ Table ─ */
.ac-tw{overflow:auto;max-height:calc(100vh - 310px);background:#fff}
table{width:100%;border-collapse:collapse;font-size:.81rem}
thead th{background:var(--bd);color:rgba(255,255,255,.9);padding:9px 13px;text-align:left;
  font-size:.69rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
  position:sticky;top:0;z-index:10;white-space:nowrap;border-right:1px solid rgba(255,255,255,.1);
  cursor:pointer;user-select:none;transition:.15s}
thead th:hover{background:var(--bm)}
thead th.sorted{background:var(--bm)}
thead th.sorted .si{opacity:1;color:var(--gold)}
thead th .si{margin-left:3px;opacity:.35;font-size:.62rem}
tbody tr{border-bottom:1px solid var(--g2);transition:background .1s}
tbody tr:hover{background:var(--bl)}
tbody tr:nth-child(even){background:#FAFBFD}
tbody tr:nth-child(even):hover{background:var(--bl)}
tbody td{padding:7px 13px;vertical-align:middle}
.cm{font-weight:800;color:var(--bd);white-space:nowrap;font-size:.84rem}
.cmo{color:var(--g7);white-space:nowrap;font-weight:500}
.ca{font-weight:800;color:var(--bd);background:var(--gl);border-radius:4px;font-size:.8rem;padding:2px 6px;white-space:nowrap;display:inline-block}
.cc{font-family:'Courier New',monospace;color:var(--grn);font-size:.77rem;font-weight:700;background:#F1F8E9;padding:2px 7px;border-radius:4px;display:inline-block;white-space:nowrap}
.cds{color:var(--g9);font-weight:600}
.ct{display:inline-block;padding:2px 9px;border-radius:9px;font-size:.67rem;font-weight:700;color:#fff;white-space:nowrap}
.cs{color:var(--g5);font-size:.75rem;font-style:italic}
.cac{white-space:nowrap;text-align:center}
.ac-mark{background:#FFE082;color:#333;border-radius:2px;padding:0 2px}

/* ─ Pagination ─ */
.ac-pg{background:#fff;padding:9px 24px;display:flex;align-items:center;gap:5px;
  border-top:2px solid var(--g2);flex-wrap:wrap;box-shadow:0 -1px 4px rgba(0,0,0,.05)}
.pb{padding:5px 12px;border:1.5px solid var(--g3);background:#fff;color:var(--g7);
  border-radius:6px;cursor:pointer;font-size:.77rem;font-weight:500;transition:.15s}
.pb:hover{background:var(--bl);border-color:#90CAF9;color:var(--bm)}
.pb.active{background:var(--bm);border-color:var(--bm);color:#fff;font-weight:700}
.pb:disabled{opacity:.3;cursor:default}
.pi{font-size:.76rem;color:var(--g5);margin-left:auto}

/* ─ Modals ─ */
.mo{display:none;position:fixed;inset:0;background:rgba(10,25,45,.6);z-index:1000;
  align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.mo.show{display:flex}
.md{background:#fff;border-radius:12px;width:min(680px,95vw);max-height:90vh;overflow-y:auto;
  box-shadow:0 24px 60px rgba(0,0,0,.3);animation:pop .2s ease}
.md.sm{max-width:440px}
@keyframes pop{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
.mh{padding:16px 22px 12px;border-bottom:2px solid var(--bl);display:flex;align-items:center;
  justify-content:space-between;background:var(--bd);border-radius:12px 12px 0 0}
.mh.danger{background:#7B1818}
.mh h2{font-size:.95rem;color:#fff;font-weight:700}
.mx{background:rgba(255,255,255,.15);border:none;font-size:1.1rem;cursor:pointer;color:#fff;
  border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;transition:.15s}
.mx:hover{background:var(--red)}
.mb{padding:20px 22px}
.mf{padding:14px 22px;border-top:1px solid var(--g2);display:flex;justify-content:flex-end;gap:8px;
  background:var(--g1);border-radius:0 0 12px 12px}

/* ─ Form grid ─ */
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fg2{display:flex;flex-direction:column;gap:4px}
.fg2.full{grid-column:1/-1}
.fg2 label{font-size:.68rem;color:var(--bm);font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.fg2 input,.fg2 select{background:var(--g1);border:1.5px solid var(--g3);color:var(--g9);
  padding:8px 11px;border-radius:7px;font-size:.84rem;outline:none;transition:.18s;width:100%}
.fg2 input:focus,.fg2 select:focus{border-color:var(--bm);background:#fff;box-shadow:0 0 0 3px rgba(0,96,160,.1)}
.fg2 input.err{border-color:var(--red);background:#FFF5F5}
.em{font-size:.68rem;color:var(--red);margin-top:1px}

/* ─ Import ─ */
.ib{border:2px dashed #90CAF9;border-radius:10px;padding:26px;text-align:center;
  background:var(--bl);cursor:pointer;transition:.2s}
.ib:hover,.ib.drag{border-color:var(--bm);background:#D0E8FA}
.ib .icon{font-size:2.4rem;margin-bottom:8px}
.ib p{color:var(--g5);font-size:.83rem}
.ii{margin-top:12px;background:#E8F5E9;border-radius:8px;padding:11px;font-size:.78rem;color:var(--grn);display:none}
.ii ul{margin-top:5px;padding-left:16px}
.ipv{margin-top:12px;font-size:.76rem;color:var(--g7);background:var(--g1);border-radius:6px;
  padding:10px;max-height:110px;overflow-y:auto;border:1px solid var(--g2)}
.wb{margin-top:12px;padding:10px 13px;background:#FFF8E1;border-radius:7px;
  font-size:.76rem;color:#8B6000;border-left:3px solid var(--gold)}
.cmr{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}
.cmrow{display:flex;align-items:center;gap:6px;font-size:.78rem;background:var(--g1);padding:5px 9px;border-radius:6px}
.cmrow span{color:var(--g5);min-width:130px;font-size:.74rem}
.cmrow select{flex:1;padding:3px 7px;font-size:.76rem}

/* ─ Detail rows ─ */
.dr{display:flex;gap:8px;margin-bottom:8px;font-size:.82rem}
.dr .lb{font-weight:700;color:var(--bm);min-width:130px;font-size:.74rem;text-transform:uppercase;padding-top:1px}
.dr .vl{color:var(--g9);flex:1}

/* ─ Toast ─ */
.toast{position:fixed;bottom:22px;right:22px;padding:11px 18px;border-radius:8px;font-size:.82rem;
  font-weight:600;box-shadow:0 4px 18px rgba(0,0,0,.2);z-index:2000;display:none;color:#fff;
  max-width:360px;animation:su .3s ease}
.toast.show{display:block}
.toast.success{background:var(--grn)}.toast.error{background:var(--red)}
.toast.info{background:var(--bm)}.toast.warning{background:var(--org)}
@keyframes su{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}

/* ─ Loading ─ */
.loading{text-align:center;padding:40px;color:var(--bm);background:#fff}
.spin{display:inline-block;width:22px;height:22px;border:3px solid var(--bl);
  border-top-color:var(--bm);border-radius:50%;animation:spin .75s linear infinite;
  margin-right:8px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.empty{text-align:center;padding:60px 20px;color:var(--g5);background:#fff}
.empty .icon{font-size:3rem;margin-bottom:10px}

/* ─ Historial ─ */
.mhist-wrap{overflow-y:auto;max-height:60vh}
.hlog-item{display:grid;grid-template-columns:180px 110px 1fr;border-bottom:1px solid var(--g2);font-size:.78rem}
.hlog-item:hover{background:var(--bl)}
.hlog-dt{padding:10px 14px;color:var(--g5);white-space:nowrap;font-size:.73rem;border-right:1px solid var(--g2)}
.hlog-op{padding:10px 12px;font-weight:700;border-right:1px solid var(--g2);display:flex;align-items:center;gap:5px}
.hlog-det{padding:10px 14px;color:var(--g7);line-height:1.5}
.hlog-det strong{color:var(--bd)}
.field-chg{display:inline-block;background:var(--gl);border:1px solid #e8d870;border-radius:4px;padding:1px 7px;margin:2px 3px 2px 0;font-size:.72rem}
.field-chg .old{color:var(--red);text-decoration:line-through;margin-right:4px}
.field-chg .new{color:var(--grn)}
.hlog-ip{font-size:.68rem;color:var(--g5);margin-top:3px}
.hop-add{color:var(--grn)}.hop-edit{color:var(--bm)}.hop-del{color:var(--red)}.hop-imp{color:var(--org)}
.hist-empty{text-align:center;padding:40px;color:var(--g5);font-size:.85rem}
.hist-toolbar{display:flex;gap:8px;align-items:center;padding:10px 16px;background:var(--g1);border-bottom:1px solid var(--g2);flex-wrap:wrap}
.hist-toolbar select{width:auto;padding:5px 8px;font-size:.76rem}

/* ─ Col toggles ─ */
.col-toggle-label{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.84rem;
  padding:6px 10px;border-radius:6px;background:var(--g1)}

/* ─ Firebase badge ─ */
.fb-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(255,167,38,.18);
  border:1px solid rgba(255,167,38,.4);border-radius:12px;padding:2px 9px;font-size:.65rem;
  font-weight:700;color:#FF8F00;letter-spacing:.5px}
.fb-dot{width:6px;height:6px;border-radius:50%;background:#4CAF50;display:inline-block}
.fb-dot.connecting{background:var(--gold);animation:spin .8s linear infinite}
.fb-dot.error{background:var(--red)}
`;

// ============================================================
//  FIRESTORE HELPERS
// ============================================================
const COL_RECORDS  = 'repuestos';
const COL_CHANGELOG = 'changelog';

async function fsGetAll(colName) {
  const snap = await getDocs(collection(db_fs, colName));
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
}

async function fsAdd(colName, data) {
  const ref = await addDoc(collection(db_fs, colName), {
    ...data, _ts: serverTimestamp()
  });
  return ref.id;
}

async function fsUpdate(id, data) {
  await updateDoc(doc(db_fs, COL_RECORDS, id), {
    ...data, _ts: serverTimestamp()
  });
}

async function fsDelete(id) {
  await deleteDoc(doc(db_fs, COL_RECORDS, id));
}

async function fsBatchWrite(records) {
  // Firestore limita 500 ops por batch
  const CHUNK = 490;
  for (let i = 0; i < records.length; i += CHUNK) {
    const batch = writeBatch(db_fs);
    records.slice(i, i + CHUNK).forEach(r => {
      const ref = doc(collection(db_fs, COL_RECORDS));
      batch.set(ref, { ...r, _ts: serverTimestamp() });
    });
    await batch.commit();
  }
}

async function fsAddLog(entry) {
  await addDoc(collection(db_fs, COL_CHANGELOG), {
    ...entry, _ts: serverTimestamp()
  });
}

// ============================================================
//  XLSX / CSV PARSER  → array de 9 campos
// ============================================================
const EXPECTED_FIELDS = ['marca','modelo','modelo_original','anio',
  'descripcion_original','codigo','descripcion_estandar','clasificacion','subclasificacion'];

function parseWorkbook(wb, xlsxLib) {
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows  = xlsxLib.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rows.length < 2) return { records: [], headers: [] };

  const rawHeaders = rows[0].map(h => String(h).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9_]/g,'_'));

  // Auto-map: busca la columna más parecida
  const colMap = EXPECTED_FIELDS.map(f => {
    const exact = rawHeaders.indexOf(f);
    if (exact >= 0) return exact;
    const partial = rawHeaders.findIndex(h => h.includes(f.split('_')[0]));
    return partial >= 0 ? partial : -1;
  });

  const records = rows.slice(1)
    .filter(r => r.some(c => String(c).trim()))
    .map(r => colMap.map(ci => ci >= 0 ? String(r[ci] ?? '').trim() : ''));

  return { records, headers: rawHeaders, colMap };
}

// ============================================================
//  COMPONENTE TOAST
// ============================================================
const ToastCtx = React.createContext(null);
const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ msg:'', type:'info', show: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = 'info') => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, show: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.msg}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => React.useContext(ToastCtx);

// ============================================================
//  MODAL AGREGAR / EDITAR
// ============================================================
const ModalEdit = ({ record, onSave, onClose }) => {
  const toast   = useToast();
  const isNew   = !record?._id;
  const [form, setForm] = useState(() =>
    record ? [...record.fields] : ['','','','','','','','','']
  );
  const [errors, setErrors] = useState([]);

  const validate = () => {
    const e = [];
    if (!form[0]) e.push(0); // marca
    if (!form[1]) e.push(1); // modelo
    if (!form[3]) e.push(3); // anio
    if (!form[4]) e.push(4); // desc orig
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (e.length) { setErrors(e); return; }
    await onSave({ fields: form });
    onClose();
  };

  const labels = ['Marca *','Modelo *','Modelo Original','Año *',
    'Descripción Original *','Código','Descripción Estándar',
    'Clasificación','Subclasificación'];

  const renderField = (i) => {
    const isErr = errors.includes(i);
    if (i === 7) return (
      <select value={form[i]} onChange={e => { setForm(f => { const n=[...f]; n[i]=e.target.value; return n; }); }}
        style={{ background:'var(--g1)',border:`1.5px solid ${isErr?'var(--red)':'var(--g3)'}`,
          color:'var(--g9)',padding:'8px 11px',borderRadius:7,fontSize:'.84rem',width:'100%',outline:'none' }}>
        <option value="">— Seleccionar —</option>
        {CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
      </select>
    );
    if (i === 8) return (
      <select value={form[i]} onChange={e => { setForm(f => { const n=[...f]; n[i]=e.target.value; return n; }); }}
        style={{ background:'var(--g1)',border:'1.5px solid var(--g3)',
          color:'var(--g9)',padding:'8px 11px',borderRadius:7,fontSize:'.84rem',width:'100%',outline:'none' }}>
        <option value="">— Seleccionar —</option>
        {SUBCLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
      </select>
    );
    const upper = [0,1,2,6].includes(i);
    return (
      <input
        className={isErr ? 'err' : ''}
        type="text"
        value={form[i]}
        onChange={e => {
          let v = e.target.value;
          if (upper) v = v.toUpperCase();
          setForm(f => { const n=[...f]; n[i]=v; return n; });
          setErrors(er => er.filter(x => x !== i));
        }}
      />
    );
  };

  return (
    <div className="mo show">
      <div className="md">
        <div className="mh">
          <h2>{isNew ? '➕ Nuevo Registro' : '✏️ Editar Registro'}</h2>
          <button className="mx" onClick={onClose}>×</button>
        </div>
        <div className="mb">
          <div className="fgrid">
            {labels.map((lbl, i) => (
              <div key={i} className={`fg2${i === 4 || i === 6 ? ' full' : ''}`}>
                <label>{lbl}</label>
                {renderField(i)}
                {errors.includes(i) && <span className="em">Campo requerido</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" onClick={handleSave}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL ELIMINAR
// ============================================================
const ModalDelete = ({ record, onConfirm, onClose }) => {
  if (!record) return null;
  return (
    <div className="mo show">
      <div className="md sm">
        <div className="mh danger">
          <h2>🗑 Eliminar Registro</h2>
          <button className="mx" onClick={onClose}>×</button>
        </div>
        <div className="mb">
          <p style={{fontSize:'.87rem',color:'var(--g7)',lineHeight:1.6}}>
            ¿Confirmas la eliminación? Esta acción <strong>no se puede deshacer</strong>.
          </p>
          <div style={{marginTop:12,background:'#FFF5F5',border:'1px solid #FFCDD2',
            borderLeft:'3px solid var(--red)',borderRadius:8,padding:11,fontSize:'.79rem',color:'var(--red)'}}>
            <strong>{record.fields[0]}</strong> {record.fields[1]} {record.fields[3]}
            {record.fields[4] && <><br/><span style={{color:'var(--g7)'}}>{record.fields[4]}</span></>}
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-r" onClick={onConfirm}>🗑 Eliminar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL DETALLE
// ============================================================
const ModalDetail = ({ record, onClose, onEdit }) => {
  if (!record) return null;
  const labels = ['Marca','Modelo','Modelo Original','Año',
    'Descripción Original','Código','Descripción Estándar','Clasificación','Subclasificación'];
  return (
    <div className="mo show">
      <div className="md sm">
        <div className="mh">
          <h2>📋 Detalle del Registro</h2>
          <button className="mx" onClick={onClose}>×</button>
        </div>
        <div className="mb">
          {labels.map((lbl, i) => record.fields[i] ? (
            <div key={i} className="dr">
              <span className="lb">{lbl}</span>
              <span className="vl">{record.fields[i]}</span>
            </div>
          ) : null)}
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose}>Cerrar</button>
          <button className="btn btn-p" onClick={() => { onClose(); onEdit(record); }}>✏ Editar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL IMPORTAR
// ============================================================
const ModalImport = ({ onClose, onImport, onRestore }) => {
  const toast      = useToast();
  const fileRef    = useRef(null);
  const [parsed,  setParsed]  = useState(null);   // { records, headers, colMap }
  const [mapping, setMapping] = useState([]);      // índice destino por columna origen
  const [isDrag,  setIsDrag]  = useState(false);

  const processFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const xlsxLib = await loadXLSX();
        let wb;
        if (ext === 'csv') {
          wb = xlsxLib.read(e.target.result, { type: 'string' });
        } else {
          wb = xlsxLib.read(e.target.result, { type: 'array' });
        }
        const result = parseWorkbook(wb, xlsxLib);
        if (!result.records.length) { toast('El archivo parece vacío o sin datos válidos.', 'error'); return; }
        setParsed(result);
        setMapping(result.colMap);
      } catch (err) {
        toast('Error leyendo el archivo: ' + err.message, 'error');
      }
    };

    if (ext === 'csv') reader.readAsText(file, 'UTF-8');
    else               reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDrag(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleImportAction = (mode) => {
    if (!parsed) return;
    // Remap usando mapping actual
    const records = parsed.records.map(row => {
      const mapped = Array(9).fill('');
      mapping.forEach((destIdx, srcIdx) => {
        if (destIdx >= 0 && destIdx < 9) mapped[destIdx] = row[srcIdx] ?? '';
      });
      return mapped;
    });
    onImport(records, mode);
    onClose();
  };

  return (
    <div className="mo show">
      <div className="md">
        <div className="mh">
          <h2>📂 Cargar Base de Datos</h2>
          <button className="mx" onClick={onClose}>×</button>
        </div>
        <div className="mb">
          <div
            className={`ib${isDrag ? ' drag' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={handleDrop}
          >
            <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx"
              style={{display:'none'}} onChange={e => processFile(e.target.files[0])} />
            <div className="icon">📄</div>
            <p><strong>Haz clic o arrastra tu archivo aquí</strong></p>
            <p style={{marginTop:5,fontSize:'.76rem'}}>Formatos: <strong>.csv</strong> · <strong>.xls</strong> · <strong>.xlsx</strong></p>
          </div>

          {parsed && (
            <>
              <div className="ii" style={{display:'block'}}>
                <strong>📋 Archivo detectado</strong>
                <ul>
                  <li>{parsed.records.length} registros encontrados</li>
                  <li>{parsed.headers.length} columnas detectadas</li>
                </ul>
              </div>
              <div style={{marginTop:12}}>
                <p style={{fontSize:'.8rem',fontWeight:700,color:'var(--g7)',marginBottom:6}}>
                  🗂 Mapeo de columnas
                </p>
                <div className="cmr">
                  {parsed.headers.map((h, si) => (
                    <div key={si} className="cmrow">
                      <span>{h}</span>
                      <select value={mapping[si] ?? -1}
                        onChange={e => setMapping(m => { const n=[...m]; n[si]=Number(e.target.value); return n; })}>
                        <option value={-1}>— ignorar —</option>
                        {EXPECTED_FIELDS.map((f,fi) => <option key={fi} value={fi}>{f}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ipv">
                <strong>Vista previa:</strong>
                <div style={{marginTop:5}}>
                  {parsed.records.slice(0,5).map((r,i) => (
                    <div key={i} style={{fontSize:'.72rem',color:'var(--g7)',padding:'2px 0',borderBottom:'1px solid var(--g2)'}}>
                      {r.filter(Boolean).slice(0,5).join(' · ')}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="wb">
            ⚠ <strong>Reemplazar</strong> borra todo y carga desde el archivo.
            <strong> Agregar</strong> añade al catálogo existente.
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-slate" onClick={onRestore}>🔁 Restaurar original</button>
          <button className="btn btn-org" onClick={() => handleImportAction('replace')} disabled={!parsed}>🔄 Reemplazar</button>
          <button className="btn btn-p"   onClick={() => handleImportAction('append')}  disabled={!parsed}>➕ Agregar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL COLUMNAS
// ============================================================
const ModalCols = ({ visibleCols, onChange, onClose }) => (
  <div className="mo show">
    <div className="md sm">
      <div className="mh">
        <h2>👁 Columnas visibles</h2>
        <button className="mx" onClick={onClose}>×</button>
      </div>
      <div className="mb">
        <p style={{fontSize:'.82rem',color:'var(--g5)',marginBottom:14}}>Activa o desactiva columnas.</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {visibleCols.map((col, i) => (
            <label key={i} className="col-toggle-label">
              <input type="checkbox" checked={col.show}
                onChange={e => onChange(i, e.target.checked)}
                style={{width:16,height:16,accentColor:'var(--bm)'}} />
              {col.label}
            </label>
          ))}
        </div>
      </div>
      <div className="mf"><button className="btn btn-p" onClick={onClose}>Aplicar</button></div>
    </div>
  </div>
);

// ============================================================
//  MODAL HISTORIAL
// ============================================================
const ModalHistory = ({ changelog, onClose }) => {
  const [filter, setFilter] = useState('');
  const list = filter ? changelog.filter(e => e.op === filter) : changelog;
  const opIcon = { AGREGAR:'✅', EDITAR:'✏️', ELIMINAR:'🗑', IMPORTAR:'📂' };
  const opCls  = { AGREGAR:'hop-add', EDITAR:'hop-edit', ELIMINAR:'hop-del', IMPORTAR:'hop-imp' };

  const exportCSV = () => {
    if (!changelog.length) return;
    const rows = [['#','Fecha','Hora','Operación','Resumen','Campos Cambiados']];
    changelog.forEach(e => {
      const cambios = (e.cambios||[]).map(c => `${c.campo}: "${c.antes}" → "${c.despues}"`).join(' | ');
      rows.push([e.id, e.fecha, e.hora, e.op, e.resumen, cambios]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'}));
    a.download = `historial_cambios_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="mo show">
      <div className="md" style={{maxWidth:860,width:'95vw'}}>
        <div className="mh"><h2>📋 Historial de Cambios</h2><button className="mx" onClick={onClose}>×</button></div>
        <div className="hist-toolbar">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{border:'1.5px solid var(--g3)',borderRadius:6}}>
            <option value="">Todas las operaciones</option>
            <option value="AGREGAR">✅ Agregar</option>
            <option value="EDITAR">✏️ Editar</option>
            <option value="ELIMINAR">🗑 Eliminar</option>
            <option value="IMPORTAR">📂 Importar</option>
          </select>
          <span style={{fontSize:'.76rem',color:'var(--g5)'}}>{list.length} registro(s)</span>
          <button className="btn btn-dark btn-sm" style={{marginLeft:'auto'}} onClick={exportCSV}>
            📥 Exportar historial
          </button>
        </div>
        <div className="mhist-wrap">
          {list.length === 0
            ? <div className="hist-empty">Sin registros de cambios aún.</div>
            : list.map((e, idx) => (
              <div key={idx} className="hlog-item">
                <div className="hlog-dt">📅 {e.fecha}<br/>🕐 {e.hora}</div>
                <div className={`hlog-op ${opCls[e.op]||''}`}>{opIcon[e.op]||''} {e.op}</div>
                <div className="hlog-det">
                  <div><strong>{e.resumen}</strong></div>
                  {(e.cambios||[]).map((c, ci) => (
                    <span key={ci} className="field-chg">
                      <em>{c.campo}:</em>{' '}
                      {c.antes && <span className="old">{c.antes}</span>}
                      {c.antes && c.despues && '→'}
                      {c.despues && <span className="new">{c.despues}</span>}
                    </span>
                  ))}
                  <div className="hlog-ip">🔥 Firebase · {e.fecha}</div>
                </div>
              </div>
            ))
          }
        </div>
        <div className="mf"><button className="btn btn-o" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
};

// ============================================================
//  MAIN APP
// ============================================================
export default function App() {
  // ─ Estado Firebase ─
  const [fbStatus,   setFbStatus]   = useState('connecting'); // connecting | ok | error
  const [loading,    setLoading]    = useState(true);

  // ─ Data ─
  const [records,    setRecords]    = useState([]);   // [{_id, fields:[9]}]
  const [changelog,  setChangelog]  = useState([]);

  // ─ Filtros ─
  const [fMarca,    setFMarca]    = useState('');
  const [fModelo,   setFModelo]   = useState('');
  const [fAnio,     setFAnio]     = useState('');
  const [fClasi,    setFClasi]    = useState('');
  const [fSub,      setFSub]      = useState('');
  const [fText,     setFText]     = useState('');
  const [debText,   setDebText]   = useState('');

  // ─ Tabla ─
  const [sortCol,   setSortCol]   = useState(-1);
  const [sortAsc,   setSortAsc]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [visibleCols, setVisibleCols] = useState(COL_DEFS.map(c => ({...c})));

  // ─ Modals ─
  const [modalEdit,   setModalEdit]   = useState(null);    // record | 'new' | null
  const [modalDel,    setModalDel]    = useState(null);
  const [modalDetail, setModalDetail] = useState(null);
  const [showImport,  setShowImport]  = useState(false);
  const [showCols,    setShowCols]    = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const toast = useToast();
  const debounceRef = useRef(null);

  // ─ Lógica de modelos/años en cascada ─
  const availableModels = useMemo(() => {
    if (!fMarca) return [];
    return [...new Set(records.filter(r => r.fields[0]===fMarca).map(r => r.fields[1]))].sort();
  }, [records, fMarca]);

  const availableYears = useMemo(() => {
    const base = fMarca ? records.filter(r => r.fields[0]===fMarca) : records;
    const filtered = fModelo ? base.filter(r => r.fields[1]===fModelo) : base;
    return [...new Set(filtered.map(r => r.fields[3]).filter(Boolean))].sort();
  }, [records, fMarca, fModelo]);

  const availableSubs = useMemo(() => {
    if (!fClasi) return SUBCLASIFICACIONES;
    return [...new Set(records.filter(r=>r.fields[7]===fClasi).map(r=>r.fields[8]).filter(Boolean))].sort();
  }, [records, fClasi]);

  // ─ Carga inicial desde Firestore ─
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [recs, logs] = await Promise.all([
          fsGetAll(COL_RECORDS),
          fsGetAll(COL_CHANGELOG)
        ]);
        // Normalizar: si el doc tiene campos individuales, reconstruir array fields
        const normalized = recs.map(r => {
          if (r.fields) return r;
          return {
            _id: r._id,
            fields: [
              r.marca||'', r.modelo||'', r.modelo_orig||'',
              r.anio||'', r.desc_orig||'', r.codigo||'',
              r.desc_std||'', r.clasi||'', r.sub||''
            ]
          };
        });
        setRecords(normalized);
        setChangelog(logs.sort((a,b) => (b._ts?.seconds||0) - (a._ts?.seconds||0)));
        setFbStatus('ok');
      } catch (err) {
        console.error(err);
        setFbStatus('error');
        toast('Error conectando a Firebase: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─ Debounce búsqueda ─
  const onTextInput = (v) => {
    setFText(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebText(v), 280);
  };

  // ─ Filtrado ─
  const filtered = useMemo(() => {
    let r = records;
    if (fMarca)  r = r.filter(x => x.fields[0] === fMarca);
    if (fModelo) r = r.filter(x => x.fields[1] === fModelo);
    if (fAnio)   r = r.filter(x => x.fields[3] === fAnio);
    if (fClasi)  r = r.filter(x => x.fields[7] === fClasi);
    if (fSub)    r = r.filter(x => x.fields[8] === fSub);
    if (debText) {
      const t = debText.toLowerCase();
      r = r.filter(x =>
        x.fields.some(f => String(f).toLowerCase().includes(t))
      );
    }
    if (sortCol >= 0) {
      r = [...r].sort((a,b) => {
        const av = String(a.fields[sortCol]||'').toLowerCase();
        const bv = String(b.fields[sortCol]||'').toLowerCase();
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return r;
  }, [records, fMarca, fModelo, fAnio, fClasi, fSub, debText, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  // Stats rápidos
  const stats = useMemo(() => ({
    total:    records.length,
    marcas:   new Set(records.map(r=>r.fields[0]).filter(Boolean)).size,
    modelos:  new Set(records.map(r=>r.fields[1]).filter(Boolean)).size,
    cats:     new Set(records.map(r=>r.fields[7]).filter(Boolean)).size,
    conCodigo: records.filter(r=>r.fields[5]).length,
  }), [records]);

  // ─ Handlers de filtros ─
  const onMarcaChange = (v) => { setFMarca(v); setFModelo(''); setFAnio(''); setPage(1); };
  const onModeloChange = (v) => { setFModelo(v); setFAnio(''); setPage(1); };
  const onClasiChange = (v) => { setFClasi(v); setFSub(''); setPage(1); };
  const clearAll = () => {
    setFMarca(''); setFModelo(''); setFAnio('');
    setFClasi(''); setFSub(''); setFText(''); setDebText('');
    setSortCol(-1); setSortAsc(true); setPage(1);
  };

  // ─ Sort ─
  const handleSort = (ci) => {
    if (sortCol === ci) setSortAsc(a => !a);
    else { setSortCol(ci); setSortAsc(true); }
    setPage(1);
  };

  // ─ CRUD Firestore ─
  const logEntry = async (op, resumen, cambios = []) => {
    const { fecha, hora } = nowDateTime();
    const entry = { op, resumen, cambios, fecha, hora, id: Date.now() };
    await fsAddLog(entry);
    setChangelog(prev => [{ ...entry, _id: 'local_' + Date.now() }, ...prev]);
  };

  const handleSaveNew = async ({ fields }) => {
    try {
      const id = await fsAdd(COL_RECORDS, { fields });
      const rec = { _id: id, fields };
      setRecords(prev => [rec, ...prev]);
      await logEntry('AGREGAR', `${fields[0]} ${fields[1]} ${fields[3]}`, [
        { campo:'Descripción', antes:'', despues: fields[4] }
      ]);
      toast('✅ Registro agregado y guardado en Firebase.', 'success');
    } catch (err) {
      toast('Error al guardar: ' + err.message, 'error');
    }
  };

  const handleSaveEdit = async (original, { fields }) => {
    try {
      await fsUpdate(original._id, { fields });
      setRecords(prev => prev.map(r => r._id === original._id ? { ...r, fields } : r));
      const cambios = fields.map((f, i) =>
        f !== original.fields[i]
          ? { campo: COL_DEFS[i].label, antes: original.fields[i], despues: f }
          : null
      ).filter(Boolean);
      await logEntry('EDITAR', `${fields[0]} ${fields[1]}`, cambios);
      toast('✏️ Registro actualizado en Firebase.', 'success');
    } catch (err) {
      toast('Error al actualizar: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    const rec = modalDel;
    try {
      await fsDelete(rec._id);
      setRecords(prev => prev.filter(r => r._id !== rec._id));
      await logEntry('ELIMINAR', `${rec.fields[0]} ${rec.fields[1]} ${rec.fields[3]}`);
      toast('🗑 Registro eliminado de Firebase.', 'warning');
    } catch (err) {
      toast('Error al eliminar: ' + err.message, 'error');
    }
    setModalDel(null);
  };

  // ─ Importar ─
  const handleImport = async (rows, mode) => {
    setLoading(true);
    try {
      if (mode === 'replace') {
        // Borrar todo primero
        const all = await fsGetAll(COL_RECORDS);
        const CHUNK = 490;
        for (let i = 0; i < all.length; i += CHUNK) {
          const batch = writeBatch(db_fs);
          all.slice(i, i+CHUNK).forEach(r => batch.delete(doc(db_fs, COL_RECORDS, r._id)));
          await batch.commit();
        }
      }
      const newRecs = rows.map(f => ({ fields: f }));
      await fsBatchWrite(newRecs);
      // Recargar
      const fresh = await fsGetAll(COL_RECORDS);
      const normalized = fresh.map(r => ({
        _id: r._id,
        fields: r.fields || ['','','','','','','','','']
      }));
      setRecords(normalized);
      await logEntry('IMPORTAR', `${mode==='replace'?'Reemplazo':'Adición'} de ${rows.length} registros`);
      toast(`📂 ${rows.length} registros importados a Firebase.`, 'success');
    } catch (err) {
      toast('Error en importación: ' + err.message, 'error');
    }
    setLoading(false);
    clearAll();
  };

  const handleRestore = async () => {
    if (!window.confirm('¿Restaurar la base original? Se perderán todos los cambios.')) return;
    // Aquí podrías cargar desde un JSON estático si lo deseas.
    toast('Sin base original configurada. Carga un archivo para empezar.', 'info');
  };

  // ─ Exportar CSV ─
  const exportCSV = () => {
    if (!filtered.length) { toast('No hay datos para exportar.', 'error'); return; }
    const header = COL_DEFS.map(c => c.label);
    const rows   = filtered.map(r => r.fields);
    const csv    = [header, ...rows].map(r =>
      r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
    ).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'}));
    a.download = `catalogo_repuestos_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast(`📥 Exportados ${filtered.length} registros.`, 'success');
  };

  // ─ Rendered columns ─
  const activeCols = visibleCols.filter(c => c.show);

  // ─ Color badge clasificación ─
  const clasiBgColor = (c) => {
    const map = {
      'BATERÍAS':'#1565C0','BUJÍAS E IGNICIÓN':'#6A1B9A','CLUTCH Y TRANSMISIÓN':'#4527A0',
      'COMBUSTIBLE Y DIESEL':'#E65100','EJES Y RUEDAS':'#00695C','FILTROS':'#2E7D32',
      'FRENOS':'#C62828','MOTOR Y DISTRIBUCIÓN':'#1B5E20','SISTEMA ELÉCTRICO':'#F57F17',
      'SUSPENSIÓN Y DIRECCIÓN':'#0277BD','ZUNCHOS':'#37474F',
    };
    return map[c] || '#546E7A';
  };

  // ─ Render ─
  return (
    <>
      {/* Inject styles */}
      <style>{STYLES}</style>

      {/* ── TOAST ── handled by provider */}

      {/* ── HEADER ── */}
      <div className="ac-header">
        <div className="ac-hl">
          {/* Logo — mismo base64 del HTML original se puede poner aquí, o usar img src */}
          <div style={{
            height:42,width:42,borderRadius:5,background:'var(--gold)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:900,fontSize:'1.1rem',color:'var(--bd)',letterSpacing:'-1px'
          }}>AC</div>
          <div className="ac-hdiv"/>
          <div className="ac-htitle">
            <span className="s1">Sistema de Gestión</span>
            <span className="s2">Catálogo de Repuestos</span>
          </div>
          <span className="ac-badge">{records.length.toLocaleString()} registros</span>
          {/* Firebase status */}
          <span className="fb-badge">
            <span className={`fb-dot${fbStatus==='connecting'?' connecting':fbStatus==='error'?' error':''}`}/>
            Firebase {fbStatus==='ok'?'●':fbStatus==='connecting'?'…':'✕'}
          </span>
        </div>

        <div className="ac-hact">
          <button className="btn btn-g" onClick={() => setModalEdit({ _id: null, fields: Array(9).fill('') })}>
            ➕ Nuevo
          </button>
          <button className="btn btn-c" onClick={() => setShowImport(true)}>📂 Cargar base</button>
          <button className="btn btn-c" onClick={exportCSV}>📥 CSV</button>
          <button className="btn btn-c" onClick={() => setShowCols(true)}>👁 Columnas</button>
          <button className="btn btn-c" onClick={() => setShowHistory(true)}>
            📋 Historial{' '}
            {changelog.length > 0 && (
              <span style={{background:'var(--gold)',color:'var(--bd)',borderRadius:10,padding:'1px 7px',fontSize:'.7rem',marginLeft:4}}>
                {changelog.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="ac-sp">
        <div className="ac-fg">
          <div className="ac-fl">
            <label>🅱 Marca</label>
            <select value={fMarca} onChange={e => onMarcaChange(e.target.value)}>
              <option value="">Todas las marcas</option>
              {MARCAS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="ac-fl">
            <label>🚗 Modelo</label>
            <select value={fModelo} onChange={e => onModeloChange(e.target.value)}>
              <option value="">Todos los modelos</option>
              {availableModels.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="ac-fl">
            <label>📅 Año</label>
            <select value={fAnio} onChange={e => { setFAnio(e.target.value); setPage(1); }}>
              <option value="">Todos los años</option>
              {availableYears.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="ac-fl">
            <label>🔎 Clasificación</label>
            <select value={fClasi} onChange={e => onClasiChange(e.target.value)}>
              <option value="">Todas</option>
              {CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="ac-fl">
            <label>📂 Subclasificación</label>
            <select value={fSub} onChange={e => { setFSub(e.target.value); setPage(1); }}>
              <option value="">Todas</option>
              {availableSubs.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="ac-sr">
          <div className="ac-fl">
            <label>🔍 Búsqueda libre — descripción, código, modelo…</label>
            <input type="text" value={fText}
              placeholder="Ej: filtro aceite, TSL420, amortiguador…"
              onChange={e => onTextInput(e.target.value)} />
          </div>
          <button className="btn btn-p" onClick={() => setPage(1)}>🔍 Buscar</button>
          <button className="btn btn-o" onClick={clearAll}>✕ Limpiar</button>
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div className="ac-sb">
        <span>Resultados: <strong>{filtered.length.toLocaleString()}</strong></span>
        <span className="ac-sep">|</span>
        <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
        <span style={{marginLeft:'auto',display:'flex',gap:5,flexWrap:'wrap'}}>
          {fMarca  && <span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>🅱 {fMarca}</span>}
          {fModelo && <span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>🚗 {fModelo}</span>}
          {fAnio   && <span className="ac-tag" style={{background:'rgba(212,168,0,.8)'}}>📅 {fAnio}</span>}
          {fClasi  && <span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>🔎 {fClasi.substring(0,20)}</span>}
          {fSub    && <span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>📂 {fSub}</span>}
          {debText && <span className="ac-tag" style={{background:'rgba(212,168,0,.8)'}}>🔍 "{debText}"</span>}
        </span>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="ac-qs">
        <div className="ac-qi"><div className="n">{stats.total.toLocaleString()}</div><div className="l">Total</div></div>
        <div className="ac-qsep"/>
        <div className="ac-qi"><div className="n">{stats.marcas}</div><div className="l">Marcas</div></div>
        <div className="ac-qsep"/>
        <div className="ac-qi"><div className="n">{stats.modelos}</div><div className="l">Modelos</div></div>
        <div className="ac-qsep"/>
        <div className="ac-qi"><div className="n">{stats.cats}</div><div className="l">Categorías</div></div>
        <div className="ac-qsep"/>
        <div className="ac-qi"><div className="n">{stats.conCodigo.toLocaleString()}</div><div className="l">Con código</div></div>
      </div>

      {/* ── TABLE ── */}
      <div className="ac-tw">
        {loading ? (
          <div className="loading"><span className="spin"/>Cargando desde Firebase…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="icon">🔎</div>
            <p>No se encontraron resultados.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {activeCols.map(col => (
                  <th key={col.key}
                    className={sortCol === col.key ? 'sorted' : ''}
                    onClick={() => handleSort(col.key)}>
                    {col.label}
                    <span className="si">
                      {sortCol === col.key ? (sortAsc ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                ))}
                <th style={{width:90}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((rec, ri) => {
                const f = rec.fields;
                const cellRenderers = {
                  0: () => <span className="cm">{highlightText(f[0], debText)}</span>,
                  1: () => <span className="cm">{highlightText(f[1], debText)}<br/><span className="cmo">{f[2]}</span></span>,
                  2: () => <span className="cmo">{f[2]}</span>,
                  3: () => <span className="ca">{highlightText(f[3], debText)}</span>,
                  4: () => <span className="cds">{highlightText(f[4], debText)}{f[6] && <><br/><span className="cs">{f[6]}</span></>}</span>,
                  5: () => f[5]
                    ? <><span className="cc">{highlightText(f[5], debText)}<button className="btn-copy" onClick={e=>{e.stopPropagation();navigator.clipboard?.writeText(f[5]);toast('📋 Código copiado','info')}}>⧉</button></span></>
                    : <span className="cs">—</span>,
                  6: () => <span className="cs">{f[6]}</span>,
                  7: () => f[7] ? <span className="ct" style={{background:clasiBgColor(f[7])}}>{f[7]}</span> : null,
                  8: () => <span className="cs">{f[8]}</span>,
                };
                return (
                  <tr key={rec._id || ri}>
                    {activeCols.map(col => (
                      <td key={col.key} onClick={() => setModalDetail(rec)} style={{cursor:'pointer'}}>
                        {cellRenderers[col.key] ? cellRenderers[col.key]() : f[col.key]}
                      </td>
                    ))}
                    <td className="cac" onClick={e => e.stopPropagation()}>
                      <button className="btn-edit" onClick={() => setModalEdit(rec)}>✏ Edit</button>
                      <button className="btn-del"  onClick={() => setModalDel(rec)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINACIÓN ── */}
      <div className="ac-pg">
        <button className="pb" disabled={page<=1} onClick={() => setPage(p => p-1)}>‹ Anterior</button>
        {(() => {
          const pages = [1];
          for (let i = Math.max(2, page-3); i <= Math.min(totalPages-1, page+3); i++) pages.push(i);
          if (!pages.includes(totalPages)) pages.push(totalPages);
          const els = [];
          let prev = 0;
          pages.forEach(p => {
            if (prev && p - prev > 1) els.push(<span key={`e${p}`} style={{color:'#B0BEC5',padding:'0 4px'}}>…</span>);
            els.push(
              <button key={p} className={`pb${p===page?' active':''}`} onClick={() => setPage(p)}>{p}</button>
            );
            prev = p;
          });
          return els;
        })()}
        <button className="pb" disabled={page>=totalPages} onClick={() => setPage(p => p+1)}>Siguiente ›</button>
        <span className="pi">
          Mostrando {((page-1)*PAGE_SIZE+1).toLocaleString()}–{Math.min(page*PAGE_SIZE, filtered.length).toLocaleString()} de {filtered.length.toLocaleString()}
        </span>
      </div>

      {/* ── MODALS ── */}
      {modalEdit && (
        <ModalEdit
          record={modalEdit._id ? modalEdit : null}
          onSave={async (data) => {
            if (modalEdit._id) await handleSaveEdit(modalEdit, data);
            else await handleSaveNew(data);
          }}
          onClose={() => setModalEdit(null)}
        />
      )}

      {modalDel && (
        <ModalDelete
          record={modalDel}
          onConfirm={handleDelete}
          onClose={() => setModalDel(null)}
        />
      )}

      {modalDetail && (
        <ModalDetail
          record={modalDetail}
          onClose={() => setModalDetail(null)}
          onEdit={(r) => { setModalDetail(null); setModalEdit(r); }}
        />
      )}

      {showImport && (
        <ModalImport
          onClose={() => setShowImport(false)}
          onImport={handleImport}
          onRestore={handleRestore}
        />
      )}

      {showCols && (
        <ModalCols
          visibleCols={visibleCols}
          onChange={(i, show) => setVisibleCols(v => v.map((c,ci) => ci===i ? {...c,show} : c))}
          onClose={() => setShowCols(false)}
        />
      )}

      {showHistory && (
        <ModalHistory
          changelog={changelog}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}

// ============================================================
//  WRAPPER CON PROVIDERS (usar en index.jsx/main.jsx)
// ============================================================
//  import App from './App';
//  import { ToastProvider } from './App';   ← o exportar por separado
//  <ToastProvider><App /></ToastProvider>
//
//  O simplemente exporta AppWithProviders como default:
// ============================================================
export { ToastProvider };

export function AppWithProviders() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}
