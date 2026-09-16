/** A lead is received only when the create endpoint returns its persisted record. */
export async function readLeadReceipt(response: Response): Promise<{ id: number; stage: 'new' }> {
  const receipt: unknown = await response.json();
  if (response.status !== 201 || response.redirected || !receipt || typeof receipt !== 'object' ||
      !('id' in receipt) || !Number.isSafeInteger(receipt.id) || Number(receipt.id) <= 0 ||
      !('stage' in receipt) || receipt.stage !== 'new') {
    throw new Error('The server did not return a usable submission receipt.');
  }
  return { id: Number(receipt.id), stage: 'new' };
}

/** The canonical opportunity endpoint returns a separate receipt contract. */
export async function readOpportunityReceipt(response: Response): Promise<{ id: string }> {
  const receipt: unknown = await response.json();
  if (response.status !== 201 || response.redirected || !receipt || typeof receipt !== 'object' ||
      !('id' in receipt) || typeof receipt.id !== 'string' || !receipt.id.trim() || receipt.id.length > 128 ||
      !('status' in receipt) || receipt.status !== 'New') {
    throw new Error('The server did not return a usable opportunity receipt.');
  }
  return { id: receipt.id };
}
