'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const supabase = createClient()
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setLoading(false)
    } else {
      if (isLogin) {
        setMessage({ text: 'Giriş başarılı! Yönlendiriliyorsunuz...', type: 'success' })
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh() // Proxy.js'in yeni session'ı tanıması için
        }, 1000)
      } else {
        setMessage({ text: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', type: 'success' })
        setIsLogin(true)
        setLoading(false)
      }
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050506] overflow-hidden font-sans">
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* --- ANA KART --- */}
      <div className="relative w-full max-w-[440px] px-6">
        <div className="bg-[#0a0a0b]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          
          {/* Logo Bölümü */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-[ -0.05em] text-white">
              MANCHINI<span className="text-blue-500">GAMES</span>
            </h1>
            <p className="text-gray-500 text-xs mt-3 font-bold uppercase tracking-[0.2em]">
              {isLogin ? 'Hoş Geldin Oyuncu' : 'Yeni Üyelik Oluştur'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                required 
                placeholder="E-posta adresi"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="password" 
                required 
                placeholder="Şifre"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="group relative w-full bg-white text-black font-black py-4 rounded-2xl overflow-hidden hover:bg-blue-500 hover:text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'LÜTFEN BEKLEYİN...' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL')}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </div>
            </button>
          </form>

          {/* Geçiş Butonu */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage({ text: '', type: '' });
              }}
              className="flex items-center justify-center gap-2 w-full text-sm font-bold text-gray-500 hover:text-white transition-colors py-2"
            >
              {isLogin ? (
                <>
                  <UserPlus size={16} /> Hesabın yok mu? <span className="text-blue-500">Kayıt Ol</span>
                </>
              ) : (
                <>
                  <LogIn size={16} /> Zaten üye misin? <span className="text-blue-500">Giriş Yap</span>
                </>
              )}
            </button>
          </div>

          {/* Bildirim Mesajı */}
          {message.text && (
            <div className={`mt-6 p-4 rounded-2xl text-[11px] font-black uppercase tracking-wider text-center border ${
              message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}