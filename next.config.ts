import type { NextConfig } from "next";

// Allow next/image to load files from the Supabase Storage bucket "media".
function supabaseImagePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    const u = new URL(raw);
    return [
      {
        protocol: u.protocol.replace(":", "") as "http" | "https",
        hostname: u.hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseImagePatterns(),
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
    // Several root layouts and no app/layout.tsx: a global 404 (app/global-not-found.tsx) renders its own <html>.
    globalNotFound: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: baseSecurityHeaders },
      {
        // The admin URL is a curtain, not the lock. These headers keep it out of search
        // engines and out of frames. The real lock is Supabase Auth + RLS + middleware.
        source: "/abdullah/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
