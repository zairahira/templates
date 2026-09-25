import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Progress } from './progress.js';

const lessons = [
  { slug: 'completed-lesson', href: '/learn/completed-lesson', section: 'Section one' },
  { slug: 'next-lesson', href: '/learn/next-lesson', section: 'Section one' },
];

const multiSectionLessons = [
  { slug: 'section-one-a', href: '/learn/section-one-a', section: 'Section one' },
  { slug: 'section-one-b', href: '/learn/section-one-b', section: 'Section one' },
  { slug: 'section-two-a', href: '/learn/section-two-a', section: 'Section two' },
];

describe(Progress, () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('progress', JSON.stringify(['completed-lesson']));
  });

  it('shows the next lesson based on stored completion', () => {
    render(<Progress lessons={lessons} />);

    const continueLink = screen.getByRole('link', { name: 'Continue learning' });

    expect(continueLink.getAttribute('href')).toBe('/learn/next-lesson');
  });

  it('shows Start learning when no lessons are complete', () => {
    localStorage.setItem('progress', JSON.stringify([]));

    render(<Progress lessons={lessons} />);

    const startLink = screen.getByRole('link', { name: 'Start learning' });

    expect(startLink.getAttribute('href')).toBe('/learn/completed-lesson');
  });

  it('shows Browse lessons instead of a lesson link once everything is complete', () => {
    localStorage.setItem('progress', JSON.stringify(['completed-lesson', 'next-lesson']));

    render(<Progress lessons={lessons} />);

    const browseLink = screen.getByRole('link', { name: 'Browse lessons' });

    expect(browseLink.getAttribute('href')).toBe('/learn');
    expect(screen.queryByRole('link', { name: 'Continue learning' })).not.toBeInTheDocument();
  });

  it('links each section title to its next incomplete lesson', () => {
    render(<Progress lessons={lessons} />);

    const sectionLink = screen.getByRole('link', { name: 'Section one' });

    expect(sectionLink.getAttribute('href')).toBe('/learn/next-lesson');
  });

  it('resets only the selected section progress', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem('progress', JSON.stringify(['section-one-a', 'section-two-a']));

    render(<Progress lessons={multiSectionLessons} />);

    await user.click(screen.getByRole('button', { name: 'Reset Section one progress' }));

    expect(JSON.parse(localStorage.getItem('progress')!)).toEqual(['section-two-a']);
    expect(screen.getByText('Progress reset for Section one.')).toBeInTheDocument();
  });

  it('does not reset section progress when the confirmation is canceled', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    localStorage.setItem('progress', JSON.stringify(['section-one-a', 'section-two-a']));

    render(<Progress lessons={multiSectionLessons} />);

    await user.click(screen.getByRole('button', { name: 'Reset Section one progress' }));

    expect(JSON.parse(localStorage.getItem('progress')!)).toEqual([
      'section-one-a',
      'section-two-a',
    ]);
  });
});
