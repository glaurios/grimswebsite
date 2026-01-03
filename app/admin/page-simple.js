'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Trophy, Plus, Save, LogOut, AlertCircle, CheckCircle, Calendar, Edit2, X } from 'lucide-react'
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
    description: '',
    winner: '',
    status: 'upcoming'
  })
  
  // Player management
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [playerPoints, setPlayerPoints] = useState('')
  
  // Tournament editing
  const [editingTournament, setEditingTournament] = useState(null)
  const [editTournamentData, setEditTournamentData] = useState({
    name: '',
    mode: '',
    start_time: '',
    image_url: '',
    description: '',
    winner: '',
    status: 'upcoming'
  })

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

  const fetchData = async () => {
    const { data: tournamentsData } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_time', { ascending: false })

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .order('rank', { ascending: true })

    if (tournamentsData) setTournaments(tournamentsData)
    if (playersData) setPlayers(playersData)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setAuthError(error.message)
    } else {
      setIsAuthenticated(true)
      fetchData()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    router.push('/')
  }

  const handleCreateTournament = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      const { error } = await supabase
        .from('tournaments')
        .insert([{
          name: newTournament.name,
          mode: newTournament.mode,
          start_time: new Date(newTournament.start_time).toISOString(),
          image_url: newTournament.image_url || null,
          description: newTournament.description || null,
          winner: newTournament.winner || null,
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
        description: '',
        winner: '',
        status: 'upcoming'
      })
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
    }
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

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament.id)
    setEditTournamentData({
      name: tournament.name,
      mode: tournament.mode,
      start_time: new Date(tournament.start_time).toISOString().slice(0, 16),
      image_url: tournament.image_url || '',
      description: tournament.description || '',
      winner: tournament.winner || '',
      status: tournament.status
    })
  }

  const handleSaveTournament = async (tournamentId) => {
    try {
      setStatus('submitting')
      
      const { error } = await supabase
        .from('tournaments')
        .update({
          name: editTournamentData.name,
          mode: editTournamentData.mode,
          start_time: new Date(editTournamentData.start_time).toISOString(),
          image_url: editTournamentData.image_url || null,
          description: editTournamentData.description || null,
          winner: editTournamentData.winner || null,
          status: editTournamentData.status
        })
        .eq('id', tournamentId)

      if (error) throw error

      await fetchData()
      setEditingTournament(null)
      setStatus('success')
      setMessage('Tournament updated successfully!')

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Failed to update tournament')
      console.error('Error updating tournament:', error)
    }
  }

  const addResult = () => {
    setResults([...results, { player_name: '', points: '' }])
  }

  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index))
  }

  const updateResult = (index, field, value) => {
    const updated = [...results]
    updated[index][field] = value
    setResults(updated)
  }

  const handleSubmitResults = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      const tournament = tournaments.find(t => t.id === selectedTournament)
      if (!tournament) throw new Error('Tournament not found')

      for (const result of results) {
        if (!result.player_name || !result.points) continue

        await supabase
          .from('tournament_results')
          .insert([{
            tournament_id: selectedTournament,
            player_name: result.player_name,
            points: parseInt(result.points)
          }])

        const { data: existingPlayer } = await supabase
          .from('players')
          .select('*')
          .eq('player_name', result.player_name)
          .single()

        if (existingPlayer) {
          await supabase
            .from('players')
            .update({
              total_points: existingPlayer.total_points + parseInt(result.points),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPlayer.id)
        } else {
          await supabase
            .from('players')
            .insert([{
              player_name: result.player_name,
              total_points: parseInt(result.points),
              rank: 0
            }])
        }
      }

      await supabase
        .from('tournaments')
        .update({
          results_entered: true,
          status: 'completed'
        })
        .eq('id', selectedTournament)

      await recalculateRanks()
      await fetchData()
      
      setStatus('success')
      setMessage('Results submitted successfully!')
      setSelectedTournament('')
      setResults([{ player_name: '', points: '' }])

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Failed to submit results')
      console.error('Error submitting results:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-20 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 w-full max-w-md">
            <h1 className="font-display font-bold text-3xl text-center mb-8">
              <span className="hover-glow">Admin Login</span>
            </h1>

            <form onSubmit={handleLogin} className="space-y-6">
              {authError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform"
              >
                Login
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="font-display font-bold text-4xl">
              <span className="hover-glow">Admin Dashboard</span>
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 glass rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Status Messages */}
          {message && (
            <div className={`mb-8 p-4 rounded-lg flex items-center space-x-3 ${
              status === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' :
              status === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
              'bg-blue-500/20 border border-blue-500/50 text-blue-400'
            }`}>
              {status === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <p>{message}</p>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newTournament.image_url}
                    onChange={(e) => setNewTournament({...newTournament, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {newTournament.image_url && (
                    <img 
                      src={newTournament.image_url} 
                      alt="Preview" 
                      className="mt-3 w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTournament.description}
                    onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white resize-none"
                    placeholder="Tournament details, rules, prize information, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Winner (Optional - for completed tournaments)
                  </label>
                  <input
                    type="text"
                    value={newTournament.winner}
                    onChange={(e) => setNewTournament({...newTournament, winner: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                    placeholder="e.g., AP*Gilgal"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full px-6 py-4 bg-gradient-to-r from-neon-purple to-neon-red rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
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

          {/* Results Entry Section - Keep existing code */}
          {/* ... Rest of admin dashboard ... */}
          
        </div>
      </main>
      <Footer />
    </>
  )
}
