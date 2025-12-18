'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Gamepad2, Download, Zap, ShieldCheck, ArrowRight, X, Mail, Lock } from 'lucide-react'

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

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
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] italic">
          OYUNLARIN <br/> <span className="text-blue-500">YENİ ADRESİ</span>
        </h2>
        <p className="max-w-xl text-gray-500 font-medium text-lg mb-10 leading-relaxed">
          Kütüphanene yüzlerce oyunu anında ekle. Sadece abonelere özel yüksek hızlı indirme ve online erişim avantajını yakala.
        </p>
        {/* Yeni Sayfaya Yönlendiren Buton */}
        <button 
          onClick={() => router.push('/how-to-buy')}
          className="group bg-blue-600 text-white px-12 py-5 rounded-2xl font-black italic flex items-center gap-3 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
        >
          HEMEN ABONE OL <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* Özellikler Kartları Buraya Gelebilir (Daha önceki FeatureCard'lar kullanılabilir) */}

      {/* Abonelik Planı (Sadece Aylık) */}
      <section className="py-24 px-8 max-w-xl mx-auto text-center">
        <h3 className="text-3xl font-black mb-12 italic tracking-tight">PREMIUM ÜYELİK</h3>
        <div className="bg-[#0a0a0b] border border-white/5 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>
          <h4 className="text-xl font-bold text-gray-400 mb-2">30 Günlük Erişim</h4>
          <p className="text-6xl font-black text-white mb-8 italic">99 TL</p>
          <div className="space-y-4 mb-10 text-left max-w-[240px] mx-auto">
            <div className="flex items-center gap-3 text-sm font-bold text-gray-300"><Zap size={16} className="text-blue-500"/> Tüm Oyunlara Erişim</div>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-300"><Zap size={16} className="text-blue-500"/> Yüksek Hızlı İndirme</div>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-300"><Zap size={16} className="text-blue-500"/> Online Mod Desteği</div>
          </div>
          <button 
            onClick={() => router.push('/how-to-buy')}
            className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
          >
            PLANI SATIN AL
          </button>
        </div>
      </section>

      {/* Auth Modal (Giriş/Kayıt için kalmaya devam ediyor) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="relative bg-[#0a0a0b] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24}/></button>
            <div className="text-center mb-10">
              <h4 className="text-2xl font-black italic">Manchini<span className="text-blue-500">Games</span></h4>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="email" placeholder="E-Posta" required className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Şifre" required className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all" onChange={e => setPassword(e.target.value)} />
              <button disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl mt-4 shadow-lg shadow-blue-600/20">{loading ? 'İŞLENİYOR...' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL')}</button>
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