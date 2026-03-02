const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface RetentionMeta {
  label: string;
  tone: "neutral" | "ok" | "due";
  isDue: boolean;
  formattedDate: string;
}

export function getRetentionMeta(
  retentionDate?: string | null,
): RetentionMeta {
  if (!retentionDate) {
    return {
      label: "no retention date",
      tone: "neutral",
      isDue: false,
      formattedDate: "Not set",
    };
  }

  const parsed = new Date(retentionDate);
  if (Number.isNaN(parsed.getTime())) {
    return {
      label: "invalid date",
      tone: "neutral",
      isDue: false,
      formattedDate: retentionDate,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(parsed);
  dueDate.setHours(0, 0, 0, 0);

  const dayDiff = Math.ceil((dueDate.getTime() - today.getTime()) / DAY_IN_MS);
  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
  }).format(dueDate);

  if (dayDiff <= 0) {
    return {
      label: dayDiff === 0 ? "review today" : "review due",
      tone: "due",
      isDue: true,
      formattedDate,
    };
  }

  return {
    label: `review in ${dayDiff}d`,
    tone: "ok",
    isDue: false,
    formattedDate,
  };
}

export function RetentionBadge({
  retentionDate,
}: {
  retentionDate?: string | null;
}) {
  const meta = getRetentionMeta(retentionDate);
  return <span className={`pill pill-${meta.tone}`}>{meta.label}</span>;
}
