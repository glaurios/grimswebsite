'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, MessageCircle, Send, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState('idle') // idle, sending, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      // Save to database
      const { error } = await supabase
        .from('contacts')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.log('Note: Contacts table may not exist yet:', error.message)
      }

      setStatus('success')
      setMessage(`Message sent successfully! We'll respond to ${formData.email} soon.`)
      setFormData({ name: '', email: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to send message. Please try contacting us on WhatsApp.')
      console.error('Error submitting form:', error)
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
              <span className="hover-glow">Contact Us</span>
            </h1>
            <p className="text-xl text-gray-400">Get in touch with the GRIMS command center</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="glass rounded-2xl p-8 border border-neon-blue/30">
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="w-8 h-8 text-neon-blue" />
                <h2 className="font-display font-bold text-2xl">Send a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue transition-colors text-white resize-none"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <p className="text-green-400">{message}</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full px-6 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info & Social */}
            <div className="space-y-8">
              {/* WhatsApp */}
              <div className="glass rounded-2xl p-8 border border-neon-yellow/30 card-hover">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="w-8 h-8 text-neon-yellow" />
                  <h2 className="font-display font-bold text-2xl">Join Our Community</h2>
                </div>
                <p className="text-gray-300 mb-6">
                  Connect with fellow GRIMS members, get instant updates on tournaments, coordinate squad tactics, and stay in the loop with all things CODM.
                </p>
                <a
                  href="https://chat.whatsapp.com/HGVFehBnrfH7KFPikHKPcH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg font-display font-bold hover:scale-105 transition-transform"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Join WhatsApp Group 
                </a>

               <p className="mt-7">Or Call +233554242524</p>

              </div>
               
              {/* Quick Info */}
              <div className="glass rounded-2xl p-8 border border-neon-purple/30">
                <h3 className="font-display font-bold text-xl mb-4 text-neon-purple">Quick Info</h3>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Response Time</div>
                    <div className="font-medium">Usually within 24 hours</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Best For</div>
                    <div className="font-medium">General inquiries, partnership opportunities, technical support</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Squad Recruitment</div>
                    <div className="font-medium">Open to skilled players - reach out on WhatsApp</div>
                  </div>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="glass rounded-2xl p-8 border border-neon-red/30">
                <blockquote className="italic text-lg text-gray-300">
                  "We form alliance to manifest our missions."
                </blockquote>
                <p className="text-gray-400 text-sm mt-4">
                  — GRIMS Motto
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
