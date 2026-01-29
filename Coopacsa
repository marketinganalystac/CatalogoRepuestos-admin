import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Share2, 
  FileText, 
  Ruler, 
  Car, 
  RefreshCw, 
  Search, 
  ArrowLeft, 
  Info, 
  AlertTriangle,
  Package,
  Menu,
  Grid,
  List,
  Database
} from 'lucide-react';

// --- BASE DE DATOS MOCK (DATOS NEUTROS) ---
// (sin cambios, copiada tal cual)
const CATALOG_DB = [
  {
    id: 1,
    sku: "VO-88-SYN",
    name: "Filtro de Aceite Blindado (Spin-On)",
    brand: "Valvoline / OEM Spec",
    category: "Filtración",
    oem_ref: "90915-YZZF1",
    line: "Professional Series - Synthetic Media",
    description: "Elemento filtrante de alto flujo diseñado para lubricantes sintéticos. Cuenta con válvula anti-retorno de silicona y carcasa reforzada para presiones de operación de hasta 120 PSI.",
    image_preview: "https://placehold.co/400x400/e2e8f0/1e293b?text=VO-88-SYN",
    quickSpecs: {
      thread: "M20 x 1.5",
      height: "85 mm",
      outerDiameter: "76 mm",
      valve: "Sí (12 PSI)"
    },
    specs: [
      { label: "Tipo de Filtro", value: "Blindado (Spin-on)" },
      { label: "Medio Filtrante", value: "Malla Sintética / Celulosa Reforzada" },
      { label: "Eficiencia", value: "99% @ 20 Micrones" },
      { label: "Válvula Anti-Drenaje", value: "Sí - Silicona Roja" },
      { label: "Válvula Bypass", value: "12-15 PSI" },
      { label: "Intervalo", value: "10,000 km" }
    ],
    applications: [
      { make: "TOYOTA", model: "Corolla 1.8L", years: "2009-2019" },
      { make: "TOYOTA", model: "Yaris 1.5L", years: "2006-2018" },
      { make: "TOYOTA", model: "RAV4 2.4L", years: "2005-2012" },
      { make: "SUZUKI", model: "Grand Vitara 2.4L", years: "2008-2015" }
    ],
    crossReference: [
      { brand: "TOYOTA OEM", part: "90915-YZZF1" },
      { brand: "WIX", part: "51348" },
      { brand: "FRAM", part: "PH4967" },
      { brand: "K&N", part: "HP-1003" }
    ],
    images: [
      { url: "https://placehold.co/600x600/e2e8f0/1e293b?text=VO-88+Main", alt: "Principal" },
      { url: "https://placehold.co/600x600/f1f5f9/334155?text=Diagrama+Tecnico", alt: "Diagrama" },
      { url: "https://placehold.co/600x600/f8fafc/475569?text=Base+M20", alt: "Base" }
    ]
  },
  {
    id: 2,
    sku: "AF-2024-PRO",
    name: "Filtro de Aire Panel",
    brand: "Global Filters",
    category: "Filtración",
    oem_ref: "17801-21050",
    line: "Heavy Duty Protection",
    description: "Filtro de aire de panel de alta capacidad. Papel plisado con resina fenólica para resistir humedad. Borde de uretano flexible para sellado perfecto.",
    image_preview: "https://placehold.co/400x400/fef3c7/78350f?text=AF-2024",
    quickSpecs: {
      length: "240 mm",
      width: "176 mm",
      height: "52 mm",
      material: "Celulosa"
    },
    specs: [
      { label: "Tipo", value: "Panel Flexible" },
      { label: "Material", value: "Celulosa con Resina" },
      { label: "Flujo de Aire", value: "350 CFM" },
      { label: "Sello", value: "Poliuretano Expandido" }
    ],
    applications: [
      { make: "TOYOTA", model: "Yaris 1.5L", years: "2010-2018" },
      { make: "TOYOTA", model: "Prius C", years: "2012-2019" }
    ],
    crossReference: [
      { brand: "TOYOTA OEM", part: "17801-21050" },
      { brand: "WIX", part: "49100" },
      { brand: "K&N", part: "33-2360" }
    ],
    images: [
      { url: "https://placehold.co/600x600/fef3c7/78350f?text=AF-2024+Main", alt: "Principal" },
      { url: "https://placehold.co/600x600/fffbeb/92400e?text=Media+Filtrante", alt: "Detalle" }
    ]
  },
  {
    id: 3,
    sku: "BP-0880-CER",
    name: "Pastillas de Freno Delanteras",
    brand: "StopTech Ceramic",
    category: "Frenos",
    oem_ref: "04465-02220",
    line: "Ceramic Low Dust",
    description: "Formulación cerámica avanzada para frenado silencioso y bajo polvo. Incluye shims antirruido y kit de herrajes de instalación.",
    image_preview: "https://placehold.co/400x400/fee2e2/991b1b?text=BP-0880",
    quickSpecs: {
      position: "Eje Delantero",
      material: "Cerámica",
      width: "131.5 mm",
      sensor: "Acústico"
    },
    specs: [
      { label: "Posición", value: "Delanteras" },
      { label: "Composición", value: "Cerámica GG" },
      { label: "Coeficiente Fricción", value: "0.38 - 0.42" },
      { label: "Incluye Hardware", value: "Sí" }
    ],
    applications: [
      { make: "TOYOTA", model: "Corolla", years: "2009-2018" },
      { make: "TOYOTA", model: "Matrix", years: "2009-2014" }
    ],
    crossReference: [
      { brand: "OEM", part: "04465-02220" },
      { brand: "TRW", part: "GDB3425" },
      { brand: "BENDIX", part: "DB1785" }
    ],
    images: [
      { url: "https://placehold.co/600x600/fee2e2/991b1b?text=BP-0880+Set", alt: "Set Completo" }
    ]
  }
];

