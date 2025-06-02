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
import { AppConfig } from './configs/app.config';
import { appConfig } from './shared/constants/config.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(AppLogger);
  const configService = app.get(ConfigService);

  try {
    logAppEnv(logger, configService);
    configure(app, logger, configService);
    logAppPath(logger, configService);
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

function configure(app: INestApplication, logger: Logger, configService: ConfigService): void {
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
    new TimeoutInterceptor(reflector, configService.get<AppConfig>(appConfig)?.timeout || 30000),
  );

  app.enableShutdownHooks(
    Object.values(ShutdownSignal).filter((x) => x !== ShutdownSignal.SIGUSR2),
  );
}

function logAppPath(logger: LoggerService, configService: ConfigService): void {
  const env = configService.get<AppConfig>(appConfig)?.appEnvironment;
  const host = configService.get<AppConfig>(appConfig)?.appHost || 'localhost';
  const grpcPort = configService.get<AppConfig>(appConfig)?.grpcPort || '8000';

  if (env !== 'local') {
    logger.log(`Server gRPC ready at grpcs://${host}:${grpcPort}`);
  } else {
    logger.log(`Server gRPC ready at grpc://${host}:${grpcPort}`);
  }
}

function logAppEnv(logger: LoggerService, configService: ConfigService): void {
  logger.log(
    `Environment: ${configService.get<AppConfig>(appConfig)?.appEnvironment?.toUpperCase()}`,
  );
}

void bootstrap();
