import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { DevAuthController } from './controllers/dev-auth.controller';
import { ParentController } from './controllers/parent.controller';
import { ParentAuthGuard } from './auth/parent-auth.guard';
import { AuthRateLimitService } from './session/auth-rate-limit.service';
import { JwtAccessService } from './session/jwt-access.service';
import { SessionIssuerService } from './session/session-issuer.service';

/**
 * IdentityModule — parent sessions & guards (LMP-33 / ADR-019).
 * GSM OTP adapters are LMP-34 and must call SessionIssuerService.
 */
@Module({
  controllers: [AuthController, ParentController, DevAuthController],
  providers: [
    JwtAccessService,
    SessionIssuerService,
    AuthRateLimitService,
    ParentAuthGuard,
  ],
  exports: [SessionIssuerService, JwtAccessService, ParentAuthGuard],
})
export class IdentityModule {}
