"use client";

import { useCallback, useMemo, useEffect } from "react";
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
import { useAgentStore } from "@/lib/stores/agent-store";
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
  agentPhase: string,
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Center node
  nodes.push({
    id: "center",
    type: "center",
    position: { x: 0, y: 0 },
    data: { label: projectName, agentPhase },
    draggable: false,
  });

  // Domain nodes in radial layout
  const activeDomains = DOMAINS.filter(
    (d) => domainStates[d.id]?.status !== "locked",
  );
  const radius = 320;
  const angleStep = (2 * Math.PI) / Math.max(activeDomains.length, 1);
  const startAngle = -Math.PI / 2;

  activeDomains.forEach((domain, i) => {
    const angle = startAngle + i * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const state = domainStates[domain.id];

    nodes.push({
      id: domain.id,
      type: "domain",
      position: { x: x - 80, y: y - 40 },
      data: {
        domain,
        state,
        isFocused: focusedDomainId === domain.id,
        isOtherFocused:
          focusedDomainId !== null && focusedDomainId !== domain.id,
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
        isActive:
          state?.status === "probing" || state?.status === "building",
      },
    });
  });

  return { nodes, edges };
}

export function CanvasShell() {
  const project = useProjectStore((s) => s.project);
  const domainStates = useDomainStore((s) => s.domainStates);
  const focusedDomainId = useUIStore((s) => s.focusedDomainId);
  const agentPhase = useAgentStore((s) => s.currentPhase);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const setFocusedDomain = useUIStore((s) => s.setFocusedDomain);
  const closeDetailPanel = useUIStore((s) => s.closeDetailPanel);

  const { nodes: computed, edges: computedEdges } = useMemo(
    () =>
      buildCanvasElements(
        project?.name || "Harbor Eval",
        domainStates,
        focusedDomainId,
        agentPhase,
      ),
    [project?.name, domainStates, focusedDomainId, agentPhase],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(computed);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  // Sync computed state back into React Flow when store data changes
  useEffect(() => {
    setNodes(computed);
  }, [computed, setNodes]);

  useEffect(() => {
    setEdges(computedEdges);
  }, [computedEdges, setEdges]);

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
