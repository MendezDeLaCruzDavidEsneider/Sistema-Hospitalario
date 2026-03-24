// app/dashboard/formulas/page.tsx

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function FormulasPage() {
  const supabase = await createClient();
  const [{ data: formulas, error }, { data: tratamientos }] = await Promise.all([
    supabase.from("formulas").select("*"),
    supabase.from("tratamientos").select("tratamientoid, fechainicio"),
  ]);

  if (error) return <p>Error cargando fórmulas</p>;

  async function agregar(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase.from("formulas").insert({
      tratamientoid: Number(formData.get("tratamientoid")),
      fecha: formData.get("fecha"),
    });
    revalidatePath("/dashboard/formulas");
  }

  async function eliminar(id: number) {
    "use server";
    const supabase = await createClient();
    await supabase.from("formulas").delete().eq("formulaid", id);
    revalidatePath("/dashboard/formulas");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fórmulas</h1>

      <form action={agregar} className="mb-6 space-y-2">
        <select name="tratamientoid" className="border p-2 mr-2" required>
          <option value="">Tratamiento</option>
          {tratamientos?.map((t: any) => (
            <option key={t.tratamientoid} value={t.tratamientoid}>Tratamiento #{t.tratamientoid} — {t.fechainicio}</option>
          ))}
        </select>
        <input name="fecha" type="date" className="border p-2 mr-2" required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Tratamiento</th>
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {formulas && formulas.length > 0 ? (
            formulas.map((f: any) => (
              <tr key={f.formulaid}>
                <td className="p-2 border">{f.formulaid}</td>
                <td className="p-2 border">Tratamiento #{f.tratamientoid}</td>
                <td className="p-2 border">{f.fecha}</td>
                <td className="p-2 border">
                  <form action={async () => { "use server"; await eliminar(f.formulaid); }}>
                    <button className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} className="text-center p-4">No hay fórmulas registradas</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
