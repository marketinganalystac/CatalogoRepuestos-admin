import { supabase } from "./supabaseClient";

const PAGE_SIZE = 50;

export const getRecords = async (filters = {}, page = 1) => {
  let query = supabase
    .from("repuestos")
    .select("*", { count: "exact" });

  if (filters.MARCA) query = query.eq("MARCA", filters.MARCA);
  if (filters.MODELO) query = query.eq("MODELO", filters.MODELO);
  if (filters.PERIODO) query = query.eq("PERIODO", filters.PERIODO);
  if (filters.CLASIFICACION)
    query = query.eq("CLASIFICACION", filters.CLASIFICACION);
  if (filters.SUBCLASIFICACION)
    query = query.eq("SUBCLASIFICACION", filters.SUBCLASIFICACION);

  if (filters.TEXTO) {
    query = query.or(`
      DESCRIPCION_ORIGINAL.ilike.%${filters.TEXTO}%,
      DESCRIPCION_ESTANDAR.ilike.%${filters.TEXTO}%,
      CODIGO.ilike.%${filters.TEXTO}%
    `);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) throw error;

  return { data, count };
};
