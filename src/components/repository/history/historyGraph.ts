import type { GraphSegment, HistoryCommit, RenderedHistoryCommit } from './history.types';

const laneColors = ['#4fb7a6', '#d8b45f', '#7aa2f7', '#c678dd', '#e06c75', '#56b6c2'] as const;
const laneStart = 18;
const laneGap = 19;
export const minGraphWidth = 124;

export const laneX = (lane: number) => laneStart + lane * laneGap;
export const graphColor = (lane: number) => laneColors[lane % laneColors.length] ?? '#4fb7a6';

const verticalSegment = (
  lane: number,
  key: string,
  fromY = 0,
  toY = 36,
  color: string = graphColor(lane),
): GraphSegment => ({
  key,
  d: `M ${laneX(lane)} ${fromY} L ${laneX(lane)} ${toY}`,
  color,
});

const curveSegment = (
  fromLane: number,
  toLane: number,
  key: string,
  fromY = 0,
  toY = 36,
  color: string = graphColor(fromLane),
): GraphSegment => ({
  key,
  d: `M ${laneX(fromLane)} ${fromY} C ${laneX(fromLane)} ${fromY + 10}, ${laneX(toLane)} ${toY - 10}, ${laneX(toLane)} ${toY}`,
  color,
});

type ActiveLane = {
  key: string;
  targetId: string;
  color: string;
};

const buildNextLanes = (
  topLanes: ActiveLane[],
  commitId: string,
  parents: string[],
  createLane: (targetId: string, color?: string) => ActiveLane,
) => {
  const nextLanes: ActiveLane[] = [];
  const parentLanes: ActiveLane[] = [];
  let commitExpanded = false;

  topLanes.forEach((lane) => {
    if (lane.targetId !== commitId) {
      nextLanes.push(lane);
      return;
    }

    if (commitExpanded) return;
    commitExpanded = true;

    parents.forEach((parent, parentIndex) => {
      const parentLane = createLane(parent, parentIndex === 0 ? lane.color : undefined);
      nextLanes.push(parentLane);
      parentLanes.push(parentLane);
    });
  });

  return { nextLanes, parentLanes };
};

export const renderCommitGraph = (history: HistoryCommit[]) => {
  let activeLanes: ActiveLane[] = [];
  let maxLane = 0;
  let laneSequence = 0;
  let colorSequence = 0;
  const createLane = (
    targetId: string,
    color: string = graphColor(colorSequence++),
  ): ActiveLane => ({
    key: `${targetId}-${laneSequence++}`,
    targetId,
    color,
  });

  const rendered = history.map<RenderedHistoryCommit>((commit) => {
    const wasActive = activeLanes.some((lane) => lane.targetId === commit.id);
    const topLanes = [...activeLanes];

    if (!wasActive) {
      topLanes.push(createLane(commit.id));
    }

    const commitLane = topLanes.findIndex((lane) => lane.targetId === commit.id);
    const commitColor = topLanes[commitLane]?.color ?? graphColor(0);
    const { nextLanes: bottomLanes, parentLanes } = buildNextLanes(
      topLanes,
      commit.id,
      commit.parents,
      createLane,
    );
    const segments: GraphSegment[] = [];

    topLanes.forEach((lane, topLane) => {
      if (lane.targetId === commit.id) {
        if (wasActive) {
          segments.push(
            topLane === commitLane
              ? verticalSegment(topLane, `${commit.id}-${lane.key}-incoming`, 0, 18, lane.color)
              : curveSegment(
                  topLane,
                  commitLane,
                  `${commit.id}-${lane.key}-incoming`,
                  0,
                  18,
                  lane.color,
                ),
          );
        }
        return;
      }

      const bottomLane = bottomLanes.indexOf(lane);

      if (bottomLane === -1) {
        return;
      }

      segments.push(
        topLane === bottomLane
          ? verticalSegment(topLane, `${commit.id}-${lane.key}-through`, 0, 36, lane.color)
          : curveSegment(topLane, bottomLane, `${commit.id}-${lane.key}-shift`, 0, 36, lane.color),
      );
    });

    parentLanes.forEach((parentLane, parentIndex) => {
      const targetLane = bottomLanes.indexOf(parentLane);

      segments.push(
        targetLane === commitLane
          ? verticalSegment(
              commitLane,
              `${commit.id}-${parentLane.key}-parent-${parentIndex}`,
              18,
              36,
              parentLane.color,
            )
          : curveSegment(
              commitLane,
              targetLane,
              `${commit.id}-${parentLane.key}-parent-${parentIndex}`,
              18,
              36,
              parentLane.color,
            ),
      );
    });

    maxLane = Math.max(maxLane, topLanes.length - 1, bottomLanes.length - 1, commitLane);
    activeLanes = bottomLanes;

    return {
      ...commit,
      graph: {
        lane: commitLane,
        color: commitColor,
        segments,
      },
    };
  });

  return { rendered, maxLane };
};

export const graphWidthForMaxLane = (maxLane: number) =>
  Math.max(minGraphWidth, laneX(maxLane) + laneStart);
