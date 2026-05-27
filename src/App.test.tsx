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

  it('清空必要數值時不顯示非有限推導值', async () => {
    const user = userEvent.setup();
    render(<App />);

    const entryInput = screen.getByLabelText('入場價');
    await user.clear(entryInput);

    expect(screen.getAllByText('不建議交易').length).toBeGreaterThan(0);
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent(/NaN|Infinity|∞|非數值/);
  });

  it('輸入導致無限推導值時不顯示非有限推導值', async () => {
    const user = userEvent.setup();
    render(<App />);

    const totalCapitalInput = screen.getByLabelText('總投資資金');
    await user.clear(totalCapitalInput);
    await user.type(totalCapitalInput, '0');

    expect(screen.getAllByText('不建議交易').length).toBeGreaterThan(0);
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent(/NaN|Infinity|∞|非數值/);
  });

  it('有效停損時顯示限制後結果', () => {
    render(<App />);

    expect(screen.getAllByText('可交易').length).toBeGreaterThan(0);
    expect(screen.getByText('最終建議股數')).toBeInTheDocument();
    expect(screen.getAllByText('250 股').length).toBeGreaterThan(0);
  });

  it('有效停損時顯示完整風險推導與剩餘緩衝', () => {
    render(<App />);

    expect(screen.getAllByText('風險級別').length).toBeGreaterThan(0);
    expect(screen.getAllByText('滿倉').length).toBeGreaterThan(0);
    expect(screen.getByText('風險可買股數')).toBeInTheDocument();
    expect(screen.getByText('333 股')).toBeInTheDocument();
    expect(screen.getByText('投入上限股數')).toBeInTheDocument();
    expect(screen.getAllByText('250 股').length).toBeGreaterThan(0);
    expect(screen.getByText('停損後剩餘緩衝')).toBeInTheDocument();
    expect(screen.getByText('250 元')).toBeInTheDocument();
    expect(screen.getByText('投入上限低於風險可買股數，最終股數已由投入上限限制。')).toBeInTheDocument();
  });

  it('本次價格與自動推導區顯示停損比例、每股風險與有效性', () => {
    render(<App />);

    expect(screen.getByText('本次停損比例')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
    expect(screen.getAllByText('每股風險').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3 元').length).toBeGreaterThan(0);
    expect(screen.getByText('R 倍價格基準')).toBeInTheDocument();
    expect(screen.getByText('以入場價加上每股風險推導 1R、2R、3R。')).toBeInTheDocument();
    expect(screen.getByText('入場有效性')).toBeInTheDocument();
    expect(screen.getAllByText('本次停損價未低於絕對停損價，符合低風險入場條件。').length).toBeGreaterThan(0);
  });

  it('滿倉風險模式只顯示目前模式需要的欄位並提供按鈕狀態', async () => {
    const user = userEvent.setup();
    render(<App />);

    const modeGroup = screen.getByRole('group', { name: '滿倉風險模式' });
    const percentButton = screen.getByRole('button', { name: '依比例' });
    const manualButton = screen.getByRole('button', { name: '手動金額' });

    expect(modeGroup).toBeInTheDocument();
    expect(percentButton).toHaveAttribute('aria-pressed', 'true');
    expect(manualButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('滿倉風險百分比')).toBeInTheDocument();
    expect(screen.queryByLabelText('手動滿倉風險金額')).not.toBeInTheDocument();

    await user.click(manualButton);

    expect(percentButton).toHaveAttribute('aria-pressed', 'false');
    expect(manualButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByLabelText('滿倉風險百分比')).not.toBeInTheDocument();
    expect(screen.getByLabelText('手動滿倉風險金額')).toBeInTheDocument();
  });

  it('最終股數為零時顯示警示', async () => {
    const user = userEvent.setup();
    render(<App />);

    const lotSizeInput = screen.getByLabelText('股數單位');
    await user.clear(lotSizeInput);
    await user.type(lotSizeInput, '1000');

    expect(screen.getByText('最終股數為 0，代表目前風險與投入限制不足以建立一個交易單位。')).toBeInTheDocument();
  });

  it('停損後緩衝低於四分之一倉風險時顯示警示', async () => {
    const user = userEvent.setup();
    render(<App />);

    const realizedInput = screen.getByLabelText('已實現損益');
    const unrealizedInput = screen.getByLabelText('未實現浮盈');
    await user.clear(realizedInput);
    await user.type(realizedInput, '0');
    await user.clear(unrealizedInput);
    await user.type(unrealizedInput, '0');

    expect(screen.getByText('停損後剩餘緩衝低於 1/4 倉風險，下一筆交易應維持最低風險或暫停。')).toBeInTheDocument();
  });
});
