'use client'
import { useState, useEffect } from 'react' // useEffect eklendi
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const supabase = createClient()
  const router = useRouter()

  // SIKINTI ÇÖZÜCÜ: Eğer kullanıcı zaten giriş yapmışsa direkt Dashboard'a atar
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage({ text: `Hata: ${error.message}`, type: 'error' })
    } else {
      if (isLogin) {
        setMessage({ text: 'Giriş başarılı! Yönlendiriliyorsunuz...', type: 'success' })
        // 1.5 saniye bekleme, kullanıcıya başarı mesajını okutmak içindir
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setMessage({ text: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', type: 'success' })
        setIsLogin(true) // Kayıttan sonra otomatik giriş moduna geçer
      }
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0b] overflow-hidden">
      {/* Arka Plan Dekorasyonu */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            MANCHINI<span className="text-white">GAMES</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {isLogin ? 'Kaldığın yerden devam et' : 'Oyun dünyasına ilk adımını at'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">E-posta</label>
            <input
              type="email"
              required
              value={email}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder:text-gray-600"
              placeholder="isim@mail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Şifre</label>
            <input
              type="password"
              required
              value={password}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder:text-gray-600"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'İşlem yapılıyor...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Bir hesabın yok mu? " : "Zaten üye misin? "}
            <span className="text-blue-400 font-bold underline underline-offset-4 decoration-blue-500/30">
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </span>
          </button>
        </div>

        {message.text && (
          <div className={`mt-6 p-4 rounded-xl text-center text-sm font-medium border ${
            message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}