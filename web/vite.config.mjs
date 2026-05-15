import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "url"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This is a more modern, reliable way to map "@" in Vite 7
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
  }
})