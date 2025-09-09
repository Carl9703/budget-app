import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Wy³¹cz ESLint podczas build dla deployment
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Zignoruj b³êdy TypeScript podczas build (opcjonalnie)
        ignoreBuildErrors: false,
    },
}

module.exports = nextConfig

export default nextConfig;
