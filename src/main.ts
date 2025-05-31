import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  INestApplication,
  Logger,
  LoggerService,
  ShutdownSignal,
  ValidationPipe,
} from '@nestjs/common';
import {
  CatchEverythingFilter,
  CatchValidationFilter,
  DefaultRpcExceptionFilter,
} from './shared/filters/rpc-exception.filter';
import { Logger as AppLogger } from './shared/logger/services/app-logger.service';
import { GrpcRequestLoggingInterceptor } from './shared/logger/interceptors/grpc-request-logging.interceptor';
import { ClsService } from 'nestjs-cls';
import { NestExpressApplication } from '@nestjs/platform-express';
import { grpcOptions } from './configs/grpc.config';
import { TimeoutInterceptor } from './shared/interceptors/time-out.interceptor';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './configs/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  try {
    logAppEnv(logger);
    configure(app);
    logAppPath(logger);
    await startEvent(app);
  } catch (error) {
    const stack = error instanceof Error ? error.stack : '';
    logger.error(`Error starting server, ${error}`, stack, 'Bootstrap');
    process.exit();
  }
}

async function startEvent(app: INestApplication): Promise<void> {
  app.connectMicroservice(grpcOptions, {
    inheritAppConfig: true,
  });

  await app.startAllMicroservices();
}

function configure(app: INestApplication): void {
  const cls = app.get(ClsService);
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(
    new CatchEverythingFilter(),
    new DefaultRpcExceptionFilter(),
    new CatchValidationFilter(),
  );
  app.useLogger(app.get(AppLogger));
  app.useGlobalInterceptors(
    new GrpcRequestLoggingInterceptor(cls, reflector),
    new TimeoutInterceptor(
      reflector,
      app.get(ConfigService).get<AppConfig>('appConfig')?.timeout || 30000,
    ),
  );

  app.enableShutdownHooks(
    Object.values(ShutdownSignal).filter((x) => x !== ShutdownSignal.SIGUSR2),
  );
}

function logAppPath(logger: LoggerService): void {
  const env = process.env.NODE_ENV;
  const host = process.env.HOST || 'localhost';
  const grpcPort = process.env.GRPC_PORT || '8000';

  if (env !== 'local') {
    logger.log(`Server gRPC ready at grpcs://${host}:${grpcPort}`);
  } else {
    logger.log(`Server gRPC ready at grpc://${host}:${grpcPort}`);
  }
}

function logAppEnv(logger: LoggerService): void {
  logger.log(`Environment: ${process.env['NODE_ENV']?.toUpperCase()}`);
}

void bootstrap();
