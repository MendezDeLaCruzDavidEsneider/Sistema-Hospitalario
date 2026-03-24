// src/app/(dashboard)/hospitales/_components/HospitalesTable.tsx

"use client";

import { Hospital } from "@/modules/hospitales/types";
import { deleteHospitalAction } from "@/modules/hospitales/hospital.actions";
import { useTransition } from "react";
import toast from "react-hot-toast";

interface HospitalesTableProps {
  hospitales: Hospital[];
}

export function HospitalesTable({ hospitales }: HospitalesTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar el hospital "${nombre}"?`)) return;

    const formData = new FormData();
    formData.set("id", String(id));

    startTransition(async () => {
      const result = await deleteHospitalAction(null, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">NIT</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Direccion</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Telefono</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {hospitales.map((hospital) => (
            <tr key={hospital.hospitalid} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{hospital.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{hospital.nit}</td>
              <td className="px-4 py-3 text-gray-600">{hospital.direccion}</td>
              <td className="px-4 py-3 text-gray-600">{hospital.telefono}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(hospital.hospitalid, hospital.nombre)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}