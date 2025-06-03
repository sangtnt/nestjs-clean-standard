import { Module } from '@nestjs/common';
import { PresentationModule } from './presentation/presentation.module';
import { LoggerModule } from './shared/logger/logger.module';
import { loggerOptions } from './configs/logger.config';

@Module({
  imports: [LoggerModule.forRoot(loggerOptions()), PresentationModule],
})
export class AppModule {}
