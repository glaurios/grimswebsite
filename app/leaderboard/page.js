'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('total_points', { ascending: false })

      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1: return (
        <div className="relative">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <span className="absolute -top-2 -right-2 text-2xl">👑</span>
        </div>
      )
      case 2: return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/20 font-display font-bold text-gray-300">
          2
        </div>
      )
      case 3: return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/30 font-display font-bold text-amber-600">
          3
        </div>
      )
      default: return <div className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold text-lg">{rank}</div>
    }
  }

  const getRankStyle = (rank) => {
    switch(rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/30 via-yellow-400/20 to-yellow-500/30 border-yellow-400/50 animate-glow-pulse shadow-lg shadow-yellow-500/20'
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/30'
      case 3: return 'bg-gradient-to-r from-amber-700/20 to-amber-900/20 border-amber-700/30'
      default: return ''
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display font-black text-5xl md:text-7xl mb-4">
              <span className="hover-glow">Leaderboard</span>
            </h1>
            <p className="text-xl text-gray-400">Rankings updated after every tournament</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-xl p-6 text-center">
              <Users className="w-10 h-10 text-neon-blue mx-auto mb-3" />
              <div className="font-display font-bold text-3xl mb-2">{players.length}</div>
              <div className="text-gray-400">Total Players</div>
            </div>
            
            <div className="glass rounded-xl p-6 text-center">
              <TrendingUp className="w-10 h-10 text-neon-yellow mx-auto mb-3" />
              <div className="font-display font-bold text-3xl mb-2">
                {players.length > 0 ? players[0].total_points.toLocaleString() : '0'}
              </div>
              <div className="text-gray-400">Top Score</div>
            </div>
            
            <div className="glass rounded-xl p-6 text-center">
              <Trophy className="w-10 h-10 text-neon-red mx-auto mb-3" />
              <div className="font-display font-bold text-3xl mb-2">
                {players.length > 0 ? players[0].player_name : 'TBA'}
              </div>
              <div className="text-gray-400">Current Leader</div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass rounded-xl p-6 loading-shimmer h-20"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop View */}
              <div className="hidden md:block glass rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left font-display font-bold text-neon-blue">Rank</th>
                      <th className="px-6 py-4 text-left font-display font-bold text-neon-blue">Player Name</th>
                      <th className="px-6 py-4 text-right font-display font-bold text-neon-blue">Total Points</th>
                      <th className="px-6 py-4 text-right font-display font-bold text-neon-blue">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr 
                        key={player.id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${getRankStyle(index + 1)}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {getMedalIcon(index + 1)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-display font-bold text-lg">{player.player_name}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-display font-bold text-2xl text-neon-blue">
                            {player.total_points.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 text-sm">
                          {new Date(player.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {players.map((player, index) => (
                  <div 
                    key={player.id}
                    className={`glass rounded-xl p-6 border ${getRankStyle(index + 1)}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getMedalIcon(index + 1)}
                        <div>
                          <div className="text-sm text-gray-400">Rank #{index + 1}</div>
                          <div className="font-display font-bold text-xl">{player.player_name}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="text-gray-400 text-sm">Total Points</div>
                      <div className="font-display font-bold text-2xl text-neon-blue">
                        {player.total_points.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && players.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No players ranked yet. Be the first to compete!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
