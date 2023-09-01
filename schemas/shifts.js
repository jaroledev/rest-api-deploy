import z from 'zod'

const shiftSchema = z.object({
  entry_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  entry_km: z.number().int().positive(),
  end_km: z.number().int().positive(),
  orders: z.number().int().positive(),
  is_holiday:z.boolean({
    required_error: "is_holiday is required",
    invalid_type_error:"is_holiday must be a boolean "
  }),


})

export function validateShift (input) {
  return shiftSchema.safeParse(input)
}
export function validatePartialShift (input) {
  return shiftSchema.partial().safeParse(input)
}

