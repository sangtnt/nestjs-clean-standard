import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger as NestLogger } from '@nestjs/common';

class DatabaseLoggerService implements TypeOrmLogger {
  private readonly logger = new NestLogger('SQL');
  private readonly isSilent =
    process.env['NODE_ENV'] === 'production' || process.env['NODE_ENV'] === 'staging';

  logQuery(query: string, parameters?: unknown[]): void {
    if (!this.isSilent) {
      this.logger.log(`${query} -- Parameters: ${this.stringifyParameters(parameters)}`);
    }
  }

  logQueryError(error: string, query: string, parameters?: unknown[]): void {
    if (!this.isSilent) {
      this.logger.error(
        `${query} -- Parameters: ${this.stringifyParameters(parameters)} -- ${error}`,
      );
    } else {
      this.logger.error(error);
    }
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    if (!this.isSilent) {
      this.logger.warn(
        `Time: ${time} -- ${query} -- Parameters: ${this.stringifyParameters(parameters)}`,
      );
    } else {
      this.logger.warn(`Query Slow Time: ${time}`);
    }
  }

  logMigration(message: string): void {
    this.logger.log(message);
  }

  logSchemaBuild(message: string): void {
    this.logger.log(message);
  }

  log(level: 'log' | 'info' | 'warn', message: string): void {
    if (level === 'log' && !this.isSilent) {
      return this.logger.log(message);
    }
    if (level === 'info' && !this.isSilent) {
      return this.logger.debug(message);
    }
    if (level === 'warn') {
      return this.logger.warn(message);
    }
  }

  private stringifyParameters(parameters?: unknown[]): string {
    try {
      return JSON.stringify(parameters);
    } catch {
      return '';
    }
  }
}

export default DatabaseLoggerService;
