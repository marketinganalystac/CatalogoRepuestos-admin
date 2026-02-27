import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// 🔥 CONFIGURACIÓN SUPABASE
// ============================================================

const supabase = createClient(
  "https://TU_PROJECT_ID.supabase.co",
  "TU_ANON_PUBLIC_KEY"
);

// ============================================================
// 🔥 HELPERS SUPABASE
// ============================================================

const fsGetAll = async () => {
  const { data, error } = await supabase
    .from("repuestos")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
};

const fsAdd = async (record) => {
  const { data, error } = await supabase
    .from("repuestos")
    .insert([{
      MARCA: record.fields[0],
      MODELO: record.fields[1],
      MODELO_ORIGINAL: record.fields[2],
      PERIODO: record.fields[3],
      DESCRIPCION_ORIGINAL: record.fields[4],
      CODIGO: record.fields[5],
      DESCRIPCION_ESTANDAR: record.fields[6],
      CLASIFICACION: record.fields[7],
      SUBCLASIFICACION: record.fields[8],
    }])
    .select();

  if (error) throw error;
  return data[0].id;
};

const fsUpdate = async (id, record) => {
  const { error } = await supabase
    .from("repuestos")
    .update({
      MARCA: record.fields[0],
      MODELO: record.fields[1],
      MODELO_ORIGINAL: record.fields[2],
      PERIODO: record.fields[3],
      DESCRIPCION_ORIGINAL: record.fields[4],
      CODIGO: record.fields[5],
      DESCRIPCION_ESTANDAR: record.fields[6],
      CLASIFICACION: record.fields[7],
      SUBCLASIFICACION: record.fields[8],
    })
    .eq("id", id);

  if (error) throw error;
};

const fsDelete = async (id) => {
  const { error } = await supabase
    .from("repuestos")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

const fsBatchWrite = async (records) => {
  const formatted = records.map((r) => ({
    MARCA: r[0],
    MODELO: r[1],
    MODELO_ORIGINAL: r[2],
    PERIODO: r[3],
    DESCRIPCION_ORIGINAL: r[4],
    CODIGO: r[5],
    DESCRIPCION_ESTANDAR: r[6],
    CLASIFICACION: r[7],
    SUBCLASIFICACION: r[8],
  }));

  const { error } = await supabase
    .from("repuestos")
    .insert(formatted);

  if (error) throw error;
};

const fsDeleteAll = async () => {
  const { error } = await supabase
    .from("repuestos")
    .delete()
    .neq("id", 0);

  if (error) throw error;
};

// ============================================================
// 🔥 NORMALIZADOR
// ============================================================

const normalizeDoc = (raw) => ({
  _id: raw.id,
  fields: [
    raw.MARCA || "",
    raw.MODELO || "",
    raw.MODELO_ORIGINAL || "",
    raw.PERIODO || "",
    raw.DESCRIPCION_ORIGINAL || "",
    raw.CODIGO || "",
    raw.DESCRIPCION_ESTANDAR || "",
    raw.CLASIFICACION || "",
    raw.SUBCLASIFICACION || "",
  ],
});

// ============================================================
// 🚀 APP PRINCIPAL
// ============================================================

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const rows = await fsGetAll();
      setData(rows.map(normalizeDoc));
    } catch (err) {
      console.error(err);
      alert("Error cargando datos");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // CRUD
  // ============================================================

  const handleAdd = async (record) => {
    await fsAdd(record);
    await loadData();
  };

  const handleUpdate = async (id, record) => {
    await fsUpdate(id, record);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await fsDelete(id);
    await loadData();
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("¿Eliminar TODOS los registros?")) return;
    await fsDeleteAll();
    await loadData();
  };

  // ============================================================
  // UI SIMPLE (tu tabla original se mantiene igual)
  // ============================================================

  return (
    <div style={{ padding: 20 }}>
      <h2>Base de Repuestos</h2>

      {loading && <p>Cargando...</p>}

      <button onClick={handleDeleteAll}>Eliminar Todo</button>

      <table border="1" cellPadding="5" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>MARCA</th>
            <th>MODELO</th>
            <th>MODELO ORIGINAL</th>
            <th>PERIODO</th>
            <th>DESCRIPCIÓN ORIGINAL</th>
            <th>CÓDIGO</th>
            <th>DESCRIPCIÓN ESTÁNDAR</th>
            <th>CLASIFICACIÓN</th>
            <th>SUBCLASIFICACIÓN</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              {row.fields.map((f, i) => (
                <td key={i}>{f}</td>
              ))}
              <td>
                <button onClick={() => handleDelete(row._id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
