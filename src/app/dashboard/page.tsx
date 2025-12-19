'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Gamepad2, Download, CreditCard, Settings, LogOut, Zap, 
  Search, User, AlertCircle, Globe, Calendar, Clock
} from 'lucide-react'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('library') // 'library' veya 'billing'
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.replace('/')

      // 1. Kullanıcı profilini çekiyoruz
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        // --- OTOMATİK ABONELİK SÜRE KONTROLÜ ---
        const now = new Date()
        const endDate = profileData.subscription_end_date ? new Date(profileData.subscription_end_date) : null

        // Eğer abonelik 'active' ise ve bitiş tarihi geçmişse
        if (profileData.subscription_status === 'active' && endDate && endDate < now) {
          // Veritabanında statüyü 'none' yapıyoruz
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'none', 
              subscription_end_date: null,
              subscription_start_date: null 
            })
            .eq('id', session.user.id)
          
          // State'i güncelleyerek ekranın anında değişmesini sağlıyoruz
          setProfile({ ...profileData, subscription_status: 'none' })
        } else {
          setProfile(profileData)
        }
      }

      // 2. Oyunları çekiyoruz
      const { data: gamesData } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })

      setGames(gamesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Planları İncele veya Çıkış Yap butonu işlemi
  const handleSignOutAndRedirect = async () => {
    await supabase.auth.signOut()
    window.location.href = '/' // Güvenli hard redirect
  }

  // Kalan Gün Sayısını Hesapla
  const calculateRemainingDays = (endDate: string) => {
    if (!endDate) return 0
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (loading) return <div className="min-h-screen bg-[#050506] flex items-center justify-center text-blue-500 font-black italic tracking-widest">YÜKLENİYOR...</div>

  // --- ABONELİK YOKSA (UYARI EKRANI) ---
  if (!profile || profile.subscription_status === 'none') {
    return (
      <div className="min-h-screen bg-[#050506] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-500">
          <AlertCircle size={60} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 tracking-tighter italic">ABONELİK BULUNMUYOR</h2>
          <p className="text-gray-500 mb-8 font-medium">Oyun kütüphanesine erişmek ve indirme yapmak için aktif bir Premium üyeliğinizin olması gerekir.</p>
          <button 
            onClick={handleSignOutAndRedirect}
            className="w-full py-5 bg-red-600 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
          >
            PLANLARI İNCELE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050506] text-gray-200 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0a0a0b] flex flex-col hidden md:flex p-8 shadow-2xl">
        <h1 className="text-xl font-black text-blue-500 mb-10 italic uppercase tracking-tighter">Manchini<span className="text-white">Games</span></h1>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'library' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-white/5'}`}
          >
            <Gamepad2 size={20}/> Kütüphanem
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'billing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-white/5'}`}
          >
            <CreditCard size={20}/> Faturalandırma
          </button>
        </nav>
        <button onClick={handleSignOutAndRedirect} className="mt-auto flex items-center gap-4 text-red-500 p-4 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/5 rounded-2xl transition-all">
          <LogOut size={20}/> Çıkış Yap
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto bg-[#050506]">
        {/* Üst Header */}
        <header className="flex justify-between items-center mb-10 bg-[#0a0a0b]/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input type="text" placeholder="Kütüphanende ara..." className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-700" />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right text-xs">
                <p className="text-blue-500 font-black uppercase tracking-widest">{profile.subscription_status}</p>
                <p className="font-black text-white text-sm italic">{profile.email.split('@')[0]}</p>
             </div>
             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20 uppercase">
                {profile.email[0]}
             </div>
          </div>
        </header>

        {/* --- FATURALANDIRMA SEKMESİ --- */}
        {activeTab === 'billing' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <h2 className="text-4xl font-black italic tracking-tighter">FATURALANDIRMA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0a0a0b] border border-white/5 p-10 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><CreditCard size={120}/></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Mevcut Plan</p>
                    <h3 className="text-2xl font-black text-white uppercase italic">{profile.subscription_status === 'unlimited' ? 'Sınırsız VIP' : '30 Günlük Premium'}</h3>
                  </div>
                  <div className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-green-500/20 uppercase">AKTİF</div>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar size={16}/> Başlangıç Tarihi:</span>
                    <span className="text-white">{profile.subscription_start_date ? new Date(profile.subscription_start_date).toLocaleDateString('tr-TR') : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar size={16}/> Bitiş Tarihi:</span>
                    <span className="text-white">{profile.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString('tr-TR') : 'Sınırsız'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-600/20 flex flex-col justify-between group">
                <div>
                  <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 group-hover:scale-110 transition-transform"><Clock size={24} className="text-white"/></div>
                  <p className="text-blue-100 font-black uppercase tracking-widest text-[10px]">Kalan Kullanım Süresi</p>
                  <h4 className="text-7xl font-black text-white mt-2 italic tracking-tighter">
                    {profile.subscription_status === 'unlimited' ? '∞' : calculateRemainingDays(profile.subscription_end_date)}
                    <span className="text-lg ml-2">{profile.subscription_status === 'unlimited' ? '' : 'GÜN'}</span>
                  </h4>
                </div>
                <p className="text-blue-100/60 text-xs font-bold uppercase tracking-tight mt-6 italic">Aboneliğiniz bittiğinde erişiminiz otomatik olarak kesilir.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- KÜTÜPHANEM SEKMESİ (VERİTABANINDAN) --- */}
        {activeTab === 'library' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {games.length > 0 ? games.map((game) => (
              <div key={game.id} className="group bg-[#0a0a0b] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all shadow-xl relative">
                <div className="h-56 relative overflow-hidden">
                  <img src={game.image_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black border border-white/10 flex items-center gap-1">
                    <Globe size={10} className={game.online_access ? 'text-green-500' : 'text-red-500'} />
                    {game.online_access ? 'ONLINE DESTEKLİ' : 'OFFLINE MOD'}
                  </div>
                </div>
                <div className="p-8">
                  <div className="mb-6">
                    <h4 className="font-black text-2xl text-white group-hover:text-blue-500 transition-colors uppercase italic tracking-tighter">{game.name}</h4>
                    <p className="text-[10px] text-gray-600 font-black mt-1 uppercase tracking-widest italic">Versiyon: {game.version}</p>
                  </div>
                  <button 
                    onClick={() => window.open(game.download_url, '_blank')}
                    className="w-full py-4 bg-white/5 hover:bg-blue-600 text-blue-500 hover:text-white rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 shadow-lg hover:shadow-blue-600/10"
                  >
                    <Download size={20} /> HEMEN İNDİR
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-gray-700 font-black italic uppercase tracking-widest">Kütüphanede henüz oyun bulunmuyor...</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}