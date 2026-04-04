import React from 'react';

/**
 * BallotIcon — represents a ballot / voting form (Lucide "vote" pattern)
 * @param {{ size?: number, color?: string }} props
 */
export function BallotIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m9 12 2 2 4-4" />
      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
      <path d="M22 19H2" />
    </svg>
  );
}

/**
 * CompassIcon — represents a compass / political compass (Lucide "compass" pattern)
 * @param {{ size?: number, color?: string }} props
 */
export function CompassIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
    </svg>
  );
}

/**
 * BranchIcon — represents a government branch with branch-specific SVG
 * @param {{ size?: number, color?: string, branch?: 'executive'|'legislative'|'judicial' }} props
 */
export function BranchIcon({ size = 16, color = 'currentColor', branch }) {
  let paths;
  switch (branch) {
    case 'executive':
      paths = (
        <>
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
          <path d="M9 9v.01" />
          <path d="M9 12v.01" />
          <path d="M9 15v.01" />
          <path d="M9 18v.01" />
          <path d="M5 21h14" />
          <line x1="13" y1="5" x2="13" y2="3" />
          <line x1="13" y1="3" x2="15" y2="4" />
        </>
      );
      break;
    case 'legislative':
      paths = (
        <>
          <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
          <path d="M19 17V5a2 2 0 0 0-2-2H4" />
          <path d="M15 8h-5" />
          <path d="M15 12h-5" />
        </>
      );
      break;
    case 'judicial':
      paths = (
        <>
          <path d="M12 3v19" />
          <path d="M5 8l7-5 7 5" />
          <path d="M3 13l2-5 2 5a3 3 0 0 1-4 0z" />
          <path d="M17 13l2-5 2 5a3 3 0 0 1-4 0z" />
          <path d="M8 21h8" />
        </>
      );
      break;
    default:
      // Landmark fallback — preserves backward compatibility
      paths = (
        <>
          <path d="M10 18v-7" />
          <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
          <path d="M14 18v-7" />
          <path d="M18 18v-7" />
          <path d="M3 22h18" />
          <path d="M6 18v-7" />
        </>
      );
      break;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths}
    </svg>
  );
}
