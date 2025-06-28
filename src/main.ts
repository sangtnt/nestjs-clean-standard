import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, LoggerService, ShutdownSignal, ValidationPipe } from '@nestjs/common';
import {
  CatchEverythingFilter,
  CatchValidationFilter,
  DefaultRpcExceptionFilter,
} from './shared/filters/rpc-exception.filter';
import { Logger as AppLogger, Logger } from './shared/logger/services/app-logger.service';
import { GrpcRequestLoggingInterceptor } from './shared/logger/interceptors/grpc-request-logging.interceptor';
import { ClsService } from 'nestjs-cls';
import { NestExpressApplication } from '@nestjs/platform-express';
import { grpcOptions } from './configs/grpc.config';
import { TimeoutInterceptor } from './shared/interceptors/time-out.interceptor';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from './shared/interfaces/env-schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(AppLogger);
  const configService = app.get(ConfigService<EnvSchema>);

  try {
    logAppEnv(logger, configService);
    configure(app, logger, configService);
    await startEvent(app, configService);
    await app.listen(configService.get<number>('APP_PORT')!);
    logAppPath(logger, configService);
  } catch (error) {
    const stack = error instanceof Error ? error.stack : '';
    logger.error(`Error starting server, ${error}`, stack, 'Bootstrap');
    process.exit();
  }
}

async function startEvent(
  app: INestApplication,
  configService: ConfigService<EnvSchema>,
): Promise<void> {
  app.connectMicroservice(grpcOptions(configService), {
    inheritAppConfig: true,
  });

  await app.startAllMicroservices();
}

function configure(
  app: INestApplication,
  logger: Logger,
  configService: ConfigService<EnvSchema>,
): void {
  const cls = app.get(ClsService);
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(
    new CatchEverythingFilter(),
    new DefaultRpcExceptionFilter(),
    new CatchValidationFilter(),
  );
  app.useLogger(logger);
  app.useGlobalInterceptors(
    new GrpcRequestLoggingInterceptor(cls, reflector),
    new TimeoutInterceptor(reflector, configService.get<number>('TIMEOUT')!),
  );

  app.enableShutdownHooks(
    Object.values(ShutdownSignal).filter((x) => x !== ShutdownSignal.SIGUSR2),
  );
}

function logAppPath(logger: LoggerService, configService: ConfigService<EnvSchema>): void {
  const env = configService.get<string>('NODE_ENV')!;
  const host = configService.get<string>('HOST')!;
  const grpcPort = configService.get<string>('GRPC_PORT')!;

  if (env !== 'local') {
    logger.log(`Server gRPC ready at grpcs://${host}:${grpcPort}`);
  } else {
    logger.log(`Server gRPC ready at grpc://${host}:${grpcPort}`);
  }
}

function logAppEnv(logger: LoggerService, configService: ConfigService<EnvSchema>): void {
  logger.log(`Environment: ${configService.get<string>('NODE_ENV')!.toUpperCase()}`);
}

void bootstrap();
