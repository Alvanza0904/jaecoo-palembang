/**
 * JAECOO Palembang — Finance Calculator
 *
 * Rules (LOCKED — do not change):
 *   DP range:     25% – 50% (step 1)
 *   Tenor:        1 – 5 tahun
 *   Flat interest: 10% per tahun
 *   Pokok        = Harga − DP
 *   Bunga        = Pokok × 10% × tenor
 *   Angsuran     = (Pokok + Bunga) / (tenor × 12)
 *
 * Price always comes from model/variant data — never hardcoded here.
 */

"use client";

import { useMemo, useState } from "react";
import { formatIDR } from "@/lib/utils/format";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { LeadSource } from "@/lib/types/lead";
import {
  isCalculableVariant,
  type CalculatorModel,
} from "@/lib/finance/catalog";
import styles from "./FinanceCalculator.module.css";

export interface CalculatorInput {
  price: number;
  dp_percent: number;
  tenor_years: number;
}

export interface CalculatorResult {
  dp_amount: number;
  principal: number;
  total_interest: number;
  total_payment: number;
  monthly_installment: number;
}

export const DP_MIN = 25;
export const DP_MAX = 50;
export const DP_STEP = 1;
export const DP_OPTIONS = [25, 30, 35, 40, 45, 50] as const;
export const TENOR_OPTIONS = [1, 2, 3, 4, 5] as const;
export const INTEREST_RATE = 0.10;

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

export type { CalculatorModel, CalculatorVariant } from "@/lib/finance/catalog";
export { toCalculatorModel, catalogFromModels } from "@/lib/finance/catalog";

interface FinanceCalculatorProps {
  /** Combined catalog (sales / multi-model). Shows a model selector. */
  catalog?: CalculatorModel[];
  /** Single model page. Locks the model; shows a variant selector when needed. */
  model?: CalculatorModel;
  initialVariantId?: string;
  source?: LeadSource;
}

