/**
 * @file src/modules/especialidades/types.ts
 * @description Tipos de dominio para el modulo de Especialidades.
 */

export interface Especialidad {
  especialidadId: number;
  nombre: string;
}

export type CreateEspecialidadDTO = Omit<Especialidad, "especialidadId">;
export type UpdateEspecialidadDTO = Partial<CreateEspecialidadDTO>;