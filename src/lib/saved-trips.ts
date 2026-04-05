import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

type JsonRecord = Prisma.JsonObject;

type MemoryTrip = {
  id: string;
  title: string;
  summary: string | null;
  vertical: string;
  status: string;
  path: string;
  destinationLabel: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: string | null;
  budget: string | null;
  notes: string | null;
  searchState: JsonRecord;
  createdAt: Date;
  updatedAt: Date;
};

type MemoryTask = {
  id: string;
  tripId: string;
  title: string;
  done: boolean;
  createdAt: Date;
};

type MemoryPartnerClick = {
  id: string;
  provider: string;
  vertical: string;
  label: string | null;
  sourcePath: string | null;
  destinationUrl: string;
  metadata: JsonRecord | null;
  createdAt: Date;
};

type MemoryStore = {
  partnerClicks: MemoryPartnerClick[];
  tasks: MemoryTask[];
  trips: MemoryTrip[];
  warned: boolean;
};

const globalForSavedTripFallback = globalThis as typeof globalThis & {
  flytrackersSavedTripFallback?: MemoryStore;
};

function getMemoryStore() {
  if (!globalForSavedTripFallback.flytrackersSavedTripFallback) {
    globalForSavedTripFallback.flytrackersSavedTripFallback = {
      partnerClicks: [],
      tasks: [],
      trips: [],
      warned: false,
    };
  }

  return globalForSavedTripFallback.flytrackersSavedTripFallback;
}

function cloneJsonRecord(value: JsonRecord) {
  return JSON.parse(JSON.stringify(value)) as JsonRecord;
}

function toJsonRecord(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as JsonRecord;
}

function warnAboutPersistenceFallback(error: unknown) {
  const store = getMemoryStore();

  if (store.warned) {
    return;
  }

  store.warned = true;

  const message =
    error instanceof Error
      ? error.message
      : "Unknown database error";

  console.warn(
    `Saved trip persistence is using the in-memory fallback. Data will not survive a cold start. ${message}`,
  );
}

async function withPersistenceFallback<T>(
  primary: () => Promise<T>,
  fallback: () => T | Promise<T>,
) {
  try {
    return await primary();
  } catch (error) {
    warnAboutPersistenceFallback(error);
    return await fallback();
  }
}

function listMemoryTaskSummariesForTrip(tripId: string) {
  const store = getMemoryStore();
  return store.tasks
    .filter((task) => task.tripId === tripId)
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
    .map((task) => ({
      id: task.id,
      done: task.done,
    }));
}

function listMemoryTaskDetailsForTrip(tripId: string) {
  const store = getMemoryStore();
  return store.tasks
    .filter((task) => task.tripId === tripId)
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
    .map((task) => ({
      id: task.id,
      tripId: task.tripId,
      title: task.title,
      done: task.done,
      createdAt: task.createdAt,
    }));
}

function listMemoryTrips() {
  const store = getMemoryStore();

  return [...store.trips]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((trip) => ({
      ...trip,
      searchState: cloneJsonRecord(trip.searchState),
      tasks: listMemoryTaskSummariesForTrip(trip.id),
    }));
}

function getMemoryTripById(id: string) {
  const store = getMemoryStore();
  const trip = store.trips.find((item) => item.id === id);

  if (!trip) {
    return null;
  }

  return {
    ...trip,
    searchState: cloneJsonRecord(trip.searchState),
    tasks: listMemoryTaskDetailsForTrip(trip.id),
  };
}

export type SavedTripInput = {
  title: string;
  summary?: string;
  vertical: string;
  path: string;
  searchState: Record<string, unknown>;
};

export type SavedTripWorkspaceInput = {
  id: string;
  summary?: string;
  status?: string;
  destinationLabel?: string;
  startDate?: string;
  endDate?: string;
  travelers?: string;
  budget?: string;
  notes?: string;
};

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeOptionalString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function inferTripWorkspace(searchState: Record<string, unknown>) {
  return {
    destinationLabel:
      readString(searchState.destination) ??
      readString(searchState.city) ??
      readString(searchState.airport) ??
      readString(searchState.pickupLocation) ??
      readString(searchState.flightIata),
    startDate:
      readString(searchState.departDate) ??
      readString(searchState.checkIn) ??
      readString(searchState.pickupDate) ??
      readString(searchState.date),
    endDate:
      readString(searchState.returnDate) ??
      readString(searchState.checkOut) ??
      readString(searchState.dropoffDate),
  };
}

