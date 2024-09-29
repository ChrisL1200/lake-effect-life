import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                // Define static names for the output files
                entryFileNames: 'app.js', // For JavaScript
                chunkFileNames: 'app-[name].js', // Optional: name chunks
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') {
                        return 'app.css'; // For CSS
                    }
                    return '[name].[ext]'; // Default for other assets
                },
            },
        },
    },
})
