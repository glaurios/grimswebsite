'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'

export default function TestAuthPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState([])

  const addResult = (type, title, message, details = null) => {
    setResults(prev => [...prev, { type, title, message, details, timestamp: Date.now() }])
  }

  const runTests = async () => {
    setTesting(true)
    setResults([])
    
    try {
      // Test 1: Check Supabase Connection
      addResult('info', 'Test 1: Checking Supabase Connection', 'Testing...')
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        addResult('success', 'Test 1: Supabase Connection', `Connected successfully. Current session: ${session ? 'Logged in' : 'Not logged in'}`)
      } catch (err) {
        addResult('error', 'Test 1: Supabase Connection', 'Failed to connect to Supabase', err.message)
        setTesting(false)
        return
      }

      // Test 2: Try Auth Signup
      addResult('info', 'Test 2: Testing Auth Signup', 'Attempting to create test user...')
      
      const testEmail = `test${Date.now()}@grims.test`
      const testPassword = 'TestPass123!'
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            emailRedirectTo: undefined,
            data: {
              test: true
            }
          }
        })

        if (error) {
          addResult('error', 'Test 2: Auth Signup FAILED', error.message, {
            name: error.name,
            status: error.status,
            email: testEmail,
            diagnosis: getDiagnosis(error)
          })
        } else {
          addResult('success', 'Test 2: Auth Signup SUCCESS', `User created! ID: ${data.user?.id}`, {
            email: data.user?.email,
            emailConfirmed: data.user?.email_confirmed_at ? 'Yes' : 'No',
            sessionExists: data.session ? 'Yes' : 'No'
          })
          
          // Test 3: Try to create user profile
          addResult('info', 'Test 3: Testing User Profile Insert', 'Attempting to insert profile...')
          
          try {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert([{
                user_id: data.user.id,
                in_game_name: `TestPlayer${Date.now()}`,
                email: testEmail,
                game_level: 100,
                is_public: true
              }])

            if (profileError) {
              addResult('error', 'Test 3: User Profile Insert FAILED', profileError.message, {
                code: profileError.code,
                details: profileError.details,
                hint: profileError.hint
              })
            } else {
              addResult('success', 'Test 3: User Profile Insert SUCCESS', 'Profile created successfully! Everything is working!')
            }
          } catch (err) {
            addResult('error', 'Test 3: User Profile Insert ERROR', err.message, err)
          }
        }
      } catch (err) {
        addResult('error', 'Test 2: Auth Signup ERROR', err.message, err)
      }

      // Test 4: Check Email Settings
      addResult('info', 'Test 4: Checking Configuration', 'Reviewing settings...')
      addResult('warning', 'Test 4: Configuration Check', 'Please verify these settings in Supabase Dashboard:', {
        location: 'Authentication → Providers → Email',
        settings: [
          '✅ Enable Email Provider: Should be ON',
          '✅ Enable Email Signup: Should be ON',
          '❌ Confirm email: Should be OFF',
          '❌ Secure email change: Should be OFF'
        ]
      })

    } catch (err) {
      addResult('error', 'Unexpected Error', err.message, err)
    } finally {
      setTesting(false)
    }
  }

  const getDiagnosis = (error) => {
    const msg = error.message.toLowerCase()
    
    if (msg.includes('database error')) {
      return {
        problem: 'Email confirmation is enabled without email service',
        solution: 'Go to Authentication → Providers → Email and turn OFF "Confirm email"',
        priority: 'HIGH'
      }
    } else if (msg.includes('rate limit')) {
      return {
        problem: 'Too many signup attempts',
        solution: 'Wait 5 minutes and try again',
        priority: 'MEDIUM'
      }
    } else if (msg.includes('already registered')) {
      return {
        problem: 'Email already exists',
        solution: 'Use a different email or delete existing user',
        priority: 'LOW'
      }
    } else if (msg.includes('invalid')) {
      return {
        problem: 'Invalid email or password format',
        solution: 'Check email format and password requirements',
        priority: 'MEDIUM'
      }
    }
    
    return {
      problem: 'Unknown error',
      solution: 'Check Supabase dashboard logs',
      priority: 'HIGH'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'error': return <XCircle className="w-6 h-6 text-red-400" />
      case 'warning': return <AlertCircle className="w-6 h-6 text-yellow-400" />
      case 'info': return <AlertCircle className="w-6 h-6 text-blue-400" />
      default: return <AlertCircle className="w-6 h-6 text-gray-400" />
    }
  }

  const getColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30'
      case 'error': return 'bg-red-500/10 border-red-500/30'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'info': return 'bg-blue-500/10 border-blue-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="hover-glow">Auth Diagnostic Test</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Test Supabase authentication and registration
            </p>
            
            <button
              onClick={runTests}
              disabled={testing}
              className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
            >
              {testing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Run Diagnostic Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="font-display font-bold text-2xl mb-6">Test Results:</h2>
              
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`glass rounded-xl p-6 border ${getColor(result.type)} animate-fade-in`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{result.title}</h3>
                      <p className="text-gray-300 mb-3">{result.message}</p>
                      
                      {result.details && (
                        <div className="mt-4 p-4 bg-dark-bg rounded-lg">
                          <p className="text-sm font-bold text-gray-400 mb-2">Details:</p>
                          <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                            {typeof result.details === 'object' 
                              ? JSON.stringify(result.details, null, 2)
                              : result.details
                            }
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              {!testing && (
                <div className="glass rounded-xl p-8 border border-neon-blue/30 mt-8">
                  <h3 className="font-display font-bold text-2xl mb-4">Summary</h3>
                  
                  {results.some(r => r.type === 'error') ? (
                    <div className="space-y-4">
                      <p className="text-red-400 font-bold">❌ Tests Failed - Issues Detected</p>
                      
                      {results.find(r => r.details?.diagnosis) && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                          <p className="font-bold text-red-400 mb-2">Diagnosis:</p>
                          {(() => {
                            const diagnosis = results.find(r => r.details?.diagnosis)?.details?.diagnosis
                            return (
                              <div className="space-y-2 text-sm">
                                <p><strong>Problem:</strong> {diagnosis?.problem}</p>
                                <p><strong>Solution:</strong> {diagnosis?.solution}</p>
                                <p><strong>Priority:</strong> <span className="text-red-400">{diagnosis?.priority}</span></p>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                      
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                        <p className="font-bold text-blue-400 mb-2">Next Steps:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                          <li>Go to Supabase Dashboard</li>
                          <li>Click Authentication → Providers → Email</li>
                          <li>Turn OFF "Confirm email"</li>
                          <li>Turn OFF "Secure email change"</li>
                          <li>Click "Save"</li>
                          <li>Run this test again</li>
                        </ol>
                      </div>
                    </div>
                  ) : results.some(r => r.type === 'success' && r.title.includes('Profile')) ? (
                    <div className="space-y-4">
                      <p className="text-green-400 font-bold text-xl">✅ All Tests Passed!</p>
                      <p className="text-gray-300">
                        Your authentication and registration system is working perfectly!
                        You can now use the registration page.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-yellow-400 font-bold">⚠️ Partial Success</p>
                      <p className="text-gray-300">
                        Some tests passed, but there may be issues. Review the details above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {results.length === 0 && !testing && (
            <div className="max-w-2xl mx-auto glass rounded-xl p-8 border border-neon-blue/30">
              <h3 className="font-display font-bold text-xl mb-4">What This Test Does:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-neon-blue">1.</span>
                  <span>Checks Supabase connection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-neon-blue">2.</span>
                  <span>Tests auth.signUp() to create a test user</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-neon-blue">3.</span>
                  <span>Tests user_profiles insert</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-neon-blue">4.</span>
                  <span>Provides diagnosis and solutions</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-bold mb-2">Note:</p>
                <p className="text-sm text-gray-300">
                  This test will create a temporary user in your database. 
                  The test data can be deleted later if needed.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
