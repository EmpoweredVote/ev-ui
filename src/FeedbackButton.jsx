import React from 'react';

/**
 * FeedbackButton — links to the ev-landing feedback form.
 *
 * @param {Object} props
 * @param {string} [props.feature] - pre-fills the ?feature= query param (e.g. "compass", "essentials")
 * @param {string} [props.className] - additional CSS class names
 * @param {string} [props.label] - link text (default: "Feedback")
 */
const FEEDBACK_BASE = 'https://ev-landing.empowered.vote/feedback.html';

export default function FeedbackButton({ feature, className = '', label = 'Feedback' }) {
  const href = feature
    ? `${FEEDBACK_BASE}?feature=${encodeURIComponent(feature)}`
    : FEEDBACK_BASE;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