export async function listSavedTrips() {
  return withPersistenceFallback(
    () =>
      db.savedTrip.findMany({
        include: {
          tasks: {
            select: {
              id: true,
              done: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    () => listMemoryTrips(),
  );
}

export async function getSavedTripById(id: string) {
  return withPersistenceFallback(
    () =>
      db.savedTrip.findUnique({
        where: { id },
        include: {
          tasks: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      }),
    () => getMemoryTripById(id),
  );
}

export async function createSavedTrip(input: SavedTripInput) {
  const inferredWorkspace = inferTripWorkspace(input.searchState);

  return withPersistenceFallback(
    () =>
      db.savedTrip.create({
        data: {
          title: input.title,
          summary: input.summary,
          vertical: input.vertical,
          path: input.path,
          status: "planning",
          destinationLabel: inferredWorkspace.destinationLabel,
          startDate: inferredWorkspace.startDate,
          endDate: inferredWorkspace.endDate,
          searchState: toInputJsonValue(input.searchState),
        },
      }),
    () => {
      const store = getMemoryStore();
      const now = new Date();
      const trip: MemoryTrip = {
        id: randomUUID(),
        title: input.title,
        summary: input.summary ?? null,
        vertical: input.vertical,
        status: "planning",
        path: input.path,
        destinationLabel: inferredWorkspace.destinationLabel ?? null,
        startDate: inferredWorkspace.startDate ?? null,
        endDate: inferredWorkspace.endDate ?? null,
        travelers: null,
        budget: null,
        notes: null,
        searchState: toJsonRecord(input.searchState),
        createdAt: now,
        updatedAt: now,
      };

      store.trips.unshift(trip);

      return {
        ...trip,
        searchState: cloneJsonRecord(trip.searchState),
      };
    },
  );
}

export async function updateSavedTripWorkspace(input: SavedTripWorkspaceInput) {
  return withPersistenceFallback(
    () =>
      db.savedTrip.update({
        where: { id: input.id },
        data: {
          summary: normalizeOptionalString(input.summary),
          status: normalizeOptionalString(input.status) ?? "planning",
          destinationLabel: normalizeOptionalString(input.destinationLabel),
          startDate: normalizeOptionalString(input.startDate),
          endDate: normalizeOptionalString(input.endDate),
          travelers: normalizeOptionalString(input.travelers),
          budget: normalizeOptionalString(input.budget),
          notes: normalizeOptionalString(input.notes),
        },
      }),
    () => {
      const store = getMemoryStore();
      const trip = store.trips.find((item) => item.id === input.id);

      if (!trip) {
        return null;
      }

      trip.summary = normalizeOptionalString(input.summary);
      trip.status = normalizeOptionalString(input.status) ?? "planning";
      trip.destinationLabel = normalizeOptionalString(input.destinationLabel);
      trip.startDate = normalizeOptionalString(input.startDate);
      trip.endDate = normalizeOptionalString(input.endDate);
      trip.travelers = normalizeOptionalString(input.travelers);
      trip.budget = normalizeOptionalString(input.budget);
      trip.notes = normalizeOptionalString(input.notes);
      trip.updatedAt = new Date();

      return {
        ...trip,
        searchState: cloneJsonRecord(trip.searchState),
      };
    },
  );
}

export async function addSavedTripTask(input: { tripId: string; title: string }) {
  return withPersistenceFallback(
    () =>
      db.tripTask.create({
        data: {
          tripId: input.tripId,
          title: input.title.trim(),
        },
      }),
    () => {
      const store = getMemoryStore();
      const trip = store.trips.find((item) => item.id === input.tripId);

      if (!trip) {
        return null;
      }

      const task: MemoryTask = {
        id: randomUUID(),
        tripId: input.tripId,
        title: input.title.trim(),
        done: false,
        createdAt: new Date(),
      };

      trip.updatedAt = new Date();
      store.tasks.push(task);

      return { ...task };
    },
  );
}

export async function toggleSavedTripTask(input: { taskId: string; done: boolean }) {
  return withPersistenceFallback(
    () =>
      db.tripTask.update({
        where: { id: input.taskId },
        data: {
          done: input.done,
        },
      }),
    () => {
      const store = getMemoryStore();
      const task = store.tasks.find((item) => item.id === input.taskId);

      if (!task) {
        return null;
      }

      task.done = input.done;

      const trip = store.trips.find((item) => item.id === task.tripId);

      if (trip) {
        trip.updatedAt = new Date();
      }

      return { ...task };
    },
  );
}

export async function deleteSavedTripTask(taskId: string) {
  return withPersistenceFallback(
    () =>
      db.tripTask.delete({
        where: { id: taskId },
      }),
    () => {
      const store = getMemoryStore();
      const taskIndex = store.tasks.findIndex((item) => item.id === taskId);

      if (taskIndex === -1) {
        return null;
      }

      const [task] = store.tasks.splice(taskIndex, 1);
      const trip = store.trips.find((item) => item.id === task.tripId);

      if (trip) {
        trip.updatedAt = new Date();
      }

      return task;
    },
  );
}

export async function deleteSavedTrip(id: string) {
  return withPersistenceFallback(
    () =>
      db.savedTrip.delete({
        where: { id },
      }),
    () => {
      const store = getMemoryStore();
      const tripIndex = store.trips.findIndex((item) => item.id === id);

      if (tripIndex === -1) {
        return null;
      }

      store.tasks = store.tasks.filter((task) => task.tripId !== id);
      const [trip] = store.trips.splice(tripIndex, 1);
      return trip;
    },
  );
}

export async function logPartnerClick(input: {
  provider: string;
  vertical: string;
  label?: string;
  sourcePath?: string;
  destinationUrl: string;
  metadata?: Record<string, unknown>;
}) {
  return withPersistenceFallback(
    () =>
      db.partnerClick.create({
        data: {
          provider: input.provider,
          vertical: input.vertical,
          label: input.label,
          sourcePath: input.sourcePath,
          destinationUrl: input.destinationUrl,
          metadata: input.metadata
            ? toInputJsonValue(input.metadata)
            : undefined,
        },
      }),
    () => {
      const store = getMemoryStore();
      const click: MemoryPartnerClick = {
        id: randomUUID(),
        provider: input.provider,
        vertical: input.vertical,
        label: input.label ?? null,
        sourcePath: input.sourcePath ?? null,
        destinationUrl: input.destinationUrl,
        metadata: input.metadata ? toJsonRecord(input.metadata) : null,
        createdAt: new Date(),
      };

      store.partnerClicks.unshift(click);
      return { ...click };
    },
  );
}

export async function listPartnerClicks() {
  return withPersistenceFallback(
    () =>
      db.partnerClick.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      }),
    () => getMemoryStore().partnerClicks.slice(0, 50).map((click) => ({ ...click })),
  );
}
