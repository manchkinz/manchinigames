'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage({ text: `Hata: ${error.message}`, type: 'error' })
      setLoading(false)
    } else {
      if (isLogin) {
        setMessage({ text: 'Giriş başarılı! Yönlendiriliyorsunuz...', type: 'success' })
        
        // EN KESİN YÖNTEM: 1 saniye sonra sayfayı tamamen yenileyerek dashboard'a git
        setTimeout(() => {
          window.location.assign('/dashboard')
        }, 1000)
      } else {
        setMessage({ text: 'Kayıt başarılı! Giriş yapabilirsiniz.', type: 'success' })
        setIsLogin(true)
        setLoading(false)
      }
    }
  }

  return (
    // ... (Mevcut şık tasarım kodun burada kalsın, sadece handleAuth kısmını değiştirdik)
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0b] overflow-hidden">
      {/* Tasarım kodlarını aynen koru... */}
      <div className="relative w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            MANCHINI<span className="text-white">GAMES</span>
          </h1>
        </div>
        <form onSubmit={handleAuth} className="space-y-5">
          <input type="email" required className="w-full p-3 bg-black/40 text-white rounded-xl border border-white/5" placeholder="E-posta" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required className="w-full p-3 bg-black/40 text-white rounded-xl border border-white/5" placeholder="Şifre" onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl">{loading ? 'Bekleyin...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}</button>
        </form>
        {message.text && <div className="mt-4 text-center text-sm text-blue-400">{message.text}</div>}
      </div>
    </div>
  )
}