'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { User, Lock, AlertCircle, CheckCircle, LogIn, Gamepad2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Same hash function as registration
  const hashPassword = async (password) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Hash the entered password
      const passwordHash = await hashPassword(formData.password)

      // Find user with matching username and password hash
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('in_game_name', formData.username.trim())
        .eq('password_hash', passwordHash)
        .single()

      if (profileError || !profile) {
        throw new Error('Invalid username or password')
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', profile.id)

      // Store session in localStorage
      localStorage.setItem('grims_user', JSON.stringify({
        id: profile.id,
        username: profile.in_game_name,
        loginTime: Date.now()
      }))

      setMessage({ type: 'success', text: 'Login successful! Redirecting...' })

      setTimeout(() => {
        router.push(`/profile/${formData.username}`)
        router.refresh()
      }, 1000)

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Invalid username or password' })
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple mb-6 shadow-lg shadow-neon-blue/50">
                <Gamepad2 className="w-10 h-10" />
              </div>
              <h1 className="font-display font-bold text-5xl md:text-6xl mb-3">
                <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red bg-clip-text text-transparent hover-glow">
                  Welcome Back
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Login to GRIMS with your username
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/20 backdrop-blur-xl shadow-2xl animate-slide-up">
              <form onSubmit={handleSubmit} className="space-y-6">
                {message.text && (
                  <div className={`p-4 rounded-xl flex items-center space-x-3 backdrop-blur-sm animate-fade-in ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}>
                    {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    <p>{message.text}</p>
                  </div>
                )}

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
                    Username / IGN
                  </label>
                  <div className="absolute inset-y-0 top-8 left-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-neon-blue transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm text-lg"
                    placeholder="e.g., A~P Glaurios"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">
                    Use your gaming username
                  </p>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
                    Password
                  </label>
                  <div className="absolute inset-y-0 top-8 left-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-neon-purple transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-purple focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm text-lg"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 top-8 right-4 flex items-center text-gray-400 hover:text-neon-purple transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red rounded-xl font-display font-bold text-lg hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 relative overflow-hidden group mt-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-red via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                      <span className="relative z-10">Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Login</span>
                    </>
                  )}
                </button>

                <div className="space-y-4 pt-4">
                  <p className="text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-neon-blue hover:text-neon-purple transition-colors font-bold">
                      Join GRIMS
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            <div className="mt-8 glass rounded-2xl p-6 border border-neon-blue/20 backdrop-blur-sm animate-fade-in">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-neon-blue" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Simple & Fast</h3>
                  <p className="text-sm text-gray-400">
                    Just your username and password to get started.
                  </p>
                  <Link 
                    href="/register"
                    className="inline-flex items-center space-x-2 mt-3 text-neon-blue hover:text-neon-purple transition-colors text-sm font-medium"
                  >
                    <span>Create your account</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