// --- NUEVA PESTAÑA: VISTA TABULAR DE LA BASE DE DATOS ---
const DatabaseView = ({ onBack }) => {
  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Catálogo
        </button>
        <h2 className="text-2xl font-black text-slate-800">Base de Datos del Sistema</h2>
      </div>

      <div className="bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">OEM Ref</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Línea</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Descripción (resumida)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {CATALOG_DB.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-800">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{product.oem_ref}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.line}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{product.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DETALLE DE PRODUCTO (sin cambios) ---
const ProductDetail = ({ product, onBack }) => {
  const [activeTab, setActiveTab] = useState('specs');
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return null;

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {/* Barra de Navegación Contextual */}
      <div className="mb-4 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Catálogo
        </button>
        <div className="hidden md:block text-xs font-mono text-slate-400">
          ID_DB: {product.sku}
        </div>
      </div>

      <div className="bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden">
        
        {/* Encabezado Técnico Puro */}
        <div className="bg-slate-800 text-white p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Package className="w-32 h-32" />
          </div>
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-slate-600 text-slate-200 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-slate-500">
                  {product.brand}
                </span>
                <span className="bg-slate-700 text-slate-300 text-xs font-medium px-2 py-1 rounded uppercase tracking-wide border border-slate-600">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-white">
                {product.sku}
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl font-light">
                {product.name} - <span className="text-slate-400">{product.line}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir Ficha</span>
              </button>
              <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          
          {/* Columna Izquierda: Visualización */}
          <div className="w-full lg:w-1/3 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-6">
            <div className="mb-6 bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
              <div className="aspect-square bg-slate-100 rounded-md overflow-hidden relative mb-2 flex items-center justify-center">
                <img 
                  src={product.images[activeImage].url} 
                  alt={product.images[activeImage].alt}
                  className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 shrink-0 border-2 rounded-md overflow-hidden transition-all ${activeImage === idx ? 'border-blue-600 ring-2 ring-blue-100 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-slate-600" /> Medidas Críticas
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                {Object.entries(product.quickSpecs).map(([key, value]) => (
                  <div key={key}>
                    <span className="block text-slate-400 text-xs uppercase mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-mono font-bold text-slate-800 text-base border-l-2 border-slate-300 pl-2 block">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-slate-400" />
              <p className="leading-relaxed">Verifique visualmente la pieza antigua antes de instalar.</p>
            </div>
          </div>

          {/* Columna Derecha: Tabs */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
              {[
                { id: 'specs', label: 'Especificaciones', icon: FileText },
                { id: 'apps', label: 'Aplicaciones', icon: Car },
                { id: 'cross', label: 'Referencias Cruzadas', icon: RefreshCw },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-all
                    ${activeTab === tab.id 
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8 bg-white flex-grow">
              
              {activeTab === 'specs' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="font-bold text-slate-800 mb-6 text-lg">Detalles Técnicos</h3>
                  <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-200">
                        {product.specs.map((spec, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                            <td className="py-4 px-6 bg-slate-50/50 font-medium text-slate-600 w-1/3 group-hover:bg-blue-50/20">{spec.label}</td>
                            <td className="py-4 px-6 text-slate-800 font-medium">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8">
                    <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Descripción del Producto
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'apps' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Compatibilidad Vehicular</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Total: {product.applications.length}</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                        <tr>
                          <th className="py-3 px-4 border-b border-slate-200">Marca</th>
                          <th className="py-3 px-4 border-b border-slate-200">Modelo / Motor</th>
                          <th className="py-3 px-4 border-b border-slate-200">Años</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {product.applications.map((app, idx) => (
                          <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-default">
                            <td className="py-3 px-4 font-bold text-slate-700">{app.make}</td>
                            <td className="py-3 px-4 text-slate-600">{app.model}</td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-xs bg-slate-50/50">{app.years}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'cross' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="font-bold text-slate-800 mb-6 text-lg">Referencias Cruzadas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.crossReference.map((ref, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md hover:bg-blue-50/30 transition-all group cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{ref.brand}</span>
                          <span className="font-mono font-bold text-lg text-slate-800 group-hover:text-blue-700">{ref.part}</span>
                        </div>
                        <button className="text-slate-300 group-hover:text-blue-500 transition-colors bg-white p-2 rounded-full shadow-sm border border-slate-100">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE BÚSQUEDA (con BÚSQUEDA AVANZADA añadida) ---
const CatalogSearch = ({ onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, sku, vehicle, cross, advanced
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  // Estados para búsqueda avanzada
  const [makeFilter, setMakeFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [oemFilter, setOemFilter] = useState('');
  const [descFilter, setDescFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');

  // Lógica de filtrado mejorada
  const filteredProducts = useMemo(() => {
    let result = CATALOG_DB;

    const lowerTerm = searchTerm.toLowerCase();

    // Filtro general por texto (siempre se aplica si hay término)
    if (searchTerm) {
      result = result.filter(p => {
        return (
          p.sku.toLowerCase().includes(lowerTerm) ||
          p.name.toLowerCase().includes(lowerTerm) ||
          p.description.toLowerCase().includes(lowerTerm) ||
          p.oem_ref.toLowerCase().includes(lowerTerm) ||
          p.applications.some(a => 
            a.make.toLowerCase().includes(lowerTerm) || 
            a.model.toLowerCase().includes(lowerTerm) ||
            a.years.toLowerCase().includes(lowerTerm)
          ) ||
          p.crossReference.some(c => 
            c.part.toLowerCase().includes(lowerTerm) ||
            c.brand.toLowerCase().includes(lowerTerm)
          )
        );
      });
    }

    // Filtro específico según tipo
    if (filterType === 'sku') {
      result = result.filter(p => 
        p.sku.toLowerCase().includes(lowerTerm) || p.oem_ref.toLowerCase().includes(lowerTerm)
      );
    } else if (filterType === 'vehicle') {
      result = result.filter(p => 
        p.applications.some(a => 
          a.make.toLowerCase().includes(lowerTerm) || 
          a.model.toLowerCase().includes(lowerTerm) ||
          a.years.includes(lowerTerm)
        )
      );
    } else if (filterType === 'cross') {
      result = result.filter(p => 
        p.crossReference.some(c => 
          c.part.toLowerCase().includes(lowerTerm) || 
          c.brand.toLowerCase().includes(lowerTerm)
        ) || p.oem_ref.toLowerCase().includes(lowerTerm)
      );
    } else if (filterType === 'advanced') {
      // Filtros avanzados (AND)
      const hasAdvanced = makeFilter || modelFilter || yearFilter || oemFilter || descFilter || skuFilter;
      if (hasAdvanced) {
        result = result.filter(p => {
          let match = true;

          if (makeFilter) {
            match = match && p.applications.some(a => a.make.toLowerCase().includes(makeFilter.toLowerCase()));
          }
          if (modelFilter) {
            match = match && p.applications.some(a => a.model.toLowerCase().includes(modelFilter.toLowerCase()));
          }
          if (yearFilter) {
            match = match && p.applications.some(a => a.years.includes(yearFilter));
          }
          if (oemFilter) {
            match = match && p.oem_ref.toLowerCase().includes(oemFilter.toLowerCase());
          }
          if (descFilter) {
            const ld = descFilter.toLowerCase();
            match = match && (p.description.toLowerCase().includes(ld) || p.name.toLowerCase().includes(ld));
          }
          if (skuFilter) {
            const ls = skuFilter.toLowerCase();
            match = match && (p.sku.toLowerCase().includes(ls) || p.oem_ref.toLowerCase().includes(ls));
          }

          return match;
        });
      }
      // Si no hay filtros avanzados llenos, solo se aplica el searchTerm general
    }

    return result;
  }, [searchTerm, filterType, makeFilter, modelFilter, yearFilter, oemFilter, descFilter, skuFilter]);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header de Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600" />
          Buscador de Catálogo
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra Principal */}
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm shadow-inner"
              placeholder="Buscar por código, vehículo, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'Todo' },
              { id: 'sku', label: 'Código / SKU' },
              { id: 'vehicle', label: 'Vehículo' },
              { id: 'cross', label: 'Cruce / OEM' },
              { id: 'advanced', label: 'Avanzada' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2
                  ${filterType === f.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Búsqueda Avanzada */}
        {filterType === 'advanced' && (
          <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Filtros Avanzados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: TOYOTA"
                  value={makeFilter}
                  onChange={e => setMakeFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Corolla"
                  value={modelFilter}
                  onChange={e => setModelFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 2015 o 2009-2019"
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código Original (OEM)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 90915-YZZF1"
                  value={oemFilter}
                  onChange={e => setOemFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Palabras clave en descripción"
                  value={descFilter}
                  onChange={e => setDescFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código / SKU</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: VO-88-SYN"
                  value={skuFilter}
                  onChange={e => setSkuFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mb-4 flex justify-between items-center px-2">
        <span className="text-sm text-slate-500 font-medium">
          Mostrando {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
        </span>
        <div className="flex bg-white rounded-lg border border-slate-300 p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No se encontraron productos</h3>
          <p className="text-slate-500 mt-1">Intenta ajustar los filtros o buscar por otro término.</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className={`bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group flex ${viewMode === 'list' ? 'flex-row items-center p-4' : 'flex-col'}`}
            >
              {/* Imagen */}
              <div className={`${viewMode === 'list' ? 'w-24 h-24 shrink-0 mr-6' : 'w-full aspect-video'} bg-slate-100 relative overflow-hidden`}>
                <img 
                  src={product.image_preview} 
                  alt={product.sku}
                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Contenido */}
              <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'flex-grow justify-center' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{product.brand}</span>
                  <span className="text-xs font-mono text-slate-400">{product.category}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">{product.sku}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-grow">{product.name}</p>
                
                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">OEM: <span className="font-mono text-slate-600">{product.oem_ref}</span></span>
                  <div className="flex gap-1">
                     {product.applications.slice(0, 2).map((app, i) => (
                       <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 text-[10px]">{app.make}</span>
                     ))}
                     {product.applications.length > 2 && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 text-[10px]">+</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL (con pestaña de Base de Datos y navegación mejorada) ---
const AutoCatalogApp = () => {
  const [currentView, setCurrentView] = useState('search'); // 'search' | 'detail' | 'database'
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
    window.scrollTo(0,0);
  };

  const handleBack = () => {
    setCurrentView('search');
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Barra Superior Global */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
            <div className="bg-blue-600 p-1.5 rounded">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight tracking-tight">Catálogo<span className="text-blue-400">Técnico</span></h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Base de Datos Centralizada</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button 
              onClick={() => setCurrentView('search')}
              className={`transition-colors pb-1 border-b-2 ${currentView === 'search' ? 'text-white border-blue-400' : 'text-slate-300 border-transparent hover:text-white hover:border-slate-400'}`}
            >
              Búsqueda
            </button>
            <button 
              onClick={() => setCurrentView('database')}
              className={`transition-colors pb-1 border-b-2 ${currentView === 'database' ? 'text-white border-blue-400' : 'text-slate-300 border-transparent hover:text-white hover:border-slate-400'}`}
            >
              Base de Datos
            </button>
          </div>
          
          <button className="md:hidden text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {currentView === 'search' && (
          <CatalogSearch onSelectProduct={handleProductSelect} />
        )}
        {currentView === 'detail' && (
          <ProductDetail product={selectedProduct} onBack={handleBack} />
        )}
        {currentView === 'database' && (
          <DatabaseView onBack={handleBack} />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-400 text-xs border-t border-slate-200 mt-8">
        <p>Sistema de Consulta Técnica</p>
        <p className="mt-1">Los números de parte OEM se usan solo como referencia.</p>
      </footer>

    </div>
  );
};

export default AutoCatalogApp;
