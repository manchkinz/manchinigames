'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true) // Yüklenme durumu eklendi
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login') // Giriş yapmamışsa login'e atar
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth]) // Bağımlılıklar eklendi

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login') // Çıkış sonrası yönlendirme
  }

  // Yükleniyor ekranını daha şık bir spinner ile değiştirdik
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header kısmı login sayfasındaki logo stiliyle uyumlu hale getirildi */}
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <h1 className="text-2xl font-bold tracking-tighter text-blue-400">
            MANCHINI<span className="text-white">GAMES</span> <span className="text-gray-500 text-sm ml-2">/ PANEL</span>
          </h1>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all text-sm font-bold"
          >
            Güvenli Çıkış
          </button>
        </header>

        <main className="grid gap-8">
          {/* Karşılama Alanı */}
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-2 text-white">Hoş geldin, Oyuncu! 🕹️</h2>
            <p className="text-gray-400">Aktif Hesap: <span className="text-blue-400 font-mono">{user?.email}</span></p>
          </div>

          {/* Aksiyon Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer group">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">Kütüphane</h3>
              <p className="text-sm text-gray-500 mt-2">Comic Book projelerin ve oyunların burada listelenecek.</p>
            </div>
            
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-green-500/30 transition-all cursor-pointer group">
              <div className="text-2xl mb-3">⚔️</div>
              <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors">Keys and Knives</h3>
              <p className="text-sm text-gray-500 mt-2">FiveM script yönetim paneli ve son duyurular.</p>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all cursor-pointer group">
              <div className="text-2xl mb-3">⚙️</div>
              <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors">Profil Ayarları</h3>
              <p className="text-sm text-gray-500 mt-2">Hesap bilgilerini ve aboneliklerini yönet.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}