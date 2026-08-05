import { useSyncExternalStore } from "react";

export type BambooAgentState = Readonly<{
  id: string;
  x: number;
  y: number;
  rotation: number;
}>;

export type BambooPhysicsSnapshot = Readonly<{
  agents: readonly BambooAgentState[];
  platformHeights: readonly number[];
}>;

type MutableAgent = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  vx: number;
  vy: number;
  angularVelocity: number;
};

const COLUMN_COUNT = 18;
const EDGE_COLUMN_COUNT = 4;
const PLATFORM_BEAT_DURATION = 0.525;
const PLATFORM_TRANSITION_FRACTION = 0.22;
const EDGE_PLATFORM_MAX_HEIGHT = 9;
const CENTER_PLATFORM_MAX_HEIGHT = 5;
const AGENT_RADIUS = 0.024;
const PLATFORM_HALF_WIDTH = 0.04;
const GRAVITY = 0.82;
const MAX_ANGULAR_VELOCITY = Math.PI * 2;
const FLOOR_BOUNCE_MIN_SPEED = 0.78;
const PLATFORM_BOUNCE_MIN_SPEED = 0.88;
const PLATFORM_BOUNCE_BOOST = 0.42;
const CEILING_BOUNCE_MIN_SPEED = 0.48;
const BOUNCE_SPEED_SCALE = 0.5;
const BOUNCE_SPEED_OFFSET = 0.2;

// The center keeps the hero controls clear: 6-9 are impossible there. The low
// states 0-2 occupy two thirds of the center targets, while 3-5 occupy the
// remaining third.
const CENTER_PLATFORM_HEIGHT_DISTRIBUTION = [
  0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2,
  3, 4, 5, 3, 4, 5,
] as const;

// The outer four columns on each side retain the full 0-9 range used before
// the center-safe area was introduced.
const EDGE_PLATFORM_HEIGHT_DISTRIBUTION = [
  0, 1, 2, 0, 1, 2, 0, 1, 2,
  3, 4, 5, 3, 4, 5, 6, 7, 8, 9, 6, 7, 8, 9,
] as const;

const INITIAL_AGENTS: MutableAgent[] = [
  { id: "codex", x: 0.18, y: 0.78, vx: 0.24, vy: -0.34, rotation: 0, angularVelocity: 1.8 },
  { id: "claude", x: 0.47, y: 0.62, vx: -0.18, vy: -0.28, rotation: 0.7, angularVelocity: -1.4 },
  { id: "opencode", x: 0.77, y: 0.76, vx: -0.22, vy: -0.4, rotation: -0.5, angularVelocity: 2.1 },
  { id: "minimax", x: 0.33, y: 0.44, vx: 0.2, vy: 0.12, rotation: 1.4, angularVelocity: -1.8 },
  { id: "deepseek", x: 0.64, y: 0.28, vx: -0.16, vy: 0.2, rotation: -0.8, angularVelocity: 1.3 },
  { id: "hermes", x: 0.88, y: 0.42, vx: -0.25, vy: 0.08, rotation: -1.1, angularVelocity: 1.7 },
  { id: "openai", x: 0.52, y: 0.18, vx: 0.14, vy: 0.22, rotation: 0.2, angularVelocity: -1.1 },
  { id: "gemini", x: 0.58, y: 0.38, vx: 0.16, vy: -0.12, rotation: -0.6, angularVelocity: 1.4 },
  { id: "qwen", x: 0.08, y: 0.54, vx: 0.22, vy: -0.18, rotation: 0.5, angularVelocity: -1.3 },
  { id: "kimi", x: 0.92, y: 0.58, vx: -0.2, vy: -0.14, rotation: -0.9, angularVelocity: 1.1 },
];

let agents = INITIAL_AGENTS.map((agent) => ({ ...agent }));
let snapshot: BambooPhysicsSnapshot = {
  agents: agents.map(({ id, x, y, rotation }) => ({ id, x, y, rotation })),
  platformHeights: platformHeightsAt(0),
};
let elapsed = 0;
let lastFrameTime = 0;
let animationFrame: number | null = null;
const listeners = new Set<() => void>();

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clampAngularVelocity(agent: MutableAgent): void {
  agent.angularVelocity = Math.max(
    -MAX_ANGULAR_VELOCITY,
    Math.min(MAX_ANGULAR_VELOCITY, agent.angularVelocity),
  );
}

