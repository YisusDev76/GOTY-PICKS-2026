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
  // Permite abrir el servidor de dev desde otros dispositivos de la red local (p. ej. el iPhone).
  allowedDevOrigins: ['192.168.100.*'],
};

export default nextConfig;
