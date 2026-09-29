import React from 'react';

/**
 * The placeholder drawn for a person whose portrait EXISTS but whose publisher has reserved
 * its use.
 *
 * WHY THIS IS NOT THE INITIALS AVATAR
 *
 * Initials mean "we have not found a portrait yet". That is a claim about unfinished work on
 * our side, and it is the wrong claim here: the portrait was found, and it may not be shown.
 * Drawing the two the same way tells a reader that a seat has no face because we were lazy,
 * when someone else decided it. They are different facts, so they get different pictures.
 *
 * The figure is deliberately plain and a little daft. It should read as a stand-in that
 * somebody chose, not as a broken image or a spinner. A padlock or a warning triangle reads as
 * an error in the page; a person-shape does not.
 *
 * Inherits `currentColor`, so it sits on whatever the host places behind it (today the same
 * teal panel the initials avatar uses) without a second colour token to keep in step.
 *
 * Geometry is authored against the 95x127 result-card image column and scales from there.
 */
export default function RestrictedPortraitFigure({ style }) {
  return (
    <svg
      viewBox="0 0 95 127"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', ...style }}
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <circle cx="47.5" cy="38" r="13" />
        <path d="M47.5 51 V 84" />
        <path d="M47.5 61 L 37 73 L 27 63" />
        <path d="M47.5 61 L 58 73 L 68 63" />
        <path d="M47.5 84 L 35 109 M47.5 84 L 60 109" />
      </g>
      <g fill="currentColor">
        <circle cx="42" cy="35" r="2.6" />
        <circle cx="53" cy="35" r="2.6" />
      </g>
      <path d="M42 45 H 53" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
