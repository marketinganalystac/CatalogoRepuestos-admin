// ============================================================
//  Auto Centro — Catálogo de Repuestos
//  App.jsx  |  Supabase + XLSX (CDN dinámico)
// ============================================================

import React, {
  useState, useEffect, useMemo, useRef, useCallback,
  createContext, useContext
} from 'react';

import { createClient } from '@supabase/supabase-js';

const LOGO_SRC = "data:image/jpeg;base64,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";



// ============================================================
//  SUPABASE CONFIG — Auto Centro Repuestos Aplicables
// ============================================================
const supabase = createClient(
  "https://vzjhzuvahejosdojllcm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amh6dXZhaGVqb3Nkb2psbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTI3NTAsImV4cCI6MjA4Nzc4ODc1MH0.8PNlIh3HQDIq1u6IiRQeKx3o9gZyNWU3SeZ4qJ_F7Ew"
);

// ============================================================
//  XLSX  —  carga dinámica CDN (sin dependencia npm)
// ============================================================
let _xlsxLib = null;
const loadXLSX = () => new Promise((resolve, reject) => {
  if (_xlsxLib)    { resolve(_xlsxLib); return; }
  if (window.XLSX) { _xlsxLib = window.XLSX; resolve(_xlsxLib); return; }
  const s = document.createElement('script');
  s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload  = () => { _xlsxLib = window.XLSX; resolve(_xlsxLib); };
  s.onerror = () => reject(new Error('No se pudo cargar XLSX'));
  document.head.appendChild(s);
});

// ============================================================
//  CONSTANTES
// ============================================================
const PAGE_SIZE     = 50;
const COL_RECORDS   = 'repuestos';
const COL_CHANGELOG = 'changelog';

const MARCAS_DEFAULT = ['CHEVROLET','DAIHATSU','FORD','HONDA','HYUNDAI',
  'ISUZU','KIA','MAZDA','MITSUBISHI','NISSAN','SUZUKI','TOYOTA'];

const CLASIFICACIONES_DEFAULT = ['BATERÍAS','BUJÍAS E IGNICIÓN','CLUTCH Y TRANSMISIÓN',
  'COMBUSTIBLE Y DIESEL','EJES Y RUEDAS','FILTROS','FRENOS',
  'MOTOR Y DISTRIBUCIÓN','SISTEMA ELÉCTRICO','SUSPENSIÓN Y DIRECCIÓN','ZUNCHOS'];

const SUBCLASIFICACIONES_DEFAULT = [
  'Amortiguadores','Balinera de Clutch','Balineras','Bandas de Freno',
  'Barra Estabilizadora','Barra Suspensión','Base de Motor','Bases de Amortiguador',
  'Baterías AGM','Baterías Especiales','Baterías MF','Baterías UMF','Bolas / Rótulas',
  'Bomba de Agua','Brazos y Links','Bujes','Bujías','Bujías Iridium','Bujías Original',
  'Bujías Platino','Bujías Racing','Bujías de Cobre','Calibración','Cilindros de Freno',
  'Correas','Cremallera','Disco de Clutch','Discos de Freno','Esclavo de Clutch',
  'Filtro A/C','Filtro de Aceite','Filtro de Aire','Filtro de Combustible','Hub / Cubos',
  'Kit de Buje','Kit de Tiempo','Master de Clutch','Master de Freno','Muñequilla / Ejes',
  'Pastillas / Tacos','Pernos','Plato de Clutch','Relay','Retenedoras','Tambores',
  'Tensores','Terminales de Batería','Terminales y V','Trampa de Diesel','Zunchos'
];

const DESC_STD_DEFAULT = [];

// Context para listas dinámicas (marcas, clasificaciones, subclasificaciones, desc estándar)
const ListasCtx = createContext(null);

// [0]marca [1]modelo [2]modelo_orig [3]periodo [4]desc_orig [5]codigo [6]desc_std [7]clasi [8]sub
const COL_DEFS = [
  { key:0, label:'Marca',            show:true  },
  { key:1, label:'Modelo',           show:true  },
  { key:2, label:'Modelo Original',  show:false },
  { key:3, label:'Período',              show:true  },
  { key:4, label:'Descripción',      show:false  },
  { key:5, label:'Código',           show:true  },
  { key:6, label:'Desc. Estándar',   show:true },
  { key:7, label:'Clasificación',    show:true  },
  { key:8, label:'Subclasificación', show:true  },
];

const EXPECTED_FIELDS = ['marca','modelo','modelo_original','periodo',
  'descripcion_original','codigo','descripcion_estandar','clasificacion','subclasificacion'];

// ============================================================
//  UTILIDADES
// ============================================================
/** Normaliza cualquier documento Supabase → { _id, fields:[9] } */
const normalizeDoc = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw.fields) && raw.fields.length === 9)
    return { _id: raw._id, fields: raw.fields.map(v => String(v ?? '')) };
  // compatibilidad con campos planos
  return {
    _id: raw._id,
    fields: [
      String(raw.marca       ?? raw.f0 ?? ''),
      String(raw.modelo      ?? raw.f1 ?? ''),
      String(raw.modelo_orig ?? raw.f2 ?? ''),
      String(raw.periodo        ?? raw.f3 ?? ''),
      String(raw.desc_orig   ?? raw.f4 ?? ''),
      String(raw.codigo      ?? raw.f5 ?? ''),
      String(raw.desc_std    ?? raw.f6 ?? ''),
      String(raw.clasi       ?? raw.f7 ?? ''),
      String(raw.sub         ?? raw.f8 ?? ''),
    ]
  };
};

const nowDT = () => {
  const d = new Date();
  return {
    fecha: d.toLocaleDateString('es-PA'),
    hora:  d.toLocaleTimeString('es-PA', { hour:'2-digit', minute:'2-digit' })
  };
};

const highlightText = (text, query) => {
  if (!query || !text) return String(text ?? '');
  const esc   = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${esc})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="ac-mark">{p}</mark>
      : p
  );
};

// Normaliza un header de columna: quita acentos, ñ→n, espacios→_, minúsculas
function normalizeHeader(h) {
  return String(h).trim().toLowerCase()
    .replace(/ñ/g, 'n')           // ñ → n ANTES de normalize
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
    .replace(/ó/g,'o').replace(/ú/g,'u').replace(/ü/g,'u')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]/g,'_')
    .replace(/_+/g,'_')
    .replace(/^_|_$/g,'');
}

// Variantes aceptadas por campo (para mapeo robusto)
const FIELD_ALIASES = {
  'marca':                  ['marca'],
  'modelo':                 ['modelo'],
  'modelo_original':        ['modelo_original','modelo_orig','original'],
  'periodo': ['periodo','period','per','ano','anio','año','year','a_no','yr','fecha'],
  'descripcion_original':   ['descripcion_original','descripcion','desc','desc_orig','description','descripcion_orig'],
  'codigo':                 ['codigo','code','cod','sku','referencia','ref','part_number','part','numero'],
  'descripcion_estandar':   ['descripcion_estandar','desc_estandar','estandar','desc_std','descripcion_std','descripcion_est'],
  'clasificacion':          ['clasificacion','clasificac','categoria','category','clasi','clasificacion'],
  'subclasificacion':       ['subclasificacion','subclasif','subcategoria','sub','subcat','subclasi'],
};

