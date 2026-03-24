"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { VisitaRepository } from "@/modules/visitas/visita.repository";

// Schema de validacion para la visita completa
const CreateVisitaSchema = z.object({
  pacienteid: z.coerce.number().positive("Seleccione un paciente"),
  medicoid:   z.coerce.number().positive("Seleccione un medico"),
  fecha:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida"),
  hora:       z.string().regex(/^\d{2}:\d{2}$/, "Hora invalida"),
  motivoid:   z.coerce.number().positive().optional(),
  diagnostico: z.string().min(10).optional(),
  // Signos vitales: todos opcionales en conjunto
  frecuenciaCardiaca:    z.coerce.number().min(30).max(300).optional(),
  presionArterial:       z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(),
  frecuenciaRespiratoria: z.coerce.number().min(5).max(60).optional(),
  temperatura:           z.coerce.number().min(32).max(45).optional(),
  saturacionOxigeno:     z.coerce.number().min(0).max(100).optional(),
});

export async function createVisitaAction(
  _prevState: unknown,
  formData: FormData
) {
  // Extraer todos los campos del formulario
  const rawData = Object.fromEntries(
    Array.from(formData.entries()).map(([key, val]) => [key, val])
  );

  // Validar con Zod
  const validation = CreateVisitaSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: "Errores en el formulario",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const d = validation.data;
  const repo = new VisitaRepository();

  // Construir el DTO de visita completa
  const visitaDTO = {
    pacienteId: d.pacienteid,
    medicoId:   d.medicoid,
    fecha:      d.fecha,
    hora:       d.hora,
    motivoId:   d.motivoid,
    diagnostico: d.diagnostico,
    // Solo incluir signos vitales si se proporcionaron
    signosVitales: d.frecuenciaCardiaca ? {
      frecuenciaCardiaca:    d.frecuenciaCardiaca,
      presionArterial:       d.presionArterial!,
      frecuenciaRespiratoria: d.frecuenciaRespiratoria!,
      temperatura:           d.temperatura!,
      saturacionOxigeno:     d.saturacionOxigeno!,
    } : undefined,
  };

  try {
    await repo.createCompleta(visitaDTO);
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Error al crear visita",
    };
  }

  revalidatePath("/dashboard/visitas");
  revalidatePath(`/dashboard/pacientes/${d.pacienteid}`);
  redirect("/dashboard/visitas");
}