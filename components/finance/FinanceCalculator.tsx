/**
 * JAECOO Palembang — Finance Calculator
 *
 * Phase 1: Interface and formula scaffold.
 * UI will be built in a later phase.
 * "use client" — interactive, requires state.
 */

"use client";

import { useState } from "react";

export interface CalculatorInput {
  /** Vehicle price in IDR */
  price: number;
  /** Down payment percentage: 25 | 30 | 40 | 50 */
  dp_percent: number;
  /** Tenor in years: 1 | 2 | 3 | 4 | 5 */
  tenor_years: number;
}

export interface CalculatorResult {
  dp_amount: number;
  principal: number;
  total_interest: number;
  total_payment: number;
  monthly_installment: number;
}

export const DP_OPTIONS = [25, 30, 40, 50] as const;
export const TENOR_OPTIONS = [1, 2, 3, 4, 5] as const;
export const INTEREST_RATE = 0.10; // 10% per year flat

export const CALCULATOR_DISCLAIMER =
  "Simulasi merupakan estimasi dan bukan penawaran pembiayaan resmi. Angsuran aktual dapat berbeda sesuai program pembiayaan dan hasil persetujuan.";

export function calculate(input: CalculatorInput): CalculatorResult {
  const dp_amount = Math.round(input.price * (input.dp_percent / 100));
  const principal = input.price - dp_amount;
  const total_interest = Math.round(principal * INTEREST_RATE * input.tenor_years);
  const total_payment = principal + total_interest;
  const monthly_installment = Math.round(total_payment / (input.tenor_years * 12));

  return { dp_amount, principal, total_interest, total_payment, monthly_installment };
}

interface FinanceCalculatorProps {
  /** Price passed from model data — never hardcoded */
  price: number;
  modelName: string;
}

export function FinanceCalculator({ price, modelName }: FinanceCalculatorProps) {
  const [dpPercent, setDpPercent] = useState<typeof DP_OPTIONS[number]>(30);
  const [tenor, setTenor] = useState<typeof TENOR_OPTIONS[number]>(3);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void setDpPercent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void setTenor;

  const result = calculate({ price, dp_percent: dpPercent, tenor_years: tenor });

  // Placeholder UI — full component in Phase: Calculator
  return (
    <div aria-label={`Simulasi kredit ${modelName}`}>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-ink-subtle)", fontStyle: "italic" }}>
        Calculator UI — akan dibangun pada fase berikutnya.
        {" "}DP: {dpPercent}%, Tenor: {tenor}th, Angsuran: Rp{result.monthly_installment.toLocaleString("id-ID")}/bln
      </p>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-ink-subtle)", marginTop: "0.5rem" }}>
        {CALCULATOR_DISCLAIMER}
      </p>
    </div>
  );
}
