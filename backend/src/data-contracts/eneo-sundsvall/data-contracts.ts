/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * ARQHealth
 * Parsed ARQ health metrics (clean view).
 */
export interface ARQHealth {
  /** Heartbeat Ttl Seconds */
  heartbeat_ttl_seconds?: number | null;
  /** Age Seconds */
  age_seconds?: number | null;
  /**
   * J Complete
   * @default 0
   */
  j_complete?: number;
  /**
   * J Failed
   * @default 0
   */
  j_failed?: number;
  /**
   * J Retried
   * @default 0
   */
  j_retried?: number;
  /**
   * J Ongoing
   * @default 0
   */
  j_ongoing?: number;
  /**
   * Queued
   * @default 0
   */
  queued?: number;
}

/** AcceptedFileType */
export interface AcceptedFileType {
  /** Mimetype */
  mimetype: string;
  /** Size Limit */
  size_limit: number;
}

/**
 * AccessJustificationRequest
 * Schema for creating audit access session with justification.
 */
export interface AccessJustificationRequest {
  /**
   * Category
   * Justification category
   * @minLength 1
   * @maxLength 100
   */
  category: string;
  /**
   * Description
   * Detailed access reason
   * @minLength 10
   * @maxLength 500
   */
  description: string;
}

/**
 * AccessJustificationResponse
 * Schema for access session creation response.
 */
export interface AccessJustificationResponse {
  /**
   * Status
   * Status of session creation
   * @default "session_created"
   */
  status?: string;
  /**
   * Message
   * Additional message if needed
   */
  message?: string | null;
}

/** AccessToken */
export interface AccessToken {
  /** Access Token */
  access_token: string;
  /** Token Type */
  token_type: string;
}

/**
 * ActionConfig
 * Configuration for a single action type with metadata for UI display.
 * @example {"action":"user_created","category":"admin_actions","description_sv":"Loggar när en ny användare skapas","enabled":true,"name_sv":"Användare skapad"}
 */
export interface ActionConfig {
  /**
   * Action
   * Action type value (e.g., 'user_created')
   */
  action: string;
  /**
   * Enabled
   * Whether this action is currently enabled
   */
  enabled: boolean;
  /**
   * Category
   * Category this action belongs to
   */
  category: string;
  /**
   * Name Sv
   * Swedish display name
   */
  name_sv: string;
  /**
   * Description Sv
   * Swedish description
   */
  description_sv: string;
}

/**
 * ActionConfigResponse
 * Response model for GET /api/v1/audit/config/actions.
 * Contains all 65 actions with their configuration and metadata.
 * @example {"actions":[{"action":"user_created","category":"admin_actions","description_sv":"Loggar när en ny användare skapas","enabled":true,"name_sv":"Användare skapad"},{"action":"user_deleted","category":"admin_actions","description_sv":"Loggar när en användare tas bort","enabled":false,"name_sv":"Användare raderad"}]}
 */
export interface ActionConfigResponse {
  /**
   * Actions
   * List of all actions with configuration and Swedish metadata
   */
  actions: ActionConfig[];
}

/**
 * ActionConfigUpdateRequest
 * Request model for PATCH /api/v1/audit/config/actions.
 * Allows bulk updates of multiple action overrides.
 * @example {"updates":[{"action":"user_created","enabled":false},{"action":"user_deleted","enabled":false}]}
 */
export interface ActionConfigUpdateRequest {
  /**
   * Updates
   * List of action configuration updates
   * @maxItems 65
   * @minItems 1
   */
  updates: ActionUpdate[];
}

/**
 * ActionType
 * Standardized vocabulary of auditable actions
 */
export enum ActionType {
  UserCreated = 'user_created',
  UserDeleted = 'user_deleted',
  UserUpdated = 'user_updated',
  RoleCreated = 'role_created',
  RoleModified = 'role_modified',
  RoleDeleted = 'role_deleted',
  PermissionChanged = 'permission_changed',
  TenantSettingsUpdated = 'tenant_settings_updated',
  CredentialsUpdated = 'credentials_updated',
  FederationUpdated = 'federation_updated',
  ApiKeyGenerated = 'api_key_generated',
  ModuleAdded = 'module_added',
  ModuleAddedToTenant = 'module_added_to_tenant',
  AssistantCreated = 'assistant_created',
  AssistantDeleted = 'assistant_deleted',
  AssistantUpdated = 'assistant_updated',
  AssistantTransferred = 'assistant_transferred',
  AssistantPublished = 'assistant_published',
  SpaceCreated = 'space_created',
  SpaceUpdated = 'space_updated',
  SpaceDeleted = 'space_deleted',
  SpaceMemberAdded = 'space_member_added',
  SpaceMemberRemoved = 'space_member_removed',
  AppCreated = 'app_created',
  AppDeleted = 'app_deleted',
  AppUpdated = 'app_updated',
  AppExecuted = 'app_executed',
  AppPublished = 'app_published',
  AppRunDeleted = 'app_run_deleted',
  SessionStarted = 'session_started',
  SessionEnded = 'session_ended',
  FileUploaded = 'file_uploaded',
  FileDeleted = 'file_deleted',
  WebsiteCreated = 'website_created',
  WebsiteUpdated = 'website_updated',
  WebsiteDeleted = 'website_deleted',
  WebsiteCrawled = 'website_crawled',
  WebsiteTransferred = 'website_transferred',
  GroupChatCreated = 'group_chat_created',
  CollectionCreated = 'collection_created',
  CollectionUpdated = 'collection_updated',
  CollectionDeleted = 'collection_deleted',
  IntegrationAdded = 'integration_added',
  IntegrationRemoved = 'integration_removed',
  IntegrationConnected = 'integration_connected',
  IntegrationDisconnected = 'integration_disconnected',
  IntegrationKnowledgeCreated = 'integration_knowledge_created',
  IntegrationKnowledgeDeleted = 'integration_knowledge_deleted',
  IntegrationKnowledgeSynced = 'integration_knowledge_synced',
  CompletionModelUpdated = 'completion_model_updated',
  EmbeddingModelUpdated = 'embedding_model_updated',
  TranscriptionModelUpdated = 'transcription_model_updated',
  TemplateCreated = 'template_created',
  TemplateUpdated = 'template_updated',
  TemplateDeleted = 'template_deleted',
  SecurityClassificationCreated = 'security_classification_created',
  SecurityClassificationUpdated = 'security_classification_updated',
  SecurityClassificationDeleted = 'security_classification_deleted',
  SecurityClassificationLevelsUpdated = 'security_classification_levels_updated',
  SecurityClassificationEnabled = 'security_classification_enabled',
  SecurityClassificationDisabled = 'security_classification_disabled',
  McpServerCreated = 'mcp_server_created',
  McpServerUpdated = 'mcp_server_updated',
  McpServerDeleted = 'mcp_server_deleted',
  McpServerEnabled = 'mcp_server_enabled',
  McpServerDisabled = 'mcp_server_disabled',
  McpServerToolEnabled = 'mcp_server_tool_enabled',
  McpServerToolDisabled = 'mcp_server_tool_disabled',
  RetentionPolicyApplied = 'retention_policy_applied',
  EncryptionKeyRotated = 'encryption_key_rotated',
  SystemMaintenance = 'system_maintenance',
  AuditSessionCreated = 'audit_session_created',
  AuditLogViewed = 'audit_log_viewed',
  AuditLogExported = 'audit_log_exported',
}

/**
 * ActionUpdate
 * Represents an action-level configuration change request.
 * @example {"action":"user_created","enabled":false}
 */
export interface ActionUpdate {
  /**
   * Action
   * Action name to update
   */
  action: string;
  /**
   * Enabled
   * New enabled state
   */
  enabled: boolean;
}

/**
 * ActorType
 * Categorize who performed the action
 */
export enum ActorType {
  User = 'user',
  System = 'system',
  ApiKey = 'api_key',
}

/** AddSpaceGroupMemberRequest */
export interface AddSpaceGroupMemberRequest {
  /**
   * Id
   * @format uuid
   */
  id: string;
  role: SpaceRoleValue;
}

/** AddSpaceMemberRequest */
export interface AddSpaceMemberRequest {
  /**
   * Id
   * @format uuid
   */
  id: string;
  role: SpaceRoleValue;
}

/** AdditionalField */
export interface AdditionalField {
  type: WizardType;
  /** Value */
  value: Record<string, string>[];
}

/** AllowedOriginCreate */
export interface AllowedOriginCreate {
  /** Url */
  url: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
}

/** AllowedOriginInDB */
export interface AllowedOriginInDB {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Url */
  url: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
}

/** AllowedOriginPublic */
export interface AllowedOriginPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Url */
  url: string;
}

/** AnalysisJobStatus */
export enum AnalysisJobStatus {
  Queued = 'queued',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

/** AnalysisJobStatusResponse */
export interface AnalysisJobStatusResponse {
  /**
   * Job Id
   * @format uuid
   */
  job_id: string;
  status: AnalysisJobStatus;
  /** Answer */
  answer?: string | null;
  /** Error */
  error?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** AnalysisProcessingMode */
export enum AnalysisProcessingMode {
  Sync = 'sync',
  Auto = 'auto',
}

/** ApiKey */
export interface ApiKey {
  /** Truncated Key */
  truncated_key: string;
  /** Key */
  key: string;
}

/** ApiKeyInDB */
export interface ApiKeyInDB {
  /** Truncated Key */
  truncated_key: string;
  /** Key */
  key: string;
  /** User Id */
  user_id: string | null;
  /** Assistant Id */
  assistant_id: string | null;
}

/** AppInTemplatePublic */
export interface AppInTemplatePublic {
  /** Name */
  name: string;
  completion_model: CompletionModelPublicAppTemplate | null;
  /** Completion Model Kwargs */
  completion_model_kwargs: Record<string, any>;
  prompt: PromptPublicAppTemplate | null;
  /** Input Description */
  input_description: string | null;
  /** Input Type */
  input_type: string;
}

/** AppPublic */
export interface AppPublic {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Input Fields */
  input_fields: InputFieldPublic[];
  /** Attachments */
  attachments: FilePublic[];
  prompt: PromptPublic | null;
  completion_model?: CompletionModelSparse | null;
  completion_model_kwargs: ModelKwargs;
  allowed_attachments: FileRestrictions;
  /** Published */
  published: boolean;
  transcription_model?: TranscriptionModelPublic | null;
  /** Data Retention Days */
  data_retention_days?: number | null;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
}

/** AppRunInput */
export interface AppRunInput {
  /** Files */
  files: FilePublic[];
  /** Text */
  text: string | null;
}

/** AppRunPublic */
export interface AppRunPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  input: AppRunInput;
  status: Status;
  /** Finished At */
  finished_at: string | null;
  user: UserSparse;
  /** Output */
  output: string | null;
}

/** AppRunSparse */
export interface AppRunSparse {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  input: AppRunInput;
  status: Status;
  /** Finished At */
  finished_at: string | null;
  user: UserSparse;
}

/** AppSparse */
export interface AppSparse {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Published */
  published: boolean;
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
}

/**
 * AppTemplateAdminCreate
 * Admin template creation request.
 */
export interface AppTemplateAdminCreate {
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Category */
  category: string;
  /** Prompt */
  prompt?: string | null;
  /** Completion Model Kwargs */
  completion_model_kwargs?: Record<string, any>;
  wizard?: AppTemplateWizard | null;
  /** Input Type */
  input_type: string;
  /** Input Description */
  input_description?: string | null;
  /** Icon Name */
  icon_name?: string | null;
}

/**
 * AppTemplateAdminListPublic
 * Admin list response.
 */
export interface AppTemplateAdminListPublic {
  /** Items */
  items: AppTemplateAdminPublic[];
  /** Count */
  count: number;
}

/**
 * AppTemplateAdminPublic
 * Admin view of template with tenant fields.
 */
export interface AppTemplateAdminPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
  /** Prompt Text */
  prompt_text?: string | null;
  /** Completion Model Kwargs */
  completion_model_kwargs?: Record<string, any>;
  /** Completion Model Id */
  completion_model_id?: string | null;
  /** Completion Model Name */
  completion_model_name?: string | null;
  wizard?: AppTemplateWizard | null;
  /** Input Type */
  input_type: string;
  /** Input Description */
  input_description?: string | null;
  /** Organization */
  organization: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Deleted At */
  deleted_at?: string | null;
  /** Deleted By User Id */
  deleted_by_user_id?: string | null;
  /** Restored At */
  restored_at?: string | null;
  /** Restored By User Id */
  restored_by_user_id?: string | null;
  /** Original Snapshot */
  original_snapshot?: Record<string, any> | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Usage Count
   * @default 0
   */
  usage_count?: number;
  /**
   * Is Default
   * @default false
   */
  is_default?: boolean;
  /** Icon Name */
  icon_name?: string | null;
}

/**
 * AppTemplateAdminUpdate
 * Admin template update request (PATCH semantics).
 */
export interface AppTemplateAdminUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Category */
  category?: string | null;
  /** Prompt */
  prompt?: string | null;
  /** Completion Model Kwargs */
  completion_model_kwargs?: Record<string, any> | null;
  /** Completion Model Id */
  completion_model_id?: string | null;
  wizard?: AppTemplateWizard | null;
  /** Input Type */
  input_type?: string | null;
  /** Input Description */
  input_description?: string | null;
  /** Icon Name */
  icon_name?: string | null;
}

/** AppTemplateListPublic */
export interface AppTemplateListPublic {
  /** Items */
  items: AppTemplatePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** AppTemplateOrganization */
export interface AppTemplateOrganization {
  /** Name */
  name: string;
}

/** AppTemplatePublic */
export interface AppTemplatePublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Category */
  category: string;
  app: AppInTemplatePublic;
  /** Type */
  type: 'app';
  wizard: AppTemplateWizard;
  organization: AppTemplateOrganization;
  /**
   * Is Default
   * @default false
   */
  is_default?: boolean;
  /** Icon Name */
  icon_name?: string | null;
}

/**
 * AppTemplateToggleDefaultRequest
 * Request to toggle template as default/featured.
 */
export interface AppTemplateToggleDefaultRequest {
  /** Is Default */
  is_default: boolean;
}

/** AppTemplateWizard */
export interface AppTemplateWizard {
  attachments: TemplateWizard | null;
  collections: TemplateWizard | null;
}

/** AppUpdateRequest */
export interface AppUpdateRequest {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Input Fields */
  input_fields?: InputField[] | null;
  /** Attachments */
  attachments?: ModelId[] | null;
  prompt?: PromptCreate | null;
  completion_model?: ModelId | null;
  completion_model_kwargs?: ModelKwargs | null;
  transcription_model?: ModelId | null;
  /** Data Retention Days */
  data_retention_days?: number | null;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon. Set to null to remove.
   */
  icon_id?: string | null;
}

/** Applications */
export interface Applications {
  assistants: PaginatedPermissionsAssistantSparse;
  group_chats: PaginatedPermissionsGroupChatSparse;
  services: PaginatedPermissionsServiceSparse;
  apps: PaginatedPermissionsAppSparse;
}

/** AskAnalysis */
export interface AskAnalysis {
  /** Question */
  question: string;
  /** Completion Model Id */
  completion_model_id?: string | null;
  /**
   * Stream
   * @default false
   */
  stream?: boolean;
}

/** AskAssistant */
export interface AskAssistant {
  /** Question */
  question: string;
  /** Session Id */
  session_id?: string | null;
  /**
   * Files
   * @maxItems 20
   * @default []
   */
  files?: ModelId[];
  /**
   * Stream
   * @default false
   */
  stream?: boolean;
  tools?: UseTools | null;
}

/** AskResponse */
export interface AskResponse {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** Question */
  question: string;
  /** Answer */
  answer: string;
  /** Files */
  files: FilePublic[];
  /** Generated Files */
  generated_files: FilePublic[];
  /** References */
  references: InfoBlobAskAssistantPublic[];
  tools: UseTools;
  /** Web Search References */
  web_search_references: WebSearchResultPublic[];
  model?: CompletionModelPublic | null;
}

/**
 * AssistantActivityStats
 * Statistics about assistant activity within a period.
 */
export interface AssistantActivityStats {
  /** Active Assistant Count */
  active_assistant_count: number;
  /** Total Trackable Assistants */
  total_trackable_assistants: number;
  /** Active Assistant Pct */
  active_assistant_pct: number;
  /** Active User Count */
  active_user_count: number;
}

/** AssistantCreatePublic */
export interface AssistantCreatePublic {
  /** Name */
  name: string;
  /**
   * This field is deprecated and will be ignored
   * @deprecated
   */
  completion_model_kwargs?: ModelKwargs | null;
  /**
   * Logging Enabled
   * This field is deprecated and will be ignored
   * @deprecated
   */
  logging_enabled?: boolean | null;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  /**
   * This field is deprecated and will be ignored
   * @deprecated
   */
  prompt?: PromptCreate | null;
  /**
   * Groups
   * This field is deprecated and will be ignored
   * @deprecated
   * @default []
   */
  groups?: ModelId[];
  /**
   * Websites
   * This field is deprecated and will be ignored
   * @deprecated
   * @default []
   */
  websites?: ModelId[];
  /**
   * Integration Knowledge List
   * This field is deprecated and will be ignored
   * @deprecated
   * @default []
   */
  integration_knowledge_list?: ModelId[];
  /**
   * Mcp Servers
   * This field is deprecated and will be ignored
   * @deprecated
   * @default []
   */
  mcp_servers?: ModelId[];
  /**
   * This field is deprecated and will be ignored
   * @deprecated
   */
  guardrail?: AssistantGuard | null;
  /**
   * This field is deprecated and will be ignored
   * @deprecated
   */
  completion_model?: ModelId | null;
}

/** AssistantGuard */
export interface AssistantGuard {
  /**
   * Guardrail Active
   * @default true
   */
  guardrail_active?: boolean;
  /**
   * Guardrail String
   * @default ""
   */
  guardrail_string?: string;
  /**
   * On Fail Message
   * @default "Jag kan tyvärr inte svara på det. Fråga gärna något annat!"
   */
  on_fail_message?: string;
}

/** AssistantInTemplatePublic */
export interface AssistantInTemplatePublic {
  /** Name */
  name: string;
  completion_model: CompletionModelPublicAssistantTemplate | null;
  /** Completion Model Kwargs */
  completion_model_kwargs?: Record<string, any>;
  prompt: PromptPublicAssistantTemplate | null;
}

/** AssistantInsightQuestion */
export interface AssistantInsightQuestion {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Question */
  question: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
}

/** AssistantMetadata */
export interface AssistantMetadata {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** AssistantPublic */
export interface AssistantPublic {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  prompt?: PromptPublic | null;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  completion_model_kwargs: ModelKwargs;
  /** Logging Enabled */
  logging_enabled: boolean;
  /** Attachments */
  attachments: FilePublic[];
  allowed_attachments: FileRestrictions;
  /** Groups */
  groups: CollectionPublic[];
  /** Websites */
  websites: WebsitePublic[];
  /** Integration Knowledge List */
  integration_knowledge_list: IntegrationKnowledgePublic[];
  /** Mcp Servers */
  mcp_servers: Record<string, any>[];
  /** Mcp Tools */
  mcp_tools?: MCPToolSetting[];
  completion_model?: CompletionModelSparse | null;
  /**
   * Published
   * @default false
   */
  published?: boolean;
  user: UserSparse;
  tools: UseTools;
  type: AssistantType;
  model_info?: ModelInfo | null;
  /**
   * Description
   * A description of the assitant that will be used as default description in GroupChatAssistantPublic
   * @example "This is a helpful AI assistant"
   */
  description?: string | null;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
  /**
   * Insight Enabled
   * Whether insights are enabled for this assistant. If enabled, users with appropriate permissions can see all sessions for this assistant.
   */
  insight_enabled: boolean;
  /**
   * Data Retention Days
   * Number of days to retain data for this assistant
   */
  data_retention_days?: number | null;
  /**
   * Metadata Json
   * Metadata for the assistant
   */
  metadata_json?: Record<string, any> | null;
}

/** AssistantSparse */
export interface AssistantSparse {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  completion_model_kwargs?: ModelKwargs;
  /**
   * Logging Enabled
   * @default false
   */
  logging_enabled?: boolean;
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  /**
   * Published
   * @default false
   */
  published?: boolean;
  /** Description */
  description?: string | null;
  /**
   * Metadata Json
   * Metadata for the assistant
   */
  metadata_json?: Record<string, any> | null;
  type: AssistantType;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
  /**
   * Completion Model Id
   * ID of the completion model, or None if not configured
   */
  completion_model_id?: string | null;
}

/**
 * AssistantTemplateAdminCreate
 * Admin template creation request.
 */
export interface AssistantTemplateAdminCreate {
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /** Description */
  description?: string | null;
  /**
   * Category
   * @minLength 1
   * @maxLength 100
   */
  category: string;
  /** Prompt */
  prompt?: string | null;
  /** Completion Model Kwargs */
  completion_model_kwargs?: Record<string, any>;
  wizard?: AssistantTemplateWizard | null;
  /** Icon Name */
  icon_name?: string | null;
}

/**
 * AssistantTemplateAdminListPublic
 * Admin list response.
 */
export interface AssistantTemplateAdminListPublic {
  /** Items */
  items: AssistantTemplateAdminPublic[];
  /** Count */
  count: number;
}

/**
 * AssistantTemplateAdminPublic
 * Admin view of template with tenant fields.
 */
export interface AssistantTemplateAdminPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
  /** Prompt Text */
  prompt_text?: string | null;
  /** Completion Model Kwargs */
  completion_model_kwargs?: Record<string, any>;
  /** Completion Model Id */
  completion_model_id?: string | null;
  /** Completion Model Name */
  completion_model_name?: string | null;
  wizard?: AssistantTemplateWizard | null;
  /** Organization */
  organization: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Deleted At */
  deleted_at?: string | null;
  /** Deleted By User Id */
  deleted_by_user_id?: string | null;
  /** Restored At */
  restored_at?: string | null;
  /** Restored By User Id */
  restored_by_user_id?: string | null;
  /** Original Snapshot */
  original_snapshot?: Record<string, any> | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Usage Count
   * @default 0
   */
  usage_count?: number;
  /**
   * Is Default
   * @default false
   */
  is_default?: boolean;
  /** Icon Name */
  icon_name?: string | null;
}

