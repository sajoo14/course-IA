/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'justi-blue': '#2563eb',
                'justi-light': '#eff6ff',
            }
        },
    },
    plugins: [],
}
