'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Users, Edit, Save, X, Trophy, Target, Award, TrendingUp, Search, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminPlayersPage() {
  const router = useRouter()
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [editForm, setEditForm] = useState({
    game_level: '',
    clan: '',
    main_weapon: '',
    favorite_mode: '',
    bio: '',
    // Stats
    leaderboard_rank: '',
    total_points: '',
    total_tournaments: '',
    total_wins: '',
    best_rank: '',
    win_rate: '',
    avg_points_per_tournament: ''
  })

  useEffect(() => {
    checkAdmin()
    fetchPlayers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = players.filter(player =>
        player.in_game_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.clan && player.clan.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredPlayers(filtered)
    } else {
      setFilteredPlayers(players)
    }
  }, [searchTerm, players])

  const checkAdmin = () => {
    // Simple admin check - you can make this more sophisticated
    const userData = localStorage.getItem('grims_user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    // Optional: Check if user is admin (you can add an is_admin column to user_profiles)
    const user = JSON.parse(userData)
    // For now, we'll allow any logged-in user to access admin
    // You can add: if (user.username !== 'admin') router.push('/')
  }

  const fetchPlayers = async () => {
    try {
      // Fetch players with their stats
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          player_stats (*)
        `)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Flatten the data structure
      const playersWithStats = profilesData.map(profile => ({
        ...profile,
        stats: profile.player_stats?.[0] || null
      }))

      setPlayers(playersWithStats)
      setFilteredPlayers(playersWithStats)
    } catch (error) {
      console.error('Error fetching players:', error)
      setMessage({ type: 'error', text: 'Failed to load players' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (player) => {
    setEditingPlayer(player.id)
    setEditForm({
      game_level: player.game_level?.toString() || '',
      clan: player.clan || '',
      main_weapon: player.main_weapon || '',
      favorite_mode: player.favorite_mode || '',
      bio: player.bio || '',
      leaderboard_rank: player.stats?.leaderboard_rank?.toString() || '',
      total_points: player.stats?.total_points?.toString() || '0',
      total_tournaments: player.stats?.total_tournaments?.toString() || '0',
      total_wins: player.stats?.total_wins?.toString() || '0',
      best_rank: player.stats?.best_rank?.toString() || '',
      win_rate: player.stats?.win_rate?.toString() || '0',
      avg_points_per_tournament: player.stats?.avg_points_per_tournament?.toString() || '0'
    })
    setMessage({ type: '', text: '' })
  }

  const handleCancel = () => {
    setEditingPlayer(null)
    setEditForm({
      game_level: '',
      clan: '',
      main_weapon: '',
      favorite_mode: '',
      bio: '',
      leaderboard_rank: '',
      total_points: '',
      total_tournaments: '',
      total_wins: '',
      best_rank: '',
      win_rate: '',
      avg_points_per_tournament: ''
    })
    setMessage({ type: '', text: '' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }

  const handleSave = async (player) => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const level = parseInt(editForm.game_level)
      if (!level || level < 1 || level > 400) {
        throw new Error('Game level must be between 1 and 400')
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          game_level: level,
          clan: editForm.clan.trim() || null,
          main_weapon: editForm.main_weapon.trim() || null,
          favorite_mode: editForm.favorite_mode || null,
          bio: editForm.bio.trim() || null
        })
        .eq('id', player.id)

      if (profileError) throw profileError

      // Update or create stats using upsert
      const statsData = {
        profile_id: player.id,
        leaderboard_rank: editForm.leaderboard_rank ? parseInt(editForm.leaderboard_rank) : null,
        total_points: parseFloat(editForm.total_points) || 0,
        total_tournaments: parseInt(editForm.total_tournaments) || 0,
        total_wins: parseInt(editForm.total_wins) || 0,
        best_rank: editForm.best_rank ? parseInt(editForm.best_rank) : null,
        win_rate: parseFloat(editForm.win_rate) || 0,
        avg_points_per_tournament: parseFloat(editForm.avg_points_per_tournament) || 0
      }

      // Use upsert - updates if exists, creates if not
      const { error: statsError } = await supabase
        .from('player_stats')
        .upsert(statsData, { 
          onConflict: 'profile_id'
        })

      if (statsError) throw statsError

      setMessage({ type: 'success', text: `${player.in_game_name}'s profile updated!` })
      
      // Refresh players list
      await fetchPlayers()
      
      // Close edit form after 1 second
      setTimeout(() => {
        handleCancel()
      }, 1000)

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
      <main className="min-h-screen pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-4">
              <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red bg-clip-text text-transparent hover-glow">
                Admin: Manage Players
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Edit player profiles and tournament statistics
            </p>
          </div>

          {/* Global Message */}
          {message.text && !editingPlayer && (
            <div className={`glass rounded-2xl p-4 mb-8 border flex items-center space-x-3 animate-fade-in ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <p>{message.text}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="glass rounded-2xl p-6 mb-8 border border-white/20">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search players by username or clan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-6">
            {filteredPlayers.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-white/20">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchTerm ? 'No players found' : 'No players registered yet'}
                </p>
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="glass rounded-2xl p-6 border border-white/20 hover:border-neon-blue/50 transition-all"
                >
                  {editingPlayer === player.id ? (
                    // EDIT MODE
                    <div className="space-y-6">
                      {/* Player Header */}
                      <div className="flex items-center space-x-4 pb-4 border-b border-white/10">
                        {player.avatar_url ? (
                          <img
                            src={player.avatar_url}
                            alt={player.in_game_name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-neon-blue/50"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center border-2 border-neon-blue/50">
                            <span className="text-2xl font-bold">{getInitial(player.in_game_name)}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-display font-bold text-2xl">{player.in_game_name}</h3>
                          <p className="text-gray-400 text-sm">Editing profile and stats</p>
                        </div>
                      </div>

                      {/* Message */}
                      {message.text && editingPlayer === player.id && (
                        <div className={`p-4 rounded-xl flex items-center space-x-3 animate-fade-in ${
                          message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          <p>{message.text}</p>
                        </div>
                      )}

                      {/* Edit Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Section */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-neon-blue flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Profile Information</span>
                          </h4>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Level (1-400)</label>
                            <input
                              type="number"
                              name="game_level"
                              value={editForm.game_level}
                              onChange={handleChange}
                              min="1"
                              max="400"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Clan</label>
                            <input
                              type="text"
                              name="clan"
                              value={editForm.clan}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple text-white"
                              placeholder="Enter clan name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Main Weapon</label>
                            <input
                              type="text"
                              name="main_weapon"
                              value={editForm.main_weapon}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue text-white"
                              placeholder="e.g., AK-47, M4A1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Favorite Mode</label>
                            <select
                              name="favorite_mode"
                              value={editForm.favorite_mode}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple text-white"
                            >
                              <option value="">Select mode</option>
                              <option value="Battle Royale">Battle Royale</option>
                              <option value="Multiplayer">Multiplayer</option>
                              <option value="Ranked">Ranked</option>
                              <option value="Team Deathmatch">Team Deathmatch</option>
                              <option value="Search & Destroy">Search & Destroy</option>
                              <option value="Domination">Domination</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Bio</label>
                            <textarea
                              name="bio"
                              value={editForm.bio}
                              onChange={handleChange}
                              rows="3"
                              maxLength="200"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple text-white resize-none"
                              placeholder="Player bio"
                            />
                          </div>
                        </div>

                        {/* Stats Section */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-neon-purple flex items-center space-x-2">
                            <Trophy className="w-5 h-5" />
                            <span>Tournament Statistics</span>
                          </h4>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Leaderboard Rank</label>
                            <input
                              type="number"
                              name="leaderboard_rank"
                              value={editForm.leaderboard_rank}
                              onChange={handleChange}
                              min="1"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                              placeholder="e.g., 1, 2, 3, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Total Points</label>
                            <input
                              type="number"
                              name="total_points"
                              value={editForm.total_points}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple text-white"
                              placeholder="Total leaderboard points"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Total Tournaments</label>
                            <input
                              type="number"
                              name="total_tournaments"
                              value={editForm.total_tournaments}
                              onChange={handleChange}
                              min="0"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Tournament Wins</label>
                            <input
                              type="number"
                              name="total_wins"
                              value={editForm.total_wins}
                              onChange={handleChange}
                              min="0"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-green-400 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Best Rank</label>
                            <input
                              type="number"
                              name="best_rank"
                              value={editForm.best_rank}
                              onChange={handleChange}
                              min="1"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                              placeholder="e.g., 1, 2, 3"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Win Rate (%) - Manual Entry</label>
                            <input
                              type="number"
                              name="win_rate"
                              value={editForm.win_rate}
                              onChange={handleChange}
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-green-400 text-white"
                              placeholder="Enter win rate manually (e.g., 75.5)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Avg Points per Tournament</label>
                            <input
                              type="number"
                              name="avg_points_per_tournament"
                              value={editForm.avg_points_per_tournament}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-purple text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-4">
                        <button
                          onClick={() => handleSave(player)}
                          disabled={saving}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                        >
                          {saving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg font-bold transition-all flex items-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center space-x-4">
                        {player.avatar_url ? (
                          <img
                            src={player.avatar_url}
                            alt={player.in_game_name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-neon-blue/50"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center border-2 border-neon-blue/50">
                            <span className="text-2xl font-bold">{getInitial(player.in_game_name)}</span>
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-display font-bold text-2xl">{player.in_game_name}</h3>
                          {player.clan && (
                            <p className="text-neon-purple font-medium">{player.clan}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="text-sm text-gray-400">
                              Level: <span className="text-yellow-400 font-bold">{player.game_level}</span>
                            </span>
                            {player.stats && (
                              <>
                                <span className="text-sm text-gray-400">
                                  Tournaments: <span className="text-white font-bold">{player.stats.total_tournaments}</span>
                                </span>
                                <span className="text-sm text-gray-400">
                                  Wins: <span className="text-green-400 font-bold">{player.stats.total_wins}</span>
                                </span>
                                <span className="text-sm text-gray-400">
                                  Win Rate: <span className="text-neon-blue font-bold">{player.stats.win_rate}%</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/profile/${player.in_game_name}`}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg font-medium transition-all"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleEdit(player)}
                          className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-bold hover:scale-105 transition-all flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
