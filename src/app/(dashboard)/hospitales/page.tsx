// app/dashboard/hospitales/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function HospitalesPage() {
  const supabase = await createClient();
  const { data: hospitales, error } = await supabase.from("hospitales").select("*");

  if (error) return <p>Error cargando hospitales</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("hospitales").insert({
      nombre: formData.get("nombre"),
      direccion: formData.get("direccion"),
      nit: formData.get("nit"),
      telefono: formData.get("telefono"),
    });
    revalidatePath("/dashboard/hospitales");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("hospitales").delete().eq("hospitalid", id);
    revalidatePath("/dashboard/hospitales");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Hospitales</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <input name="nombre" placeholder="Nombre" className="border p-2 mr-2" required />
        <input name="direccion" placeholder="Dirección" className="border p-2 mr-2" />
        <input name="nit" placeholder="NIT" className="border p-2 mr-2" />
        <input name="telefono" placeholder="Teléfono" className="border p-2 mr-2" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Dirección</th>
            <th className="p-2 border">NIT</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {hospitales && hospitales.length > 0 ? (
            hospitales.map((h: any) => (
              <tr key={h.hospitalid}>
                <td className="p-2 border">{h.nombre}</td>
                <td className="p-2 border">{h.direccion}</td>
                <td className="p-2 border">{h.nit}</td>
                <td className="p-2 border">{h.telefono}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(h.hospitalid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5} className="text-center p-4">No hay hospitales registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
