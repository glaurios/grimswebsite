'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, XCircle, Database, Loader2, Key, Globe, Users } from 'lucide-react'

export default function TestConnectionPage() {
  const [testing, setTesting] = useState(true)
  const [results, setResults] = useState({
    supabaseUrl: null,
    supabaseKey: null,
    databaseConnection: null,
    playersTable: null,
    tournamentsTable: null,
    storageAccess: null,
    playerCount: 0,
    tournamentCount: 0,
    errors: []
  })

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const testResults = {
      supabaseUrl: null,
      supabaseKey: null,
      databaseConnection: null,
      playersTable: null,
      tournamentsTable: null,
      storageAccess: null,
      playerCount: 0,
      tournamentCount: 0,
      errors: []
    }

    // Test 1: Check if environment variables exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    testResults.supabaseUrl = !!supabaseUrl
    testResults.supabaseKey = !!supabaseKey

    if (!supabaseUrl || !supabaseKey) {
      testResults.errors.push('Environment variables not configured in .env.local')
      setResults(testResults)
      setTesting(false)
      return
    }

    try {
      // Test 2: Try to connect to players table
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .limit(1)

      if (playersError) {
        testResults.playersTable = false
        testResults.errors.push(`Players table: ${playersError.message}`)
      } else {
        testResults.playersTable = true
        
        // Get player count
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
        testResults.playerCount = count || 0
      }

      // Test 3: Try to connect to tournaments table
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .limit(1)

      if (tournamentsError) {
        testResults.tournamentsTable = false
        testResults.errors.push(`Tournaments table: ${tournamentsError.message}`)
      } else {
        testResults.tournamentsTable = true
        
        // Get tournament count
        const { count } = await supabase
          .from('tournaments')
          .select('*', { count: 'exact', head: true })
        testResults.tournamentCount = count || 0
      }

      // Test 4: Check storage access
      const { data: buckets, error: storageError } = await supabase
        .storage
        .listBuckets()

      if (storageError) {
        testResults.storageAccess = false
        testResults.errors.push(`Storage: ${storageError.message}`)
      } else {
        testResults.storageAccess = true
      }

      // If we got here, database connection is working
      if (testResults.playersTable || testResults.tournamentsTable) {
        testResults.databaseConnection = true
      } else {
        testResults.databaseConnection = false
      }

    } catch (error) {
      testResults.databaseConnection = false
      testResults.errors.push(`Connection error: ${error.message}`)
    }

    setResults(testResults)
    setTesting(false)
  }

  const StatusIcon = ({ status }) => {
    if (status === null) return <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getOverallStatus = () => {
    if (testing) return 'testing'
    if (!results.supabaseUrl || !results.supabaseKey) return 'error'
    if (!results.databaseConnection) return 'error'
    if (!results.playersTable || !results.tournamentsTable) return 'warning'
    return 'success'
  }

  const overallStatus = getOverallStatus()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Database Connection Test
            </h1>
            <p className="text-gray-400 text-lg">
              Testing your Supabase database connection
            </p>
          </div>

          {/* Overall Status */}
          <div className={`glass rounded-2xl p-8 mb-8 text-center ${
            overallStatus === 'success' ? 'border-green-500/30' :
            overallStatus === 'warning' ? 'border-yellow-500/30' :
            overallStatus === 'error' ? 'border-red-500/30' :
            'border-neon-blue/30'
          }`}>
            {testing ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-neon-blue mx-auto mb-4" />
                <h2 className="font-display font-bold text-2xl mb-2">Testing Connection...</h2>
                <p className="text-gray-400">Please wait while we check your database</p>
              </>
            ) : overallStatus === 'success' ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="font-display font-bold text-2xl mb-2 text-green-500">
                  ✅ Everything Connected!
                </h2>
                <p className="text-gray-300">Your database is working perfectly</p>
              </>
            ) : overallStatus === 'warning' ? (
              <>
                <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="font-display font-bold text-2xl mb-2 text-yellow-500">
                  ⚠️ Partial Connection
                </h2>
                <p className="text-gray-300">Some tables are missing or have issues</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="font-display font-bold text-2xl mb-2 text-red-500">
                  ❌ Connection Failed
                </h2>
                <p className="text-gray-300">Unable to connect to your database</p>
              </>
            )}
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Environment Variables */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Key className="w-6 h-6 text-neon-blue" />
                  <h3 className="font-display font-bold text-lg">Supabase URL</h3>
                </div>
                <StatusIcon status={results.supabaseUrl} />
              </div>
              <p className="text-gray-400 text-sm">
                {results.supabaseUrl 
                  ? '✅ Environment variable configured' 
                  : '❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local'}
              </p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Key className="w-6 h-6 text-neon-blue" />
                  <h3 className="font-display font-bold text-lg">Supabase Key</h3>
                </div>
                <StatusIcon status={results.supabaseKey} />
              </div>
              <p className="text-gray-400 text-sm">
                {results.supabaseKey 
                  ? '✅ Environment variable configured' 
                  : '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local'}
              </p>
            </div>

            {/* Database Connection */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-neon-purple" />
                  <h3 className="font-display font-bold text-lg">Database Connection</h3>
                </div>
                <StatusIcon status={results.databaseConnection} />
              </div>
              <p className="text-gray-400 text-sm">
                {results.databaseConnection 
                  ? '✅ Successfully connected to Supabase' 
                  : '❌ Cannot connect to database'}
              </p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-neon-red" />
                  <h3 className="font-display font-bold text-lg">Storage Access</h3>
                </div>
                <StatusIcon status={results.storageAccess} />
              </div>
              <p className="text-gray-400 text-sm">
                {results.storageAccess 
                  ? '✅ Storage buckets accessible' 
                  : '❌ Cannot access storage'}
              </p>
            </div>

            {/* Tables */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-neon-yellow" />
                  <h3 className="font-display font-bold text-lg">Players Table</h3>
                </div>
                <StatusIcon status={results.playersTable} />
              </div>
              <p className="text-gray-400 text-sm">
                {results.playersTable 
                  ? `✅ Table exists (${results.playerCount} players)` 
                  : '❌ Table not found or no access'}
              </p>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-neon-yellow" />
                  <h3 className="font-display font-bold text-lg">Tournaments Table</h3>
                </div>
                <StatusIcon status={results.tournamentsTable} />
              </div>
              <p className="text-gray-400 text-sm">
                {results.tournamentsTable 
                  ? `✅ Table exists (${results.tournamentCount} tournaments)` 
                  : '❌ Table not found or no access'}
              </p>
            </div>
          </div>

          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="glass rounded-xl p-6 border border-red-500/30 mb-8">
              <h3 className="font-display font-bold text-lg mb-4 text-red-500">
                ⚠️ Errors Found:
              </h3>
              <ul className="space-y-2">
                {results.errors.map((error, index) => (
                  <li key={index} className="text-red-400 text-sm">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={runTests}
              disabled={testing}
              className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Run Tests Again'}
            </button>
            
            {overallStatus === 'success' && (
              <a
                href="/"
                className="px-6 py-3 glass rounded-lg font-display font-bold hover:scale-105 transition-transform text-center"
              >
                Go to Homepage
              </a>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-12 glass rounded-xl p-6">
            <h3 className="font-display font-bold text-xl mb-4">Need Help?</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-white">Environment variables missing?</strong>
                <br />
                Check your <code className="text-neon-blue">.env.local</code> file in the project root.
              </p>
              <p>
                <strong className="text-white">Tables not found?</strong>
                <br />
                Run the <code className="text-neon-blue">supabase-setup.sql</code> script in Supabase SQL Editor.
              </p>
              <p>
                <strong className="text-white">Connection failed?</strong>
                <br />
                Verify your Supabase URL and anon key are correct.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
