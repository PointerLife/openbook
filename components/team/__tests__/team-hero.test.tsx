import { GlobalRegistrator } from '@happy-dom/global-registrator';
try {
  GlobalRegistrator.register();
} catch (e) {
  // console.error(e);
}

import { expect, test, describe, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { TeamHero } from '../team-hero';
import React from 'react';

// Mock Next.js Image
mock.module('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => <img {...props} />,
}));

afterEach(cleanup);

describe('TeamHero', () => {
  test('renders the profile image', () => {
    render(<TeamHero />);
    const image = screen.getByAltText("Yeswanth's profile picture");
    expect(image).toBeTruthy();
  });

  test('renders the heading', () => {
    render(<TeamHero />);
    expect(screen.getByText("hi, i'm yswnth.")).toBeTruthy();
  });

  test('renders the age counter', () => {
    render(<TeamHero />);
    const ageText = screen.getByText(/been here for/i);
    expect(ageText).toBeTruthy();
  });

  test('renders social links', () => {
    render(<TeamHero />);
    expect(screen.getByLabelText('X profile')).toBeTruthy();
    expect(screen.getByLabelText('LinkedIn profile')).toBeTruthy();
    expect(screen.getByLabelText('GitHub profile')).toBeTruthy();
    expect(screen.getByLabelText('Send email')).toBeTruthy();
  });
  
  test('renders the primary CTA button', () => {
     render(<TeamHero />);
     expect(screen.getByText(/Get in Touch/i)).toBeTruthy();
  });
});
