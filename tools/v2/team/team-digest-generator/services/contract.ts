/**
 * Non-UI Execution Contract for Team Digest Generator Services
 *
 * This module defines the typed inputs, outputs, error codes, and service
 * boundaries for backend-facing execution independent of presentation concerns.
 */

import {
  DigestConfig,
  DigestEmail,
  DigestFilters,
  GeneratedDigest,
  ScheduleExpression,
  TeamMember,
  ValidationError,
} from "../types";

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Standardized error codes for service operations
 */
export enum ServiceErrorCode {
  // Validation errors
  REQUIRED = "REQUIRED",
  INVALID_FORMAT = "INVALID_FORMAT",
  INVALID_TYPE = "INVALID_TYPE",
  MAX_LENGTH_EXCEEDED = "MAX_LENGTH_EXCEEDED",
  VALUE_OUT_OF_BOUNDS = "VALUE_OUT_OF_BOUNDS",

  // Config validation
  EMPTY_ARRAY = "EMPTY_ARRAY",
  TOO_MANY_RECIPIENTS = "TOO_MANY_RECIPIENTS",
  DUPLICATE_RECIPIENT = "DUPLICATE_RECIPIENT",
  TOO_MANY_RULES = "TOO_MANY_RULES",
  TOO_MANY_CATEGORIES = "TOO_MANY_CATEGORIES",
  RULE_TOO_LONG = "RULE_TOO_LONG",
  INVALID_CATEGORY = "INVALID_CATEGORY",

  // Cron validation
  INVALID_FIELD_COUNT = "INVALID_FIELD_COUNT",
  FIELD_TOO_COMPLEX = "FIELD_TOO_COMPLEX",
  INVALID_RANGE = "INVALID_RANGE",
  INVALID_RANGE_VALUES = "INVALID_RANGE_VALUES",
  RANGE_OUT_OF_BOUNDS = "RANGE_OUT_OF_BOUNDS",
  INVALID_VALUE = "INVALID_VALUE",
  INVALID_STEP = "INVALID_STEP",

  // Schedule validation
  INVALID_TIME_FORMAT = "INVALID_TIME_FORMAT",
  INVALID_WEEKLY_FORMAT = "INVALID_WEEKLY_FORMAT",
  INVALID_TIMEZONE = "INVALID_TIMEZONE",

  // Service execution errors
  SERVICE_ERROR = "SERVICE_ERROR",
  SANITIZATION_ERROR = "SANITIZATION_ERROR",
  PROCESSING_ERROR = "PROCESSING_ERROR",
}

// ============================================================================
// Service Result Types
// ============================================================================

/**
 * Base result type for all service operations
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  errors: ServiceError[];
}

/**
 * Service-level error with code and context
 */
