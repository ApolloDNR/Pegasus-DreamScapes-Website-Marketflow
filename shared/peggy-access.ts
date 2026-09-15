export const PEGGY_CONVERSATION_ACCESS_HEADER =
  "X-Peggy-Conversation-Token";

export const PEGGY_ACCESS_EXPIRED_CODE = "PEGGY_ACCESS_EXPIRED";

export interface PeggyConversationAccessResponse {
  id: number;
  accessToken: string;
}

export interface PeggyConversationAccessExpiredResponse {
  message: "Conversation access expired";
  code: typeof PEGGY_ACCESS_EXPIRED_CODE;
}
