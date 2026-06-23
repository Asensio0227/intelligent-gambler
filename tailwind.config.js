/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        'text-base': '#f1f5f9',
        'text-muted': '#94a3b8',
      },
    },
  },
  plugins: [],
};
