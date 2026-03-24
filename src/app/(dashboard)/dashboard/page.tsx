import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: hospitales } = await supabase
    .from("hospitales")
    .select("*", { count: "exact", head: true });

  const { count: medicos } = await supabase
    .from("medicos")
    .select("*", { count: "exact", head: true });

  const { count: pacientes } = await supabase
    .from("pacientes")
    .select("*", { count: "exact", head: true });

  const { count: visitas } = await supabase
    .from("visitas")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido 👋
        </h1>
        <p className="text-gray-500">
          Sistema de Gestión Hospitalaria
        </p>
      </div>

      {/* 🔥 TARJETAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Hospitales</p>
          <h2 className="text-xl font-bold">{hospitales}</h2>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Medicos</p>
          <h2 className="text-xl font-bold">{medicos}</h2>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Pacientes</p>
          <h2 className="text-xl font-bold">{pacientes}</h2>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Visitas</p>
          <h2 className="text-xl font-bold">{visitas}</h2>
        </div>

      </div>
    </div>
  );
}