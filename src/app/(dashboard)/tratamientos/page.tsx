// app/dashboard/tratamientos/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function TratamientosPage() {
  const supabase = await createClient();
  const [{ data: tratamientos, error }, { data: visitas }] = await Promise.all([
    supabase.from("tratamientos").select("*"),
    supabase.from("visitas").select("visitaid, fecha"),
  ]);

  if (error) return <p>Error cargando tratamientos</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("tratamientos").insert({
      visitaid: Number(formData.get("visitaid")),
      fechainicio: formData.get("fechainicio"),
      fechafin: formData.get("fechafin") || null,
    });
    revalidatePath("/dashboard/tratamientos");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("tratamientos").delete().eq("tratamientoid", id);
    revalidatePath("/dashboard/tratamientos");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tratamientos</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <select name="visitaid" className="border p-2 mr-2" required>
          <option value="">Visita</option>
          {visitas?.map((v: any) => (
            <option key={v.visitaid} value={v.visitaid}>Visita #{v.visitaid} — {v.fecha}</option>
          ))}
        </select>
        <input name="fechainicio" type="date" className="border p-2 mr-2" required />
        <input name="fechafin" type="date" className="border p-2 mr-2" placeholder="Fecha fin (opcional)" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Visita</th>
            <th className="p-2 border">Fecha Inicio</th>
            <th className="p-2 border">Fecha Fin</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tratamientos && tratamientos.length > 0 ? (
            tratamientos.map((t: any) => (
              <tr key={t.tratamientoid}>
                <td className="p-2 border">{t.tratamientoid}</td>
                <td className="p-2 border">Visita #{t.visitaid}</td>
                <td className="p-2 border">{t.fechainicio}</td>
                <td className="p-2 border">{t.fechafin ?? "—"}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(t.tratamientoid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5} className="text-center p-4">No hay tratamientos registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
