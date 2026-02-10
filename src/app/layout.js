import './globals.scss'
import { GlobalStateProvider } from '@/context/GlobalStateProvider'
import Drawer from '@/components/Drawer/Drawer'

export const metadata = {
  title: 'img-fx',
  description: 'Free minimalist image effects tool'
}

export default function RootLayout ({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalStateProvider>
          <div className="container">
            <Drawer />
            {children}
          </div>
        </GlobalStateProvider>
      </body>
    </html>
  )
}
