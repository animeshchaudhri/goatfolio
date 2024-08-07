import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "button-gradient":
          "linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2) 40%, rgba(39, 71, 86, 0.5) 50%, rgba(39, 71, 86, 0.1) 90%, rgba(255, 255, 255, 0.5))",
        glassy:
          "linear-gradient(rgba(0, 0, 0, 0.333), rgba(0, 0, 0, 0.533) 15%, rgba(0, 0, 0, 0.533) 60%, rgba(0, 0, 0, 0.133))",
      },
      keyframes: {
        slideDown: {
          "0%": { transform: "translateY(-10%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        slideDown: "slideDown 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
