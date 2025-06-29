import { Environment } from '@/shared/constants/constants';
import { LoggerModuleOptions } from '@/shared/logger/model/logger.option';
import { Level } from '@/shared/logger/utils/level';

export function getLogLevels(): Level {
  return (process.env['LOG_LEVEL'] as Level) ?? 'info';
}

export const loggerOptions = (): LoggerModuleOptions => {
  return {
    global: true,
    output: process.env['NODE_ENV'] === Environment.Local ? 'text' : 'json',
    gcpProperties: process.env['NODE_ENV'] !== Environment.Local,
    source: ![Environment.Staging, Environment.Production].includes(
      process.env.NODE_ENV as Environment,
    ),
    level: getLogLevels(),
    logFile: process.env['LOG_FILE'],
  };
};
