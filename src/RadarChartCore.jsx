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
      viewBox={`-${padding} -${padding} ${size + padding * 2} ${
        size + padding * 2
      }`}
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
        let lines = wrapLabel(shortTitle, 10);
        let fSize = baseFSize;
        if (lines.length > 2) {
          // Try wider wrap at smaller font — more chars fit per line
          lines = wrapLabel(shortTitle, 14);
          fSize = 13;
          if (lines.length > 2) {
            lines = wrapLabel(shortTitle, 18);
            fSize = 11;
            if (lines.length > 2) {
              lines = lines.slice(0, 2);
            }
          }
        }
        // Single long word: wrapLabel produces 1 line, but the word may overflow the label area.
        // Reduce font size based on character count to keep it contained.
        if (lines.length === 1 && lines[0].length > 10) {
          fSize = lines[0].length > 14 ? 11 : 13;
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
  const words = String(label).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    // Never split individual words - keep them intact on their own line
    if (word.length > maxChars) {
      if (line) {
        lines.push(line.trim());
        line = "";
      }
      lines.push(word);
      continue;
    }
    if ((line + word).length > maxChars) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line += word + " ";
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}
