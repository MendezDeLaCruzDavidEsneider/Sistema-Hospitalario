// app/dashboard/medicamentos/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function MedicamentosPage() {
  const supabase = await createClient();
  const { data: medicamentos, error } = await supabase.from("medicamentos").select("*");

  if (error) return <p>Error cargando medicamentos</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("medicamentos").insert({
      nombre: formData.get("nombre"),
      prescripcion: formData.get("prescripcion"),
      cantidad: Number(formData.get("cantidad")),
      unidades: formData.get("unidades"),
      descripcion: formData.get("descripcion"),
    });
    revalidatePath("/dashboard/medicamentos");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("medicamentos").delete().eq("medicamentoid", id);
    revalidatePath("/dashboard/medicamentos");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Medicamentos</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <input name="nombre" placeholder="Nombre" className="border p-2 mr-2" required />
        <input name="prescripcion" placeholder="Prescripción" className="border p-2 mr-2" />
        <input name="cantidad" type="number" placeholder="Cantidad" className="border p-2 mr-2" />
        <input name="unidades" placeholder="Unidades" className="border p-2 mr-2" />
        <input name="descripcion" placeholder="Descripción" className="border p-2 mr-2" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Prescripción</th>
            <th className="p-2 border">Cantidad</th>
            <th className="p-2 border">Unidades</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos && medicamentos.length > 0 ? (
            medicamentos.map((m: any) => (
              <tr key={m.medicamentoid}>
                <td className="p-2 border">{m.nombre}</td>
                <td className="p-2 border">{m.prescripcion}</td>
                <td className="p-2 border">{m.cantidad}</td>
                <td className="p-2 border">{m.unidades}</td>
                <td className="p-2 border">{m.descripcion}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(m.medicamentoid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={6} className="text-center p-4">No hay medicamentos registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
