'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Trophy, Users, Info, Mail, Home } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Tournaments', href: '/tournaments', icon: Users },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-neon-blue/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {!logoError ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden group-hover:scale-110 transition-transform">
                <Image
                  src="/official logo.jpeg"
                  alt="GRIMS Logo"
                  fill
                  className="object-cover"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-red rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="font-display font-bold text-xl">G</span>
              </div>
            )}
            <div className="hidden md:block">
              <div className="font-display font-bold text-xl hover-glow">GRIMS</div>
              <div className="text-xs text-gray-400">Elite CODM Squad</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 rounded-lg hover:bg-neon-blue/10 hover:text-neon-blue transition-all duration-300 flex items-center space-x-2 group"
              >
                <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neon-blue/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-neon-blue/10 hover:text-neon-blue transition-all duration-300 my-1"
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
