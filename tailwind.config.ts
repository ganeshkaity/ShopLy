import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#f472b6", // Rose 400
                    foreground: "#ffffff",
                    50: "#fdf2f8",
                    100: "#fce7f3",
                    200: "#fbcfe8",
                    300: "#f9a8d4",
                    400: "#f472b6",
                    500: "#ec4899",
                    600: "#db2777",
                    700: "#be185d",
                    800: "#9d174d",
                    900: "#831843",
                },
                secondary: {
                    DEFAULT: "#fecaca", // Red 200 (Blush)
                    foreground: "#7f1d1d",
                    50: "#fef2f2",
                    100: "#fee2e2",
                    200: "#fecaca",
                    300: "#fca5a5",
                    400: "#f87171",
                    500: "#ef4444",
                    600: "#dc2626",
                    700: "#b91c1c",
                    800: "#991b1b",
                    900: "#7f1d1d",
                },
                accent: {
                    DEFAULT: "#fff1f2", // Rose 50
                    foreground: "#9d174d",
                },
                muted: {
                    DEFAULT: "#f3f4f6", // Gray 100
                    foreground: "#6b7280", // Gray 500
                },
                border: "#e5e7eb", // Gray 200
                ring: "#f472b6", // Rose 400
            },
            fontFamily: {
                sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
                serif: ["var(--font-playfair)", "ui-serif", "Georgia"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [],
};
export default config;
