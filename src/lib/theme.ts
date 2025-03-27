export const theme = {
  colors: {
    primary: {
      DEFAULT: "rgb(147, 51, 234)", // Roxo (purple-600)
      foreground: "rgb(250, 250, 250)",
      hover: "rgb(126, 34, 206)", // Roxo mais escuro (purple-700)
      muted: "rgb(233, 213, 255)", // Roxo claro (purple-100)
    },
    background: {
      DEFAULT: "rgb(255, 255, 255)",
      muted: "rgb(245, 245, 245)",
    },
    foreground: {
      DEFAULT: "rgb(24, 24, 27)",
      muted: "rgb(113, 113, 122)",
    },
    border: {
      DEFAULT: "rgb(228, 228, 231)",
      hover: "rgb(212, 212, 216)",
    },
    input: {
      DEFAULT: "rgb(228, 228, 231)",
      hover: "rgb(212, 212, 216)",
      focus: "rgb(147, 51, 234)", // Roxo (purple-600)
    },
  },
  borderRadius: {
    sm: "0.375rem", // 6px
    DEFAULT: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
  },
  spacing: {
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
}; 