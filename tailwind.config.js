/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#000000',
                surface: '#121212',
                surfaceHighlight: '#1C1C1E',
                primary: '#10B981',
                textPrimary: '#FFFFFF',
                textSecondary: '#525252',
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
            },
            borderRadius: {
                'xl': '12px',
            }
        },
    },
    plugins: [],
}
