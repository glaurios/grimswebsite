'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Users, Trophy, Calendar, Search, User, ExternalLink } from 'lucide-react'

export default function RegisteredPlayersPage() {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ total: 0, withClan: 0, avgLevel: 0 })

  useEffect(() => {
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

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setPlayers(data || [])
      setFilteredPlayers(data || [])

      // Calculate stats
      const withClan = data?.filter(p => p.clan).length || 0
      const avgLevel = data?.length 
        ? Math.round(data.reduce((sum, p) => sum + (p.game_level || 0), 0) / data.length)
        : 0

      setStats({
        total: data?.length || 0,
        withClan,
        avgLevel
      })
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
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
                Registered Players
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              All GRIMS community members
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            <div className="glass rounded-2xl p-6 border border-neon-blue/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-neon-blue" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Players</p>
                  <p className="text-3xl font-display font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-neon-purple/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">With Clans</p>
                  <p className="text-3xl font-display font-bold">{stats.withClan}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-yellow-400/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Level</p>
                  <p className="text-3xl font-display font-bold">{stats.avgLevel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="glass rounded-2xl p-6 mb-8 border border-white/20 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username or clan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Players Grid */}
          {filteredPlayers.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/20">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchTerm ? 'No players found matching your search' : 'No players registered yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="glass rounded-2xl p-6 border border-white/20 hover:border-neon-blue/50 transition-all hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Avatar */}
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

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-xl text-white truncate">
                        {player.in_game_name}
                      </h3>
                      {player.clan && (
                        <p className="text-neon-purple text-sm font-medium">
                          {player.clan}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span>Level</span>
                      </span>
                      <span className="font-bold text-yellow-400">{player.game_level}</span>
                    </div>

                    {player.main_weapon && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Main Weapon</span>
                        <span className="font-medium text-white">{player.main_weapon}</span>
                      </div>
                    )}

                    {player.favorite_mode && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Favorite Mode</span>
                        <span className="font-medium text-white truncate ml-2">{player.favorite_mode}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined</span>
                      </span>
                      <span className="font-medium text-white">
                        {new Date(player.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {player.bio && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {player.bio}
                    </p>
                  )}

                  {/* View Profile Button */}
                  <Link
                    href={`/profile/${player.in_game_name}`}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 hover:from-neon-blue/30 hover:to-neon-purple/30 border border-neon-blue/30 rounded-lg transition-all font-medium group"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
