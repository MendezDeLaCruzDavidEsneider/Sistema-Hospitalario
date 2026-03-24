/**
 * @file src/modules/visitas/types.ts
 * @description Tipos para el modulo de Visitas (el mas complejo del sistema)
 *
 * Una visita tiene multiples relaciones:
 * - Paciente (quien fue a la cita)
 * - Medico (quien atendio)
 * - DetallesVisita (diagnostico y motivo)
 * - SignosVitales (mediciones fisiologicas)
 * - Tratamiento (tratamiento asignado)
 * - OrdenExamenes (examenes solicitados)
 */

export interface Visita {
  visitaId: number;
  pacienteId: number;
  medicoId: number;
  fecha: string;  // "YYYY-MM-DD"
  hora: string;   // "HH:MM"
}

export interface DetalleVisita {
  detalleVisitaId: number;
  visitaId: number;
  motivoId: number;
  diagnostico: string;
}

export interface SignoVital {
  signoVitalId: number;
  visitaId: number;
  frecuenciaCardiaca: number;
  presionArterial: string;  // Ej: "120/80"
  frecuenciaRespiratoria: number;
  temperatura: number;
  saturacionOxigeno: number;
}

/** Visita completa con todos sus datos relacionados */
export interface VisitaCompleta extends Visita {
  paciente: { nombre: string; apellido: string; telefono: string };
  medico: { nombre: string; apellido: string; especialidad: string };
  detallesVisita?: DetalleVisita & { motivoDescripcion: string };
  signosVitales?: Omit<SignoVital, "signoVitalId" | "visitaId">;
}

/** DTO para registrar una nueva visita completa */
export interface CreateVisitaCompletaDTO {
  pacienteId: number;
  medicoId: number;
  fecha: string;
  hora: string;
  // Datos adicionales de la visita (opcionales al crear)
  motivoId?: number;
  diagnostico?: string;
  signosVitales?: {
    frecuenciaCardiaca: number;
    presionArterial: string;
    frecuenciaRespiratoria: number;
    temperatura: number;
    saturacionOxigeno: number;
  };
}