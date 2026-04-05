import "dotenv/config";

import localtunnel from "localtunnel";

function readString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

async function getPublicIpAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return typeof payload.ip === "string" ? payload.ip : null;
  } catch {
    return null;
  }
}

const port = Number.parseInt(readString(process.env.PREVIEW_PORT, "3000"), 10);
const subdomain = readString(
  process.env.PREVIEW_SUBDOMAIN,
  "flytrackers-bilal-preview",
);

if (Number.isNaN(port) || port <= 0) {
  throw new Error("PREVIEW_PORT must be a valid positive number.");
}

const tunnel = await localtunnel({
  port,
  subdomain,
});

const publicIpAddress = await getPublicIpAddress();

console.log(`Preview URL: ${tunnel.url}`);
console.log(`Local app: http://localhost:${port}`);

if (publicIpAddress) {
  console.log(`Tunnel password if prompted: ${publicIpAddress}`);
}

console.log("Keep this command running while your partner is reviewing the site.");

function closeTunnelAndExit(exitCode = 0) {
  tunnel.close();
  process.exit(exitCode);
}

process.on("SIGINT", () => closeTunnelAndExit(0));
process.on("SIGTERM", () => closeTunnelAndExit(0));

tunnel.on("close", () => {
  console.log("Preview tunnel closed.");
});

await new Promise(() => {});