/**
 * AssistantTemplateAdminUpdate
 * Admin template update request (PATCH semantics).
 */
export interface AssistantTemplateAdminUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Category */
  category?: string | null;
  /** Prompt */
  prompt?: string | null;
  /** Completion Model Kwargs */
  completion_model_kwargs?: Record<string, any> | null;
  /** Completion Model Id */
  completion_model_id?: string | null;
  wizard?: AssistantTemplateWizard | null;
  /** Icon Name */
  icon_name?: string | null;
}

/** AssistantTemplateListPublic */
export interface AssistantTemplateListPublic {
  /** Items */
  items: AssistantTemplatePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** AssistantTemplateOrganization */
export interface AssistantTemplateOrganization {
  /** Name */
  name: string;
}

/** AssistantTemplatePublic */
export interface AssistantTemplatePublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
  assistant: AssistantInTemplatePublic;
  /** Type */
  type: 'assistant';
  wizard: AssistantTemplateWizard;
  organization: AssistantTemplateOrganization;
  /**
   * Is Default
   * @default false
   */
  is_default?: boolean;
  /** Icon Name */
  icon_name?: string | null;
}

/**
 * AssistantTemplateToggleDefaultRequest
 * Request to toggle template as default/featured.
 */
export interface AssistantTemplateToggleDefaultRequest {
  /** Is Default */
  is_default: boolean;
}

/** AssistantTemplateWizard */
export interface AssistantTemplateWizard {
  attachments: TemplateWizard | null;
  collections: TemplateWizard | null;
}

/** AssistantType */
export enum AssistantType {
  Assistant = 'assistant',
  DefaultAssistant = 'default-assistant',
}

/** AttachmentLimits */
export interface AttachmentLimits {
  /** Formats */
  formats: FormatLimit[];
  /** Max In Question */
  max_in_question: number;
}

/**
 * AuditConfigResponse
 * Response model for GET /api/v1/audit/config.
 * Contains all 7 categories with metadata.
 * @example {"categories":[{"action_count":13,"category":"admin_actions","description":"User management, role changes, API keys, tenant settings","enabled":true,"example_actions":["USER_CREATED","ROLE_DELETED","API_KEY_GENERATED"]},{"action_count":28,"category":"user_actions","description":"Assistant, space, app operations, templates, model configs","enabled":true,"example_actions":["ASSISTANT_CREATED","SPACE_DELETED","APP_EXECUTED"]}]}
 */
export interface AuditConfigResponse {
  /**
   * Categories
   * List of all audit categories with configuration and metadata
   */
  categories: CategoryConfig[];
}

/**
 * AuditConfigUpdateRequest
 * Request model for PATCH /api/v1/audit/config.
 * Allows bulk updates of multiple categories.
 * @example {"updates":[{"category":"admin_actions","enabled":false},{"category":"file_operations","enabled":false}]}
 */
export interface AuditConfigUpdateRequest {
  /**
   * Updates
   * List of category configuration updates
   * @maxItems 7
   * @minItems 1
   */
  updates: CategoryUpdate[];
}

/**
 * AuditLogListResponse
 * Schema for audit log list response.
 */
export interface AuditLogListResponse {
  /** Logs */
  logs: AuditLogResponse[];
  /** Total Count */
  total_count: number;
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
  /** Total Pages */
  total_pages: number;
}

/**
 * AuditLogResponse
 * Schema for audit log response.
 */
export interface AuditLogResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Actor Id */
  actor_id?: string | null;
  /** Categorize who performed the action */
  actor_type: ActorType;
  /** Standardized vocabulary of auditable actions */
  action: ActionType;
  /** Categorize what type of entity was affected */
  entity_type: EntityType;
  /**
   * Entity Id
   * @format uuid
   */
  entity_id: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Description */
  description: string;
  /** Metadata */
  metadata: Record<string, any>;
  /** Indicate success or failure of audited action */
  outcome: Outcome;
  /** Ip Address */
  ip_address?: string | null;
  /** User Agent */
  user_agent?: string | null;
  /** Request Id */
  request_id?: string | null;
  /** Error Message */
  error_message?: string | null;
  /** Deleted At */
  deleted_at?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** AuthCallbackParams */
export interface AuthCallbackParams {
  /** Auth Code */
  auth_code: string;
  /**
   * Tenant Integration Id
   * @format uuid
   */
  tenant_integration_id: string;
}

/** AuthUrlPublic */
export interface AuthUrlPublic {
  /** Auth Url */
  auth_url: string;
}

/** Body_Login_api_v1_users_login_token__post */
export interface BodyLoginApiV1UsersLoginTokenPost {
  /** Grant Type */
  grant_type?: string | null;
  /** Username */
  username: string;
  /** Password */
  password: string;
  /**
   * Scope
   * @default ""
   */
  scope?: string;
  /** Client Id */
  client_id?: string | null;
  /** Client Secret */
  client_secret?: string | null;
}

/** Body_create_icon_api_v1_icons__post */
export interface BodyCreateIconApiV1IconsPost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_file_api_v1_files__post */
export interface BodyUploadFileApiV1FilesPost {
  /**
   * Upload File
   * @format binary
   */
  upload_file: File;
}

/** Body_upload_file_api_v1_groups__id__info_blobs_upload__post */
export interface BodyUploadFileApiV1GroupsIdInfoBlobsUploadPost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/**
 * BulkCrawlRequest
 * Request model for triggering crawls on multiple websites.
 */
export interface BulkCrawlRequest {
  /** Website Ids */
  website_ids: string[];
}

/**
 * BulkCrawlResponse
 * Response model for bulk crawl operations.
 */
export interface BulkCrawlResponse {
  /** Total */
  total: number;
  /** Queued */
  queued: number;
  /** Failed */
  failed: number;
  /** Crawl Runs */
  crawl_runs: IntricWebsitesPresentationWebsiteModelsCrawlRunPublic[];
  /** Errors */
  errors: Record<string, string>[];
}

/**
 * CallbackRequest
 * OIDC callback with authorization code.
 * @example {"code":"authorization_code_from_idp","state":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
 */
export interface CallbackRequest {
  /** Code */
  code: string;
  /** State */
  state: string;
  /** Code Verifier */
  code_verifier?: string | null;
}

/**
 * CategoryConfig
 * Enriched category configuration with metadata for API responses.
 * @example {"action_count":13,"category":"admin_actions","description":"User management, role changes, API keys, tenant settings","enabled":true,"example_actions":["USER_CREATED","ROLE_DELETED","API_KEY_GENERATED"]}
 */
export interface CategoryConfig {
  /**
   * Category
   * Category name (e.g., 'admin_actions')
   */
  category: string;
  /**
   * Enabled
   * Whether category is currently enabled
   */
  enabled: boolean;
  /**
   * Description
   * Human-readable description of category
   */
  description: string;
  /**
   * Action Count
   * Number of action types in this category
   */
  action_count: number;
  /**
   * Example Actions
   * Sample action types (max 3) for UI display
   */
  example_actions: string[];
}

/**
 * CategoryUpdate
 * Represents a category configuration change request.
 * @example {"category":"admin_actions","enabled":false}
 */
export interface CategoryUpdate {
  /**
   * Category
   * Category name to update
   */
  category: string;
  /**
   * Enabled
   * New enabled state
   */
  enabled: boolean;
}

/** CollectionMetadata */
export interface CollectionMetadata {
  /** Num Info Blobs */
  num_info_blobs: number;
  /** Size */
  size: number;
}

/** CollectionPublic */
export interface CollectionPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Name */
  name: string;
  embedding_model: EmbeddingModelPublic;
  metadata: CollectionMetadata;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
}

/** CollectionUpdate */
export interface CollectionUpdate {
  /** Name */
  name: string;
}

/** CompletionModel */
export interface CompletionModel {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Nickname */
  nickname: string;
  /** Family */
  family: ModelFamily | string;
  /** Token Limit */
  token_limit: number;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Nr Billion Parameters */
  nr_billion_parameters?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  /** Stability */
  stability: ModelStability | string;
  /** Hosting */
  hosting: ModelHostingLocation | string;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Deployment Name */
  deployment_name?: string | null;
  /** Org */
  org?: ModelOrg | string | null;
  /** Vision */
  vision: boolean;
  /** Reasoning */
  reasoning: boolean;
  /**
   * Supports Tool Calling
   * @default false
   */
  supports_tool_calling?: boolean;
  /** Base Url */
  base_url?: string | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /**
   * Is Org Default
   * @default false
   */
  is_org_default?: boolean;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Provider Id */
  provider_id?: string | null;
}

/** CompletionModelCreate */
export interface CompletionModelCreate {
  /** Name */
  name: string;
  /** Nickname */
  nickname: string;
  /** Family */
  family: ModelFamily | string;
  /** Token Limit */
  token_limit: number;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Nr Billion Parameters */
  nr_billion_parameters?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  /** Stability */
  stability: ModelStability | string;
  /** Hosting */
  hosting: ModelHostingLocation | string;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Deployment Name */
  deployment_name?: string | null;
  /** Org */
  org?: ModelOrg | string | null;
  /** Vision */
  vision: boolean;
  /** Reasoning */
  reasoning: boolean;
  /**
   * Supports Tool Calling
   * @default false
   */
  supports_tool_calling?: boolean;
  /** Base Url */
  base_url?: string | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
}

/** CompletionModelPublic */
export interface CompletionModelPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Nickname */
  nickname: string;
  /** Family */
  family: ModelFamily | string;
  /** Token Limit */
  token_limit: number;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Nr Billion Parameters */
  nr_billion_parameters?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  /** Stability */
  stability: ModelStability | string;
  /** Hosting */
  hosting: ModelHostingLocation | string;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Deployment Name */
  deployment_name?: string | null;
  /** Org */
  org?: ModelOrg | string | null;
  /** Vision */
  vision: boolean;
  /** Reasoning */
  reasoning: boolean;
  /**
   * Supports Tool Calling
   * @default false
   */
  supports_tool_calling?: boolean;
  /** Base Url */
  base_url?: string | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /**
   * Is Org Default
   * @default false
   */
  is_org_default?: boolean;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Provider Id */
  provider_id?: string | null;
  /**
   * Can Access
   * @default false
   */
  can_access?: boolean;
  /**
   * Is Locked
   * @default true
   */
  is_locked?: boolean;
  /** Lock Reason */
  lock_reason?: string | null;
  /** Credential Provider */
  credential_provider?: string | null;
  security_classification?: SecurityClassificationPublic | null;
  /** Provider Name */
  provider_name?: string | null;
  /** Provider Type */
  provider_type?: string | null;
}

