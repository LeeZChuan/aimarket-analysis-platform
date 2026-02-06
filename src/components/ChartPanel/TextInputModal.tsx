import { useState, useEffect, useRef } from 'react';
import { X, Type } from 'lucide-react';

interface TextInputModalProps {
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export function TextInputModal({ onConfirm, onCancel }: TextInputModalProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onConfirm(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl w-[360px] animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Type className="w-5 h-5 text-[#3A9FFF]" />
            输入标注文本
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
            title="关闭"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入文本..."
            className="w-full px-3 py-2.5 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-gray-500 outline-none focus:border-[#3A9FFF] transition-colors"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter 确认 / Esc 取消
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-[#2A2A2A]">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex-1 px-4 py-2 bg-[#3A9FFF] text-white rounded-lg hover:bg-[#2A8FEF] transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            确认
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
