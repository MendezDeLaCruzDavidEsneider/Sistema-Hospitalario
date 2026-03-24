/**
 * @file src/modules/hospitales/hospital.service.ts
 *
 * @description Capa de servicio para la logica de negocio de Hospitales.
 *
 * El servicio es responsable de:
 * - Recibir el repositorio por inyeccion de dependencias (DIP)
 * - Aplicar reglas de negocio antes de llamar al repositorio
 * - Retornar resultados envueltos en ServiceResult<T>
 * - Centralizar el manejo de errores
 *
 * @pattern Service Layer
 * @principle SRP: solo logica de negocio de Hospitales
 * @principle DIP: depende de IRepository<Hospital>, no de Supabase
 */

import type {
  IRepository,
  ServiceResult
} from "@/lib/interfaces/repository.interface";
import type {
  Hospital,
  CreateHospitalDTO,
} from "./types";

export class HospitalService {
  /**
   * Inyeccion de Dependencias: recibimos el repositorio como parametro.
   * En produccion: new HospitalService(new HospitalRepository())
   * En tests:      new HospitalService(new MockHospitalRepository())
   *
   * readonly: no se puede reasignar despues del constructor
   * private: no se puede acceder desde fuera de la clase
   */
  constructor(
    private readonly repo: IRepository<Hospital, number, CreateHospitalDTO>
  ) {}

  /**
   * Obtiene todos los hospitales del sistema.
   * Usa ServiceResult para envolver el resultado y estandarizar la respuesta.
   *
   * @returns ServiceResult con array de hospitales o mensaje de error
   */
  async getAll(): Promise<ServiceResult<Hospital[]>> {
    try {
      const data = await this.repo.findAll();
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  /**
   * Obtiene un hospital por ID con validacion de existencia.
   *
   * REGLA DE NEGOCIO: Si el hospital no existe, retorna error.
   * (No es un error del sistema, es un estado valido del negocio)
   */
  async getById(id: number): Promise<ServiceResult<Hospital>> {
    try {
      const data = await this.repo.findById(id);

      if (!data) {
        return {
          data: null,
          error: `Hospital con ID ${id} no encontrado`,
          success: false,
        };
      }

      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  /**
   * Crea un nuevo hospital con validaciones de negocio.
   *
   * REGLAS DE NEGOCIO aplicadas:
   * 1. El NIT debe tener formato colombiano valido (XXXXXXXXX-D)
   * 2. El nombre no puede estar duplicado (pendiente implementar)
   */
  async create(dto: CreateHospitalDTO): Promise<ServiceResult<Hospital>> {
    try {
      // REGLA 1: Validar formato del NIT colombiano
      if (!this.validateNIT(dto.nit)) {
        return {
          data: null,
          error: "El NIT no tiene formato valido. Esperado: 800123456-7",
          success: false,
        };
      }

      const data = await this.repo.create(dto);
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  /**
   * Actualiza un hospital con validaciones.
   * Verifica existencia antes de intentar actualizar.
   */
  async update(
    id: number,
    updates: Partial<CreateHospitalDTO>
  ): Promise<ServiceResult<Hospital>> {
    try {
      // Verificar que el hospital existe antes de actualizar
      const exists = await this.repo.findById(id);
      if (!exists) {
        return {
          data: null,
          error: `Hospital ${id} no encontrado para actualizar`,
          success: false,
        };
      }

      // Validar NIT si se esta actualizando
      if (updates.nit && !this.validateNIT(updates.nit)) {
        return {
          data: null,
          error: "El NIT no tiene formato valido",
          success: false,
        };
      }

      const data = await this.repo.update(id, updates);
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  /**
   * Elimina un hospital con validacion de restricciones.
   *
   * REGLA DE NEGOCIO: No se puede eliminar un hospital si tiene
   * medicos asignados. La BD lanzara un error de FK constraint.
   */
  async delete(id: number): Promise<ServiceResult<boolean>> {
    try {
      const deleted = await this.repo.delete(id);
      if (!deleted) {
        return {
          data: false,
          error: "No se pudo eliminar. Puede tener medicos asignados.",
          success: false,
        };
      }
      return { data: true, error: null, success: true };
    } catch (err) {
      return { data: false, error: this.handleError(err), success: false };
    }
  }

  // — METODOS PRIVADOS —

  /**
   * Valida el formato del NIT colombiano.
   * Formato: 8-9 digitos, guion, 1 digito de verificacion.
   * Ejemplos validos: 800123456-7, 12345678-9
   */
  private validateNIT(nit: string): boolean {
    return /^\d{8,9}-\d$/.test(nit);
  }

  /**
   * Extrae el mensaje de error de cualquier tipo de excepcion.
   * Centraliza el manejo de errores del servicio.
   */
  private handleError(err: unknown): string {
    if (err instanceof Error) return err.message;
    return "Error desconocido en HospitalService";
  }
}