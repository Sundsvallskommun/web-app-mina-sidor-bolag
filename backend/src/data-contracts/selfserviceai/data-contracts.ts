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

/** Model for session initiation request */
export interface SessionRequest {
  /** The id of the party to use when retrieving the information that will form the basis of the assistant's answers */
  partyId: string;
  /**
   * @maxItems 2147483647
   * @minItems 1
   * @uniqueItems true
   */
  customerEngagementOrgIds: string[];
}

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, any>;
  status?: StatusType;
  title?: string;
  detail?: string;
}

export interface StatusType {
  /** @format int32 */
  statusCode?: number;
  reasonPhrase?: string;
}

export interface ConstraintViolationProblem {
  cause?: ThrowableProblem;
  stackTrace?: {
    classLoaderName?: string;
    moduleName?: string;
    moduleVersion?: string;
    methodName?: string;
    fileName?: string;
    /** @format int32 */
    lineNumber?: number;
    className?: string;
    nativeMethod?: boolean;
  }[];
  /** @format uri */
  type?: string;
  status?: StatusType;
  violations?: Violation[];
  title?: string;
  message?: string;
  /** @format uri */
  instance?: string;
  parameters?: Record<string, any>;
  detail?: string;
  suppressed?: {
    stackTrace?: {
      classLoaderName?: string;
      moduleName?: string;
      moduleVersion?: string;
      methodName?: string;
      fileName?: string;
      /** @format int32 */
      lineNumber?: number;
      className?: string;
      nativeMethod?: boolean;
    }[];
    message?: string;
    localizedMessage?: string;
  }[];
  localizedMessage?: string;
}

export interface ThrowableProblem {
  cause?: any;
  stackTrace?: {
    classLoaderName?: string;
    moduleName?: string;
    moduleVersion?: string;
    methodName?: string;
    fileName?: string;
    /** @format int32 */
    lineNumber?: number;
    className?: string;
    nativeMethod?: boolean;
  }[];
  message?: string;
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, any>;
  status?: StatusType;
  title?: string;
  detail?: string;
  suppressed?: {
    stackTrace?: {
      classLoaderName?: string;
      moduleName?: string;
      moduleVersion?: string;
      methodName?: string;
      fileName?: string;
      /** @format int32 */
      lineNumber?: number;
      className?: string;
      nativeMethod?: boolean;
    }[];
    message?: string;
    localizedMessage?: string;
  }[];
  localizedMessage?: string;
}

export interface Violation {
  field?: string;
  message?: string;
}

/** Model for session initiation response */
export interface SessionResponse {
  /** The id of the assistant */
  assistantId?: string;
  /** The id of the session to be used when interacting with the assistant */
  sessionId?: string;
}

/** Model for assistant information */
export interface Assistant {
  /** Id of the assistant */
  id?: string;
  /** Readable handle name for the assistant */
  handle?: string;
}

/** Model for file information */
export interface File {
  /** Id of the file */
  id?: string;
  /** Readable name for the file */
  name?: string;
  /** Mime type for the file */
  mimeType?: string;
  /**
   * Size of the file
   * @format int32
   */
  size?: number;
  /**
   * Timestamp when file was created
   * @format date-time
   */
  createdAt?: string;
  /**
   * Timestamp when file was last updated
   * @format date-time
   */
  updatedAt?: string;
  /** Transcription of file */
  transcription?: string;
}

/** Model for model metadata information */
export interface Metadata {
  /** Id for the embedding model */
  embeddingModelId?: string;
  /** Url for the embedding model */
  url?: string;
  /** Title of the embeddning model */
  title?: string;
  /**
   * Size
   * @format int32
   */
  size?: number;
}

/** Model for completion model information */
export interface Model {
  /** Id of the model */
  id?: string;
  /** Name for the model */
  name?: string;
  /** Nickname for the model */
  nickname?: string;
  /** Family to which the model belongs */
  family?: string;
  /**
   * Token limit
   * @format int32
   */
  tokenLimit?: number;
  /** Signal if model is deprecated or not */
  deprecated?: boolean;
  /**
   * Nr billion parameters
   * @format int32
   */
  nrBillionParameters?: number;
  /** Hf link for model */
  hfLink?: string;
  /** Stability of the model */
  stability?: string;
  /** Hosting for the model */
  hosting?: string;
  /** Signal if the model is open source or not */
  openSource?: boolean;
  /** Description for the model */
  description?: string;
  /** Deployment name for the model */
  deploymentName?: string;
  /** Organization owning the model */
  org?: string;
  /** Vision setting for the model */
  vision?: boolean;
  /** Reasoning setting for the model */
  reasoning?: boolean;
  /** Base url for the model */
  baseUrl?: string;
  /** Organization enabled setting for the model */
  orgEnabled?: boolean;
  /** Organization default setting for the model */
  orgDefault?: boolean;
  /**
   * Timestamp when model was created
   * @format date-time
   */
  createdAt?: string;
  /**
   * Timestamp when model was last updated
   * @format date-time
   */
  updatedAt?: string;
}

/** Model for question response */
export interface QuestionResponse {
  /** The id of the session to be used when interacting with the assistant */
  sessionId?: string;
  /** The question to ask */
  question?: string;
  /** Answer to asked question */
  answer?: string;
  files?: File[];
  references?: Reference[];
  /** Model used when answering asked question */
  model?: Model;
  /** Tools used when answering asked question */
  tools?: Tools;
}

/** Model for reference information */
export interface Reference {
  /** Id of the reference */
  id?: string;
  /** Metadata for the reference */
  metadata?: Metadata;
  /** Group id to which the reference belongs */
  groupId?: string;
  /** Website id for the reference */
  websiteId?: string;
  /**
   * Timestamp when the reference was created
   * @format date-time
   */
  createdAt?: string;
  /**
   * Timestamp when the reference was last updated
   * @format date-time
   */
  updatedAt?: string;
  /**
   * Score for the reference
   * @format int32
   */
  score?: number;
}

/** Model for tools information */
export interface Tools {
  assistants?: Assistant[];
}
