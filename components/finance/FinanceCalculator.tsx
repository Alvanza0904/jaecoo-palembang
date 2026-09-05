/**
 * JAECOO Palembang — Finance Calculator
 *
 * STEP 4A: Full interactive UI implemented.
 *
 * Rules (LOCKED — do not change):
 *   DP options:   25 | 30 | 40 | 50%
 *   Tenor:        1 – 5 tahun
 *   Flat interest: 10% per tahun
 *   Pokok        = Harga − DP
 *   Bunga        = Pokok × 10% × tenor
 *   Angsuran     = (Pokok + Bunga) / (tenor × 12)
 *
 * Price is ALWAYS passed from model data — never hardcoded here.
 */

"use client";

import { useState } from "react";
import { formatIDR } from "@/lib/utils/format";
import styles from "./FinanceCalculator.module.css";

export interface CalculatorInput {
  /** Vehicle price in IDR — from model data */
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
export const INTEREST_RATE = 0.10; // 10% per tahun flat

export const CALCULATOR_DISCLAIMER =
  "Simulasi merupakan estimasi dan bukan penawaran pembiayaan resmi. Angsuran aktual dapat berbeda sesuai program pembiayaan dan hasil persetujuan lembaga keuangan.";

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

  const result = calculate({ price, dp_percent: dpPercent, tenor_years: tenor });

  return (
    <div className={styles.calculator} aria-label={`Simulasi kredit ${modelName}`}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.label}>Simulasi Kredit</p>
        <p className={styles.modelName}>{modelName}</p>
        <p className={styles.otrPrice}>{formatIDR(price)} OTR Palembang</p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {/* DP Selector */}
        <div className={styles.controlGroup}>
          <p className={styles.controlLabel}>Uang Muka (DP)</p>
          <div className={styles.optionRow}>
            {DP_OPTIONS.map((dp) => (
              <button
                key={dp}
                type="button"
                className={`${styles.optionBtn} ${dpPercent === dp ? styles.optionBtnActive : ""}`}
                onClick={() => setDpPercent(dp)}
                aria-pressed={dpPercent === dp}
              >
                {dp}%
              </button>
            ))}
          </div>
          <p className={styles.controlDetail}>
            DP: <strong>{formatIDR(result.dp_amount)}</strong>
          </p>
        </div>

        {/* Tenor Selector */}
        <div className={styles.controlGroup}>
          <p className={styles.controlLabel}>Tenor</p>
          <div className={styles.optionRow}>
            {TENOR_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.optionBtn} ${tenor === t ? styles.optionBtnActive : ""}`}
                onClick={() => setTenor(t)}
                aria-pressed={tenor === t}
              >
                {t} th
              </button>
            ))}
          </div>
          <p className={styles.controlDetail}>
            Tenor: <strong>{tenor} tahun ({tenor * 12} bulan)</strong>
          </p>
        </div>
      </div>

      {/* Result */}
      <div className={styles.result}>
        <div className={styles.resultMain}>
          <p className={styles.resultLabel}>Estimasi Angsuran / Bulan</p>
          <p className={styles.resultValue}>{formatIDR(result.monthly_installment)}</p>
        </div>

        <div className={styles.resultBreakdown}>
          <div className={styles.breakdownRow}>
            <span>Pokok Pinjaman</span>
            <span>{formatIDR(result.principal)}</span>
          </div>
          <div className={styles.breakdownRow}>
            <span>Total Bunga (10%/th × {tenor} th)</span>
            <span>{formatIDR(result.total_interest)}</span>
          </div>
          <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}>
            <span>Total Pembayaran</span>
            <span>{formatIDR(result.total_payment)}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className={styles.disclaimer}>{CALCULATOR_DISCLAIMER}</p>
    </div>
  );
}
