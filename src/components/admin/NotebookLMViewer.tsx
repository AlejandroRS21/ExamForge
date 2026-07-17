// ExamForge — NotebookLM Browser (Client Component)
// Wrapper that manages shared state between notebook browser and source list

"use client";

import { useState } from "react";
import { NotebookBrowser } from "./NotebookBrowser";
import { NotebookSourceList } from "./NotebookSourceList";

export function NotebookLMViewer() {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <NotebookBrowser
        onSelect={setSelectedNotebookId}
        selectedNotebookId={selectedNotebookId}
      />
      <NotebookSourceList notebookId={selectedNotebookId} />
    </div>
  );
}
