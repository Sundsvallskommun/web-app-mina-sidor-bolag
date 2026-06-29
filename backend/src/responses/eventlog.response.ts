import {
  Event as EventDetails,
  Metadata,
  PageEvent,
  PageableObject as IPageableObject,
  SortObject as ISortObject,
} from '@/data-contracts/eventlog/data-contracts';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNullable } from '@utils/custom-validation-classes';

export enum EventType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACCESS = 'ACCESS',
  EXECUTE = 'EXECUTE',
  CANCEL = 'CANCEL',
  DROP = 'DROP',
}

export class EventMetaData implements Metadata {
  @IsString()
  key: string;
  @IsString()
  value: string;
}

export class EventResponse implements EventDetails {
  @IsString()
  @IsOptional()
  logKey?: string;
  @IsEnum(EventType)
  type: EventType;
  @IsString()
  @IsOptional()
  municipalityId?: string;
  @IsString()
  @IsOptional()
  message: string;
  @IsDateString()
  @IsOptional()
  @IsNullable()
  expires?: string | null;
  @IsString()
  owner: string;
  @IsDateString()
  @IsOptional()
  created?: string;
  @IsString()
  @IsOptional()
  @IsNullable()
  historyReference?: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  sourceType?: string | null;
  @ValidateNested()
  @Type(() => EventMetaData)
  metadata?: EventMetaData[];
}

export class SortObject implements ISortObject {
  @IsBoolean()
  @IsOptional()
  unsorted?: boolean;
  @IsBoolean()
  @IsOptional()
  empty?: boolean;
  @IsBoolean()
  @IsOptional()
  sorted?: boolean;
}

export class PageableObject implements IPageableObject {
  @IsBoolean()
  @IsOptional()
  unpaged?: boolean;
  @IsInt()
  @IsOptional()
  offset?: number;
  @ValidateNested()
  @Type(() => SortObject)
  sort?: SortObject;
  @IsBoolean()
  @IsOptional()
  paged?: boolean;
  @IsInt()
  @IsOptional()
  pageNumber?: number;
  @IsInt()
  @IsOptional()
  pageSize?: number;
}

export class PagedEventsResponse implements PageEvent {
  @IsInt()
  @IsOptional()
  totalPages?: number;
  @IsInt()
  @IsOptional()
  totalElements?: number;
  @IsInt()
  @IsOptional()
  size?: number;
  @ValidateNested()
  @Type(() => Event)
  content?: EventResponse[];
  @IsInt()
  @IsOptional()
  number?: number;
  @ValidateNested()
  @Type(() => SortObject)
  sort?: SortObject;
  @IsBoolean()
  @IsOptional()
  first?: boolean;
  @IsBoolean()
  @IsOptional()
  last?: boolean;
  @IsInt()
  @IsOptional()
  numberOfElements?: number;
  @ValidateNested()
  @Type(() => PageableObject)
  pageable?: PageableObject;
  @IsBoolean()
  @IsOptional()
  empty?: boolean;
}
