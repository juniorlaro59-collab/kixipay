import { delay, IS_MOCK, get, post } from "./client";
import type { Comunidade } from "@/types";
import { COMUNIDADES, REGIOES } from "./mock-data";

export async function getComunidades(regiao?: string): Promise<Comunidade[]> {
  if (IS_MOCK) {
    await delay(400);
    if (regiao && regiao !== "todas") return COMUNIDADES.filter((c) => c.regiao === regiao);
    return COMUNIDADES;
  }
  return get<Comunidade[]>("/comunidades", regiao ? { regiao } : undefined);
}

export async function getComunidadeByCode(codigo: string): Promise<Comunidade | null> {
  if (IS_MOCK) {
    await delay(300);
    return COMUNIDADES.find((c) => c.codigo === codigo.toUpperCase()) || null;
  }
  return get<Comunidade>(`/comunidades/codigo/${codigo}`);
}

export async function solicitarEntrada(
  comunidadeId: number,
): Promise<{ success: boolean; message: string }> {
  if (IS_MOCK) {
    await delay(800);
    return { success: true, message: "Pedido de entrada enviado com sucesso" };
  }
  return post("/comunidades/solicitar", { comunidadeId });
}

export function getRegioes(): string[] {
  return REGIOES;
}

export async function gerarConvite(membroNome: string): Promise<string> {
  const link = `https://kixipay.ao/convite/${membroNome.replace(/\s/g, "").slice(0, 4)}-${Date.now()}`;
  if (IS_MOCK) {
    await delay(200);
    return link;
  }
  const res = await post<{ link: string }>("/comunidades/convite", { membroNome });
  return res.link;
}
