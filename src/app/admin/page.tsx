'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Users, LayoutDashboard, Gamepad2, LogOut, Trash2, 
  Plus, X, Edit3, Zap, Crown, Send, CheckCircle2 
} from 'lucide-react'

// TypeScript hatasını çözen Interface
interface InputBoxProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<any>(null)
  const [editingGame, setEditingGame] = useState<any>(null)
  const [gameForm, setGameForm] = useState({
    name: '', image_url: '', version: '', online_access: false, download_url: ''
  })

  const supabase = createClient()
  const router = useRouter()
  
  // Bildirim sesi için referans
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Çözülmemiş mesaj sayısını hesapla
  const unsolvedCount = messages.filter(m => !m.is_solved).length

  useEffect(() => {
    const init = async () => {
      await checkAdmin()
      await fetchData()
    }
    init()

    // --- REALTIME (CANLI) TAKİP ---
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => console.log("Ses izni bekleniyor..."))
          }
          fetchData()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // --- DİNAMİK TARAYICI SEKMESİ ---
  useEffect(() => {
    if (unsolvedCount > 0) {
      document.title = `(${unsolvedCount}) ManchiniGames | Admin`
    } else {
      document.title = `ManchiniGames | Admin`
    }
  }, [unsolvedCount])

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.replace('/')
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single()
    if (!profile?.is_admin) router.replace('/dashboard')
  }

  async function fetchData() {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    const { data: gamesData } = await supabase.from('games').select('*').order('created_at', { ascending: false })
    const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    
    if (profiles) setUsers(profiles)
    if (gamesData) setGames(gamesData)
    if (msgs) setMessages(msgs)
    setLoading(false)
  }

  // Abonelik Güncelleme (Tarihler Dahil)
  async function updateSub(userId: string, type: string) {
    let endDate = null
    let startDate = null

    if (type === 'active') {
      startDate = new Date().toISOString()
      const d = new Date(); d.setDate(d.getDate() + 30)
      endDate = d.toISOString()
    } else if (type === 'unlimited') {
      startDate = new Date().toISOString()
    }

    await supabase.from('profiles').update({ 
      subscription_status: type, 
      subscription_end_date: endDate,
      subscription_start_date: startDate 
    }).eq('id', userId)
    
    fetchData()
  }

  async function toggleSolved(id: string, currentStatus: boolean) {
    await supabase.from('messages').update({ is_solved: !currentStatus }).eq('id', id)
    fetchData()
  }

  async function handleSaveGame(e: React.FormEvent) {
    e.preventDefault()
    if (editingGame) {
      await supabase.from('games').update(gameForm).eq('id', editingGame.id)
    } else {
      await supabase.from('games').insert([gameForm])
    }
    setIsModalOpen(false)
    setEditingGame(null)
    setGameForm({ name: '', image_url: '', version: '', online_access: false, download_url: '' })
    fetchData()
  }

  async function deleteGame(id: string) {
    if(confirm('Bu oyunu silmek istediğine emin misin?')) {
      await supabase.from('games').delete().eq('id', id)
      fetchData()
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050506] flex items-center justify-center text-blue-500 font-black italic tracking-widest">YÜKLENİYOR...</div>

  return (
    <div className="flex h-screen bg-[#050506] text-gray-300 overflow-hidden font-sans">
      
      {/* Bildirim Sesi (Mixkit üzerinden örnek gaming bildirimi) */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0a0a0b] border-r border-white/5 flex flex-col h-full shadow-2xl">
        <div className="p-8">
          <h1 className="text-xl font-black text-blue-500 tracking-tighter italic uppercase">Manchini<span className="text-white">Admin</span></h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <SidebarBtn icon={<LayoutDashboard size={20}/>} label="Genel Bakış" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarBtn icon={<Users size={20}/>} label="Kullanıcılar" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarBtn icon={<Gamepad2 size={20}/>} label="Oyun Yönetimi" active={activeTab === 'games'} onClick={() => setActiveTab('games')} />
          
          <div className="relative">
            <SidebarBtn icon={<Send size={20}/>} label="İletişim" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
            {unsolvedCount > 0 && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 animate-bounce">
                {unsolvedCount}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#0a0a0b]">
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
            className="flex items-center gap-3 w-full p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]"
          >
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* --- ANA İÇERİK --- */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#050506]">
        
        {/* GENEL BAKIŞ */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-white tracking-tighter italic">GENEL BAKIŞ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatBox title="Kayıtlı Kullanıcılar" value={users.length} icon={<Users className="text-blue-500" />} />
              <StatBox title="Güncel Abonelikler" value={users.filter(u => u.subscription_status !== 'none').length} icon={<Zap className="text-yellow-500" />} />
              <StatBox title="Eklenen Oyunlar" value={games.length} icon={<Gamepad2 className="text-purple-500" />} />
            </div>
          </div>
        )}

        {/* KULLANICILAR (TARİHLER BURADA) */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black text-white tracking-tighter italic text-center">KULLANICI YÖNETİMİ</h2>
            <div className="bg-[#0a0a0b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="p-6">Kullanıcı E-Posta</th>
                    <th className="p-6 text-center">Abonelik & Tarihler</th>
                    <th className="p-6 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-6">
                        <p className="font-black text-white">{u.email}</p>
                        <p className="text-[9px] text-gray-600 mt-1 uppercase font-bold tracking-widest italic">Kayıt: {new Date(u.created_at).toLocaleDateString('tr-TR')}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col items-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${u.subscription_status === 'none' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                            {u.subscription_status === 'none' ? 'Abone Değil' : u.subscription_status}
                          </span>
                          {/* TARİH DETAYI */}
                          {u.subscription_status !== 'none' && (
                            <div className="mt-2 text-[9px] text-gray-500 font-bold uppercase text-center leading-tight">
                              Başlangıç: {u.subscription_start_date ? new Date(u.subscription_start_date).toLocaleDateString('tr-TR') : '—'} <br/>
                              Bitiş: {u.subscription_end_date ? new Date(u.subscription_end_date).toLocaleDateString('tr-TR') : 'Sınırsız'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button onClick={() => updateSub(u.id, 'active')} className="px-3 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase">+30 GÜN</button>
                        <button onClick={() => updateSub(u.id, 'unlimited')} className="px-3 py-2 bg-purple-600/10 text-purple-500 rounded-xl text-[9px] font-black hover:bg-purple-600 hover:text-white transition-all italic uppercase tracking-tighter">VIP</button>
                        <button onClick={() => updateSub(u.id, 'none')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OYUN YÖNETİMİ */}
        {activeTab === 'games' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black text-white tracking-tighter italic">OYUN YÖNETİMİ</h2>
              <button onClick={() => { setEditingGame(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                <Plus size={24} /> YENİ OYUN EKLE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map(game => (
                <div key={game.id} className="bg-[#0a0a0b] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
                  <div className="h-44 relative overflow-hidden">
                    <img src={game.image_url} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" alt="" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingGame(game); setGameForm(game); setIsModalOpen(true); }} className="p-2.5 bg-white text-black rounded-xl hover:bg-blue-500 hover:text-white transition-colors"><Edit3 size={18}/></button>
                      <button onClick={() => deleteGame(game.id)} className="p-2.5 bg-red-600 text-white rounded-xl"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="font-black text-xl text-white uppercase tracking-tight">{game.name}</h4>
                    <p className="text-[10px] font-black text-gray-500 uppercase mt-2 italic">v{game.version} | {game.online_access ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* İLETİŞİM / MESAJLAR */}
        {activeTab === 'messages' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black text-white tracking-tighter italic">GELEN MESAJLAR</h2>
            <div className="bg-[#0a0a0b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="p-6">Gönderen</th><th className="p-6">Mesaj Özeti</th><th className="p-6 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {messages.map(m => (
                    <tr key={m.id} className={`hover:bg-white/[0.02] transition-all cursor-pointer group ${m.is_solved ? 'opacity-40' : ''}`} onClick={() => setSelectedMsg(m)}>
                      <td className="p-6">
                        <p className={`font-black text-white ${m.is_solved ? 'line-through' : ''}`}>{m.full_name}</p>
                        <p className="text-[10px] text-gray-600">{m.email}</p>
                      </td>
                      <td className="p-6 max-w-xs truncate">
                        <p className={`text-sm text-gray-400 ${m.is_solved ? 'line-through' : ''}`}>{m.message}</p>
                      </td>
                      <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSolved(m.id, m.is_solved)} className={`p-2.5 rounded-xl transition-all ${m.is_solved ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}><CheckCircle2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL (EKLE / DÜZENLE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0a0a0b] border border-white/10 w-full max-w-lg rounded-[3rem] p-12 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
            <h3 className="text-3xl font-black mb-8 text-white tracking-tighter uppercase">{editingGame ? 'OYUNU DÜZENLE' : 'YENİ OYUN EKLE'}</h3>
            <form onSubmit={handleSaveGame} className="space-y-5">
              <InputBox label="Oyun Adı" placeholder="Örn: GTA VI" value={gameForm.name} onChange={(v: string) => setGameForm({...gameForm, name: v})} />
              <InputBox label="Görsel URL" placeholder="https://..." value={gameForm.image_url} onChange={(v: string) => setGameForm({...gameForm, image_url: v})} />
              <div className="grid grid-cols-2 gap-5">
                <InputBox label="Sürüm" placeholder="1.0.0" value={gameForm.version} onChange={(v: string) => setGameForm({...gameForm, version: v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Online Erişim</label>
                  <select value={String(gameForm.online_access)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all appearance-none" onChange={e => setGameForm({...gameForm, online_access: e.target.value === 'true'})}>
                    <option value="false" className="bg-[#0a0a0b]">Yok</option>
                    <option value="true" className="bg-[#0a0a0b]">Var</option>
                  </select>
                </div>
              </div>
              <InputBox label="İndirme Linki" placeholder="Google Drive, Mega vb." value={gameForm.download_url} onChange={(v: string) => setGameForm({...gameForm, download_url: v})} />
              <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl mt-6 shadow-xl shadow-blue-600/20 uppercase tracking-widest transition-all">
                {editingGame ? 'DEĞİŞİKLİKLERİ KAYDET' : 'SİSTEME EKLE'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MESAJ DETAY MODAL --- */}
      {selectedMsg && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
          <div className="bg-[#0a0a0b] border border-white/10 w-full max-w-lg rounded-[3rem] p-12 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedMsg(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Gönderen</p>
                <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase">{selectedMsg.full_name}</h4>
                <p className="text-sm text-gray-500 font-bold">{selectedMsg.email}</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] min-h-[200px] text-gray-300 leading-relaxed italic text-sm">
                {selectedMsg.message}
              </div>
              <button onClick={() => setSelectedMsg(null)} className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">PENCEREYİ KAPAT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- YARDIMCI BİLEŞENLER ---
function SidebarBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 w-full px-5 py-4 rounded-[1.25rem] font-black text-xs transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-white/5'}`}>
      {icon} <span>{label.toUpperCase()}</span>
    </button>
  )
}

function StatBox({ title, value, icon }: any) {
  return (
    <div className="bg-[#0a0a0b] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-xl">
      <div><p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{title}</p><p className="text-4xl font-black mt-2 text-white">{value}</p></div>
      <div className="p-5 bg-white/5 rounded-2xl">{icon}</div>
    </div>
  )
}

function InputBox({ label, placeholder, value, onChange }: InputBoxProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase ml-2">{label}</label>
      <input required type="text" value={value} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-700" onChange={e => onChange(e.target.value)} />
    </div>
  )
}