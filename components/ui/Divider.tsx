import styles from "./Divider.module.css";

interface DividerProps {
  spacing?: "sm" | "md" | "lg";
}

export function Divider({ spacing = "md" }: DividerProps) {
  return <hr className={[styles.divider, styles[`divider--${spacing}`]].join(" ")} />;
}
