import { IsArray, IsNumber, IsString } from 'class-validator';

export class BFUSApiResponse {
  @IsString()
  message: string;
  @IsNumber()
  @IsArray()
  customerIds: number[];
}
