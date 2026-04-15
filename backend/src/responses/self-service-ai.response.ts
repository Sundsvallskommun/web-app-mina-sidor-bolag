import {
  SessionRequest as ISessionRequest,
  SessionResponse as ISessionResponse,
  Assistant as IAssistant,
  File as IFile,
  Metadata as IMetadata,
  Model as IModel,
  QuestionResponse as IQuestionResponse,
  Reference as IReference,
  Tools as ITools,
  SessionStatusResponse as ISessionStatusResponse,
} from '@/data-contracts/selfserviceai/data-contracts';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsBoolean, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponse } from '@services/api.service';

export class SessionRequest implements ISessionRequest {
  @IsString()
  partyId: string;
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  customerEngagementOrgIds: string[];
}

export class SessionResponse implements ISessionResponse {
  @IsString()
  @IsOptional()
  assistantId?: string;
  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class Assistant implements IAssistant {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  handle?: string;
}

export class File implements IFile {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  mimeType?: string;
  @IsInt()
  @IsOptional()
  size?: number;
  @IsString()
  @IsOptional()
  createdAt?: string;
  @IsString()
  @IsOptional()
  updatedAt?: string;
  @IsString()
  @IsOptional()
  transcription?: string;
}

export class Metadata implements IMetadata {
  @IsString()
  @IsOptional()
  embeddingModelId?: string;
  @IsString()
  @IsOptional()
  url?: string;
  @IsString()
  @IsOptional()
  title?: string;
  @IsInt()
  @IsOptional()
  size?: number;
}

export class Model implements IModel {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  nickname?: string;
  @IsString()
  @IsOptional()
  family?: string;
  @IsInt()
  @IsOptional()
  tokenLimit?: number;
  @IsBoolean()
  @IsOptional()
  deprecated?: boolean;
  @IsInt()
  @IsOptional()
  nrBillionParameters?: number;
  @IsString()
  @IsOptional()
  hfLink?: string;
  @IsString()
  @IsOptional()
  stability?: string;
  @IsString()
  @IsOptional()
  hosting?: string;
  @IsBoolean()
  @IsOptional()
  openSource?: boolean;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  deploymentName?: string;
  @IsString()
  @IsOptional()
  org?: string;
  @IsBoolean()
  @IsOptional()
  vision?: boolean;
  @IsBoolean()
  @IsOptional()
  reasoning?: boolean;
  @IsString()
  @IsOptional()
  baseUrl?: string;
  @IsBoolean()
  @IsOptional()
  orgEnabled?: boolean;
  @IsBoolean()
  @IsOptional()
  orgDefault?: boolean;
  @IsString()
  @IsOptional()
  createdAt?: string;
  @IsString()
  @IsOptional()
  updatedAt?: string;
}

export class Tools implements ITools {
  @ValidateNested()
  @Type(() => Assistant)
  assistants?: Assistant[];
}

export class QuestionResponse implements IQuestionResponse {
  @IsString()
  @IsOptional()
  sessionId?: string;
  @IsString()
  @IsOptional()
  question?: string;
  @IsString()
  @IsOptional()
  answer?: string;
  @ValidateNested()
  @Type(() => File)
  files?: File[];
  @ValidateNested()
  @Type(() => Reference)
  references?: Reference[];
  @ValidateNested()
  @Type(() => Model)
  model?: Model;
  @ValidateNested()
  @Type(() => Tools)
  tools?: Tools;
}

export class Reference implements IReference {
  @IsString()
  @IsOptional()
  id?: string;
  @ValidateNested()
  @Type(() => Metadata)
  metadata?: Metadata;
  @IsString()
  @IsOptional()
  groupId?: string;
  @IsString()
  @IsOptional()
  websiteId?: string;
  @IsString()
  @IsOptional()
  createdAt?: string;
  @IsString()
  @IsOptional()
  updatedAt?: string;
  @IsString()
  @IsOptional()
  score?: number;
}

export enum SessionStatusResponseStatusEnum {
  PENDING = 'PENDING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export class SessionStatusResponse implements ISessionStatusResponse {
  @IsEnum(SessionStatusResponseStatusEnum)
  status?: SessionStatusResponseStatusEnum;
  @IsOptional()
  @IsString()
  detail?: string;
}

export class SessionStatusApiResponse implements ApiResponse<SessionStatusResponse> {
  @ValidateNested()
  @Type(() => SessionStatusResponse)
  data: SessionStatusResponse;
  @IsString()
  message: string;
}
