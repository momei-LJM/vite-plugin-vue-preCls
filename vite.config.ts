import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import myPlg from "./plugins/vite-plugin-vue-kls";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), myPlg()],
});
