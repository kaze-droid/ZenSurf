/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{tsx,html}", "./src/*.{tsx,html}"],
    darkMode: "media",
    theme: {
        extend: {
            colors: {
                "background": "#0f0f10",
                "muted": "#878788",
                "container": "#111112",
                "container-outline": "#212122",
                "primary": "#df3f17",
                "primary-light": "#ef552f",
                "secondary": "#8cffee",
                "highlight": "#b93615",
                // Shadcn colors
                destructive: {
                    DEFAULT: "hsl(0 65% 51%)",
                    foreground: "hsl(210 40% 98%)",
                },
            },
            keyframes: {
                'pulse-dot': {
                    '0%, 100%': {
                        boxShadow: '0 0 0 0 rgba(140, 255, 51, 0)'
                    },
                    '50%': {
                        boxShadow: '0 0 12px 3px rgba(140, 255, 51, 0.6)'
                    }
                }
            },
            animation: {
                'pulse-dot': 'pulse-dot 2s ease-in-out infinite'
            }
        }
    }
}