function parseWorkbook(wb, xlsxLib) {
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows  = xlsxLib.utils.sheet_to_json(sheet, { header:1, defval:'' });
  if (rows.length < 2) return { records:[], headers:[], origHeaders:[], colMap:[], displayMapping:[] };

  // Guardar headers originales (para mostrar al usuario tal como están en el archivo)
  const origHeaders = rows[0].map(h => String(h).trim());
  // Normalizar headers para comparación interna
  const rawH = origHeaders.map(normalizeHeader);

  // Mapeo inteligente con aliases
  const colMap = EXPECTED_FIELDS.map(field => {
    // Normalizar el field también para comparación justa
    const normField = normalizeHeader(field);
    const aliases = FIELD_ALIASES[field] || [normField];
    for (const alias of aliases) {
      const idx = rawH.findIndex(h => h === alias || h.startsWith(alias + '_') || h.startsWith(alias));
      if (idx >= 0) return idx;
    }
    // Fallback: busca si algún header normalizado contiene la primera palabra del field normalizado
    const first = normField.split('_')[0];
    if (first.length >= 3) {
      const idx = rawH.findIndex(h => h.includes(first));
      if (idx >= 0) return idx;
    }
    return -1;
  });

  const records = rows.slice(1)
    .filter(r => r.some(c => String(c).trim() !== ''))
    .map(r => colMap.map(ci => ci >= 0 ? String(r[ci] ?? '').trim() : ''));

  // displayMapping[srcColIdx] = destFieldIdx (-1 = ignorar)
  // La UI itera por columnas fuente, necesita saber a qué campo destino va cada una
  const displayMapping = Array(rawH.length).fill(-1);
  colMap.forEach((srcIdx, destIdx) => {
    if (srcIdx >= 0 && srcIdx < rawH.length) displayMapping[srcIdx] = destIdx;
  });

  return { records, headers: rawH, origHeaders, colMap, displayMapping };
}

const clasiBgColor = c => ({
  'BATERÍAS':'#1565C0','BUJÍAS E IGNICIÓN':'#6A1B9A','CLUTCH Y TRANSMISIÓN':'#4527A0',
  'COMBUSTIBLE Y DIESEL':'#E65100','EJES Y RUEDAS':'#00695C','FILTROS':'#2E7D32',
  'FRENOS':'#C62828','MOTOR Y DISTRIBUCIÓN':'#1B5E20','SISTEMA ELÉCTRICO':'#F57F17',
  'SUSPENSIÓN Y DIRECCIÓN':'#0277BD','ZUNCHOS':'#37474F',
}[c] || '#546E7A');

// ============================================================
//  SUPABASE HELPERS
// ============================================================
const fsGetAll = async (col, onProgress) => {
  const PAGE = 1000;
  let allRows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(col)
      .select('*')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (onProgress) onProgress(allRows.length);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allRows.map(r => ({ ...r, _id: String(r.id) }));
};

const fsAdd = async (col, data) => {
  const { data: row, error } = await supabase
    .from(col)
    .insert([{ ...data }])
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return String(row.id);
};

const fsUpdate = async (id, data) => {
  const { error } = await supabase
    .from(COL_RECORDS)
    .update({ ...data })
    .eq('id', id);
  if (error) throw new Error(error.message);
};

const fsDelete = async (id) => {
  const { error } = await supabase
    .from(COL_RECORDS)
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
};

const fsAddLog = async (entry) => {
  const { error } = await supabase
    .from(COL_CHANGELOG)
    .insert([{ ...entry }]);
  if (error) throw new Error(error.message);
};

const fsDeleteAll = async () => {
  // Supabase requiere un filtro; usamos gt para UUIDs/integers cubrir todos los registros
  const { error } = await supabase
    .from(COL_RECORDS)
    .delete()
    .not('id', 'is', null);
  if (error) throw new Error(error.message);
};

// ============================================================
//  TOAST CONTEXT  — SIEMPRE envuelto en el export default
// ============================================================
const ToastCtx = createContext(null);

function ToastProvider({ children }) {
  const [state, setState] = useState({ msg:'', type:'info', visible:false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = 'info') => {
    clearTimeout(timerRef.current);
    setState({ msg, type, visible: true });
    timerRef.current = setTimeout(
      () => setState(s => ({ ...s, visible: false })), 3400
    );
  }, []);

  const bgMap = { success:'#2E7D32', error:'#C62828', info:'#0060A0', warning:'#D84315' };

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div
        className={`toast ${state.visible ? 'show' : ''}`}
        style={{ background: bgMap[state.type] || bgMap.info }}
      >
        {state.msg}
      </div>
    </ToastCtx.Provider>
  );
}

// Fallback seguro: si por algún error no hay Provider, loguea en consola y no rompe
const useToast = () => useContext(ToastCtx) ?? ((m) => console.warn('[Toast sin Provider]', m));

