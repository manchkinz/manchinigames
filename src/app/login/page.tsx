'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleAuth = async (type: 'LOGIN' | 'SIGNUP') => {
    setLoading(true)
    setMessage('')
    
    const { error } = type === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(`Hata: ${error.message}`)
    } else {
      setMessage(type === 'LOGIN' ? 'Giriş başarılı! Yönlendiriliyorsunuz...' : 'Kayıt başarılı! E-postanızı kontrol edin.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">ManchiniGames</h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-posta Adresiniz"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Şifreniz"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="flex gap-4">
            <button
              onClick={() => handleAuth('LOGIN')}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition disabled:opacity-50"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => handleAuth('SIGNUP')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded font-bold transition disabled:opacity-50"
            >
              Kayıt Ol
            </button>
          </div>
          
          {message && <p className="text-center text-sm mt-4 text-yellow-400">{message}</p>}
        </div>
      </div>
    </div>
  )
}