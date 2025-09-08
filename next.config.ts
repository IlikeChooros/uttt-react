import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	output: 'export',
	trailingSlash: true,
	images: {
		unoptimized: true,
	},

	rewrites: async () => {
		return [
			{
				source: '/api/:path*',
				destination: 'http://localhost:8080/api/:path*', // Proxy to Backend
			},
		];
	},
};

export default nextConfig;
