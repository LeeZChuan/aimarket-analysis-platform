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
    } catch (err: any) {
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Lock className="w-12 h-12 text-[#3A9FFF]" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-8">登录</h1>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3A9FFF] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3A9FFF] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#3A9FFF] hover:bg-[#2B8FEF] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-400 leading-relaxed">
            测试账号: <span className="text-[#3A9FFF]">demo@example.com</span>
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            测试密码: <span className="text-[#3A9FFF]">test123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
