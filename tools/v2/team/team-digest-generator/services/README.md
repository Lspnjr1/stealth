# Services

Business logic and data processing for the Team Digest Generator.

## Non-UI Execution Contract

This module provides a stable backend-facing execution contract for running services independently of presentation concerns. All typed inputs, outputs, error codes, and service boundaries are defined in `contract.ts` and exported through `index.ts`.

### Quick Start

```typescript
import {
  executeValidateConfig,
  executeSanitizeContent,
  executeSanitizeBatch,
  executeCreatePreviews,
  ServiceErrorCode,
} from "./services";

// Validate a digest configuration
const configResult = executeValidateConfig({
  teamId: "team-1",
  recipients: [{ id: "1", email: "user@example.com", name: "User" }],
  schedule: { type: "daily", value: "09:00" },
  filters: {},
});

if (!configResult.success) {
  configResult.errors.forEach((err) => {
    console.error(`[${err.code}] ${err.field}: ${err.message}`);
  });
}

// Sanitize email content
const contentResult = executeSanitizeContent('<script>alert("xss")</script>Hello');
// contentResult.data.sanitized === "Hello"
// contentResult.data.bytesRemoved === 26
```

## Entry Point

Import all services from the main entry point:

```typescript
import {
  // Execution functions
  executeValidateConfig,
  executeSanitizeContent,
  executeSanitizeEmail,
  executeSanitizeBatch,
  executeCreatePreviews,
  executeValidateEmail,

  // Direct service functions
  validateEmail,
  validateDigestConfig,
  sanitizeEmailContent,
  sanitizeDigestEmail,

  // Types
  ServiceResult,
  ServiceError,
  ServiceErrorCode,
  ValidationResult,

  // Limits
  ServiceLimits,
} from "./services";
```

## Typed Input/Output Contract

### Service Result Type

All execution functions return a `ServiceResult<T>`:

```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  errors: ServiceError[];
}

interface ServiceError {
  code: ServiceErrorCode;
  field?: string;
  message: string;
  context?: Record<string, unknown>;
}
```

### Error Codes

```typescript
enum ServiceErrorCode {
  // Validation
  REQUIRED = "REQUIRED",
  INVALID_FORMAT = "INVALID_FORMAT",
  INVALID_TYPE = "INVALID_TYPE",
  MAX_LENGTH_EXCEEDED = "MAX_LENGTH_EXCEEDED",
  VALUE_OUT_OF_BOUNDS = "VALUE_OUT_OF_BOUNDS",

  // Config
  EMPTY_ARRAY = "EMPTY_ARRAY",
  TOO_MANY_RECIPIENTS = "TOO_MANY_RECIPIENTS",
  DUPLICATE_RECIPIENT = "DUPLICATE_RECIPIENT",
  TOO_MANY_RULES = "TOO_MANY_RULES",
  TOO_MANY_CATEGORIES = "TOO_MANY_CATEGORIES",

  // Schedule
  INVALID_FIELD_COUNT = "INVALID_FIELD_COUNT",
  FIELD_TOO_COMPLEX = "FIELD_TOO_COMPLEX",
  INVALID_TIME_FORMAT = "INVALID_TIME_FORMAT",
  INVALID_TIMEZONE = "INVALID_TIMEZONE",

  // Execution
  SERVICE_ERROR = "SERVICE_ERROR",
  SANITIZATION_ERROR = "SANITIZATION_ERROR",
  PROCESSING_ERROR = "PROCESSING_ERROR",
}
```

### Service Limits

```typescript
const ServiceLimits = {
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 200,
  MAX_SUBJECT_LENGTH: 500,
  MAX_RECIPIENTS: 1000,
  MAX_EXCLUSION_RULES: 1000,
  MAX_CATEGORIES: 100,
  MAX_CATEGORY_LENGTH: 50,
  MAX_CRON_FIELD_LENGTH: 50,
  MAX_ATTACHMENT_SIZE: 104857600, // 100 MB
  MAX_FILENAME_LENGTH: 255,
  MAX_EMAILS_PER_DIGEST: 10000,
  MIN_IMPORTANCE: 0,
  MAX_IMPORTANCE: 10,
};
```

## Execution Functions

### `executeValidateConfig(config, options?)`

Validate a complete digest configuration.

