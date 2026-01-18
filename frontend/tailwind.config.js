/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                fontFamily: {
                        'orbitron': ['Orbitron', 'sans-serif'],
                        'mono': ['Share Tech Mono', 'monospace'],
                },
                colors: {
                        'cyber-black': '#050505',
                        'cyber-gray': '#0a0a0f',
                        'cyber-surface': '#151520',
                        'neon-cyan': '#00f3ff',
                        'neon-pink': '#ff00ff',
                        'neon-yellow': '#fcee0a',
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                boxShadow: {
                        'neon-cyan': '0 0 5px #00f3ff, 0 0 10px #00f3ff, 0 0 20px #00f3ff',
                        'neon-pink': '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff',
                        'neon-yellow': '0 0 5px #fcee0a, 0 0 10px #fcee0a',
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        },
                        'pulse-neon': {
                                '0%, 100%': { boxShadow: '0 0 5px #00f3ff, 0 0 10px #00f3ff' },
                                '50%': { boxShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff' }
                        },
                        'glitch': {
                                '0%': { transform: 'translate(0)' },
                                '20%': { transform: 'translate(-2px, 2px)' },
                                '40%': { transform: 'translate(-2px, -2px)' },
                                '60%': { transform: 'translate(2px, 2px)' },
                                '80%': { transform: 'translate(2px, -2px)' },
                                '100%': { transform: 'translate(0)' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
                        'glitch': 'glitch 0.3s ease-in-out'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
