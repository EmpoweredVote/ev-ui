import React from "react";
import { animated, useSpring } from "@react-spring/web";
import { useRef, useEffect } from "react";

export default function RadarChartCore({
  topics,
  data,
  compareData = {},
  invertedSpokes = {},
  onToggleInversion = () => {},
  onReplaceTopic = () => {},
  size = 400,
}) {
  const padding = 80;
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
    const pct = (value / max) * 10;
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
    comparePoints = Object.entries(compareData)
      .map(([shortTitle, value], index) => {
        const topic = topics.find((t) => t.short_title === shortTitle);
        const max = topic?.stances?.length || 10;
        const pct = (value / max) * 10;
        const angle = (2 * Math.PI * index) / numSpokes;
        const adjusted =
          value === 0 ? 0 : invertedSpokes[shortTitle] ? 11 - pct : pct;
        const r = (adjusted / 10) * radius;
        const x = centerX + r * Math.sin(angle);
        const y = centerY - r * Math.cos(angle);
        return [x, y];
      })
      .map((p) => p.join(","))
      .join(" ");
  }

  const compareSpring = useSpring({
    to: { points: comparePoints },
    immediate: countChanged,
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
      <polygon key={level} points={ring.join(" ")} fill="none" stroke="#ccc" />
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
        return (
          <line
            key={`line-${shortTitle}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="black"
          />
        );
      })}

      {spokes.map(([shortTitle], i) => {
        const angle = (2 * Math.PI * i) / numSpokes;
        const offset = radius + 20;
        const x = centerX + offset * Math.sin(angle);
        const y = centerY - offset * Math.cos(angle);
        const anchor =
          angle > Math.PI
            ? "end"
            : angle < Math.PI && angle > 0
            ? "start"
            : "middle";
        return (
          <text
            key={`label-${shortTitle}`}
            x={x}
            y={y === 20 ? y - 20 : y}
            textAnchor={anchor}
            onClick={() => onReplaceTopic(shortTitle)}
            className="text-xl font-medium mb-1 md:text-base md:font-normal"
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {wrapLabel(shortTitle, 10).map((ln, idx) => (
              <tspan key={idx} x={x} dy={idx === 0 ? "0" : "1.1em"}>
                {ln}
              </tspan>
            ))}
          </text>
        );
      })}

      {countChanged ? (
        <polygon
          points={targetPoints}
          style={{
            fill: "rgba(245, 40, 145, 0.4)",
            stroke: "rgb(245, 40, 145)",
            strokeWidth: 3,
          }}
        />
      ) : (
        <animated.polygon
          points={spring.points}
          style={{
            fill: "rgba(245, 40, 145, 0.4)",
            stroke: "rgb(245, 40, 145)",
            strokeWidth: 3,
          }}
        />
      )}

      {comparePoints ? (
        countChanged ? (
          <polygon
            points={comparePoints}
            style={{
              fill: "rgba(0,123,255,0.3)",
              stroke: "rgb(0,123,255)",
              strokeWidth: 2,
            }}
          />
        ) : (
          <animated.polygon
            points={compareSpring.points}
            style={{
              fill: "rgba(0,123,255,0.3)",
              stroke: "rgb(0,123,255)",
              strokeWidth: 3,
            }}
          />
        )
      ) : null}

      {spokes.map(([shortTitle]) => {
        const angle = 0; // not used, kept simple
        const x = centerX + radius * Math.sin(angle);
        const y = centerY - radius * Math.cos(angle);
        return (
          <line
            key={`hitbox-${shortTitle}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="transparent"
            strokeWidth={12}
            onClick={() => onToggleInversion(shortTitle)}
            style={{ cursor: "pointer" }}
          />
        );
      })}
    </svg>
  );
}

function wrapLabel(label, maxChars = 10) {
  const words = String(label).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (word.length > maxChars) {
      if (line) {
        lines.push(line.trim());
        line = "";
      }
      for (let i = 0; i < word.length; i += maxChars)
        lines.push(word.slice(i, i + maxChars));
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