```typescript
const result = executeValidateConfig({
  teamId: "team-1",
  recipients: [...],
  schedule: { type: "daily", value: "09:00" },
  filters: { minImportance: 5 }
});
```

### `executeSanitizeContent(content, options?)`

Sanitize HTML content and return metrics.

```typescript
const result = executeSanitizeContent(htmlString);
// result.data.sanitized: string
// result.data.bytesRemoved: number
```

### `executeSanitizeEmail(email, options?)`

Sanitize a single email object.

```typescript
const result = executeSanitizeEmail(digestEmail);
// result.data.email: DigestEmail
```

### `executeSanitizeBatch(emails, options?)`

Sanitize multiple emails efficiently.

```typescript
const result = executeSanitizeBatch(emailArray);
// result.data.emails: DigestEmail[]
// result.data.processedCount: number
```

### `executeCreatePreviews(emails, options?)`

Create sanitized preview objects for display.

```typescript
const result = executeCreatePreviews(emails);
// result.data.previews: EmailPreview[]
```

### `executeValidateEmail(email, options?)`

Validate a single email address.

```typescript
const result = executeValidateEmail("user@example.com");
// result.success: boolean
```

## Direct Service Functions

For lower-level access, use the service functions directly:

### Input Validation

- `validateEmail(email: string): ValidationError | null`
- `validateTeamMember(member: unknown): ValidationError | null`
- `validateScheduleExpression(schedule: unknown): ValidationError | null`
- `validateCronExpression(cron: string): ValidationError | null`
- `validateFilterRules(filters: unknown): ValidationError | null`
- `validateDigestConfig(config: unknown): ValidationResult`
- `sanitizeTeamMemberName(name: string): string`
- `isValidTimezone(tz: string): boolean`

### Content Sanitization

- `sanitizeEmailContent(html: string): string`
- `sanitizeEmailSubject(subject: string): string`
- `sanitizeSenderEmail(email: string): string`
- `sanitizeFilename(filename: string): string`
- `sanitizeDigestEmail(email: DigestEmail): DigestEmail`
- `sanitizeForJson(obj: unknown): string`
- `escapeHtml(text: string): string`
- `createSanitizedPreview(emails: DigestEmail[]): EmailPreview[]`
- `validateAttachment(attachment: AttachmentMetadata): AttachmentValidationResult`
- `formatBytes(bytes: number): string`

## Type Guards

```typescript
import {
  isValidationError,
  isDigestEmail,
  isTeamMember,
  isScheduleExpression,
} from "./services";

if (isDigestEmail(unknownData)) {
  // unknownData is now typed as DigestEmail
}
```

## Fixtures

Test fixtures are provided in `fixtures.ts` for both success and failure cases:

```typescript
import {
  // Success fixtures
  validTeamMembers,
  validSchedules,
  validFilters,
  validConfigs,
  validEmails,
  validHtmlContent,

  // Failure fixtures
  invalidTeamMembers,
  invalidSchedules,
  invalidFilters,
  invalidConfigs,
  xssVectors,
  controlCharacterFixtures,
  pathTraversalFixtures,

  // Generators
  generateValidEmails,
  generateValidTeamMembers,
  generateHtmlContent,
  generateMaliciousHtml,
} from "./services/fixtures";
```

## Module Responsibility

- Email aggregation and filtering
- Digest content generation
- Team member resolution
- Schedule management
- Input validation and sanitization
- Content security and normalization

## Services to Implement

### `digestAggregation.ts`

- Collect emails for digest period
- Sort and organize by sender/thread
- Apply user-configured filters
- Generate summary data

### `emailFiltering.ts`

- Apply digest-specific filters
- Handle excluded senders/categories
- Date range filtering
- Priority-based selection

### `teamResolution.ts`

- Resolve team member identities
- Map email addresses to team members
- Handle permission checking (future integration)
- Validate team membership

### `scheduleManagement.ts`

- Parse cron or schedule expressions
- Calculate next digest time
- Handle timezone awareness
- Validate schedule validity

## Performance Constraints

- Handle 1000+ emails per digest efficiently
- Sanitization should be streaming when possible
- No unnecessary data duplication
- Memory usage should scale linearly

## Security Constraints

- Validate all input before processing
- Sanitize all email content
- No logging of sensitive data
- Fail safely on malformed input

## Guidelines

- Pure functions where possible
- Comprehensive error handling
- Type-safe implementations
- Testable, isolated logic
