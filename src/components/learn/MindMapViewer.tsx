// ExamForge — MindMapViewer Component
// Renders a mind map as an expandable/collapsible tree using HTML/CSS
// Parses JSON mind map data with nodes and children

"use client";

import { useState, useCallback } from "react";

interface MindMapNode {
  id: string;
  label: string;
  children?: string[];
}

interface MindMapData {
  nodes: MindMapNode[];
}

interface MindMapViewerProps {
  data: MindMapData;
}

function buildTree(nodes: MindMapNode[]): MindMapNode | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childIds = new Set(nodes.flatMap((n) => n.children ?? []));
  const root = nodes.find((n) => !childIds.has(n.id));
  return root ?? nodes[0] ?? null;
}

function TreeNode({
  node,
  nodeMap,
  expanded,
  onToggle,
  depth,
}: {
  node: MindMapNode;
  nodeMap: Map<string, MindMapNode>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 transition-colors group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
            type="button"
          >
            <svg
              className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}
        <span className={`text-sm ${depth === 0 ? "font-semibold" : ""}`}>
          {node.label}
        </span>
        {hasChildren && (
          <span className="text-[10px] text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            {node.children!.length}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {node.children!.map((childId) => {
            const childNode = nodeMap.get(childId);
            if (!childNode) return null;
            return (
              <TreeNode
                key={childId}
                node={childNode}
                nodeMap={nodeMap}
                expanded={expanded}
                onToggle={onToggle}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MindMapViewer({ data }: MindMapViewerProps) {
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));
  const root = buildTree(data.nodes);

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    data.nodes.forEach((n) => {
      if (n.children && n.children.length > 0) {
        initial.add(n.id);
      }
    });
    return initial;
  });

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set(data.nodes.filter((n) => n.children && n.children.length > 0).map((n) => n.id)));
  }, [data.nodes]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  if (!root) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No mind map data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-xs text-muted-foreground">
          {data.nodes.length} node{data.nodes.length !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            Expand all
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="p-2" role="tree" aria-label="Mind map">
        <TreeNode
          node={root}
          nodeMap={nodeMap}
          expanded={expanded}
          onToggle={handleToggle}
          depth={0}
        />
      </div>
    </div>
  );
}
