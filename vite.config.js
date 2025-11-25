import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default ({ mode }) => {
  // Load environment variables starting with VITE_ from .env files
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": "/src", // optional: absolute imports from src
      },
    },
    define: {
      // Optional: define global constants for your app
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME),
    },
    server: {
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 5173,
    },
  });
};
