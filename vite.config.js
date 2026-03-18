import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const manualChunks = (id) => {
  if (!id.includes('node_modules')) return null

  if (
    id.includes('react-router') ||
    id.includes('/react/') ||
    id.includes('/react-dom/')
  ) {
    return 'vendor-react'
  }

  if (
    id.includes('chart.js') ||
    id.includes('react-chartjs-2') ||
    id.includes('recharts')
  ) {
    return 'vendor-charts'
  }

  if (
    id.includes('jspdf') ||
    id.includes('jspdf-autotable') ||
    id.includes('exceljs') ||
    id.includes('html2canvas') ||
    id.includes('file-saver')
  ) {
    return 'vendor-reports'
  }

  if (
    id.includes('framer-motion') ||
    id.includes('gsap') ||
    id.includes('swiper')
  ) {
    return 'vendor-motion'
  }

  if (
    id.includes('react-big-calendar') ||
    id.includes('react-datepicker') ||
    id.includes('react-select') ||
    id.includes('date-fns') ||
    id.includes('moment')
  ) {
    return 'vendor-calendar'
  }

  if (
    id.includes('formik') ||
    id.includes('yup') ||
    id.includes('sweetalert2') ||
    id.includes('axios') ||
    id.includes('dompurify')
  ) {
    return 'vendor-utils'
  }

  return null
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    port: 5173,
  },
})
