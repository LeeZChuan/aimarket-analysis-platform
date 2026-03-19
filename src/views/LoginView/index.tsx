import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { authService } from '../../services/authService';

export function LoginView() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email: email || 'demo@example.com',
        password
      });

      if (response.success && response.user) {
        login(response.user.email);
        navigate('/trading');
      } else {
        setError(response.message || '登录失败，请检查邮箱和密码');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请稍后重试';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-center mb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                background: 'color-mix(in oklab, var(--bg-tertiary) 72%, var(--accent-primary) 28%)',
              }}
            >
              <Lock className="h-7 w-7" style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>
          <h1 className="mb-1 text-center text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>登录</h1>
          <p className="mb-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            进入你的交易工作台
          </p>

          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-sm mb-4"
              style={{
                background: 'rgba(var(--error-rgb), 0.10)',
                border: '1px solid rgba(var(--error-rgb), 0.30)',
                color: 'var(--error)',
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg py-2.5 pl-4 pr-12 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              style={{ background: 'var(--accent-primary)', color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center space-y-1.5">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            测试账号: <span style={{ color: 'var(--accent-primary)' }}>demo@example.com</span>
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            测试密码: <span style={{ color: 'var(--accent-primary)' }}>test123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
