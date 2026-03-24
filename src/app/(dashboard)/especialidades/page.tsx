// app/dashboard/especialidades/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function EspecialidadesPage() {
  const supabase = await createClient();
  const { data: especialidades, error } = await supabase.from("especialidades").select("*");

  if (error) return <p>Error cargando especialidades</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("especialidades").insert({ nombre: formData.get("nombre") });
    revalidatePath("/dashboard/especialidades");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("especialidades").delete().eq("especialidadid", id);
    revalidatePath("/dashboard/especialidades");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Especialidades</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <input name="nombre" placeholder="Nombre" className="border p-2 mr-2" required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {especialidades && especialidades.length > 0 ? (
            especialidades.map((e: any) => (
              <tr key={e.especialidadid}>
                <td className="p-2 border">{e.especialidadid}</td>
                <td className="p-2 border">{e.nombre}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(e.especialidadid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={3} className="text-center p-4">No hay especialidades registradas</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
