/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set Turbopack root to this project to avoid wrong root inference
  turbopack: {
    root: ".",
  },
}

export default nextConfig
