export const PEGGY_CONVERSATION_ACCESS_HEADER =
  "X-Peggy-Conversation-Token";

export interface PeggyConversationAccessResponse {
  id: number;
  accessToken: string;
}
