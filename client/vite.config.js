import { defineConfig } from 'vite'

export default defineConfig({
    server: {
      proxy: {
        "/recipeFlow": {
          target: "http://localhost:3400",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // some other configuration
  })