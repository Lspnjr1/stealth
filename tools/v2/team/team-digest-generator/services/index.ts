/**
 * Team Digest Generator Services - Non-UI Entry Point
 *
 * This module provides a backend-facing execution contract for the
 * Team Digest Generator services, independent of presentation concerns.
 *
 * @module services
 */

// ============================================================================
// Contract Types and Constants
// ============================================================================

export {
  // Error codes
  ServiceErrorCode,

  // Result types
  type ServiceResult,
  type ServiceError,
  type ValidationResult,

  // Input types
  type ValidateConfigInput,
  type SanitizeContentInput,
  type SanitizeOptions,
  type SanitizeEmailInput,
  type SanitizeBatchInput,
  type ValidateTeamMemberInput,
  type ValidateScheduleInput,
  type ValidateFiltersInput,

  // Output types
  type ValidateConfigOutput,
  type SanitizeContentOutput,
  type SanitizeEmailOutput,
  type SanitizeBatchOutput,
  type SanitizedPreviewOutput,
  type EmailPreview,

  // Service boundaries
  ServiceLimits,
  CronFieldRanges,
  ValidScheduleTypes,
  type ScheduleType,

  // Service interfaces
  type IInputValidationService,
  type IContentSanitizationService,
  type AttachmentValidationResult,
  type AttachmentMetadata,

  // Execution context
  type ExecutionContext,
  type ExecutionOptions,

  // Type guards
  isValidationError,
  isDigestEmail,
  isTeamMember,
  isScheduleExpression,

  // Factory functions
  createSuccessResult,
  createErrorResult,
  createServiceError,
  validationToServiceError,
} from "./contract";

// ============================================================================
// Input Validation Service
// ============================================================================

export {
  validateEmail,
  validateTeamMember,
  validateScheduleExpression,
  validateCronExpression,
  validateFilterRules,
  validateDigestConfig,
  sanitizeTeamMemberName,
  isValidTimezone,
} from "./inputValidation";

// ============================================================================
// Content Sanitization Service
// ============================================================================

export {
  sanitizeEmailContent,
  sanitizeEmailSubject,
  sanitizeSenderEmail,
  sanitizeFilename,
  sanitizeDigestEmail,
  sanitizeForJson,
  escapeHtml,
  createSanitizedPreview,
  validateAttachment,
  formatBytes,
} from "./contentSanitization";

// ============================================================================
// Domain Types (re-exported from types module)
// ============================================================================

export type {
  DigestConfig,
  DigestEmail,
  DigestFilters,
  GeneratedDigest,
  ScheduleExpression,
  TeamMember,
  ValidationError,
} from "../types";

// ============================================================================
// Service Execution Functions
// ============================================================================

import { DigestEmail } from "../types";
import {
  ServiceResult,
  ServiceErrorCode,
  SanitizeContentOutput,
  SanitizeBatchOutput,
  SanitizedPreviewOutput,
  ExecutionOptions,
  createSuccessResult,
  createErrorResult,
  createServiceError,
  validationToServiceError,
  ServiceLimits,
} from "./contract";
import {
  validateDigestConfig as validateConfig,
  validateEmail as validateEmailFn,
} from "./inputValidation";
import {
  sanitizeEmailContent as sanitizeContent,
  sanitizeDigestEmail as sanitizeEmail,
  createSanitizedPreview as createPreview,
} from "./contentSanitization";

/**
 * Validate a digest configuration with full error reporting
 *
 * @param config - The configuration object to validate
 * @param options - Execution options
 * @returns ServiceResult with validation status and errors
 *
 * @example
 * ```typescript
 * const result = executeValidateConfig({
 *   teamId: "team-1",
 *   recipients: [{ id: "1", email: "user@example.com", name: "User" }],
 *   schedule: { type: "daily", value: "09:00" },
 *   filters: {}
 * });
 *
 * if (!result.success) {
 *   console.error("Validation failed:", result.errors);
 * }
 * ```
 */
export function executeValidateConfig(
  config: unknown,
  options?: ExecutionOptions
): ServiceResult<{ valid: boolean }> {
  try {
    const result = validateConfig(config);

    if (!result.valid) {
      return createErrorResult(
        result.errors.map(validationToServiceError)
      );
    }

    return createSuccessResult({ valid: true });
  } catch (error) {
    return createErrorResult([
      createServiceError(
        ServiceErrorCode.SERVICE_ERROR,
        error instanceof Error ? error.message : "Unknown validation error"
      ),
    ]);
  }
}

/**
 * Sanitize HTML content with metrics
 *
 * @param content - The HTML content to sanitize
 * @param options - Execution options
 * @returns ServiceResult with sanitized content and metrics
 *
 * @example
 * ```typescript
 * const result = executeSanitizeContent('<script>alert("xss")</script>Hello');
 * // result.data.sanitized === "Hello"
 * // result.data.bytesRemoved === 26
 * ```
 */
