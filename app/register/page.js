'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { User, Lock, Gamepad2, Trophy, Users, Target, AlertCircle, CheckCircle, Upload, X, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    gameLevel: '',
    clan: '',
    mainWeapon: '',
    favoriteMode: '',
    bio: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'gameLevel') {
      let level = parseInt(value) || 0
      if (level > 400) level = 400
      if (level < 1 && value !== '') level = 1
      
      setFormData({
        ...formData,
        [name]: level.toString()
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
        return
      }

      setSelectedAvatar(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearAvatar = () => {
    setSelectedAvatar(null)
    setAvatarPreview('')
  }

  // Simple hash function for passwords
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
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      if (!formData.username.trim()) {
        throw new Error('Username is required')
      }

      const level = parseInt(formData.gameLevel)
      if (!level || level < 1 || level > 400) {
        throw new Error('Game level must be between 1 and 400')
      }

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('in_game_name')
        .eq('in_game_name', formData.username.trim())
        .single()

      if (existingUser) {
        throw new Error('Username already taken. Please choose another one.')
      }

      // Hash the password
      const passwordHash = await hashPassword(formData.password)

      // Upload avatar if selected
      let avatarUrl = null
      if (selectedAvatar) {
        const timestamp = Date.now()
        const fileExt = selectedAvatar.name.split('.').pop()
        const fileName = `${formData.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${timestamp}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('player-avatars')
          .upload(fileName, selectedAvatar)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('player-avatars')
            .getPublicUrl(fileName)
          
          avatarUrl = publicUrl
        }
      }

      // Create user profile with hashed password
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          in_game_name: formData.username.trim(),
          password_hash: passwordHash,
          game_level: level,
          clan: formData.clan.trim() || null,
          main_weapon: formData.mainWeapon.trim() || null,
          favorite_mode: formData.favoriteMode.trim() || null,
          bio: formData.bio.trim() || null,
          avatar_url: avatarUrl,
          is_public: true
        }])

      if (profileError) throw profileError

      // Success!
      setMessage({ 
        type: 'success', 
        text: 'Account created! Redirecting to login...' 
      })

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-4">
              <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red bg-clip-text text-transparent hover-glow">
                Join GRIMS
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Create your player account - Simple & Fast!
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/20 backdrop-blur-xl shadow-2xl animate-slide-up">
              <form onSubmit={handleSubmit} className="space-y-8">
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

                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Profile Avatar <span className="text-gray-500">(Optional)</span>
                  </label>
                  
                  {!avatarPreview ? (
                    <>
                      <input type="file" id="avatarUpload" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                      <label htmlFor="avatarUpload" className="group relative inline-flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-white/30 rounded-full cursor-pointer hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-neon-blue transition-colors mb-2" />
                        <p className="text-white text-xs font-medium">Upload</p>
                        <p className="text-gray-500 text-xs">Max 5MB</p>
                      </label>
                    </>
                  ) : (
                    <div className="relative inline-block group">
                      <img src={avatarPreview} alt="Avatar preview" className="w-32 h-32 rounded-full object-cover border-4 border-neon-blue/50 shadow-lg shadow-neon-blue/20" />
                      <button type="button" onClick={clearAvatar} className="absolute -top-2 -right-2 bg-red-500/90 hover:bg-red-500 p-2 rounded-full transition-colors shadow-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <h3 className="font-display font-bold text-xl text-neon-blue mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Account Details
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400 group-focus-within:text-neon-blue transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                        placeholder="Username / IGN (e.g., A~P Glaurios)"
                      />
                      <p className="text-xs text-gray-500 mt-2 ml-1">This will be your login username</p>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-neon-blue transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                        placeholder="Password (min 6 characters)"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-neon-blue transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-neon-blue transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                        placeholder="Confirm password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-neon-blue transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-neon-purple flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Game Profile
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Trophy className="w-5 h-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                        </div>
                        <input
                          type="number"
                          name="gameLevel"
                          value={formData.gameLevel}
                          onChange={handleChange}
                          required
                          min="1"
                          max="400"
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                          placeholder="Level (1-400)"
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Users className="w-5 h-5 text-gray-400 group-focus-within:text-neon-purple transition-colors" />
                        </div>
                        <input type="text" name="clan" value={formData.clan} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-purple focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm" placeholder="Clan (Optional)" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Target className="w-5 h-5 text-gray-400 group-focus-within:text-neon-blue transition-colors" />
                        </div>
                        <input type="text" name="mainWeapon" value={formData.mainWeapon} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm" placeholder="Main Weapon" />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Gamepad2 className="w-5 h-5 text-gray-400 group-focus-within:text-neon-purple transition-colors" />
                        </div>
                        <select name="favoriteMode" value={formData.favoriteMode} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-purple focus:bg-white/10 transition-all text-white backdrop-blur-sm appearance-none">
                          <option value="" className="bg-dark-bg">Favorite Mode</option>
                          <option value="Battle Royale" className="bg-dark-bg">Battle Royale</option>
                          <option value="Multiplayer" className="bg-dark-bg">Multiplayer</option>
                          <option value="Ranked" className="bg-dark-bg">Ranked</option>
                          <option value="Team Deathmatch" className="bg-dark-bg">Team Deathmatch</option>
                          <option value="Search & Destroy" className="bg-dark-bg">Search & Destroy</option>
                          <option value="Domination" className="bg-dark-bg">Domination</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" maxLength="200" className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-purple focus:bg-white/10 transition-all text-white placeholder-gray-500 resize-none backdrop-blur-sm" placeholder="Bio (Optional - Tell us about yourself)" />
                      <p className="text-xs text-gray-500 mt-2 text-right">{formData.bio.length}/200</p>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full px-6 py-5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red rounded-xl font-display font-bold text-lg hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-red via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                      <span className="relative z-10">Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Create Account</span>
                    </>
                  )}
                </button>

                <p className="text-center text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-neon-blue hover:text-neon-purple transition-colors font-bold">
                    Login here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
