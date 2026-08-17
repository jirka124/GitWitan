import type { GraphSegment, HistoryCommit, RenderedHistoryCommit } from './history.types';

const laneColors = ['#4fb7a6', '#d8b45f', '#7aa2f7', '#c678dd', '#e06c75', '#56b6c2'] as const;
const laneStart = 18;
const laneGap = 26;
export const minGraphWidth = 124;

export const laneX = (lane: number) => laneStart + lane * laneGap;
export const graphColor = (lane: number) => laneColors[lane % laneColors.length] ?? '#4fb7a6';

const verticalSegment = (lane: number, key: string, fromY = 0, toY = 36): GraphSegment => ({
  key,
  d: `M ${laneX(lane)} ${fromY} L ${laneX(lane)} ${toY}`,
  color: graphColor(lane),
});

const curveSegment = (
  fromLane: number,
  toLane: number,
  key: string,
  fromY = 0,
  toY = 36,
): GraphSegment => ({
  key,
  d: `M ${laneX(fromLane)} ${fromY} C ${laneX(fromLane)} ${fromY + 10}, ${laneX(toLane)} ${toY - 10}, ${laneX(toLane)} ${toY}`,
  color: graphColor(fromLane),
});

const buildNextLanes = (topLanes: string[], commitId: string, parents: string[]) => {
  const nextLanes: string[] = [];

  topLanes.forEach((hash) => {
    const hashesToAppend = hash === commitId ? parents : [hash];

    hashesToAppend.forEach((nextHash) => {
      if (!nextLanes.includes(nextHash)) {
        nextLanes.push(nextHash);
      }
    });
  });

  return nextLanes;
};

export const renderCommitGraph = (history: HistoryCommit[]) => {
  let activeLanes: string[] = [];
  let maxLane = 0;

  const rendered = history.map<RenderedHistoryCommit>((commit) => {
    const wasActive = activeLanes.includes(commit.id);
    const topLanes = [...activeLanes];

    if (!wasActive) {
      topLanes.push(commit.id);
    }

    const commitLane = topLanes.indexOf(commit.id);
    const bottomLanes = buildNextLanes(topLanes, commit.id, commit.parents);
    const segments: GraphSegment[] = [];

    topLanes.forEach((hash, topLane) => {
      if (hash === commit.id) {
        return;
      }

      const bottomLane = bottomLanes.indexOf(hash);

      if (bottomLane === -1) {
        return;
      }

      segments.push(
        topLane === bottomLane
          ? verticalSegment(topLane, `${commit.id}-${hash}-through`)
          : curveSegment(topLane, bottomLane, `${commit.id}-${hash}-shift`),
      );
    });

    if (wasActive) {
      segments.push(verticalSegment(commitLane, `${commit.id}-incoming`, 0, 18));
    }

    commit.parents.forEach((parent, parentIndex) => {
      const parentLane = bottomLanes.indexOf(parent);

      if (parentLane === -1) {
        return;
      }

      segments.push(
        parentLane === commitLane
          ? verticalSegment(commitLane, `${commit.id}-${parent}-parent-${parentIndex}`, 18, 36)
          : curveSegment(
              commitLane,
              parentLane,
              `${commit.id}-${parent}-parent-${parentIndex}`,
              18,
              36,
            ),
      );
    });

    maxLane = Math.max(maxLane, topLanes.length - 1, bottomLanes.length - 1, commitLane);
    activeLanes = bottomLanes;

    return {
      ...commit,
      graph: {
        lane: commitLane,
        color: graphColor(commitLane),
        segments,
      },
    };
  });

  return { rendered, maxLane };
};

export const graphWidthForMaxLane = (maxLane: number) =>
  Math.max(minGraphWidth, laneX(maxLane) + laneStart);
