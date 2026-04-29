import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import {
  eachDayOfInterval,
  formatISO,
  parseISO,
  getDay,
  subWeeks,
  nextDay,
  differenceInCalendarDays,
  type Day,
} from "date-fns";

/** Slower cadence for comfortable play */
const TICK_MS = 260;
const LABEL_MARGIN = 8;

/** Very light yellow snake blocks (classic grid snake, not circles) */
const SNAKE_FILL = "#fffbeb";
const SNAKE_STROKE = "#f5e8c8";

function range(fromArg: number, toArg?: number): number[] {
  const from = toArg === undefined ? 0 : fromArg;
  const to = toArg ?? fromArg;
  if (to <= from) {
    throw new RangeError("Invalid range");
  }
  return Array.from({ length: to - from }, (_, i) => from + i);
}

function fillHoles(activities: Activity[]): Activity[] {
  const calendar = new Map(activities.map((a) => [a.date, a]));
  const firstActivity = activities[0];
  const lastActivity = activities[activities.length - 1];
  return eachDayOfInterval({
    start: parseISO(firstActivity.date),
    end: parseISO(lastActivity.date),
  }).map((day) => {
    const date = formatISO(day, { representation: "date" });
    const existing = calendar.get(date);
    if (existing) return existing;
    return { date, count: 0, level: 0 };
  });
}

/** Mirrors react-activity-calendar grid: columns = weeks, rows = weekday index (Sun–Sat when weekStart=0). */
function groupByWeeks(
  activities: Activity[],
  weekStart: Day = 0
): (Activity | undefined)[][] {
  const normalizedActivities = fillHoles(activities);
  const firstActivity = normalizedActivities[0];
  const firstDate = parseISO(firstActivity.date);
  const firstCalendarDate =
    getDay(firstDate) === weekStart
      ? firstDate
      : subWeeks(nextDay(firstDate, weekStart), 1);

  const padCount = differenceInCalendarDays(firstDate, firstCalendarDate);
  const paddedActivities: (Activity | undefined)[] = [
    ...Array(padCount).fill(undefined),
    ...normalizedActivities,
  ];
  const numberOfWeeks = Math.ceil(paddedActivities.length / 7);
  return range(numberOfWeeks).map((weekIndex) =>
    paddedActivities.slice(weekIndex * 7, weekIndex * 7 + 7)
  );
}

function cellKey(col: number, row: number) {
  return `${col},${row}`;
}

type Dir = { dc: number; dr: number };

function opposite(a: Dir, b: Dir): boolean {
  return a.dc === -b.dc && a.dr === -b.dr;
}

