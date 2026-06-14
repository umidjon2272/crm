import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button, Input, Alert } from '@/components/ui';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Xush kelibsiz!');
      // Navigate based on role - will be handled by router
      navigate(profile?.role === 'admin' ? '/admin' : '/seller');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kirish muvaffaqiyatsiz';
      if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
        setError('Email yoki parol noto\'g\'ri');
      } else if (msg.includes('blocked')) {
        setError('Akkauntingiz bloklangan. Admin bilan bog\'laning.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">SalesTrack CRM</h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            Savdo agentlari faoliyatini real vaqt rejimida kuzating, natijalarni tahlil qiling.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            {[
              { label: 'Sotuvchilar', value: '100+' },
              { label: 'Tashriflar', value: '10K+' },
              { label: 'Magazinlar', value: '500+' },
              { label: 'Hisobotlar', value: '∞' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-primary-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">SalesTrack</span>
            </div>
            <button onClick={toggleTheme} className="ml-auto p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kirish</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Akkauntingizga kiring</p>
            </div>

            {error && (
              <div className="mb-6">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />
              <div className="space-y-1">
                <label className="label">Parol</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="input pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full justify-center py-3">
                Kirish
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-500 dark:text-gray-400">
              <p className="font-medium mb-1">Demo ma'lumotlar:</p>
              <p>Admin: admin@crm.uz / Admin123!</p>
              <p>Seller: seller@crm.uz / Seller123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