/** CompletionModelPublicAppTemplate */
export interface CompletionModelPublicAppTemplate {
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/** CompletionModelPublicAssistantTemplate */
export interface CompletionModelPublicAssistantTemplate {
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/** CompletionModelSecurityStatus */
export interface CompletionModelSecurityStatus {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Nickname */
  nickname: string;
  /** Family */
  family: ModelFamily | string;
  /** Token Limit */
  token_limit: number;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Nr Billion Parameters */
  nr_billion_parameters?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  /** Stability */
  stability: ModelStability | string;
  /** Hosting */
  hosting: ModelHostingLocation | string;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Deployment Name */
  deployment_name?: string | null;
  /** Org */
  org?: ModelOrg | string | null;
  /** Vision */
  vision: boolean;
  /** Reasoning */
  reasoning: boolean;
  /**
   * Supports Tool Calling
   * @default false
   */
  supports_tool_calling?: boolean;
  /** Base Url */
  base_url?: string | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /**
   * Is Org Default
   * @default false
   */
  is_org_default?: boolean;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Provider Id */
  provider_id?: string | null;
  /**
   * Can Access
   * @default false
   */
  can_access?: boolean;
  /**
   * Is Locked
   * @default true
   */
  is_locked?: boolean;
  /** Lock Reason */
  lock_reason?: string | null;
  /** Credential Provider */
  credential_provider?: string | null;
  security_classification?: SecurityClassificationPublic | null;
  /** Provider Name */
  provider_name?: string | null;
  /** Provider Type */
  provider_type?: string | null;
  /** Meets Security Classification */
  meets_security_classification?: boolean | null;
}

/** CompletionModelSparse */
export interface CompletionModelSparse {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Nickname */
  nickname: string;
  /** Family */
  family: ModelFamily | string;
  /** Token Limit */
  token_limit: number;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Nr Billion Parameters */
  nr_billion_parameters?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  /** Stability */
  stability: ModelStability | string;
  /** Hosting */
  hosting: ModelHostingLocation | string;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Deployment Name */
  deployment_name?: string | null;
  /** Org */
  org?: ModelOrg | string | null;
  /** Vision */
  vision: boolean;
  /** Reasoning */
  reasoning: boolean;
  /**
   * Supports Tool Calling
   * @default false
   */
  supports_tool_calling?: boolean;
  /** Base Url */
  base_url?: string | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
}

/** CompletionModelUpdateFlags */
export interface CompletionModelUpdateFlags {
  /** Is Org Enabled */
  is_org_enabled?: boolean | null;
  /** Is Org Default */
  is_org_default?: boolean | null;
  /** Security Classification */
  security_classification?: ModelId | null;
}

/** ContentDisposition */
export enum ContentDisposition {
  Attachment = 'attachment',
  Inline = 'inline',
}

/** ConversationInsightResponse */
export interface ConversationInsightResponse {
  /** Total Conversations */
  total_conversations: number;
  /** Total Questions */
  total_questions: number;
}

/**
 * ConversationRequest
 * A unified model for asking questions to either assistants or group chats.
 *
 * Either session_id, assistant_id, or group_chat_id must be provided.
 * If session_id is provided, the conversation will continue with the existing session.
 *
 * For group chats:
 * - If tools.assistants contains an assistant, that specific assistant will be targeted
 *   (requires the group chat to have allow_mentions=True).
 * - If no assistant is targeted, the most appropriate assistant will be selected.
 */
export interface ConversationRequest {
  /** Question */
  question: string;
  /** Session Id */
  session_id?: string | null;
  /** Assistant Id */
  assistant_id?: string | null;
  /** Group Chat Id */
  group_chat_id?: string | null;
  /**
   * Files
   * @maxItems 20
   * @default []
   */
  files?: ModelId[];
  /**
   * Stream
   * @default false
   */
  stream?: boolean;
  tools?: UseTools | null;
  /**
   * Use Web Search
   * @default false
   */
  use_web_search?: boolean;
  /**
   * Require Tool Approval
   * @default false
   */
  require_tool_approval?: boolean;
}

/** Counts */
export interface Counts {
  /** Assistants */
  assistants: number;
  /** Sessions */
  sessions: number;
  /** Questions */
  questions: number;
}

/** CrawlType */
export enum CrawlType {
  Crawl = 'crawl',
  Sitemap = 'sitemap',
}

/**
 * CrawlerActivity
 * Real-time crawler activity from multiple sources.
 */
export interface CrawlerActivity {
  /** Db In Progress */
  db_in_progress?: number | null;
  /**
   * Db Query Ok
   * @default true
   */
  db_query_ok?: boolean;
  /**
   * Arq Ongoing
   * @default 0
   */
  arq_ongoing?: number;
  /** Delta */
  delta?: number | null;
}

/**
 * CrawlerHealthResponse
 * Crawler health status with operator-friendly signals.
 */
export interface CrawlerHealthResponse {
  /** Status */
  status: string;
  /**
   * Status Flags
   * @default []
   */
  status_flags?: string[];
  /**
   * Status Reason
   * @default ""
   */
  status_reason?: string;
  /** Response Timestamp Utc */
  response_timestamp_utc: string;
  /**
   * Real-time crawler activity from multiple sources.
   * @default {"db_query_ok":true,"arq_ongoing":0}
   */
  crawler_activity?: CrawlerActivity;
  /**
   * Parsed ARQ health metrics (clean view).
   * @default {"j_complete":0,"j_failed":0,"j_retried":0,"j_ongoing":0,"queued":0}
   */
  arq?: ARQHealth;
  /**
   * Watchdog activity metrics.
   * @default {"zombies_reconciled":0,"expired_killed":0,"rescued":0,"early_zombies_failed":0,"long_running_failed":0,"slots_released":0}
   */
  watchdog?: WatchdogMetrics;
  /**
   * Feeder leader election status.
   * @default {"status":"UNKNOWN"}
   */
  feeder?: FeederLeader;
  /**
   * Pending crawl queue summary.
   * @default {"total":0,"tenant_count":0,"top_tenants":{}}
   */
  pending?: PendingQueueSummary;
  /** Thresholds used for status decisions - helps explain status. */
  thresholds: HealthThresholds;
  /**
   * Raw data for debugging - noisy, not for quick reads.
   * @default {"arq_raw":"","queue_name":"arq:queue"}
   */
  debug?: DebugInfo;
}

/**
 * CrawlerSettingsResponse
 * Response model for crawler settings operations.
 *
 * Returns current settings merged with environment defaults.
 * Tenant overrides are highlighted.
 *
 * Example:
 *     {
 *         "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
 *         "settings": {
 *             "crawl_max_length": 14400,
 *             "download_timeout": 90,
 *             "download_max_size": 10485760,
 *             "dns_timeout": 30,
 *             "retry_times": 2,
 *             "closespider_itemcount": 20000,
 *             "obey_robots": true,
 *             "autothrottle_enabled": true,
 *             "tenant_worker_concurrency_limit": 4,
 *             "crawl_stale_threshold_minutes": 30,
 *             "crawl_heartbeat_interval_seconds": 300,
 *             "crawl_feeder_enabled": false,
 *             "crawl_feeder_interval_seconds": 10,
 *             "crawl_feeder_batch_size": 10,
 *             "crawl_job_max_age_seconds": 1800
 *         },
 *         "overrides": ["download_timeout", "dns_timeout"],
 *         "updated_at": "2025-10-22T10:00:00+00:00"
 *     }
 */
export interface CrawlerSettingsResponse {
  /**
   * Tenant Id
   * Tenant UUID
   * @format uuid
   */
  tenant_id: string;
  /**
   * Settings
   * Current effective settings (tenant overrides + env defaults)
   */
  settings: Record<string, any>;
  /**
   * Overrides
   * List of setting keys that have tenant-specific overrides
   */
  overrides: string[];
  /**
   * Updated At
   * Timestamp of last settings update
   */
  updated_at?: string | null;
}

/**
 * CrawlerSettingsUpdate
 * Request model for updating tenant crawler settings.
 *
 * All fields are optional - only provided fields will be updated.
 * Missing fields retain their previous values or fall back to environment defaults.
 *
 * Field constraints are derived from CRAWLER_SETTING_SPECS (single source of truth).
 *
 * Example - Full configuration:
 *     {
 *         "crawl_max_length": 14400,
 *         "download_timeout": 90,
 *         "download_max_size": 10485760,
 *         "dns_timeout": 30,
 *         "retry_times": 2,
 *         "closespider_itemcount": 20000,
 *         "obey_robots": true,
 *         "autothrottle_enabled": true,
 *         "tenant_worker_concurrency_limit": 4,
 *         "crawl_stale_threshold_minutes": 30,
 *         "crawl_heartbeat_interval_seconds": 300,
 *         "crawl_feeder_enabled": false,
 *         "crawl_feeder_interval_seconds": 10,
 *         "crawl_feeder_batch_size": 10,
 *         "crawl_job_max_age_seconds": 1800
 *     }
 *
 * Example - Partial update (adjust timeouts only):
 *     {
 *         "download_timeout": 120,
 *         "dns_timeout": 45
 *     }
 */
export interface CrawlerSettingsUpdate {
  /**
   * Crawl Max Length
   * Maximum crawl duration in seconds (1 min to 24 hours)
   */
  crawl_max_length?: number | null;
  /**
   * Download Timeout
   * Per-request download timeout in seconds (10s to 5 min)
   */
  download_timeout?: number | null;
  /**
   * Download Max Size
   * Maximum file size for crawler downloads in bytes (1MB to 1GB)
   */
  download_max_size?: number | null;
  /**
   * Dns Timeout
   * DNS resolution timeout in seconds (5s to 2 min)
   */
  dns_timeout?: number | null;
  /**
   * Retry Times
   * Number of retry attempts per request (0 to 10)
   */
  retry_times?: number | null;
  /**
   * Closespider Itemcount
   * Maximum pages to crawl before stopping (100 to 100k)
   */
  closespider_itemcount?: number | null;
  /**
   * Obey Robots
   * Whether to respect robots.txt rules
   */
  obey_robots?: boolean | null;
  /**
   * Autothrottle Enabled
   * Enable automatic request throttling based on server response times
   */
  autothrottle_enabled?: boolean | null;
  /**
   * Tenant Worker Concurrency Limit
   * Maximum concurrent crawl jobs per tenant (0 = unlimited, 1 to 50)
   */
  tenant_worker_concurrency_limit?: number | null;
  /**
   * Crawl Stale Threshold Minutes
   * Minutes without activity before IN_PROGRESS job is considered stale (5 min to 24 hours)
   */
  crawl_stale_threshold_minutes?: number | null;
  /**
   * Crawl Heartbeat Interval Seconds
   * Heartbeat interval to signal job is alive (30s to 1 hour)
   */
  crawl_heartbeat_interval_seconds?: number | null;
  /**
   * Crawl Feeder Enabled
   * Enable crawl feeder service for rate-limited job enqueueing
   */
  crawl_feeder_enabled?: boolean | null;
  /**
   * Crawl Feeder Interval Seconds
   * Feeder check interval in seconds (5s to 5 min)
   */
  crawl_feeder_interval_seconds?: number | null;
  /**
   * Crawl Feeder Batch Size
   * Maximum jobs to enqueue per feeder cycle per tenant (1 to 100)
   */
  crawl_feeder_batch_size?: number | null;
  /**
   * Crawl Job Max Age Seconds
   * Maximum job retry age before permanent failure (5 min to 2 hours)
   */
  crawl_job_max_age_seconds?: number | null;
}

/** CreateGroupRequest */
export interface CreateGroupRequest {
  /** Name */
  name: string;
  embedding_model: ModelId;
}

/** CreateSpaceAppRequest */
export interface CreateSpaceAppRequest {
  /** Name */
  name: string;
  from_template?: TemplateCreate | null;
}

/** CreateSpaceAssistantRequest */
export interface CreateSpaceAssistantRequest {
  /** Name */
  name: string;
  from_template?: TemplateCreate | null;
}

/** CreateSpaceGroupsRequest */
export interface CreateSpaceGroupsRequest {
  /** Name */
  name: string;
  embedding_model?: ModelId | null;
}

/** CreateSpaceIntegrationKnowledge */
export interface CreateSpaceIntegrationKnowledge {
  /** Name */
  name: string;
  embedding_model: ModelId;
  /** Url */
  url: string;
  /** Key */
  key?: string | null;
  /** Folder Id */
  folder_id?: string | null;
  /** Folder Path */
  folder_path?: string | null;
  /** Selected Item Type */
  selected_item_type?: string | null;
  /**
   * Resource Type
   * @default "site"
   */
  resource_type?: string | null;
}

/** CreateSpaceIntegrationKnowledgeBatchItem */
export interface CreateSpaceIntegrationKnowledgeBatchItem {
  /** Name */
  name: string;
  /** Url */
  url: string;
  /** Key */
  key?: string | null;
  /** Folder Id */
  folder_id?: string | null;
  /** Folder Path */
  folder_path?: string | null;
  /** Selected Item Type */
  selected_item_type?: string | null;
  /**
   * Resource Type
   * @default "site"
   */
  resource_type?: string | null;
}

/** CreateSpaceIntegrationKnowledgeBatchRequest */
export interface CreateSpaceIntegrationKnowledgeBatchRequest {
  embedding_model: ModelId;
  /** Wrapper Name */
  wrapper_name?: string | null;
  /**
   * Items
   * @maxItems 50
   * @minItems 1
   */
  items: CreateSpaceIntegrationKnowledgeBatchItem[];
}

/** CreateSpaceIntegrationKnowledgeBatchResponse */
export interface CreateSpaceIntegrationKnowledgeBatchResponse {
  /** Items */
  items: CreateSpaceIntegrationKnowledgeBatchResult[];
  /** Created Count */
  created_count: number;
  /** Failed Count */
  failed_count: number;
}

/** CreateSpaceIntegrationKnowledgeBatchResult */
export interface CreateSpaceIntegrationKnowledgeBatchResult {
  /** Index */
  index: number;
  /** Name */
  name: string;
  /** Status */
  status: CreateSpaceIntegrationKnowledgeBatchResultStatusEnum;
  /** Integration Knowledge Id */
  integration_knowledge_id?: string | null;
  job?: JobPublic | null;
  /** Error */
  error?: string | null;
}

/** CreateSpaceRequest */
export interface CreateSpaceRequest {
  /** Name */
  name: string;
}

/** CreateSpaceServiceRequest */
export interface CreateSpaceServiceRequest {
  /** Name */
  name: string;
}

/** CreateSpaceServiceResponse */
export interface CreateSpaceServiceResponse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Prompt */
  prompt: string;
  completion_model_kwargs: ModelKwargs;
  /** Output Format */
  output_format?: CreateSpaceServiceResponseOutputFormatEnum | null;
  /** Json Schema */
  json_schema?: Record<string, any> | null;
  /** Groups */
  groups: GroupPublicWithMetadata[];
  completion_model: CompletionModelSparse | null;
  /**
   * Published
   * @default false
   */
  published?: boolean;
  user: UserSparse;
}

/** CursorPaginatedResponse[AssistantInsightQuestion] */
export interface CursorPaginatedResponseAssistantInsightQuestion {
  /**
   * Items
   * List of items returned in the response
   */
  items: AssistantInsightQuestion[];
  /** Limit */
  limit?: number | null;
  /** Next Cursor */
  next_cursor?: string | null;
  /** Previous Cursor */
  previous_cursor?: string | null;
  /** Total Count */
  total_count: number;
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** CursorPaginatedResponse[SessionMetadataPublic] */
export interface CursorPaginatedResponseSessionMetadataPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: SessionMetadataPublic[];
  /** Limit */
  limit?: number | null;
  /** Next Cursor */
  next_cursor?: string | null;
  /** Previous Cursor */
  previous_cursor?: string | null;
  /** Total Count */
  total_count: number;
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** CursorPaginatedResponse[UserSparse] */
export interface CursorPaginatedResponseUserSparse {
  /**
   * Items
   * List of items returned in the response
   */
  items: UserSparse[];
  /** Limit */
  limit?: number | null;
  /** Next Cursor */
  next_cursor?: string | null;
  /** Previous Cursor */
  previous_cursor?: string | null;
  /** Total Count */
  total_count: number;
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** Dashboard */
export interface Dashboard {
  spaces: PaginatedResponseSpaceDashboard;
}

/**
 * DebugInfo
 * Raw data for debugging - noisy, not for quick reads.
 */
export interface DebugInfo {
  /**
   * Arq Raw
   * @default ""
   */
  arq_raw?: string;
  /** Arq Timestamp */
  arq_timestamp?: string | null;
  /** Watchdog Timestamp */
  watchdog_timestamp?: string | null;
  /** Redis Db */
  redis_db?: number | null;
  /**
   * Queue Name
   * @default "arq:queue"
   */
  queue_name?: string;
}

/** DefaultAssistant */
export interface DefaultAssistant {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  prompt?: PromptPublic | null;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  completion_model_kwargs: ModelKwargs;
  /** Logging Enabled */
  logging_enabled: boolean;
  /** Attachments */
  attachments: FilePublic[];
  allowed_attachments: FileRestrictions;
  /** Groups */
  groups: CollectionPublic[];
  /** Websites */
  websites: WebsitePublic[];
  /** Integration Knowledge List */
  integration_knowledge_list: IntegrationKnowledgePublic[];
  /** Mcp Servers */
  mcp_servers: Record<string, any>[];
  /** Mcp Tools */
  mcp_tools?: MCPToolSetting[];
  completion_model?: CompletionModelSparse | null;
  /**
   * Published
   * @default false
   */
  published?: boolean;
  user: UserSparse;
  tools: UseTools;
  type: AssistantType;
  model_info?: ModelInfo | null;
  /**
   * Description
   * A description of the assitant that will be used as default description in GroupChatAssistantPublic
   * @example "This is a helpful AI assistant"
   */
  description?: string | null;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
  /**
   * Insight Enabled
   * @default false
   */
  insight_enabled?: boolean;
  /**
   * Data Retention Days
   * Number of days to retain data for this assistant
   */
  data_retention_days?: number | null;
  /**
   * Metadata Json
   * Metadata for the assistant
   */
  metadata_json?: Record<string, any> | null;
}

/**
 * DeleteCredentialResponse
 * Response model for deleting tenant API credentials.
 *
 * Example:
 *     {
 *         "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
 *         "provider": "anthropic",
 *         "message": "API credential for anthropic deleted successfully"
 *     }
 */
export interface DeleteCredentialResponse {
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Provider */
  provider: string;
  /** Message */
  message: string;
}

/**
 * DeleteFederationResponse
 * Response model for deleting federation config.
 */
export interface DeleteFederationResponse {
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Message */
  message: string;
}

/** DeleteResponse */
export interface DeleteResponse {
  /** Success */
  success: boolean;
}

/**
 * DeleteSettingsResponse
 * Response model for deleting tenant crawler settings.
 *
 * Example:
 *     {
 *         "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
 *         "message": "Crawler settings reset to defaults",
 *         "deleted_keys": ["download_timeout", "dns_timeout"]
 *     }
 */
export interface DeleteSettingsResponse {
  /**
   * Tenant Id
   * Tenant UUID
   * @format uuid
   */
  tenant_id: string;
  /**
   * Message
   * Confirmation message
   */
  message: string;
  /**
   * Deleted Keys
   * List of setting keys that were removed
   */
  deleted_keys: string[];
}

/** EmbeddingModelCreate */
export interface EmbeddingModelCreate {
  /** Name */
  name: string;
  family: EmbeddingModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Open Source */
  open_source: boolean;
  /** Dimensions */
  dimensions?: number | null;
  /** Max Input */
  max_input?: number | null;
  /** Max Batch Size */
  max_batch_size?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Description */
  description?: string | null;
  org?: ModelOrg | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
}

/** EmbeddingModelFamily */
export enum EmbeddingModelFamily {
  Openai = 'openai',
  MiniLm = 'mini_lm',
  E5 = 'e5',
}

/** EmbeddingModelLegacy */
export interface EmbeddingModelLegacy {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  family: EmbeddingModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Open Source */
  open_source: boolean;
  /** Dimensions */
  dimensions?: number | null;
  /** Max Input */
  max_input?: number | null;
  /** Max Batch Size */
  max_batch_size?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Description */
  description?: string | null;
  org?: ModelOrg | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
}

/** EmbeddingModelPublic */
export interface EmbeddingModelPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  family: ModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Open Source */
  open_source: boolean;
  /** Dimensions */
  dimensions?: number | null;
  /** Max Input */
  max_input?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Description */
  description?: string | null;
  org?: ModelOrg | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /**
   * Can Access
   * @default false
   */
  can_access?: boolean;
  /**
   * Is Locked
   * @default true
   */
  is_locked?: boolean;
  /** Lock Reason */
  lock_reason?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /** Credential Provider */
  credential_provider?: string | null;
  security_classification?: SecurityClassificationPublic | null;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Provider Id */
  provider_id?: string | null;
  /** Provider Name */
  provider_name?: string | null;
  /** Provider Type */
  provider_type?: string | null;
}

/** EmbeddingModelPublicLegacy */
export interface EmbeddingModelPublicLegacy {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  family: EmbeddingModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Open Source */
  open_source: boolean;
  /** Dimensions */
  dimensions?: number | null;
  /** Max Input */
  max_input?: number | null;
  /** Max Batch Size */
  max_batch_size?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Description */
  description?: string | null;
  org?: ModelOrg | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /**
   * Can Access
   * @default false
   */
  can_access?: boolean;
  /**
   * Is Locked
   * @default true
   */
  is_locked?: boolean;
  /** Lock Reason */
  lock_reason?: string | null;
}

/** EmbeddingModelSecurityStatus */
export interface EmbeddingModelSecurityStatus {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  family: ModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Open Source */
  open_source: boolean;
  /** Dimensions */
  dimensions?: number | null;
  /** Max Input */
  max_input?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Description */
  description?: string | null;
  org?: ModelOrg | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /**
   * Can Access
   * @default false
   */
  can_access?: boolean;
  /**
   * Is Locked
   * @default true
   */
  is_locked?: boolean;
  /** Lock Reason */
  lock_reason?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /** Credential Provider */
  credential_provider?: string | null;
  security_classification?: SecurityClassificationPublic | null;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Provider Id */
  provider_id?: string | null;
  /** Provider Name */
  provider_name?: string | null;
  /** Provider Type */
  provider_type?: string | null;
  /** Meets Security Classification */
  meets_security_classification?: boolean | null;
}

/** EmbeddingModelSparse */
export interface EmbeddingModelSparse {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  family: EmbeddingModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  /** Open Source */
  open_source: boolean;
  /** Dimensions */
  dimensions?: number | null;
  /** Max Input */
  max_input?: number | null;
  /** Max Batch Size */
  max_batch_size?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Description */
  description?: string | null;
  org?: ModelOrg | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
}

/** EmbeddingModelUpdate */
export interface EmbeddingModelUpdate {
  /** Is Org Enabled */
  is_org_enabled?: boolean;
  /** Security Classification */
  security_classification?: ModelId | null;
}

/** EmbeddingModelUpdateFlags */
export interface EmbeddingModelUpdateFlags {
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean | null;
}

/**
 * EntityType
 * Categorize what type of entity was affected
 */
export enum EntityType {
  User = 'user',
  Assistant = 'assistant',
  Space = 'space',
  App = 'app',
  File = 'file',
  Website = 'website',
  TenantSettings = 'tenant_settings',
  Credential = 'credential',
  FederationConfig = 'federation_config',
  ApiKey = 'api_key',
  Role = 'role',
  Module = 'module',
  Template = 'template',
  GroupChat = 'group_chat',
  Collection = 'collection',
  AppRun = 'app_run',
  SecurityClassification = 'security_classification',
  Integration = 'integration',
  IntegrationKnowledge = 'integration_knowledge',
  CompletionModel = 'completion_model',
  EmbeddingModel = 'embedding_model',
  TranscriptionModel = 'transcription_model',
  AuditLog = 'audit_log',
  McpServer = 'mcp_server',
  McpServerTool = 'mcp_server_tool',
}

/** ErrorCodes */
export enum ErrorCodes {
  Value9000 = 9000,
  Value9001 = 9001,
  Value9002 = 9002,
  Value9003 = 9003,
  Value9004 = 9004,
  Value9005 = 9005,
  Value9006 = 9006,
  Value9007 = 9007,
  Value9008 = 9008,
  Value9009 = 9009,
  Value9010 = 9010,
  Value9011 = 9011,
  Value9012 = 9012,
  Value9013 = 9013,
  Value9014 = 9014,
  Value9015 = 9015,
  Value9016 = 9016,
  Value9017 = 9017,
  Value9018 = 9018,
  Value9019 = 9019,
  Value9020 = 9020,
  Value9021 = 9021,
  Value9022 = 9022,
  Value9023 = 9023,
  Value9024 = 9024,
  Value9025 = 9025,
  Value9026 = 9026,
  Value9027 = 9027,
  Value9028 = 9028,
  Value9029 = 9029,
  Value9030 = 9030,
  Value9031 = 9031,
  Value9032 = 9032,
}

/**
 * ExportJobRequest
 * Schema for requesting async audit log export.
 */
export interface ExportJobRequest {
  /**
   * User Id
   * User ID for GDPR export
   */
  user_id?: string | null;
  /**
   * Actor Id
   * Filter by actor
   */
  actor_id?: string | null;
  /** Filter by action type */
  action?: ActionType | null;
  /**
   * From Date
   * Filter from date
   */
  from_date?: string | null;
  /**
   * To Date
   * Filter to date
   */
  to_date?: string | null;
  /**
   * Format
   * Export format: csv or jsonl
   * @default "csv"
   */
  format?: string;
  /**
   * Max Records
   * Maximum records to export
   */
  max_records?: number | null;
}

/**
 * ExportJobResponse
 * Schema for export job creation response.
 */
export interface ExportJobResponse {
  /**
   * Job Id
   * @format uuid
   */
  job_id: string;
  /**
   * Status
   * Job status: pending, processing, completed, failed, cancelled
   */
  status: string;
  /**
   * Message
   * Status message
   */
  message?: string | null;
}

/**
 * ExportJobStatusResponse
 * Schema for export job status response.
 */
export interface ExportJobStatusResponse {
  /**
   * Job Id
   * @format uuid
   */
  job_id: string;
  /**
   * Status
   * Job status: pending, processing, completed, failed, cancelled
   */
  status: string;
  /**
   * Progress
   * Progress percentage
   * @min 0
   * @max 100
   */
  progress: number;
  /**
   * Total Records
   * Total records to export
   * @min 0
   */
  total_records: number;
  /**
   * Processed Records
   * Records processed so far
   * @min 0
   */
  processed_records: number;
  /**
   * Format
   * Export format: csv or jsonl
   */
  format: string;
  /**
   * File Size Bytes
   * File size in bytes (when completed)
   */
  file_size_bytes?: number | null;
  /**
   * Error Message
   * Error message (when failed)
   */
  error_message?: string | null;
  /**
   * Download Url
   * Download URL (when completed)
   */
  download_url?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Started At */
  started_at?: string | null;
  /** Completed At */
  completed_at?: string | null;
  /**
   * Expires At
   * @format date-time
   */
  expires_at: string;
}

/**
 * FederationInfo
 * Information about configured federation.
 */
export interface FederationInfo {
  /** Provider */
  provider: string;
  /** Client Id */
  client_id: string;
  /** Masked Secret */
  masked_secret: string;
  /** Issuer */
  issuer?: string | null;
  /** Allowed Domains */
  allowed_domains: string[];
  /**
   * Configured At
   * @format date-time
   */
  configured_at: string;
  /** Encryption Status */
  encryption_status: FederationInfoEncryptionStatusEnum;
}

/**
 * FederationStatusResponse
 * Federation configuration status for login page.
 * @example {"has_global_oidc_config":false,"has_multi_tenant_federation":false,"has_single_tenant_federation":true,"tenant_count":1}
 */
export interface FederationStatusResponse {
  /** Has Single Tenant Federation */
  has_single_tenant_federation: boolean;
  /** Has Multi Tenant Federation */
  has_multi_tenant_federation: boolean;
  /** Has Global Oidc Config */
  has_global_oidc_config: boolean;
  /** Tenant Count */
  tenant_count: number;
}

/**
 * FeederLeader
 * Feeder leader election status.
 */
export interface FeederLeader {
  /** Leader Id */
  leader_id?: string | null;
  /** Leader Ttl Seconds */
  leader_ttl_seconds?: number | null;
  /**
   * Status
   * @default "UNKNOWN"
   */
  status?: string;
}

/** FilePublic */
export interface FilePublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Mimetype */
  mimetype: string;
  /** Size */
  size: number;
  /** Transcription */
  transcription?: string | null;
  /** Token Count */
  token_count?: number | null;
}

/** FileRestrictions */
export interface FileRestrictions {
  /** Accepted File Types */
  accepted_file_types: AcceptedFileType[];
  limit: Limit;
}

/** FormatLimit */
export interface FormatLimit {
  /** Mimetype */
  mimetype: string;
  /** Size */
  size: number;
  /** Extensions */
  extensions: string[];
  /** Vision */
  vision: boolean;
}

/** GeneralError */
export interface GeneralError {
  /** Message */
  message: string;
  intric_error_code: ErrorCodes;
}

/** GetModelsResponse */
export interface GetModelsResponse {
  /** Completion Models */
  completion_models: CompletionModelPublic[];
  /** Embedding Models */
  embedding_models: EmbeddingModelPublicLegacy[];
}

/** GroupChatAssistantPublic */
export interface GroupChatAssistantPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Handle */
  handle: string;
  /** Default Description */
  default_description: string | null;
  /** User Description */
  user_description: string | null;
}

/** GroupChatAssistantUpdateSchema */
export interface GroupChatAssistantUpdateSchema {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * User Description
   * Custom description provided by the user. Cannot be null if 'description' of assistant is null.
   * @example "My custom AI assistant description"
   */
  user_description: string | null;
}

/**
 * GroupChatCreate
 * Attributes:
 *     name: str
 */
export interface GroupChatCreate {
  /** Name */
  name: string;
}

/**
 * GroupChatPublic
 * Represents a group chat of assistants.
 *
 * Attributes:
 *     created_at: datetime
 *     updated_at: datetime
 *     name: str
 *     id: UUID
 *     space_id: UUID
 *     allow_mentions: bool
 *     show_response_label: bool
 *     tools: GroupChatTools
 *     insight_enabled: bool
 *     attachments: list[FilePublic]
 *     allowed_attachments: FileRestrictions
 *     type: str
 */
export interface GroupChatPublic {
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Name */
  name: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  /** Allow Mentions */
  allow_mentions: boolean;
  /** Show Response Label */
  show_response_label: boolean;
  /** Published */
  published: boolean;
  /**
   * Insight Enabled
   * Whether insights are enabled for this group chat. If enabled, users with appropriate permissions can see all sessions for this group chat.
   */
  insight_enabled: boolean;
  tools: GroupChatTools;
  /** Attachments */
  attachments: FilePublic[];
  allowed_attachments: FileRestrictions;
  /** Type */
  type: 'group-chat';
  /** Permissions */
  permissions: ResourcePermission[];
  /** Metadata Json */
  metadata_json: Record<string, any> | null;
}

/** GroupChatSparse */
export interface GroupChatSparse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Name */
  name: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  /** Published */
  published: boolean;
  /** Type */
  type: 'group-chat';
  /** Metadata Json */
  metadata_json: Record<string, any> | null;
}

/** GroupChatTools */
export interface GroupChatTools {
  /** Assistants */
  assistants: GroupChatAssistantPublic[];
}

/** GroupChatUpdateSchema */
export interface GroupChatUpdateSchema {
  /**
   * Name
   * The name of the group chat.
   */
  name?: string | null;
  /** Space Id */
  space_id?: string | null;
  /** Tools available in the group chat. */
  tools?: GroupChatUpdateTools | null;
  /**
   * Allow Mentions
   * Indicates if mentions are allowed.
   */
  allow_mentions?: boolean | null;
  /**
   * Show Response Label
   * Indicates if the response label should be shown.
   */
  show_response_label?: boolean | null;
  /**
   * Insight Enabled
   * Whether insights are enabled for this group chat. If enabled, users with appropriate permissions can see all sessions for this group chat.
   */
  insight_enabled?: boolean | null;
  /**
   * Metadata Json
   * Metadata for the group chat.
   */
  metadata_json?: Record<string, any> | null;
}