// ============================================================
//  ESTILOS
// ============================================================
const STYLES = `
:root{
  --bd:#1A3F6F;--bm:#0060A0;--bl:#E8F2FA;--gold:#D4A800;--gl:#FDF6DC;
  --g1:#F5F7FA;--g2:#E8ECF0;--g3:#CFD8DC;--g5:#78909C;--g7:#37474F;--g9:#1A2530;
  --red:#C62828;--grn:#2E7D32;--org:#D84315;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:var(--g1);color:var(--g9);min-height:100vh}
.ac-header{background:linear-gradient(135deg,var(--bd),var(--bm));padding:0 24px;
  border-bottom:3px solid var(--gold);box-shadow:0 2px 10px rgba(0,0,0,.25);
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;min-height:58px}
.ac-hl{display:flex;align-items:center;gap:16px}
.ac-hdiv{width:1px;height:30px;background:rgba(255,255,255,.3)}
.ac-htitle .s1{font-size:.62rem;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1px;font-weight:600;display:block}
.ac-htitle .s2{font-size:.92rem;color:#fff;font-weight:700;display:block}
.ac-badge{background:rgba(255,255,255,.15);color:#fff;font-size:.74rem;font-weight:700;
  padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.25)}
.ac-hact{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
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
.ac-sp{background:#fff;border-bottom:1px solid var(--g2);padding:14px 24px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.ac-fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px;margin-bottom:10px}
.ac-fl{display:flex;flex-direction:column;gap:3px}
.ac-fl label{font-size:.67rem;color:var(--bm);font-weight:700;text-transform:uppercase;letter-spacing:.6px}
select,input[type=text]{background:var(--g1);border:1.5px solid var(--g3);color:var(--g9);
  padding:7px 10px;border-radius:6px;font-size:.82rem;outline:none;transition:.18s;width:100%}
select:focus,input[type=text]:focus{border-color:var(--bm);background:#fff;box-shadow:0 0 0 3px rgba(0,96,160,.12)}
.ac-sr{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
.ac-sr .ac-fl{flex:1;min-width:200px}
.ac-sb{background:var(--bd);padding:6px 24px;display:flex;align-items:center;gap:14px;font-size:.76rem;color:rgba(255,255,255,.7);flex-wrap:wrap}
.ac-sb strong{color:#fff}
.ac-sep{color:rgba(255,255,255,.3)}
.ac-tag{display:inline-flex;align-items:center;padding:2px 9px;border-radius:10px;font-size:.68rem;font-weight:700;color:#fff}
.ac-qs{background:#fff;border-bottom:1px solid var(--g2);padding:8px 24px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.ac-qi{display:flex;align-items:center;gap:6px;background:var(--bl);border:1px solid #B3D4F0;border-radius:8px;padding:5px 12px}
.ac-qi .n{font-size:1rem;font-weight:800;color:var(--bd);line-height:1}
.ac-qi .l{color:var(--bm);font-size:.67rem;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.ac-qsep{width:1px;height:24px;background:var(--g2)}
.ac-tw{overflow:auto;max-height:calc(100vh - 310px);background:#fff}
table{width:100%;border-collapse:collapse;font-size:.81rem}
thead th{background:var(--bd);color:rgba(255,255,255,.9);padding:9px 13px;text-align:left;
  font-size:.69rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
  position:sticky;top:0;z-index:10;white-space:nowrap;
  border-right:1px solid rgba(255,255,255,.1);cursor:pointer;user-select:none;transition:.15s}
thead th:hover,thead th.sorted{background:var(--bm)}
thead th .si{margin-left:3px;opacity:.35;font-size:.62rem}
thead th.sorted .si{opacity:1;color:var(--gold)}
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
.ac-pg{background:#fff;padding:9px 24px;display:flex;align-items:center;gap:5px;
  border-top:2px solid var(--g2);flex-wrap:wrap;box-shadow:0 -1px 4px rgba(0,0,0,.05)}
.pb{padding:5px 12px;border:1.5px solid var(--g3);background:#fff;color:var(--g7);
  border-radius:6px;cursor:pointer;font-size:.77rem;font-weight:500;transition:.15s}
.pb:hover{background:var(--bl);border-color:#90CAF9;color:var(--bm)}
.pb.active{background:var(--bm);border-color:var(--bm);color:#fff;font-weight:700}
.pb:disabled{opacity:.3;cursor:default}
.pi{font-size:.76rem;color:var(--g5);margin-left:auto}
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
  border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center}
.mx:hover{background:var(--red)}
.mb{padding:20px 22px}
.mf{padding:14px 22px;border-top:1px solid var(--g2);display:flex;justify-content:flex-end;gap:8px;
  background:var(--g1);border-radius:0 0 12px 12px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fg2{display:flex;flex-direction:column;gap:4px}
.fg2.full{grid-column:1/-1}
.fg2 label{font-size:.68rem;color:var(--bm);font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.fg2 input,.fg2 select{background:var(--g1);border:1.5px solid var(--g3);color:var(--g9);
  padding:8px 11px;border-radius:7px;font-size:.84rem;outline:none;transition:.18s;width:100%}
.fg2 input:focus,.fg2 select:focus{border-color:var(--bm);background:#fff;box-shadow:0 0 0 3px rgba(0,96,160,.1)}
.fg2 input.err{border-color:var(--red);background:#FFF5F5}
.em{font-size:.68rem;color:var(--red);margin-top:1px}
.ib{border:2px dashed #90CAF9;border-radius:10px;padding:26px;text-align:center;background:var(--bl);cursor:pointer;transition:.2s}
.ib:hover,.ib.drag{border-color:var(--bm);background:#D0E8FA}
.ib .icon{font-size:2.4rem;margin-bottom:8px}
.ib p{color:var(--g5);font-size:.83rem}
.ii{margin-top:12px;background:#E8F5E9;border-radius:8px;padding:11px;font-size:.78rem;color:var(--grn)}
.ii ul{margin-top:5px;padding-left:16px}
.ipv{margin-top:12px;font-size:.76rem;color:var(--g7);background:var(--g1);border-radius:6px;padding:10px;max-height:110px;overflow-y:auto;border:1px solid var(--g2)}
.wb{margin-top:12px;padding:10px 13px;background:#FFF8E1;border-radius:7px;font-size:.76rem;color:#8B6000;border-left:3px solid var(--gold)}
.cmr{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}
.cmrow{display:flex;align-items:center;gap:6px;font-size:.78rem;background:var(--g1);padding:5px 9px;border-radius:6px}
.cmrow.cmrow-ok{background:#E8F5E9;border:1px solid #C8E6C9}
.cmrow span{color:var(--g5);min-width:130px;font-size:.74rem}
.cmrow select{flex:1;padding:3px 7px;font-size:.76rem}
.dr{display:flex;gap:8px;margin-bottom:8px;font-size:.82rem}
.dr .lb{font-weight:700;color:var(--bm);min-width:130px;font-size:.74rem;text-transform:uppercase;padding-top:1px}
.dr .vl{color:var(--g9);flex:1}
.toast{position:fixed;bottom:22px;right:22px;padding:11px 18px;border-radius:8px;font-size:.82rem;
  font-weight:600;box-shadow:0 4px 18px rgba(0,0,0,.2);z-index:2000;display:none;color:#fff;
  max-width:360px;animation:su .3s ease}
.toast.show{display:block}
@keyframes su{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
.loading{text-align:center;padding:40px;color:var(--bm);background:#fff;font-size:.88rem}
.spin{display:inline-block;width:22px;height:22px;border:3px solid var(--bl);
  border-top-color:var(--bm);border-radius:50%;animation:spin .75s linear infinite;margin-right:8px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.empty{text-align:center;padding:60px 20px;color:var(--g5);background:#fff}
.empty .icon{font-size:3rem;margin-bottom:10px}
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
.col-toggle-label{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.84rem;padding:6px 10px;border-radius:6px;background:var(--g1)}
.fb-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,167,38,.18);
  border:1px solid rgba(255,167,38,.4);border-radius:12px;padding:2px 9px;font-size:.65rem;font-weight:700;color:#FF8F00}
.fb-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
/* ── BARRA DE PROGRESO ── */
.ac-progress-wrap{background:var(--bd);padding:0;overflow:hidden;height:0;transition:height .25s ease}
.ac-progress-wrap.active{height:36px}
.ac-progress-inner{display:flex;align-items:center;gap:12px;padding:0 24px;height:36px}
.ac-progress-label{font-size:.72rem;color:rgba(255,255,255,.85);font-weight:600;white-space:nowrap;min-width:220px}
.ac-progress-bar-bg{flex:1;background:rgba(255,255,255,.15);border-radius:20px;height:8px;overflow:hidden}
.ac-progress-bar-fill{height:100%;background:var(--gold);border-radius:20px;transition:width .3s ease}
.ac-progress-bar-fill.indeterminate{width:40%!important;animation:progress-slide 1.2s ease-in-out infinite}
@keyframes progress-slide{0%{margin-left:-40%}100%{margin-left:100%}}
.ac-progress-pct{font-size:.72rem;color:var(--gold);font-weight:700;min-width:38px;text-align:right}
`;

