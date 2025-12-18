'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bitcoin, CreditCard, Send, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function HowToBuyPage() {
  const [formData, setFormData] = useState({ full_name: '', email: '', message: '' })
  const [status, setStatus] = useState({ text: '', type: '' })
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('messages').insert([formData])
    if (!error) {
      setStatus({ text: 'Mesajınız başarıyla iletildi!', type: 'success' })
      setFormData({ full_name: '', email: '', message: '' })
    } else {
      setStatus({ text: 'Bir hata oluştu.', type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest italic"><ArrowLeft size={16}/> Geri Dön</button>

        <div className="text-center">
          <h1 className="text-5xl font-black italic text-blue-500 tracking-tighter">ÖDEME SEÇENEKLERİ</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">ManchiniGames Premium Üyelik</p>
        </div>

        {/* ÖDEME KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* KRİPTO KARTI */}
          <div className="bg-[#0a0a0b] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors"><Bitcoin size={80}/></div>
            <h3 className="text-2xl font-black italic mb-4">KRİPTO (USDT)</h3>
            <p className="text-xs text-gray-500 font-bold mb-6">Ağ: <span className="text-blue-500 uppercase">TRC20</span></p>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 break-all font-mono text-xs text-blue-400 mb-6 select-all cursor-pointer">
              TNVxR4mR9u8z7xQp2wE1m3zXy9Wv8b7n6m
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed italic">
              * Ödemeyi yaptıktan sonra işlem numarası (TXID) ile birlikte aşağıdaki formdan veya Discord üzerinden bize ulaşın.
            </p>
          </div>

          {/* IYZICO KARTI */}
          <div className="bg-[#0a0a0b] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors"><CreditCard size={80}/></div>
            <h3 className="text-2xl font-black italic mb-4">IYZICO / KART</h3>
            <p className="text-xs text-gray-400 mb-8 font-medium">Kredi kartı veya Banka kartı ile güvenli ödeme yapın.</p>
            <button 
              onClick={() => window.open('https://iyzi.link/your-payment-link', '_blank')}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
            >
              IYZICO İLE ÖDE
            </button>
          </div>
        </div>

        {/* ÖNEMLİ UYARI */}
        <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[2rem] flex items-start gap-4">
          <AlertTriangle className="text-blue-500 shrink-0" size={24}/>
          <p className="text-sm font-bold text-gray-300">
            DİKKAT: Ödeme yapmadan önce veya sonra sitemizden bir hesap oluşturmanız ve kayıtlı mail adresinizi bize iletmeniz zorunludur. Aksi takdirde abonelik aktifleştirilemez.
          </p>
        </div>

        {/* İLETİŞİM FORMU */}
        <div className="bg-[#0a0a0b] border border-white/5 p-12 rounded-[3rem] shadow-2xl">
          <h3 className="text-3xl font-black italic mb-8">BİZE ULAŞIN</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputBox label="Ad Soyad" placeholder="Adınız Soyadınız" value={formData.full_name} onChange={(v: string) => setFormData({...formData, full_name: v})} />
              <InputBox label="Kayıtlı Mail" placeholder="Sitemizdeki Mail Adresiniz" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Mesajınız</label>
              <textarea 
                required
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-bold focus:border-blue-500 outline-none transition-all h-40" 
                placeholder="Ödeme detayları veya sorunuz..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest">
              MESAJI GÖNDER <Send size={20}/>
            </button>
          </form>
          {status.text && (
            <div className={`mt-6 p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest border ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {status.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InputBox({ label, placeholder, value, onChange }: { label: string, placeholder: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase ml-2">{label}</label>
      <input required type="text" value={value} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all" onChange={e => onChange(e.target.value)} />
    </div>
  )
}