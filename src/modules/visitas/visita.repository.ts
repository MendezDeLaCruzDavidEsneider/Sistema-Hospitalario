/**
 * @file src/modules/visitas/visita.repository.ts
 *
 * @description Repositorio para Visitas con multiples JOINs.
 *
 * La visita tiene relaciones con:
 * - pacientes (PacienteID FK)
 * - medicos (MedicoID FK) -> especialidades -> hospitales
 * - detallesvisitas (VisitaID FK) -> motivosvisitas
 * - signosvitales (VisitaID FK)
 * - tratamientos (VisitaID FK)
 * - orden_examenes (VisitaID FK)
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Visita,
  VisitaCompleta,
  CreateVisitaCompletaDTO
} from "./types";

// Query que trae la visita con TODAS sus relaciones
const VISITA_COMPLETA_SELECT = `
  visitaid, fecha, hora,
  pacienteid,
  medicoid,
  pacientes!pacienteid(
    pacienteid, nombre, apellido, telefono, correoelectronico
  ),
  medicos!medicoid(
    medicoid, nombre, apellido, telefono,
    especialidades!especialidadid(nombre),
    hospitales!hospitalid(nombre)
  ),
  detallesvisitas(
    detallevisitaid, diagnostico,
    motivosvisitas!motivoid(descripcion)
  ),
  signosvitales(
    signovitalid, frecuenciacardiaca, presionarterial,
    frecuenciarespiratoria, temperatura, saturacionoxigeno
  )
`;

export class VisitaRepository {
  /**
   * Obtiene todas las visitas de un paciente especifico.
   * Ordenadas de mas reciente a mas antigua.
   */
  async findByPaciente(pacienteId: number): Promise<VisitaCompleta[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("visitas")
      .select(VISITA_COMPLETA_SELECT)
      .eq("pacienteid", pacienteId)
      .order("fecha", { ascending: false }) // Mas reciente primero
      .order("hora", { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []) as unknown as VisitaCompleta[];
  }

  /**
   * Crea una visita con sus datos asociados.
   *
   * Este metodo ilustra como hacer INSERCIONES RELACIONADAS en Supabase.
   * Se hacen multiples inserts en secuencia, usando el ID generado
   * de la visita principal para los registros relacionados.
   *
   * NOTA: Para garantizar atomicidad (todo o nada), se podria usar
   * una funcion PostgreSQL (RPC) con BEGIN/COMMIT. Para este
   * ejercicio hacemos inserciones en secuencia.
   */
  async createCompleta(
    dto: CreateVisitaCompletaDTO
  ): Promise<VisitaCompleta> {
    const supabase = await createServerSupabaseClient();

    // PASO 1: Crear la visita principal
    const { data: visita, error: visitaError } = await supabase
      .from("visitas")
      .insert({
        pacienteid: dto.pacienteId,
        medicoid:   dto.medicoId,
        fecha:      dto.fecha,
        hora:       dto.hora,
      })
      .select("visitaid")
      .single();

    if (visitaError) {
      throw new Error(`Error creando visita: ${visitaError.message}`);
    }

    const visitaId = visita.visitaid;

    // PASO 2: Crear el detalle de la visita (si se proporcionaron)
    if (dto.motivoId && dto.diagnostico) {
      const { error: detalleError } = await supabase
        .from("detallesvisitas")
        .insert({
          visitaid:    visitaId,
          motivoid:    dto.motivoId,
          diagnostico: dto.diagnostico,
        });

      if (detalleError) {
        console.error("Error creando detalle visita:", detalleError);
        // No lanzamos error aqui para no bloquear la visita
      }
    }

    // PASO 3: Crear los signos vitales (si se proporcionaron)
    if (dto.signosVitales) {
      const sv = dto.signosVitales;
      const { error: svError } = await supabase
        .from("signosvitales")
        .insert({
          visitaid:              visitaId,
          frecuenciacardiaca:    sv.frecuenciaCardiaca,
          presionarterial:       sv.presionArterial,
          frecuenciarespiratoria: sv.frecuenciaRespiratoria,
          temperatura:           sv.temperatura,
          saturacionoxigeno:     sv.saturacionOxigeno,
        });

      if (svError) {
        console.error("Error creando signos vitales:", svError);
      }
    }

    // PASO 4: Retornar la visita completa con todas sus relaciones
    const visitaCompleta = await this.findById(visitaId);
    if (!visitaCompleta) {
      throw new Error("Error al recuperar la visita recien creada");
    }

    return visitaCompleta;
  }

  async findById(id: number): Promise<VisitaCompleta | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("visitas")
      .select(VISITA_COMPLETA_SELECT)
      .eq("visitaid", id)
      .single();
    if (error || !data) return null;

    return data as unknown as VisitaCompleta;
  }
}