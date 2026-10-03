import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las páginas de la app se mudaron al sitio de Mingo (03/10); las direcciones viejas siguen andando.
  async redirects() {
    return [
      {
        source: "/:lang/tiendanube/ocultar-envios-y-pagos/:page",
        destination: "https://mingo-apps.vercel.app/ocultar-envios-y-pagos/:page",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
