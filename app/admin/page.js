'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Trophy, Plus, Save, LogOut, AlertCircle, CheckCircle, Calendar, Image as ImageIcon, Upload, X, Edit2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tournaments, setTournaments] = useState([])
  const [players, setPlayers] = useState([])
  const [selectedTournament, setSelectedTournament] = useState('')
  const [results, setResults] = useState([{ player_name: '', points: '' }])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  
  // Tournament creation state
  const [showCreateTournament, setShowCreateTournament] = useState(false)
  const [newTournament, setNewTournament] = useState({
    name: '',
    mode: '',
    start_time: '',
    image_url: '',
    status: 'upcoming'
  })
  
  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  
  // Player management state
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [playerPoints, setPlayerPoints] = useState('')
  
  // Tournament editing state
  const [editingTournament, setEditingTournament] = useState(null)
  const [tournamentStatus, setTournamentStatus] = useState('')

  // Auth
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setIsAuthenticated(true)
      fetchData()
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      setIsAuthenticated(true)
      fetchData()
    } catch (error) {
      setAuthError('Invalid credentials. Please try again.')
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    router.push('/')
  }

  const fetchData = async () => {
    try {
      const [tournamentsRes, playersRes] = await Promise.all([
        supabase.from('tournaments').select('*').order('start_time', { ascending: false }),
        supabase.from('players').select('*').order('player_name')
      ])

      if (tournamentsRes.data) setTournaments(tournamentsRes.data)
      if (playersRes.data) setPlayers(playersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const addResultRow = () => {
    setResults([...results, { player_name: '', points: '' }])
  }

  const updateResult = (index, field, value) => {
    const newResults = [...results]
    newResults[index][field] = value
    setResults(newResults)
  }

  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index))
  }

  const handleSubmitResults = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      // Validate inputs
      const validResults = results.filter(r => r.player_name && r.points)
      if (validResults.length === 0) {
        throw new Error('Please add at least one valid result')
      }

      // Insert tournament results
      const resultsToInsert = validResults.map(r => ({
        tournament_id: selectedTournament,
        player_name: r.player_name,
        points: parseInt(r.points),
        created_at: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('tournament_results')
        .insert(resultsToInsert)

      if (insertError) throw insertError

      // Update player points
      for (const result of validResults) {
        const player = players.find(p => p.player_name === result.player_name)
        if (player) {
          // Update existing player
          const { error: updateError } = await supabase
            .from('players')
            .update({
              total_points: player.total_points + parseInt(result.points),
              updated_at: new Date().toISOString()
            })
            .eq('id', player.id)

          if (updateError) throw updateError
        } else {
          // Create new player
          const { error: createError } = await supabase
            .from('players')
            .insert([{
              player_name: result.player_name,
              total_points: parseInt(result.points),
              rank: 0, // Will be recalculated
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])

          if (createError) throw createError
        }
      }

      // Mark tournament as results entered
      await supabase
        .from('tournaments')
        .update({ results_entered: true, status: 'completed' })
        .eq('id', selectedTournament)

      // Recalculate ranks
      await recalculateRanks()

      setStatus('success')
      setMessage('Tournament results submitted successfully!')
      setResults([{ player_name: '', points: '' }])
      setSelectedTournament('')
      fetchData()

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Failed to submit results. Please try again.')
      console.error('Error submitting results:', error)
    }
  }

  const recalculateRanks = async () => {
    try {
      const { data: allPlayers } = await supabase
        .from('players')
        .select('*')
        .order('total_points', { ascending: false })

      if (allPlayers) {
        for (let i = 0; i < allPlayers.length; i++) {
          await supabase
            .from('players')
            .update({ rank: i + 1 })
            .eq('id', allPlayers[i].id)
        }
      }
    } catch (error) {
      console.error('Error recalculating ranks:', error)
    }
  }

  const handleCreateTournament = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      // If there's a selected file, upload it first
      let finalImageUrl = newTournament.image_url

      if (selectedFile) {
        setUploadingImage(true)
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('tournament-images')
          .upload(filePath, selectedFile)

        if (uploadError) {
          throw new Error('Failed to upload image: ' + uploadError.message)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tournament-images')
          .getPublicUrl(filePath)

        finalImageUrl = publicUrl
        setUploadingImage(false)
      }

      const { error } = await supabase
        .from('tournaments')
        .insert([{
          name: newTournament.name,
          mode: newTournament.mode,
          start_time: new Date(newTournament.start_time).toISOString(),
          image_url: finalImageUrl || null,
          status: newTournament.status,
          results_entered: false
        }])

      if (error) throw error

      setStatus('success')
      setMessage('Tournament created successfully!')
      setNewTournament({
        name: '',
        mode: '',
        start_time: '',
        image_url: '',
        status: 'upcoming'
      })
      setSelectedFile(null)
      setImagePreview('')
      setShowCreateTournament(false)
      fetchData()

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Failed to create tournament.')
      console.error('Error creating tournament:', error)
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatus('error')
        setMessage('Please select an image file (JPG, PNG, WebP, etc.)')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setStatus('error')
        setMessage('Image size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Clear any manual URL
      setNewTournament({...newTournament, image_url: ''})
    }
  }

  const clearImage = () => {
    setSelectedFile(null)
    setImagePreview('')
    setNewTournament({...newTournament, image_url: ''})
  }

  const handleEditPlayer = async (player) => {
    setEditingPlayer(player.id)
    setPlayerPoints(player.total_points.toString())
  }

  const handleSavePlayerPoints = async (playerId) => {
    try {
      const newPoints = parseInt(playerPoints)
      if (isNaN(newPoints) || newPoints < 0) {
        setStatus('error')
        setMessage('Please enter a valid number of points')
        return
      }

      const { error } = await supabase
        .from('players')
        .update({ 
          total_points: newPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', playerId)

      if (error) throw error

      await recalculateRanks()
      await fetchData()
      
      setEditingPlayer(null)
      setPlayerPoints('')
      setStatus('success')
      setMessage('Player points updated successfully!')

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Failed to update player points')
      console.error('Error updating player:', error)
    }
  }

  const handleEditTournamentStatus = (tournament) => {
    setEditingTournament(tournament.id)
    setTournamentStatus(tournament.status)
  }

  const handleSaveTournamentStatus = async (tournamentId) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: tournamentStatus })
        .eq('id', tournamentId)

      if (error) throw error

      await fetchData()
      setEditingTournament(null)
      setTournamentStatus('')
      setStatus('success')
      setMessage('Tournament status updated successfully!')

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Failed to update tournament status')
      console.error('Error updating tournament:', error)
    }
  }

  // Login Screen
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="glass rounded-2xl p-8 max-w-md w-full border border-neon-blue/30">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-neon-blue mx-auto mb-4" />
              <h1 className="font-display font-bold text-3xl mb-2">Admin Access</h1>
              <p className="text-gray-400">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                  placeholder="admin@grims.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                  placeholder="••••••••"
                />
              </div>

              {authError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform"
              >
                Sign In
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Admin Dashboard
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="font-display font-black text-5xl mb-2">
                <span className="hover-glow">Admin Dashboard</span>
              </h1>
              <p className="text-gray-400">Enter tournament results and manage leaderboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 glass rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Status Message */}
          {status === 'success' && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <p className="text-green-400">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="text-red-400">{message}</p>
            </div>
          )}

          {/* Create Tournament Section */}
          <div className="glass rounded-2xl p-8 border border-neon-purple/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl">Manage Tournaments</h2>
              <button
                onClick={() => setShowCreateTournament(!showCreateTournament)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-red rounded-lg hover:scale-105 transition-transform"
              >
                <Plus className="w-5 h-5" />
                <span>{showCreateTournament ? 'Cancel' : 'Create Tournament'}</span>
              </button>
            </div>

            {showCreateTournament && (
              <form onSubmit={handleCreateTournament} className="space-y-6 border-t border-white/10 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tournament Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTournament.name}
                      onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                      className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                      placeholder="e.g., Winter Championship 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Game Mode *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTournament.mode}
                      onChange={(e) => setNewTournament({...newTournament, mode: e.target.value})}
                      className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                      placeholder="e.g., Battle Royale, Team Deathmatch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newTournament.start_time}
                      onChange={(e) => setNewTournament({...newTournament, start_time: e.target.value})}
                      className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={newTournament.status}
                      onChange={(e) => setNewTournament({...newTournament, status: e.target.value})}
                      className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Tournament Image
                  </label>

                  {/* Upload Section */}
                  <div className="space-y-4">
                    {/* File Upload Button */}
                    <div className="relative">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-neon-blue/50 transition-colors bg-dark-card/50 hover:bg-dark-card"
                      >
                        <div className="text-center">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-white font-medium mb-1">Click to upload image</p>
                          <p className="text-gray-400 text-sm">or drag and drop</p>
                          <p className="text-gray-500 text-xs mt-2">PNG, JPG, WebP up to 5MB</p>
                        </div>
                      </label>
                    </div>

                    {/* OR Divider */}
                    {!selectedFile && !imagePreview && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 border-t border-white/10"></div>
                          <span className="text-gray-400 text-sm">OR</span>
                          <div className="flex-1 border-t border-white/10"></div>
                        </div>

                        {/* URL Input Alternative */}
                        <div>
                          <input
                            type="url"
                            value={newTournament.image_url}
                            onChange={(e) => setNewTournament({...newTournament, image_url: e.target.value})}
                            className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                            placeholder="Paste image URL (https://example.com/image.jpg)"
                          />
                        </div>
                      </>
                    )}

                    {/* Image Preview */}
                    {(imagePreview || newTournament.image_url) && (
                      <div className="relative">
                        <p className="text-sm text-gray-400 mb-2">Preview:</p>
                        <div className="relative group">
                          <img 
                            src={imagePreview || newTournament.image_url}
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border border-white/10"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              const errorDiv = e.target.nextElementSibling
                              if (errorDiv) errorDiv.style.display = 'flex'
                            }}
                          />
                          <div className="hidden w-full h-48 bg-red-500/10 border border-red-500/30 rounded-lg items-center justify-center">
                            <div className="text-center">
                              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                              <p className="text-red-400 text-sm">Invalid image</p>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {selectedFile && (
                          <p className="text-gray-400 text-sm mt-2">
                            📁 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting' || uploadingImage}
                  className="w-full px-6 py-4 bg-gradient-to-r from-neon-purple to-neon-red rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Uploading Image...</span>
                    </>
                  ) : status === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Tournament...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>Create Tournament</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Results Entry Form */}
          <div className="glass rounded-2xl p-8 border border-neon-blue/30">
            <h2 className="font-display font-bold text-2xl mb-6">Enter Tournament Results</h2>

            <form onSubmit={handleSubmitResults} className="space-y-6">
              {/* Tournament Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Tournament *
                </label>
                <select
                  required
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                >
                  <option value="">Choose a tournament...</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.mode} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Entries */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Player Results *
                  </label>
                  <button
                    type="button"
                    onClick={addResultRow}
                    className="flex items-center space-x-2 px-3 py-2 glass rounded-lg hover:bg-neon-blue/10 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Player</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Player Name"
                        value={result.player_name}
                        onChange={(e) => updateResult(index, 'player_name', e.target.value)}
                        className="flex-1 px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                        list="playerNames"
                      />
                      <input
                        type="number"
                        placeholder="Points"
                        value={result.points}
                        onChange={(e) => updateResult(index, 'points', e.target.value)}
                        className="w-32 px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                      />
                      {results.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResult(index)}
                          className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-400"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <datalist id="playerNames">
                  {players.map((p) => (
                    <option key={p.id} value={p.player_name} />
                  ))}
                </datalist>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting' || !selectedTournament}
                className="w-full px-6 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {status === 'submitting' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Submit Results & Update Leaderboard</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Player Points Management */}
          <div className="glass rounded-2xl p-8 border border-neon-yellow/30 mb-8">
            <h2 className="font-display font-bold text-2xl mb-6">Manage Player Points</h2>
            
            {players.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No players yet. Add players by entering tournament results.</p>
            ) : (
              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="glass rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-gray-400 font-bold">#{player.rank}</div>
                      <div>
                        <div className="font-display font-bold text-lg">{player.player_name}</div>
                        <div className="text-gray-400 text-sm">
                          Last updated: {new Date(player.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {editingPlayer === player.id ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          value={playerPoints}
                          onChange={(e) => setPlayerPoints(e.target.value)}
                          className="w-32 px-3 py-2 bg-dark-card border border-neon-yellow rounded-lg focus:outline-none text-white"
                          placeholder="Points"
                          min="0"
                        />
                        <button
                          onClick={() => handleSavePlayerPoints(player.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPlayer(null)
                            setPlayerPoints('')
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-display font-bold text-2xl text-neon-blue">
                            {player.total_points.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">points</div>
                        </div>
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5 text-neon-blue" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournament Status Management */}
          <div className="glass rounded-2xl p-8 border border-neon-red/30">
            <h2 className="font-display font-bold text-2xl mb-6">Manage Tournament Status</h2>
            
            {tournaments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tournaments yet. Create one above!</p>
            ) : (
              <div className="space-y-4">
                {tournaments.map((tournament) => (
                  <div key={tournament.id} className="glass rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg mb-1">{tournament.name}</h3>
                        <div className="text-gray-400 text-sm">
                          {tournament.mode} • {new Date(tournament.start_time).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm">Status:</span>
                      {editingTournament === tournament.id ? (
                        <>
                          <select
                            value={tournamentStatus}
                            onChange={(e) => setTournamentStatus(e.target.value)}
                            className="flex-1 px-3 py-2 bg-dark-card border border-neon-red rounded-lg focus:outline-none text-white"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => handleSaveTournamentStatus(tournament.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTournament(null)
                              setTournamentStatus('')
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            tournament.status === 'live' ? 'bg-red-500/20 text-red-500' :
                            tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {tournament.status === 'live' && '🔴 '}
                            {tournament.status}
                          </span>
                          <button
                            onClick={() => handleEditTournamentStatus(tournament)}
                            className="px-4 py-2 bg-neon-red/20 hover:bg-neon-red/30 rounded-lg transition-colors ml-auto"
                          >
                            <Edit2 className="w-5 h-5 text-neon-red" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
