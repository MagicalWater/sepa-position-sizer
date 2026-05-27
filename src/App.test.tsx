import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

const storageKey = 'sepa-position-sizer:settings:v1';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('顯示核心中文區塊', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'SEPA 倉位試算器' })).toBeInTheDocument();
    expect(screen.getByText('風險設定')).toBeInTheDocument();
    expect(screen.getByText('入場設定')).toBeInTheDocument();
    expect(screen.getByText('停損檢查')).toBeInTheDocument();
    expect(screen.getByText('倉位決策')).toBeInTheDocument();
    expect(screen.getByText('參考止盈')).toBeInTheDocument();
  });

  it('依照確認的三欄流程呈現區塊', () => {
    render(<App />);

    expect(screen.getByRole('region', { name: '風險設定' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '入場設定' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '停損檢查' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '倉位決策' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '參考止盈' })).toBeInTheDocument();

    expect(screen.queryByText('帳戶與獲利緩衝')).not.toBeInTheDocument();
    expect(screen.queryByText('滿倉風險規則')).not.toBeInTheDocument();
    expect(screen.queryByText('本次價格')).not.toBeInTheDocument();
    expect(screen.queryByText('自動推導')).not.toBeInTheDocument();
    expect(screen.queryByText('倉位結果')).not.toBeInTheDocument();
  });

  it('參考止盈跨滿整個倉位試算工作區', () => {
    render(<App />);

    const targets = screen.getByRole('region', { name: '參考止盈' });
    expect(targets.parentElement).toHaveClass('workspace-grid');
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
    expect(screen.getByText('建議股數')).toBeInTheDocument();
    expect(screen.getAllByText('250 股').length).toBeGreaterThan(0);
    expect(screen.getByText('本次可投入金額')).toBeInTheDocument();
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

  it('重新載入時使用 localStorage 保存的設定值', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        totalCapital: 250000,
        realizedPnL: 1200,
        unrealizedProfit: 800,
        discountPercent: 40,
        fullPositionPercent: 20,
        fullRiskMode: 'manual',
        fullRiskPercent: 0.8,
        manualFullRiskAmount: 1500,
        lotSize: 10,
        entryPrice: 88.5,
        currentStopPrice: 85
      })
    );

    render(<App />);

    expect(screen.getByLabelText('總投資資金')).toHaveValue(250000);
    expect(screen.getByLabelText('已實現損益')).toHaveValue(1200);
    expect(screen.getByLabelText('未實現浮盈')).toHaveValue(800);
    expect(screen.getByLabelText('浮盈折扣百分比')).toHaveValue(40);
    expect(screen.getByLabelText('滿倉投入百分比')).toHaveValue(20);
    expect(screen.getByRole('button', { name: '手動金額' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('手動滿倉風險金額')).toHaveValue(1500);
    expect(screen.getByLabelText('股數單位')).toHaveValue(10);
    expect(screen.getByLabelText('入場價')).toHaveValue(88.5);
    expect(screen.getByLabelText('本次停損價')).toHaveValue(85);
  });

  it('修改設定後自動保存到 localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('總投資資金'));
    await user.type(screen.getByLabelText('總投資資金'), '300000');
    await user.clear(screen.getByLabelText('入場價'));
    await user.type(screen.getByLabelText('入場價'), '120');
    await user.click(screen.getByRole('button', { name: '手動金額' }));

    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    expect(saved.totalCapital).toBe(300000);
    expect(saved.entryPrice).toBe(120);
    expect(saved.fullRiskMode).toBe('manual');
  });

  it('localStorage 資料損壞時使用預設設定', () => {
    localStorage.setItem(storageKey, '{broken');

    render(<App />);

    expect(screen.getByLabelText('總投資資金')).toHaveValue(100000);
    expect(screen.getByLabelText('入場價')).toHaveValue(100);
    expect(screen.getByLabelText('本次停損價')).toHaveValue(97);
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