export interface ServiceError {
  code: ServiceErrorCode;
  field?: string;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Validation result with accumulated errors
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Service Input Types
// ============================================================================

/**
 * Input for digest configuration validation
 */
export interface ValidateConfigInput {
  config: unknown;
}

/**
 * Input for email content sanitization
 */
export interface SanitizeContentInput {
  content: string;
  options?: SanitizeOptions;
}

/**
 * Options for content sanitization
 */
export interface SanitizeOptions {
  /** Strip all HTML tags (default: false, removes only dangerous tags) */
  stripAllHtml?: boolean;
  /** Maximum output length (default: no limit) */
  maxLength?: number;
  /** Escape HTML entities for text display (default: false) */
  escapeForText?: boolean;
}

/**
 * Input for email sanitization
 */
export interface SanitizeEmailInput {
  email: DigestEmail;
}

/**
 * Input for batch email sanitization
 */
export interface SanitizeBatchInput {
  emails: DigestEmail[];
}

/**
 * Input for team member validation
 */
export interface ValidateTeamMemberInput {
  member: unknown;
}

/**
 * Input for schedule validation
 */
export interface ValidateScheduleInput {
  schedule: unknown;
}

/**
 * Input for filter rules validation
 */
export interface ValidateFiltersInput {
  filters: unknown;
}

// ============================================================================
// Service Output Types
// ============================================================================

/**
 * Output for digest configuration validation
 */
export interface ValidateConfigOutput {
  config: DigestConfig;
}

/**
 * Output for content sanitization
 */
export interface SanitizeContentOutput {
  sanitized: string;
  bytesRemoved: number;
}

/**
 * Output for email sanitization
 */
export interface SanitizeEmailOutput {
  email: DigestEmail;
}

/**
 * Output for batch email sanitization
 */
export interface SanitizeBatchOutput {
  emails: DigestEmail[];
  processedCount: number;
}

/**
 * Output for sanitized preview generation
 */
export interface SanitizedPreviewOutput {
  previews: EmailPreview[];
}

/**
 * Email preview data structure
 */
export interface EmailPreview {
  from: string;
  subject: string;
  snippet: string;
  hasAttachments: boolean;
}

// ============================================================================
// Service Boundaries
// ============================================================================

/**
 * Service operation limits and constraints
 */
export const ServiceLimits = {
  /** Maximum email address length (RFC 5322) */
  MAX_EMAIL_LENGTH: 254,

  /** Maximum team member name length */
  MAX_NAME_LENGTH: 200,

  /** Maximum email subject length */
  MAX_SUBJECT_LENGTH: 500,

  /** Maximum recipients per digest */
  MAX_RECIPIENTS: 1000,

  /** Maximum exclusion rules */
  MAX_EXCLUSION_RULES: 1000,

  /** Maximum category exclusions */
  MAX_CATEGORIES: 100,

  /** Maximum category name length */
  MAX_CATEGORY_LENGTH: 50,

  /** Maximum cron field length (ReDoS prevention) */
  MAX_CRON_FIELD_LENGTH: 50,

  /** Maximum attachment size (bytes) */
  MAX_ATTACHMENT_SIZE: 100 * 1024 * 1024, // 100 MB

  /** Maximum filename length */
  MAX_FILENAME_LENGTH: 255,

  /** Maximum emails per digest */
  MAX_EMAILS_PER_DIGEST: 10000,

  /** Importance range */
  MIN_IMPORTANCE: 0,
  MAX_IMPORTANCE: 10,
} as const;

/**
 * Cron field ranges for validation
 */
export const CronFieldRanges = {
  minute: { min: 0, max: 59, name: "minute" },
  hour: { min: 0, max: 23, name: "hour" },
  day: { min: 1, max: 31, name: "day" },
  month: { min: 1, max: 12, name: "month" },
  weekday: { min: 0, max: 6, name: "weekday" },
} as const;

/**
 * Schedule type literals
 */
export type ScheduleType = "daily" | "weekly" | "cron";

/**
 * Valid schedule types
 */
export const ValidScheduleTypes: readonly ScheduleType[] = [
  "daily",
  "weekly",
  "cron",
] as const;

// ============================================================================
// Service Interface Definitions
// ============================================================================

/**
 * Input validation service contract
 */
export interface IInputValidationService {
  validateEmail(email: string): ValidationError | null;
  validateTeamMember(member: unknown): ValidationError | null;
  validateScheduleExpression(schedule: unknown): ValidationError | null;
  validateCronExpression(cron: string): ValidationError | null;
  validateFilterRules(filters: unknown): ValidationError | null;
  validateDigestConfig(config: unknown): ValidationResult;
  sanitizeTeamMemberName(name: string): string;
  isValidTimezone(tz: string): boolean;
}

/**
 * Content sanitization service contract
 */
export interface IContentSanitizationService {
  sanitizeEmailContent(html: string): string;
  sanitizeEmailSubject(subject: string): string;
  sanitizeSenderEmail(email: string): string;
  sanitizeFilename(filename: string): string;
  sanitizeDigestEmail(email: DigestEmail): DigestEmail;
  sanitizeForJson(obj: unknown): string;
  escapeHtml(text: string): string;
  createSanitizedPreview(emails: DigestEmail[]): EmailPreview[];
}

/**
 * Attachment validation result
 */
export interface AttachmentValidationResult {
  filename: string;
  sizeFormatted: string;
  valid: boolean;
  error?: string;
}

/**
 * Attachment metadata for validation
 */
export interface AttachmentMetadata {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

// ============================================================================
// Execution Context
// ============================================================================

/**
 * Execution context for service operations (for logging, tracing)
 */
export interface ExecutionContext {
  /** Unique request/operation ID */
  requestId?: string;
  /** Team ID for the operation */
  teamId?: string;
  /** Timestamp of operation start */
  timestamp?: Date;
}

/**
 * Service execution options
 */
export interface ExecutionOptions {
  /** Execution context for tracing */
  context?: ExecutionContext;
  /** Enable strict validation mode */
  strict?: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for ValidationError
 */
export function isValidationError(value: unknown): value is ValidationError {
  return (
    typeof value === "object" &&
    value !== null &&
    "field" in value &&
    "message" in value &&
    "code" in value
  );
}

/**
 * Type guard for DigestEmail
 */
export function isDigestEmail(value: unknown): value is DigestEmail {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "from" in value &&
    "subject" in value &&
    "snippet" in value
  );
}

/**
 * Type guard for TeamMember
 */
export function isTeamMember(value: unknown): value is TeamMember {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    "name" in value
  );
}

/**
 * Type guard for ScheduleExpression
 */
export function isScheduleExpression(
  value: unknown
): value is ScheduleExpression {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "value" in value &&
    ValidScheduleTypes.includes((value as ScheduleExpression).type)
  );
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a successful service result
 */
export function createSuccessResult<T>(data: T): ServiceResult<T> {
  return {
    success: true,
    data,
    errors: [],
  };
}

/**
 * Create a failed service result
 */
export function createErrorResult<T>(
  errors: ServiceError[]
): ServiceResult<T> {
  return {
    success: false,
    errors,
  };
}

/**
 * Create a service error from a validation error
 */
export function createServiceError(
  code: ServiceErrorCode,
  message: string,
  field?: string,
  context?: Record<string, unknown>
): ServiceError {
  return {
    code,
    message,
    field,
    context,
  };
}

/**
 * Convert ValidationError to ServiceError
 */
export function validationToServiceError(
  error: ValidationError
): ServiceError {
  return {
    code: error.code as ServiceErrorCode,
    field: error.field,
    message: error.message,
  };
}
