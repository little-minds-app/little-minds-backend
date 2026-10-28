import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import {
  SignJWT,
  generateKeyPair,
  importPKCS8,
  importSPKI,
  jwtVerify,
  type KeyLike,
} from 'jose';
import type { AppEnv } from '../../../config/env.validation';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  DEFAULT_JWT_AUDIENCE,
  DEFAULT_JWT_ISSUER,
  JWT_ALG,
  JWT_CLOCK_SKEW_SECONDS,
} from './session.constants';

export type AccessTokenClaims = {
  sub: string;
  sid: string;
  jti: string;
  token_use: 'access';
};

/**
 * Ed25519 access JWT helper (ADR-019).
 * Uses jose@4 (CJS-compatible) so Jest can load the package without ESM interop.
 */
@Injectable()
export class JwtAccessService implements OnModuleInit {
  private privateKey!: KeyLike;
  private publicKey!: KeyLike;
  private previousPublicKey: KeyLike | null = null;
  private kid!: string;
  private previousKid: string | null = null;
  private issuer!: string;
  private audience!: string;

  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  async onModuleInit(): Promise<void> {
    const appEnv = this.config.get('APP_ENV', { infer: true });
    const privatePem = this.config.get('JWT_ACCESS_PRIVATE_KEY_PEM', {
      infer: true,
    });
    const publicPem = this.config.get('JWT_ACCESS_PUBLIC_KEY_PEM', {
      infer: true,
    });
    this.issuer =
      this.config.get('JWT_ISSUER', { infer: true }) ?? DEFAULT_JWT_ISSUER;
    this.audience =
      this.config.get('JWT_AUDIENCE', { infer: true }) ?? DEFAULT_JWT_AUDIENCE;
    this.kid = this.config.get('JWT_KEY_ID', { infer: true }) ?? 'local-dev';
    this.previousKid =
      this.config.get('JWT_PREVIOUS_KEY_ID', { infer: true }) ?? null;

    if (privatePem && publicPem) {
      this.privateKey = await importPKCS8(privatePem, JWT_ALG);
      this.publicKey = await importSPKI(publicPem, JWT_ALG);
    } else if (appEnv === 'development') {
      const pair = await generateKeyPair(JWT_ALG, { extractable: true });
      this.privateKey = pair.privateKey;
      this.publicKey = pair.publicKey;
    } else {
      throw new Error(
        'Environment validation failed: JWT_ACCESS_PRIVATE_KEY_PEM and JWT_ACCESS_PUBLIC_KEY_PEM are required when APP_ENV is staging or production',
      );
    }

    const previousPem = this.config.get('JWT_PREVIOUS_PUBLIC_KEY_PEM', {
      infer: true,
    });
    if (previousPem) {
      this.previousPublicKey = await importSPKI(previousPem, JWT_ALG);
    }
  }

  async signAccessToken(input: {
    parentId: string;
    sessionId: string;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({
      token_use: 'access',
      sid: input.sessionId,
    })
      .setProtectedHeader({ alg: JWT_ALG, typ: 'JWT', kid: this.kid })
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setSubject(input.parentId)
      .setJti(randomUUID())
      .setIssuedAt(now)
      .setExpirationTime(now + ACCESS_TOKEN_TTL_SECONDS)
      .sign(this.privateKey);
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const keys: KeyLike[] = [this.publicKey];
    if (this.previousPublicKey) {
      keys.push(this.previousPublicKey);
    }

    let lastError: unknown;
    for (const key of keys) {
      try {
        const { payload } = await jwtVerify(token, key, {
          issuer: this.issuer,
          audience: this.audience,
          algorithms: [JWT_ALG],
          clockTolerance: JWT_CLOCK_SKEW_SECONDS,
        });
        if (payload.token_use !== 'access') {
          throw new Error('invalid token_use');
        }
        if (typeof payload.sub !== 'string' || !payload.sub) {
          throw new Error('missing sub');
        }
        if (typeof payload.sid !== 'string' || !payload.sid) {
          throw new Error('missing sid');
        }
        if (typeof payload.jti !== 'string' || !payload.jti) {
          throw new Error('missing jti');
        }
        return {
          sub: payload.sub,
          sid: payload.sid,
          jti: payload.jti,
          token_use: 'access',
        };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('invalid_token');
  }
}
