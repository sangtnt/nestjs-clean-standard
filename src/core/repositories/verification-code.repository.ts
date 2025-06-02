import { VerificationCodeEntity } from '../entities/verification-code.entity';

export interface IVerificationCodeRepository {
  saveVerificationCode(entity: VerificationCodeEntity, ttl?: number): Promise<void>;
  getVerificationCode(id: string): Promise<VerificationCodeEntity | null>;
  deleteVerificationCode(id: string): Promise<void>;
  updateVerificationCodeAttempts(id: string, attempts: number): Promise<void>;
}
