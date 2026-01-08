'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Trophy, Users, Info, Mail, Home, User, LogIn, LogOut, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    
    // Listen for storage changes (for real-time updates across tabs)
    window.addEventListener('storage', checkUser)
    
    return () => {
      window.removeEventListener('storage', checkUser)
    }
  }, [])

  const checkUser = async () => {
    try {
      // Check localStorage for logged in user
      const userData = localStorage.getItem('grims_user')
      
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Fetch full profile from database
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('in_game_name, avatar_url, id')
          .eq('in_game_name', parsedUser.username)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Check user error:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('grims_user')
    
    // Update state
    setUser(null)
    setProfile(null)
    
    // Redirect to home
    router.push('/')
    router.refresh()
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'G'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {!logoError ? (
              <Image
                src="/official logo.jpeg"
                alt="GRIMS"
                width={50}
                height={50}
                className="transition-transform group-hover:scale-110"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                <Trophy className="w-6 h-6" />
              </div>
            )}
            <span className="font-display font-bold text-2xl hover-glow hidden sm:block">GRIMS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="nav-link flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link href="/leaderboard" className="nav-link flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            <Link href="/tournaments" className="nav-link">Tournaments</Link>
            <Link href="/players" className="nav-link flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Players</span>
            </Link>
            <Link href="/registered-players" className="nav-link flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Community</span>
            </Link>
            <Link href="/about" className="nav-link flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link href="/contact" className="nav-link flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-10 h-10 border-2 border-white/20 border-t-neon-blue rounded-full animate-spin"></div>
            ) : user && profile ? (
              // Logged in - Show profile + logout
              <>
                <Link 
                  href={`/profile/${profile.in_game_name}`}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-all group"
                >
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.in_game_name}
                      className="w-10 h-10 rounded-full border-2 border-neon-blue/50 group-hover:border-neon-blue transition-colors object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center border-2 border-neon-blue/50 group-hover:border-neon-blue transition-colors">
                      <span className="font-bold text-lg">{getInitial(profile.in_game_name)}</span>
                    </div>
                  )}
                  <span className="font-bold text-white group-hover:text-neon-blue transition-colors">
                    {profile.in_game_name}
                  </span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Logged out - Show login + join
              <>
                <Link 
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                
                <Link 
                  href="/register"
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join GRIMS</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/10 animate-fade-in">
            <Link 
              href="/" 
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </div>
            </Link>
            
            <Link 
              href="/leaderboard" 
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5" />
                <span>Leaderboard</span>
              </div>
            </Link>
            
            <Link 
              href="/tournaments" 
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Tournaments
            </Link>
            
            <Link 
              href="/players" 
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>Players</span>
              </div>
            </Link>
            
            <Link 
              href="/registered-players" 
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>Community</span>
              </div>
            </Link>
            
            <Link 
              href="/about" 
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5" />
                <span>About</span>
              </div>
            </Link>
            
            <Link 
              href="/contact" 
              className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <span>Contact</span>
              </div>
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-neon-blue rounded-full animate-spin"></div>
                </div>
              ) : user && profile ? (
                // Logged in
                <>
                  <Link 
                    href={`/profile/${profile.in_game_name}`}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.in_game_name}
                        className="w-10 h-10 rounded-full border-2 border-neon-blue/50 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center border-2 border-neon-blue/50">
                        <span className="font-bold">{getInitial(profile.in_game_name)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white">{profile.in_game_name}</p>
                      <p className="text-xs text-gray-400">View Profile</p>
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                // Logged out
                <>
                  <Link 
                    href="/login"
                    className="flex items-center justify-center space-x-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  
                  <Link 
                    href="/register"
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Join GRIMS</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
