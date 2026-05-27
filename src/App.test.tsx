import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('顯示核心中文區塊', () => {
    render(<App />);

    expect(screen.getByText('帳戶與獲利緩衝')).toBeInTheDocument();
    expect(screen.getByText('滿倉風險規則')).toBeInTheDocument();
    expect(screen.getByText('本次價格')).toBeInTheDocument();
    expect(screen.getByText('自動推導')).toBeInTheDocument();
    expect(screen.getByText('倉位結果')).toBeInTheDocument();
  });

  it('輸入過遠停損時顯示不建議交易', async () => {
    const user = userEvent.setup();
    render(<App />);

    const stopInput = screen.getByLabelText('本次停損價');
    await user.clear(stopInput);
    await user.type(stopInput, '95');

    expect(screen.getAllByText('不建議交易').length).toBeGreaterThan(0);
    expect(screen.queryByText('最終建議股數')).not.toBeInTheDocument();
  });

  it('有效停損時顯示限制後結果', () => {
    render(<App />);

    expect(screen.getAllByText('可交易').length).toBeGreaterThan(0);
    expect(screen.getByText('最終建議股數')).toBeInTheDocument();
    expect(screen.getByText('250 股')).toBeInTheDocument();
  });
});
