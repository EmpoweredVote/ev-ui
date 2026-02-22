import React from "react";
import { animated, useSpring } from "@react-spring/web";
import { useRef, useEffect } from "react";

export default function RadarChartCore({
  topics,
  data,
  compareData = {},
  invertedSpokes = {},
  unansweredSpokes = {},
  onToggleInversion = () => {},
  onReplaceTopic = () => {},
  size = 400,
  labelFontSize,
  padding = 80,
  labelOffset = 20,
}) {
  const radius = size / 2 - 40;
  const centerX = size / 2;
  const centerY = size / 2;

  const spokes = Object.entries(data);
  const numSpokes = Math.max(spokes.length, 1);

  const prevCountRef = useRef(numSpokes);
  const countChanged = numSpokes !== prevCountRef.current;
  useEffect(() => {
    prevCountRef.current = numSpokes;
  }, [numSpokes]);

  const pointsArr = spokes.map(([shortTitle, value], index) => {
    const topic = topics.find((t) => t.short_title === shortTitle);
    const max = topic?.stances?.length || 10;
    const pct = Math.min((value / max) * 10, 10);
    const angle = (2 * Math.PI * index) / numSpokes;
    const adjusted =
      value === 0 ? 0 : invertedSpokes[shortTitle] ? 11 - pct : pct;
    const r = (adjusted / 10) * radius;
    const x = centerX + r * Math.sin(angle);
    const y = centerY - r * Math.cos(angle);
    return [x, y];
  });

  const targetPoints = pointsArr.map((p) => p.join(",")).join(" ");
  const spring = useSpring({
    to: { points: targetPoints },
    immediate: countChanged,
    reset: countChanged,
    config: { tension: 300, friction: 30 },
  });

  let comparePoints = null;
  if (Object.keys(compareData).length) {
    const cpts = spokes.map(([shortTitle], index) => {
      const value = compareData[shortTitle] ?? 0;
      const topic = topics.find((t) => t.short_title === shortTitle);
      const max = topic?.stances?.length || 10;
      const pct = Math.min((value / max) * 10, 10);
      const angle = (2 * Math.PI * index) / numSpokes;
      const adjusted =
        value === 0 ? 0 : invertedSpokes[shortTitle] ? 11 - pct : pct;
      const r = (adjusted / 10) * radius;
      const x = centerX + r * Math.sin(angle);
      const y = centerY - r * Math.cos(angle);
      return `${x},${y}`;
    });
    comparePoints = cpts.join(" ");
  }

  const compareSpring = useSpring({
    to: { points: comparePoints || "" },
    immediate: countChanged || !comparePoints,
    reset: countChanged,
    config: { tension: 300, friction: 30 },
  });

  // Pre-compute label metadata for dynamic horizontal padding
  const labelMeta = spokes.map(([shortTitle], i) => {
    const angle = (2 * Math.PI * i) / numSpokes;
    const baseFSize = labelFontSize || 16;
    const lines = wrapLabel(shortTitle, 12);
    const longestLineLen = lines.reduce(
      (max, ln) => (ln.length > max ? ln.length : max),
      0,
    );
    let fSize;
    if (longestLineLen <= 8) {
      fSize = baseFSize;
    } else if (longestLineLen <= 12) {
      fSize = Math.max(baseFSize - 2, 10);
    } else if (longestLineLen <= 16) {
      fSize = Math.max(12, 10);
    } else {
      fSize = 10;
    }
    const estimatedWidth = longestLineLen * fSize * 0.6;
    const sinA = Math.sin(angle);
    // Left side: angle > Math.PI (sin < 0); right side: angle > 0 && angle < Math.PI (sin > 0)
    const side = sinA < -0.1 ? "left" : sinA > 0.1 ? "right" : "center";
    return { estimatedWidth, side };
  });

  const leftLabelWidths = labelMeta
    .filter((m) => m.side === "left")
    .map((m) => m.estimatedWidth);
  const rightLabelWidths = labelMeta
    .filter((m) => m.side === "right")
    .map((m) => m.estimatedWidth);

  const minPadding = 40;
  const leftPadding = Math.max(
    leftLabelWidths.length ? Math.max(...leftLabelWidths) + labelOffset : 0,
    minPadding,
  );
  const rightPadding = Math.max(
    rightLabelWidths.length ? Math.max(...rightLabelWidths) + labelOffset : 0,
    minPadding,
  );
  const verticalPadding = padding;

  const guidePolygons = [];
  for (let level = 1; level <= 5; level++) {
    const scale = level / 5;
    const ring = [];
    for (let i = 0; i < numSpokes; i++) {
      const angle = (2 * Math.PI * i) / numSpokes;
      const x = centerX + radius * scale * Math.sin(angle);
      const y = centerY - radius * scale * Math.cos(angle);
      ring.push(`${x},${y}`);
    }
    guidePolygons.push(
      <polygon key={level} points={ring.join(" ")} fill="none" stroke="#ccc" />,
    );
  }

  return (
    <svg
      className="w-full h-auto"
      viewBox={`-${leftPadding} -${verticalPadding} ${size + leftPadding + rightPadding} ${size + verticalPadding * 2}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {guidePolygons}

      {spokes.map(([shortTitle], i) => {
        const angle = (2 * Math.PI * i) / numSpokes;
        const x = centerX + radius * Math.sin(angle);
        const y = centerY - radius * Math.cos(angle);
        const isUnanswered = !!unansweredSpokes[shortTitle];
        return (
          <line
            key={`line-${shortTitle}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke={isUnanswered ? "#9ca3af" : "black"}
            strokeDasharray={isUnanswered ? "4 3" : undefined}
            opacity={isUnanswered ? 0.6 : 1}
          />
        );
      })}

      {spokes.map(([shortTitle], i) => {
        const angle = (2 * Math.PI * i) / numSpokes;
        const anchor =
          angle > Math.PI
            ? "end"
            : angle < Math.PI && angle > 0
              ? "start"
              : "middle";

        const cosA = Math.cos(angle);
        const isTop = cosA > 0.5;
        const isBottom = cosA < -0.5;
        const baseFSize = labelFontSize || 16;
        // Single pass wrap at ~12 chars, then pick font size based on longest line
        const lines = wrapLabel(shortTitle, 12);
        const longestLine = lines.reduce(
          (max, ln) => (ln.length > max ? ln.length : max),
          0,
        );
        let fSize;
        if (longestLine <= 8) {
          fSize = baseFSize;
        } else if (longestLine <= 12) {
          fSize = Math.max(baseFSize - 2, 10);
        } else if (longestLine <= 16) {
          fSize = Math.max(12, 10);
        } else {
          fSize = 10;
        }
        const lineHeight = fSize * 1.1;
        const dynamicLabelOffset = lines.length > 1 ? labelOffset + 8 : labelOffset;
        const offset = radius + dynamicLabelOffset;
        const labelX = centerX + offset * Math.sin(angle);
        let labelY = centerY - offset * Math.cos(angle);

        // For top labels, shift up so multi-line text grows away from chart
        if (isTop && lines.length > 1) {
          labelY -= (lines.length - 1) * lineHeight;
        }
        // For bottom labels with multiple lines, no shift needed (text grows downward, away from chart)

        const isUnansweredLabel = !!unansweredSpokes[shortTitle];
        return (
          <text
            key={`label-${shortTitle}`}
            x={labelX}
            y={labelY}
            textAnchor={anchor}
            dominantBaseline={isBottom ? "hanging" : "auto"}
            onClick={() => onReplaceTopic(shortTitle)}
            className="text-xl font-medium mb-1 md:text-base md:font-normal"
            fill={isUnansweredLabel ? "#9ca3af" : undefined}
            style={{ cursor: "pointer", userSelect: "none", fontSize: fSize }}
          >
            {lines.map((ln, idx) => (
              <tspan key={idx} x={labelX} dy={idx === 0 ? "0" : `${lineHeight}`}>
                {ln}
              </tspan>
            ))}
          </text>
        );
      })}

      {countChanged ? (
        <polygon
          key="user-static"
          points={targetPoints}
          style={{
            fill: "rgba(255, 87, 64, 0.4)",
            stroke: "rgb(255, 87, 64)",
            strokeWidth: 3,
          }}
        />
      ) : (
        <animated.polygon
          key="user-animated"
          points={spring.points}
          style={{
            fill: "rgba(255, 87, 64, 0.4)",
            stroke: "rgb(255, 87, 64)",
            strokeWidth: 3,
          }}
        />
      )}

      {comparePoints ? (
        countChanged ? (
          <polygon
            key="compare-static"
            points={comparePoints}
            style={{
              fill: "rgba(89, 176, 196, 0.3)",
              stroke: "rgb(89, 176, 196)",
              strokeWidth: 2,
            }}
          />
        ) : (
          <animated.polygon
            key="compare-animated"
            points={compareSpring.points}
            style={{
              fill: "rgba(89, 176, 196, 0.3)",
              stroke: "rgb(89, 176, 196)",
              strokeWidth: 2,
            }}
          />
        )
      ) : null}

      {spokes.map(([shortTitle], i) => {
        const angle = (2 * Math.PI * i) / numSpokes;
        const x = centerX + radius * Math.sin(angle);
        const y = centerY - radius * Math.cos(angle);
        const isUnansweredHitbox = !!unansweredSpokes[shortTitle];
        return (
          <line
            key={`hitbox-${shortTitle}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="transparent"
            strokeWidth={14}
            onClick={() =>
              isUnansweredHitbox
                ? onReplaceTopic(shortTitle)
                : onToggleInversion(shortTitle)
            }
            style={{ cursor: "pointer" }}
          />
        );
      })}
    </svg>
  );
}

function wrapLabel(label, maxChars = 12) {
  const str = String(label);
  // Split on "/" first (handles "Medicare/Medicaid" → ["Medicare/", "Medicaid"])
  let rawWords;
  if (str.includes("/")) {
    rawWords = str.split("/").reduce((acc, segment, idx, arr) => {
      const part = idx < arr.length - 1 ? segment + "/" : segment;
      if (part.trim()) acc.push(part.trim());
      return acc;
    }, []);
  } else {
    rawWords = str.split(/\s+/);
  }
  // Build lines wrapping at maxChars; enforce hard max of 2 lines without truncation
  const lines = [];
  let line = "";
  for (const word of rawWords) {
    if (line === "") {
      line = word;
    } else if ((line + " " + word).length <= maxChars) {
      line += " " + word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  // Enforce max 2 lines: combine any overflow onto line 2
  if (lines.length > 2) {
    const overflow = lines.splice(2).join(" ");
    lines[1] = lines[1] + " " + overflow;
  }
  return lines;
}
