/**
 * Unit tests run cleanly without requiring local AiTestingTool ingest credentials —
 * screenshot helpers return metadata-only when URL/token are absent.
 */
for (const key of [
  'AI_TESTING_TOOL_ATTACH_URL',
]) {
  delete process.env[key];
}
