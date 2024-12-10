import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import Sitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [solid(), Sitemap({ hostname: "https://poe-dps.vercel.app" })],
});
