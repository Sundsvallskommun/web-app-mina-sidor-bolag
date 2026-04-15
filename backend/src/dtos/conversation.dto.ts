import {
  ConversationRequest as IConversationRequest,
  ModelId as IModelId,
} from '@/data-contracts/eneo-sundsvall/data-contracts';
import { Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested, IsBoolean } from 'class-validator';

export class ModelId implements IModelId {
  @IsString()
  id: string;
}

export class ConversationRequest implements IConversationRequest {
  @IsString()
  question: string;
  @IsString()
  @IsOptional()
  session_id?: string | null;
  @IsString()
  @IsOptional()
  assistant_id?: string | null;
  @IsString()
  @IsOptional()
  group_chat_id?: string | null;
  @ValidateNested()
  @Type(() => ModelId)
  @IsOptional()
  files?: ModelId[];
  @IsBoolean()
  @IsOptional()
  stream?: boolean;
}