export function executeSanitizeContent(
  content: string,
  options?: ExecutionOptions
): ServiceResult<SanitizeContentOutput> {
  try {
    if (typeof content !== "string") {
      return createErrorResult([
        createServiceError(
          ServiceErrorCode.INVALID_TYPE,
          "Content must be a string",
          "content"
        ),
      ]);
    }

    const originalLength = content.length;
    const sanitized = sanitizeContent(content);
    const bytesRemoved = originalLength - sanitized.length;

    return createSuccessResult({
      sanitized,
      bytesRemoved,
    });
  } catch (error) {
    return createErrorResult([
      createServiceError(
        ServiceErrorCode.SANITIZATION_ERROR,
        error instanceof Error ? error.message : "Unknown sanitization error"
      ),
    ]);
  }
}

/**
 * Sanitize a single email
 *
 * @param email - The email to sanitize
 * @param options - Execution options
 * @returns ServiceResult with sanitized email
 *
 * @example
 * ```typescript
 * const result = executeSanitizeEmail({
 *   id: "1",
 *   from: "sender@example.com",
 *   to: ["recipient@example.com"],
 *   subject: "Test",
 *   snippet: "<script>bad</script>Hello",
 *   timestamp: new Date(),
 *   importance: 5,
 *   hasAttachments: false
 * });
 * ```
 */
export function executeSanitizeEmail(
  email: DigestEmail,
  options?: ExecutionOptions
): ServiceResult<{ email: DigestEmail }> {
  try {
    if (!email || typeof email !== "object") {
      return createErrorResult([
        createServiceError(
          ServiceErrorCode.INVALID_TYPE,
          "Email must be an object",
          "email"
        ),
      ]);
    }

    const sanitizedEmail = sanitizeEmail(email);
    return createSuccessResult({ email: sanitizedEmail });
  } catch (error) {
    return createErrorResult([
      createServiceError(
        ServiceErrorCode.SANITIZATION_ERROR,
        error instanceof Error ? error.message : "Unknown sanitization error"
      ),
    ]);
  }
}

/**
 * Sanitize a batch of emails
 *
 * @param emails - Array of emails to sanitize
 * @param options - Execution options
 * @returns ServiceResult with sanitized emails and count
 *
 * @example
 * ```typescript
 * const result = executeSanitizeBatch(emailArray);
 * console.log(`Processed ${result.data.processedCount} emails`);
 * ```
 */
export function executeSanitizeBatch(
  emails: DigestEmail[],
  options?: ExecutionOptions
): ServiceResult<SanitizeBatchOutput> {
  try {
    if (!Array.isArray(emails)) {
      return createErrorResult([
        createServiceError(
          ServiceErrorCode.INVALID_TYPE,
          "Emails must be an array",
          "emails"
        ),
      ]);
    }

    if (emails.length > ServiceLimits.MAX_EMAILS_PER_DIGEST) {
      return createErrorResult([
        createServiceError(
          ServiceErrorCode.VALUE_OUT_OF_BOUNDS,
          `Too many emails (max ${ServiceLimits.MAX_EMAILS_PER_DIGEST})`,
          "emails",
          { count: emails.length, max: ServiceLimits.MAX_EMAILS_PER_DIGEST }
        ),
      ]);
    }

    const sanitizedEmails = emails.map(sanitizeEmail);

    return createSuccessResult({
      emails: sanitizedEmails,
      processedCount: sanitizedEmails.length,
    });
  } catch (error) {
    return createErrorResult([
      createServiceError(
        ServiceErrorCode.PROCESSING_ERROR,
        error instanceof Error ? error.message : "Unknown processing error"
      ),
    ]);
  }
}

/**
 * Create sanitized previews for a list of emails
 *
 * @param emails - Array of emails to create previews for
 * @param options - Execution options
 * @returns ServiceResult with preview array
 *
 * @example
 * ```typescript
 * const result = executeCreatePreviews(emails);
 * result.data.previews.forEach(preview => {
 *   console.log(`From: ${preview.from}, Subject: ${preview.subject}`);
 * });
 * ```
 */
export function executeCreatePreviews(
  emails: DigestEmail[],
  options?: ExecutionOptions
): ServiceResult<SanitizedPreviewOutput> {
  try {
    if (!Array.isArray(emails)) {
      return createErrorResult([
        createServiceError(
          ServiceErrorCode.INVALID_TYPE,
          "Emails must be an array",
          "emails"
        ),
      ]);
    }

    const previews = createPreview(emails);

    return createSuccessResult({ previews });
  } catch (error) {
    return createErrorResult([
      createServiceError(
        ServiceErrorCode.PROCESSING_ERROR,
        error instanceof Error ? error.message : "Unknown processing error"
      ),
    ]);
  }
}

/**
 * Validate an email address
 *
 * @param email - The email address to validate
 * @param options - Execution options
 * @returns ServiceResult with validation status
 *
 * @example
 * ```typescript
 * const result = executeValidateEmail("user@example.com");
 * if (result.success) {
 *   console.log("Email is valid");
 * }
 * ```
 */
export function executeValidateEmail(
  email: string,
  options?: ExecutionOptions
): ServiceResult<{ valid: boolean }> {
  try {
    const error = validateEmailFn(email);

    if (error) {
      return createErrorResult([validationToServiceError(error)]);
    }

    return createSuccessResult({ valid: true });
  } catch (error) {
    return createErrorResult([
      createServiceError(
        ServiceErrorCode.SERVICE_ERROR,
        error instanceof Error ? error.message : "Unknown validation error"
      ),
    ]);
  }
}
