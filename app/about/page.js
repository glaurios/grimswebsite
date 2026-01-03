import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Shield, Target, Users, Zap, Trophy, Crosshair } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display font-black text-5xl md:text-7xl mb-4">
              <span className="hover-glow">About GRIMS</span>
            </h1>
            <p className="text-xl text-neon-blue font-display">Global Recon Invincible Mission Squad</p>
          </div>

          {/* Mission Statement */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-12 border border-neon-blue/30">
            <div className="flex items-center space-x-4 mb-6">
              <Shield className="w-12 h-12 text-neon-blue" />
              <h2 className="font-display font-bold text-3xl">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              <span className="text-neon-blue font-bold">We form alliance to manifest our missions.</span>
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              GRIMS is an elite Call of Duty Mobile tactical unit, forged in the fires of competitive warfare. We are a brotherhood of skilled operators who execute precision strikes, coordinate flawless strategies, and dominate every battlefield we enter. Our squad represents the pinnacle of CODM excellence, where every member is trained, disciplined, and ready for combat at a moment's notice.
            </p>
          </div>

          {/* Core Values */}
          <div className="mb-12">
            <h2 className="font-display font-bold text-3xl text-center mb-8">
              <span className="hover-glow">Our Core Values</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6 card-hover border border-neon-blue/20">
                <Target className="w-10 h-10 text-neon-red mb-4" />
                <h3 className="font-display font-bold text-xl mb-3">Tactical Excellence</h3>
                <p className="text-gray-400">
                  Every mission is executed with military precision. We study maps, analyze opponents, and deploy strategies that leave no room for error. Victory is our only acceptable outcome.
                </p>
              </div>

              <div className="glass rounded-xl p-6 card-hover border border-neon-yellow/20">
                <Users className="w-10 h-10 text-neon-yellow mb-4" />
                <h3 className="font-display font-bold text-xl mb-3">Brotherhood</h3>
                <p className="text-gray-400">
                  No soldier left behind. GRIMS operates as one unit, where trust, loyalty, and teamwork are not just values—they're survival requirements. We rise together or not at all.
                </p>
              </div>

              <div className="glass rounded-xl p-6 card-hover border border-neon-purple/20">
                <Zap className="w-10 h-10 text-neon-purple mb-4" />
                <h3 className="font-display font-bold text-xl mb-3">Relentless Training</h3>
                <p className="text-gray-400">
                  Champions aren't born—they're forged through discipline and dedication. Every squad member commits to constant improvement, mastering their craft until perfection becomes routine.
                </p>
              </div>
            </div>
          </div>

          {/* What We Play */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-12 border border-neon-red/30">
            <div className="flex items-center space-x-4 mb-6">
              <Crosshair className="w-12 h-12 text-neon-red" />
              <h2 className="font-display font-bold text-3xl">Our Arena</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display font-bold text-xl text-neon-blue mb-4">Call of Duty: Mobile</h3>
                <p className="text-gray-300 leading-relaxed">
                  The battlefield where legends are made. GRIMS dominates across all game modes—from the tactical intensity of Search & Destroy to the chaos of Battle Royale. We master every weapon, every map, every angle. When GRIMS enters the server, opponents know they're facing warriors who've earned their stripes through blood, sweat, and countless hours of combat training.
                </p>
              </div>
              <div className="glass rounded-xl p-6 bg-gradient-to-br from-neon-blue/5 to-neon-red/5">
                <h4 className="font-display font-bold mb-4 text-neon-yellow">Specializations</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center"><Trophy className="w-4 h-4 text-neon-blue mr-2" /> Ranked Multiplayer Dominance</li>
                  <li className="flex items-center"><Trophy className="w-4 h-4 text-neon-blue mr-2" /> Battle Royale Squad Tactics</li>
                  <li className="flex items-center"><Trophy className="w-4 h-4 text-neon-blue mr-2" /> Tournament Competition</li>
                  <li className="flex items-center"><Trophy className="w-4 h-4 text-neon-blue mr-2" /> Objective-Based Warfare</li>
                  <li className="flex items-center"><Trophy className="w-4 h-4 text-neon-blue mr-2" /> Sniper & Assault Operations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Join Us */}
          <div className="glass rounded-2xl p-8 md:p-12 text-center border border-neon-purple/30">
            <Shield className="w-16 h-16 text-neon-purple mx-auto mb-6" />
            <h2 className="font-display font-bold text-3xl mb-4">Join the Elite</h2>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
              Think you have what it takes to stand shoulder-to-shoulder with the best? GRIMS is always scouting for warriors who possess skill, dedication, and the heart of a champion. If you're ready to elevate your game and join a squad that represents the peak of CODM excellence, connect with us.
            </p>
            <a
              href="https://chat.whatsapp.com/HGVFehBnrfH7KFPikHKPcH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              Join GRIMS on WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
