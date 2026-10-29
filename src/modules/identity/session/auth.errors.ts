import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export type AuthErrorCode =
  | 'invalid_request'
  | 'invalid_token'
  | 'expired_token'
  | 'revoked_session'
  | 'refresh_reuse'
  | 'rate_limited'
  | 'session_limit_exceeded'
  | 'bootstrap_disabled'
  | 'database_unavailable'
  | 'otp_invalid'
  | 'otp_cooldown'
  | 'sms_unavailable'
  | 'mail_unavailable'
  /** LMP-36 — subject already bound / unlinked / race; never leaks other parent id */
  | 'identity_collision';

export function authErrorBody(
  error: AuthErrorCode,
  message: string,
): { error: AuthErrorCode; message: string } {
  return { error, message };
}

export function throwInvalidRequest(message = 'Invalid request'): never {
  throw new BadRequestException(authErrorBody('invalid_request', message));
}

export function throwUnauthorized(
  code: Extract<
    AuthErrorCode,
    'invalid_token' | 'expired_token' | 'revoked_session' | 'refresh_reuse'
  >,
  message: string,
): never {
  throw new UnauthorizedException(authErrorBody(code, message));
}

export function throwForbidden(
  code: Extract<
    AuthErrorCode,
    'session_limit_exceeded' | 'bootstrap_disabled'
  >,
  message: string,
): never {
  throw new ForbiddenException(authErrorBody(code, message));
}

export function throwNotFound(message = 'Not found'): never {
  throw new NotFoundException(authErrorBody('invalid_request', message));
}

export function throwRateLimited(): never {
  throw new HttpException(
    authErrorBody('rate_limited', 'Too many requests'),
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

export function throwOtpInvalid(message = 'Invalid or expired code'): never {
  throw new UnauthorizedException(authErrorBody('otp_invalid', message));
}

export function throwOtpCooldown(message = 'Please wait before requesting another code'): never {
  throw new HttpException(
    authErrorBody('otp_cooldown', message),
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

export function throwSmsUnavailable(message = 'SMS temporarily unavailable'): never {
  throw new HttpException(
    authErrorBody('sms_unavailable', message),
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}

export function throwMailUnavailable(
  message = 'Mail temporarily unavailable',
): never {
  throw new HttpException(
    authErrorBody('mail_unavailable', message),
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}

/** LMP-36 — halt on link collision without disclosing other family. */
export function throwIdentityCollision(
  message = 'This sign-in method cannot be linked',
): never {
  throw new HttpException(
    authErrorBody('identity_collision', message),
    HttpStatus.CONFLICT,
  );
}