async function fetchCalendarData(username: string, year: string | number) {
  const apiUrl = "https://github-contributions-api.jogruber.de/v4/";
  const response = await fetch(`${apiUrl}${username}?y=${String(year)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load contributions");
  }
  return data as { contributions: Activity[] };
}

export type SnakeCalendarProps = {
  username: string;
  year?: string | number;
  blockSize?: number;
  blockMargin?: number;
  blockRadius?: number;
  fontSize?: number;
  showTotalCount?: boolean;
  showColorLegend?: boolean;
  showMonthLabels?: boolean;
  theme?: {
    light: string[];
    dark?: string[];
  };
  /** Same contract as `GitHubCalendar`: receives raw API contributions, return shaped list. */
  transformData?: (contributions: Activity[]) => Activity[];
};

export function SnakeCalendar({
  username,
  year = "last",
  blockSize = 12,
  blockMargin = 6,
  blockRadius = 0,
  fontSize = 14,
  showTotalCount = false,
  showColorLegend = false,
  showMonthLabels = true,
  theme = {
    light: ["#eeeeee", "#767676", "#676767", "#4d4d4d", "#1a1a1a"],
  },
  transformData: transformFn,
}: SnakeCalendarProps) {
  const weekStart: Day = 0;

  /** Inline `transformData` from parents must not reset derived state every render. */
  const transformRef = useRef(transformFn);
  transformRef.current = transformFn;

  const [rawContributions, setRawContributions] = useState<Activity[] | null>(
    null
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

  const contributions = useMemo(() => {
    if (!rawContributions) return null;
    const fn = transformRef.current;
    return fn ? fn(rawContributions) : rawContributions;
  }, [rawContributions]);

  const weeks = useMemo(() => {
    if (!contributions?.length) return null;
    return groupByWeeks(contributions, weekStart);
  }, [contributions, weekStart]);

  const labelHeight = showMonthLabels ? fontSize + LABEL_MARGIN : 0;

  const dimensions = useMemo(() => {
    if (!weeks?.length) return null;
    const width = weeks.length * (blockSize + blockMargin) - blockMargin;
    const height =
      labelHeight + (blockSize + blockMargin) * 7 - blockMargin;
    return { width, height };
  }, [weeks, blockSize, blockMargin, labelHeight]);

  const gridMeta = useMemo(() => {
    if (!weeks) return null;
    const numCols = weeks.length;
    const numRows = 7;

    const isWalkable = (col: number, row: number) => {
      const cell = weeks[col]?.[row];
      return cell !== undefined;
    };

    const allCommitKeys = new Set<string>();
    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < numRows; r++) {
        const a = weeks[c][r];
        if (a && a.count > 0) {
          allCommitKeys.add(cellKey(c, r));
        }
      }
    }

    function nextInDirection(c: number, r: number, dir: Dir): { col: number; row: number } {
      let nc = c;
      let nr = r;
      for (let step = 0; step < numCols * numRows; step++) {
        if (dir.dc !== 0) {
          nc = (nc + dir.dc + numCols) % numCols;
        }
        if (dir.dr !== 0) {
          nr = (nr + dir.dr + numRows) % numRows;
        }
        if (isWalkable(nc, nr)) {
          return { col: nc, row: nr };
        }
      }
      return { col: c, row: r };
    }

    return {
      weeks,
      numCols,
      numRows,
      isWalkable,
      allCommitKeys,
      nextInDirection,
    };
  }, [weeks]);

  const directionRef = useRef<Dir>({ dc: 1, dr: 0 });
  const pendingDirRef = useRef<Dir | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [snake, setSnake] = useState<{ col: number; row: number }[]>([]);
  const [food, setFood] = useState<Set<string>>(() => new Set());
  /** Contribution cells eaten this round — calendar shows them as empty until respawn */
  const [devouredDates, setDevouredDates] = useState<Set<string>>(
    () => new Set()
  );
  const [score, setScore] = useState(0);

  const calendarData = useMemo(() => {
    if (!contributions?.length) return [];
    return contributions.map((a) => {
      if (devouredDates.has(a.date)) {
        return { ...a, count: 0, level: 0 };
      }
      return a;
    });
  }, [contributions, devouredDates]);

  useEffect(() => {
    let cancelled = false;
    setFetchError(null);
    setRawContributions(null);
    fetchCalendarData(username, year)
      .then((data) => {
        if (!cancelled) setRawContributions(data.contributions);
      })
      .catch((e: Error) => {
        if (!cancelled) setFetchError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [username, year]);

  useEffect(() => {
    if (!gridMeta || !contributions?.length) {
      setSnake([]);
      setFood(new Set());
      setDevouredDates(new Set());
      setScore(0);
      return;
    }

    const { numCols, numRows, allCommitKeys, weeks: w } = gridMeta;

    let startCol = 0;
    let startRow = 0;
    let found = false;
    for (let c = 0; c < numCols && !found; c++) {
      for (let r = 0; r < numRows; r++) {
        const a = w[c][r];
        if (a !== undefined && a.count === 0) {
          startCol = c;
          startRow = r;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (let c = 0; c < numCols && !found; c++) {
        for (let r = 0; r < numRows; r++) {
          if (w[c][r] !== undefined) {
            startCol = c;
            startRow = r;
            found = true;
            break;
          }
        }
      }
    }

    const startKey = cellKey(startCol, startRow);
    const snakeKeys = new Set([startKey]);

    const initialFood = new Set<string>();
    for (const key of allCommitKeys) {
      if (!snakeKeys.has(key)) initialFood.add(key);
    }

    setSnake([{ col: startCol, row: startRow }]);
    setFood(initialFood);
    setDevouredDates(new Set());
    setScore(0);
    directionRef.current = { dc: 1, dr: 0 };
    pendingDirRef.current = null;
  }, [gridMeta, contributions]);

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    if (!gridMeta) return;

    const tick = () => {
      const meta = gridMeta;
      if (pendingDirRef.current) {
        const next = pendingDirRef.current;
        if (!opposite(next, directionRef.current)) {
          directionRef.current = next;
        }
        pendingDirRef.current = null;
      }

      const dir = directionRef.current;
      const body = snakeRef.current;
      const foodSet = foodRef.current;
      if (body.length === 0) return;

      const head = body[0];
      const nextPos = meta.nextInDirection(head.col, head.row, dir);
      const nextKey = cellKey(nextPos.col, nextPos.row);

      const hitsBody = body
        .slice(0, -1)
        .some((seg) => cellKey(seg.col, seg.row) === nextKey);
      if (hitsBody) return;

      const eating = foodSet.has(nextKey);

      let newSnake: { col: number; row: number }[];
      if (eating) {
        newSnake = [nextPos, ...body];
      } else {
        newSnake = [nextPos, ...body.slice(0, -1)];
      }

      let newFood = new Set(foodSet);
      let clearedRound = false;
      if (eating) {
        newFood.delete(nextKey);
        if (newFood.size === 0 && meta.allCommitKeys.size > 0) {
          const occupied = new Set(
            newSnake.map((s) => cellKey(s.col, s.row))
          );
          const replenish = new Set<string>();
          for (const key of meta.allCommitKeys) {
            if (!occupied.has(key)) replenish.add(key);
          }
          if (replenish.size === 0) {
            for (const key of meta.allCommitKeys) replenish.add(key);
          }
          newFood = replenish;
          clearedRound = true;
        }
      }

      const eatenCell = meta.weeks[nextPos.col][nextPos.row];
      const eatenDate =
        eating && eatenCell ? eatenCell.date : null;

      snakeRef.current = newSnake;
      foodRef.current = newFood;
      setSnake(newSnake);
      setFood(newFood);
      if (eating) {
        setScore((s) => s + 1);
        if (clearedRound) {
          setDevouredDates(new Set());
        } else if (eatenDate) {
          setDevouredDates((prev) => new Set(prev).add(eatenDate));
        }
      }
    };

    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [gridMeta]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let dir: Dir | null = null;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dir = { dc: 0, dr: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dir = { dc: 0, dr: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dir = { dc: -1, dr: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dir = { dc: 1, dr: 0 };
          break;
        default:
          return;
      }
      e.preventDefault();
      pendingDirRef.current = dir;
    },
    []
  );

  const labels = useMemo(
    () => ({
      totalCount:
        year === "last"
          ? "{{count}} contributions in the last year"
          : "{{count}} contributions in {{year}}",
    }),
    [year]
  );

  if (fetchError) {
    return (
      <div className="text-[11px] text-red-600 max-w-[280px]">
        {fetchError}
      </div>
    );
  }

  const waitingForFetch = rawContributions === null;

  if (waitingForFetch) {
    return (
      <ActivityCalendar
        data={[]}
        loading
        colorScheme="light"
        blockSize={blockSize}
        blockMargin={blockMargin}
        blockRadius={blockRadius}
        fontSize={fontSize}
        showTotalCount={showTotalCount}
        showColorLegend={showColorLegend}
        showMonthLabels={showMonthLabels}
        theme={theme}
        labels={labels}
        maxLevel={4}
      />
    );
  }

  if (
    !contributions?.length ||
    !weeks ||
    !dimensions ||
    !gridMeta
  ) {
    return (
      <div className="text-[11px] text-[#888888] max-w-[280px]">
        No contribution days in this range to play on.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
      tabIndex={0}
      role="application"
      aria-label="Snake game on contribution calendar. Use arrow keys or WASD."
      onKeyDown={onKeyDown}
      onPointerDown={() => containerRef.current?.focus()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="pointer-events-none absolute left-0 top-0 z-10 flex max-w-[min(100%,240px)] gap-2 px-1 py-0.5 text-[9px] font-medium tracking-wide text-[#666666]">
        <span>Score {score}</span>
        <span className="opacity-70">Focus & use WASD / arrows</span>
      </div>

      <ActivityCalendar
        data={calendarData}
        loading={false}
        colorScheme="light"
        blockSize={blockSize}
        blockMargin={blockMargin}
        blockRadius={blockRadius}
        fontSize={fontSize}
        showTotalCount={showTotalCount}
        showColorLegend={showColorLegend}
        showMonthLabels={showMonthLabels}
        theme={theme}
        labels={labels}
        maxLevel={4}
        weekStart={weekStart}
      />

      <svg
        className="pointer-events-none absolute left-0 top-0 z-5 overflow-visible"
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        aria-hidden
      >
        {snake.map((seg, i) => {
          const x = seg.col * (blockSize + blockMargin);
          const y =
            labelHeight + seg.row * (blockSize + blockMargin);
          const isHead = i === 0;
          return (
            <rect
              key={`${seg.col}-${seg.row}-${i}`}
              x={x}
              y={y}
              width={blockSize}
              height={blockSize}
              rx={blockRadius}
              ry={blockRadius}
              fill={SNAKE_FILL}
              stroke={SNAKE_STROKE}
              strokeWidth={isHead ? 1.1 : 0.85}
              opacity={0.98}
            />
          );
        })}
      </svg>
    </div>
  );
}
