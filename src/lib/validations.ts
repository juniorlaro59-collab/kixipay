import { z } from "zod";
import { NOME_MIN_LENGTH, NOME_MAX_LENGTH, CONTRIBUICAO_MIN } from "./constants";

export const phoneSchema = z.string().min(7, "Telefone invalido");
export const biSchema = z
  .string()
  .trim()
  .regex(/^\d{9}[A-Za-z]{2}\d{3}$/, "BI invalido. Use 000000000LA000");

export const passwordSchema = z
  .string()
  .min(4, "Minimo 4 caracteres")
  .max(20, "Maximo 20 caracteres");

export const loginSchema = z.object({
  telefone: phoneSchema,
  pin: passwordSchema,
});

export const registerSchema = z
  .object({
    nome: z
      .string()
      .min(NOME_MIN_LENGTH, `Minimo ${NOME_MIN_LENGTH} caracteres`)
      .max(NOME_MAX_LENGTH, `Maximo ${NOME_MAX_LENGTH} caracteres`)
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Apenas letras e espacos"),
    telefone: phoneSchema,
    biNumber: biSchema,
    pin: passwordSchema,
    pinConfirm: z.string(),
    termos: z.literal(true, { errorMap: () => ({ message: "Aceite os termos para continuar" }) }),
  })
  .refine((d) => d.pin === d.pinConfirm, {
    message: "Senhas nao coincidem",
    path: ["pinConfirm"],
  });

export const contribuicaoSchema = z.object({
  membroId: z.number().positive(),
  valor: z.number().min(CONTRIBUICAO_MIN, `Minimo ${CONTRIBUICAO_MIN} Kz`),
  data: z.string().min(1, "Seleccione uma data"),
  metodo: z.enum(["App", "USSD", "Dinheiro presencial"]),
  notas: z.string().max(200, "Maximo 200 caracteres").optional(),
});

export const addMembroSchema = z.object({
  nome: z.string().min(NOME_MIN_LENGTH).max(NOME_MAX_LENGTH),
  telefone: phoneSchema,
  biNumber: biSchema,
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  posicao: z.number().min(1).max(12),
});

export const perfilSchema = z.object({
  nome: z.string().min(NOME_MIN_LENGTH).max(NOME_MAX_LENGTH),
  telefone: phoneSchema,
  email: z.string().email().optional().or(z.literal("")),
  pin: passwordSchema,
});

export const grupoSchema = z.object({
  nome: z.string().min(3, "Minimo 3 caracteres"),
  valorMensal: z.number().min(CONTRIBUICAO_MIN),
  diaCorte: z.number().min(1).max(31),
});

export const conviteSchema = z.object({
  membroNome: z.string().min(1, "Seleccione um membro"),
  mensagem: z.string().max(300).optional(),
});

export const comunidadeCodeSchema = z.object({
  codigo: z
    .string()
    .min(3, "Codigo invalido")
    .regex(/^[A-Z0-9-]+$/, "Formato invalido"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ContribuicaoFormData = z.infer<typeof contribuicaoSchema>;
export type AddMembroFormData = z.infer<typeof addMembroSchema>;
export type PerfilFormData = z.infer<typeof perfilSchema>;
export type GrupoFormData = z.infer<typeof grupoSchema>;