/** GroupChatUpdateTools */
export interface GroupChatUpdateTools {
  /** Assistants */
  assistants: GroupChatAssistantUpdateSchema[];
}

/** GroupMetadata */
export interface GroupMetadata {
  /** Num Info Blobs */
  num_info_blobs: number;
  /** Size */
  size: number;
}

/** GroupPublicBase */
export interface GroupPublicBase {
  /** Name */
  name: string;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/** GroupPublicWithMetadata */
export interface GroupPublicWithMetadata {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Name */
  name: string;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  embedding_model: EmbeddingModelPublic;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  metadata: GroupMetadata;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/**
 * HealthThresholds
 * Thresholds used for status decisions - helps explain status.
 */
export interface HealthThresholds {
  /** Feeder Interval Seconds */
  feeder_interval_seconds: number;
  /** Watchdog Stale Threshold Seconds */
  watchdog_stale_threshold_seconds: number;
  /** Heartbeat Ttl Expected Seconds */
  heartbeat_ttl_expected_seconds: number;
}

/** IconPublic */
export interface IconPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/** InfoBlobAddPublic */
export interface InfoBlobAddPublic {
  /** Text */
  text: string;
  metadata?: InfoBlobMetadataUpsertPublic;
}

/** InfoBlobAskAssistantPublic */
export interface InfoBlobAskAssistantPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  metadata: InfoBlobMetadata;
  /** Group Id */
  group_id?: string | null;
  /** Website Id */
  website_id?: string | null;
  /** Score */
  score: number;
}

/** InfoBlobLimits */
export interface InfoBlobLimits {
  /** Formats */
  formats: FormatLimit[];
}

/** InfoBlobMetadata */
export interface InfoBlobMetadata {
  /** Url */
  url?: string | null;
  /** Title */
  title?: string | null;
  /**
   * Embedding Model Id
   * @format uuid
   */
  embedding_model_id: string;
  /** Size */
  size: number;
}

/** InfoBlobMetadataUpsertPublic */
export interface InfoBlobMetadataUpsertPublic {
  /** Url */
  url?: string | null;
  /** Title */
  title?: string | null;
}

/** InfoBlobPublic */
export interface InfoBlobPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  metadata: InfoBlobMetadata;
  /** Group Id */
  group_id?: string | null;
  /** Website Id */
  website_id?: string | null;
  /** Text */
  text: string;
}

/** InfoBlobPublicNoText */
export interface InfoBlobPublicNoText {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  metadata: InfoBlobMetadata;
  /** Group Id */
  group_id?: string | null;
  /** Website Id */
  website_id?: string | null;
}

/** InfoBlobUpdatePublic */
export interface InfoBlobUpdatePublic {
  metadata: InfoBlobMetadataUpsertPublic;
}

/** InfoBlobUpsertRequest */
export interface InfoBlobUpsertRequest {
  /** Info Blobs */
  info_blobs: InfoBlobAddPublic[];
}

/**
 * InitiateAuthResponse
 * Response with IdP authorization URL.
 * @example {"authorization_url":"https://idp.example.com/authorize?client_id=abc123&...","state":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
 */
export interface InitiateAuthResponse {
  /** Authorization Url */
  authorization_url: string;
  /** State */
  state: string;
}

/** InputField */
export interface InputField {
  type: InputFieldType;
  /** Description */
  description?: string | null;
}

/** InputFieldPublic */
export interface InputFieldPublic {
  /** Accepted File Types */
  accepted_file_types: AcceptedFileType[];
  limit: Limit;
  type: InputFieldType;
  /** Description */
  description?: string | null;
}

/** InputFieldType */
export enum InputFieldType {
  TextField = 'text-field',
  TextUpload = 'text-upload',
  AudioUpload = 'audio-upload',
  AudioRecorder = 'audio-recorder',
  ImageUpload = 'image-upload',
}

/** Integration */
export interface Integration {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  integration_type: IntegrationType;
}

/** IntegrationKnowledgeMetaData */
export interface IntegrationKnowledgeMetaData {
  /** Size */
  size: number;
  /** Last Sync Summary */
  last_sync_summary?: Record<string, any> | null;
  /** Last Synced At */
  last_synced_at?: string | null;
  /**
   * Sharepoint Subscription Expires At
   * When the SharePoint webhook subscription expires (only for SharePoint integrations)
   */
  sharepoint_subscription_expires_at?: string | null;
}

/** IntegrationKnowledgePublic */
export interface IntegrationKnowledgePublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Original Name */
  original_name?: string | null;
  /** Url */
  url: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  /**
   * User Integration Id
   * @format uuid
   */
  user_integration_id: string;
  embedding_model: EmbeddingModelPublicLegacy;
  /** Site Id */
  site_id?: string | null;
  /** Drive Id */
  drive_id?: string | null;
  /** Resource Type */
  resource_type?: string | null;
  /** Sharepoint Subscription Id */
  sharepoint_subscription_id?: string | null;
  /** Folder Id */
  folder_id?: string | null;
  /** Folder Path */
  folder_path?: string | null;
  /** Selected Item Type */
  selected_item_type?: string | null;
  /** Wrapper Id */
  wrapper_id?: string | null;
  /** Wrapper Name */
  wrapper_name?: string | null;
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  metadata: IntegrationKnowledgeMetaData;
  /** Integration Type */
  integration_type: IntegrationKnowledgePublicIntegrationTypeEnum;
  /**
   * Enum
   * Create a collection of name/value pairs.
   *
   * Example enumeration:
   *
   * >>> class Color(Enum):
   * ...     RED = 1
   * ...     BLUE = 2
   * ...     GREEN = 3
   *
   * Access them by:
   *
   * - attribute access::
   *
   * >>> Color.RED
   * <Color.RED: 1>
   *
   * - value lookup:
   *
   * >>> Color(1)
   * <Color.RED: 1>
   *
   * - name lookup:
   *
   * >>> Color['RED']
   * <Color.RED: 1>
   *
   * Enumerations can be iterated over, and know how many members they have:
   *
   * >>> len(Color)
   * 3
   *
   * >>> list(Color)
   * [<Color.RED: 1>, <Color.BLUE: 2>, <Color.GREEN: 3>]
   *
   * Methods can be added to enumerations, and members can have their own
   * attributes -- see the documentation for details.
   */
  task: any;
}

/** IntegrationList */
export interface IntegrationList {
  /** Items */
  items: Integration[];
  /** Count */
  count: number;
}

/** IntegrationPreviewData */
export interface IntegrationPreviewData {
  /** Key */
  key: string;
  /** Type */
  type: string;
  /** Name */
  name: string;
  /** Url */
  url: string;
  /** Category */
  category?: string | null;
}

/** IntegrationPreviewDataList */
export interface IntegrationPreviewDataList {
  /** Items */
  items: IntegrationPreviewData[];
  /** Count */
  count: number;
}

/** IntegrationType */
export enum IntegrationType {
  Confluence = 'confluence',
  Sharepoint = 'sharepoint',
}

/** JobPublic */
export interface JobPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name?: string | null;
  status: Status;
  task: Task;
  /** Result Location */
  result_location?: string | null;
  /** Finished At */
  finished_at?: string | null;
}

/** Knowledge */
export interface Knowledge {
  groups: PaginatedPermissionsCollectionPublic;
  websites: PaginatedPermissionsWebsitePublic;
  integration_knowledge_list: PaginatedPermissionsIntegrationKnowledgePublic;
}

/** Limit */
export interface Limit {
  /** Max Files */
  max_files: number;
  /** Max Size */
  max_size: number;
}

/** Limits */
export interface Limits {
  info_blobs: InfoBlobLimits;
  attachments: AttachmentLimits;
}

/** LoggingDetailsPublic */
export interface LoggingDetailsPublic {
  /** Context */
  context?: string | null;
  /** Model Kwargs */
  model_kwargs: Record<string, any>;
  /** Json Body */
  json_body: any;
}

/**
 * MCPConnectionStatus
 * Status of MCP server connection attempt.
 */
export interface MCPConnectionStatus {
  /** Success */
  success: boolean;
  /**
   * Tools Discovered
   * @default 0
   */
  tools_discovered?: number;
  /** Error Message */
  error_message?: string | null;
}

/**
 * MCPServerCreate
 * DTO for creating an MCP server (admin only, uses Streamable HTTP transport).
 */
export interface MCPServerCreate {
  /** Name */
  name: string;
  /**
   * Http Url
   * @format uri
   * @minLength 1
   */
  http_url: string;
  /**
   * Http Auth Type
   * @default "none"
   */
  http_auth_type?: McpServerCreateHttpAuthTypeEnum;
  /** Description */
  description?: string | null;
  /** Http Auth Config Schema */
  http_auth_config_schema?: Record<string, any> | null;
  /** Tags */
  tags?: string[] | null;
  /** Icon Url */
  icon_url?: string | null;
  /** Documentation Url */
  documentation_url?: string | null;
}

/**
 * MCPServerCreateResponse
 * Response for MCP server creation including connection status.
 */
export interface MCPServerCreateResponse {
  /** Public DTO for MCP server (HTTP-only, uses Streamable HTTP transport). */
  server: MCPServerPublic;
  /** Status of MCP server connection attempt. */
  connection: MCPConnectionStatus;
}

/**
 * MCPServerPublic
 * Public DTO for MCP server (HTTP-only, uses Streamable HTTP transport).
 */
export interface MCPServerPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Http Url */
  http_url: string;
  /** Http Auth Type */
  http_auth_type: string;
  /** Has Credentials */
  has_credentials: boolean;
  /** Credential Preview */
  credential_preview?: string | null;
  /** Tags */
  tags: string[] | null;
  /** Icon Url */
  icon_url: string | null;
  /** Documentation Url */
  documentation_url: string | null;
}

/**
 * MCPServerSettingsCreate
 * DTO for enabling an MCP server for tenant.
 */
export interface MCPServerSettingsCreate {
  /** Env Vars */
  env_vars?: Record<string, any> | null;
}

/**
 * MCPServerSettingsPublic
 * DTO for MCP server with tenant settings.
 */
export interface MCPServerSettingsPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Http Url */
  http_url: string;
  /** Http Auth Type */
  http_auth_type: string;
  /** Has Credentials */
  has_credentials: boolean;
  /** Credential Preview */
  credential_preview?: string | null;
  /** Tags */
  tags: string[] | null;
  /** Icon Url */
  icon_url: string | null;
  /** Documentation Url */
  documentation_url: string | null;
  /**
   * Mcp Server Id
   * @format uuid
   */
  mcp_server_id: string;
  /** Is Org Enabled */
  is_org_enabled: boolean;
  /**
   * Tools
   * @default []
   */
  tools?: MCPServerToolPublic[];
  /**
   * Tools Count
   * Number of tools available on this server.
   */
  tools_count: number;
  /**
   * Is Available
   * Whether this MCP is enabled and available for use.
   */
  is_available: boolean;
}

/**
 * MCPServerSettingsUpdate
 * DTO for updating MCP server settings.
 */
export interface MCPServerSettingsUpdate {
  /** Is Org Enabled */
  is_org_enabled?: boolean | null;
  /** Env Vars */
  env_vars?: Record<string, any> | null;
}

/** MCPServerToolList */
export interface MCPServerToolList {
  /** Items */
  items: MCPServerToolPublic[];
  /** Count */
  count: number;
}

/**
 * MCPServerToolPublic
 * DTO for MCP server tool.
 */
export interface MCPServerToolPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Mcp Server Id
   * @format uuid
   */
  mcp_server_id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Input Schema */
  input_schema: Record<string, any> | null;
  /** Is Enabled By Default */
  is_enabled_by_default: boolean;
}

/**
 * MCPServerToolSyncResponse
 * Response for tool sync operation including connection status.
 */
export interface MCPServerToolSyncResponse {
  /** Tools */
  tools: MCPServerToolPublic[];
  /** Status of MCP server connection attempt. */
  connection: MCPConnectionStatus;
  /** Count */
  count: number;
}

/**
 * MCPServerToolUpdate
 * DTO for updating tenant-level tool settings.
 */
export interface MCPServerToolUpdate {
  /** Is Enabled */
  is_enabled: boolean;
}

/**
 * MCPServerUpdate
 * DTO for updating an MCP server (admin only, uses Streamable HTTP transport).
 */
export interface MCPServerUpdate {
  /** Name */
  name?: string | null;
  /** Http Url */
  http_url?: string | null;
  /** Http Auth Type */
  http_auth_type?: McpServerUpdateHttpAuthTypeEnum | null;
  /** Description */
  description?: string | null;
  /** Http Auth Config Schema */
  http_auth_config_schema?: Record<string, any> | null;
  /** Tags */
  tags?: string[] | null;
  /** Icon Url */
  icon_url?: string | null;
  /** Documentation Url */
  documentation_url?: string | null;
}

/**
 * MCPToolSetting
 * MCP server tool enablement setting.
 */
export interface MCPToolSetting {
  /**
   * Tool Id
   * @format uuid
   */
  tool_id: string;
  /** Is Enabled */
  is_enabled: boolean;
}

/** Message */
export interface Message {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** Id */
  id?: string | null;
  /** Question */
  question: string;
  /** Answer */
  answer: string;
  completion_model?: CompletionModel | null;
  /** References */
  references: InfoBlobPublicNoText[];
  /** Files */
  files: FilePublic[];
  tools: UseTools;
  /** Generated Files */
  generated_files: FilePublic[];
  /** Web Search References */
  web_search_references: WebSearchResultPublic[];
  /**
   * Tool Calls
   * @default []
   */
  tool_calls?: ToolCallInfo[];
}

/** MessageLogging */
export interface MessageLogging {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** Id */
  id?: string | null;
  /** Question */
  question: string;
  /** Answer */
  answer: string;
  completion_model?: CompletionModel | null;
  /** References */
  references: InfoBlobPublicNoText[];
  /** Files */
  files: FilePublic[];
  tools: UseTools;
  /** Generated Files */
  generated_files: FilePublic[];
  /** Web Search References */
  web_search_references: WebSearchResultPublic[];
  /**
   * Tool Calls
   * @default []
   */
  tool_calls?: ToolCallInfo[];
  logging_details: LoggingDetailsPublic;
}

/** MetadataCount */
export interface MetadataCount {
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Count */
  count: number;
}

/** MetadataStatistics */
export interface MetadataStatistics {
  /** Assistants */
  assistants: AssistantMetadata[];
  /** Sessions */
  sessions: SessionMetadata[];
  /** Questions */
  questions: QuestionMetadata[];
}

/** MetadataStatisticsAggregated */
export interface MetadataStatisticsAggregated {
  /** Assistants */
  assistants: MetadataCount[];
  /** Sessions */
  sessions: MetadataCount[];
  /** Questions */
  questions: MetadataCount[];
}

/**
 * MigrationResult
 * Result of a model migration operation.
 */
export interface MigrationResult {
  /** Success */
  success: boolean;
  /** Migrated Count */
  migrated_count: number;
  /** Failed Count */
  failed_count: number;
  /** Details */
  details: Record<string, number>;
  /** Duration */
  duration: number;
  /**
   * Migration Id
   * @format uuid
   */
  migration_id: string;
  /**
   * Warnings
   * @default []
   */
  warnings?: string[];
  /**
   * Auto Recalculated
   * @default false
   */
  auto_recalculated?: boolean;
  /**
   * Requires Manual Recalculation
   * @default false
   */
  requires_manual_recalculation?: boolean;
}

/** ModelFamily */
export enum ModelFamily {
  Openai = 'openai',
  Mistral = 'mistral',
  Vllm = 'vllm',
  Claude = 'claude',
  Azure = 'azure',
  Ovhcloud = 'ovhcloud',
  E5 = 'e5',
}

/** ModelHostingLocation */
export enum ModelHostingLocation {
  Usa = 'usa',
  Eu = 'eu',
  Swe = 'swe',
  Chn = 'chn',
  Can = 'can',
  Gbr = 'gbr',
  Isr = 'isr',
  Kor = 'kor',
  Deu = 'deu',
  Fra = 'fra',
  Jpn = 'jpn',
}

