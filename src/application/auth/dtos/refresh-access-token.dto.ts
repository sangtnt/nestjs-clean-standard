import { IsString } from 'class-validator';

export class RefreshAccessTokenRequestDto {
  @IsString()
  token: string;

  @IsString()
  userId: string;
}

export class RefreshAccessTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
