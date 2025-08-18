/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css,html}", // Include .css for index.css
  ],
  safelist: [
    'bg-cyber-gray',
    'bg-cyber-black',
    'bg-cyber-dark',
    'text-cyber-blue',
    'border-cyber-blue',
    'text-white/90',
    'bg-white',
    'text-cyber-purple',
    'matrix-rain',
    'animate-matrix',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0a0a',
          dark: '#1a1a1a',
          gray: '#2a2a2a',
          green: '#00ff41',
          red: '#ff0040',
          yellow: '#ffff00',
          blue: '#00d4ff',
          purple: '#bd00ff',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'matrix': 'matrix 20s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41' },
          '100%': { boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
        matrix: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
    },
  },
  plugins: [],
};