export function buildTrackedOutboundHref(input: {
  destinationUrl: string;
  provider: string;
  vertical: string;
  label?: string;
  sourcePath?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}) {
  const params = new URLSearchParams({
    destination: input.destinationUrl,
    provider: input.provider,
    vertical: input.vertical,
  });

  if (input.label) {
    params.set("label", input.label);
  }

  if (input.sourcePath) {
    params.set("sourcePath", input.sourcePath);
  }

  if (input.metadata) {
    params.set("metadata", JSON.stringify(input.metadata));
  }

  return `/api/outbound?${params.toString()}`;
}