export function FinanceCalculator({
  catalog,
  model,
  initialVariantId,
  source = "calculator",
}: FinanceCalculatorProps) {
  const models = useMemo(() => {
    const raw = catalog?.length ? catalog : model ? [model] : [];
    return raw
      .map((entry) => ({
        ...entry,
        variants: entry.variants.filter(isCalculableVariant),
      }))
      .filter((entry) => entry.variants.length > 0);
  }, [catalog, model]);

  const [modelSlug, setModelSlug] = useState(models[0]?.slug ?? "");
  const [variantId, setVariantId] = useState(() => {
    const first = models[0];
    if (initialVariantId && first?.variants.some((variant) => variant.id === initialVariantId)) {
      return initialVariantId;
    }
    return first?.variants[0]?.id ?? "";
  });
  const [dpPercent, setDpPercent] = useState(30);
  const [tenor, setTenor] = useState<(typeof TENOR_OPTIONS)[number]>(3);

  const selectedModel = models.find((entry) => entry.slug === modelSlug) ?? models[0];
  const variants = selectedModel?.variants ?? [];
  const selectedVariant = variants.find((variant) => variant.id === variantId) ?? variants[0];
  const price = selectedVariant?.price_idr ?? 0;
  const showModelSelect = Boolean(catalog && models.length > 1);
  const showVariantSelect = variants.length > 1;

  if (!selectedModel || !selectedVariant || !price || price <= 0 || Number.isNaN(price)) {
    return null;
  }

  const safeDp = Math.min(DP_MAX, Math.max(DP_MIN, dpPercent));
  const result = calculate({ price, dp_percent: safeDp, tenor_years: tenor });
  const fill = ((safeDp - DP_MIN) / (DP_MAX - DP_MIN)) * 100;
  const typeLabel = selectedVariant.label?.trim() || selectedVariant.name;
  const region = selectedVariant.price_region?.trim() || "OTR Palembang";

  const whatsapp = buildWhatsAppUrl(
    {
      source,
      model: selectedModel.short_name,
      variant: selectedVariant.name,
      source_cta: "calculator_ask",
    },
    [
      `Halo Alvan, saya tertarik dengan ${selectedVariant.name}.`,
      "Saya baru mencoba simulasi cicilan di website.",
      `Model: ${selectedModel.name}`,
      `Tipe: ${typeLabel}`,
      `Harga OTR: ${formatIDR(price)}`,
      `DP: ${safeDp}% (${formatIDR(result.dp_amount)})`,
      `Tenor: ${tenor} Tahun`,
      `Estimasi cicilan: ${formatIDR(result.monthly_installment)}/bulan`,
      "Saya ingin menanyakan detail cicilan dan program yang tersedia.",
    ].join("\n"),
  );

  const selectModel = (slug: string) => {
    const next = models.find((entry) => entry.slug === slug);
    setModelSlug(slug);
    setVariantId(next?.variants[0]?.id ?? "");
  };

  return (
    <div className={styles.calculator} aria-label={`Simulasi kredit ${selectedVariant.name}`}>
      <div className={styles.intro}>
        <p className={styles.label}>Simulasi Kredit</p>
        <p className={styles.lead}>Pilih model, atur DP, lalu lihat estimasi cicilan.</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.controls}>
          {showModelSelect ? (
            <label className={styles.controlGroup}>
              <span className={styles.controlLabel}>Pilih Model</span>
              <select
                className={styles.select}
                value={selectedModel.slug}
                onChange={(event) => selectModel(event.target.value)}
              >
                {models.map((entry) => (
                  <option key={entry.slug} value={entry.slug}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className={styles.controlGroup}>
              <p className={styles.controlLabel}>Model</p>
              <p className={styles.modelName}>{selectedModel.name}</p>
            </div>
          )}

          {showVariantSelect ? (
            <label className={styles.controlGroup}>
              <span className={styles.controlLabel}>Pilih Tipe</span>
              <select
                className={styles.select}
                value={selectedVariant.id}
                onChange={(event) => setVariantId(event.target.value)}
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label ? `${variant.label} — ${variant.name}` : variant.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className={styles.controlGroup}>
            <div className={styles.sliderHead}>
              <span className={styles.controlLabel}>Uang Muka (DP)</span>
              <span className={styles.sliderValue}>{safeDp}%</span>
            </div>
            <input
              className={styles.slider}
              type="range"
              min={DP_MIN}
              max={DP_MAX}
              step={DP_STEP}
              value={safeDp}
              aria-valuemin={DP_MIN}
              aria-valuemax={DP_MAX}
              aria-valuenow={safeDp}
              aria-label="Persentase uang muka"
              onChange={(event) => setDpPercent(Number(event.target.value))}
              style={{
                background: `linear-gradient(to right, var(--color-gold) ${fill}%, var(--color-border-mid) ${fill}%)`,
              }}
            />
            <div className={styles.sliderScale} aria-hidden="true">
              <span>{DP_MIN}%</span>
              <span>{DP_MAX}%</span>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <p className={styles.controlLabel}>Tenor</p>
            <div className={styles.optionRow} role="group" aria-label="Tenor kredit">
              {TENOR_OPTIONS.map((years) => (
                <button
                  key={years}
                  type="button"
                  className={`${styles.optionBtn} ${tenor === years ? styles.optionBtnActive : ""}`}
                  onClick={() => setTenor(years)}
                  aria-pressed={tenor === years}
                >
                  {years} th
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.result}>
          <div className={styles.resultStack}>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>Harga OTR</p>
              <p className={styles.metricValue}>{formatIDR(price)}</p>
              <p className={styles.metricHint}>{region}</p>
            </div>
            <div className={styles.metric}>
              <p className={styles.metricLabel}>DP {safeDp}%</p>
              <p className={styles.metricValue}>{formatIDR(result.dp_amount)}</p>
            </div>
            <div className={styles.metricMain}>
              <p className={styles.metricLabel}>Estimasi Cicilan</p>
              <p className={styles.resultValue}>{formatIDR(result.monthly_installment)}</p>
              <p className={styles.metricHint}>per bulan · {tenor} tahun</p>
            </div>
          </div>

          <a
            className={styles.cta}
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanyakan Cicilan
          </a>
        </div>
      </div>

      <p className={styles.disclaimer}>{CALCULATOR_DISCLAIMER}</p>
    </div>
  );
}
