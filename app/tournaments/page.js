'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, Clock, Gamepad2, Trophy, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, live, upcoming, completed

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_time', { ascending: false })

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

    const icons = {
      live: '🔴',
      upcoming: '📅',
      completed: '✅'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[status]} flex items-center space-x-1`}>
        <span>{icons[status]}</span>
        <span>{status}</span>
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

  const filteredTournaments = tournaments.filter(t => 
    filter === 'all' ? true : t.status === filter
  )

  const stats = {
    total: tournaments.length,
    live: tournaments.filter(t => t.status === 'live').length,
    upcoming: tournaments.filter(t => t.status === 'upcoming').length,
    completed: tournaments.filter(t => t.status === 'completed').length
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display font-black text-5xl md:text-7xl mb-4">
              <span className="hover-glow">Tournaments</span>
            </h1>
            <p className="text-xl text-gray-400">Compete in intense CODM battles</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass rounded-xl p-4 text-center">
              <div className="font-display font-bold text-3xl text-neon-blue mb-1">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="font-display font-bold text-3xl text-neon-red mb-1">{stats.live}</div>
              <div className="text-gray-400 text-sm">Live Now</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="font-display font-bold text-3xl text-neon-yellow mb-1">{stats.upcoming}</div>
              <div className="text-gray-400 text-sm">Upcoming</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="font-display font-bold text-3xl text-gray-400 mb-1">{stats.completed}</div>
              <div className="text-gray-400 text-sm">Completed</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {['all', 'live', 'upcoming', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-neon-blue text-black'
                    : 'glass hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Tournament List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-6 loading-shimmer h-80"></div>
              ))}
            </div>
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => {
                const { date, time } = formatDateTime(tournament.start_time)
                const endDateTime = tournament.end_time ? formatDateTime(tournament.end_time) : null
                
                return (
                  <div
                    key={tournament.id}
                    className="glass rounded-xl overflow-hidden card-hover"
                  >
                    {/* Tournament Image */}
                    {tournament.image_url ? (
                      <div className="relative h-80 overflow-hidden">
                        <img 
                          src={tournament.image_url} 
                          alt={tournament.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(tournament.status)}
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-80 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                        <Gamepad2 className="w-20 h-20 text-white/20" />
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(tournament.status)}
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 p-6 border-b border-white/10">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display font-bold text-xl flex-1 pr-4">
                          {tournament.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm mt-3">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        {tournament.mode}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-3">
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Start Time</div>
                        <div className="flex items-center text-white">
                          <Calendar className="w-5 h-5 text-neon-blue mr-3" />
                          <span className="font-medium">{date}</span>
                        </div>
                        <div className="flex items-center text-white mt-1 ml-8">
                          <Clock className="w-5 h-5 text-neon-blue mr-3" />
                          <span className="font-medium">{time}</span>
                        </div>
                      </div>

                      {endDateTime && tournament.status === 'completed' && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="text-gray-400 text-sm mb-1">Ended</div>
                          <div className="text-white font-medium">{endDateTime.date} at {endDateTime.time}</div>
                        </div>
                      )}

                      {/* Status-specific info */}
                      {tournament.status === 'live' && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center text-neon-red">
                            <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse mr-2"></div>
                            <span className="font-bold text-sm">LIVE NOW - JOIN THE BATTLE!</span>
                          </div>
                        </div>
                      )}

                      {tournament.status === 'upcoming' && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Entry Fee</span>
                            <span className="text-neon-blue font-bold">FREE</span>
                          </div>
                        </div>
                      )}

                      {tournament.status === 'completed' && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center text-gray-400">
                            {tournament.results_entered ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                <span className="text-sm">Results Recorded</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-yellow-500 mr-2" />
                                <span className="text-sm">Awaiting Results</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No {filter !== 'all' ? filter : ''} tournaments found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
