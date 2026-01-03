'use client'

import { useState, useEffect } from 'react'
import { Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

export default function NewsFeed() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    // Simulated news data with working image URLs
    const fetchNews = async () => {
      try {
        const mockNews = [
          {
            id: 1,
            title: "Season 1 2025: New Year Launch",
            description: "Start the new year with explosive new content! Season 1 brings new maps, weapons, and game modes to CODM.",
            date: "2025-01-01",
            image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
            link: "https://www.callofduty.com/blog/mobile"
          },
          {
            id: 2,
            title: "New Mythic Weapon: Legendary Arsenal",
            description: "The legendary weapon gets a mythic variant with stunning visual effects and unique animations.",
            date: "2024-12-28",
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
            link: "https://www.callofduty.com/blog/mobile"
          },
          {
            id: 3,
            title: "Ranked Season Reset and Rewards",
            description: "New ranked season begins! Check out the latest rewards and climb the ladder in CODM's competitive mode.",
            date: "2024-12-25",
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
            link: "https://www.callofduty.com/blog/mobile"
          },
          {
            id: 4,
            title: "Battle Royale Map Update",
            description: "Explore the updated Battle Royale map with new locations, loot spots, and tactical advantages.",
            date: "2024-12-20",
            image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
            link: "https://www.callofduty.com/blog/mobile"
          },
          {
            id: 5,
            title: "Limited Time Event: Winter Warfare",
            description: "Jump into the Winter Warfare event with exclusive rewards, challenges, and seasonal content.",
            date: "2024-12-15",
            image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
            link: "https://www.callofduty.com/blog/mobile"
          }
        ]

        await new Promise(resolve => setTimeout(resolve, 1000))
        setNews(mockNews)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching news:', error)
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (news.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % news.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [news.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % news.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + news.length) % news.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-12">
            <span className="hover-glow">CODM News</span>
          </h2>
          <div className="glass rounded-xl p-6 loading-shimmer h-96"></div>
        </div>
      </section>
    )
  }

  if (news.length === 0) {
    return null
  }

  const currentNews = news[currentSlide]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-bg opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-4">
          <span className="hover-glow">CODM News</span>
        </h2>
        <p className="text-gray-400 text-center mb-12">Stay updated with the latest Call of Duty: Mobile content</p>

        {/* Main Slider */}
        <div className="relative max-w-6xl mx-auto">
          {/* Featured Article */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Side */}
              <div className="relative h-64 md:h-auto overflow-hidden group">
                <img 
                  src={currentNews.image}
                  alt={currentNews.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-neon-blue/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border border-neon-blue/50">
                  🎮 CODM NEWS
                </div>
              </div>

              {/* Content Side */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentNews.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>

                <h3 className="font-display font-bold text-3xl md:text-4xl mb-4 animate-slide-up">
                  {currentNews.title}
                </h3>

                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {currentNews.description}
                </p>

                <a
                  href={currentNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-display font-bold hover:scale-105 transition-transform w-fit group"
                >
                  <span>Read Full Article</span>
                  <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-neon-blue/20 transition-all z-20 group"
            aria-label="Previous article"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-neon-blue/20 transition-all z-20 group"
            aria-label="Next article"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center space-x-2 mt-8">
            {news.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-neon-blue' 
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to article ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {news.map((article, index) => (
              <button
                key={article.id}
                onClick={() => goToSlide(index)}
                className={`glass rounded-lg overflow-hidden transition-all hover:scale-105 ${
                  index === currentSlide ? 'ring-2 ring-neon-blue' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-24 object-cover"
                />
                <div className="p-3">
                  <p className="text-xs font-bold line-clamp-2">{article.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="https://www.callofduty.com/blog/mobile"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 glass rounded-lg font-medium hover:bg-neon-blue/10 transition-colors group"
          >
            <span>View All CODM News</span>
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}
