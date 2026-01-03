'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Gamepad2, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TournamentPreview() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'live'])
        .order('start_time', { ascending: true })
        .limit(3)

      if (error) throw error
      setTournaments(data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      live: 'bg-neon-red/20 text-neon-red border-neon-red/30',
      upcoming: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
      completed: 'bg-gray-600/20 text-gray-400 border-gray-600/30'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[status]}`}>
        {status === 'live' && '🔴 '}
        {status}
      </span>
    )
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
  }

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-12">
            <span className="hover-glow">Active Tournaments</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-6 loading-shimmer h-64"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (tournaments.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-12">
            <span className="hover-glow">Active Tournaments</span>
          </h2>
          <div className="glass rounded-xl p-12 text-center max-w-2xl mx-auto">
            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No active tournaments at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-4">
          <span className="hover-glow">Active Tournaments</span>
        </h2>
        <p className="text-gray-400 text-center mb-12">Join the battle and prove your skills</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const { date, time } = formatDateTime(tournament.start_time)
            
            return (
              <div
                key={tournament.id}
                className="glass rounded-xl overflow-hidden card-hover group"
              >
                {/* Tournament Image */}
                {tournament.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={tournament.image_url} 
                      alt={tournament.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(tournament.status)}
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                    <Gamepad2 className="w-16 h-16 text-white/20" />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(tournament.status)}
                    </div>
                  </div>
                )}

                {/* Header with Status */}
                <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-xl mb-2 group-hover:text-neon-blue transition-colors">
                        {tournament.name}
                      </h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        {tournament.mode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-5 h-5 text-neon-blue mr-3" />
                    <span>{date}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Clock className="w-5 h-5 text-neon-blue mr-3" />
                    <span>{time}</span>
                  </div>

                  {tournament.status === 'live' && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center text-neon-red">
                        <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse mr-2"></div>
                        <span className="font-bold text-sm">TOURNAMENT IN PROGRESS</span>
                      </div>
                    </div>
                  )}

                  {tournament.status === 'upcoming' && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-gray-400 text-sm">
                        Entry: <span className="text-neon-blue font-bold">FREE</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/tournaments"
            className="inline-flex items-center px-6 py-3 glass rounded-lg font-medium hover:bg-neon-blue/10 transition-colors group"
          >
            <span>View All Tournaments</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
