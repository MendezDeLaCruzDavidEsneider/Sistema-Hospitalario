/**
 * @file src/modules/medicos/types.ts
 * @description Tipos de dominio para el modulo de Medicos.
 *
 * MedicoConRelaciones incluye los datos de Especialidad y Hospital
 * para no tener que hacer llamadas separadas.
 */

import type { Especialidad } from "../especialidades/types";
import type { Hospital } from "../hospitales/types";

export interface Medico {
  medicoId: number;
  nombre: string;
  apellido: string;
  especialidadId: number;
  hospitalId: number;
  telefono: string;
  correoElectronico: string;
}

/** Medico con datos relacionados (JOIN) */
export interface MedicoConRelaciones extends Medico {
  especialidad: Especialidad;
  hospital: Hospital;
}

export type CreateMedicoDTO = Omit<Medico, "medicoId">;
export type UpdateMedicoDTO = Partial<CreateMedicoDTO>;