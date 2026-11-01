import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ageMonthsOnDate } from './age-months';

function localToday(now: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now);
    const field = (name: string) => parts.find((p) => p.type === name)?.value;
    return `${field('year')}-${field('month')}-${field('day')}`;
  } catch {
    throw new BadRequestException('Invalid timezone');
  }
}

@Injectable()
export class ChildProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(parentId: string, childId: string, now = new Date()) {
    const child = await this.prisma.db.childProfile.findFirst({
      where: { id: childId, parentId, deletedAt: null, parent: { lifecycle: 'active' } },
      select: { id: true, parentId: true, nicknameOptional: true, ageMonthsAtReference: true,
        ageReferenceDate: true, preferredLocale: true, timezone: true },
    });
    if (!child) throw new NotFoundException('Child profile not found');
    const timezone = child.timezone ?? 'Europe/Istanbul';
    const reference = child.ageReferenceDate.toISOString().slice(0, 10);
    return {
      child_id: child.id, nickname: child.nicknameOptional,
      age_months: ageMonthsOnDate(child.ageMonthsAtReference, reference, localToday(now, timezone)),
      preferred_locale: child.preferredLocale,
    };
  }

  async list(parentId: string, now = new Date()) {
    const rows = await this.prisma.db.childProfile.findMany({
      where: { parentId, deletedAt: null, parent: { lifecycle: 'active', deletedAt: null } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, nicknameOptional: true, ageMonthsAtReference: true, ageReferenceDate: true,
        preferredLocale: true, timezone: true },
    });
    return { children: rows.map((child) => ({
      child_id: child.id,
      nickname: child.nicknameOptional,
      age_months: ageMonthsOnDate(child.ageMonthsAtReference, child.ageReferenceDate.toISOString().slice(0, 10),
        localToday(now, child.timezone ?? 'Europe/Istanbul')),
      preferred_locale: child.preferredLocale,
    })) };
  }

  async update(parentId: string, childId: string, input: Record<string, unknown>, transaction?: Prisma.TransactionClient) {
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).length === 0 ||
      Object.keys(input).some((key) => !['nickname', 'age_months', 'reference_date', 'timezone'].includes(key))) {
      throw new BadRequestException('Invalid profile fields');
    }
    if (input.nickname !== undefined &&
      (input.nickname !== null && (typeof input.nickname !== 'string' || input.nickname.length > 80))) {
      throw new BadRequestException('Invalid nickname');
    }
    if (input.age_months !== undefined &&
      (typeof input.age_months !== 'number' || !Number.isSafeInteger(input.age_months) ||
       input.age_months < 0 || input.age_months > 2147483647)) {
      throw new BadRequestException('Invalid approximate age');
    }
    if (input.reference_date !== undefined && typeof input.reference_date !== 'string') {
      throw new BadRequestException('Invalid reference date');
    }
    if (input.timezone !== undefined && typeof input.timezone !== 'string') {
      throw new BadRequestException('Invalid timezone');
    }
    const performUpdate = async (tx: Prisma.TransactionClient) => {
      const parents = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM parent_accounts
        WHERE id = ${parentId}::uuid AND lifecycle = 'active' AND deleted_at IS NULL FOR UPDATE
      `;
      if (parents.length !== 1) throw new NotFoundException('Child profile not found');
      const existing = await tx.childProfile.findFirst({
        where: { id: childId, parentId, deletedAt: null },
      });
      if (!existing) throw new NotFoundException('Child profile not found');
      const age = input.age_months === undefined ? existing.ageMonthsAtReference : input.age_months as number;
      const reference = input.reference_date === undefined ?
        existing.ageReferenceDate.toISOString().slice(0, 10) : input.reference_date as string;
      const timezone = input.timezone === undefined ? existing.timezone ?? 'Europe/Istanbul' : input.timezone as string;
      try { ageMonthsOnDate(age, reference, localToday(new Date(), timezone)); }
      catch { throw new BadRequestException('Invalid age reference or timezone'); }
      const updated = await tx.childProfile.update({
        where: { id: childId },
        data: {
          ...(input.nickname !== undefined ? { nicknameOptional: input.nickname as string | null } : {}),
          ...(input.age_months !== undefined ? { ageMonthsAtReference: age } : {}),
          ...(input.reference_date !== undefined ? { ageReferenceDate: new Date(reference + 'T00:00:00.000Z') } : {}),
          ...(input.timezone !== undefined ? { timezone } : {}),
        },
      });
      return { child_id: updated.id, nickname: updated.nicknameOptional,
        age_months: ageMonthsOnDate(updated.ageMonthsAtReference,
          updated.ageReferenceDate.toISOString().slice(0, 10),
          localToday(new Date(), updated.timezone ?? 'Europe/Istanbul')),
        preferred_locale: updated.preferredLocale };
    };
    return transaction ? performUpdate(transaction) : this.prisma.db.$transaction(performUpdate);
  }

  async create(parentId: string, input: { age_months?: unknown; reference_date?: unknown; nickname?: unknown; timezone?: unknown }, transaction?: Prisma.TransactionClient) {
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some((key) => !['age_months', 'reference_date', 'nickname', 'timezone'].includes(key))) {
      throw new BadRequestException('Invalid profile fields');
    }
    const age = input.age_months;
    if (typeof age !== 'number' || !Number.isSafeInteger(age) || age < 0 || age > 2147483647) {
      throw new BadRequestException('Invalid approximate age');
    }
    if (typeof input.reference_date !== 'string') throw new BadRequestException('Invalid reference date');
    const timezone = input.timezone === undefined ? 'Europe/Istanbul' : input.timezone;
    if (typeof timezone !== 'string') throw new BadRequestException('Invalid timezone');
    const today = localToday(new Date(), timezone);
    try { ageMonthsOnDate(age, input.reference_date, today); }
    catch { throw new BadRequestException('Invalid reference date'); }
    if (input.nickname !== undefined && (typeof input.nickname !== 'string' || input.nickname.length > 80)) {
      throw new BadRequestException('Invalid nickname');
    }
    // Lock the parent row until child creation commits. Account lifecycle changes
    // cannot interleave between authorization and insert.
    const createRow = async (tx: Prisma.TransactionClient) => {
      const parents = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM parent_accounts
        WHERE id = ${parentId}::uuid AND lifecycle = 'active' AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (parents.length !== 1) throw new NotFoundException('Parent not found');
      return tx.childProfile.create({
      data: {
        parentId, ageMonthsAtReference: age,
        ageReferenceDate: new Date(`${input.reference_date}T00:00:00.000Z`),
        nicknameOptional: typeof input.nickname === 'string' ? input.nickname : null,
        timezone,
      },
      select: { id: true },
      });
    };
    const child = await (transaction ? createRow(transaction) : this.prisma.db.$transaction(createRow));
    return { child_id: child.id };
  }
}
