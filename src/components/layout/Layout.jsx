import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Ticker from '../ui/Ticker'

export default function Layout() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="ambient-glow" />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Ticker />
    </div>
  )
}
