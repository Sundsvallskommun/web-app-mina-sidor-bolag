import {
  ModelId as IModelId,
  UseTools as IUseTools,
  ConversationRequest as IConversationRequest,
  ToolAssistant as IToolAssistant,
} from '@/data-contracts/eneo-sundsvall/data-contracts';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ModelId implements IModelId {
  @IsString()
  id: string;
}

export class UseTools implements IUseTools {
  @ValidateNested()
  @Type(() => ToolAssistant)
  assistants: ToolAssistant[];
}

export class ToolAssistant implements IToolAssistant {
  @IsString()
  id: string;
  @IsString()
  handle: string;
}

export class ConversationRequest implements IConversationRequest {
  @IsString()
  question: string;
  @IsString()
  session_id?: string | null;
  @IsString()
  assistant_id?: string | null;
  @IsString()
  @IsOptional()
  group_chat_id?: string | null;
  @ValidateNested()
  @Type(() => ModelId)
  @IsOptional()
  files?: ModelId[];
  @IsBoolean()
  stream?: boolean;
  @ValidateNested()
  @Type(() => UseTools)
  @IsOptional()
  tools?: UseTools | null;
  @IsBoolean()
  @IsOptional()
  use_web_search?: boolean;
}
