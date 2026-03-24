/**
 * @file src/modules/medicos/medico.repository.ts
 *
 * @description Repositorio para Medicos con relaciones.
 * Implementa JOINs usando la sintaxis de Supabase PostgREST.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  MedicoConRelaciones,
  CreateMedicoDTO
} from "./types";

/**
 * Query SELECT con JOINs de Supabase.
 * La sintaxis usa el nombre de la tabla referenciada seguido de !nombreFK
 * o directamente el nombre de la tabla si la FK es obvia.
 *
 * Equivale a este SQL:
 * SELECT m.*, e.nombre as esp_nombre, h.nombre as hosp_nombre
 * FROM medicos m
 * JOIN especialidades e ON m.especialidadid = e.especialidadid
 * JOIN hospitales h ON m.hospitalid = h.hospitalid
 */
const MEDICO_SELECT = `
  medicoid,
  nombre,
  apellido,
  especialidadid,
  hospitalid,
  telefono,
  correoelectronico,
  especialidades(especialidadid, nombre),
  hospitales(hospitalid, nombre, direccion)
`;

export class MedicoRepository {
  /**
   * Obtiene todos los medicos con sus relaciones.
   * El resultado incluye datos de Especialidad y Hospital.
   */
  async findAll(): Promise<MedicoConRelaciones[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("medicos")
      .select(MEDICO_SELECT)
      .order("apellido", { ascending: true });

    if (error) throw new Error(`Error obteniendo medicos: ${error.message}`);

    // Mapear la estructura de Supabase al tipo de dominio
return (data || []).map((row) => ({
  medicoId:          row.medicoid,
  nombre:            row.nombre,
  apellido:          row.apellido,
  especialidadId:    row.especialidadid,
  hospitalId:        row.hospitalid,
  telefono:          row.telefono,
  correoElectronico: row.correoelectronico,
  especialidad: {
    especialidadId: row.especialidades.especialidadid,
    nombre:         row.especialidades.nombre,
  },
  hospital: {
    hospitalid: row.hospitales.hospitalid,  // ← AQUÍ: cambiar a minúscula
    nombre:     row.hospitales.nombre,
    direccion:  row.hospitales.direccion,
    nit:        "",
    telefono:   "",
      },
    }));
  }

  /**
   * Filtra medicos por especialidad.
   * Util para mostrar medicos disponibles de una especialidad.
   */
  async findByEspecialidad(especialidadId: number): Promise<MedicoConRelaciones[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("medicos")
      .select(MEDICO_SELECT)
      .eq("especialidadid", especialidadId) // Filtro por especialidad
      .order("apellido");

    if (error) throw new Error(error.message);

    return (data || []).map((row) => this.mapRow(row));
  }

  async create(dto: CreateMedicoDTO): Promise<MedicoConRelaciones> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("medicos")
      .insert({
        nombre:            dto.nombre,
        apellido:          dto.apellido,
        especialidadid:    dto.especialidadId,
        hospitalid:        dto.hospitalId,
        telefono:          dto.telefono,
        correoelectronico: dto.correoElectronico,
      })
      .select(MEDICO_SELECT)
      .single();

    if (error) throw new Error(`Error creando medico: ${error.message}`);

    return this.mapRow(data!);
  }

  async delete(id: number): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("medicos").delete().eq("medicoid", id);
    return !error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRow(row: Record<string, any>): MedicoConRelaciones {
    return {
      medicoId:          row.medicoid, nombre: row.nombre, apellido: row.apellido,
      especialidadId:    row.especialidadid, hospitalId: row.hospitalid,
      telefono:          row.telefono, correoElectronico: row.correoelectronico,
      especialidad: { especialidadId: row.especialidades.especialidadid,
        nombre:          row.especialidades.nombre },
      hospital: { hospitalid: row.hospitales.hospitalid,
        nombre: row.hospitales.nombre, direccion: row.hospitales.direccion,
        nit: "", telefono: "" },
    };
  }
}