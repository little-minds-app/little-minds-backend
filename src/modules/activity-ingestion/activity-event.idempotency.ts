/**
 * Idempotency helpers for future ingest (LM-008 / §38.4).
 * LMP-50 ships schemas only — no live POST /v1/events/batch.
 * These pure helpers document the contract: duplicate event_id → no-op success.
 */

export type IngestAck = {
  event_id: string;
  status: 'accepted' | 'duplicate_noop' | 'rejected';
};

/**
 * Given a set of already-persisted event ids, decide ack status for a candidate.
 * Does not perform I/O.
 */
export function acknowledgeEventIdempotency(
  eventId: string,
  persistedEventIds: ReadonlySet<string>,
): IngestAck {
  if (persistedEventIds.has(eventId)) {
    return { event_id: eventId, status: 'duplicate_noop' };
  }
  return { event_id: eventId, status: 'accepted' };
}
