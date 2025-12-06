/**
 * AI聊天输入框组件
 *
 * 功能：
 * - 提供多行文本输入框用于用户输入消息
 * - 支持图片上传功能（可上传多张图片）
 * - AI模型选择下拉菜单（支持GPT-4、Quant-LLM等模型）
 * - 快捷键支持（Enter发送，Shift+Enter换行）
 * - 实时预览已上传的图片并支持删除
 *
 * 使用位置：
 * - /components/AIAssistant/ChatPanel/index.tsx - AI聊天面板（底部输入区域）
 */

import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X, ChevronDown } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  isLoading: boolean;
  selectedModel: string;
  availableModels: Array<{ id: string; name: string; description: string }>;
  onModelChange: (modelId: string) => void;
}

export function ChatInput({
  onSend,
  isLoading,
  selectedModel,
  availableModels,
  onModelChange,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((!input.trim() && uploadedImages.length === 0) || isLoading) return;

    onSend(input.trim() || '已上传图片', uploadedImages.length > 0 ? uploadedImages : undefined);
    setInput('');
    setUploadedImages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleModelPickerToggle = () => {
    if (!showModelPicker && modelButtonRef.current) {
      const rect = modelButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.top - 8,
        left: rect.left,
      });
    }
    setShowModelPicker(!showModelPicker);
  };

  return (
    <>
      <div className="p-4 border-t border-[#2A2A2A] space-y-3">
        {uploadedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Upload ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-[#2A2A2A]"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除图片"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="分析市场、技术指标或上传图表..."
            className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
            rows={3}
          />

          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-[#2A2A2A] rounded-lg transition-colors group"
                title="上传图片"
              >
                <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </button>

              <div className="h-4 w-px bg-[#2A2A2A]" />

              <button
                ref={modelButtonRef}
                onClick={handleModelPickerToggle}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                title="选择AI模型"
              >
                <span className="font-mono">
                  {availableModels.find((m) => m.id === selectedModel)?.name}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedImages.length === 0) || isLoading}
              className="p-1.5 bg-[#3A9FFF] text-white rounded-lg hover:bg-[#2A8FEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showModelPicker && (
        <div
          ref={modelPickerRef}
          className="fixed bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl overflow-hidden min-w-[200px] z-[10000]"
          style={{
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            transform: 'translateY(-100%)',
          }}
        >
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setShowModelPicker(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs hover:bg-[#2A2A2A] transition-colors ${
                selectedModel === model.id ? 'bg-[#2A2A2A] text-white' : 'text-gray-400'
              }`}
              title={model.description}
            >
              <div className="font-medium">{model.name}</div>
              <div className="text-[10px] text-gray-500">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
