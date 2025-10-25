import { Lock } from 'lucide-react';

export function LoginView() {
  return (
    <div className="h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Lock className="w-12 h-12 text-[#3A9FFF]" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-8">登录</h1>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3A9FFF] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3A9FFF] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#3A9FFF] hover:bg-[#2B8FEF] text-white font-medium rounded-lg transition-colors"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
