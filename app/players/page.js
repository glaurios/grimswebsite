'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Users, Search, Trophy, Crown, Medal, Award, Filter } from 'lucide-react'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterClan, setFilterClan] = useState('')
  const [clans, setClans] = useState([])
  const [stats, setStats] = useState({ total: 0, withProfiles: 0 })

  useEffect(() => {
    fetchPlayers()
  }, [])

  useEffect(() => {
    filterPlayers()
  }, [searchQuery, filterClan, players])

  const fetchPlayers = async () => {
    try {
      // Get all profiles
      const { data: profilesData, error } = await supabase
        .from('user_profiles')
        .select('*, player_stats(*)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // For each profile, get leaderboard data if exists
      const playersWithLeaderboard = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: leaderboardData } = await supabase
            .from('players')
            .select('rank, total_points')
            .eq('user_profile_id', profile.id)
            .single()

          return {
            ...profile,
            leaderboard: leaderboardData
          }
        })
      )

      // Sort by rank (lowest rank number = highest position)
      const sorted = playersWithLeaderboard.sort((a, b) => {
        if (!a.leaderboard) return 1
        if (!b.leaderboard) return -1
        return a.leaderboard.rank - b.leaderboard.rank
      })

      setPlayers(sorted)
      setFilteredPlayers(sorted)

      // Get unique clans
      const uniqueClans = [...new Set(sorted.map(p => p.clan).filter(Boolean))]
      setClans(uniqueClans)

      // Set stats
      setStats({
        total: sorted.length,
        withProfiles: sorted.filter(p => p.leaderboard).length
      })

    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPlayers = () => {
    let filtered = players

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(player =>
        player.in_game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.clan && player.clan.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Clan filter
    if (filterClan) {
      filtered = filtered.filter(player => player.clan === filterClan)
    }

    setFilteredPlayers(filtered)
  }

  const getRankBadge = (rank) => {
    if (!rank) return null

    if (rank === 1) return (
      <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2 border-2 border-yellow-400">
        <Crown className="w-4 h-4 text-dark-bg" />
      </div>
    )
    if (rank === 2) return (
      <div className="absolute -top-2 -right-2 bg-gray-400 rounded-full p-2 border-2 border-gray-300">
        <Medal className="w-4 h-4 text-dark-bg" />
      </div>
    )
    if (rank === 3) return (
      <div className="absolute -top-2 -right-2 bg-amber-600 rounded-full p-2 border-2 border-amber-500">
        <Medal className="w-4 h-4 text-dark-bg" />
      </div>
    )
    return null
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
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="hover-glow">GRIMS Players</span>
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Meet our elite squad of {stats.total} registered players
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="glass rounded-xl px-6 py-3 border border-neon-blue/20">
                <div className="text-3xl font-display font-bold text-neon-blue">
                  {stats.total}
                </div>
                <div className="text-gray-400 text-sm">Total Players</div>
              </div>
              <div className="glass rounded-xl px-6 py-3 border border-neon-purple/20">
                <div className="text-3xl font-display font-bold text-neon-purple">
                  {stats.withProfiles}
                </div>
                <div className="text-gray-400 text-sm">On Leaderboard</div>
              </div>
              <div className="glass rounded-xl px-6 py-3 border border-neon-blue/20">
                <div className="text-3xl font-display font-bold text-neon-blue">
                  {clans.length}
                </div>
                <div className="text-gray-400 text-sm">Active Clans</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-2xl p-6 mb-8 border border-neon-blue/30">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search players or clans..."
                  className="w-full pl-12 pr-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                />
              </div>

              {/* Clan Filter */}
              <div className="md:w-64 relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterClan}
                  onChange={(e) => setFilterClan(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                >
                  <option value="">All Clans</option>
                  {clans.map(clan => (
                    <option key={clan} value={clan}>{clan}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || filterClan) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterClan('')
                  }}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {filteredPlayers.length !== players.length && (
              <div className="mt-4 text-center text-gray-400">
                Showing {filteredPlayers.length} of {players.length} players
              </div>
            )}
          </div>

          {/* Players Grid */}
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No players found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/profile/${player.in_game_name}`}
                  className="glass rounded-xl p-6 border border-white/10 hover:border-neon-blue/50 transition-all hover:scale-105 group"
                >
                  {/* Avatar */}
                  <div className="relative mb-4">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.in_game_name}
                        className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-neon-blue/30 group-hover:border-neon-blue transition-colors"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mx-auto border-4 border-neon-blue/30 group-hover:border-neon-blue transition-colors">
                        <span className="text-3xl font-display font-bold">
                          {player.in_game_name[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    {player.leaderboard && getRankBadge(player.leaderboard.rank)}
                  </div>

                  {/* Name */}
                  <h3 className="font-display font-bold text-xl text-center mb-2 group-hover:text-neon-blue transition-colors">
                    {player.in_game_name}
                  </h3>

                  {/* Clan */}
                  {player.clan && (
                    <div className="inline-flex items-center space-x-1 px-3 py-1 bg-neon-purple/20 rounded-full text-xs font-bold text-neon-purple mb-3 mx-auto block w-fit">
                      <Users className="w-3 h-3" />
                      <span>{player.clan}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span className="font-bold text-yellow-400">{player.game_level}</span>
                    </div>
                    
                    {player.leaderboard && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Rank:</span>
                          <span className="font-bold text-neon-blue">#{player.leaderboard.rank}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Points:</span>
                          <span className="font-bold">{player.leaderboard.total_points}</span>
                        </div>
                      </>
                    )}

                    {player.player_stats?.[0] && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tournaments:</span>
                        <span className="font-bold">{player.player_stats[0].total_tournaments}</span>
                      </div>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-center text-neon-blue font-medium text-sm group-hover:text-neon-purple transition-colors">
                      View Profile →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
