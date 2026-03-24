import { z } from "zod";

export const CreateHospitalSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),

  direccion: z
    .string()
    .min(10, "La direccion debe tener al menos 10 caracteres")
    .max(200),

  nit: z
    .string()
    .regex(
      /^\d{8,9}-\d$/,
      "NIT invalido. Formato esperado: 800123456-7"
    ),

  telefono: z
    .string()
    .regex(/^[0-9]{7,10}$/, "Telefono invalido. Solo digitos, 7-10 caracteres"),
});

export const UpdateHospitalSchema = CreateHospitalSchema.partial();

export type CreateHospitalInput = z.infer<typeof CreateHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof UpdateHospitalSchema>;