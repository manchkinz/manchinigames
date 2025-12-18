'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Gamepad2, Download, CreditCard, Settings, LogOut, Zap, 
  Search, User, AlertCircle, Globe
} from 'lucide-react'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [games, setGames] = useState<any[]>([]) // Veritabanından gelecek oyunlar
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.replace('/')

      // 1. Kullanıcı Profili
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      
      // 2. Veritabanındaki GERÇEK Oyunlar
      const { data: gamesData } = await supabase.from('games').select('*').order('created_at', { ascending: false })

      setProfile(profileData)
      setGames(gamesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="min-h-screen bg-[#050506] flex items-center justify-center text-blue-500 font-black">YÜKLENİYOR...</div>

  // --- ABONELİK YOKSA ---
  if (!profile || profile.subscription_status === 'none') {
    return (
      <div className="min-h-screen bg-[#050506] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-12">
          <AlertCircle size={60} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">Abonelik Bulunmuyor</h2>
          <p className="text-gray-500 mb-8">Oyunlara erişmek ve indirmek için aktif bir üyeliğinizin olması gerekir.</p>
          <button className="w-full py-4 bg-red-600 rounded-2xl font-black shadow-lg shadow-red-600/20">PLANLARI İNCELE</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050506] text-gray-200 flex">
      {/* Sidebar - Burası aynı kalabilir, yukarıdaki gibi NavItem'lar ekli */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0b] flex flex-col hidden md:flex p-8">
        <h1 className="text-xl font-black text-blue-500 mb-10">MANCHINI<span className="text-white">GAMES</span></h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500 font-bold bg-blue-500/10 p-4 rounded-2xl"><Gamepad2 size={20}/> Kütüphanem</div>
          <div className="flex items-center gap-3 text-gray-500 p-4"><CreditCard size={20}/> Faturalandırma</div>
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => router.replace('/'))} className="mt-auto flex items-center gap-3 text-red-500 p-4 font-bold"><LogOut size={20}/> Çıkış Yap</button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Üst Kısım */}
        <header className="flex justify-between items-center mb-10 bg-[#0a0a0b]/50 p-6 rounded-[2rem] border border-white/5">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input type="text" placeholder="Kütüphanende ara..." className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm" />
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right text-xs"><p className="text-gray-500 font-bold">PREMIUM</p><p className="font-black text-white">{profile.email.split('@')[0]}</p></div>
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">M</div>
          </div>
        </header>

        {/* Oyun Listesi (Veritabanından Gelenler) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.length > 0 ? games.map((game) => (
            <div key={game.id} className="group bg-[#0a0a0b] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all">
              <div className="h-56 relative overflow-hidden">
                <img src={game.image_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black border border-white/10 flex items-center gap-1">
                  <Globe size={10} className={game.online_access ? 'text-green-500' : 'text-red-500'} />
                  {game.online_access ? 'ONLINE VAR' : 'SADECE OFFLINE'}
                </div>
              </div>
              <div className="p-8">
                <div className="mb-6">
                  <h4 className="font-black text-2xl text-white group-hover:text-blue-500 transition-colors">{game.name}</h4>
                  <p className="text-xs text-gray-600 font-bold mt-1 uppercase tracking-widest italic">Versiyon: {game.version}</p>
                </div>
                {/* İndirme Butonu: Admin'in girdiği download_url'e gider */}
                <button 
                  onClick={() => window.open(game.download_url, '_blank')}
                  className="w-full py-4 bg-white/5 hover:bg-blue-600 text-blue-500 hover:text-white rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-3 font-black"
                >
                  <Download size={20} /> HEMEN İNDİR
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-gray-600 font-bold italic">Kütüphanede henüz oyun bulunmuyor...</div>
          )}
        </div>
      </main>
    </div>
  )
}