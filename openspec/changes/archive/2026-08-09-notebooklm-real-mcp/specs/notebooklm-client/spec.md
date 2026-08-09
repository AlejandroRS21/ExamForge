# NotebookLM Client Specification

## Purpose
Unified MCP client abstraction over NotebookLM tools with mock fallback capabilities.

## Requirements

### Requirement: MCP Tool Unified Wrapper
The `notebooklm-client` MUST wrap NotebookLM MCP tools (`notebooklm_studio_create`, `notebooklm_studio_status`, `notebooklm_notebook_list`, `notebooklm_source_add`) with unified error handling and retry logic.

#### Scenario: Live MCP execution success
- GIVEN active auth and `NOTEBOOKLM_USE_MOCK=false`
- WHEN `createStudioArtifact` is invoked with valid `notebookId` and artifact type
- THEN the system MUST call `notebooklm_studio_create` and return `artifactId` and initial status

#### Scenario: Fallback to mock on stale auth or environment flag
- GIVEN `NOTEBOOKLM_USE_MOCK=true` OR MCP tool returns auth error `stale`/`unverified`
- WHEN any client method is invoked
- THEN the system MUST transparently execute mock implementation and return mock payload with fallback flag

#### Scenario: Polling status until completion
- GIVEN a pending `artifactId`
- WHEN `pollArtifactStatus` is invoked
- THEN the system MUST query `notebooklm_studio_status` until state becomes `completed` or `failed`
