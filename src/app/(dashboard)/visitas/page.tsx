// app/dashboard/visitas/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function VisitasPage() {
  const supabase = await createClient();
  const [{ data: visitas, error }, { data: pacientes }, { data: medicos }] = await Promise.all([
    supabase.from("visitas").select("*"),
    supabase.from("pacientes").select("pacienteid, nombre, apellido"),
    supabase.from("medicos").select("medicoid, nombre, apellido"),
  ]);

  if (error) return <p>Error cargando visitas</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("visitas").insert({
      pacienteid: Number(formData.get("pacienteid")),
      medicoid: Number(formData.get("medicoid")),
      fecha: formData.get("fecha"),
      hora: formData.get("hora"),
    });
    revalidatePath("/dashboard/visitas");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("visitas").delete().eq("visitaid", id);
    revalidatePath("/dashboard/visitas");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Visitas</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <select name="pacienteid" className="border p-2 mr-2" required>
          <option value="">Paciente</option>
          {pacientes?.map((p: any) => (
            <option key={p.pacienteid} value={p.pacienteid}>{p.nombre} {p.apellido}</option>
          ))}
        </select>
        <select name="medicoid" className="border p-2 mr-2" required>
          <option value="">Médico</option>
          {medicos?.map((m: any) => (
            <option key={m.medicoid} value={m.medicoid}>{m.nombre} {m.apellido}</option>
          ))}
        </select>
        <input name="fecha" type="date" className="border p-2 mr-2" required />
        <input name="hora" type="time" className="border p-2 mr-2" required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Paciente</th>
            <th className="p-2 border">Médico</th>
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Hora</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visitas && visitas.length > 0 ? (
            visitas.map((v: any) => (
              <tr key={v.visitaid}>
                <td className="p-2 border">{pacientes?.find((p: any) => p.pacienteid === v.pacienteid)?.nombre ?? ""} {pacientes?.find((p: any) => p.pacienteid === v.pacienteid)?.apellido ?? ""}</td>
                <td className="p-2 border">{medicos?.find((m: any) => m.medicoid === v.medicoid)?.nombre ?? ""} {medicos?.find((m: any) => m.medicoid === v.medicoid)?.apellido ?? ""}</td>
                <td className="p-2 border">{v.fecha}</td>
                <td className="p-2 border">{v.hora}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(v.visitaid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5} className="text-center p-4">No hay visitas registradas</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
