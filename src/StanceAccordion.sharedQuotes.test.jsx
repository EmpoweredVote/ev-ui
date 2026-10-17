/**
 * Guards the two props essentials needs to render SEVERAL accordions on one
 * page without the page paying for it twice.
 *
 * essentials groups a politician's topics into issue categories, one accordion
 * per category. Measured on a real profile with four categories, every group
 * open: four "Stance Breakdown" headings stacked down the panel, and a repeated
 * GET /api/essentials/quotes for the same politician — one per group in which a
 * topic was expanded. Neither is fixable from the consumer side: the cache is a
 * per-instance ref and the heading is unconditional.
 *
 * The other half of this file is the part that matters for the other six
 * products: a release that changes anything for a caller who passes neither
 * prop is a release that reaches apps nobody showed it to. Their `build` check
 * proves compilation, not appearance, so the defaults are pinned here.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StanceAccordion from './StanceAccordion.jsx';

const TOPICS = [
  { id: 1, short_title: 'Abortion', topic_key: 'abortion' },
  { id: 2, short_title: 'Taxes', topic_key: 'taxes' },
];
const POL_ANSWERS = [{ topic_id: 1, value: 3 }, { topic_id: 2, value: 4 }];
const ALL_TOPICS = [
  { id: 1, short_title: 'Abortion', topic_key: 'abortion', question_text: 'How should the law handle abortion?', stances: [] },
  { id: 2, short_title: 'Taxes', topic_key: 'taxes', question_text: 'How should taxes work?', stances: [] },
];

const base = {
  topics: TOPICS,
  polAnswers: POL_ANSWERS,
  allTopics: ALL_TOPICS,
  politicianId: 'pol-1',
  apiUrl: 'https://api.test',
};

let calls;
beforeEach(() => {
  calls = [];
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    calls.push(String(url));
    return {
      ok: true,
      json: async () => (String(url).includes('/quotes') ? { quotes: [] } : { context: null }),
    };
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const quoteCalls = () => calls.filter((u) => u.includes('/quotes'));
const expandFirstRow = async () => {
  fireEvent.click(screen.getAllByText('How should the law handle abortion?')[0]);
  await waitFor(() => expect(calls.length).toBeGreaterThan(0));
};

describe('showHeading', () => {
  it('renders the heading by default — an existing caller sees no change', () => {
    render(<StanceAccordion {...base} />);
    expect(screen.getAllByText('Stance Breakdown')).toHaveLength(1);
  });

  it('omits the heading when asked', () => {
    render(<StanceAccordion {...base} showHeading={false} />);
    expect(screen.queryByText('Stance Breakdown')).toBeNull();
  });

  it('prints once per accordion, which is the defect essentials hit', () => {
    render(
      <div>
        <StanceAccordion {...base} />
        <StanceAccordion {...base} />
        <StanceAccordion {...base} />
      </div>
    );
    expect(screen.getAllByText('Stance Breakdown')).toHaveLength(3);
    cleanup();
    render(
      <div>
        <StanceAccordion {...base} showHeading={false} />
        <StanceAccordion {...base} showHeading={false} />
        <StanceAccordion {...base} showHeading={false} />
      </div>
    );
    expect(screen.queryByText('Stance Breakdown')).toBeNull();
  });
});

describe('quotes', () => {
  it('fetches its own quote list when the prop is absent — unchanged behaviour', async () => {
    render(<StanceAccordion {...base} />);
    await expandFirstRow();
    await waitFor(() => expect(quoteCalls()).toHaveLength(1));
  });

  it('fetches nothing when the caller supplies the list', async () => {
    render(<StanceAccordion {...base} quotes={[]} />);
    await expandFirstRow();
    // the context call still goes out; the quotes call must not
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    expect(quoteCalls()).toHaveLength(0);
  });

  it('an empty array counts as supplied — it is a real answer, not a miss', async () => {
    render(<StanceAccordion {...base} quotes={[]} />);
    await expandFirstRow();
    expect(quoteCalls()).toHaveLength(0);
  });

  it('three accordions fetch three times without the prop, and none with it', async () => {
    const { unmount } = render(
      <div>
        <StanceAccordion {...base} />
        <StanceAccordion {...base} />
      </div>
    );
    for (const row of screen.getAllByText('How should the law handle abortion?')) {
      fireEvent.click(row);
    }
    await waitFor(() => expect(quoteCalls()).toHaveLength(2));
    unmount();

    calls.length = 0;
    render(
      <div>
        <StanceAccordion {...base} quotes={[]} />
        <StanceAccordion {...base} quotes={[]} />
      </div>
    );
    for (const row of screen.getAllByText('How should the law handle abortion?')) {
      fireEvent.click(row);
    }
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    expect(quoteCalls()).toHaveLength(0);
  });

  it('a list that arrives after mount still suppresses the fetch', async () => {
    // handleToggle is memoized and closes over the first ensureQuotesFetched,
    // so a parent that fetches asynchronously would be invisible to it unless
    // the prop is read through a ref.
    const { rerender } = render(<StanceAccordion {...base} />);
    rerender(<StanceAccordion {...base} quotes={[]} />);
    await expandFirstRow();
    expect(quoteCalls()).toHaveLength(0);
  });
});
