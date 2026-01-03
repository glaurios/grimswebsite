import './globals.css'

export const metadata = {
  title: 'GRIMS - Global Recon Invincible Mission Squad',
  description: 'Call of Duty Mobile competitive gaming community. Join GRIMS for tournaments, leaderboards, and elite CODM action.',
  keywords: 'CODM, Call of Duty Mobile, gaming community, tournaments, leaderboard, GRIMS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-dark-bg text-white antialiased">
        {children}
      </body>
    </html>
  )
}
