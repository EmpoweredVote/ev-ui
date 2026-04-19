import React, { useState } from 'react';
import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';
import { BallotIcon, CompassIcon, BranchIcon } from './icons.js';
import { colors, semanticTokens, spacing } from './tokens';

/**
 * A single icon wrapped in an accessible tooltip using @floating-ui/react.
 *
 * @param {{ IconComponent: React.ComponentType, color: string, tooltip: string, size: number, onClick: Function }} props
 */
function IconWithTooltip({ IconComponent, color, tooltip, size = 14, extraProps = {}, onClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 4 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context);
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <span
        ref={refs.setReference}
        aria-label={tooltip}
        tabIndex={0}
        style={{ display: 'inline-flex', padding: spacing[1], ...(onClick ? { cursor: 'pointer' } : {}) }}
        {...getReferenceProps()}
        onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined}
      >
        <IconComponent size={size} color={color} {...extraProps} />
      </span>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex: 70,
              background: semanticTokens.light.tooltip.background,
              color: semanticTokens.light.tooltip.text,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: "'Manrope', sans-serif",
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
            {...getFloatingProps()}
          >
            {tooltip}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

/**
 * IconOverlay — renders a row of icon badges with accessible tooltips below
 * politician card text content (static flow, left-aligned, no background).
 *
 * @param {{
 *   ballot: { onBallot: boolean, termEndDate: Date, electionDate: Date, electionLabel: string } | null,
 *   hasStances: boolean,
 *   branch: 'Executive' | 'Legislative' | 'Judicial' | null,
 *   onCompassClick: (e: React.MouseEvent) => void,
 * }} props
 */
export default function IconOverlay({ ballot, hasStances, branch, onCompassClick }) {
  if (!ballot && !hasStances && !branch) return null;

  const ballotTooltip = ballot
    ? `This seat is on your ballot \u2014 ${ballot.electionLabel}: ${ballot.electionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : null;

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 0,
      }}
    >
      {ballot && (
        <IconWithTooltip
          IconComponent={BallotIcon}
          color={colors.evMutedBlue}
          tooltip={ballotTooltip}
          size={14}
        />
      )}
      {hasStances && (
        <IconWithTooltip
          IconComponent={CompassIcon}
          color={colors.evMutedBlue}
          tooltip="Compare your views"
          size={14}
          onClick={onCompassClick}
        />
      )}
      {branch && (
        <IconWithTooltip
          IconComponent={BranchIcon}
          color={colors.evMutedBlue}
          tooltip={`${branch} branch`}
          size={14}
          extraProps={{ branch: branch.toLowerCase() }}
        />
      )}
    </div>
  );
}
