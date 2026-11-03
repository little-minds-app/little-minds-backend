import { createHash } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PARENT_ONLY_EVENT_TYPES,
  type ActivityEventV1,
  type ActivitySessionV1,
} from './activity-contract.types';
import { validateActivityEvent } from './activity-event.validator';
import { validateActivitySession } from './activity-session.validator';

/**
 * LMP-51 Phase B: transport-independent, strict batch admission.
 * Only syntactically validated events may reach the transaction boundary.
 * This class does NOT authorize a parent, determine consent, or persist data:
 * the API must perform those checks before ACK/insert.
 */
@Injectable()
export class ActivityBatchAdmissionService {
  validate(input: unknown): {
    sessions: ActivitySessionV1[];
    events: ActivityEventV1[];
  } {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('batch.invalid_envelope');
    }
    const obj = input as Record<string, unknown>;
    if (
      Object.keys(obj).some((key) => key !== 'sessions' && key !== 'events') ||
      !Array.isArray(obj.sessions) ||
      !Array.isArray(obj.events) ||
      obj.sessions.length > 50 ||
      obj.events.length > 50 ||
      obj.sessions.length + obj.events.length === 0
    ) {
      throw new BadRequestException('batch.invalid_envelope');
    }

    const sessions: ActivitySessionV1[] = [];
    const events: ActivityEventV1[] = [];
    const seenSessions = new Set<string>();
    const seenEvents = new Set<string>();
    for (const raw of obj.sessions) {
      const result = validateActivitySession(raw);
      if (!result.ok) throw new BadRequestException('batch.invalid_session');
      if (seenSessions.has(result.session.play_session_id)) {
        throw new BadRequestException('batch.duplicate_session_id');
      }
      seenSessions.add(result.session.play_session_id);
      sessions.push(result.session);
    }
    for (const raw of obj.events) {
      const result = validateActivityEvent(raw);
      if (!result.ok) throw new BadRequestException('batch.invalid_event');
      if (seenEvents.has(result.event.event_id)) {
        throw new BadRequestException('batch.duplicate_event_id');
      }
      seenEvents.add(result.event.event_id);
      if (
        (PARENT_ONLY_EVENT_TYPES as readonly string[]).includes(result.event.event_type)
        && result.event.play_session_id !== undefined
      ) {
        throw new BadRequestException('batch.parent_event_has_session');
      }
      events.push(result.event);
    }
    return { sessions, events };
  }
}

/** Stable canonical JSON, including nested key ordering; arrays preserve order. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b, 'en'));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
}

/** Same-event replay fingerprint; excludes mutable server-side arrival metadata. */
export function eventFingerprint(event: ActivityEventV1): string {
  return createHash('sha256').update(canonicalJson(event), 'utf8').digest('hex');
}
