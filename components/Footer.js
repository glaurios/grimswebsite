import Link from 'next/link'
import { MessageCircle, Trophy, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass border-t border-neon-blue/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-red rounded-lg flex items-center justify-center">
                <span className="font-display font-bold">G</span>
              </div>
              <div className="font-display font-bold text-lg neon-glow">GRIMS</div>
            </div>
            <p className="text-gray-400 text-sm">
              Global Recon Invincible Mission Squad - Elite Call of Duty Mobile gaming community
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-neon-blue mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/leaderboard" className="block text-gray-400 hover:text-neon-blue transition-colors">
                Leaderboard
              </Link>
              <Link href="/tournaments" className="block text-gray-400 hover:text-neon-blue transition-colors">
                Tournaments
              </Link>
              <Link href="/about" className="block text-gray-400 hover:text-neon-blue transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-neon-blue transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Connect Section */}
          <div>
            <h3 className="font-display font-bold text-neon-blue mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://chat.whatsapp.com/HGVFehBnrfH7KFPikHKPcH"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-neon-blue/10 hover:bg-neon-blue/20 flex items-center justify-center transition-all hover:scale-110"
              >
                <MessageCircle className="w-6 h-6 text-neon-blue" />
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Join our WhatsApp community for updates, tournaments, and squad coordination
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} GRIMS. We form alliance to manifest our missions.</p>
        </div>
      </div>
    </footer>
  )
}
