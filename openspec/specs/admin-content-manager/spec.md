# Admin Content Manager Specification

## Purpose
Management interface for NotebookLM resources, generation triggers, and content review.

## Requirements

### Requirement: Admin Content Management Interface
The system MUST provide an `/admin/notebooklm` UI to view notebooks, manage sources, trigger generation, monitor status, and review drafts.

#### Scenario: View notebook list and status
- GIVEN an authenticated admin user
- WHEN navigating to `/admin/notebooklm`
- THEN the system MUST display available notebooks, source counts, and current auth health status

#### Scenario: Trigger artifact generation
- GIVEN a selected notebook and target artifact type (audio, quiz, flashcards, mindmap)
- WHEN admin submits generation form
- THEN the system MUST initiate generation task, show progress indicator, and add item to pending review queue

#### Scenario: Review and approve draft queue
- GIVEN generated content in pending status
- WHEN admin approves or rejects content draft
- THEN system MUST update status to published or archived and make approved content visible to students
