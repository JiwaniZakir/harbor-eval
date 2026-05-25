"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useProjectStore } from "@/lib/stores/project-store";
import { useDomainStore } from "@/lib/stores/domain-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { DOMAINS } from "@/lib/domain/domains";
import { CenterModelNode } from "./center-model-node";
import { DomainNode } from "./domain-node";
import { DomainEdge } from "./domain-edge";
import type { DomainId } from "@/lib/types";

const nodeTypes: NodeTypes = {
  center: CenterModelNode,
  domain: DomainNode,
};

const edgeTypes: EdgeTypes = {
  domain: DomainEdge,
};

function buildCanvasElements(
  projectName: string,
  domainStates: Record<string, { status: string; progress: number }>,
  focusedDomainId: DomainId | null,
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Center node
  nodes.push({
    id: "center",
    type: "center",
    position: { x: 0, y: 0 },
    data: { label: projectName },
    draggable: false,
  });

  // Domain nodes in radial layout
  const activeDomains = DOMAINS.filter(
    (d) => domainStates[d.id]?.status !== "locked",
  );
  const radius = 320;
  const angleStep = (2 * Math.PI) / Math.max(activeDomains.length, 1);
  const startAngle = -Math.PI / 2; // Start from top

  activeDomains.forEach((domain, i) => {
    const angle = startAngle + i * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const state = domainStates[domain.id];

    nodes.push({
      id: domain.id,
      type: "domain",
      position: { x: x - 80, y: y - 40 }, // Center the node (approx 160x80)
      data: {
        domain,
        state,
        isFocused: focusedDomainId === domain.id,
        isOtherFocused: focusedDomainId !== null && focusedDomainId !== domain.id,
      },
      draggable: false,
    });

    edges.push({
      id: `center-${domain.id}`,
      source: "center",
      target: domain.id,
      type: "domain",
      data: {
        accent: domain.accent,
        isActive: state?.status === "probing",
      },
    });
  });

  return { nodes, edges };
}

export function CanvasShell() {
  const project = useProjectStore((s) => s.project);
  const domainStates = useDomainStore((s) => s.domainStates);
  const focusedDomainId = useUIStore((s) => s.focusedDomainId);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const setFocusedDomain = useUIStore((s) => s.setFocusedDomain);
  const closeDetailPanel = useUIStore((s) => s.closeDetailPanel);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      buildCanvasElements(
        project?.name || "Harbor Eval",
        domainStates,
        focusedDomainId,
      ),
    [project?.name, domainStates, focusedDomainId],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "domain") {
        const domainId = node.id as DomainId;
        setFocusedDomain(domainId);
        openDetailPanel({ kind: "domain", domainId });
      }
    },
    [setFocusedDomain, openDetailPanel],
  );

  const onPaneClick = useCallback(() => {
    setFocusedDomain(null);
    closeDetailPanel();
  }, [setFocusedDomain, closeDetailPanel]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: false }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--foreground-10)"
        />
      </ReactFlow>
    </div>
  );
}
