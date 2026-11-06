import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveDatabaseDeviceId } from './device-registration.util';

export type DeviceActiveChildBinding = {
  device_id: string;
  installation_id: string;
  child_id: string | null;
  binding_revision: number;
  updated_at: string;
};

export type DeviceActiveChildSetRequest = {
  child_id: string | null;
  expected_binding_revision: number;
};

@Injectable()
export class DeviceActiveChildService {
  constructor(private readonly prisma: PrismaService) {}

  private async scopedDeviceIdFor(
    installationId: string,
    parentId: string,
    db: Prisma.TransactionClient | PrismaService['db'],
  ): Promise<string> {
    const legacy = await db.device.findUnique({
      where: { id: installationId },
      select: { parentId: true },
    });
    return resolveDatabaseDeviceId(
      installationId,
      parentId,
      legacy?.parentId,
    );
  }

  async get(
    parentId: string,
    installationId: string,
  ): Promise<DeviceActiveChildBinding> {
    const deviceId = await this.scopedDeviceIdFor(
      installationId,
      parentId,
      this.prisma.db,
    );
    const device = await this.prisma.db.device.findFirst({
      where: { id: deviceId, parentId, revokedAt: null },
      select: {
        id: true,
        childId: true,
        bindingRevision: true,
        updatedAt: true,
      },
    });
    if (!device) {
      throw new NotFoundException('Device not registered');
    }
    return this.toBinding(installationId, device);
  }

  async set(
    parentId: string,
    installationId: string,
    childId: string | null,
    expectedBindingRevision: number,
  ): Promise<DeviceActiveChildBinding> {
    return this.prisma.db.$transaction(async (tx) => {
      const deviceId = await this.scopedDeviceIdFor(
        installationId,
        parentId,
        tx,
      );
      const locked = await tx.$queryRaw<
        Array<{ id: string; binding_revision: number }>
      >`
        SELECT id, binding_revision FROM devices
        WHERE id = ${deviceId}::uuid
          AND parent_id = ${parentId}::uuid
          AND revoked_at IS NULL
        FOR UPDATE
      `;
      if (locked.length === 0) {
        throw new NotFoundException('Device not registered');
      }
      const currentRevision = Number(locked[0]?.binding_revision ?? 0);
      if (currentRevision !== expectedBindingRevision) {
        throw new ConflictException('Stale device active-child binding revision');
      }
      if (childId !== null) {
        const child = await tx.childProfile.findFirst({
          where: {
            id: childId,
            parentId,
            deletedAt: null,
            parent: { lifecycle: 'active', deletedAt: null },
          },
          select: { id: true },
        });
        if (!child) {
          throw new NotFoundException('Child profile not found');
        }
      }
      const updated = await tx.device.update({
        where: { id: deviceId, bindingRevision: expectedBindingRevision },
        data: {
          childId,
          lastSeenAt: new Date(),
          bindingRevision: expectedBindingRevision + 1,
        },
        select: {
          id: true,
          childId: true,
          bindingRevision: true,
          updatedAt: true,
        },
      });
      return this.toBinding(installationId, updated);
    });
  }

  parseSetRequest(body: unknown): DeviceActiveChildSetRequest {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Invalid request body');
    }
    const record = body as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(record, 'child_id')) {
      throw new BadRequestException('child_id is required');
    }
    if (!Object.prototype.hasOwnProperty.call(record, 'expected_binding_revision')) {
      throw new BadRequestException('expected_binding_revision is required');
    }
    const childId = record.child_id;
    if (childId !== null && typeof childId !== 'string') {
      throw new BadRequestException('Invalid child_id');
    }
    const revision = record.expected_binding_revision;
    if (
      typeof revision !== 'number' ||
      !Number.isInteger(revision) ||
      revision < 0
    ) {
      throw new BadRequestException('Invalid expected_binding_revision');
    }
    return {
      child_id: childId as string | null,
      expected_binding_revision: revision,
    };
  }

  /** @deprecated use parseSetRequest */
  parseChildId(body: unknown): string | null {
    return this.parseSetRequest(body).child_id;
  }

  private toBinding(
    installationId: string,
    device: {
      id: string;
      childId: string | null;
      bindingRevision: number;
      updatedAt: Date;
    },
  ): DeviceActiveChildBinding {
    return {
      device_id: device.id,
      installation_id: installationId,
      child_id: device.childId,
      binding_revision: device.bindingRevision,
      updated_at: device.updatedAt.toISOString(),
    };
  }
}
