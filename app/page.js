import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import NewsFeed from '@/components/NewsFeed'
import MiniLeaderboard from '@/components/MiniLeaderboard'
import TournamentPreview from '@/components/TournamentPreview'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Hero />
        <NewsFeed />
        <MiniLeaderboard />
        <TournamentPreview />
      </main>
      <Footer />
    </>
  )
}
