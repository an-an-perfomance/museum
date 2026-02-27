import { startServer } from "./http/server";

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});

