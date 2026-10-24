import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // === Railway Command Interface — Editorial Tech ===
        // Deep charcoal/near-black foundations
        background: {
          DEFAULT: "#0C0C0E",      // Deep obsidian
          subtle: "#111114",       // Slightly elevated surface
          warm: "#16161A",         // Card surface
        },
        surface: {
          DEFAULT: "#1A1A1F",      // Primary card surface
          elevated: "#222228",     // Elevated card / hover
          dim: "#141418",          // Dimmed background panels
        },
        // Glass-style translucent surfaces (dark mode)
        glass: {
          surface: "rgba(26, 26, 31, 0.85)",
          "surface-strong": "rgba(34, 34, 40, 0.92)",
          subtle: "rgba(26, 26, 31, 0.65)",
          border: "rgba(255, 255, 255, 0.08)",
          highlight: "rgba(255, 255, 255, 0.04)",
          dark: "rgba(0, 0, 0, 0.3)",
        },
        // Typography ink colors for dark mode
        ink: {
          DEFAULT: "#F0EDE8",      // Warm ivory / paper white
          muted: "#9CA3AF",        // Muted slate
          subtle: "#6B7280",       // Subtle secondary text
          faint: "#4B5563",        // Faint annotations
        },
        // Accent palette: Signal Orange + Emerald secondary
        accent: {
          emerald: "#10B981",      // Electric emerald — readiness, success
          "emerald-light": "rgba(16, 185, 129, 0.12)",
          "emerald-hover": "#059669",
          coral: "#F97316",        // Signal orange — primary action, CTA
          "coral-light": "rgba(249, 115, 22, 0.12)",
          sky: "#38BDF8",          // Electric blue — informational
          "sky-light": "rgba(56, 189, 248, 0.10)",
          lavender: "#A78BFA",     // Cyber violet accent
          "lavender-light": "rgba(167, 139, 250, 0.10)",
        },
        // Railway-specific tokens
        railway: {
          ac: "#10B981",           // AC class indicator (emerald)
          nonac: "#F59E0B",        // Non-AC class indicator (amber)
        },
        // Semantic status colors
        semantic: {
          success: "#10B981",
          "success-bg": "rgba(16, 185, 129, 0.12)",
          warning: "#F59E0B",
          "warning-bg": "rgba(245, 158, 11, 0.12)",
          error: "#EF4444",
          "error-bg": "rgba(239, 68, 68, 0.12)",
          info: "#38BDF8",
          "info-bg": "rgba(56, 189, 248, 0.10)",
        },
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255, 255, 255, 0.06), 0 4px 24px 0 rgba(0, 0, 0, 0.3)",
        "glass-hover": "0 0 0 1px rgba(255, 255, 255, 0.10), 0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        "glass-card": "0 0 0 1px rgba(255, 255, 255, 0.05), 0 2px 12px 0 rgba(0, 0, 0, 0.25)",
        "glass-elevated": "0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 48px -8px rgba(0, 0, 0, 0.5)",
        "glow-orange": "0 0 24px -4px rgba(249, 115, 22, 0.25)",
        "glow-emerald": "0 0 24px -4px rgba(16, 185, 129, 0.20)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "14px",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        display: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        serif: ["'Instrument Serif'", "'Newsreader'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "float-gentle": "floatGentle 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "draw-line": "drawLine 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        floatGentle: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(-12px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
