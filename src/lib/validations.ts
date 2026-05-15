import { z } from "zod";
import {
  PIN_LENGTH,
  PHONE_REGEX,
  NOME_MIN_LENGTH,
  NOME_MAX_LENGTH,
  CONTRIBUICAO_MIN,
} from "./constants";

export const phoneSchema = z
  .string()
  .min(7, "Telefone inválido")
  .regex(PHONE_REGEX, "Formato: 9XX XXX XXX");

export const pinSchema = z
  .string()
  .length(PIN_LENGTH, `PIN deve ter ${PIN_LENGTH} dígitos`)
  .regex(/^\d{4}$/, "PIN deve conter apenas números");

export const loginSchema = z.object({
  telefone: phoneSchema,
  pin: pinSchema,
});

export const registerSchema = z
  .object({
    nome: z
      .string()
      .min(NOME_MIN_LENGTH, `Mínimo ${NOME_MIN_LENGTH} caracteres`)
      .max(NOME_MAX_LENGTH, `Máximo ${NOME_MAX_LENGTH} caracteres`)
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Apenas letras e espaços"),
    telefone: phoneSchema,
    pin: pinSchema,
    pinConfirm: z.string(),
    termos: z.literal(true, { errorMap: () => ({ message: "Aceite os termos para continuar" }) }),
  })
  .refine((d) => d.pin === d.pinConfirm, { message: "PINs não coincidem", path: ["pinConfirm"] });

export const contribuicaoSchema = z.object({
  membroId: z.number().positive(),
  valor: z.number().min(CONTRIBUICAO_MIN, `Mínimo ${CONTRIBUICAO_MIN} Kz`),
  data: z.string().min(1, "Seleccione uma data"),
  metodo: z.enum(["App", "USSD", "Dinheiro presencial"]),
  notas: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export const addMembroSchema = z.object({
  nome: z.string().min(NOME_MIN_LENGTH).max(NOME_MAX_LENGTH),
  telefone: phoneSchema,
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  posicao: z.number().min(1).max(12),
});

export const perfilSchema = z.object({
  nome: z.string().min(NOME_MIN_LENGTH).max(NOME_MAX_LENGTH),
  telefone: phoneSchema,
  email: z.string().email().optional().or(z.literal("")),
  pin: pinSchema,
});

export const grupoSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
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
    .min(3, "Código inválido")
    .regex(/^[A-Z0-9-]+$/, "Formato inválido"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ContribuicaoFormData = z.infer<typeof contribuicaoSchema>;
export type AddMembroFormData = z.infer<typeof addMembroSchema>;
export type PerfilFormData = z.infer<typeof perfilSchema>;
export type GrupoFormData = z.infer<typeof grupoSchema>;
