/**
 * JAECOO Palembang — Button Component
 *
 * Primary CTA: black/charcoal bg, white text.
 * Gold is a subtle accent only — never used as primary CTA bg.
 */

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  as?: "button";
  href?: never;
}

interface ButtonAsLink extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> {
  as: "link";
  href: string;
}

interface ButtonAsAnchor extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> {
  as: "a";
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

export function Button({ variant = "primary", size = "md", fullWidth = false, children, ...rest }: ButtonProps) {
  const className = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    fullWidth ? styles["btn--full"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (rest.as === "link") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _as, href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={className} {...(linkRest as object)}>
        {children}
      </Link>
    );
  }

  if (rest.as === "a") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _as, href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a href={href} className={className} {...anchorRest}>
        {children}
      </a>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as: _as, ...btnRest } = rest as ButtonAsButton;
  return (
    <button className={className} {...btnRest}>
      {children}
    </button>
  );
}
