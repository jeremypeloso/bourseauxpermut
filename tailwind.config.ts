import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F1B33', navy2: '#1B2D52', bleu: '#1E6BFF', bleud: '#1B4FD6',
        mint: '#22B573', coral: '#E8232B', amber: '#F2A900', paper: '#EEF2F8',
      },
      borderRadius: { xl2: '20px', xl3: '26px' },
    },
  },
  plugins: [],
};
export default config;
