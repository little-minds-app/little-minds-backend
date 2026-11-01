import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ageBands = ['18-24', '25-34', '35-44', '45-54', '55+', 'prefer_not_to_say'];
const genders = ['woman', 'man', 'non_binary', 'self_describe', 'prefer_not_to_say'];
const occupations = ['education', 'healthcare', 'technology', 'finance_business',
  'public_service', 'retail_services', 'manufacturing_trades', 'creative_media',
  'homemaker_caregiver', 'student', 'retired', 'not_currently_employed', 'other',
  'prefer_not_to_say'];
const fields = ['first_name', 'last_name', 'age_band_optional', 'gender_optional',
  'number_of_children_optional', 'occupation_optional'] as const;
type Field = (typeof fields)[number];
type Input = Partial<Record<Field, string | number | null>>;
const empty = {
  first_name: null, last_name: null, age_band_optional: null,
  gender_optional: null, number_of_children_optional: null, occupation_optional: null,
};

@Injectable()
export class ParentProfileService {
  constructor(private readonly prisma: PrismaService, private readonly config?: ConfigService) {}

  private async active(parentId: string) {
    const parent = await this.prisma.db.parentAccount.findFirst({
      where: { id: parentId, lifecycle: 'active', deletedAt: null },
      select: { id: true },
    });
    if (!parent) throw new NotFoundException('Parent not found');
  }

  async get(parentId: string) {
    await this.active(parentId);
    const profile = await this.prisma.db.parentProfile.findUnique({ where: { parentId } });
    return profile ? {
      first_name: profile.firstName, last_name: profile.lastName,
      age_band_optional: profile.ageBandOptional, gender_optional: profile.genderOptional,
      number_of_children_optional: profile.numberOfChildrenOptional,
      occupation_optional: profile.occupationOptional,
    } : { ...empty };
  }

  private validate(input: unknown): Input {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('Invalid parent profile');
    }
    const object = input as Record<string, unknown>;
    if (!Object.keys(object).length || Object.keys(object).some((key) => !fields.includes(key as Field))) {
      throw new BadRequestException('Invalid parent profile fields');
    }
    for (const key of ['first_name', 'last_name']) {
      const value = object[key];
      if (value !== undefined && value !== null &&
        (typeof value !== 'string' || [...value.trim()].length > 100 ||
         [...value].some((character) => character.codePointAt(0)! < 32 || character.codePointAt(0) === 127))) {
        throw new BadRequestException('Invalid parent name');
      }
    }
    for (const [key, allowed] of [
      ['age_band_optional', ageBands], ['gender_optional', genders],
      ['occupation_optional', occupations],
    ] as const) {
      const value = object[key];
      if (value !== undefined && value !== null && (typeof value !== 'string' || !allowed.includes(value))) {
        throw new BadRequestException('Invalid optional category');
      }
    }
    const count = object.number_of_children_optional;
    if (count !== undefined && count !== null &&
      (typeof count !== 'number' || !Number.isInteger(count) || count < 0 || count > 30)) {
      throw new BadRequestException('Invalid household count');
    }
    const clean: Record<string, string | number | null> = {};
    for (const key of fields) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const value = object[key] as string | number | null;
        clean[key] = (key === 'first_name' || key === 'last_name') && typeof value === 'string'
          ? value.trim() || null : value;
      }
    }
    return clean as Input;
  }

  async update(parentId: string, input: unknown, transaction?: Prisma.TransactionClient) {
    const clean = this.validate(input);
    // Purpose-specific legal review of optional demographics is not complete.
    // Removals are always permitted; real-user collection is fail-closed.
    const environment = this.config?.get<string>('APP_ENV') ?? 'development';
    if ((environment === 'production' || environment === 'staging') &&
      Object.values(clean).some((value) => value !== null)) {
      throw new ServiceUnavailableException('Optional profile collection unavailable pending legal review');
    }
    const save = async (tx: Prisma.TransactionClient) => {
      const parents = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM parent_accounts WHERE id = ${parentId}::uuid
          AND lifecycle = 'active' AND deleted_at IS NULL FOR UPDATE
      `;
      if (parents.length !== 1) throw new NotFoundException('Parent not found');
      const data: Prisma.ParentProfileUncheckedUpdateInput = {
        ...(clean.first_name !== undefined ? { firstName: clean.first_name as string | null } : {}),
        ...(clean.last_name !== undefined ? { lastName: clean.last_name as string | null } : {}),
        ...(clean.age_band_optional !== undefined ? { ageBandOptional: clean.age_band_optional as string | null } : {}),
        ...(clean.gender_optional !== undefined ? { genderOptional: clean.gender_optional as string | null } : {}),
        ...(clean.number_of_children_optional !== undefined ? { numberOfChildrenOptional: clean.number_of_children_optional as number | null } : {}),
        ...(clean.occupation_optional !== undefined ? { occupationOptional: clean.occupation_optional as string | null } : {}),
      };
      const record = await tx.parentProfile.upsert({
        where: { parentId }, create: { parentId, ...data } as Prisma.ParentProfileUncheckedCreateInput, update: data,
      });
      return {
        first_name: record.firstName, last_name: record.lastName,
        age_band_optional: record.ageBandOptional, gender_optional: record.genderOptional,
        number_of_children_optional: record.numberOfChildrenOptional,
        occupation_optional: record.occupationOptional,
      };
    };
    return transaction ? save(transaction) : this.prisma.db.$transaction(save);
  }

  async clear(parentId: string, transaction?: Prisma.TransactionClient) {
    return this.update(parentId, {
      first_name: null, last_name: null, age_band_optional: null,
      gender_optional: null, number_of_children_optional: null, occupation_optional: null,
    }, transaction);
  }
}
