import { createEdge } from "./factory";
import type { AppNode, DiagramDoc } from "./types";

export function sampleDoc(): DiagramDoc {
  const nodes: AppNode[] = [
    {
      id: "vpc",
      type: "frame",
      position: { x: 360, y: 20 },
      width: 600,
      height: 460,
      data: { label: "Production VPC", color: "#8b5cf6", strokeStyle: "dashed", fillStyle: "semi" },
    },
    { id: "users", type: "icon", position: { x: 20, y: 200 }, data: { label: "Users", iconId: "users" } },
    { id: "cdn", type: "icon", position: { x: 190, y: 200 }, data: { label: "CDN", iconId: "cloudflare" } },
    {
      id: "lb",
      type: "icon",
      parentId: "vpc",
      position: { x: 30, y: 180 },
      data: { label: "Load Balancer", iconId: "load-balancer" },
    },
    {
      id: "api",
      type: "icon",
      parentId: "vpc",
      position: { x: 230, y: 80 },
      data: { label: "API Service", iconId: "nodejs", sublabel: "3 replicas" },
    },
    {
      id: "kafka",
      type: "icon",
      parentId: "vpc",
      position: { x: 230, y: 310 },
      data: { label: "Kafka", iconId: "kafka" },
    },
    {
      id: "pg",
      type: "icon",
      parentId: "vpc",
      position: { x: 450, y: 30 },
      data: { label: "PostgreSQL", iconId: "postgresql" },
    },
    {
      id: "redis",
      type: "icon",
      parentId: "vpc",
      position: { x: 450, y: 170 },
      data: { label: "Redis Cache", iconId: "redis" },
    },
    {
      id: "worker",
      type: "icon",
      parentId: "vpc",
      position: { x: 450, y: 310 },
      data: { label: "Workers", iconId: "docker" },
    },
    { id: "s3", type: "icon", position: { x: 1040, y: 330 }, data: { label: "Object Storage", iconId: "object-storage" } },
    { id: "stripe", type: "icon", position: { x: 1040, y: -60 }, data: { label: "Stripe", iconId: "stripe" } },
    {
      id: "note",
      type: "shape",
      position: { x: 20, y: 380 },
      width: 260,
      height: 100,
      data: {
        label: "Drag icons from the left panel.\nDouble-click any label to edit.",
        shape: "note",
        fill: "#fef9c3",
        stroke: "#eab308",
        textColor: "#713f12",
      },
    },
  ];

  const edges = [
    createEdge({ source: "users", target: "cdn", sourceHandle: "r", targetHandle: "l" }, { label: "HTTPS" }),
    createEdge({ source: "cdn", target: "lb", sourceHandle: "r", targetHandle: "l" }),
    createEdge({ source: "lb", target: "api", sourceHandle: "r", targetHandle: "l" }),
    createEdge({ source: "api", target: "pg", sourceHandle: "r", targetHandle: "l" }, { label: "SQL" }),
    createEdge({ source: "api", target: "redis", sourceHandle: "r", targetHandle: "l" }),
    createEdge({ source: "api", target: "kafka", sourceHandle: "b", targetHandle: "t" }, { label: "events", strokeStyle: "dashed" }),
    createEdge({ source: "kafka", target: "worker", sourceHandle: "r", targetHandle: "l" }, { label: "consume" }, { animated: true }),
    createEdge({ source: "worker", target: "s3", sourceHandle: "r", targetHandle: "l" }, { label: "uploads", strokeStyle: "dotted", strokeWidth: 2.5 }),
    createEdge({ source: "api", target: "stripe", sourceHandle: "t", targetHandle: "l" }, { label: "charges", color: "#635bff" }),
  ];

  return { version: 1, title: "Web App Architecture", nodes, edges };
}

export function blankDoc(): DiagramDoc {
  return { version: 1, title: "Untitled diagram", nodes: [], edges: [] };
}
