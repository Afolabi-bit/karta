const nextConfig = {
  turbopack: {
    resolveAlias: {
      "./enums.js": "./enums.ts",
      "./internal/class.js": "./internal/class.ts",
      "./internal/prismaNamespace.js": "./internal/prismaNamespace.ts",
    },
  },
};
export default nextConfig;
