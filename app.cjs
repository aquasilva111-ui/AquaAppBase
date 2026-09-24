// Hostinger (Phusion Passenger) startup file.
// Passenger loads this file and provides PORT; the Nitro node-server build
// reads NITRO_PORT ?? PORT natively. Build first: NITRO_PRESET=node-server npm run build
import("./.output/server/index.mjs").catch((err) => {
  console.error("[aqua] failed to start production server:", err);
  process.exit(1);
});
