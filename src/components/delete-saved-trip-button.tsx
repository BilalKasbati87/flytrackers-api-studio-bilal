"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type DeleteSavedTripButtonProps = {
  tripId: string;
};

export function DeleteSavedTripButton({ tripId }: DeleteSavedTripButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      await fetch(`/api/saved-trips?id=${encodeURIComponent(tripId)}`, {
        method: "DELETE",
      });

      router.refresh();
    });
  }

  return (
    <button type="button" className="cta-secondary" onClick={onDelete} disabled={isPending}>
      {isPending ? "Removing..." : "Remove"}
    </button>
  );
}