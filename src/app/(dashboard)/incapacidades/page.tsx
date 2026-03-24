// app/dashboard/incapacidades/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function IncapacidadesPage() {
  const supabase = await createClient();
  const [{ data: incapacidades, error }, { data: tratamientos }] = await Promise.all([
    supabase.from("incapacidades").select("*, detallesincapacidades(*)"),
    supabase.from("tratamientos").select("tratamientoid, fechainicio"),
  ]);

  if (error) return <p>Error cargando incapacidades</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: inc } = await supabase.from("incapacidades").insert({
      fecha: formData.get("fecha"),
      tratamientoid: Number(formData.get("tratamientoid")),
    }).select().single();

    if (inc) {
      await supabase.from("detallesincapacidades").insert({
        incapacidadid: inc.incapacidadid,
        descripcion: formData.get("descripcion"),
        numerodias: Number(formData.get("numerodias")),
        fechainicio: formData.get("fechainicio"),
        fechafin: formData.get("fechafin"),
      });
    }
    revalidatePath("/dashboard/incapacidades");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("detallesincapacidades").delete().eq("incapacidadid", id);
    await supabase.from("incapacidades").delete().eq("incapacidadid", id);
    revalidatePath("/dashboard/incapacidades");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Incapacidades</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <input name="fecha" type="date" className="border p-2 mr-2" required />
        <select name="tratamientoid" className="border p-2 mr-2" required>
          <option value="">Tratamiento</option>
          {tratamientos?.map((t: any) => (
            <option key={t.tratamientoid} value={t.tratamientoid}>Tratamiento #{t.tratamientoid} — {t.fechainicio}</option>
          ))}
        </select>
        <input name="descripcion" placeholder="Descripción" className="border p-2 mr-2" required />
        <input name="numerodias" type="number" placeholder="Número de días" className="border p-2 mr-2" required />
        <input name="fechainicio" type="date" className="border p-2 mr-2" required />
        <input name="fechafin" type="date" className="border p-2 mr-2" required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Tratamiento</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Días</th>
            <th className="p-2 border">Inicio</th>
            <th className="p-2 border">Fin</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {incapacidades && incapacidades.length > 0 ? (
            incapacidades.map((i: any) => {
              const detalle = i.detallesincapacidades?.[0];
              return (
                <tr key={i.incapacidadid}>
                  <td className="p-2 border">{i.incapacidadid}</td>
                  <td className="p-2 border">{i.fecha}</td>
                  <td className="p-2 border">Tratamiento #{i.tratamientoid}</td>
                  <td className="p-2 border">{detalle?.descripcion ?? "—"}</td>
                  <td className="p-2 border">{detalle?.numerodias ?? "—"}</td>
                  <td className="p-2 border">{detalle?.fechainicio ?? "—"}</td>
                  <td className="p-2 border">{detalle?.fechafin ?? "—"}</td>
                  <td className="p-2 border">
                    <form action={async () => { "use server"; await eliminar(i.incapacidadid); }}>
                      <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                    </form>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan={8} className="text-center p-4">No hay incapacidades registradas</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
