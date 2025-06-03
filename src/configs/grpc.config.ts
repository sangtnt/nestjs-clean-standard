import { ServerCredentials } from '@grpc/grpc-js';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { readFile } from '@/shared/utils/file.util';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from './env.config';

export const grpcOptions = (configService: ConfigService<EnvSchema>): GrpcOptions => ({
  transport: Transport.GRPC,
  options: {
    package: ['auth.v1', 'user.v1'],
    protoPath: ['auth/v1/auth.proto', 'user/v1/user.proto'],
    url: `${configService.get('HOST')}:${configService.get('GRPC_PORT')}`,
    loader: {
      keepCase: false,
      includeDirs: [join(__dirname, '../..', 'src/shared/grpc/protos/auth_service')],
    },
    keepalive: {
      keepaliveTimeMs: 10 * 1000,
      keepaliveTimeoutMs: 5 * 1000,
      keepalivePermitWithoutCalls: 1,
    },
    credentials:
      configService.get('NODE_ENV') !== 'local'
        ? ServerCredentials.createSsl(
            readFile('ssl/ca.crt'),
            [
              {
                private_key: readFile('ssl/server.key'),
                cert_chain: readFile('ssl/server.crt'),
              },
            ],
            true,
          )
        : undefined,
  },
});
