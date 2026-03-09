module.exports = {
  content: [
    "./site/**/*.{html,js,ts,tsx,mdx}",
    "./docs/design/reference/**/*.{ts,tsx,js}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)"
        },
        neutral: {
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)"
        },
        accent: {
          500: "var(--color-accent-500)",
          700: "var(--color-accent-700)"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["Source Code Pro", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        soft: "var(--shadow-md)",
        deep: "var(--shadow-lg)"
      }
    }
  }
};
