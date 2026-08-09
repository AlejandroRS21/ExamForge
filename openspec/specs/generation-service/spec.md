# Generation Service Specification

## Purpose
Track NotebookLM metadata on database models and bridge MCP execution to domain records.

## Requirements

### Requirement: Schema Metadata Tracking
The system MUST store `notebookId`, `artifactId`, `audioUrl`, `downloadUrl`, and `topics` on `GeneratedContent` and `AudioExercise` records without breaking existing fields.

#### Scenario: Save generated content metadata
- GIVEN a completed NotebookLM artifact generation
- WHEN `generation-service` persists the result
- THEN `GeneratedContent` MUST store `notebookId`, `artifactId`, `downloadUrl`, and string array `topics`

#### Scenario: Audio exercise URL association
- GIVEN an audio artifact generation
- WHEN `AudioExercise` is updated
- THEN `audioUrl` and `notebookId` MUST be persisted alongside existing transcript and questions

### Requirement: Real MCP Integration in Generation Pipeline
The `generation-service` MUST replace mock `callNotebookLM()` calls with `notebooklm-client` operations while preserving existing response payload format.

#### Scenario: Async generation trigger and record creation
- GIVEN a valid content generation request
- WHEN `generateContent` is called
- THEN the system MUST trigger MCP creation, create a pending `GeneratedContent` record with `notebookId` and `artifactId`, and initiate async tracking
