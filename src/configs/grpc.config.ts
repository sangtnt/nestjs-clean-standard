import { ServerCredentials } from '@grpc/grpc-js';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { readFile } from '@/shared/utils/file.util';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '@/shared/interfaces/env-schema';
import { NGENZA_AUTH_AUTH_V1_PACKAGE_NAME } from '@ngenza-protobuf/ngenza-auth/ngenza_auth/auth/v1/auth';
import { NGENZA_AUTH_USER_V1_PACKAGE_NAME } from '@ngenza-protobuf/ngenza-auth/ngenza_auth/user/v1/user';

export const grpcOptions = (configService: ConfigService<EnvSchema>): GrpcOptions => ({
  transport: Transport.GRPC,
  options: {
    package: [NGENZA_AUTH_AUTH_V1_PACKAGE_NAME, NGENZA_AUTH_USER_V1_PACKAGE_NAME],
    protoPath: ['ngenza_auth/auth/v1/auth.proto', 'ngenza_auth/user/v1/user.proto'],
    url: `${configService.get('HOST')}:${configService.get('GRPC_PORT')}`,
    loader: {
      keepCase: false,
      includeDirs: [join(__dirname, '../..', 'node_modules/@ngenza-protobuf/ngenza-auth/proto')],
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
