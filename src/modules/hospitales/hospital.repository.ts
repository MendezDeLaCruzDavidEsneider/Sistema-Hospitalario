/**
 * @file src/modules/hospitales/hospital.repository.ts
 * @description Repositorio para la tabla "hospitales" de Supabase.
 *
 * Encapsula TODA la logica de acceso a datos de la tabla Hospitales.
 * Ningun otro archivo del proyecto debe acceder directamente a
 * Supabase para datos de hospitales. Solo este archivo lo hace.
 *
 * @pattern Repository Pattern
 * @principle SRP: una sola responsabilidad — acceso a datos de hospitales
 * @principle OCP: implementa IRepository sin modificarlo
 * @principle LSP: puede usarse donde se espere IRepository<Hospital>
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  IRepository,
  IPaginableRepository,
  PageResult
} from "@/lib/interfaces/repository.interface";
import type {
  Hospital,
  CreateHospitalDTO,
  HospitalFilters
} from "./types";

/**
 * Implementacion del repositorio para la tabla "hospitales".
 * Implementa IRepository<Hospital, number, CreateHospitalDTO>.
 */
export class HospitalRepository
  implements
    IRepository<Hospital, number, CreateHospitalDTO>,
    IPaginableRepository<Hospital, HospitalFilters>
{
  /**
   * Busca un hospital por su ID primario.
   *
   * @param id - El HospitalID de la tabla hospitales
   * @returns El hospital encontrado, o null si no existe
   *
   * @example
   * const hospital = await repo.findById(1);
   * // hospital = { hospitalId: 1, nombre: "Hospital Central", ... }
   */
  async findById(id: number): Promise<Hospital | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("hospitales")          // tabla de la BD
      .select("*")                 // todas las columnas
      .eq("hospitalid", id)        // WHERE hospitalid = id
      .single();                   // esperar exactamente 1 resultado

    // Si hay error (no existe, BD offline, etc.) retornar null
    if (error || !data) return null;

    // Convertir de formato BD a formato dominio
    return this.mapToDomain(data);
  }

  /**
   * Obtiene todos los hospitales, con filtros opcionales.
   *
   * @param filters - Objeto con campos para filtrar (opcionales)
   * @returns Array de hospitales, vacio si no hay resultados
   */
  async findAll(filters?: HospitalFilters): Promise<Hospital[]> {
    const supabase = await createServerSupabaseClient();

    // Construir la query base
    let query = supabase
      .from("hospitales")
      .select("*")
      .order("nombre", { ascending: true }); // Orden alfabetico

    // Aplicar filtros dinamicamente (solo si se proporcionan)
    if (filters?.nombre) {
      // ilike = LIKE insensible a mayusculas/minusculas
      // % al inicio y fin = busqueda "contiene"
      query = query.ilike("nombre", `%${filters.nombre}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener hospitales: ${error.message}`);
    }

    // Mapear cada fila al tipo de dominio
    return (data || []).map((row) => this.mapToDomain(row));
  }

  /**
   * Crea un nuevo hospital en la base de datos.
   *
   * @param hospitalData - Datos del nuevo hospital sin el ID
   * @returns El hospital creado con el ID asignado por la BD
   *
   * @throws Error si la insercion falla (NIT duplicado, etc.)
   */
  async create(hospitalData: CreateHospitalDTO): Promise<Hospital> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("hospitales")
      .insert({
        // Mapear camelCase (dominio) -> snake_case (BD)
        nombre:    hospitalData.nombre,
        direccion: hospitalData.direccion,
        nit:       hospitalData.nit,
        telefono:  hospitalData.telefono,
      })
      .select()   // Retornar el registro recien creado
      .single();  // Esperar exactamente 1 resultado

    if (error) {
      throw new Error(`Error al crear hospital: ${error.message}`);
    }

    return this.mapToDomain(data!);
  }

  /**
   * Actualiza los datos de un hospital existente.
   * Solo actualiza los campos que se incluyan en el DTO.
   *
   * @param id - ID del hospital a actualizar
   * @param updates - Objeto con los campos a actualizar (parcial)
   * @returns El hospital actualizado, o null si no existe
   */
  async update(
    id: number,
    updates: Partial<CreateHospitalDTO>
  ): Promise<Hospital | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("hospitales")
      .update(updates) // Solo actualiza los campos del objeto
      .eq("hospitalid", id) // WHERE hospitalid = id
      .select()
      .single();

    if (error || !data) return null;

    return this.mapToDomain(data);
  }

  /**
   * Elimina un hospital por su ID.
   *
   * @param id - ID del hospital a eliminar
   * @returns true si se elimino exitosamente, false en caso contrario
   *
   * NOTA: Si hay medicos asignados a este hospital, la BD lanzara
   * un error de foreign key constraint. El servicio debe validar esto
   * ANTES de llamar a este metodo.
   */
  async delete(id: number): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("hospitales")
      .delete()
      .eq("hospitalid", id);

    return !error; // true = exito, false = error
  }

  /**
   * Obtiene hospitales con paginacion para listas largas.
   * Usa el parametro count: "exact" de Supabase para obtener
   * el total de registros sin traer todos los datos.
   *
   * @param page      - Pagina a obtener (1-indexed)
   * @param pageSize  - Cantidad de registros por pagina
   * @param filters   - Filtros opcionales de busqueda
   */
  async findPaginated(
    page: number,
    pageSize: number,
    filters?: HospitalFilters
  ): Promise<{ data: Hospital[]; count: number }> {
    const supabase = await createServerSupabaseClient();
    const from = (page - 1) * pageSize; // Inicio del rango
    const to = from + pageSize - 1;     // Fin del rango

    let query = supabase
      .from("hospitales")
      .select("*", { count: "exact" }) // count: "exact" devuelve el total
      .range(from, to)                  // LIMIT y OFFSET
      .order("nombre");

    if (filters?.nombre) {
      query = query.ilike("nombre", `%${filters.nombre}%`);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      data: (data || []).map((row) => this.mapToDomain(row)),
      count: count || 0,
    };
  }

  /**
   * Convierte una fila de la BD al tipo de dominio Hospital.
   * Maneja el mapeo de nombres: hospitalid -> hospitalId, etc.
   *
   * @private - Solo para uso interno del repositorio
   * @param row - Fila cruda de la BD (tipos de Supabase)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToDomain(row: Record<string, any>): Hospital {
    return {
      hospitalid: row.hospitalid as number,
      nombre:     row.nombre    as string,
      direccion:  row.direccion as string,
      nit:        row.nit       as string,
      telefono:   row.telefono  as string,
    };
  }
}