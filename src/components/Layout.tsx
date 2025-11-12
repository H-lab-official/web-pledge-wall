import React from 'react'
// import waveSvg from '../assets/images/pic.svg'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout bg-[#F1E6F2]">
      {/* <div className="background-waves" aria-hidden="true">
        <img src={waveSvg} alt="" className="wave wave-primary" />
        <img src={waveSvg} alt="" className="wave wave-secondary" />
      </div> */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout

