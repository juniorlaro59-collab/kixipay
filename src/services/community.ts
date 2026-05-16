import { post } from "./client";

export async function solicitarEntrada(
  groupId: string,
): Promise<{ success: boolean; message: string }> {
  return post("/api/Groups/join", {
    groupId,
    vouchedByUserId: null,
  });
}
