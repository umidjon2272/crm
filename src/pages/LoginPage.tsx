import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye, EyeOff, Phone, Lock } from 'lucide-react'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

function phoneToEmail(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  let normalized = cleaned
  if (cleaned.startsWith('998')) normalized = cleaned
  else if (cleaned.startsWith('0')) normalized = '998' + cleaned.slice(1)
  else normalized = '998' + cleaned
  return `${normalized}@crm.uz`
}

export function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) { toast.error("Telefon va parolni kiriting"); return }
    setLoading(true)
    try {
      const email = phoneToEmail(phone)
      const { profile } = await authApi.login(email, password)
      toast.success('Xush kelibsiz!')
      if (profile?.role === 'admin') navigate('/admin')
      else if (profile?.role === 'sotrudnik') navigate('/sotrudnik')
      else navigate('/seller')
    } catch (err: any) {
      toast.error(err.message || "Telefon yoki parol noto'g'ri")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CRM Savdo</h1>
          <p className="text-slate-400 mt-1">Savdo nazorat tizimi</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Tizimga kirish</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Telefon raqam</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="901234567"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Misol: 901234567 yoki +998901234567</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 mt-6">
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2024 CRM Savdo Tizimi. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  )
}