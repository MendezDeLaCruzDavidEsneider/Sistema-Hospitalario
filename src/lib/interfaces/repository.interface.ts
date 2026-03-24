/**
 * @file src/lib/interfaces/repository.interface.ts
 *
 * @description Interfaces base del patron Repository.
 *
 * Usamos genericos de TypeScript (<T, ID, C>) para crear interfaces
 * reutilizables que funcionan para CUALQUIER entidad del sistema.
 *
 * @principle ISP: Interfaces pequenas y especificas por capacidad
 * @principle OCP: Cerradas para modificacion, abiertas para extension
 * @principle DIP: Los servicios dependen de estas abstracciones
 */

/** Resultado estandar de todas las operaciones de servicio.
 * Envuelve el resultado en un objeto uniforme con estado de exito/error.
 * @template T - Tipo del dato retornado
 */
export interface ServiceResult<T> {
  data: T | null;     // El dato si la operacion fue exitosa
  error: string | null; // Mensaje de error si la operacion fallo
  success: boolean;   // true si tuvo exito, false si hubo error
}

/** Resultado de una lista paginada */
export interface PageResult<T> {
  data: T[];          // Arreglo de elementos de la pagina actual
  count: number;      // Total de elementos (no solo de esta pagina)
  page: number;       // Pagina actual (1-indexed)
  pageSize: number;   // Tamano de la pagina
  totalPages: number; // Total de paginas = ceil(count/pageSize)
}

/** Operaciones de LECTURA (todos los repositorios las implementan) */
export interface IReadableRepository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
}

/** Operaciones de ESCRITURA */
export interface IWritableRepository<T, ID = number, C = Omit<T, "id">> {
  create(data: C): Promise<T>;
  update(id: ID, data: Partial<C>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

/** CRUD completo: combina lectura y escritura */
export interface IRepository<T, ID = number, C = Omit<T, "id">>
  extends IReadableRepository<T, ID>,
    IWritableRepository<T, ID, C> {}

/** Repositorios con paginacion y filtros (ISP: solo quien lo necesita) */
export interface IPaginableRepository<T, F = Record<string, unknown>> {
  findPaginated(
    page: number,
    pageSize: number,
    filters?: F
  ): Promise<{ data: T[]; count: number }>;
}

/** Repositorios que admiten busqueda por texto */
export interface ISearchableRepository<T> {
  search(query: string): Promise<T[]>;
}