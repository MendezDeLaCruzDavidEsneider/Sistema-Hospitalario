// app/dashboard/examenes/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function ExamenesPage() {
  const supabase = await createClient();
  const [{ data: examenes, error }, { data: visitas }] = await Promise.all([
    supabase.from("orden_examenes").select("*, detallesexamenes(*)"),
    supabase.from("visitas").select("visitaid, fecha"),
  ]);

  if (error) return <p>Error cargando exámenes</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: orden } = await supabase.from("orden_examenes").insert({
      visitaid: Number(formData.get("visitaid")),
      fecha: formData.get("fecha"),
    }).select().single();

    if (orden) {
      await supabase.from("detallesexamenes").insert({
        ordenexamenid: orden.ordenexamenid,
        tipoexamen: formData.get("tipoexamen"),
        nombreexamen: formData.get("nombreexamen"),
        indicaciones: formData.get("indicaciones") || null,
      });
    }
    revalidatePath("/dashboard/examenes");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("detallesexamenes").delete().eq("ordenexamenid", id);
    await supabase.from("orden_examenes").delete().eq("ordenexamenid", id);
    revalidatePath("/dashboard/examenes");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Exámenes</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <select name="visitaid" className="border p-2 mr-2" required>
          <option value="">Visita</option>
          {visitas?.map((v: any) => (
            <option key={v.visitaid} value={v.visitaid}>Visita #{v.visitaid} — {v.fecha}</option>
          ))}
        </select>
        <input name="fecha" type="date" className="border p-2 mr-2" required />
        <input name="tipoexamen" placeholder="Tipo de examen" className="border p-2 mr-2" required />
        <input name="nombreexamen" placeholder="Nombre del examen" className="border p-2 mr-2" required />
        <input name="indicaciones" placeholder="Indicaciones (opcional)" className="border p-2 mr-2" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Orden ID</th>
            <th className="p-2 border">Visita</th>
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Nombre Examen</th>
            <th className="p-2 border">Indicaciones</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {examenes && examenes.length > 0 ? (
            examenes.map((o: any) =>
              o.detallesexamenes?.length > 0 ? (
                o.detallesexamenes.map((d: any) => (
                  <tr key={d.detalleexamenid}>
                    <td className="p-2 border">{o.ordenexamenid}</td>
                    <td className="p-2 border">Visita #{o.visitaid}</td>
                    <td className="p-2 border">{o.fecha}</td>
                    <td className="p-2 border">{d.tipoexamen}</td>
                    <td className="p-2 border">{d.nombreexamen}</td>
                    <td className="p-2 border">{d.indicaciones ?? "—"}</td>
                    <td className="p-2 border">
                      <form action={async () => { "use server"; await eliminar(o.ordenexamenid); }}>
                        <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key={o.ordenexamenid}>
                  <td className="p-2 border">{o.ordenexamenid}</td>
                  <td className="p-2 border">Visita #{o.visitaid}</td>
                  <td className="p-2 border">{o.fecha}</td>
                  <td className="p-2 border" colSpan={3}>Sin detalles</td>
                  <td className="p-2 border">
                    <form action={async () => { "use server"; await eliminar(o.ordenexamenid); }}>
                      <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                    </form>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr><td colSpan={7} className="text-center p-4">No hay exámenes registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
