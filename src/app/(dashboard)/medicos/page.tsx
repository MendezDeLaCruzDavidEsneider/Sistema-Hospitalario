// app/dashboard/medicos/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function MedicosPage() {
  const supabase = await createClient();
  const [{ data: medicos, error }, { data: especialidades }, { data: hospitales }] = await Promise.all([
    supabase.from("medicos").select("*"),
    supabase.from("especialidades").select("especialidadid, nombre"),
    supabase.from("hospitales").select("hospitalid, nombre"),
  ]);

  if (error) return <p>Error cargando médicos</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("medicos").insert({
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      especialidadid: Number(formData.get("especialidadid")),
      hospitalid: Number(formData.get("hospitalid")),
      telefono: formData.get("telefono"),
      correoelectronico: formData.get("correoelectronico"),
    });
    revalidatePath("/dashboard/medicos");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("medicos").delete().eq("medicoid", id);
    revalidatePath("/dashboard/medicos");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Médicos</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <input name="nombre" placeholder="Nombre" className="border p-2 mr-2" required />
        <input name="apellido" placeholder="Apellido" className="border p-2 mr-2" required />
        <select name="especialidadid" className="border p-2 mr-2" required>
          <option value="">Especialidad</option>
          {especialidades?.map((e: any) => (
            <option key={e.especialidadid} value={e.especialidadid}>{e.nombre}</option>
          ))}
        </select>
        <select name="hospitalid" className="border p-2 mr-2" required>
          <option value="">Hospital</option>
          {hospitales?.map((h: any) => (
            <option key={h.hospitalid} value={h.hospitalid}>{h.nombre}</option>
          ))}
        </select>
        <input name="telefono" placeholder="Teléfono" className="border p-2 mr-2" />
        <input name="correoelectronico" type="email" placeholder="Correo electrónico" className="border p-2 mr-2" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Apellido</th>
            <th className="p-2 border">Especialidad</th>
            <th className="p-2 border">Hospital</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicos && medicos.length > 0 ? (
            medicos.map((m: any) => (
              <tr key={m.medicoid}>
                <td className="p-2 border">{m.nombre}</td>
                <td className="p-2 border">{m.apellido}</td>
                <td className="p-2 border">{especialidades?.find((e: any) => e.especialidadid === m.especialidadid)?.nombre ?? m.especialidadid}</td>
                <td className="p-2 border">{hospitales?.find((h: any) => h.hospitalid === m.hospitalid)?.nombre ?? m.hospitalid}</td>
                <td className="p-2 border">{m.telefono}</td>
                <td className="p-2 border">{m.correoelectronico}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(m.medicoid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={7} className="text-center p-4">No hay médicos registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
