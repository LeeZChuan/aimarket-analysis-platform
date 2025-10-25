import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, Image as ImageIcon, X, ChevronDown } from 'lucide-react';
import { sendAnalysisRequest } from '../services/aiService';
import { AIMessageRenderer } from './AIMessageRenderer';
import { AIMessage } from '../types/ai';

const AI_MODELS = [
  { id: 'auto', name: 'Auto', description: '自动选择最佳模型' },
  { id: 'gpt-4', name: 'GPT-4', description: '通用智能分析' },
  { id: 'quant-llm', name: 'Quant-LLM', description: '量化分析模型' },
  { id: 'news-bot', name: 'News-Bot', description: '市场新闻摘要' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | AIMessage;
  timestamp: Date;
}

export function ChatPanel() {
  const { messages, selectedModel, setSelectedModel, addMessage, selectedStock } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(event.target as Node)) {
        setShowModelPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSend = async () => {
    if ((!input.trim() && uploadedImages.length === 0) || isLoading) return;

    const userMessage = input.trim();
    const images = [...uploadedImages];
    setInput('');
    setUploadedImages([]);

    addMessage({
      role: 'user',
      content: userMessage || '已上传图片',
    });

    setIsLoading(true);

    try {
      const response = await sendAnalysisRequest(userMessage, {
        stockSymbol: selectedStock?.symbol || 'AAPL',
        stockPrice: selectedStock?.price || 178.72,
        modelId: selectedModel,
        images: images.length > 0 ? images : undefined,
      });

      if (response.status === 'success') {
        addMessage({
          role: 'assistant',
          content: response.message,
        });
      } else {
        addMessage({
          role: 'assistant',
          content: `抱歉，分析请求失败：${response.error || '未知错误'}。请稍后重试。`,
        });
      }
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: '抱歉，系统出现错误，请稍后重试。',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-96 bg-[#1A1A1A] border-l border-[#2A2A2A] flex flex-col h-full">
      <div className="p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#3A9FFF]" />
          <h2 className="text-lg font-semibold text-white">AI 分析助手</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">开始对话分析市场趋势</p>
              <p className="text-xs mt-2">试试：分析当前走势</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-[#3A9FFF] text-white'
                    : 'bg-[#0D0D0D] text-gray-200 border border-[#2A2A2A]'
                }`}
              >
                <div className="text-sm">
                  {message.role === 'user' || typeof message.content === 'string' ? (
                    <div className="whitespace-pre-wrap">{message.content as string}</div>
                  ) : (
                    <AIMessageRenderer message={message.content as AIMessage} />
                  )}
                </div>
                <div className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

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

              <div ref={modelPickerRef} className="relative">
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                >
                  <span className="font-mono">{AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showModelPicker && (
                  <div className="absolute bottom-full left-0 mb-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl overflow-hidden min-w-[200px] z-[9999]">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelPicker(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-[#2A2A2A] transition-colors ${
                          selectedModel === model.id ? 'bg-[#2A2A2A] text-white' : 'text-gray-400'
                        }`}
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-[10px] text-gray-500">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
    </div>
  );
}
