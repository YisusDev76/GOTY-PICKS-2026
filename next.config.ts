import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Asegura que las fuentes de la imagen se suban junto con la función en Vercel.
  outputFileTracingIncludes: {
    "/api/imagen": ["./src/assets/fonts/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
