import { Direction, PagingAndSortingMetaData } from '@/data-contracts/myrepresentatives/data-contracts';
import { IsEnum, IsInt, IsString } from 'class-validator';

export class Meta implements PagingAndSortingMetaData {
  @IsInt()
  page?: number;
  @IsInt()
  limit?: number;
  @IsInt()
  count?: number;
  @IsInt()
  totalRecords?: number;
  @IsInt()
  totalPages?: number;
  @IsString({ each: true })
  sortBy?: string[];
  @IsEnum(Direction)
  sortDirection?: Direction;
}
