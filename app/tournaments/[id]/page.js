'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Calendar, Clock, Gamepad2, Trophy, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TournamentDetailsPage() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournament()
  }, [id])

  const fetchTournament = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setTournament(data)
    } catch (error) {
      console.error('Error fetching tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-32 text-center text-white">Loading tournament details...</div>
        <Footer />
      </>
    )
  }

  if (!tournament) {
    return (
      <>
        <Navbar />
        <div className="pt-32 text-center text-red-500">Tournament not found.</div>
        <Footer />
      </>
    )
  }

  const start = formatDateTime(tournament.start_time)
  const end = tournament.end_time ? formatDateTime(tournament.end_time) : null

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 min-h-screen bg-black/90">
        <div className="container mx-auto px-4">
          <div className="glass rounded-xl overflow-hidden">
            {/* Image */}
            {tournament.image_url ? (
              <div className="relative h-96 overflow-hidden">
                <img
                  src={tournament.image_url}
                  alt={tournament.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4">
                  {getStatusBadge(tournament.status)}
                </div>
              </div>
            ) : (
              <div className="relative h-96 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                <Gamepad2 className="w-20 h-20 text-white/20" />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(tournament.status)}
                </div>
              </div>
            )}

            {/* Tournament Info */}
            <div className="p-8 space-y-4">
              <h1 className="font-display font-black text-4xl text-white">{tournament.name}</h1>
              <div className="flex items-center text-gray-400 text-sm space-x-4">
                <Gamepad2 className="w-5 h-5" />
                <span>{tournament.mode}</span>
              </div>

              <div className="flex space-x-6 mt-4 text-white/90">
                <div>
                  <div className="text-gray-400 text-sm">Start Time</div>
                  <div>{start.date} at {start.time}</div>
                </div>
                {end && (
                  <div>
                    <div className="text-gray-400 text-sm">End Time</div>
                    <div>{end.date} at {end.time}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-neon-blue mb-2">Description</h2>
                <p className="text-white/90 leading-relaxed">{tournament.description || 'No description provided.'}</p>
              </div>

              {/* Rules */}
              {tournament.rules && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-neon-blue mb-2">Rules</h2>
                  <p className="text-white/90">{tournament.rules}</p>
                </div>
              )}

              {/* Prize */}
              {tournament.prize_pool && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-neon-blue mb-2">Prize Pool</h2>
                  <p className="text-neon-yellow font-bold text-lg">{tournament.prize_pool}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
