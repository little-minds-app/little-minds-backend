import {
  BadRequestException,
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
  updated_at: string;
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
      select: { id: true, childId: true, updatedAt: true },
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
  ): Promise<DeviceActiveChildBinding> {
    return this.prisma.db.$transaction(async (tx) => {
      const deviceId = await this.scopedDeviceIdFor(
        installationId,
        parentId,
        tx,
      );
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM devices
        WHERE id = ${deviceId}::uuid
          AND parent_id = ${parentId}::uuid
          AND revoked_at IS NULL
        FOR UPDATE
      `;
      if (locked.length === 0) {
        throw new NotFoundException('Device not registered');
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
        where: { id: deviceId },
        data: { childId, lastSeenAt: new Date() },
        select: { id: true, childId: true, updatedAt: true },
      });
      return this.toBinding(installationId, updated);
    });
  }

  parseChildId(body: unknown): string | null {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Invalid request body');
    }
    if (!Object.prototype.hasOwnProperty.call(body, 'child_id')) {
      throw new BadRequestException('child_id is required');
    }
    const childId = (body as { child_id: unknown }).child_id;
    if (childId === null) {
      return null;
    }
    if (typeof childId !== 'string') {
      throw new BadRequestException('Invalid child_id');
    }
    return childId;
  }

  private toBinding(
    installationId: string,
    device: { id: string; childId: string | null; updatedAt: Date },
  ): DeviceActiveChildBinding {
    return {
      device_id: device.id,
      installation_id: installationId,
      child_id: device.childId,
      updated_at: device.updatedAt.toISOString(),
    };
  }
}
