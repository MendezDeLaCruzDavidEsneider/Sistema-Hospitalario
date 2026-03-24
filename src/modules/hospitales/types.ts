/**
 * @file src/modules/hospitales/types.ts
 * @description Tipos de dominio para el modulo de Hospitales
 *
 * Mapeamos los nombres de columnas PostgreSQL a TypeScript.
 * En este caso usamos los nombres EXACTOS de la BD para evitar errores.
 */

/** Entidad Hospital del dominio */
export interface Hospital {
  hospitalid: number;   // <- hospitalid en la BD
  nombre: string;       
  direccion: string;    
  nit: string;          
  telefono: string;     
}

/** DTO para crear un hospital (sin campos autogenerados) */
export type CreateHospitalDTO = Omit<Hospital, "hospitalid">;

/** DTO para actualizar (todos los campos opcionales) */
export type UpdateHospitalDTO = Partial<CreateHospitalDTO>;

/** Filtros de busqueda disponibles */
export interface HospitalFilters {
  nombre?: string;
}