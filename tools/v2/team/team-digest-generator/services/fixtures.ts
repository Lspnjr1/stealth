/**
 * Service Contract Fixtures
 *
 * Test fixtures for the non-UI execution contract covering
 * success and failure cases for all service operations.
 */

import {
  DigestConfig,
  DigestEmail,
  DigestFilters,
  ScheduleExpression,
  TeamMember,
  ValidationError,
} from "../types";
import { ServiceErrorCode, ServiceLimits } from "./contract";

// ============================================================================
// Success Case Fixtures
// ============================================================================

/**
 * Valid team member fixtures
 */
export const validTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    email: "alice@example.com",
    name: "Alice Johnson",
    role: "engineer",
  },
  {
    id: "member-2",
    email: "bob@example.com",
    name: "Bob Smith",
    role: "designer",
  },
  {
    id: "member-3",
    email: "charlie@example.com",
    name: "Charlie Brown",
  },
];

/**
 * Valid schedule expression fixtures
 */
export const validSchedules: Record<string, ScheduleExpression> = {
  dailyMorning: {
    type: "daily",
    value: "09:00",
    timezone: "America/New_York",
  },
  dailyEvening: {
    type: "daily",
    value: "17:30",
    timezone: "Europe/London",
  },
  weeklyMonday: {
    type: "weekly",
    value: "1 09:00",
    timezone: "UTC",
  },
  weeklySunday: {
    type: "weekly",
    value: "0 18:00",
    timezone: "Asia/Tokyo",
  },
  cronHourly: {
    type: "cron",
    value: "0 * * * *",
  },
  cronDaily: {
    type: "cron",
    value: "0 9 * * 1-5",
    timezone: "America/Los_Angeles",
  },
  cronComplex: {
    type: "cron",
    value: "0,30 9-17 * * 1-5",
    timezone: "Europe/Berlin",
  },
};

/**
 * Valid filter fixtures
 */
export const validFilters: Record<string, DigestFilters> = {
  empty: {},
  withExcludedSenders: {
    excludeSenders: ["spam@example.com", "noreply@example.com"],
  },
  withExcludedCategories: {
    excludeCategories: ["promotions", "social"],
  },
  withMinImportance: {
    minImportance: 5,
  },
  withDateRange: {
    dateRange: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    },
  },
  comprehensive: {
    excludeSenders: ["spam@example.com"],
    excludeCategories: ["promotions"],
    minImportance: 3,
  },
};

/**
 * Valid digest configuration fixtures
 */
