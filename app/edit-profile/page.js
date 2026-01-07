'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { User, Trophy, Users, Target, Gamepad2, Upload, X, Save, ArrowLeft, AlertCircle, CheckCircle, Camera, Eye, EyeOff, Trash2 } from 'lucide-react'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentUser, setCurrentUser] = useState(null)
  const [currentProfile, setCurrentProfile] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    gameLevel: '',
    clan: '',
    mainWeapon: '',
    favoriteMode: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = localStorage.getItem('grims_user')
      if (!userData) {
        router.push('/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      setCurrentUser(parsedUser)

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('in_game_name', parsedUser.username)
        .single()

      if (error) throw error

      if (profile) {
        setCurrentProfile(profile)
        setFormData({
          gameLevel: profile.game_level?.toString() || '',
          clan: profile.clan || '',
          mainWeapon: profile.main_weapon || '',
          favoriteMode: profile.favorite_mode || '',
          bio: profile.bio || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setAvatarPreview(profile.avatar_url || '')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

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
      setRemoveAvatar(false)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null)
    setAvatarPreview('')
    setRemoveAvatar(true)
  }

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
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const level = parseInt(formData.gameLevel)
      if (!level || level < 1 || level > 400) {
        throw new Error('Game level must be between 1 and 400')
      }

      // Handle password change if requested
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Please enter your current password')
        }

        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match')
        }

        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters')
        }

        // Verify current password
        const currentPasswordHash = await hashPassword(formData.currentPassword)
        if (currentPasswordHash !== currentProfile.password_hash) {
          throw new Error('Current password is incorrect')
        }

        // Hash new password
        const newPasswordHash = await hashPassword(formData.newPassword)
        
        // Update password
        await supabase
          .from('user_profiles')
          .update({ password_hash: newPasswordHash })
          .eq('id', currentProfile.id)
      }

      // Handle avatar
      let avatarUrl = currentProfile.avatar_url
      
      if (removeAvatar) {
        // Delete avatar from storage
        if (currentProfile.avatar_url) {
          const urlParts = currentProfile.avatar_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          await supabase.storage
            .from('player-avatars')
            .remove([fileName])
        }
        avatarUrl = null
      } else if (selectedAvatar) {
        // Delete old avatar if exists
        if (currentProfile.avatar_url) {
          const urlParts = currentProfile.avatar_url.split('/')
          const oldFileName = urlParts[urlParts.length - 1]
          await supabase.storage
            .from('player-avatars')
            .remove([oldFileName])
        }

        // Upload new avatar
        const timestamp = Date.now()
        const fileExt = selectedAvatar.name.split('.').pop()
        const fileName = `${currentUser.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${timestamp}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('player-avatars')
          .upload(fileName, selectedAvatar)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('player-avatars')
          .getPublicUrl(fileName)
        
        avatarUrl = publicUrl
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          game_level: level,
          clan: formData.clan.trim() || null,
          main_weapon: formData.mainWeapon.trim() || null,
          favorite_mode: formData.favoriteMode || null,
          bio: formData.bio.trim() || null,
          avatar_url: avatarUrl
        })
        .eq('id', currentProfile.id)

      if (updateError) throw updateError

      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      })

      // Refresh profile data
      setTimeout(() => {
        router.push(`/profile/${currentUser.username}`)
      }, 1500)

    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      console.error('Update error:', error)
    } finally {
      setSaving(false)
    }
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'G'
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-20 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </>
    )
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
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Link 
              href={`/profile/${currentUser?.username}`}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-neon-blue transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Link>
            <h1 className="font-display font-bold text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red bg-clip-text text-transparent hover-glow">
                Edit Profile
              </span>
            </h1>
            <p className="text-gray-400 text-lg mt-2">
              Update your gaming profile and settings
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
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

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Profile Avatar
                  </label>
                  
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Current Avatar Preview */}
                    <div className="relative">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-neon-blue/50 shadow-lg shadow-neon-blue/20"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center border-4 border-neon-blue/50">
                          <span className="text-4xl font-bold">{getInitial(currentUser?.username)}</span>
                        </div>
                      )}
                      
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 bg-red-500/90 hover:bg-red-500 p-2 rounded-full transition-colors shadow-lg group"
                          title="Remove avatar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1 text-center md:text-left">
                      <input
                        type="file"
                        id="avatarUpload"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatarUpload"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/50 rounded-lg cursor-pointer transition-all group"
                      >
                        <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">
                          {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG or GIF. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Game Profile Section */}
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-neon-purple flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Game Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Level (1-400) *
                      </label>
                      <div className="absolute inset-y-0 top-8 left-4 flex items-center pointer-events-none">
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
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                        placeholder="Enter level"
                      />
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Clan
                      </label>
                      <div className="absolute inset-y-0 top-8 left-4 flex items-center pointer-events-none">
                        <Users className="w-5 h-5 text-gray-400 group-focus-within:text-neon-purple transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="clan"
                        value={formData.clan}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-purple focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                        placeholder="Enter clan name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Main Weapon
                      </label>
                      <div className="absolute inset-y-0 top-8 left-4 flex items-center pointer-events-none">
                        <Target className="w-5 h-5 text-gray-400 group-focus-within:text-neon-blue transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="mainWeapon"
                        value={formData.mainWeapon}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                        placeholder="e.g., AK-47, M4A1"
                      />
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Favorite Mode
                      </label>
                      <div className="absolute inset-y-0 top-8 left-4 flex items-center pointer-events-none">
                        <Gamepad2 className="w-5 h-5 text-gray-400 group-focus-within:text-neon-purple transition-colors" />
                      </div>
                      <select
                        name="favoriteMode"
                        value={formData.favoriteMode}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-purple focus:bg-white/10 transition-all text-white backdrop-blur-sm appearance-none"
                      >
                        <option value="" className="bg-dark-bg">Select mode</option>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      maxLength="200"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-purple focus:bg-white/10 transition-all text-white placeholder-gray-500 resize-none backdrop-blur-sm"
                      placeholder="Tell everyone about yourself..."
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {formData.bio.length}/200
                    </p>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="border-t border-white/10 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <span className="font-medium">Change Password</span>
                    <span className="text-sm text-gray-400">
                      {showPasswordSection ? 'Hide' : 'Show'}
                    </span>
                  </button>

                  {showPasswordSection && (
                    <div className="mt-4 space-y-4 animate-fade-in">
                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 top-8 right-4 flex items-center text-gray-400 hover:text-neon-blue transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          minLength={6}
                          className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                          placeholder="Enter new password (min 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 top-8 right-4 flex items-center text-gray-400 hover:text-neon-blue transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500 backdrop-blur-sm"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 top-8 right-4 flex items-center text-gray-400 hover:text-neon-blue transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red rounded-xl font-display font-bold text-lg hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-red via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                        <span className="relative z-10">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Save Changes</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/profile/${currentUser?.username}`}
                    className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
