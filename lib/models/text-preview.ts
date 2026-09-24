import type { ModelHighlight, ModelPageCopy, ModelSectionCopy } from "@/lib/types/model";

export interface TextPreviewDraft {
  label: string;
  heading: string;
  body: string;
  stat: string;
  unit: string;
  primary: string;
  secondary: string;
  highlights: ModelHighlight[];
}

export function stickyRenderMode(textEditMode: boolean): "text" | "model" {
  return textEditMode ? "text" : "model";
}

const EMPTY: TextPreviewDraft = {
  label: "",
  heading: "",
  body: "",
  stat: "",
  unit: "",
  primary: "",
  secondary: "",
  highlights: [],
};

function sectionCopy(pageCopy: ModelPageCopy, key: keyof ModelPageCopy): ModelSectionCopy {
  const value = pageCopy[key];
  if (!value || Array.isArray(value)) return {};
  return value;
}

/**
 * Text preview reads the same fields the public page reads.
 * It never invents a heading, and it never substitutes another model.
 */
export function textPreviewDraft(
  section: string,
  pageCopy: ModelPageCopy,
  technology: { headline?: string; subheadline?: string },
  highlights: ModelHighlight[],
): TextPreviewDraft {
  if (section === "technology") {
    return {
      ...EMPTY,
      heading: technology.headline ?? "",
      body: technology.subheadline ?? "",
    };
  }

  const key = section as keyof ModelPageCopy;
  const copy = sectionCopy(pageCopy, key);
  return {
    label: copy.label ?? "",
    heading: copy.heading ?? "",
    body: copy.body ?? "",
    stat: copy.stat ?? "",
    unit: copy.unit ?? "",
    primary: copy.primary_label ?? "",
    secondary: copy.secondary_label ?? "",
    highlights: section === "performance" ? highlights : [],
  };
}
