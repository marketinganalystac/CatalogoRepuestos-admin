import { supabase } from "./supabaseClient";

const PAGE_SIZE = 50;

export const getRecords = async (filters = {}, page = 1) => {
  let query = supabase
    .from("repuestos")
    .select("*", { count: "exact" });

  if (filters.marca) query = query.eq("marca", filters.marca);
  if (filters.modelo) query = query.eq("modelo", filters.modelo);
  if (filters.periodo) query = query.eq("periodo", filters.periodo);
  if (filters.clasificacion)
    query = query.eq("clasificacion", filters.clasificacion);
  if (filters.subclasificacion)
    query = query.eq("subclasificacion", filters.subclasificacion);

  if (filters.texto) {
    query = query.or(`
      descripcion_original.ilike.%${filters.texto}%,
      descripcion_estandar.ilike.%${filters.texto}%,
      codigo.ilike.%${filters.texto}%
    `);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) throw error;

  return { data, count };
};

export const addRecord = async (record) => {
  const { error } = await supabase.from("repuestos").insert([record]);
  if (error) throw error;
};

export const updateRecord = async (id, record) => {
  const { error } = await supabase
    .from("repuestos")
    .update(record)
    .eq("id", id);
  if (error) throw error;
};

export const deleteRecord = async (id) => {
  const { error } = await supabase
    .from("repuestos")
    .delete()
    .eq("id", id);
  if (error) throw error;
};
