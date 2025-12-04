import { IsNumber, IsString } from 'class-validator';

export class BFUSApiResponse {
  @IsString()
  message: string;
  @IsNumber()
  customerId: number;
}