export const validConfigs: Record<string, DigestConfig> = {
  minimal: {
    teamId: "team-minimal",
    recipients: [validTeamMembers[0]],
    schedule: validSchedules.dailyMorning,
    filters: validFilters.empty,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  standard: {
    teamId: "team-standard",
    recipients: validTeamMembers,
    schedule: validSchedules.dailyMorning,
    filters: validFilters.comprehensive,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-15"),
  },
  weekly: {
    teamId: "team-weekly",
    recipients: validTeamMembers.slice(0, 2),
    schedule: validSchedules.weeklyMonday,
    filters: validFilters.withMinImportance,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
  cronBased: {
    teamId: "team-cron",
    recipients: validTeamMembers,
    schedule: validSchedules.cronDaily,
    filters: validFilters.withExcludedSenders,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-05-01"),
  },
};

/**
 * Valid email fixtures
 */
export const validEmails: DigestEmail[] = [
  {
    id: "email-1",
    from: "sender@example.com",
    to: ["recipient@example.com"],
    subject: "Project Update",
    snippet: "Here is the latest update on our project progress...",
    timestamp: new Date("2024-06-15T10:00:00Z"),
    importance: 7,
    hasAttachments: false,
  },
  {
    id: "email-2",
    from: "manager@example.com",
    to: ["team@example.com"],
    subject: "Q3 Planning Meeting",
    snippet: "Please join us for the quarterly planning session.",
    timestamp: new Date("2024-06-15T11:00:00Z"),
    importance: 9,
    hasAttachments: true,
  },
  {
    id: "email-3",
    from: "hr@example.com",
    to: ["all@example.com"],
    subject: "Company Announcement",
    snippet: "We are pleased to announce new benefits starting next month.",
    timestamp: new Date("2024-06-15T14:30:00Z"),
    importance: 5,
    hasAttachments: false,
  },
];

/**
 * Valid HTML content fixtures (safe HTML)
 */
export const validHtmlContent: Record<string, string> = {
  plainText: "Hello, this is plain text content.",
  simpleHtml: "<p>This is a <strong>paragraph</strong> with formatting.</p>",
  withLinks:
    '<p>Visit <a href="https://example.com">our website</a> for more info.</p>',
  withList: "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
  withTable:
    "<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>",
};

// ============================================================================
// Failure Case Fixtures
// ============================================================================

/**
 * Invalid team member fixtures with expected errors
 */
export const invalidTeamMembers: Record<
  string,
  { input: unknown; expectedCode: ServiceErrorCode }
> = {
  nullMember: {
    input: null,
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  undefinedMember: {
    input: undefined,
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  missingEmail: {
    input: { id: "1", name: "Test" },
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  missingName: {
    input: { id: "1", email: "test@example.com" },
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  invalidEmailFormat: {
    input: { id: "1", email: "not-an-email", name: "Test" },
    expectedCode: ServiceErrorCode.INVALID_FORMAT,
  },
  emptyEmail: {
    input: { id: "1", email: "", name: "Test" },
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  emptyName: {
    input: { id: "1", email: "test@example.com", name: "" },
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  tooLongEmail: {
    input: {
      id: "1",
      email: "a".repeat(250) + "@example.com",
      name: "Test",
    },
    expectedCode: ServiceErrorCode.MAX_LENGTH_EXCEEDED,
  },
  tooLongName: {
    input: {
      id: "1",
      email: "test@example.com",
      name: "a".repeat(ServiceLimits.MAX_NAME_LENGTH + 1),
    },
    expectedCode: ServiceErrorCode.MAX_LENGTH_EXCEEDED,
  },
};

/**
 * Invalid schedule fixtures with expected errors
 */
export const invalidSchedules: Record<
  string,
  { input: unknown; expectedCode: ServiceErrorCode }
> = {
  nullSchedule: {
    input: null,
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  missingType: {
    input: { value: "09:00" },
    expectedCode: ServiceErrorCode.INVALID_TYPE,
  },
  invalidType: {
    input: { type: "invalid", value: "09:00" },
    expectedCode: ServiceErrorCode.INVALID_TYPE,
  },
  missingValue: {
    input: { type: "daily" },
    expectedCode: ServiceErrorCode.REQUIRED,
  },
  invalidDailyFormat: {
    input: { type: "daily", value: "25:00" },
    expectedCode: ServiceErrorCode.INVALID_TIME_FORMAT,
  },
  invalidDailyMinutes: {
    input: { type: "daily", value: "09:60" },
    expectedCode: ServiceErrorCode.INVALID_TIME_FORMAT,
  },
  invalidWeeklyFormat: {
    input: { type: "weekly", value: "Monday 09:00" },
    expectedCode: ServiceErrorCode.INVALID_WEEKLY_FORMAT,
  },
  invalidWeeklyDay: {
    input: { type: "weekly", value: "7 09:00" },
    expectedCode: ServiceErrorCode.INVALID_WEEKLY_FORMAT,
  },
  invalidCronFieldCount: {
    input: { type: "cron", value: "0 * * *" },
    expectedCode: ServiceErrorCode.INVALID_FIELD_COUNT,
  },
  invalidCronMinute: {
    input: { type: "cron", value: "60 * * * *" },
    expectedCode: ServiceErrorCode.VALUE_OUT_OF_BOUNDS,
  },
  invalidCronHour: {
    input: { type: "cron", value: "0 24 * * *" },
    expectedCode: ServiceErrorCode.VALUE_OUT_OF_BOUNDS,
  },
  cronFieldTooComplex: {
    input: { type: "cron", value: "a".repeat(60) + " * * * *" },
    expectedCode: ServiceErrorCode.FIELD_TOO_COMPLEX,
  },
  invalidTimezone: {
    input: { type: "daily", value: "09:00", timezone: "Invalid/Timezone" },
    expectedCode: ServiceErrorCode.INVALID_TIMEZONE,
  },
};

/**
 * Invalid filter fixtures with expected errors
 */
export const invalidFilters: Record<
  string,
  { input: unknown; expectedCode: ServiceErrorCode }
> = {
  excludeSendersNotArray: {
    input: { excludeSenders: "not-an-array" },
    expectedCode: ServiceErrorCode.INVALID_TYPE,
  },
  tooManyExcludeSenders: {
    input: {
      excludeSenders: Array.from(
        { length: ServiceLimits.MAX_EXCLUSION_RULES + 1 },
        (_, i) => `user${i}@example.com`
      ),
    },
    expectedCode: ServiceErrorCode.TOO_MANY_RULES,
  },
  invalidExcludeSenderEmail: {
    input: { excludeSenders: ["not-an-email"] },
    expectedCode: ServiceErrorCode.INVALID_FORMAT,
  },
  excludeCategoriesNotArray: {
    input: { excludeCategories: "not-an-array" },
    expectedCode: ServiceErrorCode.INVALID_TYPE,
  },
  tooManyCategories: {
    input: {
      excludeCategories: Array.from(
        { length: ServiceLimits.MAX_CATEGORIES + 1 },
        (_, i) => `category${i}`
      ),
    },
    expectedCode: ServiceErrorCode.TOO_MANY_CATEGORIES,
  },
  categoryTooLong: {
    input: {
      excludeCategories: ["a".repeat(ServiceLimits.MAX_CATEGORY_LENGTH + 1)],
    },
    expectedCode: ServiceErrorCode.INVALID_CATEGORY,
  },
  emptyCategory: {
    input: { excludeCategories: [""] },
    expectedCode: ServiceErrorCode.INVALID_CATEGORY,
  },
  invalidMinImportance: {
    input: { minImportance: 15 },
    expectedCode: ServiceErrorCode.INVALID_VALUE,
  },
  negativeMinImportance: {
    input: { minImportance: -1 },
    expectedCode: ServiceErrorCode.INVALID_VALUE,
  },
};

/**
 * Invalid config fixtures with expected errors
 */
export const invalidConfigs: Record<
  string,
  { input: unknown; expectedCodes: ServiceErrorCode[] }
> = {
  nullConfig: {
    input: null,
    expectedCodes: [ServiceErrorCode.REQUIRED],
  },
  missingTeamId: {
    input: {
      recipients: validTeamMembers,
      schedule: validSchedules.dailyMorning,
    },
    expectedCodes: [ServiceErrorCode.REQUIRED],
  },
  emptyRecipients: {
    input: {
      teamId: "team-1",
      recipients: [],
      schedule: validSchedules.dailyMorning,
    },
    expectedCodes: [ServiceErrorCode.EMPTY_ARRAY],
  },
  tooManyRecipients: {
    input: {
      teamId: "team-1",
      recipients: Array.from(
        { length: ServiceLimits.MAX_RECIPIENTS + 1 },
        (_, i) => ({
          id: `user-${i}`,
          email: `user${i}@example.com`,
          name: `User ${i}`,
        })
      ),
      schedule: validSchedules.dailyMorning,
    },
    expectedCodes: [ServiceErrorCode.TOO_MANY_RECIPIENTS],
  },
  duplicateRecipients: {
    input: {
      teamId: "team-1",
      recipients: [
        { id: "1", email: "same@example.com", name: "User 1" },
        { id: "2", email: "same@example.com", name: "User 2" },
      ],
      schedule: validSchedules.dailyMorning,
    },
    expectedCodes: [ServiceErrorCode.DUPLICATE_RECIPIENT],
  },
  recipientsNotArray: {
    input: {
      teamId: "team-1",
      recipients: "not-an-array",
      schedule: validSchedules.dailyMorning,
    },
    expectedCodes: [ServiceErrorCode.INVALID_TYPE],
  },
  invalidRecipient: {
    input: {
      teamId: "team-1",
      recipients: [{ id: "1", email: "invalid", name: "User" }],
      schedule: validSchedules.dailyMorning,
    },
    expectedCodes: [ServiceErrorCode.INVALID_FORMAT],
  },
  missingSchedule: {
    input: {
      teamId: "team-1",
      recipients: validTeamMembers,
    },
    expectedCodes: [ServiceErrorCode.REQUIRED],
  },
  multipleErrors: {
    input: {
      // Missing teamId
      recipients: [], // Empty
      schedule: { type: "daily", value: "25:00" }, // Invalid time
    },
    expectedCodes: [
      ServiceErrorCode.REQUIRED,
      ServiceErrorCode.EMPTY_ARRAY,
      ServiceErrorCode.INVALID_TIME_FORMAT,
    ],
  },
};

/**
 * XSS attack vector fixtures
 */
export const xssVectors: Record<string, { input: string; shouldBeRemoved: string }> = {
  scriptTag: {
    input: '<script>alert("xss")</script>Hello',
    shouldBeRemoved: '<script>alert("xss")</script>',
  },
  scriptTagUppercase: {
    input: '<SCRIPT>alert("xss")</SCRIPT>Hello',
    shouldBeRemoved: '<SCRIPT>alert("xss")</SCRIPT>',
  },
  onclickHandler: {
    input: '<div onclick="alert(1)">Click me</div>',
    shouldBeRemoved: 'onclick="alert(1)"',
  },
  onerrorHandler: {
    input: '<img src=x onerror="alert(1)">',
    shouldBeRemoved: 'onerror="alert(1)"',
  },
  javascriptProtocol: {
    input: '<a href="javascript:alert(1)">Click</a>',
    shouldBeRemoved: "javascript:",
  },
  dataProtocol: {
    input: '<a href="data:text/html,<script>alert(1)</script>">Click</a>',
    shouldBeRemoved: "data:",
  },
  vbscriptProtocol: {
    input: '<a href="vbscript:msgbox(1)">Click</a>',
    shouldBeRemoved: "vbscript:",
  },
  iframeTag: {
    input: '<iframe src="http://evil.com"></iframe>Content',
    shouldBeRemoved: '<iframe src="http://evil.com"></iframe>',
  },
  objectTag: {
    input: '<object data="http://evil.com"></object>Content',
    shouldBeRemoved: '<object data="http://evil.com"></object>',
  },
  embedTag: {
    input: '<embed src="http://evil.com">Content',
    shouldBeRemoved: '<embed src="http://evil.com">',
  },
  formTag: {
    input: '<form action="http://evil.com"><input></form>Content',
    shouldBeRemoved: "<form",
  },
  styleAttribute: {
    input: '<div style="background:url(javascript:alert(1))">Text</div>',
    shouldBeRemoved: 'style="background:url(javascript:alert(1))"',
  },
  onloadHandler: {
    input: '<body onload="alert(1)">Content</body>',
    shouldBeRemoved: 'onload="alert(1)"',
  },
  svgOnload: {
    input: '<svg onload="alert(1)"></svg>',
    shouldBeRemoved: 'onload="alert(1)"',
  },
};

/**
 * Control character fixtures
 */
export const controlCharacterFixtures: Record<
  string,
  { input: string; expected: string }
> = {
  nullByte: {
    input: "Hello\x00World",
    expected: "HelloWorld",
  },
  bellCharacter: {
    input: "Hello\x07World",
    expected: "HelloWorld",
  },
  backspace: {
    input: "Hello\x08World",
    expected: "HelloWorld",
  },
  tab: {
    input: "Hello\tWorld",
    expected: "HelloWorld",
  },
  newline: {
    input: "Hello\nWorld",
    expected: "HelloWorld",
  },
  carriageReturn: {
    input: "Hello\rWorld",
    expected: "HelloWorld",
  },
  escape: {
    input: "Hello\x1BWorld",
    expected: "HelloWorld",
  },
  delete: {
    input: "Hello\x7FWorld",
    expected: "HelloWorld",
  },
  c1Controls: {
    input: "Hello\x80\x81\x9FWorld",
    expected: "HelloWorld",
  },
  mixed: {
    input: "He\x00ll\x1Fo\x7F W\x9For\x08ld",
    expected: "Hello World",
  },
};

/**
 * Path traversal attack fixtures
 */
export const pathTraversalFixtures: Record<
  string,
  { input: string; shouldBeSafe: boolean }
> = {
  normalFilename: {
    input: "document.pdf",
    shouldBeSafe: true,
  },
  withDots: {
    input: "../../../etc/passwd",
    shouldBeSafe: false,
  },
  windowsPath: {
    input: "..\\..\\windows\\system32\\config",
    shouldBeSafe: false,
  },
  absolutePath: {
    input: "/etc/passwd",
    shouldBeSafe: false,
  },
  windowsAbsolute: {
    input: "C:\\Windows\\System32\\config",
    shouldBeSafe: false,
  },
  nullByteExtension: {
    input: "image.jpg\x00.exe",
    shouldBeSafe: false,
  },
  encodedTraversal: {
    input: "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    shouldBeSafe: true, // Should be sanitized but not detected as traversal
  },
};

// ============================================================================
// Expected Results
// ============================================================================

/**
 * Expected validation results for valid inputs
 */
export const expectedSuccessResults = {
  validEmail: { valid: true, error: null },
  validTeamMember: { valid: true, error: null },
  validSchedule: { valid: true, error: null },
  validFilters: { valid: true, error: null },
  validConfig: { valid: true, errors: [] },
};

/**
 * Expected sanitization results
 */
export const expectedSanitizationResults = {
  scriptRemoval: {
    input: '<script>alert("xss")</script>Hello World',
    output: "Hello World",
  },
  eventHandlerRemoval: {
    input: '<div onclick="evil()">Safe Content</div>',
    output: "<div>Safe Content</div>",
  },
  protocolReplacement: {
    input: '<a href="javascript:alert(1)">Link</a>',
    output: '<a href="#">Link</a>',
  },
  preserveSafeHtml: {
    input: "<p><strong>Bold</strong> and <em>italic</em></p>",
    output: "<p><strong>Bold</strong> and <em>italic</em></p>",
  },
  htmlEscaping: {
    input: '<script>alert("xss")</script>',
    escaped: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
  },
};

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Generate a large number of valid emails for performance testing
 */
export function generateValidEmails(count: number): DigestEmail[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `perf-email-${i}`,
    from: `sender${i % 100}@example.com`,
    to: [`recipient${i % 50}@example.com`],
    subject: `Performance Test Email ${i}`,
    snippet: `This is the content of email ${i}. `.repeat(5),
    timestamp: new Date(Date.now() - i * 60000),
    importance: (i % 10) + 1,
    hasAttachments: i % 5 === 0,
  }));
}

/**
 * Generate a large number of valid team members
 */
export function generateValidTeamMembers(count: number): TeamMember[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `member-${i}`,
    email: `user${i}@example.com`,
    name: `User Number ${i}`,
    role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "editor" : "viewer",
  }));
}

/**
 * Generate HTML content of specified size
 */
export function generateHtmlContent(sizeBytes: number): string {
  const chunk = "<p>This is a paragraph of content for testing.</p>\n";
  const repetitions = Math.ceil(sizeBytes / chunk.length);
  return chunk.repeat(repetitions).substring(0, sizeBytes);
}

/**
 * Generate malicious HTML content of specified size
 */
export function generateMaliciousHtml(sizeBytes: number): string {
  const chunks = [
    '<script>alert("xss")</script>',
    '<img src=x onerror="alert(1)">',
    '<iframe src="http://evil.com"></iframe>',
    '<a href="javascript:void(0)">click</a>',
    '<div onclick="evil()">content</div>',
  ];
  let result = "";
  let chunkIndex = 0;
  while (result.length < sizeBytes) {
    result += chunks[chunkIndex % chunks.length];
    chunkIndex++;
  }
  return result.substring(0, sizeBytes);
}
