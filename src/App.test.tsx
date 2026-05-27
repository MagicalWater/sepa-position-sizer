import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';

test('renders the initialized position sizer shell', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'SEPA Position Sizer' })).toBeInTheDocument();
  expect(screen.getByText('倉位試算器初始化完成')).toBeInTheDocument();
});