/** ModelId */
export interface ModelId {
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/**
 * ModelInfo
 * Information about the model used by the assistant.
 */
export interface ModelInfo {
  /** Name */
  name: string;
  /** Token Limit */
  token_limit: number;
  /** Prompt Tokens */
  prompt_tokens?: number | null;
}

/** ModelKwargs */
export interface ModelKwargs {
  /** Temperature */
  temperature?: number | null;
  /** Top P */
  top_p?: number | null;
  /** Reasoning Effort */
  reasoning_effort?: string | null;
  /** Verbosity */
  verbosity?: string | null;
  /** Response Format */
  response_format?: Record<string, any> | null;
  /** Presence Penalty */
  presence_penalty?: number | null;
  /** Frequency Penalty */
  frequency_penalty?: number | null;
  /** Top K */
  top_k?: number | null;
}

/**
 * ModelMigrationHistory
 * Historical record of a model migration.
 */
export interface ModelMigrationHistory {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * From Model Id
   * @format uuid
   */
  from_model_id: string;
  /** From Model Name */
  from_model_name: string;
  /**
   * To Model Id
   * @format uuid
   */
  to_model_id: string;
  /** To Model Name */
  to_model_name: string;
  /** Migrated Count */
  migrated_count: number;
  /** Status */
  status: string;
  /**
   * Initiated By Id
   * @format uuid
   */
  initiated_by_id: string;
  /** Initiated By Name */
  initiated_by_name: string;
  /** Started At */
  started_at?: string | null;
  /** Completed At */
  completed_at?: string | null;
  /** Duration */
  duration?: number | null;
  /** Error Message */
  error_message?: string | null;
}

/**
 * ModelMigrationRequest
 * Request to migrate usage from one model to another.
 */
export interface ModelMigrationRequest {
  /**
   * To Model Id
   * @format uuid
   */
  to_model_id: string;
  /** Entity Types */
  entity_types?: string[] | null;
  /**
   * Confirm Migration
   * @default false
   */
  confirm_migration?: boolean;
}

/** ModelOrg */
export enum ModelOrg {
  OpenAI = 'OpenAI',
  Meta = 'Meta',
  Microsoft = 'Microsoft',
  Anthropic = 'Anthropic',
  Mistral = 'Mistral',
  KBLab = 'KBLab',
  Google = 'Google',
  Berget = 'Berget',
  GDM = 'GDM',
}

/**
 * ModelProviderCreate
 * Request model for creating a model provider.
 */
export interface ModelProviderCreate {
  /**
   * Name
   * User-defined name for this provider instance
   */
  name: string;
  /**
   * Provider Type
   * Provider type: openai, azure, or anthropic
   */
  provider_type: string;
  /**
   * Credentials
   * Provider credentials (will be encrypted)
   */
  credentials: Record<string, any>;
  /**
   * Config
   * Additional configuration
   */
  config?: Record<string, any>;
  /**
   * Is Active
   * Whether the provider is active
   * @default true
   */
  is_active?: boolean;
}

/**
 * ModelProviderPublic
 * Public response model for a model provider (without credentials).
 */
export interface ModelProviderPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Name */
  name: string;
  /** Provider Type */
  provider_type: string;
  /** Config */
  config: Record<string, any>;
  /** Is Active */
  is_active: boolean;
  /** Masked Api Key */
  masked_api_key?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/**
 * ModelProviderUpdate
 * Request model for updating a model provider.
 */
export interface ModelProviderUpdate {
  /**
   * Name
   * User-defined name for this provider instance
   */
  name?: string | null;
  /**
   * Provider Type
   * Provider type: openai, azure, or anthropic
   */
  provider_type?: string | null;
  /**
   * Credentials
   * Provider credentials (will be encrypted)
   */
  credentials?: Record<string, any> | null;
  /**
   * Config
   * Additional configuration
   */
  config?: Record<string, any> | null;
  /**
   * Is Active
   * Whether the provider is active
   */
  is_active?: boolean | null;
}

/** ModelStability */
export enum ModelStability {
  Stable = 'stable',
  Experimental = 'experimental',
}

/** ModelUsage */
export interface ModelUsage {
  /**
   * Model Id
   * @format uuid
   */
  model_id: string;
  /** Model Name */
  model_name: string;
  /**
   * Model Nickname
   * User-friendly name of the model
   */
  model_nickname: string;
  /**
   * Model Org
   * Organization providing the model
   */
  model_org?: string | null;
  /**
   * Model Provider
   * Provider name for the model
   */
  model_provider?: string | null;
  /**
   * Input Token Usage
   * Number of tokens used for input prompts
   */
  input_token_usage: number;
  /**
   * Output Token Usage
   * Number of tokens used for model outputs
   */
  output_token_usage: number;
  /**
   * Total Token Usage
   * Total tokens (input + output)
   */
  total_token_usage: number;
  /**
   * Request Count
   * Number of requests made with this model
   */
  request_count: number;
}

/**
 * ModelUsageDetail
 * Detailed information about a specific entity using a completion model.
 */
export interface ModelUsageDetail {
  /**
   * Entity Id
   * @format uuid
   */
  entity_id: string;
  /** Entity Name */
  entity_name: string;
  /** Entity Type */
  entity_type: string;
  /** Space Id */
  space_id?: string | null;
  /** Space Name */
  space_name?: string | null;
  /** Owner Id */
  owner_id?: string | null;
  /** Owner Name */
  owner_name?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Last Used */
  last_used?: string | null;
  /** Usage Count */
  usage_count?: number | null;
}

/**
 * ModelUsageStatistics
 * Pre-aggregated usage statistics for a completion model.
 */
export interface ModelUsageStatistics {
  /**
   * Model Id
   * @format uuid
   */
  model_id: string;
  /** Total Usage */
  total_usage: number;
  /** Assistants Count */
  assistants_count: number;
  /** Apps Count */
  apps_count: number;
  /** Services Count */
  services_count: number;
  /** Questions Count */
  questions_count: number;
  /** Assistant Templates Count */
  assistant_templates_count: number;
  /** App Templates Count */
  app_templates_count: number;
  /** Spaces Count */
  spaces_count: number;
  /**
   * Last Updated
   * @format date-time
   */
  last_updated: string;
}

/**
 * ModelUsageSummary
 * Summary of usage for a single model.
 */
export interface ModelUsageSummary {
  /**
   * Model Id
   * @format uuid
   */
  model_id: string;
  /** Model Name */
  model_name: string;
  /** Model Nickname */
  model_nickname: string;
  /** Is Enabled */
  is_enabled: boolean;
  /** Total Usage */
  total_usage: number;
  /**
   * Last Updated
   * @format date-time
   */
  last_updated: string;
}

/**
 * ModelsPresentation
 * Presentation model for all types of AI models.
 */
export interface ModelsPresentation {
  /** Completion Models */
  completion_models: CompletionModelSecurityStatus[];
  /** Embedding Models */
  embedding_models: EmbeddingModelSecurityStatus[];
  /** Transcription Models */
  transcription_models: TranscriptionModelSecurityStatus[];
}

/** ModuleBase */
export interface ModuleBase {
  /** Name */
  name: Modules | string;
}

/** ModuleInDB */
export interface ModuleInDB {
  /** Name */
  name: Modules | string;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/**
 * Modules
 * Any change to these enums will result in database changes
 */
export enum Modules {
  IntricApplications = 'intric-applications',
}

/** OIDCDebugToggleRequest */
export interface OIDCDebugToggleRequest {
  /**
   * Enabled
   * Enable or disable OIDC debug logging
   */
  enabled: boolean;
  /**
   * Duration Minutes
   * Duration in minutes before the toggle auto-expires (max 120)
   * @default 30
   */
  duration_minutes?: number | null;
  /**
   * Reason
   * Optional note for audit trail
   */
  reason?: string | null;
}

/** OIDCDebugToggleResponse */
export interface OIDCDebugToggleResponse {
  /** Enabled */
  enabled: boolean;
  /** Enabled At */
  enabled_at: string | null;
  /** Enabled By */
  enabled_by: string | null;
  /** Expires At */
  expires_at: string | null;
  /** Reason */
  reason: string | null;
  /** Backend */
  backend: string;
}

/** OpenIdConnectLogin */
export interface OpenIdConnectLogin {
  /** Code */
  code: string;
  /** Code Verifier */
  code_verifier: string;
  /** Redirect Uri */
  redirect_uri: string;
  /** Client Id */
  client_id: string;
  /**
   * Grant Type
   * @default "authorization_code"
   */
  grant_type?: string;
  /**
   * Scope
   * @default "openid"
   */
  scope?: string;
  /** Nonce */
  nonce?: string | null;
}

/**
 * Outcome
 * Indicate success or failure of audited action
 */
export enum Outcome {
  Success = 'success',
  Failure = 'failure',
}

/** PaginatedPermissions[AppSparse] */
export interface PaginatedPermissionsAppSparse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: AppSparse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[AssistantSparse] */
export interface PaginatedPermissionsAssistantSparse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: AssistantSparse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[CollectionPublic] */
export interface PaginatedPermissionsCollectionPublic {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: CollectionPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[GroupChatSparse] */
export interface PaginatedPermissionsGroupChatSparse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: GroupChatSparse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[IntegrationKnowledgePublic] */
export interface PaginatedPermissionsIntegrationKnowledgePublic {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: IntegrationKnowledgePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[ServiceSparse] */
export interface PaginatedPermissionsServiceSparse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: ServiceSparse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[SpaceGroupMember] */
export interface PaginatedPermissionsSpaceGroupMember {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: SpaceGroupMember[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[SpaceMember] */
export interface PaginatedPermissionsSpaceMember {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: SpaceMember[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedPermissions[WebsitePublic] */
export interface PaginatedPermissionsWebsitePublic {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * Items
   * List of items returned in the response
   */
  items: WebsitePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/**
 * PaginatedResponse
 * Generic paginated response with cursor-based pagination.
 */
export interface PaginatedResponse {
  /** Items */
  items: ModelUsageDetail[];
  /** Total */
  total: number;
  /** Has More */
  has_more: boolean;
  /** Next Cursor */
  next_cursor?: string | null;
  /** Prev Cursor */
  prev_cursor?: string | null;
}

/** PaginatedResponse[AllowedOriginInDB] */
export interface PaginatedResponseAllowedOriginInDB {
  /**
   * Items
   * List of items returned in the response
   */
  items: AllowedOriginInDB[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[AllowedOriginPublic] */
export interface PaginatedResponseAllowedOriginPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: AllowedOriginPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[AppRunSparse] */
export interface PaginatedResponseAppRunSparse {
  /**
   * Items
   * List of items returned in the response
   */
  items: AppRunSparse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[AssistantPublic] */
export interface PaginatedResponseAssistantPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: AssistantPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[CompletionModelPublic] */
export interface PaginatedResponseCompletionModelPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: CompletionModelPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[CrawlRunPublic] */
export interface PaginatedResponseCrawlRunPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: IntricWebsitesPresentationWebsiteModelsCrawlRunPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[EmbeddingModelLegacy] */
export interface PaginatedResponseEmbeddingModelLegacy {
  /**
   * Items
   * List of items returned in the response
   */
  items: EmbeddingModelLegacy[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[EmbeddingModelPublic] */
export interface PaginatedResponseEmbeddingModelPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: EmbeddingModelPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[FilePublic] */
export interface PaginatedResponseFilePublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: FilePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[GroupPublicWithMetadata] */
export interface PaginatedResponseGroupPublicWithMetadata {
  /**
   * Items
   * List of items returned in the response
   */
  items: GroupPublicWithMetadata[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[InfoBlobPublicNoText] */
export interface PaginatedResponseInfoBlobPublicNoText {
  /**
   * Items
   * List of items returned in the response
   */
  items: InfoBlobPublicNoText[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[InfoBlobPublic] */
export interface PaginatedResponseInfoBlobPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: InfoBlobPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[JobPublic] */
export interface PaginatedResponseJobPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: JobPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[MCPServerPublic] */
export interface PaginatedResponseMCPServerPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: MCPServerPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[MCPServerSettingsPublic] */
export interface PaginatedResponseMCPServerSettingsPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: MCPServerSettingsPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[Message] */
export interface PaginatedResponseMessage {
  /**
   * Items
   * List of items returned in the response
   */
  items: Message[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[ModuleInDB] */
export interface PaginatedResponseModuleInDB {
  /**
   * Items
   * List of items returned in the response
   */
  items: ModuleInDB[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[PredefinedRolePublic] */
export interface PaginatedResponsePredefinedRolePublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: PredefinedRolePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[PromptSparse] */
export interface PaginatedResponsePromptSparse {
  /**
   * Items
   * List of items returned in the response
   */
  items: PromptSparse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[RolePublic] */
export interface PaginatedResponseRolePublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: RolePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[SemanticSearchResponse] */
export interface PaginatedResponseSemanticSearchResponse {
  /**
   * Items
   * List of items returned in the response
   */
  items: SemanticSearchResponse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[ServicePublicWithUser] */
export interface PaginatedResponseServicePublicWithUser {
  /**
   * Items
   * List of items returned in the response
   */
  items: ServicePublicWithUser[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[ServiceRun] */
export interface PaginatedResponseServiceRun {
  /**
   * Items
   * List of items returned in the response
   */
  items: ServiceRun[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[SpaceDashboard] */
export interface PaginatedResponseSpaceDashboard {
  /**
   * Items
   * List of items returned in the response
   */
  items: SpaceDashboard[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[SpaceGroupMember] */
export interface PaginatedResponseSpaceGroupMember {
  /**
   * Items
   * List of items returned in the response
   */
  items: SpaceGroupMember[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[SpaceSparse] */
export interface PaginatedResponseSpaceSparse {
  /**
   * Items
   * List of items returned in the response
   */
  items: SpaceSparse[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[TenantWithMaskedCredentials] */
export interface PaginatedResponseTenantWithMaskedCredentials {
  /**
   * Items
   * List of items returned in the response
   */
  items: TenantWithMaskedCredentials[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[TranscriptionModelPublic] */
export interface PaginatedResponseTranscriptionModelPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: TranscriptionModelPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[UserGroupPublic] */
export interface PaginatedResponseUserGroupPublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: UserGroupPublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[UserInDB] */
export interface PaginatedResponseUserInDB {
  /**
   * Items
   * List of items returned in the response
   */
  items: UserInDB[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[WebsitePublic] */
export interface PaginatedResponseWebsitePublic {
  /**
   * Items
   * List of items returned in the response
   */
  items: WebsitePublic[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/** PaginatedResponse[str] */
export interface PaginatedResponseStr {
  /**
   * Items
   * List of items returned in the response
   */
  items: string[];
  /**
   * Count
   * Number of items returned in the response
   */
  count: number;
}

/**
 * PaginatedSyncLogList
 * Paginated sync logs response with metadata.
 */
export interface PaginatedSyncLogList {
  /** Items */
  items: SyncLog[];
  /** Total Count */
  total_count: number;
  /** Page Size */
  page_size: number;
  /** Offset */
  offset: number;
  /** Count */
  count: number;
  /**
   * Current Page
   * Calculate the current page number (1-indexed).
   */
  current_page: number;
  /**
   * Total Pages
   * Calculate the total number of pages.
   */
  total_pages: number;
  /**
   * Has Next
   * Check if there is a next page.
   */
  has_next: boolean;
  /**
   * Has Previous
   * Check if there is a previous page.
   */
  has_previous: boolean;
}

/** PaginatedUsersResponse[UserAdminView] */
export interface PaginatedUsersResponseUserAdminView {
  /**
   * Items
   * List of users for the current page
   */
  items: UserAdminView[];
  /** Pagination metadata for navigation */
  metadata: PaginationMetadata;
}

/**
 * PaginationMetadata
 * Pagination metadata for frontend navigation.
 *
 * Provides all information needed to build pagination UI (page numbers, next/previous buttons).
 * Includes counts by state for tab display.
 */
export interface PaginationMetadata {
  /**
   * Page
   * Current page number (1-based)
   */
  page: number;
  /**
   * Page Size
   * Number of items per page
   */
  page_size: number;
  /**
   * Total Count
   * Total number of items across all pages
   */
  total_count: number;
  /**
   * Total Pages
   * Total number of pages (calculated from total_count and page_size)
   */
  total_pages: number;
  /**
   * Has Next
   * Whether there is a next page available
   */
  has_next: boolean;
  /**
   * Has Previous
   * Whether there is a previous page available
   */
  has_previous: boolean;
  /**
   * Counts
   * Optional counts by state (active, inactive) for tab display
   */
  counts?: Record<string, number> | null;
}

/** PartialAssistantUpdatePublic */
export interface PartialAssistantUpdatePublic {
  /** Name */
  name?: string | null;
  /**
   * This field is deprecated and will be ignored
   * @deprecated
   */
  completion_model_kwargs?: ModelKwargs | null;
  /**
   * Logging Enabled
   * This field is deprecated and will be ignored
   * @deprecated
   */
  logging_enabled?: boolean | null;
  /** Space Id */
  space_id?: string | null;
  prompt?: PromptCreate | null;
  /**
   * Groups
   * This field is deprecated and will be ignored
   * @deprecated
   */
  groups?: ModelId[] | null;
  /**
   * Websites
   * This field is deprecated and will be ignored
   * @deprecated
   */
  websites?: ModelId[] | null;
  /**
   * Integration Knowledge List
   * This field is deprecated and will be ignored
   * @deprecated
   */
  integration_knowledge_list?: ModelId[] | null;
  /**
   * Mcp Servers
   * This field is deprecated and will be ignored
   * @deprecated
   */
  mcp_servers?: ModelId[] | null;
  /**
   * This field is deprecated and will be ignored
   * @deprecated
   */
  guardrail?: AssistantGuard | null;
  /**
   * This field is deprecated and will be ignored
   * @deprecated
   */
  completion_model?: ModelId | null;
  /** Attachments */
  attachments?: ModelId[] | null;
  /** Mcp Tools */
  mcp_tools?: MCPToolSetting[] | null;
  /**
   * Description
   * A description of the assitant that will be used as default description in GroupChatAssistantPublic
   * @example "This is a helpful AI assistant"
   */
  description?: string | null;
  /**
   * Insight Enabled
   * Whether insights are enabled for this assistant. If enabled, users with appropriate permissions can see all sessions for this assistant.
   */
  insight_enabled?: boolean | null;
  /** Data Retention Days */
  data_retention_days?: number | null;
  /**
   * Metadata Json
   * Metadata for the assistant
   */
  metadata_json?: Record<string, any> | null;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon. Set to null to remove.
   */
  icon_id?: string | null;
}

/** PartialCompletionModelUpdate */
export interface PartialCompletionModelUpdate {
  /** Name */
  name?: string | null;
  /** Nickname */
  nickname?: string | null;
  /** Family */
  family?: ModelFamily | string | null;
  /** Token Limit */
  token_limit?: number | null;
  /** Is Deprecated */
  is_deprecated?: boolean | null;
  /** Nr Billion Parameters */
  nr_billion_parameters?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  /** Stability */
  stability?: ModelStability | string | null;
  /** Hosting */
  hosting?: ModelHostingLocation | string | null;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Deployment Name */
  deployment_name?: string | null;
  /** Org */
  org?: ModelOrg | string | null;
  /** Vision */
  vision?: boolean | null;
  /** Reasoning */
  reasoning?: boolean | null;
  /** Supports Tool Calling */
  supports_tool_calling?: boolean | null;
  /** Base Url */
  base_url?: string | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /** Id */
  id?: string | null;
}

/** PartialEmbeddingModelUpdate */
export interface PartialEmbeddingModelUpdate {
  /** Name */
  name?: string | null;
  family?: EmbeddingModelFamily | null;
  /** Is Deprecated */
  is_deprecated?: boolean | null;
  /** Open Source */
  open_source?: boolean | null;
  /** Dimensions */
  dimensions?: number | null;
  /** Max Input */
  max_input?: number | null;
  /** Max Batch Size */
  max_batch_size?: number | null;
  /** Hf Link */
  hf_link?: string | null;
  stability?: ModelStability | null;
  hosting?: ModelHostingLocation | null;
  /** Description */
  description?: string | null;
  org?: ModelOrg | null;
  /** Litellm Model Name */
  litellm_model_name?: string | null;
  /** Id */
  id?: string | null;
}

/** PartialPropUserUpdate */
export interface PartialPropUserUpdate {
  predefined_role?: ModelId | null;
  state?: UserState | null;
}

/** PartialServiceUpdatePublic */
export interface PartialServiceUpdatePublic {
  /** Output Format */
  output_format?: PartialServiceUpdatePublicOutputFormatEnum | null;
  /** Json Schema */
  json_schema?: Record<string, any> | null;
  /** Name */
  name?: string | null;
  /** Prompt */
  prompt?: string | null;
  completion_model_kwargs?: ModelKwargs | null;
  /** Groups */
  groups?: ModelId[] | null;
  completion_model?: ModelId | null;
}

/** PartialUpdateSpaceRequest */
export interface PartialUpdateSpaceRequest {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Embedding Models */
  embedding_models?: ModelId[] | null;
  /** Completion Models */
  completion_models?: ModelId[] | null;
  /** Transcription Models */
  transcription_models?: ModelId[] | null;
  /** Mcp Servers */
  mcp_servers?: ModelId[] | null;
  /** Mcp Tools */
  mcp_tools?: MCPToolSetting[] | null;
  /**
   * Security Classification
   * ID of the security classification to apply to this space. Set to null to remove the security classification. Omit to keep the current security classification unchanged.
   */
  security_classification?: ModelId | null;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon. Set to null to remove.
   */
  icon_id?: string | null;
  /**
   * Data Retention Days
   * Number of days to retain conversation history for this space. Applies to all assistants and apps in the space that don't have their own retention policy. Set to null to disable space-level retention. Omit to keep the current retention policy unchanged. Valid range: 1-2555 days (1 day to 7 years).
   */
  data_retention_days?: number | null;
}

/**
 * PendingQueueSummary
 * Pending crawl queue summary.
 */
export interface PendingQueueSummary {
  /**
   * Total
   * @default 0
   */
  total?: number;
  /**
   * Tenant Count
   * @default 0
   */
  tenant_count?: number;
  /**
   * Top Tenants
   * @default {}
   */
  top_tenants?: Record<string, number>;
}

/** Permission */
export enum Permission {
  Assistants = 'assistants',
  GroupChats = 'group_chats',
  Apps = 'apps',
  Services = 'services',
  Collections = 'collections',
  Insights = 'insights',
  AI = 'AI',
  Editor = 'editor',
  Admin = 'admin',
  Websites = 'websites',
  Integrations = 'integrations',
}

/** PermissionPublic */
export interface PermissionPublic {
  name: Permission;
  /** Description */
  description: string;
}

/** PredefinedRoleInDB */
export interface PredefinedRoleInDB {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** Name */
  name: string;
  /** Permissions */
  permissions: Permission[];
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/** PredefinedRolePublic */
export interface PredefinedRolePublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** Name */
  name: string;
  /** Permissions */
  permissions: Permission[];
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/** PrivacyPolicy */
export interface PrivacyPolicy {
  /** Url */
  url?: string | null;
}

/** PromptCreate */
export interface PromptCreate {
  /** Text */
  text: string;
  /** Description */
  description?: string | null;
}

/** PromptPublic */
export interface PromptPublic {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Description */
  description?: string | null;
  /** Is Selected */
  is_selected?: boolean | null;
  user: UserSparse;
  /** Text */
  text: string;
}

/** PromptPublicAppTemplate */
export interface PromptPublicAppTemplate {
  /** Text */
  text: string | null;
}

/** PromptPublicAssistantTemplate */
export interface PromptPublicAssistantTemplate {
  /** Text */
  text: string | null;
}

/** PromptSparse */
export interface PromptSparse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Description */
  description?: string | null;
  /** Is Selected */
  is_selected: boolean;
  user: UserSparse;
}

/** PromptUpdateRequest */
export interface PromptUpdateRequest {
  /** Description */
  description?: string | null;
}

/** PropUserInvite */
export interface PropUserInvite {
  predefined_role?: ModelId | null;
  state?: UserState | null;
  /**
   * Email
   * @format email
   */
  email: string;
}

/** QuestionMetadata */
export interface QuestionMetadata {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Assistant Id */
  assistant_id?: string | null;
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
}

/** ResourcePermission */
export enum ResourcePermission {
  Read = 'read',
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
  Add = 'add',
  Remove = 'remove',
  Publish = 'publish',
  InsightView = 'insight_view',
  InsightToggle = 'insight_toggle',
}

/**
 * RetentionPolicyResponse
 * Schema for audit log retention policy response.
 *
 * Note: Conversation retention is configured at the Assistant, App, or Space level,
 * not at the tenant level, to prevent accidental data loss.
 */
export interface RetentionPolicyResponse {
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /**
   * Retention Days
   * Days to retain audit logs (1-2555). Recommended: 90+
   * @min 1
   * @max 2555
   */
  retention_days: number;
  /** Last Purge At */
  last_purge_at?: string | null;
  /** Purge Count */
  purge_count: number;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/**
 * RetentionPolicyUpdateRequest
 * Schema for updating audit log retention policy.
 *
 * Note: Conversation retention is configured at the Assistant, App, or Space level,
 * not at the tenant level, to prevent accidental data loss.
 */
export interface RetentionPolicyUpdateRequest {
  /**
   * Retention Days
   * Days to retain audit logs (1 day minimum, 2555 days/7 years maximum). Recommended: 90+ days for compliance
   * @min 1
   * @max 2555
   */
  retention_days: number;
}

/** RoleCreateRequest */
export interface RoleCreateRequest {
  /** Name */
  name: string;
  /** Permissions */
  permissions: Permission[];
}

/** RoleInDB */
export interface RoleInDB {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Permissions */
  permissions: Permission[];
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
}

/** RolePublic */
export interface RolePublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Permissions */
  permissions: Permission[];
}

/** RoleUpdateRequest */
export interface RoleUpdateRequest {
  /** Name */
  name?: string | null;
  /** Permissions */
  permissions?: Permission[] | null;
}

/** RolesPaginatedResponse */
export interface RolesPaginatedResponse {
  roles: PaginatedResponseRolePublic;
  predefined_roles: PaginatedResponsePredefinedRolePublic;
}

/** RunAppRequest */
export interface RunAppRequest {
  /**
   * Files
   * @default []
   */
  files?: ModelId[];
  /** Text */
  text?: string | null;
}

/** RunService */
export interface RunService {
  /** Input */
  input: string;
  /**
   * Files
   * @maxItems 20
   * @default []
   */
  files?: ModelId[];
}

/**
 * SecurityClassificationCreatePublic
 * Base model for security classification data.
 */
export interface SecurityClassificationCreatePublic {
  /**
   * Name
   * Name of the security classification
   */
  name: string;
  /**
   * Description
   * Description of the security classification
   */
  description?: string | null;
  /**
   * Set Lowest Security
   * Set lowest security level (0) if true, highest level if false
   * @default true
   */
  set_lowest_security?: boolean;
}

/** SecurityClassificationLevelsUpdateRequest */
export interface SecurityClassificationLevelsUpdateRequest {
  /**
   * Security Classifications
   * Security classification IDs
   */
  security_classifications: ModelId[];
}

/**
 * SecurityClassificationPublic
 * Basic security classification information.
 */
export interface SecurityClassificationPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Security Level */
  security_level: number;
}

/** SecurityClassificationResponse */
export interface SecurityClassificationResponse {
  /** Security Enabled */
  security_enabled: boolean;
  /** Security Classifications */
  security_classifications: SecurityClassificationPublic[];
}

/**
 * SecurityClassificationSingleUpdate
 * Model for updating an existing security classification's name and description only.
 */
export interface SecurityClassificationSingleUpdate {
  /**
   * Name
   * Name of the security classification
   */
  name?: string;
  /**
   * Description
   * Description of the security classification
   */
  description?: string | null;
}

/**
 * SecurityClassificationsListPublic
 * All security classifications.
 */
export interface SecurityClassificationsListPublic {
  /** Security Classifications */
  security_classifications: SecurityClassificationPublic[];
}

/**
 * SecurityEnableRequest
 * Request to enable or disable security classifications for a tenant.
 */
export interface SecurityEnableRequest {
  /**
   * Enabled
   * Whether security classifications should be enabled for the tenant
   */
  enabled: boolean;
}

/**
 * SecurityEnableResponse
 * Response after enabling or disabling security classifications for a tenant.
 */
export interface SecurityEnableResponse {
  /**
   * Security Enabled
   * Whether security classifications are now enabled for the tenant
   */
  security_enabled: boolean;
}

/** SemanticSearchRequest */
export interface SemanticSearchRequest {
  /** Search String */
  search_string: string;
  /**
   * Num Chunks
   * @default 30
   */
  num_chunks?: number;
  /**
   * Autocut Cutoff
   * Experimental feature that tries to limit the amount of chunks to only the relevant ones, based on the score. Set to null (or omit completely) to not use this feature
   */
  autocut_cutoff?: number | null;
}

/** SemanticSearchResponse */
export interface SemanticSearchResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Info Blob Id
   * @format uuid
   */
  info_blob_id: string;
  /** Text */
  text: string;
  /** Score */
  score: number;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/**
 * ServiceAccountAuthCallback
 * Request model for service account OAuth callback.
 */
export interface ServiceAccountAuthCallback {
  /**
   * Auth Code
   * OAuth authorization code from Microsoft callback
   */
  auth_code: string;
  /**
   * State
   * OAuth state parameter for verification
   */
  state: string;
}

/**
 * ServiceAccountAuthStart
 * Request model to start service account OAuth flow.
 */
export interface ServiceAccountAuthStart {
  /**
   * Client Id
   * Microsoft Entra ID Application (Client) ID
   * @example "12345678-1234-1234-1234-123456789012"
   */
  client_id: string;
  /**
   * Client Secret
   * Microsoft Entra ID Application Client Secret
   * @example "abc123~xyz789"
   */
  client_secret: string;
  /**
   * Tenant Domain
   * Microsoft Entra ID Tenant Domain (e.g., contoso.onmicrosoft.com)
   * @example "contoso.onmicrosoft.com"
   */
  tenant_domain: string;
}

/**
 * ServiceAccountAuthStartResponse
 * Response with OAuth URL for service account login.
 */
export interface ServiceAccountAuthStartResponse {
  /**
   * Auth Url
   * Microsoft OAuth authorization URL. Redirect the admin to this URL.
   */
  auth_url: string;
  /**
   * State
   * OAuth state parameter for CSRF protection
   */
  state: string;
}

/** ServiceCreatePublic */
export interface ServiceCreatePublic {
  /** Output Format */
  output_format?: ServiceCreatePublicOutputFormatEnum | null;
  /** Json Schema */
  json_schema?: Record<string, any> | null;
  /** Name */
  name: string;
  /** Prompt */
  prompt: string;
  completion_model_kwargs?: ModelKwargs;
  /**
   * Groups
   * @default []
   */
  groups?: ModelId[];
  completion_model: ModelId;
}

/** ServiceOutput */
export interface ServiceOutput {
  /** Output */
  output: any;
  /**
   * Files
   * @default []
   */
  files?: FilePublic[];
}

/** ServicePublicWithUser */
export interface ServicePublicWithUser {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Output Format */
  output_format?: ServicePublicWithUserOutputFormatEnum | null;
  /** Json Schema */
  json_schema?: Record<string, any> | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Prompt */
  prompt: string;
  completion_model_kwargs?: ModelKwargs | null;
  /** Space Id */
  space_id?: string | null;
  /** Groups */
  groups: GroupPublicBase[];
  completion_model: CompletionModelPublic;
  user: UserPublicBase;
}

/** ServiceRun */
export interface ServiceRun {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Input */
  input: string;
  /** Output */
  output: Record<string, any> | any[] | string;
  completion_model: CompletionModelPublic;
  /** References */
  references: InfoBlobPublic[];
}

/** ServiceSparse */
export interface ServiceSparse {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Output Format */
  output_format?: ServiceSparseOutputFormatEnum | null;
  /** Json Schema */
  json_schema?: Record<string, any> | null;
  /** Name */
  name: string;
  /** Prompt */
  prompt: string;
  completion_model_kwargs?: ModelKwargs;
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
}

/** SessionFeedback */
export interface SessionFeedback {
  /** Value */
  value: SessionFeedbackValueEnum;
  /** Text */
  text?: string | null;
}

/** SessionMetadata */
export interface SessionMetadata {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Assistant Id */
  assistant_id?: string | null;
  /** Group Chat Id */
  group_chat_id?: string | null;
}

/** SessionMetadataPublic */
export interface SessionMetadataPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** Name */
  name: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
}

/** SessionPublic */
export interface SessionPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** Name */
  name: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Messages */
  messages: Message[];
  feedback?: SessionFeedback | null;
}

/**
 * SetFederationRequest
 * Request model for setting tenant federation config.
 */
export interface SetFederationRequest {
  /**
   * Provider
   * Identity provider label (e.g., 'mobilityguard', 'entra_id', 'okta', 'auth0')
   */
  provider: string;
  /**
   * Discovery Endpoint
   * OIDC discovery endpoint URL
   */
  discovery_endpoint: string;
  /**
   * Client Id
   * OAuth client ID
   */
  client_id: string;
  /**
   * Client Secret
   * OAuth client secret
   * @minLength 8
   */
  client_secret: string;
  /**
   * Allowed Domains
   * Email domains allowed for this tenant (e.g., ['stockholm.se'])
   */
  allowed_domains?: string[];
  /**
   * Canonical Public Origin
   * Canonical public origin for this tenant (e.g., https://tenant.eneo.se). Required for multi-tenant federation to construct redirect_uri
   */
  canonical_public_origin?: string | null;
  /**
   * Redirect Path
   * Optional custom redirect path starting with /
   */
  redirect_path?: string | null;
}

/**
 * SetFederationResponse
 * Response model for setting federation config.
 */
export interface SetFederationResponse {
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Provider */
  provider: string;
  /** Masked Secret */
  masked_secret: string;
  /** Message */
  message: string;
}

/** SettingsPublic */
export interface SettingsPublic {
  /**
   * Chatbot Widget
   * @default {}
   */
  chatbot_widget?: Record<string, any>;
  /**
   * Using Templates
   * @default false
   */
  using_templates?: boolean;
  /**
   * Tenant Credentials Enabled
   * @default false
   */
  tenant_credentials_enabled?: boolean;
  /**
   * Audit Logging Enabled
   * @default true
   */
  audit_logging_enabled?: boolean;
  /**
   * Provisioning
   * @default false
   */
  provisioning?: boolean;
}

/**
 * SharePointSubscriptionPublic
 * Public representation of a SharePoint subscription.
 */
export interface SharePointSubscriptionPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * User Integration Id
   * @format uuid
   */
  user_integration_id: string;
  /** Site Id */
  site_id: string;
  /** Subscription Id */
  subscription_id: string;
  /** Drive Id */
  drive_id: string;
  /**
   * Expires At
   * @format date-time
   */
  expires_at: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Is Expired
   * True if subscription has already expired
   */
  is_expired: boolean;
  /**
   * Expires In Hours
   * Hours until expiration (0 if already expired)
   */
  expires_in_hours: number;
  /**
   * Owner Email
   * Email of subscription owner (None for organization integrations)
   */
  owner_email?: string | null;
  /**
   * Owner Type
   * Type of owner: 'user' or 'organization'
   */
  owner_type: string;
}

/** SharePointTreeItem */
export interface SharePointTreeItem {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Path */
  path: string;
  /** Has Children */
  has_children: boolean;
  /** Size */
  size?: number | null;
  /** Modified */
  modified?: string | null;
  /** Web Url */
  web_url?: string | null;
}

/** SharePointTreeResponse */
export interface SharePointTreeResponse {
  /** Items */
  items: SharePointTreeItem[];
  /** Current Path */
  current_path: string;
  /** Parent Id */
  parent_id?: string | null;
  /** Drive Id */
  drive_id: string;
  /** Site Id */
  site_id?: string | null;
}

/** SignedURLRequest */
export interface SignedURLRequest {
  /**
   * Expires In
   * @default 3600
   */
  expires_in?: number;
  /** @default "attachment" */
  content_disposition?: ContentDisposition;
}

/** SignedURLResponse */
export interface SignedURLResponse {
  /** Url */
  url: string;
  /** Expires At */
  expires_at: number;
}

/**
 * SortField
 * Allowed fields for sorting user lists
 */
export enum SortField {
  Email = 'email',
  Username = 'username',
  CreatedAt = 'created_at',
}

/**
 * SortOrder
 * Sort direction for user lists
 */
export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

/** SpaceDashboard */
export interface SpaceDashboard {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Personal */
  personal: boolean;
  /** Organization */
  organization: boolean;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
  applications: Applications;
  default_assistant?: DefaultAssistant | null;
  /** Data Retention Days */
  data_retention_days?: number | null;
}

/**
 * SpaceGroupMember
 * A user group that is a member of a space with a specific role.
 */
export interface SpaceGroupMember {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  role: SpaceRoleValue;
  /**
   * User Count
   * @default 0
   */
  user_count?: number;
}

/** SpaceMember */
export interface SpaceMember {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Username */
  username?: string | null;
  role: SpaceRoleValue;
}

/** SpacePublic */
export interface SpacePublic {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Personal */
  personal: boolean;
  /** Organization */
  organization: boolean;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
  applications: Applications;
  default_assistant: DefaultAssistant;
  /** Data Retention Days */
  data_retention_days?: number | null;
  /** Embedding Models */
  embedding_models: EmbeddingModelPublic[];
  /** Completion Models */
  completion_models: CompletionModelPublic[];
  /** Transcription Models */
  transcription_models: TranscriptionModelPublic[];
  /** Mcp Servers */
  mcp_servers: Record<string, any>[];
  knowledge: Knowledge;
  members: PaginatedPermissionsSpaceMember;
  group_members: PaginatedPermissionsSpaceGroupMember;
  /** Available Roles */
  available_roles: SpaceRole[];
  security_classification: SecurityClassificationPublic | null;
}

/** SpaceRole */
export interface SpaceRole {
  value: SpaceRoleValue;
  /** Label */
  label: string;
}

/** SpaceRoleValue */
export enum SpaceRoleValue {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

/** SpaceSparse */
export interface SpaceSparse {
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string | null;
  /** Personal */
  personal: boolean;
  /** Organization */
  organization: boolean;
  /**
   * Icon Id
   * Icon ID referencing an uploaded icon
   */
  icon_id?: string | null;
  applications?: Applications | null;
  default_assistant?: DefaultAssistant | null;
  /** Data Retention Days */
  data_retention_days?: number | null;
}

/**
 * StateFilter
 * Filter for user state in admin users list
 */
export enum StateFilter {
  Active = 'active',
  Inactive = 'inactive',
}

/** Status */
export enum Status {
  InProgress = 'in progress',
  Queued = 'queued',
  Complete = 'complete',
  Failed = 'failed',
  NotFound = 'not found',
}

/** StorageInfoModel */
export interface StorageInfoModel {
  /** Count */
  count: number;
  /** Items */
  items: StorageSpaceInfoModel[];
}

/** StorageModel */
export interface StorageModel {
  /** Total Used */
  total_used: number;
  /** Personal Used */
  personal_used: number;
  /** Shared Used */
  shared_used: number;
  /** Limit */
  limit: number;
}

/** StorageSpaceInfoModel */
export interface StorageSpaceInfoModel {
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Update At
   * @format date-time
   */
  update_at: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Size */
  size: number;
  /** Members */
  members: StorageSpaceMemberModel[];
}

/** StorageSpaceMemberModel */
export interface StorageSpaceMemberModel {
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Email */
  email: string;
  /** Role */
  role: string;
}

/**
 * SubscriptionRenewalResult
 * Result of subscription renewal operation.
 */
export interface SubscriptionRenewalResult {
  /**
   * Total Subscriptions
   * Total number of subscriptions found
   */
  total_subscriptions: number;
  /**
   * Expired Count
   * Number of expired subscriptions
   */
  expired_count: number;
  /**
   * Recreated
   * Number of subscriptions successfully recreated
   * @default 0
   */
  recreated?: number;
  /**
   * Failed
   * Number of subscriptions that failed to recreate
   * @default 0
   */
  failed?: number;
  /**
   * Errors
   * Error messages for failed renewals
   */
  errors?: string[];
}

/**
 * SyncLog
 * Detailed sync operation log.
 */
export interface SyncLog {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Integration Knowledge Id
   * @format uuid
   */
  integration_knowledge_id: string;
  /** Sync Type */
  sync_type: string;
  /** Status */
  status: string;
  /** Metadata */
  metadata?: Record<string, any> | null;
  /** Error Message */
  error_message?: string | null;
  /**
   * Started At
   * @format date-time
   */
  started_at: string;
  /** Completed At */
  completed_at?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Files Processed
   * Get files_processed from metadata.
   */
  files_processed: number;
  /**
   * Files Deleted
   * Get files_deleted from metadata.
   */
  files_deleted: number;
  /**
   * Pages Processed
   * Get pages_processed from metadata.
   */
  pages_processed: number;
  /**
   * Folders Processed
   * Get folders_processed from metadata.
   */
  folders_processed: number;
  /**
   * Skipped Items
   * Get skipped_items from metadata.
   */
  skipped_items: number;
  /**
   * Skipped Details
   * Get skipped file details from metadata.
   */
  skipped_details: Record<string, any>[];
  /**
   * Duration Seconds
   * Calculate sync duration in seconds.
   */
  duration_seconds: number | null;
  /**
   * Total Items Processed
   * Total items processed in this sync.
   */
  total_items_processed: number;
}

/** Task */
export enum Task {
  UploadInfoBlob = 'upload_info_blob',
  Transcription = 'transcription',
  Crawl = 'crawl',
  EmbedGroup = 'embed_group',
  CrawlAllWebsites = 'crawl_all_websites',
  RunApp = 'run_app',
  PullConfluenceContent = 'pull_confluence_content',
  PullSharepointContent = 'pull_sharepoint_content',
  SyncSharepointDelta = 'sync_sharepoint_delta',
  UpdateModelUsageStats = 'update_model_usage_stats',
  AnalyzeConversationInsights = 'analyze_conversation_insights',
}

/** TemplateCreate */
export interface TemplateCreate {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Additional Fields */
  additional_fields: AdditionalField[] | null;
}

/** TemplateListPublic */
export interface TemplateListPublic {
  /** Items */
  items: (AppTemplatePublic | AssistantTemplatePublic)[];
  /** Count */
  count: number;
}

/** TemplateSettingUpdate */
export interface TemplateSettingUpdate {
  /** Enabled */
  enabled: boolean;
}

/** TemplateWizard */
export interface TemplateWizard {
  /**
   * Required
   * @default false
   */
  required?: boolean;
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
}

/**
 * TenantAppTestResult
 * Result of testing tenant app credentials.
 */
export interface TenantAppTestResult {
  /** Success */
  success: boolean;
  /** Error Message */
  error_message?: string | null;
  /**
   * Details
   * Additional details about the test (e.g., token acquired successfully)
   */
  details?: string | null;
}

/** TenantBase */
export interface TenantBase {
  /** Name */
  name: string;
  /** Display Name */
  display_name?: string | null;
  /**
   * Quota Limit
   * Size in bytes. Default is 10 GB
   * @format int64
   * @default 10737418240
   */
  quota_limit?: number;
  /** Domain */
  domain?: string | null;
  /** Zitadel Org Id */
  zitadel_org_id?: string | null;
  /**
   * Provisioning
   * @default false
   */
  provisioning?: boolean;
  /** @default "active" */
  state?: TenantState;
  /**
   * Security Enabled
   * @default false
   */
  security_enabled?: boolean;
}

/** TenantCompletionModelCreate */
export interface TenantCompletionModelCreate {
  /**
   * Provider Id
   * Model provider ID
   * @format uuid
   */
  provider_id: string;
  /**
   * Name
   * Model identifier (e.g., 'gpt-4o', 'meta-llama/Meta-Llama-3-70B-Instruct')
   */
  name: string;
  /**
   * Display Name
   * User-friendly display name
   */
  display_name: string;
  /**
   * Token Limit
   * Maximum context tokens
   * @default 128000
   */
  token_limit?: number;
  /**
   * Vision
   * Supports vision/image inputs
   * @default false
   */
  vision?: boolean;
  /**
   * Reasoning
   * Supports extended reasoning
   * @default false
   */
  reasoning?: boolean;
  /**
   * Supports Tool Calling
   * Supports function/tool calling
   * @default false
   */
  supports_tool_calling?: boolean;
  /**
   * Hosting
   * Hosting location (swe, eu, usa)
   * @default "swe"
   */
  hosting?: string;
  /**
   * Family
   * Model family (e.g., 'openai', 'anthropic', 'deepseek')
   * @default "openai"
   */
  family?: string;
  /**
   * Is Active
   * Enable in organization
   * @default true
   */
  is_active?: boolean;
  /**
   * Is Default
   * Set as default model
   * @default false
   */
  is_default?: boolean;
}

/** TenantCompletionModelUpdate */
export interface TenantCompletionModelUpdate {
  /**
   * Name
   * Model identifier (e.g., 'gpt-4o', 'claude-3-sonnet')
   */
  name?: string | null;
  /**
   * Display Name
   * User-friendly display name
   */
  display_name?: string | null;
  /**
   * Description
   * Model description
   */
  description?: string | null;
  /**
   * Token Limit
   * Maximum context tokens
   */
  token_limit?: number | null;
  /**
   * Vision
   * Supports vision/image inputs
   */
  vision?: boolean | null;
  /**
   * Reasoning
   * Supports extended reasoning
   */
  reasoning?: boolean | null;
  /**
   * Supports Tool Calling
   * Supports function/tool calling
   */
  supports_tool_calling?: boolean | null;
  /**
   * Hosting
   * Hosting location (swe, eu, usa)
   */
  hosting?: string | null;
  /**
   * Open Source
   * Is the model open source
   */
  open_source?: boolean | null;
  /**
   * Stability
   * Model stability (stable, experimental)
   */
  stability?: string | null;
}

/** TenantEmbeddingModelCreate */
export interface TenantEmbeddingModelCreate {
  /**
   * Provider Id
   * Model provider ID
   * @format uuid
   */
  provider_id: string;
  /**
   * Name
   * Model identifier (e.g., 'text-embedding-3-large', 'intfloat/multilingual-e5-large')
   */
  name: string;
  /**
   * Display Name
   * User-friendly display name
   */
  display_name: string;
  /**
   * Family
   * Model family (e.g., 'openai', 'huggingface_e5', 'cohere', 'voyage')
   * @default "openai"
   */
  family?: string;
  /**
   * Dimensions
   * Embedding dimensions
   */
  dimensions?: number | null;
  /**
   * Max Input
   * Maximum input tokens
   */
  max_input?: number | null;
  /**
   * Hosting
   * Hosting location (swe, eu, usa)
   * @default "swe"
   */
  hosting?: string;
  /**
   * Is Active
   * Enable in organization
   * @default true
   */
  is_active?: boolean;
  /**
   * Is Default
   * Set as default model
   * @default false
   */
  is_default?: boolean;
}

/** TenantEmbeddingModelUpdate */
export interface TenantEmbeddingModelUpdate {
  /**
   * Display Name
   * User-friendly display name
   */
  display_name?: string | null;
  /**
   * Description
   * Model description
   */
  description?: string | null;
  /**
   * Family
   * Model family
   */
  family?: string | null;
  /**
   * Dimensions
   * Embedding dimensions
   */
  dimensions?: number | null;
  /**
   * Max Input
   * Maximum input tokens
   */
  max_input?: number | null;
  /**
   * Hosting
   * Hosting location (swe, eu, usa)
   */
  hosting?: string | null;
  /**
   * Open Source
   * Is the model open source
   */
  open_source?: boolean | null;
  /**
   * Stability
   * Model stability (stable, experimental)
   */
  stability?: string | null;
}

/** TenantInDB */
export interface TenantInDB {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Privacy Policy */
  privacy_policy?: string | null;
  /** Name */
  name: string;
  /** Display Name */
  display_name?: string | null;
  /** Slug */
  slug?: string | null;
  /** Quota Limit */
  quota_limit: number;
  /** Domain */
  domain?: string | null;
  /** Zitadel Org Id */
  zitadel_org_id?: string | null;
  /**
   * Provisioning
   * @default false
   */
  provisioning?: boolean;
  /** @default "active" */
  state?: TenantState;
  /**
   * Security Enabled
   * @default false
   */
  security_enabled?: boolean;
  /**
   * Modules
   * @default []
   */
  modules?: ModuleInDB[];
  /** Api Credentials */
  api_credentials?: Record<string, any>;
  /** Federation Config */
  federation_config?: Record<string, any>;
  /** Crawler Settings */
  crawler_settings?: Record<string, any>;
}

/**
 * TenantInfo
 * Public tenant information for selector grid.
 * @example {"display_name":"Stockholm","name":"Stockholm Municipality","slug":"stockholm"}
 */
export interface TenantInfo {
  /** Slug */
  slug: string;
  /** Name */
  name: string;
  /** Display Name */
  display_name: string;
}

/** TenantIntegration */
export interface TenantIntegration {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description: string;
  integration_type: IntegrationType;
  /**
   * Integration Id
   * @format uuid
   */
  integration_id: string;
  /** Is Linked To Tenant */
  is_linked_to_tenant: boolean;
}

/** TenantIntegrationFilter */
export enum TenantIntegrationFilter {
  All = 'all',
  TenantOnly = 'tenant_only',
}

/** TenantIntegrationList */
export interface TenantIntegrationList {
  /** Items */
  items: TenantIntegration[];
  /** Count */
  count: number;
}

/**
 * TenantListResponse
 * List of tenants for selector.
 * @example {"tenants":[{"display_name":"Stockholm","name":"Stockholm Municipality","slug":"stockholm"},{"display_name":"Gothenburg","name":"Gothenburg Municipality","slug":"goteborg"}]}
 */
export interface TenantListResponse {
  /** Tenants */
  tenants: TenantInfo[];
}

/** TenantPublic */
export interface TenantPublic {
  /** Name */
  name: string;
  /** Display Name */
  display_name?: string | null;
  /**
   * Quota Limit
   * Size in bytes. Default is 10 GB
   * @format int64
   * @default 10737418240
   */
  quota_limit?: number;
  /** Domain */
  domain?: string | null;
  /** Zitadel Org Id */
  zitadel_org_id?: string | null;
  /**
   * Provisioning
   * @default false
   */
  provisioning?: boolean;
  /** @default "active" */
  state?: TenantState;
  /**
   * Security Enabled
   * @default false
   */
  security_enabled?: boolean;
  /** Privacy Policy */
  privacy_policy?: string | null;
}

/**
 * TenantSharePointAppCreate
 * Request model for creating/updating tenant SharePoint app credentials.
 */
export interface TenantSharePointAppCreate {
  /**
   * Client Id
   * Microsoft Entra ID Application (Client) ID
   * @example "12345678-1234-1234-1234-123456789012"
   */
  client_id: string;
  /**
   * Client Secret
   * Microsoft Entra ID Application Client Secret
   * @example "abc123~xyz789"
   */
  client_secret: string;
  /**
   * Tenant Domain
   * Microsoft Entra ID Tenant Domain (e.g., contoso.onmicrosoft.com)
   * @example "contoso.onmicrosoft.com"
   */
  tenant_domain: string;
  /**
   * Certificate Path
   * Optional path to certificate for certificate-based authentication
   */
  certificate_path?: string | null;
}

/**
 * TenantSharePointAppPublic
 * Response model for tenant SharePoint app (secret masked).
 */
export interface TenantSharePointAppPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Client Id */
  client_id: string;
  /**
   * Client Secret Masked
   * Masked client secret (last 4 chars visible)
   * @example "********xyz789"
   */
  client_secret_masked: string;
  /** Tenant Domain */
  tenant_domain: string;
  /** Is Active */
  is_active: boolean;
  /**
   * Auth Method
   * Authentication method: 'tenant_app' or 'service_account'
   * @example "service_account"
   */
  auth_method: string;
  /**
   * Service Account Email
   * Email of the service account (only for service_account auth method)
   */
  service_account_email?: string | null;
  /** Certificate Path */
  certificate_path: string | null;
  /** Created By */
  created_by: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** TenantState */
export enum TenantState {
  Active = 'active',
  Suspended = 'suspended',
}

/** TenantTranscriptionModelCreate */
export interface TenantTranscriptionModelCreate {
  /**
   * Provider Id
   * Model provider ID
   * @format uuid
   */
  provider_id: string;
  /**
   * Name
   * Model identifier (e.g., 'whisper-1', 'distil-whisper-large-v3-en')
   */
  name: string;
  /**
   * Display Name
   * User-friendly display name
   */
  display_name: string;
  /**
   * Hosting
   * Hosting location (swe, eu, usa)
   * @default "swe"
   */
  hosting?: string;
  /**
   * Family
   * Model family (e.g., 'openai', 'anthropic', 'deepseek')
   * @default "openai"
   */
  family?: string;
  /**
   * Is Active
   * Enable in organization
   * @default true
   */
  is_active?: boolean;
  /**
   * Is Default
   * Set as default model
   * @default false
   */
  is_default?: boolean;
}

/** TenantTranscriptionModelUpdate */
export interface TenantTranscriptionModelUpdate {
  /**
   * Display Name
   * User-friendly display name
   */
  display_name?: string | null;
  /**
   * Description
   * Model description
   */
  description?: string | null;
  /**
   * Hosting
   * Hosting location (swe, eu, usa)
   */
  hosting?: string | null;
  /**
   * Open Source
   * Is the model open source
   */
  open_source?: boolean | null;
  /**
   * Stability
   * Model stability (stable, experimental)
   */
  stability?: string | null;
}

/** TenantUpdatePublic */
export interface TenantUpdatePublic {
  /** Display Name */
  display_name?: string | null;
  /** Quota Limit */
  quota_limit?: number | null;
  /** Domain */
  domain?: string | null;
  /** Zitadel Org Id */
  zitadel_org_id?: string | null;
  /** Provisioning */
  provisioning?: boolean | null;
  state?: TenantState | null;
  /** Security Enabled */
  security_enabled?: boolean | null;
}

/**
 * TenantWithMaskedCredentials
 * TenantInDB with masked API credentials for safe API responses.
 *
 * This model is used when returning tenant data through API endpoints
 * to prevent exposing full API keys. The api_credentials field is
 * automatically masked to show only the last 4 characters of each key.
 *
 * Example:
 *     Full credential: {"openai": {"api_key": "sk-proj-abc123xyz"}}
 *     Masked: {"openai": "...xyz"}
 */
export interface TenantWithMaskedCredentials {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Privacy Policy */
  privacy_policy?: string | null;
  /** Name */
  name: string;
  /** Display Name */
  display_name?: string | null;
  /** Slug */
  slug?: string | null;
  /** Quota Limit */
  quota_limit: number;
  /** Domain */
  domain?: string | null;
  /** Zitadel Org Id */
  zitadel_org_id?: string | null;
  /**
   * Provisioning
   * @default false
   */
  provisioning?: boolean;
  /** @default "active" */
  state?: TenantState;
  /**
   * Security Enabled
   * @default false
   */
  security_enabled?: boolean;
  /**
   * Modules
   * @default []
   */
  modules?: ModuleInDB[];
  /** Api Credentials */
  api_credentials?: Record<string, any>;
  /** Federation Config */
  federation_config?: Record<string, any>;
  /** Crawler Settings */
  crawler_settings?: Record<string, any>;
}

/**
 * TokenEstimateBreakdown
 * Breakdown of token usage by source.
 */
export interface TokenEstimateBreakdown {
  /**
   * Prompt
   * Tokens used by assistant prompt
   */
  prompt: number;
  /**
   * Text
   * Tokens used by user input text
   */
  text: number;
  /**
   * Files
   * Total tokens used by all files
   */
  files: number;
  /**
   * File Details
   * Per-file token counts
   */
  file_details?: Record<string, number>;
}

/**
 * TokenEstimateRequest
 * Request payload for estimating tokens.
 */
export interface TokenEstimateRequest {
  /**
   * Text
   * User input text to evaluate
   * @default ""
   */
  text?: string;
  /**
   * File Ids
   * List of file IDs to include in the estimate
   */
  file_ids?: string[];
}

/**
 * TokenEstimateResponse
 * Response model for token usage estimation.
 */
export interface TokenEstimateResponse {
  /**
   * Tokens
   * Total token count
   */
  tokens: number;
  /**
   * Percentage
   * Percentage of context window used
   */
  percentage: number;
  /**
   * Limit
   * Model's context window limit
   */
  limit: number;
  /** Token usage breakdown by source */
  breakdown: TokenEstimateBreakdown;
}

/** TokenUsageSummary */
export interface TokenUsageSummary {
  /**
   * Start Date
   * @format date-time
   */
  start_date: string;
  /**
   * End Date
   * @format date-time
   */
  end_date: string;
  /** Models */
  models: ModelUsage[];
  /**
   * Total Input Token Usage
   * Total input token usage across all models
   */
  total_input_token_usage: number;
  /**
   * Total Output Token Usage
   * Total output token usage across all models
   */
  total_output_token_usage: number;
  /**
   * Total Token Usage
   * Total combined token usage across all models
   */
  total_token_usage: number;
}

/**
 * ToolApprovalDecision
 * Decision for a single tool call.
 */
export interface ToolApprovalDecision {
  /** Tool Call Id */
  tool_call_id: string;
  /** Approved */
  approved: boolean;
}

/** ToolAssistant */
export interface ToolAssistant {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Handle */
  handle: string;
}

/**
 * ToolCallInfo
 * Info about a single tool being called.
 */
export interface ToolCallInfo {
  /** Server Name */
  server_name: string;
  /** Tool Name */
  tool_name: string;
  /** Arguments */
  arguments?: Record<string, any> | null;
  /** Tool Call Id */
  tool_call_id?: string | null;
  /** Approved */
  approved?: boolean | null;
}

/** TranscriptionModelPublic */
export interface TranscriptionModelPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Nickname */
  nickname: string;
  family: ModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Hf Link */
  hf_link?: string | null;
  org?: ModelOrg | null;
  /**
   * Can Access
   * @default false
   */
  can_access?: boolean;
  /**
   * Is Locked
   * @default true
   */
  is_locked?: boolean;
  /** Lock Reason */
  lock_reason?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /**
   * Is Org Default
   * @default false
   */
  is_org_default?: boolean;
  /** Credential Provider */
  credential_provider?: string | null;
  security_classification?: SecurityClassificationPublic | null;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Provider Id */
  provider_id?: string | null;
  /** Provider Name */
  provider_name?: string | null;
  /** Provider Type */
  provider_type?: string | null;
}

/** TranscriptionModelSecurityStatus */
export interface TranscriptionModelSecurityStatus {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Nickname */
  nickname: string;
  family: ModelFamily;
  /** Is Deprecated */
  is_deprecated: boolean;
  stability: ModelStability;
  hosting: ModelHostingLocation;
  /** Open Source */
  open_source?: boolean | null;
  /** Description */
  description?: string | null;
  /** Hf Link */
  hf_link?: string | null;
  org?: ModelOrg | null;
  /**
   * Can Access
   * @default false
   */
  can_access?: boolean;
  /**
   * Is Locked
   * @default true
   */
  is_locked?: boolean;
  /** Lock Reason */
  lock_reason?: string | null;
  /**
   * Is Org Enabled
   * @default false
   */
  is_org_enabled?: boolean;
  /**
   * Is Org Default
   * @default false
   */
  is_org_default?: boolean;
  /** Credential Provider */
  credential_provider?: string | null;
  security_classification?: SecurityClassificationPublic | null;
  /** Tenant Id */
  tenant_id?: string | null;
  /** Provider Id */
  provider_id?: string | null;
  /** Provider Name */
  provider_name?: string | null;
  /** Provider Type */
  provider_type?: string | null;
  /** Meets Security Classification */
  meets_security_classification?: boolean | null;
}

/** TranscriptionModelUpdate */
export interface TranscriptionModelUpdate {
  /** Is Org Enabled */
  is_org_enabled?: boolean | null;
  /** Is Org Default */
  is_org_default?: boolean | null;
  /** Security Classification */
  security_classification?: ModelId | null;
}

/** TransferApplicationRequest */
export interface TransferApplicationRequest {
  /**
   * Target Space Id
   * @format uuid
   */
  target_space_id: string;
  /**
   * Move Resources
   * @default false
   */
  move_resources?: boolean;
}

/** TransferRequest */
export interface TransferRequest {
  /**
   * Target Space Id
   * @format uuid
   */
  target_space_id: string;
}

/** UpdateIntegrationKnowledgeRequest */
export interface UpdateIntegrationKnowledgeRequest {
  /** Name */
  name: string;
}

/** UpdateIntegrationKnowledgeWrapperRequest */
export interface UpdateIntegrationKnowledgeWrapperRequest {
  /** Name */
  name: string;
}

/**
 * UpdateInterval
 * Defines how frequently a website should be crawled.
 *
 * Why: Provides flexible scheduling options for automated crawling.
 */
export enum UpdateInterval {
  Never = 'never',
  Daily = 'daily',
  EveryOtherDay = 'every_other_day',
  Weekly = 'weekly',
}

/** UpdateSpaceDryRunResponse */
export interface UpdateSpaceDryRunResponse {
  /** Assistants */
  assistants: AssistantSparse[];
  /** Group Chats */
  group_chats: GroupChatSparse[];
  /** Services */
  services: ServiceSparse[];
  /** Apps */
  apps: AppSparse[];
  /** Completion Models */
  completion_models: CompletionModelPublic[];
  /** Embedding Models */
  embedding_models: EmbeddingModelPublic[];
  /** Transcription Models */
  transcription_models: TranscriptionModelPublic[];
}

/** UpdateSpaceGroupMemberRequest */
export interface UpdateSpaceGroupMemberRequest {
  role: SpaceRoleValue;
}

/** UpdateSpaceMemberRequest */
export interface UpdateSpaceMemberRequest {
  role: SpaceRoleValue;
}

/** UseTools */
export interface UseTools {
  /** Assistants */
  assistants: ToolAssistant[];
}

/** UserAddAdmin */
export interface UserAddAdmin {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /**
   * Password
   * User password (minimum 7 characters)
   */
  password?: string | null;
  /**
   * Quota Limit
   * Storage limit in bytes (minimum 1000 bytes = 1KB)
   */
  quota_limit?: number | null;
  /**
   * Roles
   * List of custom role IDs to assign to the user
   * @default []
   */
  roles?: ModelId[];
  /**
   * Predefined Roles
   * List of predefined role IDs to assign to the user
   * @default []
   */
  predefined_roles?: ModelId[];
}

/** UserAddSuperAdmin */
export interface UserAddSuperAdmin {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /**
   * Password
   * User password (minimum 7 characters)
   */
  password?: string | null;
  /**
   * Quota Limit
   * Storage limit in bytes (minimum 1000 bytes = 1KB)
   */
  quota_limit?: number | null;
  /**
   * Roles
   * List of custom role IDs to assign to the user
   * @default []
   */
  roles?: ModelId[];
  /**
   * Predefined Roles
   * List of predefined role IDs to assign to the user
   * @default []
   */
  predefined_roles?: ModelId[];
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
}

/** UserAdminView */
export interface UserAdminView {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Quota Used
   * @default 0
   */
  quota_used?: number;
  /** Used Tokens */
  used_tokens: number;
  /** Email Verified */
  email_verified: boolean;
  /** Quota Limit */
  quota_limit: number | null;
  /** Is Active */
  is_active: boolean;
  state: UserState;
  /** Roles */
  roles: RolePublic[];
  /** Predefined Roles */
  predefined_roles: PredefinedRolePublic[];
  /** User Groups */
  user_groups: UserGroupRead[];
}

/** UserCreated */
export interface UserCreated {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Password */
  password?: string | null;
  /** Salt */
  salt?: string | null;
  /**
   * Used Tokens
   * @default 0
   */
  used_tokens?: number;
  /**
   * Email Verified
   * @default false
   */
  email_verified?: boolean;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  state: UserState;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Quota Limit */
  quota_limit?: number | null;
  /**
   * Roles
   * @default []
   */
  roles?: RoleInDB[];
  /**
   * Predefined Roles
   * @default []
   */
  predefined_roles?: PredefinedRoleInDB[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * User Groups
   * @default []
   */
  user_groups?: UserGroupInDBRead[];
  tenant: TenantInDB;
  api_key: ApiKey | null;
  /**
   * Quota Used
   * @default 0
   */
  quota_used?: number;
  /**
   * Deleted At
   * Timestamp when user was soft-deleted (null for active users)
   */
  deleted_at?: string | null;
  access_token: AccessToken | null;
  /** Modules */
  modules: string[];
  /**
   * User Groups Ids
   * @uniqueItems true
   */
  user_groups_ids: string[];
  /**
   * Permissions
   * @uniqueItems true
   */
  permissions: Permission[];
}

/** UserCreatedAdminView */
export interface UserCreatedAdminView {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Quota Used
   * @default 0
   */
  quota_used?: number;
  /** Used Tokens */
  used_tokens: number;
  /** Email Verified */
  email_verified: boolean;
  /** Quota Limit */
  quota_limit: number | null;
  /** Is Active */
  is_active: boolean;
  state: UserState;
  /** Roles */
  roles: RolePublic[];
  /** Predefined Roles */
  predefined_roles: PredefinedRolePublic[];
  /** User Groups */
  user_groups: UserGroupRead[];
  api_key: ApiKey;
}

/**
 * UserDeletedListItem
 * User information for deleted users list operations
 */
export interface UserDeletedListItem {
  /**
   * Username
   * User's unique username
   */
  username: string;
  /**
   * Email
   * User's email address
   */
  email: string;
  /**
   * State
   * User's current state (always 'deleted' for this list)
   */
  state: string;
  /**
   * Deleted At
   * When the user was deleted (for external tracking)
   * @format date-time
   */
  deleted_at: string;
}

/** UserGroupCreateRequest */
export interface UserGroupCreateRequest {
  /** Name */
  name: string;
}

/** UserGroupInDBRead */
export interface UserGroupInDBRead {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** UserGroupPublic */
export interface UserGroupPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /**
   * Users
   * @default []
   */
  users?: UserPublicBase[];
}

/** UserGroupRead */
export interface UserGroupRead {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
}

/** UserGroupUpdateRequest */
export interface UserGroupUpdateRequest {
  /** Name */
  name?: string | null;
  /**
   * Users
   * @default []
   */
  users?: ModelId[];
}

/** UserInDB */
export interface UserInDB {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Password */
  password?: string | null;
  /** Salt */
  salt?: string | null;
  /**
   * Used Tokens
   * @default 0
   */
  used_tokens?: number;
  /**
   * Email Verified
   * @default false
   */
  email_verified?: boolean;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  state: UserState;
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Quota Limit */
  quota_limit?: number | null;
  /**
   * Roles
   * @default []
   */
  roles?: RoleInDB[];
  /**
   * Predefined Roles
   * @default []
   */
  predefined_roles?: PredefinedRoleInDB[];
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * User Groups
   * @default []
   */
  user_groups?: UserGroupInDBRead[];
  tenant: TenantInDB;
  api_key?: ApiKeyInDB | null;
  /**
   * Quota Used
   * @default 0
   */
  quota_used?: number;
  /**
   * Deleted At
   * Timestamp when user was soft-deleted (null for active users)
   */
  deleted_at?: string | null;
  /** Modules */
  modules: string[];
  /**
   * User Groups Ids
   * @uniqueItems true
   */
  user_groups_ids: string[];
  /**
   * Permissions
   * @uniqueItems true
   */
  permissions: Permission[];
}

/** UserIntegration */
export interface UserIntegration {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description: string;
  integration_type: IntegrationType;
  /**
   * Tenant Integration Id
   * @format uuid
   */
  tenant_integration_id: string;
  /** Connected */
  connected: boolean;
  /**
   * Auth Type
   * @default "user_oauth"
   */
  auth_type?: string;
  /** Tenant App Id */
  tenant_app_id?: string | null;
  /**
   * Tenant App Configured
   * @default true
   */
  tenant_app_configured?: boolean;
}

/** UserIntegrationList */
export interface UserIntegrationList {
  /** Items */
  items: UserIntegration[];
  /** Count */
  count: number;
}

/** UserProvision */
export interface UserProvision {
  /** Zitadel Token */
  zitadel_token: string;
}

/** UserPublic */
export interface UserPublic {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Quota Used
   * @default 0
   */
  quota_used?: number;
  /** Truncated Api Key */
  truncated_api_key?: string | null;
  /** Quota Limit */
  quota_limit?: number | null;
  /** Roles */
  roles: RolePublic[];
  /** Predefined Roles */
  predefined_roles: PredefinedRolePublic[];
  /** User Groups */
  user_groups: UserGroupRead[];
}

/** UserPublicBase */
export interface UserPublicBase {
  /**
   * Email
   * Valid email address
   * @format email
   */
  email: string;
  /**
   * Username
   * Unique username (optional, will use email prefix if not provided)
   */
  username?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Quota Used
   * @default 0
   */
  quota_used?: number;
}

/**
 * UserSortBy
 * Enum for user token usage sorting options
 */
export enum UserSortBy {
  TotalTokens = 'total_tokens',
  Username = 'username',
  InputTokens = 'input_tokens',
  OutputTokens = 'output_tokens',
  Requests = 'requests',
}

/** UserSparse */
export interface UserSparse {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Username */
  username?: string | null;
}

/** UserState */
export enum UserState {
  Invited = 'invited',
  Active = 'active',
  Inactive = 'inactive',
  Deleted = 'deleted',
}

/**
 * UserStateListItem
 * Minimal user information for state-based list operations
 */
export interface UserStateListItem {
  /**
   * Username
   * User's unique username
   */
  username: string;
  /**
   * Email
   * User's email address
   */
  email: string;
  /**
   * State
   * User's current state
   */
  state: string;
  /**
   * State Changed At
   * When the user state was last changed
   * @format date-time
   */
  state_changed_at: string;
}

/** UserTokenUsage */
export interface UserTokenUsage {
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  /** Username */
  username: string;
  /** Email */
  email: string;
  /**
   * Total Input Tokens
   * Total input tokens used by this user
   */
  total_input_tokens: number;
  /**
   * Total Output Tokens
   * Total output tokens used by this user
   */
  total_output_tokens: number;
  /**
   * Total Tokens
   * Total tokens (input + output)
   */
  total_tokens: number;
  /**
   * Total Requests
   * Total number of requests made by this user
   */
  total_requests: number;
  /**
   * Models Used
   * Models used by this user with their usage
   */
  models_used: ModelUsage[];
}

/** UserTokenUsageSummary */
export interface UserTokenUsageSummary {
  /**
   * Users
   * List of users with their token usage
   */
  users: UserTokenUsage[];
  /**
   * Start Date
   * @format date-time
   */
  start_date: string;
  /**
   * End Date
   * @format date-time
   */
  end_date: string;
  /**
   * Total Users
   * Total number of users with token usage
   */
  total_users: number;
  /**
   * Total Input Tokens
   * Total input tokens across all users
   */
  total_input_tokens: number;
  /**
   * Total Output Tokens
   * Total output tokens across all users
   */
  total_output_tokens: number;
  /**
   * Total Tokens
   * Total tokens across all users
   */
  total_tokens: number;
  /**
   * Total Requests
   * Total requests across all users
   */
  total_requests: number;
}

/**
 * UserTokenUsageSummaryDetail
 * Response model for single user detail endpoint
 */
export interface UserTokenUsageSummaryDetail {
  user: UserTokenUsage;
}

/** UserUpdatePublic */
export interface UserUpdatePublic {
  /**
   * Email
   * New email address (must be unique within tenant)
   */
  email?: string | null;
  /**
   * Username
   * Username cannot be updated after creation
   */
  username?: string | null;
  /**
   * Password
   * New password (minimum 7 characters)
   */
  password?: string | null;
  /**
   * Quota Limit
   * New storage limit in bytes (minimum 1000 bytes = 1KB)
   */
  quota_limit?: number | null;
  /**
   * Roles
   * List of custom role IDs to assign (replaces existing roles)
   */
  roles?: ModelId[] | null;
  /**
   * Predefined Roles
   * List of predefined role IDs to assign (replaces existing predefined roles)
   */
  predefined_roles?: ModelId[] | null;
  /** User state (invited/active/inactive) */
  state?: UserState | null;
}

/**
 * ValidateModelRequest
 * Request model for validating a model against a provider.
 */
export interface ValidateModelRequest {
  /**
   * Model Name
   * Model name to validate
   */
  model_name: string;
  /**
   * Model Type
   * Model type: completion, embedding, or transcription
   * @default "completion"
   */
  model_type?: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/**
 * WatchdogMetrics
 * Watchdog activity metrics.
 */
export interface WatchdogMetrics {
  /** Age Seconds */
  age_seconds?: number | null;
  /**
   * Zombies Reconciled
   * @default 0
   */
  zombies_reconciled?: number;
  /**
   * Expired Killed
   * @default 0
   */
  expired_killed?: number;
  /**
   * Rescued
   * @default 0
   */
  rescued?: number;
  /**
   * Early Zombies Failed
   * @default 0
   */
  early_zombies_failed?: number;
  /**
   * Long Running Failed
   * @default 0
   */
  long_running_failed?: number;
  /**
   * Slots Released
   * @default 0
   */
  slots_released?: number;
}

/** WebSearchResultPublic */
export interface WebSearchResultPublic {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Title */
  title: string;
  /** Url */
  url: string;
}

/** WebsiteCreate */
export interface WebsiteCreate {
  /** Name */
  name?: string | null;
  /** Url */
  url: string;
  /**
   * Download Files
   * @default false
   */
  download_files?: boolean;
  /** @default "crawl" */
  crawl_type?: CrawlType;
  /**
   * Defines how frequently a website should be crawled.
   *
   * Why: Provides flexible scheduling options for automated crawling.
   * @default "never"
   */
  update_interval?: UpdateInterval;
  embedding_model?: ModelId | null;
  /**
   * Http Auth Username
   * Username for HTTP Basic Authentication (optional)
   */
  http_auth_username?: string | null;
  /**
   * Http Auth Password
   * Password for HTTP Basic Authentication (optional). Must be provided together with username.
   */
  http_auth_password?: string | null;
}

/** WebsiteCreateRequestDeprecated */
export interface WebsiteCreateRequestDeprecated {
  /** Name */
  name?: string | null;
  /**
   * Url
   * @format uri
   * @minLength 1
   * @maxLength 2083
   */
  url: string;
  /** Space Id */
  space_id?: string | null;
  /**
   * Download Files
   * @default false
   */
  download_files?: boolean;
  /** @default "crawl" */
  crawl_type?: CrawlType;
  /**
   * Defines how frequently a website should be crawled.
   *
   * Why: Provides flexible scheduling options for automated crawling.
   * @default "never"
   */
  update_interval?: UpdateInterval;
  embedding_model: ModelId;
}

/**
 * WebsiteExistsResponse
 * Response model for checking if a website URL exists on the Organization space.
 */
export interface WebsiteExistsResponse {
  /**
   * Website Id
   * @format uuid
   */
  website_id: string;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  /** Space Name */
  space_name: string;
  /** Url */
  url: string;
  /** Name */
  name: string | null;
  /**
   * Defines how frequently a website should be crawled.
   *
   * Why: Provides flexible scheduling options for automated crawling.
   */
  update_interval: UpdateInterval;
  /** Last Crawled At */
  last_crawled_at: string | null;
  /** Pages Crawled */
  pages_crawled?: number | null;
  /** Pages Failed */
  pages_failed?: number | null;
  /** Files Downloaded */
  files_downloaded?: number | null;
  /** Files Failed */
  files_failed?: number | null;
  /** Crawl Status */
  crawl_status?: string | null;
}

/** WebsiteMetadata */
export interface WebsiteMetadata {
  /** Size */
  size: number;
}

/** WebsitePublic */
export interface WebsitePublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Permissions
   * @default []
   */
  permissions?: ResourcePermission[];
  /** Name */
  name: string | null;
  /** Url */
  url: string;
  /**
   * Space Id
   * @format uuid
   */
  space_id: string;
  /** Download Files */
  download_files: boolean;
  crawl_type: CrawlType;
  /**
   * Defines how frequently a website should be crawled.
   *
   * Why: Provides flexible scheduling options for automated crawling.
   */
  update_interval: UpdateInterval;
  latest_crawl: IntricWebsitesPresentationWebsiteModelsCrawlRunPublic | null;
  embedding_model: EmbeddingModelPublic;
  metadata: WebsiteMetadata;
  /**
   * Requires Http Auth
   * Whether this website requires HTTP Basic Authentication. Credentials are never exposed via API.
   */
  requires_http_auth: boolean;
  /**
   * Consecutive Failures
   * Number of consecutive crawl failures. Resets to 0 on successful crawl.
   * @default 0
   */
  consecutive_failures?: number;
  /**
   * Next Retry At
   * When to retry after failures (null = no backoff). Uses exponential backoff: 1h → 2h → 4h → 8h → 16h → 24h max.
   */
  next_retry_at?: string | null;
  /**
   * Is Auto Disabled
   * True if website was auto-disabled after 10 consecutive failures. User must manually change update_interval to re-enable.
   */
  is_auto_disabled: boolean;
}

/** WebsiteUpdate */
export interface WebsiteUpdate {
  /** Url */
  url?: string;
  /** Name */
  name?: string | null;
  /** Download Files */
  download_files?: boolean;
  /** Crawl Type */
  crawl_type?: CrawlType;
  /**
   * Update Interval
   * Defines how frequently a website should be crawled.
   *
   * Why: Provides flexible scheduling options for automated crawling.
   */
  update_interval?: UpdateInterval;
  /**
   * Http Auth Username
   * Username for HTTP Basic Authentication. Set to null to remove auth. Must be provided with password.
   */
  http_auth_username?: string | null;
  /**
   * Http Auth Password
   * Password for HTTP Basic Authentication. Set to null to remove auth. Must be provided with username.
   */
  http_auth_password?: string | null;
}

/** WizardType */
export enum WizardType {
  Attachments = 'attachments',
  Groups = 'groups',
}

/**
 * CredentialInfo
 * Information about a configured credential.
 *
 * Example:
 *     {
 *         "provider": "openai",
 *         "masked_key": "...xyz9",
 *         "configured_at": "2025-10-07T12:34:56.789Z",
 *         "encryption_status": "encrypted",
 *         "config": {
 *             "endpoint": "https://my-resource.openai.azure.com",
 *             "api_version": "2024-02-15-preview"
 *         }
 *     }
 */
export interface IntricTenantsPresentationTenantCredentialsRouterCredentialInfo {
  /**
   * Provider
   * LLM provider name
   */
  provider: string;
  /**
   * Masked Key
   * Last 4 characters of API key for identification
   */
  masked_key: string;
  /**
   * Configured At
   * Timestamp when credential was last updated
   */
  configured_at?: string | null;
  /**
   * Encryption Status
   * Encryption status of stored credential. 'encrypted' = secure at rest (Fernet encryption), 'plaintext' = needs migration for security compliance
   */
  encryption_status: IntricTenantsPresentationTenantCredentialsRouterCredentialInfoEncryptionStatusEnum;
  /**
   * Config
   * Provider-specific configuration (e.g., Azure endpoint, api_version)
   */
  config?: Record<string, any>;
}

/**
 * ListCredentialsResponse
 * Response model for listing tenant credentials.
 *
 * Example:
 *     {
 *         "credentials": [
 *             {
 *                 "provider": "openai",
 *                 "masked_key": "...xyz9",
 *                 "configured_at": "2025-10-07T12:34:56.789Z",
 *                 "encryption_status": "encrypted",
 *                 "config": {}
 *             },
 *             {
 *                 "provider": "azure",
 *                 "masked_key": "...abc3",
 *                 "configured_at": "2025-10-07T12:45:00.123Z",
 *                 "encryption_status": "plaintext",
 *                 "config": {
 *                     "endpoint": "https://my-resource.openai.azure.com",
 *                     "api_version": "2024-02-15-preview",
 *                     "deployment_name": "gpt-4"
 *                 }
 *             }
 *         ]
 *     }
 */
export interface IntricTenantsPresentationTenantCredentialsRouterListCredentialsResponse {
  /** Credentials */
  credentials: IntricTenantsPresentationTenantCredentialsRouterCredentialInfo[];
}

/**
 * SetCredentialRequest
 * Request model for setting tenant API credentials.
 *
 * Provider-specific field requirements:
 * - OpenAI, Anthropic, Mistral, Berget, GDM, OVHCloud: api_key only
 * - vLLM: api_key + endpoint (required)
 * - Azure: api_key + endpoint + api_version (required)
 *
 * Example for OpenAI:
 *     {
 *         "api_key": "sk-proj-abc123..."
 *     }
 *
 * Example for Azure:
 *     {
 *         "api_key": "abc123...",
 *         "endpoint": "https://my-resource.openai.azure.com",
 *         "api_version": "2024-02-15-preview"
 *     }
 *
 * Example for vLLM:
 *     {
 *         "api_key": "vllm-secret-key",
 *         "endpoint": "http://tenant-vllm:8000"
 *     }
 */
export interface IntricTenantsPresentationTenantCredentialsRouterSetCredentialRequest {
  /**
   * Api Key
   * API key for the provider
   * @minLength 8
   */
  api_key: string;
  /**
   * Endpoint
   * Azure OpenAI endpoint (required for Azure provider)
   */
  endpoint?: string | null;
  /**
   * Api Version
   * Azure OpenAI API version (required for Azure provider)
   */
  api_version?: string | null;
  /**
   * Deployment Name
   * Azure OpenAI deployment name (required for Azure provider)
   */
  deployment_name?: string | null;
}

/**
 * SetCredentialResponse
 * Response model for setting tenant API credentials.
 *
 * Returns the tenant ID, provider, masked API key (last 4 chars for verification),
 * and confirmation message. Sensitive data (api_key, endpoint, api_version) are
 * not returned for security.
 *
 * Example:
 *     {
 *         "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
 *         "provider": "openai",
 *         "masked_key": "...xyz9",
 *         "message": "API credential for openai set successfully",
 *         "set_at": "2025-10-22T10:00:00+00:00"
 *     }
 */
export interface IntricTenantsPresentationTenantCredentialsRouterSetCredentialResponse {
  /**
   * Tenant Id
   * @format uuid
   */
  tenant_id: string;
  /** Provider */
  provider: string;
  /** Masked Key */
  masked_key: string;
  /** Message */
  message: string;
  /**
   * Set At
   * @format date-time
   */
  set_at: string;
}

/** CredentialInfo */
export interface IntricTenantsPresentationTenantSelfCredentialsRouterCredentialInfo {
  /**
   * Provider
   * LLM provider name
   */
  provider: string;
  /**
   * Masked Key
   * Last 4 characters of API key for identification
   */
  masked_key: string;
  /**
   * Configured At
   * Timestamp when credential was last updated
   */
  configured_at?: string | null;
  /**
   * Encryption Status
   * Encryption status of stored credential. 'encrypted' = secure at rest (Fernet encryption), 'plaintext' = needs migration for security compliance
   */
  encryption_status: IntricTenantsPresentationTenantSelfCredentialsRouterCredentialInfoEncryptionStatusEnum;
  /**
   * Config
   * Provider-specific configuration (e.g., Azure endpoint, api_version)
   */
  config?: Record<string, any>;
}

/** ListCredentialsResponse */
export interface IntricTenantsPresentationTenantSelfCredentialsRouterListCredentialsResponse {
  /** Credentials */
  credentials: IntricTenantsPresentationTenantSelfCredentialsRouterCredentialInfo[];
}

/** SetCredentialRequest */
export interface IntricTenantsPresentationTenantSelfCredentialsRouterSetCredentialRequest {
  /**
   * Api Key
   * API key for the provider
   * @minLength 8
   */
  api_key: string;
  /**
   * Endpoint
   * Azure OpenAI endpoint (required for Azure provider)
   */
  endpoint?: string | null;
  /**
   * Api Version
   * Azure OpenAI API version (required for Azure provider)
   */
  api_version?: string | null;
  /**
   * Deployment Name
   * Azure OpenAI deployment name (required for Azure provider)
   */
  deployment_name?: string | null;
}

/** SetCredentialResponse */
export interface IntricTenantsPresentationTenantSelfCredentialsRouterSetCredentialResponse {
  /** Provider */
  provider: string;
  /** Masked Key */
  masked_key: string;
  /** Message */
  message: string;
  /**
   * Set At
   * @format date-time
   */
  set_at: string;
}

/** CrawlRunPublic */
export interface IntricWebsitesCrawlDependenciesCrawlModelsCrawlRunPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Pages Crawled */
  pages_crawled?: number | null;
  /** Files Downloaded */
  files_downloaded?: number | null;
  /** Pages Failed */
  pages_failed?: number | null;
  /** Files Failed */
  files_failed?: number | null;
  /** Failure Summary */
  failure_summary?: Record<string, number> | null;
  /** @default "queued" */
  status?: Status | null;
  /** Result Location */
  result_location?: string | null;
  /** Finished At */
  finished_at?: string | null;
}

/** CrawlRunPublic */
export interface IntricWebsitesPresentationWebsiteModelsCrawlRunPublic {
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Pages Crawled */
  pages_crawled: number | null;
  /** Files Downloaded */
  files_downloaded: number | null;
  /** Pages Failed */
  pages_failed: number | null;
  /** Files Failed */
  files_failed: number | null;
  /** Failure Summary */
  failure_summary?: Record<string, number> | null;
  status: Status;
  /** Result Location */
  result_location: string | null;
  /** Finished At */
  finished_at: string | null;
}

export enum IntricEventType {
  GeneratingImage = 'generating_image',
  ToolCall = 'tool_call',
  ToolApprovalRequired = 'tool_approval_required',
}

/** SSEText */
export interface SSEText {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** Answer */
  answer: string;
  /** References */
  references: any[];
}

/** SSEIntricEvent */
export interface SSEIntricEvent {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  intric_event_type: any;
}

/**
 * SSEToolCall
 * Event emitted when MCP tools are being executed.
 */
export interface SSEToolCall {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** @default "tool_call" */
  intric_event_type?: any;
  /** Tools */
  tools: any[];
}

/**
 * SSEToolApprovalRequired
 * Event emitted when MCP tools require user approval before execution.
 */
export interface SSEToolApprovalRequired {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** @default "tool_approval_required" */
  intric_event_type?: any;
  /** Approval Id */
  approval_id: string;
  /** Tools */
  tools: any[];
}

/** SSEFiles */
export interface SSEFiles {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** Generated Files */
  generated_files: any[];
}

/** SSEFirstChunk */
export interface SSEFirstChunk {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** Question */
  question: string;
  /** Answer */
  answer: string;
  /** Files */
  files: any[];
  /** Generated Files */
  generated_files: any[];
  /** References */
  references: any[];
  tools: any;
  /** Web Search References */
  web_search_references: any[];
}

/** SSEError */
export interface SSEError {
  /**
   * Session Id
   * @format uuid
   */
  session_id: string;
  /** Error */
  error: string;
  /**
   * Error Code
   * @default null
   */
  error_code?: number | null;
}

/** Status */
export enum CreateSpaceIntegrationKnowledgeBatchResultStatusEnum {
  Created = 'created',
  Failed = 'failed',
}

export enum CreateSpaceServiceResponseOutputFormatEnum {
  Json = 'json',
  List = 'list',
  Boolean = 'boolean',
}

/** Encryption Status */
export enum FederationInfoEncryptionStatusEnum {
  Encrypted = 'encrypted',
  Plaintext = 'plaintext',
}

/** Integration Type */
export enum IntegrationKnowledgePublicIntegrationTypeEnum {
  Confluence = 'confluence',
  Sharepoint = 'sharepoint',
}

/**
 * Http Auth Type
 * @default "none"
 */
export enum McpServerCreateHttpAuthTypeEnum {
  None = 'none',
  Bearer = 'bearer',
}

export enum McpServerUpdateHttpAuthTypeEnum {
  None = 'none',
  Bearer = 'bearer',
}

export enum PartialServiceUpdatePublicOutputFormatEnum {
  Json = 'json',
  List = 'list',
  Boolean = 'boolean',
}

export enum ServiceCreatePublicOutputFormatEnum {
  Json = 'json',
  List = 'list',
  Boolean = 'boolean',
}

export enum ServicePublicWithUserOutputFormatEnum {
  Json = 'json',
  List = 'list',
  Boolean = 'boolean',
}

export enum ServiceSparseOutputFormatEnum {
  Json = 'json',
  List = 'list',
  Boolean = 'boolean',
}

/** Value */
export enum SessionFeedbackValueEnum {
  Value1 = -1,
  Value11 = 1,
}

/**
 * Encryption Status
 * Encryption status of stored credential. 'encrypted' = secure at rest (Fernet encryption), 'plaintext' = needs migration for security compliance
 */
export enum IntricTenantsPresentationTenantCredentialsRouterCredentialInfoEncryptionStatusEnum {
  Encrypted = 'encrypted',
  Plaintext = 'plaintext',
}

/**
 * Encryption Status
 * Encryption status of stored credential. 'encrypted' = secure at rest (Fernet encryption), 'plaintext' = needs migration for security compliance
 */
export enum IntricTenantsPresentationTenantSelfCredentialsRouterCredentialInfoEncryptionStatusEnum {
  Encrypted = 'encrypted',
  Plaintext = 'plaintext',
}

/** Provider */
export enum SetCredentialApiV1AdminCredentialsProviderPutParamsProviderEnum {
  Openai = 'openai',
  Anthropic = 'anthropic',
  Azure = 'azure',
  Berget = 'berget',
  Gdm = 'gdm',
  Mistral = 'mistral',
  Ovhcloud = 'ovhcloud',
  Gemini = 'gemini',
  Cohere = 'cohere',
}

/** Provider */
export enum SetCredentialApiV1AdminCredentialsProviderPutParamsEnum {
  Openai = 'openai',
  Anthropic = 'anthropic',
  Azure = 'azure',
  Berget = 'berget',
  Gdm = 'gdm',
  Mistral = 'mistral',
  Ovhcloud = 'ovhcloud',
  Gemini = 'gemini',
  Cohere = 'cohere',
}

/** Provider */
export enum SetTenantCredentialApiV1SysadminTenantsTenantIdCredentialsProviderPutParamsProviderEnum {
  Openai = 'openai',
  Anthropic = 'anthropic',
  Azure = 'azure',
  Berget = 'berget',
  Gdm = 'gdm',
  Mistral = 'mistral',
  Ovhcloud = 'ovhcloud',
  Gemini = 'gemini',
  Cohere = 'cohere',
}

/** Provider */
export enum SetTenantCredentialApiV1SysadminTenantsTenantIdCredentialsProviderPutParamsEnum {
  Openai = 'openai',
  Anthropic = 'anthropic',
  Azure = 'azure',
  Berget = 'berget',
  Gdm = 'gdm',
  Mistral = 'mistral',
  Ovhcloud = 'ovhcloud',
  Gemini = 'gemini',
  Cohere = 'cohere',
}

/** Provider */
export enum DeleteTenantCredentialApiV1SysadminTenantsTenantIdCredentialsProviderDeleteParamsProviderEnum {
  Openai = 'openai',
  Anthropic = 'anthropic',
  Azure = 'azure',
  Berget = 'berget',
  Gdm = 'gdm',
  Mistral = 'mistral',
  Ovhcloud = 'ovhcloud',
  Gemini = 'gemini',
  Cohere = 'cohere',
}

/** Provider */
export enum DeleteTenantCredentialApiV1SysadminTenantsTenantIdCredentialsProviderDeleteParamsEnum {
  Openai = 'openai',
  Anthropic = 'anthropic',
  Azure = 'azure',
  Berget = 'berget',
  Gdm = 'gdm',
  Mistral = 'mistral',
  Ovhcloud = 'ovhcloud',
  Gemini = 'gemini',
  Cohere = 'cohere',
}
