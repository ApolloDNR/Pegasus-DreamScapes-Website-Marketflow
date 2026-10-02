export function canReadUserProfile(input: {
  requesterUserId: string;
  targetUserId: string;
}): boolean {
  return input.requesterUserId === input.targetUserId;
}
