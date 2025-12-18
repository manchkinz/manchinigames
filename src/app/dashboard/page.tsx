'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login') // Giriş yapmamışsa login'e at
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center font-bold">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <h1 className="text-2xl font-bold tracking-tighter text-blue-400">MANCHINI<span className="text-white">GAMES</span> / PANEL</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-all text-sm font-bold"
          >
            Çıkış Yap
          </button>
        </header>

        <main className="grid gap-6">
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-2">Hoş geldin, Oyuncu!</h2>
            <p className="text-gray-400">Giriş yapılan hesap: <span className="text-blue-400 font-mono">{user.email}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Kütüphane', 'Profilim', 'Ayarlar'].map((item) => (
              <div key={item} className="p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer group">
                <h3 className="font-bold group-hover:text-blue-400">{item}</h3>
                <p className="text-xs text-gray-500 mt-1">Çok yakında burada...</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}