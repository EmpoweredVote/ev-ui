/**
 * Stage 5 (ev-accounts spec 2026-10-22 §8): what a voter sees on a topic the person was researched on and
 * holds no seat. Two new rows — "no public stance found" and "own words, not a position on the scale" —
 * read from GET /api/compass/politicians/:id/research-states. A seated topic ignores them, and a failed
 * fetch leaves the accordion exactly as it was.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StanceAccordion from './StanceAccordion.jsx';

const ALL_TOPICS = [
  { id: 't1', short_title: 'Voting Rights', topic_key: 'voting-rights', question_text: 'What should it take to vote?', stances: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }, { text: 'E' }] },
  { id: 't2', short_title: 'Housing', topic_key: 'housing', question_text: 'How should housing be built?', stances: [] },
];
const NO_STANCE = { topic_id: 't1', outcome: 'no-stance', researched_on: '2026-10-20', passages: [] };
const OWN_WORDS = {
  topic_id: 't1', outcome: 'doesnt-fit', researched_on: '2026-10-21', passages: [
    { kind: 'own-words', passage: 'Every voter should be able to vote by mail.', source_url: 'https://example.org/speech', source_date: '2026-09-01' },
    { kind: 'local-record', passage: 'Voted for a resolution adding two polling places.', source_url: 'https://town.example/minutes', source_date: '2024-02-01' },
  ],
};

const base = {
  topics: [ALL_TOPICS[0]],
  polAnswers: [],
  allTopics: ALL_TOPICS,
  politicianId: 'pol-1',
  apiUrl: 'https://api.test',
};

let calls;
const stubFetch = (states, ok = true) => {
  calls = [];
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    calls.push(String(url));
    if (String(url).includes('/research-states')) {
      if (!ok) throw new Error('network');
      return { ok: true, json: async () => states };
    }
    return { ok: true, json: async () => (String(url).includes('/quotes') ? { quotes: [] } : {}) };
  }));
};
beforeEach(() => stubFetch([]));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const expand = (title = 'What should it take to vote?') => fireEvent.click(screen.getByText(title));

describe('research states', () => {
  // No research date is shown. `researched_on` stays in the payload as a record, but a dated
  // "Researched {day}" line ages in public the moment it is written: a stance we checked once and
  // that has not changed still reads as neglected a year later. The sentence carries the claim;
  // the date only invites that misreading.
  it('no-stance renders the exact sentence and never a research date', async () => {
    stubFetch([NO_STANCE]);
    render(<StanceAccordion {...base} politicianName="Jane Doe" />);
    expand();
    expect(await screen.findByText('We researched Jane Doe and found no public stance on Voting Rights.')).toBeTruthy();
    expect(screen.queryByText(/^Researched /)).toBeNull();
    expect(screen.queryByText('No detailed reasoning available for this topic.')).toBeNull();
    expect(calls.filter((u) => u.includes('/research-states'))).toEqual(['https://api.test/api/compass/politicians/pol-1/research-states']);
  });

  it('says "this official" without a name', async () => {
    stubFetch([NO_STANCE]);
    render(<StanceAccordion {...base} />);
    expand();
    expect(await screen.findByText('We researched this official and found no public stance on Voting Rights.')).toBeTruthy();
  });

  it('doesnt-fit renders their own words in quotes with source and date, and a local record in plain words', async () => {
    stubFetch([OWN_WORDS]);
    render(<StanceAccordion {...base} politicianName="Jane Doe" />);
    expand();
    expect(await screen.findByText('In their own words — not a position on the scale')).toBeTruthy();
    expect(screen.getByText('“Every voter should be able to vote by mail.”')).toBeTruthy();
    expect(screen.getByText('Local record')).toBeTruthy();
    expect(screen.getByText('Voted for a resolution adding two polling places.')).toBeTruthy();
    expect(screen.getByText('September 1, 2026')).toBeTruthy();
    expect(screen.getByText('February 1, 2024')).toBeTruthy();
    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links).toEqual(expect.arrayContaining(['https://example.org/speech', 'https://town.example/minutes']));
    // The per-passage SOURCE dates above are kept — they date the evidence. What goes is our own
    // "Researched {day}" line, on this branch too.
    expect(screen.queryByText(/^Researched /)).toBeNull();
  });

  it('labels the collapsed row once the state is known', async () => {
    render(<StanceAccordion {...base} researchStates={[NO_STANCE]} />);
    expect(screen.getByText('No public stance found')).toBeTruthy();
    cleanup();
    render(<StanceAccordion {...base} researchStates={[OWN_WORDS]} />);
    expect(screen.getByText('Own words, not a position on the scale')).toBeTruthy();
  });

  it('a seated topic ignores research states', async () => {
    stubFetch([NO_STANCE]);
    render(<StanceAccordion {...base} polAnswers={[{ topic_id: 't1', value: 3 }]} researchStates={[NO_STANCE]} politicianName="Jane Doe" />);
    expect(screen.getAllByText('C').length).toBeGreaterThan(0);
    expect(screen.queryByText('No public stance found')).toBeNull();
    expand();
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    expect(screen.queryByText(/We researched/)).toBeNull();
  });

  it('a failed fetch renders as today', async () => {
    stubFetch([], false);
    render(<StanceAccordion {...base} politicianName="Jane Doe" />);
    expect(screen.getByText('No position')).toBeTruthy();
    expand();
    expect(await screen.findByText('No detailed reasoning available for this topic.')).toBeTruthy();
    expect(screen.queryByText(/We researched/)).toBeNull();
  });

  it('a supplied list stops the fetch', async () => {
    render(<StanceAccordion {...base} researchStates={[NO_STANCE]} politicianName="Jane Doe" />);
    expand();
    expect(await screen.findByText('We researched Jane Doe and found no public stance on Voting Rights.')).toBeTruthy();
    expect(calls.filter((u) => u.includes('/research-states'))).toEqual([]);
  });

  it('a doesnt-fit state with no shown passage renders as today', async () => {
    stubFetch([{ ...OWN_WORDS, passages: [] }]);
    render(<StanceAccordion {...base} />);
    expand();
    expect(await screen.findByText('No detailed reasoning available for this topic.')).toBeTruthy();
    expect(screen.queryByText('In their own words — not a position on the scale')).toBeNull();
  });
});

describe('research states belong to one person', () => {
  it('never shows the last person\'s states after politicianId changes', async () => {
    stubFetch([NO_STANCE]);
    const { rerender } = render(<StanceAccordion {...base} politicianName="Jane Doe" />);
    expand();
    expect(await screen.findByText('We researched Jane Doe and found no public stance on Voting Rights.')).toBeTruthy();
    stubFetch([]);
    rerender(<StanceAccordion {...base} politicianId="pol-2" politicianName="John Roe" />);
    expect(screen.queryByText('No public stance found')).toBeNull();
    expect(screen.queryByText(/We researched/)).toBeNull();
  });
});
