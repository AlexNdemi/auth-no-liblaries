import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8),
})

export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8),
})
