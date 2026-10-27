import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: { viewTransition: true, globalNotFound: true },
  // Las páginas de la app se mudaron al sitio de Mingo (03/10); las direcciones viejas siguen andando.
  async redirects() {
    return [
      // The old vercel.app address keeps working, but search engines see a single site.
      {
        source: "/:path*",
        has: [{ type: "host", value: "martin-minghetti.vercel.app" }],
        destination: "https://martin-minghetti.is-a.dev/:path*",
        permanent: true,
      },
      {
        source: "/:lang/tiendanube/ocultar-envios-y-pagos/:page",
        destination: "https://mingo-apps.vercel.app/ocultar-envios-y-pagos/:page",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
