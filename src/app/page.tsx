'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Gamepad2, Download, Zap, ShieldCheck, ArrowRight, 
  X, Mail, Lock, Globe, Layers 
} from 'lucide-react'

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [games, setGames] = useState<any[]>([])
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchGames = async () => {
      // Oyunları çekiyoruz
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)
      
      if (error) {
        console.error("Oyunlar çekilemedi:", error.message)
      } else if (data) {
        setGames(data)
      }
    }
    fetchGames()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (!error) window.location.href = '/dashboard'
    else { alert(error.message); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white selection:bg-blue-500/30 font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#050506]/80 backdrop-blur-md border-b border-white/5 px-8 h-20 flex items-center justify-between">
        <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">Manchini<span className="text-white">Games</span></h1>
        <div className="flex gap-4">
          <button onClick={() => { setIsLogin(true); setShowAuthModal(true); }} className="text-xs font-black uppercase tracking-widest hover:text-blue-500 transition-colors">Giriş Yap</button>
          <button onClick={() => { setIsLogin(false); setShowAuthModal(true); }} className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white">Kayıt Ol</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-8 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] italic animate-in fade-in slide-in-from-top-4 duration-1000">
          MANCHINI <br/> <span className="text-blue-500">GAMES</span>
        </h2>
        <p className="max-w-xl text-gray-500 font-medium text-lg mb-10 leading-relaxed">
          Kütüphanene yüzlerce oyunu anında ekle. Sadece abonelere özel yüksek hızlı indirme ve online erişim avantajını yakala.
        </p>
        <button 
          onClick={() => router.push('/how-to-buy')}
          className="group bg-blue-600 text-white px-12 py-5 rounded-2xl font-black italic flex items-center gap-3 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
        >
          HEMEN ABONE OL <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* Oyun Kütüphanesi Tanıtımı */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">
              <Layers size={14} /> Kütüphaneyi Keşfet
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter">POPÜLER OYUNLAR</h3>
          </div>
          <p className="text-gray-500 text-sm font-bold max-w-sm">
            Sistemimize her gün yeni oyunlar eklenmektedir. İşte şu an en çok ilgi görenlerden bazıları.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.length > 0 ? games.map((game) => (
            <div key={game.id} className="group bg-[#0a0a0b] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all shadow-xl">
              <div className="h-64 relative overflow-hidden">
                <img src={game.image_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black border border-white/10 flex items-center gap-1">
                  <Globe size={10} className={game.online_access ? 'text-green-500' : 'text-red-500'} />
                  {game.online_access ? 'ONLINE DESTEKLİ' : 'OFFLINE MOD'}
                </div>
              </div>
              <div className="p-8">
                <h4 className="font-black text-xl text-white mb-2 tracking-tight group-hover:text-blue-500 transition-colors uppercase italic">{game.name}</h4>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  <span>Sürüm: {game.version}</span>
                  <span className="text-blue-500">Premium Erişim</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
               <p className="text-gray-600 font-bold italic">Kütüphanede henüz oyun bulunmuyor veya yükleniyor...</p>
            </div>
          )}
        </div>
      </section>

      {/* Premium Üyelik Kısmı */}
      <section className="py-24 px-8 max-w-xl mx-auto text-center">
        <h3 className="text-3xl font-black mb-12 italic tracking-tight">PREMIUM ÜYELİK</h3>
        <div className="bg-[#0a0a0b] border border-white/5 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>
          <p className="text-7xl font-black text-white mb-8 italic">99 TL</p>
          <div className="space-y-4 mb-10 text-left max-w-[240px] mx-auto text-gray-300 font-bold">
            <div className="flex items-center gap-3 text-sm"><Zap size={16} className="text-blue-500"/> Sınırsız Oyun Erişimi</div>
            <div className="flex items-center gap-3 text-sm"><Zap size={16} className="text-blue-500"/> Yüksek Hızlı Sunucular</div>
            <div className="flex items-center gap-3 text-sm"><Zap size={16} className="text-blue-500"/> Ücretsiz Güncellemeler</div>
          </div>
          <button 
            onClick={() => router.push('/how-to-buy')}
            className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-xl"
          >
            ABONE OL
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-lg">
          <div className="relative bg-[#0a0a0b] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24}/></button>
            <div className="text-center mb-10">
              <h4 className="text-2xl font-black italic tracking-tighter uppercase">Manchini<span className="text-blue-500">Games</span></h4>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="email" placeholder="E-Posta" required className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Şifre" required className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all" onChange={e => setPassword(e.target.value)} />
              <button disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl mt-4">{loading ? 'İŞLENİYOR...' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL')}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-[10px] text-gray-600 mt-6 font-black uppercase tracking-widest hover:text-white transition-colors">
              {isLogin ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten üye misin? Giriş Yap'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}