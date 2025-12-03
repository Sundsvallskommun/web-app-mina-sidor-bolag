import { IsString } from 'class-validator';

export class BFUSApiResponse {
  @IsString()
  message: string;
  @IsString()
  customerCode: string;
}
