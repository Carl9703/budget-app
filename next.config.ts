import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Wy��cz ESLint podczas build dla deployment
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Zignoruj b��dy TypeScript podczas build (opcjonalnie)
        ignoreBuildErrors: false,
    },
}

module.exports = nextConfig

export default nextConfig;
