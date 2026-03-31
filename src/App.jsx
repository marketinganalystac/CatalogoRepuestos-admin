// ============================================================
//  Auto Centro — Catálogo de Repuestos
//  App.jsx  |  Supabase + XLSX (CDN dinámico)
// ============================================================

import React, {
  useState, useEffect, useMemo, useRef, useCallback,
  createContext, useContext
} from 'react';

import { createClient } from '@supabase/supabase-js';

const LOGO_SRC = "/logo.png";


// ============================================================
//  SUPABASE CONFIG — Auto Centro Repuestos Aplicables
// ============================================================
const supabase = createClient(
  "https://vzjhzuvahejosdojllcm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amh6dXZhaGVqb3Nkb2psbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTI3NTAsImV4cCI6MjA4Nzc4ODc1MH0.8PNlIh3HQDIq1u6IiRQeKx3o9gZyNWU3SeZ4qJ_F7Ew"
);

// ============================================================
//  AUTH — Context y helpers
//  - Sesión por PESTAÑA (sessionStorage) → se destruye al cerrar
//  - Rol se lee directo desde user_roles SIN RLS de lectura
//  - Sin reintentos ni timeouts largos
// ============================================================
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// Supabase configurado con persistSession:false + storage sessionStorage
// para que la sesión NO sobreviva al cerrar la pestaña
const supabaseSession = createClient(
  "https://vzjhzuvahejosdojllcm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amh6dXZhaGVqb3Nkb2psbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTI3NTAsImV4cCI6MjA4Nzc4ODc1MH0.8PNlIh3HQDIq1u6IiRQeKx3o9gZyNWU3SeZ4qJ_F7Ew",
  { auth: { storage: window.sessionStorage, persistSession: true, detectSessionInUrl: false } }
);

