'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Medal, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function MiniLeaderboard() {
  const [topPlayers, setTopPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopPlayers()
  }, [])

  const fetchTopPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(3)

      if (error) throw error
      setTopPlayers(data || [])
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
          <Trophy className="w-10 h-10 text-yellow-400" />
          <span className="absolute -top-2 -right-2 text-3xl">👑</span>
        </div>
      )
      case 2: return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-400/20 font-display font-bold text-xl text-gray-300">
          2
        </div>
      )
      case 3: return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-700/30 font-display font-bold text-xl text-amber-600">
          3
        </div>
      )
      default: return null
    }
  }

  const getMedalColor = (rank) => {
    switch(rank) {
      case 1: return 'from-yellow-500/30 via-yellow-400/20 to-yellow-500/30 border-yellow-400/50 animate-golden-glow shadow-lg shadow-yellow-500/20'
      case 2: return 'from-gray-400/20 to-gray-600/20 border-gray-400/30'
      case 3: return 'from-amber-700/20 to-amber-900/20 border-amber-700/30'
      default: return 'from-neon-blue/20 to-neon-purple/20'
    }
  }

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-12">
            <span className="hover-glow">Top Players</span>
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-6 loading-shimmer h-24"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-4">
          <span className="hover-glow">Top Players</span>
        </h2>
        <p className="text-gray-400 text-center mb-12">Elite warriors leading the charge</p>

        <div className="max-w-2xl mx-auto space-y-4">
          {topPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`glass rounded-xl p-6 border bg-gradient-to-r ${getMedalColor(index + 1)} card-hover`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Medal Icon */}
                  <div className="flex-shrink-0">
                    {getMedalIcon(index + 1)}
                  </div>

                  {/* Rank & Name */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Rank #{index + 1}</div>
                    <div className="font-display font-bold text-xl">{player.player_name}</div>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Total Points</div>
                  <div className="font-display font-bold text-2xl text-neon-blue">
                    {player.total_points.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/leaderboard"
            className="inline-block px-6 py-3 glass rounded-lg font-medium hover:bg-neon-blue/10 transition-colors"
          >
            View Full Leaderboard →
          </Link>
        </div>
      </div>
    </section>
  )
}
