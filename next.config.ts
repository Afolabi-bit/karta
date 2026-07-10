const nextConfig = {
  webpack: (config: any) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".js"],
    };
    return config;
  },
};
export default nextConfig;