// ============================================================
//  MODAL — EDITAR / NUEVO
// ============================================================
const ModalEdit = ({ record, onSave, onClose }) => {
  const toast  = useToast();
  const listas = useContext(ListasCtx);
  const isNew  = !record?._id;
  const [form,   setForm]   = useState(() => record ? [...record.fields] : Array(9).fill(''));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [addingNew, setAddingNew] = useState(null); // {field: i, val: ''}

  const setField = (i, v) => {
    setForm(f => { const n=[...f]; n[i]=v; return n; });
    setErrors(e => e.filter(x => x !== i));
  };

  const handleSave = async () => {
    const errs = [0,1,3,4].filter(i => !form[i].trim());
    if (errs.length) { setErrors(errs); return; }
    setSaving(true);
    try { await onSave({ fields: form }); onClose(); }
    catch(e) { toast('Error al guardar: ' + e.message, 'error'); setSaving(false); }
  };

  const confirmAddNew = () => {
    if (!addingNew || !addingNew.val.trim()) { setAddingNew(null); return; }
    const val = addingNew.val.trim();
    const fi = addingNew.field;
    if (fi === 0) listas.addMarca(val.toUpperCase());
    if (fi === 6) listas.addDescStd(val.toUpperCase());
    if (fi === 7) listas.addClasi(val.toUpperCase());
    if (fi === 8) listas.addSub(val);
    setField(fi, fi === 8 ? val : val.toUpperCase());
    setAddingNew(null);
  };

  const labels = ['Marca *','Modelo *','Modelo Original','Período *',
    'Descripción Original *','Código','Descripción Estándar','Clasificación','Subclasificación'];

  const addNewBtn = (i) => (
    <button type="button" onClick={()=>setAddingNew({field:i,val:''})}
      style={{marginLeft:6,padding:'2px 8px',background:'var(--gold)',color:'var(--bd)',
        border:'none',borderRadius:5,fontSize:'.68rem',fontWeight:700,cursor:'pointer'}}>
      + Nueva
    </button>
  );

  const inputStyle = (i) => ({
    background:'var(--g1)',
    border:`1.5px solid ${errors.includes(i)?'var(--red)':'var(--g3)'}`,
    color:'var(--g9)',padding:'8px 11px',borderRadius:7,
    fontSize:'.84rem',width:'100%',outline:'none'
  });

  const renderField = (i) => {
    // Inline "add new" input
    if (addingNew && addingNew.field === i) return (
      <div style={{display:'flex',gap:5}}>
        <input autoFocus type="text" style={{...inputStyle(i),flex:1}}
          placeholder="Escribe el nuevo valor…"
          value={addingNew.val}
          onChange={e=>setAddingNew(a=>({...a,val:e.target.value}))}
          onKeyDown={e=>{if(e.key==='Enter')confirmAddNew();if(e.key==='Escape')setAddingNew(null);}}/>
        <button type="button" onClick={confirmAddNew}
          style={{padding:'0 12px',background:'var(--grn)',color:'#fff',border:'none',borderRadius:6,fontWeight:700,cursor:'pointer'}}>✓</button>
        <button type="button" onClick={()=>setAddingNew(null)}
          style={{padding:'0 10px',background:'var(--g3)',color:'var(--g7)',border:'none',borderRadius:6,cursor:'pointer'}}>✕</button>
      </div>
    );
    if (i===0) return (
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        <select value={form[i]} onChange={e=>setField(i,e.target.value)} style={{...inputStyle(i),flex:1}}>
          <option value="">— Seleccionar —</option>
          {listas.marcas.map(c=><option key={c}>{c}</option>)}
        </select>
        {addNewBtn(i)}
      </div>
    );
    if (i===6) return (
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        <select value={form[i]} onChange={e=>setField(i,e.target.value)} style={{...inputStyle(i),flex:1}}>
          <option value="">— Seleccionar —</option>
          {listas.descStd.map(c=><option key={c}>{c}</option>)}
        </select>
        {addNewBtn(i)}
      </div>
    );
    if (i===7) return (
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        <select value={form[i]} onChange={e=>setField(i,e.target.value)} style={{...inputStyle(i),flex:1}}>
          <option value="">— Seleccionar —</option>
          {listas.clasif.map(c=><option key={c}>{c}</option>)}
        </select>
        {addNewBtn(i)}
      </div>
    );
    if (i===8) return (
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        <select value={form[i]} onChange={e=>setField(i,e.target.value)} style={{...inputStyle(i),flex:1}}>
          <option value="">— Seleccionar —</option>
          {listas.subs.map(c=><option key={c}>{c}</option>)}
        </select>
        {addNewBtn(i)}
      </div>
    );
    const upper = [1,2].includes(i);
    return (
      <input type="text" style={inputStyle(i)} value={form[i]}
        onChange={e => setField(i, upper ? e.target.value.toUpperCase() : e.target.value)}/>
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
            {labels.map((lbl,i) => (
              <div key={i} className={`fg2${(i===4||i===6)?' full':''}`}>
                <label>{lbl}</label>
                {renderField(i)}
                {errors.includes(i) && <span className="em">Campo requerido</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn btn-p" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spin" style={{width:14,height:14,borderWidth:2}}/>Guardando…</> : '💾 Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL — ELIMINAR
// ============================================================
const ModalDelete = ({ record, onConfirm, onClose }) => {
  if (!record) return null;
  const f = record.fields;
  return (
    <div className="mo show">
      <div className="md sm">
        <div className="mh danger"><h2>🗑 Eliminar Registro</h2><button className="mx" onClick={onClose}>×</button></div>
        <div className="mb">
          <p style={{fontSize:'.87rem',color:'var(--g7)',lineHeight:1.6}}>
            ¿Confirmas la eliminación? Esta acción <strong>no se puede deshacer</strong>.
          </p>
          <div style={{marginTop:12,background:'#FFF5F5',border:'1px solid #FFCDD2',
            borderLeft:'3px solid var(--red)',borderRadius:8,padding:11,fontSize:'.79rem',color:'var(--red)'}}>
            <strong>{f[0]}</strong> {f[1]} {f[3]}
            {f[4] && <><br/><span style={{color:'var(--g7)'}}>{f[4]}</span></>}
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
//  MODAL — DETALLE
// ============================================================
const ModalDetail = ({ record, onClose, onEdit }) => {
  if (!record) return null;
  const labels = ['Marca','Modelo','Modelo Original','Período',
    'Descripción Original','Código','Descripción Estándar','Clasificación','Subclasificación'];
  return (
    <div className="mo show">
      <div className="md sm">
        <div className="mh"><h2>📋 Detalle del Registro</h2><button className="mx" onClick={onClose}>×</button></div>
        <div className="mb">
          {labels.map((lbl,i) => record.fields[i] ? (
            <div key={i} className="dr">
              <span className="lb">{lbl}</span><span className="vl">{record.fields[i]}</span>
            </div>
          ) : null)}
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose}>Cerrar</button>
          <button className="btn btn-p" onClick={()=>{onClose();onEdit(record);}}>✏ Editar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL — IMPORTAR
// ============================================================
const ModalImport = ({ onClose, onImport }) => {
  const toast    = useToast();
  const fileRef  = useRef(null);
  const [parsed,  setParsed]  = useState(null);
  const [mapping, setMapping] = useState([]);
  const [isDrag,  setIsDrag]  = useState(false);
  const [loading, setLoading] = useState(false);

  const processFile = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const xlsxLib = await loadXLSX();
      const buf     = await file.arrayBuffer();
      const wb      = xlsxLib.read(buf, { type:'array' });
      const result  = parseWorkbook(wb, xlsxLib);
      if (!result.records.length) { toast('Archivo vacío o sin datos válidos.','error'); return; }
      setParsed(result);
      setMapping(result.displayMapping); // displayMapping[srcCol] = destField (dirección correcta)
      toast(`✅ ${result.records.length} registros detectados.`,'success');
    } catch(e) {
      toast('Error leyendo archivo: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const doImport = async (mode) => {
    if (!parsed) return;
    const records = parsed.records.map(row => {
      const mapped = Array(9).fill('');
      mapping.forEach((destIdx, srcIdx) => {
        if (destIdx >= 0 && destIdx < 9) mapped[destIdx] = row[srcIdx] ?? '';
      });
      return mapped;
    });
    onClose(); // cerrar modal antes de la operación larga
    await onImport(records, mode);
  };

  return (
    <div className="mo show">
      <div className="md">
        <div className="mh"><h2>📂 Cargar Base de Datos</h2><button className="mx" onClick={onClose}>×</button></div>
        <div className="mb">
          <div
            className={`ib${isDrag?' drag':''}`}
            onClick={()=>fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setIsDrag(true);}}
            onDragLeave={()=>setIsDrag(false)}
            onDrop={e=>{e.preventDefault();setIsDrag(false);processFile(e.dataTransfer.files[0]);}}
          >
            <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx"
              style={{display:'none'}} onChange={e=>processFile(e.target.files[0])}/>
            {loading
              ? <><span className="spin"/><p>Procesando archivo…</p></>
              : <><div className="icon">📄</div>
                  <p><strong>Haz clic o arrastra tu archivo aquí</strong></p>
                  <p style={{marginTop:5,fontSize:'.76rem'}}>Formatos: <strong>.csv · .xls · .xlsx</strong></p>
                </>
            }
          </div>

          {parsed && (<>
            <div className="ii">
              <strong>📋 Archivo detectado</strong>
              <ul>
                <li>{parsed.records.length} registros encontrados</li>
                <li>{parsed.headers.length} columnas detectadas</li>
              </ul>
            </div>
            <div style={{marginTop:12}}>
              <p style={{fontSize:'.8rem',fontWeight:700,color:'var(--g7)',marginBottom:6}}>🗂 Mapeo de columnas
                <span style={{fontWeight:400,color:'var(--grn)',marginLeft:8,fontSize:'.72rem'}}>
                  ✅ {mapping.filter(v=>v>=0).length} de {parsed.headers.length} columnas detectadas automáticamente
                </span>
              </p>
              <div className="cmr">
                {(parsed.origHeaders || parsed.headers).map((h,si)=>(
                  <div key={si} className={`cmrow${mapping[si]>=0?' cmrow-ok':''}`}>
                    <span title={`Columna original: "${h}"`}>{h}</span>
                    <select value={mapping[si]??-1}
                      onChange={e=>setMapping(m=>{const n=[...m];n[si]=Number(e.target.value);return n;})}>
                      <option value={-1}>— ignorar —</option>
                      {EXPECTED_FIELDS.map((f,fi)=><option key={fi} value={fi}>{f}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="ipv">
              <strong>Vista previa:</strong>
              <div style={{marginTop:5}}>
                {parsed.records.slice(0,5).map((r,i)=>(
                  <div key={i} style={{fontSize:'.72rem',color:'var(--g7)',padding:'2px 0',borderBottom:'1px solid var(--g2)'}}>
                    {r.filter(Boolean).slice(0,6).join(' · ')}
                  </div>
                ))}
              </div>
            </div>
          </>)}

          <div className="wb">
            ⚠ <strong>Reemplazar</strong> borra todo y carga desde el archivo.
            <strong> Agregar</strong> añade al catálogo sin borrar nada.
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-org" onClick={()=>doImport('replace')} disabled={!parsed||loading}>🔄 Reemplazar</button>
          <button className="btn btn-p"   onClick={()=>doImport('append')}  disabled={!parsed||loading}>➕ Agregar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL — COLUMNAS
// ============================================================
const ModalCols = ({ visibleCols, onChange, onClose }) => (
  <div className="mo show">
    <div className="md sm">
      <div className="mh"><h2>👁 Columnas visibles</h2><button className="mx" onClick={onClose}>×</button></div>
      <div className="mb">
        <p style={{fontSize:'.82rem',color:'var(--g5)',marginBottom:14}}>Activa o desactiva columnas.</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {visibleCols.map((col,i)=>(
            <label key={i} className="col-toggle-label">
              <input type="checkbox" checked={col.show}
                onChange={e=>onChange(i,e.target.checked)}
                style={{width:16,height:16,accentColor:'var(--bm)'}}/>
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
//  MODAL — HISTORIAL
// ============================================================
const ModalHistory = ({ changelog, onClose }) => {
  const [filter, setFilter] = useState('');
  const list = filter ? changelog.filter(e=>e.op===filter) : changelog;
  const opIcon={AGREGAR:'✅',EDITAR:'✏️',ELIMINAR:'🗑',IMPORTAR:'📂'};
  const opCls ={AGREGAR:'hop-add',EDITAR:'hop-edit',ELIMINAR:'hop-del',IMPORTAR:'hop-imp'};

  const exportCSV = () => {
    if (!changelog.length) return;
    const rows=[['#','Fecha','Hora','Operación','Resumen','Campos Cambiados']];
    changelog.forEach(e=>{
      const cambios=(e.cambios||[]).map(c=>`${c.campo}: "${c.antes}"→"${c.despues}"`).join(' | ');
      rows.push([e.id,e.fecha,e.hora,e.op,e.resumen,cambios]);
    });
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    a.download=`historial_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="mo show">
      <div className="md" style={{maxWidth:860,width:'95vw'}}>
        <div className="mh"><h2>📋 Historial de Cambios</h2><button className="mx" onClick={onClose}>×</button></div>
        <div className="hist-toolbar">
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{border:'1.5px solid var(--g3)',borderRadius:6}}>
            <option value="">Todas las operaciones</option>
            <option value="AGREGAR">✅ Agregar</option>
            <option value="EDITAR">✏️ Editar</option>
            <option value="ELIMINAR">🗑 Eliminar</option>
            <option value="IMPORTAR">📂 Importar</option>
          </select>
          <span style={{fontSize:'.76rem',color:'var(--g5)'}}>{list.length} registro(s)</span>
          <button className="btn btn-dark btn-sm" style={{marginLeft:'auto'}} onClick={exportCSV}>📥 Exportar historial</button>
        </div>
        <div className="mhist-wrap">
          {list.length===0
            ? <div className="hist-empty">Sin registros de cambios aún.</div>
            : list.map((e,idx)=>(
              <div key={idx} className="hlog-item">
                <div className="hlog-dt">📅 {e.fecha}<br/>🕐 {e.hora}</div>
                <div className={`hlog-op ${opCls[e.op]||''}`}>{opIcon[e.op]||''} {e.op}</div>
                <div className="hlog-det">
                  <div><strong>{e.resumen}</strong></div>
                  {(e.cambios||[]).map((c,ci)=>(
                    <span key={ci} className="field-chg">
                      <em>{c.campo}:</em>{' '}
                      {c.antes&&<span className="old">{c.antes}</span>}
                      {c.antes&&c.despues&&'→'}
                      {c.despues&&<span className="new">{c.despues}</span>}
                    </span>
                  ))}
                  <div className="hlog-ip">🔥 Supabase</div>
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
//  APP PRINCIPAL  (interna — sin exports)
// ============================================================
function CatalogoApp() {
  const toast = useToast();

  const [fbStatus,  setFbStatus]  = useState('connecting');
  const [loading,   setLoading]   = useState(true);
  const [records,   setRecords]   = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [loadProgress, setLoadProgress] = useState({ active:false, pct:0, msg:'', indeterminate:true });

  const [fMarca,  setFMarca]  = useState('');
  const [fModelo, setFModelo] = useState('');
  const [fPeriodo, setFPeriodo]   = useState('');
  const [fClasi,  setFClasi]  = useState('');
  const [fSub,    setFSub]    = useState('');
  const [fText,   setFText]   = useState('');
  const [debText, setDebText] = useState('');

  const [sortCol,     setSortCol]     = useState(-1);
  const [sortAsc,     setSortAsc]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [visibleCols, setVisibleCols] = useState(COL_DEFS.map(c=>({...c})));

  const [modalEdit,   setModalEdit]   = useState(null);
  const [modalDel,    setModalDel]    = useState(null);
  const [modalDetail, setModalDetail] = useState(null);
  const [showImport,  setShowImport]  = useState(false);
  const [showCols,    setShowCols]    = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const debRef = useRef(null);

  // ── Listas dinámicas (marcas, clasificaciones, subclasificaciones, desc estándar) ──
  const [extraMarcas,  setExtraMarcas]  = useState([]);
  const [extraClasif,  setExtraClasif]  = useState([]);
  const [extraSubs,    setExtraSubs]    = useState([]);
  const [extraDescStd, setExtraDescStd] = useState([]);

  // Derivar listas únicas: base + extras + lo que ya existe en records
  const allMarcas = useMemo(()=>{
    const fromRecs = records.map(r=>r.fields[0]).filter(Boolean);
    return [...new Set([...MARCAS_DEFAULT, ...extraMarcas, ...fromRecs])].sort();
  },[records, extraMarcas]);

  const allClasif = useMemo(()=>{
    const fromRecs = records.map(r=>r.fields[7]).filter(Boolean);
    return [...new Set([...CLASIFICACIONES_DEFAULT, ...extraClasif, ...fromRecs])].sort();
  },[records, extraClasif]);

  const allSubs = useMemo(()=>{
    const fromRecs = records.map(r=>r.fields[8]).filter(Boolean);
    return [...new Set([...SUBCLASIFICACIONES_DEFAULT, ...extraSubs, ...fromRecs])].sort();
  },[records, extraSubs]);

  const allDescStd = useMemo(()=>{
    const fromRecs = records.map(r=>r.fields[6]).filter(Boolean);
    return [...new Set([...DESC_STD_DEFAULT, ...extraDescStd, ...fromRecs])].sort();
  },[records, extraDescStd]);

  const listasValue = useMemo(()=>({
    marcas:   allMarcas,
    clasif:   allClasif,
    subs:     allSubs,
    descStd:  allDescStd,
    addMarca:   v => setExtraMarcas(p=>[...new Set([...p, v])]),
    addClasi:   v => setExtraClasif(p=>[...new Set([...p, v])]),
    addSub:     v => setExtraSubs(p=>[...new Set([...p, v])]),
    addDescStd: v => setExtraDescStd(p=>[...new Set([...p, v])]),
  }),[allMarcas, allClasif, allSubs, allDescStd]);

  // ── Carga inicial — SOLO registros, changelog lazy ──
  useEffect(()=>{
    (async()=>{
      try {
        setLoading(true);
        setLoadProgress({ active:true, pct:0, msg:'Conectando a Supabase…', indeterminate:true });
        // Cargamos SOLO repuestos al inicio para mayor velocidad
        // El changelog se carga cuando el usuario abre el historial
        const rawRecs = await fsGetAll(COL_RECORDS, (n) => {
          // Supabase entrega todos los docs juntos — actualizamos badge temprano
          console.log('[Supabase] docs recibidos:', n);
          setLoadProgress({ active:true, pct:80, msg:`Procesando ${n.toLocaleString()} registros…`, indeterminate:false });
        });
        setLoadProgress({ active:true, pct:95, msg:'Normalizando datos…', indeterminate:false });
        const normalized = rawRecs.map(normalizeDoc).filter(Boolean);
        setRecords(normalized);
        setFbStatus('ok');
        setLoadProgress({ active:true, pct:100, msg:`✅ ${normalized.length.toLocaleString()} registros cargados`, indeterminate:false });
        setTimeout(()=>setLoadProgress(p=>({...p,active:false})), 1800);
      } catch(e) {
        console.error('[Supabase]', e);
        setFbStatus('error');
        setLoadProgress({ active:false, pct:0, msg:'', indeterminate:true });
        toast('❌ Error Supabase: ' + e.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  },[]); // eslint-disable-line

  // ── Carga de historial (lazy: solo cuando se abre el modal) ──
  const [changelogLoaded, setChangelogLoaded] = useState(false);
  const loadChangelog = async () => {
    if (changelogLoaded) return;
    try {
      const rawLogs = await fsGetAll(COL_CHANGELOG);
      setChangelog(rawLogs.sort((a,b)=> new Date(b.created_at||0) - new Date(a.created_at||0)));
      setChangelogLoaded(true);
    } catch(e) {
      toast('Error cargando historial: ' + e.message, 'error');
    }
  };

  const onTextInput = v => {
    setFText(v);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(()=>setDebText(v), 280);
  };

  const availableModels = useMemo(()=>{
    if(!fMarca) return [];
    return [...new Set(records.filter(r=>r.fields[0]===fMarca).map(r=>r.fields[1]).filter(Boolean))].sort();
  },[records,fMarca]);

  const availablePeriodos = useMemo(()=>{
    let b = fMarca ? records.filter(r=>r.fields[0]===fMarca) : records;
    if(fModelo) b = b.filter(r=>r.fields[1]===fModelo);
    return [...new Set(b.map(r=>r.fields[3]).filter(Boolean))].sort();
  },[records,fMarca,fModelo]);

  const availableSubs = useMemo(()=>{
    if(!fClasi) return allSubs;
    return [...new Set(records.filter(r=>r.fields[7]===fClasi).map(r=>r.fields[8]).filter(Boolean))].sort();
  },[records,fClasi,allSubs]);

  const filtered = useMemo(()=>{
    let r = records;
    if(fMarca)  r=r.filter(x=>x.fields[0]===fMarca);
    if(fModelo) r=r.filter(x=>x.fields[1]===fModelo);
    if(fPeriodo)   r=r.filter(x=>x.fields[3]===fPeriodo);
    if(fClasi)  r=r.filter(x=>x.fields[7]===fClasi);
    if(fSub)    r=r.filter(x=>x.fields[8]===fSub);
    if(debText){const t=debText.toLowerCase(); r=r.filter(x=>x.fields.some(f=>String(f).toLowerCase().includes(t)));}
    if(sortCol>=0) r=[...r].sort((a,b)=>{
      const av=String(a.fields[sortCol]||'').toLowerCase();
      const bv=String(b.fields[sortCol]||'').toLowerCase();
      return sortAsc?av.localeCompare(bv):bv.localeCompare(av);
    });
    return r;
  },[records,fMarca,fModelo,fPeriodo,fClasi,fSub,debText,sortCol,sortAsc]);

  const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const stats = useMemo(()=>({
    total:     records.length,
    marcas:    new Set(records.map(r=>r.fields[0]).filter(Boolean)).size,
    modelos:   new Set(records.map(r=>r.fields[1]).filter(Boolean)).size,
    cats:      new Set(records.map(r=>r.fields[7]).filter(Boolean)).size,
    conCodigo: records.filter(r=>r.fields[5]).length,
  }),[records]);

  const onMarcaChange  = v=>{setFMarca(v);setFModelo('');setFPeriodo('');setPage(1);};
  const onModeloChange = v=>{setFModelo(v);setFPeriodo('');setPage(1);};
  const onClasiChange  = v=>{setFClasi(v);setFSub('');setPage(1);};
  const clearAll = ()=>{
    setFMarca('');setFModelo('');setFPeriodo('');setFClasi('');setFSub('');
    setFText('');setDebText('');setSortCol(-1);setSortAsc(true);setPage(1);
  };
  const handleSort = ci=>{
    if(sortCol===ci) setSortAsc(a=>!a); else {setSortCol(ci);setSortAsc(true);}
    setPage(1);
  };

  // ── Log ──
  const logEntry = async (op, resumen, cambios=[])=>{
    const {fecha,hora}=nowDT();
    const entry={op,resumen,cambios,fecha,hora,id:Date.now()};
    try{ await fsAddLog(entry); } catch(e){ console.warn(e); }
    // Agregar al estado local aunque el changelog no haya sido cargado aún
    setChangelogLoaded(true); // marcar como "hay datos"
    setChangelog(prev=>[{...entry,_id:'local_'+Date.now()},...prev]);
  };

  // ── CRUD ──
  const handleSaveNew = async ({fields})=>{
    const id = await fsAdd(COL_RECORDS,{fields});
    setRecords(prev=>[{_id:id,fields},...prev]);
    await logEntry('AGREGAR',`${fields[0]} ${fields[1]} ${fields[3]}`,
      [{campo:'Descripción',antes:'',despues:fields[4]}]);
    toast('✅ Registro guardado en Supabase.','success');
  };

  const handleSaveEdit = async (original,{fields})=>{
    await fsUpdate(original._id,{fields});
    setRecords(prev=>prev.map(r=>r._id===original._id?{...r,fields}:r));
    const cambios=fields.map((f,i)=>f!==original.fields[i]
      ?{campo:COL_DEFS[i].label,antes:original.fields[i],despues:f}:null).filter(Boolean);
    await logEntry('EDITAR',`${fields[0]} ${fields[1]}`,cambios);
    toast('✏️ Registro actualizado.','success');
  };

  const handleDelete = async ()=>{
    const rec=modalDel; setModalDel(null);
    try{
      await fsDelete(rec._id);
      setRecords(prev=>prev.filter(r=>r._id!==rec._id));
      await logEntry('ELIMINAR',`${rec.fields[0]} ${rec.fields[1]} ${rec.fields[3]}`);
      toast('🗑 Registro eliminado.','warning');
    }catch(e){toast('Error: '+e.message,'error');}
  };

  // ── Importar ──
  const handleImport = async (rows, mode)=>{
    setLoading(true);
    const total = rows.length;
    setLoadProgress({ active:true, pct:0, msg:`Preparando ${total.toLocaleString()} registros…`, indeterminate:false });
    try{
      if(mode==='replace'){
        setLoadProgress({ active:true, pct:5, msg:'Eliminando registros anteriores…', indeterminate:true });
        await fsDeleteAll();
      }
      // Escritura en batches con progreso visual
      const CHUNK = 500;
      for(let i=0; i<rows.length; i+=CHUNK){
        const batch = rows.slice(i, i+CHUNK).map(f => ({ fields: f }));
        const { error } = await supabase.from(COL_RECORDS).insert(batch);
        if (error) throw new Error(error.message);
        const pct = Math.round(Math.min(((i+CHUNK)/total)*85, 85)) + 5;
        const done = Math.min(i+CHUNK, total);
        setLoadProgress({ active:true, pct, msg:`Subiendo… ${done.toLocaleString()} / ${total.toLocaleString()} registros`, indeterminate:false });
        toast(`⏳ Guardando… ${pct}% (${done}/${total})`, 'info');
      }
      setLoadProgress({ active:true, pct:93, msg:'Recargando datos desde Supabase…', indeterminate:true });
      // Recargar desde Supabase
      const fresh = await fsGetAll(COL_RECORDS);
      setRecords(fresh.map(normalizeDoc).filter(Boolean));
      await logEntry('IMPORTAR',`${mode==='replace'?'Reemplazo':'Adición'} de ${total} registros`);
      setLoadProgress({ active:true, pct:100, msg:`✅ ${total.toLocaleString()} registros importados`, indeterminate:false });
      setTimeout(()=>setLoadProgress(p=>({...p,active:false})), 2500);
      toast(`✅ ${total} registros importados correctamente.`,'success');
      clearAll();
    }catch(e){
      setLoadProgress({ active:false, pct:0, msg:'', indeterminate:true });
      toast('Error importación: '+e.message,'error');
    }finally{setLoading(false);}
  };

  // ── Exportar XLS ──
  const exportCSV = async ()=>{
    if(!filtered.length){toast('No hay datos para exportar.','error');return;}
    try{
      const xlsxLib = await loadXLSX();
      const rows = [COL_DEFS.map(c=>c.label), ...filtered.map(r=>r.fields)];
      const ws = xlsxLib.utils.aoa_to_sheet(rows);
      const wb = xlsxLib.utils.book_new();
      xlsxLib.utils.book_append_sheet(wb, ws, 'Catálogo');
      xlsxLib.writeFile(wb, `catalogo_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast(`📥 ${filtered.length} registros exportados como Excel.`,'success');
    }catch(e){toast('Error al exportar: '+e.message,'error');}
  };

  const activeCols = visibleCols.filter(c=>c.show);
  const fbDotColor = {connecting:'#D4A800',ok:'#4CAF50',error:'#C62828'}[fbStatus]||'#D4A800';

  return (
    <ListasCtx.Provider value={listasValue}>
    <>
      <style>{STYLES}</style>

      {/* HEADER */}
      <div className="ac-header">
        <div className="ac-hl">
          {/* LOGO */}
          <img src={LOGO_SRC} alt='Auto Centro' style={{height:42,objectFit:'contain',flexShrink:0}}/>
          <div className="ac-hdiv"/>
          <div className="ac-htitle">
            <span className="s1">Sistema de Gestión</span>
            <span className="s2">Catálogo de Repuestos</span>
          </div>
          <span className="ac-badge">{records.length.toLocaleString()} registros</span>
          <span className="fb-badge">
            <span className="fb-dot" style={{
              background:fbDotColor,
              ...(fbStatus==='connecting'?{animation:'spin .8s linear infinite'}:{})
            }}/>
            Supabase {fbStatus==='ok'?'conectado':fbStatus==='connecting'?'conectando…':'error'}
          </span>
        </div>
        <div className="ac-hact">
          <button className="btn btn-g"
            onClick={()=>setModalEdit({_id:null,fields:Array(9).fill('')})}>➕ Nuevo</button>
          <button className="btn btn-c" onClick={()=>setShowImport(true)}>📂 Cargar base</button>
          <button className="btn btn-c" onClick={exportCSV}>📥 Excel</button>
          <button className="btn btn-c" onClick={()=>setShowCols(true)}>👁 Columnas</button>
          <button className="btn btn-c" onClick={()=>{ loadChangelog(); setShowHistory(true); }}>
            📋 Historial
            {changelog.length>0&&<span style={{background:'var(--gold)',color:'var(--bd)',
              borderRadius:10,padding:'1px 7px',fontSize:'.7rem',marginLeft:4}}>
              {changelog.length}</span>}
          </button>
        </div>
      </div>

      {/* BARRA DE PROGRESO GLOBAL */}
      <div className={`ac-progress-wrap${loadProgress.active?' active':''}`}>
        <div className="ac-progress-inner">
          <span className="ac-progress-label">{loadProgress.msg}</span>
          <div className="ac-progress-bar-bg">
            <div
              className={`ac-progress-bar-fill${loadProgress.indeterminate?' indeterminate':''}`}
              style={!loadProgress.indeterminate?{width:`${loadProgress.pct}%`}:{}}
            />
          </div>
          {!loadProgress.indeterminate && <span className="ac-progress-pct">{loadProgress.pct}%</span>}
        </div>
      </div>

      {/* FILTROS */}
      <div className="ac-sp">
        <div className="ac-fg">
          {[
            {label:'🅱 Marca', val:fMarca, set:onMarcaChange, opts:allMarcas},
            {label:'🚗 Modelo', val:fModelo, set:onModeloChange, opts:availableModels, placeholder:'Todos los modelos'},
            {label:'📅 Período',   val:fPeriodo,   set:v=>{setFPeriodo(v);setPage(1);}, opts:availablePeriodos, placeholder:'Todos los períodos'},
            {label:'🔎 Clasificación', val:fClasi, set:onClasiChange, opts:allClasif, placeholder:'Todas'},
            {label:'📂 Subclasificación', val:fSub, set:v=>{setFSub(v);setPage(1);}, opts:availableSubs, placeholder:'Todas'},
          ].map(({label,val,set,opts,placeholder='Todas las marcas'})=>(
            <div key={label} className="ac-fl">
              <label>{label}</label>
              <select value={val} onChange={e=>set(e.target.value)}>
                <option value="">{placeholder}</option>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="ac-sr">
          <div className="ac-fl">
            <label>🔍 Búsqueda libre — descripción, código, modelo…</label>
            <input type="text" value={fText}
              placeholder="Ej: filtro aceite, TSL420, amortiguador…"
              onChange={e=>onTextInput(e.target.value)}/>
          </div>
          <button className="btn btn-p" onClick={()=>setPage(1)}>🔍 Buscar</button>
          <button className="btn btn-o" onClick={clearAll}>✕ Limpiar</button>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="ac-sb">
        <span>Resultados: <strong>{filtered.length.toLocaleString()}</strong></span>
        <span className="ac-sep">|</span>
        <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
        <span style={{marginLeft:'auto',display:'flex',gap:5,flexWrap:'wrap'}}>
          {fMarca &&<span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>🅱 {fMarca}</span>}
          {fModelo&&<span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>🚗 {fModelo}</span>}
          {fPeriodo  &&<span className="ac-tag" style={{background:'rgba(212,168,0,.8)'}}>📅 {fPeriodo}</span>}
          {fClasi &&<span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>🔎 {fClasi.substring(0,22)}</span>}
          {fSub   &&<span className="ac-tag" style={{background:'rgba(255,255,255,.25)'}}>📂 {fSub}</span>}
          {debText&&<span className="ac-tag" style={{background:'rgba(212,168,0,.8)'}}>🔍 "{debText}"</span>}
        </span>
      </div>

      {/* QUICK STATS */}
      <div className="ac-qs">
        {[
          [stats.total.toLocaleString(),'Total'],
          [stats.marcas,'Marcas'],
          [stats.modelos,'Modelos'],
          [stats.cats,'Categorías'],
          [stats.conCodigo.toLocaleString(),'Con código'],
        ].map(([n,l],i,arr)=>(
          <React.Fragment key={i}>
            <div className="ac-qi"><div className="n">{n}</div><div className="l">{l}</div></div>
            {i<arr.length-1&&<div className="ac-qsep"/>}
          </React.Fragment>
        ))}
      </div>

      {/* TABLE */}
      <div className="ac-tw">
        {loading ? (
          <div className="loading">
            <span className="spin"/>
            {fbStatus==='connecting'?'Conectando a Supabase…':'Procesando…'}
          </div>
        ) : records.length===0 ? (
          <div className="empty">
            <div className="icon">📂</div>
            <p style={{fontWeight:700,marginBottom:8}}>La base de datos está vacía</p>
            <p style={{fontSize:'.85rem'}}>Usa <strong>"Cargar base"</strong> para importar un archivo CSV o Excel.</p>
          </div>
        ) : filtered.length===0 ? (
          <div className="empty"><div className="icon">🔎</div><p>No se encontraron resultados.</p></div>
        ) : (
          <table>
            <thead><tr>
              {activeCols.map(col=>(
                <th key={col.key} className={sortCol===col.key?'sorted':''} onClick={()=>handleSort(col.key)}>
                  {col.label}<span className="si">{sortCol===col.key?(sortAsc?'↑':'↓'):'↕'}</span>
                </th>
              ))}
              <th style={{width:90}}>Acciones</th>
            </tr></thead>
            <tbody>
              {paginated.map((rec,ri)=>{
                const f=rec.fields;
                const cell={
                  0:()=><span className="cm">{highlightText(f[0],debText)}</span>,
                  1:()=><span className="cm">{highlightText(f[1],debText)}{f[2]&&<><br/><span className="cmo">{f[2]}</span></>}</span>,
                  2:()=><span className="cmo">{f[2]}</span>,
                  3:()=><span className="ca">{highlightText(f[3],debText)}</span>,
                  4:()=><span className="cds">{highlightText(f[4],debText)}{f[6]&&<><br/><span className="cs">{f[6]}</span></>}</span>,
                  5:()=>f[5]?<span className="cc">{highlightText(f[5],debText)}
                    <button className="btn-copy" onClick={e=>{e.stopPropagation();navigator.clipboard?.writeText(f[5]);toast('📋 Código copiado','info');}}>⧉</button>
                  </span>:<span className="cs">—</span>,
                  6:()=><span className="cs">{f[6]}</span>,
                  7:()=>f[7]?<span className="ct" style={{background:clasiBgColor(f[7])}}>{f[7]}</span>:null,
                  8:()=><span className="cs">{f[8]}</span>,
                };
                return (
                  <tr key={rec._id||ri}>
                    {activeCols.map(col=>(
                      <td key={col.key} onClick={()=>setModalDetail(rec)} style={{cursor:'pointer'}}>
                        {cell[col.key]?cell[col.key]():f[col.key]}
                      </td>
                    ))}
                    <td className="cac" onClick={e=>e.stopPropagation()}>
                      <button className="btn-edit" onClick={()=>setModalEdit(rec)}>✏ Edit</button>
                      <button className="btn-del"  onClick={()=>setModalDel(rec)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINACIÓN */}
      {!loading && filtered.length>0 && (
        <div className="ac-pg">
          <button className="pb" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>‹ Anterior</button>
          {(()=>{
            const pages=[1];
            for(let i=Math.max(2,page-3);i<=Math.min(totalPages-1,page+3);i++) pages.push(i);
            if(!pages.includes(totalPages)&&totalPages>1) pages.push(totalPages);
            const els=[];let prev=0;
            pages.forEach(p=>{
              if(prev&&p-prev>1) els.push(<span key={`e${p}`} style={{color:'#B0BEC5',padding:'0 4px'}}>…</span>);
              els.push(<button key={p} className={`pb${p===page?' active':''}`} onClick={()=>setPage(p)}>{p}</button>);
              prev=p;
            });
            return els;
          })()}
          <button className="pb" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente ›</button>
          <span className="pi">
            {((page-1)*PAGE_SIZE+1).toLocaleString()}–{Math.min(page*PAGE_SIZE,filtered.length).toLocaleString()} de {filtered.length.toLocaleString()}
          </span>
        </div>
      )}

      {/* MODALS */}
      {modalEdit && (
        <ModalEdit
          record={modalEdit._id?modalEdit:null}
          onSave={async(data)=>{
            if(modalEdit._id) await handleSaveEdit(modalEdit,data);
            else              await handleSaveNew(data);
          }}
          onClose={()=>setModalEdit(null)}
        />
      )}
      {modalDel    && <ModalDelete  record={modalDel}    onConfirm={handleDelete} onClose={()=>setModalDel(null)}/>}
      {modalDetail && <ModalDetail  record={modalDetail}  onClose={()=>setModalDetail(null)} onEdit={r=>{setModalDetail(null);setModalEdit(r);}}/>}
      {showImport  && <ModalImport  onClose={()=>setShowImport(false)}  onImport={handleImport}/>}
      {showCols    && <ModalCols    visibleCols={visibleCols} onChange={(i,s)=>setVisibleCols(v=>v.map((c,ci)=>ci===i?{...c,show:s}:c))} onClose={()=>setShowCols(false)}/>}
      {showHistory && <ModalHistory changelog={changelog} onClose={()=>setShowHistory(false)}/>}
    </>
    </ListasCtx.Provider>
  );
}

// ============================================================
//  EXPORT DEFAULT  ← ToastProvider envuelve todo
//  main.jsx puede hacer: import App from './App'  (sin cambios)
// ============================================================
export default function App() {
  return (
    <ToastProvider>
      <CatalogoApp />
    </ToastProvider>
  );
}
