// app/dashboard/pacientes/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function PacientesPage() {
  const supabase = await createClient();
  const { data: pacientes, error } = await supabase.from("pacientes").select("*");

  if (error) return <p>Error cargando pacientes</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("pacientes").insert({
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      fechanacimiento: formData.get("fechanacimiento"),
      sexo: formData.get("sexo"),
      direccion: formData.get("direccion"),
      telefono: formData.get("telefono"),
      correoelectronico: formData.get("correoelectronico"),
    });
    revalidatePath("/dashboard/pacientes");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("pacientes").delete().eq("pacienteid", id);
    revalidatePath("/dashboard/pacientes");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pacientes</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <input name="nombre" placeholder="Nombre" className="border p-2 mr-2" required />
        <input name="apellido" placeholder="Apellido" className="border p-2 mr-2" required />
        <input name="fechanacimiento" type="date" className="border p-2 mr-2" required />
        <select name="sexo" className="border p-2 mr-2" required>
          <option value="">Sexo</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
        <input name="direccion" placeholder="Dirección" className="border p-2 mr-2" />
        <input name="telefono" placeholder="Teléfono" className="border p-2 mr-2" />
        <input name="correoelectronico" type="email" placeholder="Correo electrónico" className="border p-2 mr-2" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Apellido</th>
            <th className="p-2 border">Nacimiento</th>
            <th className="p-2 border">Sexo</th>
            <th className="p-2 border">Dirección</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes && pacientes.length > 0 ? (
            pacientes.map((p: any) => (
              <tr key={p.pacienteid}>
                <td className="p-2 border">{p.nombre}</td>
                <td className="p-2 border">{p.apellido}</td>
                <td className="p-2 border">{p.fechanacimiento}</td>
                <td className="p-2 border">{p.sexo === "M" ? "Masculino" : "Femenino"}</td>
                <td className="p-2 border">{p.direccion}</td>
                <td className="p-2 border">{p.telefono}</td>
                <td className="p-2 border">{p.correoelectronico}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(p.pacienteid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={8} className="text-center p-4">No hay pacientes registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
