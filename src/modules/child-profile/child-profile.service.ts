import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(parentId: string, input: { age_months?: unknown; reference_date?: unknown; nickname?: unknown; timezone?: unknown }) {
    const age = input?.age_months;
    if (typeof age !== 'number' || !Number.isSafeInteger(age) || age < 0 || age > 215) {
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
    const parent = await this.prisma.db.parentAccount.findFirst({
      where: { id: parentId, lifecycle: 'active', deletedAt: null }, select: { id: true },
    });
    if (!parent) throw new NotFoundException('Parent not found');
    const child = await this.prisma.db.childProfile.create({
      data: {
        parentId, ageMonthsAtReference: age,
        ageReferenceDate: new Date(`${input.reference_date}T00:00:00.000Z`),
        nicknameOptional: typeof input.nickname === 'string' ? input.nickname : null,
        timezone,
      },
      select: { id: true },
    });
    return { child_id: child.id };
  }
}
