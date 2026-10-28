import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { RecentErrorsStore } from './recent-errors.store';
import { RequestIdMiddleware } from './request-id.middleware';
import { StructuredLogger } from './structured-logger';

@Global()
@Module({
  providers: [
    StructuredLogger,
    RecentErrorsStore,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [StructuredLogger, RecentErrorsStore],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
