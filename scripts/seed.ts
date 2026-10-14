/**
 * Carga los datos de ejemplo (experiencias, fechas, programas, personas, pedidos y leads)
 * en la base de Supabase configurada en .env. Es idempotente: vuelve a escribir los mismos ids.
 *   npm run seed
 */
import { seedSupabase } from "@/lib/repo/supabase";

seedSupabase()
  .then(() => console.log("✓ Datos de ejemplo cargados en Supabase"))
  .catch((e) => {
    console.error("✗ No se pudieron cargar los datos:", e.message);
    process.exit(1);
  });
