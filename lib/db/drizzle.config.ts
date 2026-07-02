// import { defineConfig } from "drizzle-kit";
// import path from "path";
// import { fileURLToPath } from "url";
// import { config } from "dotenv";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// config({ path: path.resolve(__dirname, "../../apps/api-server/.env") });

// console.log("DB Check", process.env.DATABASE_URL);

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL, ensure the database is provisioned");
// }

// export default defineConfig({
//   schema: path.join(__dirname, "./src/schema/index.ts"),
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL,
//   },
// });

import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../apps/api-server/.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