function targetPlatformHeight(columnIndex: number, beat: number): number {
  const random = Math.sin((columnIndex + 1) * 12.9898 + (beat + 1) * 78.233) * 43758.5453;
  const normalized = random - Math.floor(random);
  const distribution = platformHeightDistribution(columnIndex);
  const distributionIndex = Math.floor(normalized * distribution.length);

  return distribution[distributionIndex]!;
}

function platformCount(columnIndex: number, time: number): number {
  const beatPosition = time / PLATFORM_BEAT_DURATION + columnIndex * 0.27;
  const beat = Math.floor(beatPosition);
  const phaseProgress = beatPosition - beat;
  const fromCount = targetPlatformHeight(columnIndex, beat);
  const toCount = targetPlatformHeight(columnIndex, beat + 1);
  const transitionProgress = Math.min(phaseProgress / PLATFORM_TRANSITION_FRACTION, 1);
  return Math.round(fromCount + (toCount - fromCount) * transitionProgress);
}

function isEdgeColumn(columnIndex: number): boolean {
  return columnIndex < EDGE_COLUMN_COUNT || columnIndex >= COLUMN_COUNT - EDGE_COLUMN_COUNT;
}

function platformHeightDistribution(columnIndex: number): readonly number[] {
  return isEdgeColumn(columnIndex)
    ? EDGE_PLATFORM_HEIGHT_DISTRIBUTION
    : CENTER_PLATFORM_HEIGHT_DISTRIBUTION;
}

function platformMaxHeight(columnIndex: number): number {
  return isEdgeColumn(columnIndex) ? EDGE_PLATFORM_MAX_HEIGHT : CENTER_PLATFORM_MAX_HEIGHT;
}

function platformTop(columnIndex: number, time: number): number | null {
  const segmentCount = platformCount(columnIndex, time);

  if (segmentCount === 0) {
    return null;
  }

  return 0.96 - (segmentCount / platformMaxHeight(columnIndex)) * 0.44;
}

function platformHeightsAt(time: number): readonly number[] {
  return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => platformCount(columnIndex, time));
}

function platformX(columnIndex: number): number {
  return (columnIndex + 0.5) / COLUMN_COUNT;
}

function bounceFromPlatform(agent: MutableAgent, platformY: number, columnIndex: number): void {
  agent.y = platformY - AGENT_RADIUS;
  agent.vy =
    -Math.max(PLATFORM_BOUNCE_MIN_SPEED, Math.abs(agent.vy) * 0.92 + PLATFORM_BOUNCE_BOOST) *
    BOUNCE_SPEED_SCALE -
    BOUNCE_SPEED_OFFSET;
  agent.vx += Math.sin(elapsed * 5 + columnIndex * 1.7) * 0.055;
  agent.angularVelocity += Math.sin(elapsed * 4 + columnIndex) * 0.35;
}

function resolveBambooCollisions(agent: MutableAgent, previousY: number): void {
  let highestPlatform: { columnIndex: number; top: number } | null = null;

  for (let columnIndex = 0; columnIndex < COLUMN_COUNT; columnIndex += 1) {
    const platformTopY = platformTop(columnIndex, elapsed);

    if (platformTopY === null) {
      continue;
    }

    const xDistance = Math.abs(agent.x - platformX(columnIndex));
    const horizontalOverlap = xDistance <= PLATFORM_HALF_WIDTH + AGENT_RADIUS;
    const verticalOverlap = agent.y + AGENT_RADIUS >= platformTopY && agent.y - AGENT_RADIUS <= 1;

    if (!horizontalOverlap || !verticalOverlap) {
      continue;
    }

    if (xDistance <= PLATFORM_HALF_WIDTH) {
      if (highestPlatform === null || platformTopY < highestPlatform.top) {
        highestPlatform = { columnIndex, top: platformTopY };
      }
      continue;
    }

    const edgeDirection = agent.x < platformX(columnIndex) ? -1 : 1;
    agent.x = platformX(columnIndex) + edgeDirection * (PLATFORM_HALF_WIDTH + AGENT_RADIUS);
    agent.vx = edgeDirection * Math.max(0.08, Math.abs(agent.vx) * 0.82);
    agent.angularVelocity += edgeDirection * 0.2;
  }

  if (highestPlatform === null) {
    return;
  }

  const crossedPlatformTop = previousY + AGENT_RADIUS <= highestPlatform.top;
  const isInsidePlatform = agent.y + AGENT_RADIUS > highestPlatform.top;

  if (crossedPlatformTop || isInsidePlatform) {
    bounceFromPlatform(agent, highestPlatform.top, highestPlatform.columnIndex);
  }
}

