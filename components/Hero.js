'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Users, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-radial from-neon-blue/10 via-transparent to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl animate-glow-pulse">
            {/* Replace 'logo.png' with your actual logo filename */}
            <Image
              src="/logo.png"
              alt="GRIMS Logo"
              fill
              sizes="128px"
              priority
              className="object-cover"
              onError={(e) => {
                // Fallback to placeholder if logo doesn't exist
                e.target.style.display = 'none'
                e.target.parentElement.classList.add('bg-gradient-to-br', 'from-neon-blue', 'via-neon-purple', 'to-neon-red', 'flex', 'items-center', 'justify-center')
                const fallback = document.createElement('div')
                fallback.className = 'text-center'
                fallback.innerHTML = '<div class="font-display font-black text-4xl">GRIMS</div><div class="text-xs mt-1">Add logo.png to public folder</div>'
                e.target.parentElement.appendChild(fallback)
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl mb-6 animate-slide-up hover-glow">
          <span>GRIMS</span>
        </h1>
        
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl mb-4 text-gray-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Global Recon Invincible Mission Squad
        </h2>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-neon-blue mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          We form alliance to manifest our missions
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass rounded-xl p-6 card-hover">
            <Trophy className="w-12 h-12 text-neon-yellow mx-auto mb-3" />
            <div className="font-display font-bold text-2xl mb-2">Elite Squad</div>
            <p className="text-gray-400 text-sm">Top-tier CODM players</p>
          </div>
          
          <div className="glass rounded-xl p-6 card-hover">
            <Users className="w-12 h-12 text-neon-blue mx-auto mb-3" />
            <div className="font-display font-bold text-2xl mb-2">Active Community</div>
            <p className="text-gray-400 text-sm">Join competitive tournaments</p>
          </div>
          
          <div className="glass rounded-xl p-6 card-hover">
            <Zap className="w-12 h-12 text-neon-red mx-auto mb-3" />
            <div className="font-display font-bold text-2xl mb-2">Intense Action</div>
            <p className="text-gray-400 text-sm">Fast-paced battles daily</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/tournaments"
            className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-neon-blue/50"
          >
            View Tournaments
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 glass rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform neon-border hover-glow group"
          >
            <span className="group-hover:neon-glow">See Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-red/5 rounded-full blur-3xl"></div>
    </section>
  )
}
