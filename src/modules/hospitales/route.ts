/**
 * @file src/app/api/hospitales/route.ts
 *
 * @description Route Handler para la API REST de Hospitales.
 *
 * Endpoints disponibles:
 *  GET  /api/hospitales  - Listar todos los hospitales
 *  POST /api/hospitales  - Crear un nuevo hospital
 *
 * Estos endpoints son usados por aplicaciones externas o mobiles.
 * Los formularios internos del dashboard usan Server Actions.
 */

import { NextRequest, NextResponse } from "next/server";
import { HospitalRepository } from "@/modules/hospitales/hospital.repository";
import { HospitalService } from "@/modules/hospitales/hospital.service";
import { CreateHospitalSchema } from "@/modules/hospitales/hospital.schema";

const service = new HospitalService(new HospitalRepository());

/**
 * GET /api/hospitales
 * Retorna todos los hospitales en formato JSON.
 */
export async function GET(request: NextRequest) {
  try {
    // Leer parametros de query opcionales
    const { searchParams } = new URL(request.url);
    const nombre = searchParams.get("nombre") || undefined;

    const result = await service.getAll();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data:  result.data,
      total: result.data?.length || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hospitales
 * Crea un nuevo hospital. Valida el body con Zod.
 *
 * Body esperado (JSON):
 * { "nombre": "...", "direccion": "...", "nit": "...", "telefono": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validation = CreateHospitalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await service.create(validation.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}