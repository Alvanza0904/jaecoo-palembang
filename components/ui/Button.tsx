/**
 * JAECOO Palembang — Button
 */
import type { ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "darkPrimary";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type LinkProps = BaseProps & { as: "link"; href: string };
type AnchorProps = BaseProps & { as: "a" } & AnchorHTMLAttributes<HTMLAnchorElement>;
type ButtonProps = BaseProps & { as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: LinkProps | AnchorProps | ButtonProps) {
  const { variant = "primary", size = "md", children, className = "" } = props;

  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(" ");

  if (props.as === "link") {
    const { href } = props as LinkProps;
    return <Link href={href} className={cls}>{children}</Link>;
  }

  if (props.as === "a") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _as, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as AnchorProps;
    return <a className={cls} {...rest}>{children}</a>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as: _as, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return <button className={cls} {...rest}>{children}</button>;
}
