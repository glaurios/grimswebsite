'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Trophy, Users, Target, Gamepad2, Calendar, Edit, Crown, Medal, Award } from 'lucide-react'

export default function ProfilePage() {
  const params = useParams()
  const username = params?.username ? decodeURIComponent(params.username) : null
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (username) {
      fetchProfile()
      checkIfOwnProfile()
    }
  }, [username])

  const checkIfOwnProfile = () => {
    // Check localStorage for logged in user
    const userData = localStorage.getItem('grims_user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.username === username) {
        setIsOwnProfile(true)
      }
    }
  }

  const fetchProfile = async () => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('in_game_name', username)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)

      // Get stats
      const { data: statsData } = await supabase
        .from('player_stats')
        .select('*')
        .eq('profile_id', profileData.id)
        .single()

      if (statsData) setStats(statsData)

      // Get leaderboard position
      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('user_profile_id', profileData.id)
        .single()

      if (playerData) setLeaderboardData(playerData)

    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-400" />
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />
    if (rank === 3) return <Medal className="w-8 h-8 text-amber-600" />
    return <Award className="w-8 h-8 text-neon-blue" />
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

  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="font-display font-bold text-4xl mb-4">Player Not Found</h1>
            <p className="text-gray-400 mb-8">The player "{username}" does not exist.</p>
            <Link href="/players" className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-bold inline-block hover:scale-105 transition-transform">
              Browse All Players
            </Link>
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
          {/* Profile Header */}
          <div className="glass rounded-2xl p-8 mb-8 border border-neon-blue/30">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.in_game_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-neon-blue"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center border-4 border-neon-blue">
                    <span className="text-4xl font-display font-bold">
                      {profile.in_game_name[0].toUpperCase()}
                    </span>
                  </div>
                )}
                
                {leaderboardData && leaderboardData.rank <= 3 && (
                  <div className="absolute -top-2 -right-2 bg-dark-bg rounded-full p-2 border-2 border-neon-blue">
                    {getRankIcon(leaderboardData.rank)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-display font-bold text-4xl mb-2 hover-glow">
                  {profile.in_game_name}
                </h1>
                
                {profile.clan && (
                  <div className="inline-flex items-center space-x-2 px-4 py-1 bg-neon-purple/20 rounded-full mb-4">
                    <Users className="w-4 h-4 text-neon-purple" />
                    <span className="font-bold text-neon-purple">{profile.clan}</span>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center space-x-2 text-sm">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Level:</span>
                    <span className="font-bold text-yellow-400">{profile.game_level}</span>
                  </div>
                  
                  {profile.main_weapon && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Target className="w-4 h-4 text-neon-blue" />
                      <span className="text-gray-400">Main:</span>
                      <span className="font-bold">{profile.main_weapon}</span>
                    </div>
                  )}
                  
                  {profile.favorite_mode && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Gamepad2 className="w-4 h-4 text-neon-purple" />
                      <span className="text-gray-400">Mode:</span>
                      <span className="font-bold">{profile.favorite_mode}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Joined:</span>
                    <span className="font-bold">
                      {new Date(profile.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                {isOwnProfile && (
                  <Link
                    href="/edit-profile"
                    className="inline-flex items-center space-x-2 px-6 py-3 mt-6 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg hover:scale-105 transition-transform font-bold"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Leaderboard Rank */}
            <div className="glass rounded-xl p-6 border border-neon-blue/20 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-4xl font-display font-bold mb-1">
                {leaderboardData ? `#${leaderboardData.rank}` : 'N/A'}
              </div>
              <div className="text-gray-400 text-sm">Leaderboard Rank</div>
            </div>

            {/* Total Points */}
            <div className="glass rounded-xl p-6 border border-neon-purple/20 text-center">
              <Award className="w-8 h-8 text-neon-purple mx-auto mb-3" />
              <div className="text-4xl font-display font-bold mb-1">
                {leaderboardData?.total_points || 0}
              </div>
              <div className="text-gray-400 text-sm">Total Points</div>
            </div>

            {/* Tournaments */}
            <div className="glass rounded-xl p-6 border border-neon-blue/20 text-center">
              <Trophy className="w-8 h-8 text-neon-blue mx-auto mb-3" />
              <div className="text-4xl font-display font-bold mb-1">
                {stats?.total_tournaments || 0}
              </div>
              <div className="text-gray-400 text-sm">Tournaments</div>
            </div>

            {/* Wins */}
            <div className="glass rounded-xl p-6 border border-green-500/20 text-center">
              <Crown className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-4xl font-display font-bold mb-1">
                {stats?.total_wins || 0}
              </div>
              <div className="text-gray-400 text-sm">Tournament Wins</div>
            </div>
          </div>

          {/* Additional Stats */}
          {stats && (
            <div className="glass rounded-2xl p-8 border border-neon-blue/30">
              <h2 className="font-display font-bold text-2xl mb-6">Detailed Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Win Rate</div>
                  <div className="text-2xl font-bold">
                    {stats.win_rate ? `${stats.win_rate}%` : '0%'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Best Rank</div>
                  <div className="text-2xl font-bold">
                    {stats.best_rank ? `#${stats.best_rank}` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Avg Points/Tournament</div>
                  <div className="text-2xl font-bold">
                    {stats.avg_points_per_tournament ? Math.round(stats.avg_points_per_tournament) : '0'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
