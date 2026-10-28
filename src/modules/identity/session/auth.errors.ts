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
  | 'database_unavailable';

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
