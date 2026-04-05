"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SaveTripButtonProps = {
  title: string;
  summary?: string;
  vertical: string;
  path: string;
  searchState: Record<string, unknown>;
  className?: string;
};

export function SaveTripButton({
  title,
  summary,
  vertical,
  path,
  searchState,
  className = "cta-secondary",
}: SaveTripButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      setMessage(null);

      try {
        const response = await fetch("/api/saved-trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            summary,
            vertical,
            path,
            searchState,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to save trip.");
        }

        setMessage("Saved");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Save failed");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={className} onClick={onSave} disabled={isPending}>
        {isPending ? "Saving..." : "Save trip"}
      </button>
      {message ? (
        <span className="text-sm font-medium text-[color:var(--muted)]">{message}</span>
      ) : null}
    </div>
  );
}