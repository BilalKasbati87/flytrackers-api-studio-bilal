"use server";

import { revalidatePath } from "next/cache";

import {
  addSavedTripTask,
  deleteSavedTripTask,
  toggleSavedTripTask,
  updateSavedTripWorkspace,
} from "@/lib/saved-trips";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateSavedTripWorkspaceAction(formData: FormData) {
  const tripId = readString(formData, "tripId");

  if (!tripId) {
    return;
  }

  await updateSavedTripWorkspace({
    id: tripId,
    summary: readString(formData, "summary"),
    status: readString(formData, "status"),
    destinationLabel: readString(formData, "destinationLabel"),
    startDate: readString(formData, "startDate"),
    endDate: readString(formData, "endDate"),
    travelers: readString(formData, "travelers"),
    budget: readString(formData, "budget"),
    notes: readString(formData, "notes"),
  });

  revalidatePath("/saved-trips");
  revalidatePath(`/saved-trips/${tripId}`);
}

export async function addSavedTripTaskAction(formData: FormData) {
  const tripId = readString(formData, "tripId");
  const title = readString(formData, "title").trim();

  if (!tripId || !title) {
    return;
  }

  await addSavedTripTask({ tripId, title });
  revalidatePath("/saved-trips");
  revalidatePath(`/saved-trips/${tripId}`);
}

export async function toggleSavedTripTaskAction(formData: FormData) {
  const tripId = readString(formData, "tripId");
  const taskId = readString(formData, "taskId");
  const done = readString(formData, "done") === "true";

  if (!tripId || !taskId) {
    return;
  }

  await toggleSavedTripTask({ taskId, done });
  revalidatePath("/saved-trips");
  revalidatePath(`/saved-trips/${tripId}`);
}

export async function deleteSavedTripTaskAction(formData: FormData) {
  const tripId = readString(formData, "tripId");
  const taskId = readString(formData, "taskId");

  if (!tripId || !taskId) {
    return;
  }

  await deleteSavedTripTask(taskId);
  revalidatePath("/saved-trips");
  revalidatePath(`/saved-trips/${tripId}`);
}