function updateAgent(agent: MutableAgent, dt: number): void {
  const previousY = agent.y;
  clampAngularVelocity(agent);
  agent.vy += GRAVITY * dt;
  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;
  agent.rotation += agent.angularVelocity * dt;

  if (agent.x < AGENT_RADIUS) {
    agent.x = AGENT_RADIUS;
    agent.vx = Math.abs(agent.vx) * 0.92;
    agent.angularVelocity += 0.5;
  } else if (agent.x > 1 - AGENT_RADIUS) {
    agent.x = 1 - AGENT_RADIUS;
    agent.vx = -Math.abs(agent.vx) * 0.92;
    agent.angularVelocity -= 0.5;
  }

  if (agent.y < AGENT_RADIUS) {
    agent.y = AGENT_RADIUS;
    agent.vy =
      Math.max(CEILING_BOUNCE_MIN_SPEED, Math.abs(agent.vy) * 0.9) * BOUNCE_SPEED_SCALE +
      BOUNCE_SPEED_OFFSET;
  }

  if (agent.y > 1 - AGENT_RADIUS) {
    agent.y = 1 - AGENT_RADIUS;
    agent.vy =
      -(
        Math.max(FLOOR_BOUNCE_MIN_SPEED, Math.abs(agent.vy) * 0.88 + 0.2) * BOUNCE_SPEED_SCALE +
        BOUNCE_SPEED_OFFSET
      );
    agent.vx += Math.sin(elapsed * 4.5 + agent.x * 8) * 0.08;
    agent.angularVelocity += Math.sin(elapsed * 3.5) * 0.5;
  }

  resolveBambooCollisions(agent, previousY);
}

function resolveAgentCollisions(): void {
  for (let firstIndex = 0; firstIndex < agents.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < agents.length; secondIndex += 1) {
      const first = agents[firstIndex]!;
      const second = agents[secondIndex]!;
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const distance = Math.hypot(dx, dy);
      const minimumDistance = AGENT_RADIUS * 2;

      if (distance === 0 || distance >= minimumDistance) {
        continue;
      }

      const nx = dx / distance;
      const ny = dy / distance;
      const relativeVelocity = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
      const impulse = Math.max(0.08, -relativeVelocity * 0.92);
      const overlap = minimumDistance - distance;

      first.x -= nx * overlap * 0.5;
      first.y -= ny * overlap * 0.5;
      second.x += nx * overlap * 0.5;
      second.y += ny * overlap * 0.5;
      first.vx -= nx * impulse;
      first.vy -= ny * impulse;
      second.vx += nx * impulse;
      second.vy += ny * impulse;
      first.angularVelocity -= 0.8;
      second.angularVelocity += 0.8;
    }
  }
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function tick(frameTime: number): void {
  if (lastFrameTime === 0) {
    lastFrameTime = frameTime;
  }

  const dt = Math.min((frameTime - lastFrameTime) / 1000, 0.032);
  lastFrameTime = frameTime;
  elapsed += dt;

  for (const agent of agents) {
    updateAgent(agent, dt);
  }
  resolveAgentCollisions();
  for (const agent of agents) {
    clampAngularVelocity(agent);
  }
  snapshot = {
    agents: agents.map(({ id, x, y, rotation }) => ({ id, x, y, rotation })),
    platformHeights: platformHeightsAt(elapsed),
  };
  notify();
  animationFrame = requestAnimationFrame(tick);
}

function start(): void {
  if (animationFrame === null && !reducedMotion()) {
    lastFrameTime = 0;
    animationFrame = requestAnimationFrame(tick);
  }
}

function stop(): void {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

export function subscribeBambooPhysics(listener: () => void): () => void {
  listeners.add(listener);
  start();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stop();
    }
  };
}

export function getBambooPhysicsSnapshot(): BambooPhysicsSnapshot {
  return snapshot;
}

export const useBambooPhysics = (): BambooPhysicsSnapshot =>
  useSyncExternalStore(subscribeBambooPhysics, getBambooPhysicsSnapshot, getBambooPhysicsSnapshot);
