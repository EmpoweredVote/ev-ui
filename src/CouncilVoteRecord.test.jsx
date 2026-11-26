import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import CouncilVoteRecord from './CouncilVoteRecord.jsx';

afterEach(cleanup);

const vote = (over = {}) => ({
  roll_call_id: 'r1',
  question: 'Final passage',
  question_order: 1,
  meeting_date: '2024-03-05',
  position: 'yea',
  worked_out: false,
  outcome: 'passed',
  yes: 7,
  no: 2,
  abstain: 0,
  minutes_url: 'https://x/m1',
  source_kind: 'minutes',
  feed_disagreement: null,
  seat_label: null,
  ...over,
});

const item = (over = {}) => ({
  bill_id: 'b1',
  number: 'Ord 1',
  title: 'Test ordinance one',
  url: 'https://x/1',
  status_label: 'Passed',
  pending: null,
  votes: [vote()],
  ...over,
});

describe('CouncilVoteRecord', () => {
  it('renders the title, blocks and rows in the order given', () => {
    const items = [
      item({
        votes: [
          vote({ roll_call_id: 'r1', question: 'Amendment 1', question_order: 1 }),
          vote({ roll_call_id: 'r2', question: 'Final passage', question_order: 2 }),
        ],
      }),
      item({ bill_id: 'b2', number: 'Ord 2', title: 'Test ordinance two', votes: [vote({ roll_call_id: 'r3', question: 'Veto override' })] }),
    ];
    const { container } = render(<CouncilVoteRecord items={items} />);
    expect(screen.getByRole('heading', { name: 'Council votes' })).toBeTruthy();
    const text = container.textContent;
    expect(text.indexOf('Ord 1')).toBeLessThan(text.indexOf('Ord 2'));
    expect(text.indexOf('Amendment 1')).toBeLessThan(text.indexOf('Final passage'));
    expect(text).toContain('Veto override');
    const links = screen.getAllByRole('link', { name: 'Legislation page' });
    expect(links[0].getAttribute('href')).toBe('https://x/1');
  });

  it('shows the exact pending copy', () => {
    const items = [item({ votes: [], pending: { meeting_date: '2024-03-05', outcome: 'passed', yes: 5, no: 1, abstain: 0 } })];
    render(<CouncilVoteRecord items={items} />);
    expect(screen.getByText('How each member voted will appear when the clerk posts the record of this meeting.')).toBeTruthy();
  });

  it('filters by the vote date year', () => {
    const items = [
      item({ number: 'Ord 1', votes: [vote({ meeting_date: '2024-03-05' })] }),
      item({ bill_id: 'b2', number: 'Ord 2', votes: [vote({ roll_call_id: 'r2', meeting_date: '2023-06-06' })] }),
    ];
    render(<CouncilVoteRecord items={items} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2023' } });
    expect(screen.queryByText('Ord 1')).toBeNull();
    expect(screen.getByText('Ord 2')).toBeTruthy();
  });

  it('maps positions to plain words', () => {
    const items = [
      item({
        votes: [
          vote({ roll_call_id: 'a', question: 'Q-yea', position: 'yea' }),
          vote({ roll_call_id: 'b', question: 'Q-nay', position: 'nay' }),
          vote({ roll_call_id: 'c', question: 'Q-present', position: 'present' }),
          vote({ roll_call_id: 'd', question: 'Q-absent', position: 'absent' }),
          vote({ roll_call_id: 'e', question: 'Q-nv', position: 'not_voting' }),
        ],
      }),
    ];
    render(<CouncilVoteRecord items={items} />);
    const word = (q) => within(screen.getByText(q).closest('[data-vote-row]')).getByTestId('position').textContent;
    expect(word('Q-yea')).toBe('Yes');
    expect(word('Q-nay')).toBe('No');
    expect(word('Q-present')).toBe('Abstain');
    expect(word('Q-absent')).toBe('Absent');
    expect(word('Q-nv')).toBe('Not present');
  });

  it('labels the source link by kind', () => {
    const items = [
      item({
        votes: [
          vote({ roll_call_id: 'a', question: 'Q-min', source_kind: 'minutes', minutes_url: 'https://x/min' }),
          vote({ roll_call_id: 'b', question: 'Q-memo', source_kind: 'memorandum', minutes_url: 'https://x/memo' }),
        ],
      }),
    ];
    render(<CouncilVoteRecord items={items} />);
    expect(screen.getByRole('link', { name: 'Minutes' }).getAttribute('href')).toBe('https://x/min');
    expect(screen.getByRole('link', { name: "Clerk's memo" }).getAttribute('href')).toBe('https://x/memo');
  });

  it('puts the worked-out note in the row title and shows the seat note', () => {
    const items = [item({ votes: [vote({ question: 'Q-w', worked_out: true, seat_label: 'Seat label' })] })];
    render(<CouncilVoteRecord items={items} />);
    const row = screen.getByText('Q-w').closest('[data-vote-row]');
    expect(row.getAttribute('title')).toBe("Worked out from the attendance list and tally in the clerk's record.");
    expect(row.textContent).toContain('as Seat label');
  });

  it('does not show feed_disagreement', () => {
    const items = [item({ votes: [vote({ feed_disagreement: 'Feed said different' })] })];
    const { container } = render(<CouncilVoteRecord items={items} />);
    expect(container.textContent).not.toContain('Feed said different');
  });

  it('shows the empty state and the loading state', () => {
    const { rerender, container } = render(<CouncilVoteRecord items={[]} />);
    expect(screen.getByText('No council votes on file.')).toBeTruthy();
    rerender(<CouncilVoteRecord items={[]} loading />);
    expect(container.textContent).not.toContain('No council votes on file.');
  });

  it('shows 25 items then the rest on request', () => {
    const items = Array.from({ length: 30 }, (_, i) => item({ bill_id: `b${i}`, number: `Ord ${i}`, title: `T${i}` }));
    render(<CouncilVoteRecord items={items} />);
    expect(screen.queryByText('Ord 25')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Show all 30/ }));
    expect(screen.getByText('Ord 29')).toBeTruthy();
  });

  it('never shows party text', () => {
    const items = [item({ pending: { meeting_date: '2024-03-05', outcome: 'failed', yes: 1, no: 5, abstain: 1 } })];
    const { container } = render(<CouncilVoteRecord items={items} />);
    expect(container.textContent).not.toMatch(/democrat|republican|\bparty\b|\(D\)|\(R\)/i);
  });
});