function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [role,    setRole]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Lee rol usando el cliente global (supabase) que tiene el JWT activo
  const fetchRole = async (userId) => {
    const { data } = await supabaseSession
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    return data?.role ?? null;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Verificar sesión guardada en sessionStorage
      const { data: { session } } = await supabaseSession.auth.getSession();
      if (!mounted) return;
      if (!session?.user) {
        setLoading(false);
        return;
      }
      // Hay sesión activa — leer rol inmediatamente con JWT válido
      const r = await fetchRole(session.user.id);
      if (!mounted) return;
      setUser(session.user);
      setRole(r);
      setLoading(false);
    };

    init();

    // Escuchar cambios (login / logout)
    const { data: { subscription } } = supabaseSession.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_IN') {
        const r = await fetchRole(session.user.id);
        if (!mounted) return;
        setUser(session.user);
        setRole(r);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const result = await supabaseSession.auth.signInWithPassword({ email, password });
    return result;
  };

  const signOut = async () => {
    setUser(null);
    setRole(null);
    setLoading(false);
    await supabaseSession.auth.signOut();
  };

  const isAdmin = role === 'admin';

  return (
    <AuthCtx.Provider value={{ user, role, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ============================================================
//  PANTALLA DE LOGIN
// ============================================================
function LoginScreen() {
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    if (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0d2a4a 0%,#1A3F6F 50%,#0060A0 100%)',
      fontFamily:"'Segoe UI',Arial,sans-serif", padding:16
    }}>
      <div style={{
        background:'#fff', borderRadius:16, width:'min(420px,100%)',
        boxShadow:'0 32px 80px rgba(0,0,0,.35)', overflow:'hidden'
      }}>
        {/* Header */}
        <div style={{background:'linear-gradient(135deg,#1A3F6F,#0060A0)',padding:'28px 32px 22px',
          borderBottom:'3px solid #D4A800',textAlign:'center'}}>
<div style={{ display: "flex", justifyContent: "center" }}>
  <img 
    src={LOGO_SRC} 
    alt="Auto Centro" 
    style={{ height: 48, objectFit: "contain", marginBottom: 10 }}
  />
</div>
          <div style={{color:'rgba(255,255,255,.7)',fontSize:'.72rem',textTransform:'uppercase',letterSpacing:1.5,fontWeight:600}}>
            Sistema de Gestión
          </div>
          <div style={{color:'#fff',fontSize:'1.05rem',fontWeight:700,marginTop:2}}>
            Catálogo de Repuestos
          </div>
        </div>
        {/* Form */}
        <div style={{padding:'28px 32px 32px'}}>
          <p style={{fontSize:'.82rem',color:'#78909C',marginBottom:20,textAlign:'center'}}>
            Ingresa con tu cuenta para continuar
          </p>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              <label style={{fontSize:'.68rem',color:'#0060A0',fontWeight:700,textTransform:'uppercase',letterSpacing:.6}}>
                Correo electrónico
              </label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="usuario@empresa.com" required autoFocus
                style={{background:'#F5F7FA',border:'1.5px solid #CFD8DC',borderRadius:8,
                  padding:'10px 13px',fontSize:'.88rem',outline:'none',transition:'.18s'}}
                onFocus={e=>e.target.style.borderColor='#0060A0'}
                onBlur={e=>e.target.style.borderColor='#CFD8DC'}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              <label style={{fontSize:'.68rem',color:'#0060A0',fontWeight:700,textTransform:'uppercase',letterSpacing:.6}}>
                Contraseña
              </label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{background:'#F5F7FA',border:'1.5px solid #CFD8DC',borderRadius:8,
                    padding:'10px 40px 10px 13px',fontSize:'.88rem',outline:'none',width:'100%',transition:'.18s'}}
                  onFocus={e=>e.target.style.borderColor='#0060A0'}
                  onBlur={e=>e.target.style.borderColor='#CFD8DC'}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)}
                  style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',cursor:'pointer',color:'#78909C',fontSize:'.85rem'}}>
                  {showPw?'🙈':'👁'}
                </button>
              </div>
            </div>
            {error && (
              <div style={{background:'#FFEBEE',border:'1px solid #FFCDD2',borderRadius:7,
                padding:'9px 13px',fontSize:'.79rem',color:'#C62828',display:'flex',gap:7,alignItems:'center'}}>
                ⚠ {error === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{marginTop:4,background:'#0060A0',color:'#fff',border:'none',borderRadius:8,
                padding:'11px',fontSize:'.88rem',fontWeight:700,cursor:loading?'default':'pointer',
                opacity:loading?.65:1,transition:'.18s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading
                ? <><span style={{display:'inline-block',width:16,height:16,border:'2px solid rgba(255,255,255,.3)',
                    borderTopColor:'#fff',borderRadius:'50%',animation:'spin .75s linear infinite'}}/> Ingresando…</>
                : '🔐 Ingresar'}
            </button>
          </form>
          <p style={{marginTop:18,fontSize:'.72rem',color:'#90A4AE',textAlign:'center'}}>
            ¿Sin acceso? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

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
// DEFAULT ORDER: Marca, Modelo, Período, Desc.Estándar, Código, Clasificación, Subclasificación
const COL_DEFS = [
  { key:0, label:'Marca',            show:true,  width:110 },
  { key:1, label:'Modelo',           show:true,  width:130 },
  { key:2, label:'Modelo Original',  show:false, width:130 },
  { key:3, label:'Período',          show:true,  width:90  },
  { key:4, label:'Descripción',      show:false, width:200 },
  { key:5, label:'Código',           show:true,  width:110 },
  { key:6, label:'Desc. Estándar',   show:true,  width:200 },
  { key:7, label:'Clasificación',    show:true,  width:150 },
  { key:8, label:'Subclasificación', show:true,  width:150 },
];
// Ordered display: Marca, Modelo, Período, Desc.Estándar, Código, Clasificación, Sub
const COL_DEFS_ORDER = [0,1,3,6,5,7,8,2,4];

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
/* ── RESPONSIVE / MOBILE ── */
@media(max-width:768px){
  .ac-header{padding:8px 12px;min-height:auto;gap:6px}
  .ac-hl{gap:8px;flex-wrap:wrap}
  .ac-htitle .s2{font-size:.8rem}
  .ac-htitle .s1{display:none}
  .ac-badge{display:none}
  .fb-badge{font-size:.6rem;padding:2px 7px}
  .ac-hact{gap:5px;flex-wrap:wrap}
  .btn{padding:5px 9px;font-size:.73rem}
  .ac-sp{padding:10px 12px}
  .ac-fg{grid-template-columns:1fr 1fr;gap:7px}
  .ac-sr{flex-direction:column;gap:7px}
  .ac-sr .ac-fl{min-width:0}
  .ac-sb{padding:5px 12px;gap:8px;font-size:.7rem}
  .ac-qs{padding:6px 12px;gap:7px}
  .ac-qi{padding:4px 9px}
  .ac-qi .n{font-size:.88rem}
  .ac-tw{max-height:calc(100vh - 260px)}
  table{font-size:.75rem}
  thead th{padding:7px 8px;font-size:.62rem}
  tbody td{padding:5px 8px}
  .ac-pg{padding:7px 12px;gap:4px}
  .pb{padding:4px 8px;font-size:.7rem}
  .md{width:96vw!important;max-width:96vw!important}
  .fgrid{grid-template-columns:1fr}
  .cmr{grid-template-columns:1fr}
  .hlog-item{grid-template-columns:1fr;border-bottom:2px solid var(--g2)}
  .hlog-dt,.hlog-op{border-right:none;border-bottom:1px solid var(--g2)}
  .mhist-wrap{max-height:55vh}
}
@media(max-width:480px){
  .ac-fg{grid-template-columns:1fr}
  .ac-hact .btn-c:not(:first-child):not(:nth-child(2)){display:none}
  .ac-tw{max-height:calc(100vh - 240px)}
  thead th{padding:6px 6px;font-size:.6rem}
  tbody td{padding:4px 6px;font-size:.73rem}
}

/* ── DECODIFICADOR ── */
.dec-wrap{background:var(--g1);padding:0 0 24px}
.dec-section-title{background:linear-gradient(135deg,var(--bd),var(--bm));
  padding:10px 24px;border-top:3px solid var(--gold);
  display:flex;align-items:center;gap:10px}
.dec-section-label{font-size:.8rem;font-weight:700;color:#fff;letter-spacing:.3px}
.dec-section-sub{font-size:.67rem;color:rgba(255,255,255,.6)}
.dec-inner{padding:12px 24px 0}
.dec-card{background:#fff;border-radius:10px;border:1px solid var(--g2);
  box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden}
.dec-top{display:flex;align-items:center;gap:10px;padding:12px 16px;flex-wrap:wrap;
  background:linear-gradient(135deg,var(--bd),var(--bm));border-bottom:2px solid var(--gold)}
.dec-label{display:flex;align-items:center;gap:6px;flex-shrink:0}
.dec-tag{font-family:'Courier New',monospace;font-size:.65rem;color:var(--gold);
  border:1px solid rgba(212,168,0,.5);padding:2px 7px;border-radius:3px;letter-spacing:.08em;white-space:nowrap}
.dec-title{font-size:.82rem;font-weight:700;color:#fff;white-space:nowrap}
.dec-title span{color:var(--gold)}
.dec-search{display:flex;gap:7px;flex:1;min-width:200px}
.dec-input{flex:1;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);
  border-radius:6px;color:#fff;font-family:'Courier New',monospace;font-size:.82rem;
  padding:7px 11px;letter-spacing:.05em;outline:none;transition:border-color .2s;min-width:0}
.dec-input:focus{border-color:var(--gold);background:rgba(255,255,255,.18)}
.dec-input::placeholder{color:rgba(255,255,255,.4);font-size:.72rem}
.dec-btn{background:var(--gold);color:var(--bd);border:none;border-radius:6px;
  font-family:'Courier New',monospace;font-size:.72rem;font-weight:700;padding:7px 13px;
  cursor:pointer;letter-spacing:.05em;transition:opacity .2s;white-space:nowrap}
.dec-btn:hover{opacity:.85}
.dec-result{padding:10px 14px;display:none}
.dec-result.visible{display:block}
.dec-result-hdr{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
.dec-code{font-family:'Courier New',monospace;font-size:1rem;font-weight:800;color:var(--bm)}
.dec-two{display:grid;grid-template-columns:1.1fr 0.9fr;gap:10px;align-items:start;margin-top:2px}
@media(max-width:580px){.dec-two{grid-template-columns:1fr}}
.dec-grid{display:grid;grid-template-columns:1fr;gap:3px}
.dec-row{display:flex;gap:8px;padding:4px 8px;background:var(--g1);border-radius:6px;align-items:flex-start;border:1px solid var(--g2)}
.dec-key{font-family:'Courier New',monospace;font-size:.68rem;color:var(--g5);
  letter-spacing:.06em;white-space:nowrap;min-width:72px;padding-top:2px}
.dec-val{font-size:.82rem;color:var(--g9);font-weight:600;line-height:1.4}
.dec-badge{display:inline-block;font-family:'Courier New',monospace;font-size:.68rem;
  padding:1px 7px;border-radius:3px;letter-spacing:.05em;font-weight:700}
.badge-oem{background:#E8F2FA;color:var(--bm);border:1px solid #90CAF9}
.badge-after{background:#E8F5E9;color:#2E7D32;border:1px solid #A5D6A7}
.badge-medida{background:#FFF8E1;color:#8B6000;border:1px solid #FFE082}
.badge-ref{background:#F3E5F5;color:#6A1B9A;border:1px solid #CE93D8}
.badge-unknown{background:#FFEBEE;color:var(--red);border:1px solid #FFCDD2}
.hl-blue{color:var(--bm);font-weight:700}
.hl-green{color:#2E7D32;font-weight:700}
.hl-amber{color:#8B6000;font-weight:700}

/* anatomy */
.dec-anatomy{background:var(--bl);border:1px solid #B3D4F0;border-radius:8px;padding:12px 14px 14px}
.dec-anat-title{font-size:.72rem;font-weight:700;color:var(--bd);letter-spacing:.04em;
  margin-bottom:10px;text-align:center;text-transform:uppercase}
.dec-anat-title span{color:var(--bm);font-family:'Courier New',monospace}
.dec-seg-row{display:flex;align-items:flex-start;justify-content:center;gap:6px;flex-wrap:wrap}
.dec-seg{display:flex;flex-direction:column;align-items:center;min-width:70px;flex:1;max-width:130px}
.dec-seg-box{font-family:'Courier New',monospace;font-size:1.1rem;font-weight:800;
  padding:8px 8px;border-radius:7px;border:2px solid transparent;width:100%;text-align:center}
.seg-blue{color:var(--bm);background:#E8F2FA;border-color:#90CAF9}
.seg-green{color:#2E7D32;background:#E8F5E9;border-color:#A5D6A7}
.seg-amber{color:#8B6000;background:#FFF8E1;border-color:#FFE082}
.seg-purple{color:#6A1B9A;background:#F3E5F5;border-color:#CE93D8}
.dec-seg-line{width:1px;height:10px;background:var(--g3);margin-top:0}
.dec-seg-label{font-size:.7rem;font-weight:700;text-align:center;line-height:1.3;padding:0 3px}
.lbl-blue{color:var(--bm)}.lbl-green{color:#2E7D32}.lbl-amber{color:#8B6000}.lbl-purple{color:#6A1B9A}
.dec-seg-sub-line{width:1px;height:7px;background:var(--g2);margin-top:3px}
.dec-seg-sub{font-size:.62rem;color:var(--g5);text-align:center;margin-top:2px;line-height:1.3;padding:0 3px}
.dec-sep{font-family:'Courier New',monospace;font-size:1.1rem;color:var(--g3);font-weight:700;
  padding:0 2px;align-self:center;margin-top:3px;flex:0;min-width:auto}

/* not found / suggest */
.dec-notfound{font-size:.79rem;color:var(--red);margin-top:8px;padding:8px 12px;
  background:#FFEBEE;border-radius:6px;border:1px solid #FFCDD2;display:none}
.dec-notfound.visible{display:block}
.dec-suggest{margin-top:7px;padding:9px 12px;background:var(--g1);border-radius:6px;border:1px solid var(--g2);display:none}
.dec-suggest-title{font-family:'Courier New',monospace;font-size:.65rem;color:var(--g5);
  letter-spacing:.08em;margin-bottom:6px}
.dec-suggest-list{display:flex;flex-wrap:wrap;gap:5px}
.dec-chip{background:#fff;border:1.5px solid #90CAF9;border-radius:4px;
  font-family:'Courier New',monospace;font-size:.72rem;color:var(--bm);padding:3px 8px;
  cursor:pointer;transition:border-color .15s,color .15s}
.dec-chip:hover{border-color:var(--bm);background:var(--bl)}

/* comparador */
.dec-comp-toggle{display:flex;align-items:center;gap:5px;margin-top:7px;padding:5px 8px;
  background:var(--g1);border:1px solid var(--g3);border-radius:6px;cursor:pointer;
  font-family:'Courier New',monospace;font-size:.67rem;color:var(--g5);letter-spacing:.07em;
  transition:border-color .15s,color .15s;width:100%;text-align:left}
.dec-comp-toggle:hover{border-color:var(--bm);color:var(--bm)}
.dec-comp-toggle .arr{transition:transform .2s}
.dec-comp-toggle.open .arr{transform:rotate(90deg)}
.dec-comparador{margin-top:6px;background:var(--bl);border:1px solid #B3D4F0;border-radius:7px;padding:10px 12px;display:none}
.dec-comparador.visible{display:block}
.dec-comp-inputs{display:grid;grid-template-columns:1fr auto 1fr;gap:7px;align-items:center;margin-bottom:8px}
.dec-comp-vs{font-family:'Courier New',monospace;font-size:.72rem;color:var(--g5);text-align:center;font-weight:700}
.dec-comp-input{background:#fff;border:1.5px solid var(--g3);border-radius:5px;color:var(--g9);
  font-family:'Courier New',monospace;font-size:.79rem;padding:5px 9px;outline:none;
  transition:border-color .2s;width:100%;box-sizing:border-box;letter-spacing:.04em}
.dec-comp-input:focus{border-color:var(--bm);box-shadow:0 0 0 3px rgba(0,96,160,.1)}
.dec-comp-btn{width:100%;margin-bottom:9px;background:var(--bm);border:none;border-radius:5px;
  color:#fff;font-family:'Courier New',monospace;font-size:.72rem;font-weight:700;
  padding:5px 10px;cursor:pointer;letter-spacing:.05em;transition:background .15s}
.dec-comp-btn:hover{background:var(--bd)}
.dec-comp-table{display:none}
.dec-comp-table.visible{display:block}
.dec-verdict{text-align:center;padding:5px 12px;border-radius:6px;
  font-family:'Courier New',monospace;font-size:.72rem;font-weight:700;
  letter-spacing:.05em;margin-bottom:7px}
.vrd-ok{background:#E8F5E9;color:#2E7D32;border:1px solid #A5D6A7}
.vrd-mir{background:var(--bl);color:var(--bm);border:1px solid #90CAF9}
.vrd-sim{background:#FFF8E1;color:#8B6000;border:1px solid #FFE082}
.vrd-diff{background:#FFEBEE;color:var(--red);border:1px solid #FFCDD2}
.dec-cmp-row{display:grid;grid-template-columns:68px 1fr 1fr;gap:3px;margin-bottom:3px;align-items:start}
.dec-cmp-lbl{font-family:'Courier New',monospace;font-size:.63rem;color:var(--g5);
  letter-spacing:.07em;padding-top:3px}
.dec-cmp-cell{font-size:.77rem;padding:3px 7px;border-radius:4px;line-height:1.35;border:1px solid transparent}
.ccell-match{background:#E8F5E9;color:#2E7D32;border-color:#C8E6C9}
.ccell-mir{background:var(--bl);color:var(--bm);border-color:#B3D4F0}
.ccell-diff{background:#FFEBEE;color:var(--red);border-color:#FFCDD2}
.ccell-na{background:var(--g1);color:var(--g5);font-style:italic}

/* db toolbar */
.dec-db-bar{display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 16px;
  background:var(--g1);border-top:1px solid var(--g2);flex-wrap:wrap}
.dec-db-label{font-family:'Courier New',monospace;font-size:.67rem;color:var(--g5);
  letter-spacing:.07em;flex:1}
.dec-db-label span{color:var(--bm);font-weight:700}
.dec-db-btn{background:#fff;color:var(--bm);border:1.5px solid #90CAF9;border-radius:5px;
  font-family:'Courier New',monospace;font-size:.7rem;font-weight:700;padding:4px 10px;
  cursor:pointer;letter-spacing:.04em;transition:border-color .15s,background .15s;white-space:nowrap}
.dec-db-btn:hover{border-color:var(--bm);background:var(--bl)}
.dec-db-status{font-family:'Courier New',monospace;font-size:.67rem;color:var(--g5);
  padding:0 16px 6px;min-height:14px;transition:color .3s}
.dec-db-status.ok{color:#2E7D32}.dec-db-status.err{color:var(--red)}
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
//  MODAL — COLUMNAS (con reordenamiento drag & drop)
// ============================================================
const ModalCols = ({ visibleCols, colOrder, onChange, onReorder, onClose }) => {
  const [localOrder, setLocalOrder] = React.useState([...colOrder]);
  const [dragging, setDragging] = React.useState(null);

  const orderedCols = localOrder.map(k => visibleCols.find(c=>c.key===k)).filter(Boolean);
  const getIdx = key => visibleCols.findIndex(c=>c.key===key);

  return (
    <div className="mo show">
      <div className="md sm">
        <div className="mh"><h2>👁 Columnas — Visibilidad y Orden</h2><button className="mx" onClick={onClose}>×</button></div>
        <div className="mb">
          <p style={{fontSize:'.78rem',color:'var(--g5)',marginBottom:10}}>
            ☑ Activa/desactiva · <strong>Arrastra</strong> para reordenar
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {orderedCols.map((col,li)=>(
              <div key={col.key}
                draggable
                onDragStart={()=>setDragging(col.key)}
                onDragOver={e=>{e.preventDefault();}}
                onDrop={()=>{
                  if(dragging===null||dragging===col.key)return;
                  setLocalOrder(prev=>{
                    const arr=[...prev];
                    const fi=arr.indexOf(dragging);const ti=arr.indexOf(col.key);
                    arr.splice(fi,1);arr.splice(ti,0,dragging);return arr;
                  });setDragging(null);
                }}
                style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',
                  borderRadius:6,background:dragging===col.key?'var(--bl)':'var(--g1)',
                  border:'1px solid var(--g2)',cursor:'grab'}}>
                <span style={{color:'var(--g3)',fontSize:'1rem',cursor:'grab'}}>⠿</span>
                <input type="checkbox" checked={col.show}
                  onChange={e=>onChange(getIdx(col.key),e.target.checked)}
                  style={{width:15,height:15,accentColor:'var(--bm)',cursor:'pointer'}}/>
                <span style={{fontSize:'.84rem',flex:1,color:col.show?'var(--g9)':'var(--g5)'}}>{col.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" onClick={()=>{onReorder(localOrder);onClose();}}>✓ Aplicar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  MODAL — REEMPLAZO MASIVO
// ============================================================
const ModalReplace = ({ cols, onReplace, onClose }) => {
  const [fieldIdx, setFieldIdx] = React.useState(0);
  const [searchVal, setSearchVal] = React.useState('');
  const [replaceVal, setReplaceVal] = React.useState('');
  const [matchExact, setMatchExact] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const doReplace = async () => {
    if (!searchVal.trim()) return;
    setRunning(true); setResult(null);
    const count = await onReplace(Number(fieldIdx), searchVal, replaceVal, matchExact);
    setResult(count); setRunning(false);
  };

  return (
    <div className="mo show">
      <div className="md sm">
        <div className="mh"><h2>🔄 Reemplazo Masivo</h2><button className="mx" onClick={onClose}>×</button></div>
        <div className="mb">
          <p style={{fontSize:'.8rem',color:'var(--g5)',marginBottom:14,lineHeight:1.5}}>
            Busca un valor en un campo y lo reemplaza en <strong>todos los registros que coincidan</strong>.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="fg2">
              <label>Campo a modificar</label>
              <select value={fieldIdx} onChange={e=>setFieldIdx(e.target.value)} style={{background:'var(--g1)',border:'1.5px solid var(--g3)',borderRadius:7,padding:'8px 11px',fontSize:'.84rem',width:'100%'}}>
                {cols.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div className="fg2">
              <label>Buscar</label>
              <input type="text" value={searchVal} onChange={e=>setSearchVal(e.target.value)}
                placeholder="Ej: VIGO"
                style={{background:'var(--g1)',border:'1.5px solid var(--g3)',borderRadius:7,padding:'8px 11px',fontSize:'.84rem',width:'100%',outline:'none'}}/>
            </div>
            <div className="fg2">
              <label>Reemplazar por</label>
              <input type="text" value={replaceVal} onChange={e=>setReplaceVal(e.target.value)}
                placeholder="Ej: HILUX VIGO"
                style={{background:'var(--g1)',border:'1.5px solid var(--g3)',borderRadius:7,padding:'8px 11px',fontSize:'.84rem',width:'100%',outline:'none'}}/>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:'.82rem',color:'var(--g7)',cursor:'pointer'}}>
              <input type="checkbox" checked={matchExact} onChange={e=>setMatchExact(e.target.checked)} style={{width:15,height:15,accentColor:'var(--bm)'}}/>
              Solo coincidencia exacta (no parcial)
            </label>
            {result !== null && (
              <div style={{padding:'10px 14px',borderRadius:7,background:result>0?'#E8F5E9':'#FFF8E1',
                border:`1px solid ${result>0?'#C8E6C9':'#FFE082'}`,fontSize:'.82rem',
                color:result>0?'var(--grn)':'#8B6000',fontWeight:600}}>
                {result>0 ? `✅ ${result} registro${result>1?'s':''} actualizado${result>1?'s':''}` : '⚠ Sin coincidencias'}
              </div>
            )}
          </div>
          <div style={{marginTop:12,padding:'9px 13px',background:'#FFF8E1',borderRadius:7,fontSize:'.74rem',color:'#8B6000',borderLeft:'3px solid var(--gold)'}}>
            ⚠ Esta acción modifica la base de datos en Supabase. No se puede deshacer automáticamente.
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-o" onClick={onClose} disabled={running}>Cerrar</button>
          <button className="btn btn-p" onClick={doReplace} disabled={running||!searchVal.trim()}>
            {running ? <><span className="spin" style={{width:13,height:13,borderWidth:2}}/>Procesando…</> : '🔄 Reemplazar'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
//  DECODIFICADOR — Carga BD desde Supabase "base_codigos"
// ============================================================
const COL_BASE_CODIGOS = 'base_codigos';

// Segmento colors cycle
const SEG_COLORS = ['blue','green','amber','purple'];

const SYSTEM_PREFIX_MAP = {
  '546':'Suspensión delantera','548':'Suspensión delantera','549':'Suspensión delantera',
  '545':'Dirección','553':'Dirección','554':'Dirección','555':'Suspensión',
  '565':'Suspensión trasera','568':'Amortiguador trasero','569':'Suspensión trasera',
  '577':'Eje trasero','513':'Plataforma','517':'Ejes / Ruedas','527':'Semieje',
  '581':'Frenos delanteros','583':'Frenos','584':'Frenos traseros','585':'Frenos delanteros',
  '586':'Frenos','281':'Filtros','971':'Filtros A/C','263':'Motor','265':'Motor',
  '178':'Filtros','871':'Filtros A/C','165':'Combustible','164':'Combustible',
  '484':'Suspensión','485':'Amortiguador','486':'Resorte','480':'Bucha/Buje',
  '488':'Barra estabilizadora','435':'Disco freno','424':'Disco trasero','442':'Cubo/Hub',
  '450':'Pastillas','451':'Pastillas','044':'Pastillas',
};

const FMT_ORIGEN = {
  hyundai_kia:'🇰🇷 Coreana', honda:'🇯🇵 Honda',
  toyota_nissan:'🇯🇵 Japonesa', mazda:'🇯🇵 Mazda', mitsubishi:'🇯🇵 Mitsubishi',
  suzuki:'🇯🇵 Suzuki', isuzu:'🇯🇵 Isuzu', ford:'🇺🇸 Ford',
  gm:'🇺🇸 GM / Chevrolet', subaru:'🇯🇵 Subaru',
  gates_medida:'📏 Medida (Correa)', aftermarket:'🔧 Aftermarket',
  referencia:'📋 Catálogo', landrover:'🇬🇧 Británica',
  china:'🇨🇳 China',
};

function detectFabFormat(fab) {
  if (!fab) return 'aftermarket';
  const f = fab.toLowerCase();
  if (f.includes('hyundai') || f.includes('kia')) return 'hyundai_kia';
  if (f.includes('honda'))     return 'honda';
  if (f.includes('toyota') || f.includes('nissan') || f.includes('infiniti')) return 'toyota_nissan';
  if (f.includes('mazda'))     return 'mazda';
  if (f.includes('mitsubishi'))return 'mitsubishi';
  if (f.includes('suzuki'))    return 'suzuki';
  if (f.includes('isuzu'))     return 'isuzu';
  if (f.includes('ford'))      return 'ford';
  if (f.includes('gm') || f.includes('chevrolet')) return 'gm';
  if (f.includes('subaru'))    return 'subaru';
  if (f.includes('gates') || f.includes('dayco') || f.includes('bando')) return 'gates_medida';
  if (f.includes('aftermarket') || f.includes('ntk') || f.includes('ngk') ||
      f.includes('frame') || f.includes('wix') || f.includes('fram') ||
      f.includes('moog') || f.includes('monroe') || f.includes('kyb') ||
      f.includes('nsk') || f.includes('skf') || f.includes('autolite') ||
      f.includes('bendix') || f.includes('dba') || f.includes('aip') ||
      f.includes('acp') || f.includes('flp') || f.includes('olp') || f.includes('rs '))
    return 'aftermarket';
  if (f.includes('referencia'))  return 'referencia';
  return 'aftermarket';
}

function getSegMeta(segIdx, totalSegs, familia, sistema, posicion, vehiculo, fab) {
  const fmt = detectFabFormat(fab);
  const fam = familia && familia !== '—' ? familia : null;
  const sis = sistema && sistema !== '—' ? sistema : null;
  const veh = vehiculo && vehiculo !== '—' ? vehiculo : null;

  // 2-fragment codes
  if (totalSegs === 2) {
    if (segIdx === 0) return { label: fam || 'Marca / Familia', sub: fab || 'Prefijo' };
    return { label: 'Número de parte', sub: 'Secuencial' };
  }

  // 3-fragment: Honda / Toyota style
  const maps3 = {
    honda:[
      { label:'Tipo de pieza', sub: sis || 'Prefijo numérico' },
      { label:'Plataforma', sub: veh || 'Código de modelo' },
      { label:'Variante', sub: 'Revisión de diseño' },
    ],
    toyota_nissan:[
      { label:'Sistema vehicular', sub: SYSTEM_PREFIX_MAP[segIdx===0?'485':''] || sis || 'Prefijo (3 dig.)' },
      { label:'Plataforma / Chasis', sub: veh || 'Código modelo' },
      { label:'Variante', sub: 'Revisión' },
    ],
    mazda:[
      { label:'Marca', sub: 'Código marca Mazda' },
      { label:'Categoría', sub: fam || sis },
      { label:'Número/Variante', sub: veh || 'Detalle' },
    ],
    mitsubishi:[
      { label:'Serie', sub: 'Prefijo Mitsubishi' },
      { label:'Número de parte', sub: 'Secuencial interno' },
      { label:'Variante', sub: 'Sufijo revisión' },
    ],
    aftermarket:[
      { label: fam || 'Marca/Familia', sub: fab || 'Prefijo marca' },
      { label: 'Tipo de parte', sub: sis || 'Referencia' },
      { label: 'Número', sub: 'Secuencial' },
    ],
  };
  const L3 = maps3[fmt] || maps3['aftermarket'];
  if (totalSegs === 3) return L3[segIdx] || { label:'Segmento', sub:'' };

  // 4-fragment default: Hyundai/Kia style
  const maps4 = {
    hyundai_kia:[
      { label:'Sistema vehicular', sub: sis || (SYSTEM_PREFIX_MAP['583'] || 'Prefijo sistema') },
      { label: fam ? 'Master / Cañerías freno' : 'Parte específica', sub: fam || 'Grupo de parte' },
      { label:'Plataforma / Chasis', sub: veh || 'Código modelo' },
      { label:'Versión / año rediseño', sub: 'Revisión de diseño' },
    ],
    honda:[
      { label:'Tipo de pieza', sub:'Número identificador' },
      { label:'Plataforma / Chasis', sub: veh || 'Código modelo' },
      { label:'Variante / Revisión', sub:'Versión plataforma' },
      { label:'Versión', sub:'Dígito de revisión' },
    ],
    toyota_nissan:[
      { label:'Sistema vehicular', sub: sis || 'Prefijo sistema' },
      { label:'Parte específica', sub:'Subtipo de pieza' },
      { label:'Plataforma', sub: veh || 'Código modelo' },
      { label:'Revisión', sub:'Versión/variante' },
    ],
    mazda:[
      { label:'Marca', sub:'Prefijo Mazda' },
      { label:'Categoría', sub: fam || sis },
      { label:'Número de parte', sub:'Secuencial' },
      { label:'Revisión', sub:'Sufijo' },
    ],
    mitsubishi:[
      { label:'Prefijo', sub:'Código Mitsubishi' },
      { label:'Número de parte', sub:'Secuencial' },
      { label:'Variante', sub:'Detalle' },
      { label:'Revisión', sub:'Sufijo' },
    ],
    suzuki:[
      { label:'Sistema vehicular', sub: sis || 'Prefijo sistema' },
      { label:'Parte específica', sub:'Código función' },
      { label:'Modelo aplicación', sub: veh || 'Código vehículo' },
      { label:'Versión', sub:'Revisión/variante' },
    ],
    isuzu:[
      { label:'Prefijo marca', sub:'Código Isuzu' },
      { label:'Número parte', sub:'Secuencial' },
      { label:'Variante', sub:'Especificación' },
      { label:'Revisión', sub:'Sufijo' },
    ],
    gm:[
      { label:'Sistema vehicular', sub: sis || 'Prefijo GM' },
      { label:'Número base', sub:'Secuencial' },
      { label:'Variante', sub:'Código aplicación' },
      { label:'Revisión', sub:'Sufijo' },
    ],
    gates_medida:[
      { label: fam || 'Tipo / Canales', sub:'Prefijo correa' },
      { label:'Longitud (mm)', sub:'Medida exterior' },
      { label:'Variante', sub:'Sufijo especial' },
      { label:'Revisión', sub:'Dígito de revisión' },
    ],
    ford:[
      { label:'Plataforma Ford', sub:'Prefijo año/serie' },
      { label:'Sistema', sub: sis || 'Código sistema' },
      { label:'Número de parte', sub:'Secuencial' },
      { label:'Revisión', sub:'Dígito de revisión' },
    ],
    landrover:[
      { label:'Prefijo marca', sub:'LR = Land Rover / JLR' },
      { label:'Categoría', sub: fam || sis },
      { label:'Número de parte', sub:'Secuencial interno' },
      { label:'Revisión', sub:'Sufijo de versión' },
    ],
    china:[
      { label:'Sistema', sub: sis || 'Prefijo sistema (4 díg.)' },
      { label:'Subsistema', sub: fam || 'Grupo funcional' },
      { label:'Número de parte', sub:'Secuencial (4-6 dígitos)' },
      { label:'Variante', sub: veh || 'Versión/aplicación' },
    ],
    aftermarket:[
      { label: fam || 'Marca / Familia', sub: fab || 'Prefijo marca' },
      { label: sis || 'Sistema', sub:'Clasificación' },
      { label:'Número de parte', sub:'Secuencial' },
      { label:'Variante', sub:'Sufijo' },
    ],
  };
  const L4 = maps4[fmt] || maps4['hyundai_kia'];
  return L4[segIdx] || { label:'Segmento', sub:'' };
}

const DEC_TYPE_LABELS = {
  'OEM':         ['OEM',         'badge-oem'],
  'Aftermarket': ['AFTERMARKET', 'badge-after'],
  'Medida':      ['MEDIDA',      'badge-medida'],
  'Referencia':  ['REFERENCIA',  'badge-ref'],
  'Desconocido': ['DESCONOCIDO', 'badge-unknown'],
};

// ── Context para decodificador automático ──
const DecodificadorCtx = createContext(null);
const useDecodificador = () => useContext(DecodificadorCtx);

function DecodificadorTab({ selectedCode = null }) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [decDB,     setDecDB]     = useState({});
  const [dbCount,   setDbCount]   = useState(0);
  const [dbStatus,  setDbStatus]  = useState('');
  const [dbStatusCls, setDbStatusCls] = useState('');
  const [dbLoading, setDbLoading] = useState(true);

  const [query,       setQuery]       = useState('');
  const [result,      setResult]      = useState(null);   // { code, data: [...] }
  const [notFound,    setNotFound]    = useState('');
  const [suggests,    setSuggests]    = useState([]);
  const [anatomy,     setAnatomy]     = useState(null);   // { code, parts[] }

  const [compOpen,    setCompOpen]    = useState(false);
  const [compB,       setCompB]       = useState('');
  const [compResult,  setCompResult]  = useState(null);

  // ── Load BD from Supabase ──────────────────────────────────
  useEffect(() => {
    (async () => {
      setDbLoading(true);
      setDbStatus('Cargando base de códigos…');
      try {
        const PAGE = 1000; let all = []; let from = 0;
        while (true) {
          const { data, error } = await supabase
            .from(COL_BASE_CODIGOS)
            .select('*')
            .range(from, from + PAGE - 1);
          if (error) throw new Error(error.message);
          if (!data || data.length === 0) break;
          all = all.concat(data);
          if (data.length < PAGE) break;
          from += PAGE;
        }
        // Build dict: { CODIGO: [tipo, fab, veh, familia, sistema, posicion, f1,f2,f3,f4] }
        const db = {};
        all.forEach(row => {
          const c = String(row.codigo || '').trim().toUpperCase().replace(/\s/g,'');
          if (!c) return;
          db[c] = [
            row.tipo       || 'Desconocido',
            row.fabricante || '—',
            row.vehiculo   || '—',
            row.familia    || '—',
            row.sistema    || '—',
            row.posicion   || '—',
            String(row.frag_1 || '—'),
            String(row.frag_2 || '—'),
            String(row.frag_3 || '—'),
            String(row.frag_4 || '—'),
          ];
        });
        setDecDB(db);
        setDbCount(Object.keys(db).length);
        setDbStatus(`✓ ${Object.keys(db).length.toLocaleString()} códigos activos`);
        setDbStatusCls('ok');
      } catch (e) {
        setDbStatus('✗ Error: ' + e.message);
        setDbStatusCls('err');
        toast('Error cargando BD del Decodificador: ' + e.message, 'error');
      } finally {
        setDbLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  // ── Auto-decode cuando se selecciona un código desde la tabla ──
  useEffect(() => {
    if (selectedCode && decDB && Object.keys(decDB).length > 0) {
      setQuery(selectedCode);
      decode(selectedCode);
    }
  }, [selectedCode, decDB]); // eslint-disable-line

  // ── Upload XLSX to Supabase ─────────────────────────────────
  const handleUploadBD = async (file) => {
    if (!file) return;
    setDbStatus('Leyendo archivo…'); setDbStatusCls('');
    try {
      const xlsxLib = await loadXLSX();
      const buf  = await file.arrayBuffer();
      const wb   = xlsxLib.read(buf, { type:'array' });
      const sheetName = wb.SheetNames.find(n => n.toUpperCase().startsWith('BASE')) || wb.SheetNames[0];
      const ws   = wb.Sheets[sheetName];
      const rows = xlsxLib.utils.sheet_to_json(ws, { defval:'' });

      // Helper: read a field accepting both UPPER and lower case headers
      const g = (row, key) => row[key] ?? row[key.toUpperCase()] ?? row[key.toLowerCase()] ?? '';

      let ok = 0, skip = 0;
      const upsertRows = [];
      for (const row of rows) {
        const raw = String(g(row,'codigo') || g(row,'CODIGO') || '');
        const code = raw.trim().toUpperCase().replace(/\s/g,'');
        if (!code) { skip++; continue; }
        upsertRows.push({
          codigo:     code,
          tipo:       g(row,'tipo')       || g(row,'TIPO')       || 'Desconocido',
          fabricante: g(row,'fabricante') || g(row,'FABRICANTE') || '—',
          vehiculo:   g(row,'vehiculo')   || g(row,'VEHICULO')   || '—',
          familia:    g(row,'familia')    || g(row,'FAMILIA')    || '—',
          sistema:    g(row,'sistema')    || g(row,'SISTEMA')    || '—',
          posicion:   g(row,'posicion')   || g(row,'POSICION')   || '—',
          frag_1:     String(g(row,'frag_1') || g(row,'FRAG_1') || '') || '—',
          frag_2:     String(g(row,'frag_2') || g(row,'FRAG_2') || '') || '—',
          frag_3:     String(g(row,'frag_3') || g(row,'FRAG_3') || '') || '—',
          frag_4:     String(g(row,'frag_4') || g(row,'FRAG_4') || '') || '—',
        });
        ok++;
      }
      // Upsert in batches of 500
      const BATCH = 500;
      for (let i = 0; i < upsertRows.length; i += BATCH) {
        const { error } = await supabase
          .from(COL_BASE_CODIGOS)
          .upsert(upsertRows.slice(i, i + BATCH), { onConflict:'codigo' });
        if (error) throw new Error(error.message);
        setDbStatus(`Subiendo… ${Math.min(i+BATCH, ok)}/${ok}`);
      }
      // Reload local DB
      const db = {};
      upsertRows.forEach(r => { db[r.codigo] = [r.tipo,r.fabricante,r.vehiculo,r.familia,r.sistema,r.posicion,r.frag_1,r.frag_2,r.frag_3,r.frag_4]; });
      setDecDB(db);
      setDbCount(ok);
      setDbStatus(`✓ BD cargada — ${ok} códigos desde "${file.name}"${skip?`, ${skip} omitidas`:''}`);
      setDbStatusCls('ok');
      toast(`✅ ${ok} códigos del Decodificador cargados en Supabase.`, 'success');
    } catch (e) {
      setDbStatus('✗ Error: ' + e.message); setDbStatusCls('err');
      toast('Error cargando BD Decodificador: ' + e.message, 'error');
    }
  };

  // ── Download BD as XLSX — headers en minúsculas para compatibilidad con Supabase ──
  const handleDownloadBD = async () => {
    try {
      const xlsxLib = await loadXLSX();
      // Lowercase headers match Supabase column names exactly
      const COLS = ['codigo','tipo','fabricante','vehiculo','familia','sistema','posicion','frag_1','frag_2','frag_3','frag_4'];
      const data = [COLS];
      for (const [code, r] of Object.entries(decDB)) {
        data.push([code, r[0],r[1],r[2],r[3],r[4],r[5],
          r[6]==='—'?'':r[6], r[7]==='—'?'':r[7], r[8]==='—'?'':r[8], r[9]==='—'?'':r[9]]);
      }
      const ws = xlsxLib.utils.aoa_to_sheet(data);
      ws['!cols'] = [26,12,34,38,38,26,22,10,10,10,10].map(w=>({wch:w}));
      const wb = xlsxLib.utils.book_new();
      xlsxLib.utils.book_append_sheet(wb, ws, 'BASE_CODIGOS');
      xlsxLib.writeFile(wb, 'base_codigos_decodificador.xlsx');
      toast(`📥 ${data.length-1} códigos exportados.`, 'success');
    } catch (e) {
      toast('Error al exportar: ' + e.message, 'error');
    }
  };

  // ── Build anatomy parts ─────────────────────────────────────
  const buildAnatomyParts = (code, frags, familia, sistema, posicion, vehiculo, fab) => {
    const realFrags = frags.filter(f => f && f !== '—');
    const useFrags = realFrags.length > 0 ? realFrags : [code];
    const parts = [];
    let remaining = code, fragIdx = 0, segColorIdx = 0;
    while (fragIdx < useFrags.length) {
      const frag = useFrags[fragIdx];
      const pos  = remaining.indexOf(frag);
      if (pos < 0) { fragIdx++; continue; }
      const dashPos = remaining.indexOf('-');
      if (dashPos >= 0 && dashPos < pos) {
        if (parts.length > 0 && !parts[parts.length-1].sep) parts.push({ sep:true });
        remaining = remaining.substring(dashPos + 1);
        continue;
      }
      parts.push({ text: frag, idx: segColorIdx });
      segColorIdx++;
      remaining = remaining.substring(pos + frag.length);
      fragIdx++;
    }
    const totalSegs = parts.filter(p => !p.sep).length;
    return parts.map(p => {
      if (p.sep) return { sep: true };
      const color = SEG_COLORS[p.idx % SEG_COLORS.length];
      const meta  = getSegMeta(p.idx, totalSegs, familia, sistema, posicion, vehiculo, fab);
      return { text: p.text, color, meta };
    });
  };

  // ── Decode ──────────────────────────────────────────────────
  const decode = (rawCode) => {
    const raw = (rawCode || query).trim().toUpperCase().replace(/\s/g,'');
    setResult(null); setNotFound(''); setSuggests([]); setCompOpen(false); setCompResult(null);
    if (!raw) return;

    if (decDB[raw]) {
      showResultData(raw, decDB[raw]);
      return;
    }
    const keys = Object.keys(decDB);
    const matches = keys.filter(k => k.startsWith(raw) || k.includes(raw)).slice(0, 12);
    if (matches.length === 1) { showResultData(matches[0], decDB[matches[0]]); setQuery(matches[0]); return; }
    if (matches.length > 1) { setNotFound('Código exacto no encontrado. Resultados similares:'); setSuggests(matches); }
    else setNotFound(`No se encontró el código "${raw}" en la base de datos.`);
  };

  const showResultData = (code, r) => {
    const [tipo, fab, vehiculo, familia, sistema, posicion, f1, f2, f3, f4] = r;
    setResult({ code, tipo, fab, vehiculo, familia, sistema, posicion, frags:[f1,f2,f3,f4].filter(f=>f&&f!=='—') });
    const origCode = detectFabFormat(fab);
    const origen   = FMT_ORIGEN[origCode] || '';
    const parts = buildAnatomyParts(code, [f1,f2,f3,f4], familia, sistema, posicion, vehiculo, fab);
    setAnatomy({ code, origen, parts });
    setCompB('');
  };

  // ── Compare ─────────────────────────────────────────────────
  const compare = () => {
    const cA = result?.code;
    const cB = compB.trim().toUpperCase().replace(/\s/g,'');
    if (!cA || !cB) { setCompResult({ error: 'Ingresa ambos códigos' }); return; }
    const rA = decDB[cA];
    const rB = decDB[cB];
    if (!rA && !rB) { setCompResult({ error: 'Ninguno de los dos códigos está en la BD' }); return; }

    const CAMPOS = [['TIPO',0],['FABRICANTE',1],['FAMILIA',3],['SISTEMA',4],['VEHÍCULO',2],['POSICIÓN',5]];
    const posA = rA ? rA[5] : '—';
    const posB = rB ? rB[5] : '—';
    const mirrorPairs = [
      ['Izquierdo','Derecho'],['Derecho','Izquierdo'],
      ['Izquierdo','Derecho (algunos sistemas)'],['Derecho (algunos sistemas)','Izquierdo'],
      ['Derecho','Derecho (algunos sistemas)'],['Derecho (algunos sistemas)','Derecho'],
    ];
    const isMirror = rA && rB && mirrorPairs.some(([a,b]) => posA===a && posB===b);
    let matches = 0, total = 0;
    if (rA && rB) {
      CAMPOS.forEach(([,i]) => { if (i===5) return; total++; if (rA[i]===rB[i]) matches++; });
    }
    const score = rA && rB ? matches/total : 0;
    let vrdCls, vrdTxt;
    if (!rA || !rB)       { vrdCls='vrd-diff'; vrdTxt='⚠ UN CÓDIGO NO ESTÁ EN LA BASE'; }
    else if (cA===cB)     { vrdCls='vrd-ok';   vrdTxt='✓ MISMO CÓDIGO'; }
    else if (isMirror && score>=0.8) { vrdCls='vrd-mir'; vrdTxt='⇄ ESPEJO — Lado contrario del mismo conjunto'; }
    else if (score===1)   { vrdCls='vrd-ok';   vrdTxt='✓ INTERCAMBIABLES — Misma familia y sistema'; }
    else if (score>=0.6)  { vrdCls='vrd-sim';  vrdTxt='~ SIMILARES — Verificar aplicación'; }
    else                  { vrdCls='vrd-diff'; vrdTxt='✗ DIFERENTE — Familia o sistema distinto'; }

    const rows = CAMPOS.map(([label, idx]) => {
      const vA = rA ? (rA[idx]||'—') : '—';
      const vB = rB ? (rB[idx]||'—') : '—';
      const match = vA===vB;
      const isPos = idx===5;
      let clsA = match ? 'ccell-match' : (isPos&&isMirror ? 'ccell-mir' : 'ccell-diff');
      let clsB = clsA;
      if (!rA) clsA='ccell-na'; if (!rB) clsB='ccell-na';
      return { label, vA, vB, clsA, clsB };
    });
    setCompResult({ vrdCls, vrdTxt, codeA:cA, codeB:cB, rows });
  };

  const fileRef = useRef(null);
  const posColor = p => p==='Izquierdo'?'hl-green': p.includes('Derecho')?'hl-amber':p==='—'?'':'hl-blue';

  return (
    <div className="dec-wrap" style={{position:'fixed',bottom:0,left:0,right:0,zIndex:1000,maxHeight:'50vh',overflowY:'auto',background:'var(--dark)'}}>
      {/* Section header */}
      <div className="dec-section-title">
        <span style={{fontSize:'1.1rem'}}>🔍</span>
        <div>
          <div className="dec-section-label">Decodificador de Códigos</div>
          <div className="dec-section-sub">Selecciona un código de la tabla para decodificar automáticamente</div>
        </div>
        <span style={{marginLeft:'auto',fontFamily:'Courier New,monospace',fontSize:'.65rem',
          color:'rgba(255,255,255,.5)',background:'rgba(255,255,255,.08)',padding:'2px 8px',
          borderRadius:4,border:'1px solid rgba(255,255,255,.15)'}}>
          BASE v2025 · {dbCount.toLocaleString()} códigos
        </span>
      </div>

      <div className="dec-inner">
      <div className="dec-card">
        {/* ── Display código seleccionado (read-only) ── */}
        {selectedCode && (
          <div className="dec-top">
            <div className="dec-label">
              <span className="dec-tag">CÓDIGO SELECCIONADO</span>
              <span className="dec-title"><span>{query}</span></span>
            </div>
          </div>
        )}

        {!selectedCode && (
          <div style={{padding:'16px 14px',color:'#90CAF9',fontSize:'.85rem',fontStyle:'italic',textAlign:'center'}}>
            Selecciona un código de la tabla para decodificarlo aquí…
          </div>
        )}

        {/* ── Loading state ── */}
        {dbLoading && (
          <div className="loading" style={{padding:'20px',background:'var(--bl)',borderRadius:0}}>
            <span className="spin"/>Cargando base de códigos desde Supabase…
          </div>
        )}

        {/* ── Not found ── */}
        {notFound && (
          <div className="dec-notfound visible" style={{margin:'8px 14px 0'}}>
            {notFound}
          </div>
        )}

        {/* ── Suggestions ── */}
        {suggests.length > 0 && (
          <div className="dec-suggest" style={{display:'block', margin:'6px 14px 0'}}>
            <div className="dec-suggest-title">SIMILARES ENCONTRADOS</div>
            <div className="dec-suggest-list">
              {suggests.map(k => (
                <span key={k} className="dec-chip" onClick={() => { setQuery(k); decode(k); setSuggests([]); setNotFound(''); }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Result ── */}
        {result && (
          <div className="dec-result visible">
            <div className="dec-result-hdr">
              <span className="dec-code">{result.code}</span>
            </div>
            <div className="dec-two">
              {/* Left: anatomy */}
              <div>
                {anatomy && anatomy.parts.length > 0 && (
                  <div className="dec-anatomy">
                    <div className="dec-anat-title">
                      ANATOMÍA DEL CÓDIGO &nbsp;—&nbsp; <span>{anatomy.code}</span>
                      {anatomy.origen && <span style={{fontSize:'.62rem',opacity:.6,marginLeft:8,fontFamily:'inherit'}}>{anatomy.origen}</span>}
                    </div>
                    <div className="dec-seg-row">
                      {anatomy.parts.map((p, i) => p.sep ? (
                        <div key={i} className="dec-sep">-</div>
                      ) : (
                        <div key={i} className="dec-seg">
                          <div className={`dec-seg-box seg-${p.color}`}>{p.text}</div>
                          <div className="dec-seg-line"/>
                          <div className={`dec-seg-label lbl-${p.color}`}
                            dangerouslySetInnerHTML={{__html: p.meta.label.replace(/\n/g,'<br/>')}}/>
                          <div className="dec-seg-sub-line"/>
                          <div className="dec-seg-sub">{p.meta.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: details + comparador */}
              <div>
                <div className="dec-grid">
                  {[
                    ['TIPO',      <span className={`dec-badge ${DEC_TYPE_LABELS[result.tipo]?.[1]||'badge-unknown'}`}>{DEC_TYPE_LABELS[result.tipo]?.[0]||result.tipo}</span>],
                    ['FABRICANTE', result.fab],
                    ['FAMILIA',   <span className="hl-blue">{result.familia}</span>],
                    ['SISTEMA',   result.sistema],
                    ['VEHÍCULO',  result.vehiculo==='—'
                      ? <span style={{color:'var(--g5)',fontStyle:'italic'}}>Universal / Verificar</span>
                      : result.vehiculo],
                    ['POSICIÓN',  result.posicion==='—'
                      ? <span style={{color:'var(--g5)'}}>—</span>
                      : <span className={posColor(result.posicion)}>{result.posicion}</span>],
                    ...(result.frags.length>0 ? [['FRAGMENTOS',
                      <span>{result.frags.map(f=>(
                        <span key={f} style={{display:'inline-block',background:'var(--bl)',border:'1px solid #90CAF9',
                          borderRadius:3,padding:'1px 6px',fontFamily:'Courier New,monospace',fontSize:'.72rem',marginRight:3,color:'var(--bm)'}}>
                          {f}
                        </span>
                      ))}</span>
                    ]] : []),
                  ].map(([k,v]) => (
                    <div key={k} className="dec-row">
                      <div className="dec-key">{k}</div>
                      <div className="dec-val">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Comparador toggle */}
                <button
                  className={`dec-comp-toggle${compOpen?' open':''}`}
                  onClick={() => { setCompOpen(o=>!o); if (!compOpen) setTimeout(()=>document.getElementById('dec-comp-b')?.focus(),50); }}
                >
                  <span className="arr">▶</span> COMPARAR CON OTRO CÓDIGO
                </button>

                {compOpen && (
                  <div className="dec-comparador visible">
                    <div className="dec-comp-inputs">
                      <input className="dec-comp-input" value={result.code} readOnly style={{color:'var(--bm)',fontWeight:700}}/>
                      <div className="dec-comp-vs">VS</div>
                      <input id="dec-comp-b" className="dec-comp-input" type="text"
                        value={compB} placeholder="Código B…" maxLength={30}
                        onChange={e => setCompB(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key==='Enter' && compare()}
                      />
                    </div>
                    <button className="dec-comp-btn" onClick={compare}>⇄ COMPARAR</button>

                    {compResult && (
                      <div className="dec-comp-table visible">
                        {compResult.error
                          ? <div style={{fontSize:'.78rem',color:'var(--red)',textAlign:'center'}}>{compResult.error}</div>
                          : <>
                            <div className={`dec-verdict ${compResult.vrdCls}`}>{compResult.vrdTxt}</div>
                            <div className="dec-cmp-row" style={{marginBottom:4}}>
                              <div className="dec-cmp-lbl"/>
                              <div style={{fontFamily:'Courier New,monospace',fontSize:'.65rem',color:'var(--g5)',padding:'0 7px'}}>{compResult.codeA}</div>
                              <div style={{fontFamily:'Courier New,monospace',fontSize:'.65rem',color:'var(--g5)',padding:'0 7px'}}>{compResult.codeB}</div>
                            </div>
                            {compResult.rows.map(({label,vA,vB,clsA,clsB}) => (
                              <div key={label} className="dec-cmp-row">
                                <div className="dec-cmp-lbl">{label}</div>
                                <div className={`dec-cmp-cell ${clsA}`}>{vA}</div>
                                <div className={`dec-cmp-cell ${clsB}`}>{vB}</div>
                              </div>
                            ))}
                          </>
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DB toolbar ── */}
        <div className="dec-db-bar">
          <div className="dec-db-label">
            BASE: <span id="dec-db-count">{dbCount.toLocaleString()}</span> códigos activos
          </div>
          {isAdmin && (
            <>
              <button className="dec-db-btn" onClick={() => fileRef.current?.click()}>
                ⬆ CARGAR BD (.xlsx)
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:'none'}}
                onChange={e => { if(e.target.files[0]) handleUploadBD(e.target.files[0]); e.target.value=''; }}
              />
            </>
          )}
          <button className="dec-db-btn" onClick={handleDownloadBD}>⬇ DESCARGAR BD (.xlsx)</button>
        </div>
        <div className={`dec-db-status${dbStatusCls?' '+dbStatusCls:''}`}>{dbStatus}</div>
      </div>
      </div>{/* /dec-inner */}
    </div>
  );
}

// ============================================================
//  APP PRINCIPAL  (interna — sin exports)
// ============================================================
function CatalogoApp() {
  const toast = useToast();
  const { isAdmin, user, role, signOut } = useAuth();

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
  const [colOrder, setColOrder] = useState(COL_DEFS_ORDER);
  const [colWidths, setColWidths] = useState(()=>Object.fromEntries(COL_DEFS.map(c=>[c.key,c.width||120])));
  const [visibleCols, setVisibleCols] = useState(COL_DEFS.map(c=>({...c})));

  const [modalEdit,   setModalEdit]   = useState(null);
  const [modalDel,    setModalDel]    = useState(null);
  const [modalDetail, setModalDetail] = useState(null);
  const [showImport,  setShowImport]  = useState(false);
  const [showCols,    setShowCols]    = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null); // Para decodificador automático

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

  // ── Reemplazo masivo ──
  const handleBulkReplace = async (fieldIdx, searchVal, replaceVal, matchExact) => {
    const search = searchVal.trim();
    const replace = replaceVal.trim();
    if (!search) return 0;
    let count = 0;
    const updated = [];
    for (const rec of records) {
      const cur = rec.fields[fieldIdx] || '';
      let newVal;
      if (matchExact) {
        newVal = cur === search ? replace : cur;
      } else {
        newVal = cur.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), replace);
      }
      if (newVal !== cur) {
        updated.push({ rec, newFields: [...rec.fields.slice(0,fieldIdx), newVal, ...rec.fields.slice(fieldIdx+1)] });
        count++;
      }
    }
    for (const { rec, newFields } of updated) {
      await fsUpdate(rec._id, { fields: newFields });
    }
    if (count > 0) {
      setRecords(prev => prev.map(r => {
        const u = updated.find(x => x.rec._id === r._id);
        return u ? { ...r, fields: u.newFields } : r;
      }));
      await logEntry('EDITAR', `Reemplazo masivo: campo ${COL_DEFS.find(c=>c.key===fieldIdx)?.label} — "${search}" → "${replace}" (${count} registros)`);
      toast(`✅ ${count} registros actualizados.`, 'success');
    } else {
      toast('No se encontraron coincidencias.', 'info');
    }
    return count;
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

  const activeCols = colOrder
    .map(k => visibleCols.find(c => c.key === k))
    .filter(c => c && c.show);
  const [showReplace, setShowReplace] = useState(false);
  const [dragCol, setDragCol] = useState(null);
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
          {isAdmin && <button className="btn btn-g"
            onClick={()=>setModalEdit({_id:null,fields:Array(9).fill('')})}>➕ Nuevo</button>}
          {isAdmin && <button className="btn btn-c" onClick={()=>setShowImport(true)}>📂 Cargar base</button>}
          <button className="btn btn-c" onClick={exportCSV}>📥 Excel</button>
          <button className="btn btn-c" onClick={()=>setShowCols(true)}>👁 Columnas</button>
          {isAdmin && <button className="btn btn-c" onClick={()=>setShowReplace(true)}>🔄 Reemplazar</button>}
          {isAdmin && <button className="btn btn-c" onClick={()=>{ loadChangelog(); setShowHistory(true); }}>
            📋 Historial
            {changelog.length>0&&<span style={{background:'var(--gold)',color:'var(--bd)',
              borderRadius:10,padding:'1px 7px',fontSize:'.7rem',marginLeft:4}}>
              {changelog.length}</span>}
          </button>}
          <div style={{display:'flex',alignItems:'center',gap:6,marginLeft:4,paddingLeft:8,borderLeft:'1px solid rgba(255,255,255,.2)'}}>
            <span style={{fontSize:'.68rem',color:'rgba(255,255,255,.75)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {user?.email?.split('@')[0]}
            </span>
            <span style={{background:isAdmin?'rgba(212,168,0,.3)':'rgba(255,255,255,.15)',color:isAdmin?'#FFE082':'rgba(255,255,255,.8)',
              fontSize:'.6rem',fontWeight:700,padding:'1px 7px',borderRadius:10,textTransform:'uppercase',letterSpacing:.5}}>
              {role}
            </span>
            <button className="btn btn-c btn-sm" onClick={signOut} title="Cerrar sesión"
              style={{padding:'3px 9px',fontSize:'.68rem'}}>⏏ Salir</button>
          </div>
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
              <th style={{width:80,minWidth:70,background:'var(--bd)',position:'sticky',top:0,zIndex:11}}>Acciones</th>
              {activeCols.map((col,ci)=>(
                <th key={col.key}
                  className={sortCol===col.key?'sorted':''}
                  draggable
                  onDragStart={e=>{e.dataTransfer.effectAllowed='move';setDragCol(col.key);}}
                  onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';e.currentTarget.style.borderLeft='3px solid var(--gold)';}}
                  onDragLeave={e=>{e.currentTarget.style.borderLeft='';}}
                  onDrop={e=>{
                    e.preventDefault();e.currentTarget.style.borderLeft='';
                    if(dragCol===null||dragCol===col.key) return;
                    setColOrder(prev=>{
                      const arr=[...prev];
                      const fromIdx=arr.indexOf(dragCol);
                      const toIdx=arr.indexOf(col.key);
                      arr.splice(fromIdx,1);arr.splice(toIdx,0,dragCol);
                      return arr;
                    });setDragCol(null);
                  }}
                  style={{width:colWidths[col.key]||120,minWidth:60,position:'relative',cursor:'grab'}}
                  onClick={()=>handleSort(col.key)}>
                  <span style={{pointerEvents:'none'}}>{col.label}<span className="si">{sortCol===col.key?(sortAsc?'↑':'↓'):'↕'}</span></span>
                  <span
                    style={{position:'absolute',right:0,top:0,bottom:0,width:6,cursor:'col-resize',background:'transparent',zIndex:12}}
                    onClick={e=>e.stopPropagation()}
                    onMouseDown={e=>{
                      e.preventDefault();e.stopPropagation();
                      const startX=e.clientX;const startW=colWidths[col.key]||120;
                      const onMove=ev=>setColWidths(p=>({...p,[col.key]:Math.max(60,startW+ev.clientX-startX)}));
                      const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
                      document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
                    }}
                  />
                </th>
              ))}
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
                  5:()=>f[5]?<span className="cc" style={{cursor:'pointer'}} onClick={()=>setSelectedCode(f[5])}>{highlightText(f[5],debText)}
                    <button className="btn-copy" onClick={e=>{e.stopPropagation();navigator.clipboard?.writeText(f[5]);toast('📋 Código copiado','info');}}>⧉</button>
                  </span>:<span className="cs">—</span>,
                  6:()=><span className="cs">{f[6]}</span>,
                  7:()=>f[7]?<span className="ct" style={{background:clasiBgColor(f[7])}}>{f[7]}</span>:null,
                  8:()=><span className="cs">{f[8]}</span>,
                };
                return (
                  <tr key={rec._id||ri}>
                    <td className="cac" onClick={e=>e.stopPropagation()} style={{width:80,minWidth:70}}>
                      {isAdmin ? <>
                        <button className="btn-edit" onClick={()=>setModalEdit(rec)}>✏</button>
                        <button className="btn-del"  onClick={()=>setModalDel(rec)}>🗑</button>
                      </> : <button className="btn-edit" onClick={()=>setModalDetail(rec)}>👁</button>}
                    </td>
                    {activeCols.map(col=>(
                      <td key={col.key} onClick={()=>setModalDetail(rec)} style={{cursor:'pointer',width:colWidths[col.key]||120,maxWidth:colWidths[col.key]||120,overflow:'hidden',textOverflow:'ellipsis'}}>
                        {cell[col.key]?cell[col.key]():f[col.key]}
                      </td>
                    ))}
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
      {modalEdit && isAdmin && (
        <ModalEdit
          record={modalEdit._id?modalEdit:null}
          onSave={async(data)=>{
            if(modalEdit._id) await handleSaveEdit(modalEdit,data);
            else              await handleSaveNew(data);
          }}
          onClose={()=>setModalEdit(null)}
        />
      )}
      {modalDel && isAdmin && <ModalDelete record={modalDel} onConfirm={handleDelete} onClose={()=>setModalDel(null)}/>}
      {modalDetail && <ModalDetail  record={modalDetail}  onClose={()=>setModalDetail(null)} onEdit={r=>{setModalDetail(null);setModalEdit(r);}}/>}
      {showImport  && <ModalImport  onClose={()=>setShowImport(false)}  onImport={handleImport}/>}
      {showCols    && <ModalCols    visibleCols={visibleCols} colOrder={colOrder} onChange={(i,s)=>setVisibleCols(v=>v.map((c,ci)=>ci===i?{...c,show:s}:c))} onReorder={setColOrder} onClose={()=>setShowCols(false)}/>}
      {showHistory && <ModalHistory changelog={changelog} onClose={()=>setShowHistory(false)}/>}
      {showReplace && <ModalReplace cols={COL_DEFS} onReplace={handleBulkReplace} onClose={()=>setShowReplace(false)}/>}

      {/* ── DECODIFICADOR — al final de la página principal ── */}
      <DecodificadorTab selectedCode={selectedCode} />
    </>
    </ListasCtx.Provider>
  );
}

// ============================================================
//  GATE — Muestra login si no hay sesión
// ============================================================
function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(135deg,#0d2a4a,#1A3F6F)',fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <div style={{textAlign:'center',color:'#fff'}}>
        <div style={{width:36,height:36,border:'3px solid rgba(255,255,255,.2)',borderTopColor:'#D4A800',
          borderRadius:'50%',animation:'spin .75s linear infinite',margin:'0 auto 14px'}}/>
        <div style={{fontSize:'.85rem',opacity:.7}}>Cargando…</div>
      </div>
    </div>
  );

  if (!user) return <LoginScreen />;

  return (
    <ToastProvider>
      <CatalogoApp />
    </ToastProvider>
  );
}

// ============================================================
//  EXPORT DEFAULT
// ============================================================
export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
