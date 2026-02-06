/**
 * AI聊天输入框组件
 *
 * 功能：
 * - 提供多行文本输入框用于用户输入消息
 * - 支持图片上传功能（可上传多张图片）
 * - AI模型选择下拉菜单（支持多供应商、多模型）
 * - 场景选择器（技术分析、基本面分析等）
 * - 快捷键支持（Enter发送，Shift+Enter换行）
 * - 实时预览已上传的图片并支持删除
 *
 * 使用位置：
 * - /components/AIAssistant/ChatPanel/index.tsx - AI聊天面板（底部输入区域）
 */

import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X, ChevronDown, Box, BarChart3 } from 'lucide-react';
import { useChartStore } from '../../../store/useChartStore';
import type { SceneConfig } from '../../../types/scene';

interface ModelOption {
  id: string;
  name: string;
  description: string;
  providerId: string;
  modelId: string;
}

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  isLoading: boolean;
  // 场景选择
  selectedSceneId: string;
  availableScenes: SceneConfig[];
  onSceneChange: (sceneId: string) => void;
  // 模型选择
  selectedModel: string;
  availableModels: ModelOption[];
  onModelChange: (modelId: string) => void;
}

export function ChatInput({
  onSend,
  isLoading,
  selectedSceneId,
  availableScenes,
  onSceneChange,
  selectedModel,
  availableModels,
  onModelChange,
}: ChatInputProps) {
  const { setTriggerRegionSelection, isInSelectionMode, confirmedSelectionData, clearConfirmedSelectionData } = useChartStore();
  const [input, setInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showScenePicker, setShowScenePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const sceneButtonRef = useRef<HTMLButtonElement>(null);

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
    setShowScenePicker(false);
  };

  const handleScenePickerToggle = () => {
    if (!showScenePicker && sceneButtonRef.current) {
      const rect = sceneButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.top - 8,
        left: rect.left,
      });
    }
    setShowScenePicker(!showScenePicker);
    setShowModelPicker(false);
  };

  const handleRegionSelection = () => {
    if (isInSelectionMode) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    setTriggerRegionSelection(true);
  };

  const currentModel = availableModels.find((m) => m.id === selectedModel);
  const currentScene = availableScenes.find((s) => s.id === selectedSceneId);

  // 获取模型简称
  const getModelShortName = (model: ModelOption | undefined): string => {
    if (!model) return 'Model';
    const modelName = model.modelId;
    // 常见模型简称映射
    const shortNames: Record<string, string> = {
      'gpt-4o': '4o',
      'gpt-4o-mini': '4o-mini',
      'gpt-4-turbo': '4-turbo',
      'gpt-3.5-turbo': '3.5',
      'deepseek-chat': 'DS-Chat',
      'deepseek-reasoner': 'DS-R1',
      'mock-instant': 'Mock',
      'mock-delay': 'Mock-D',
    };
    return shortNames[modelName] || modelName;
  };

  // 按供应商分组模型
  const groupedModels = availableModels.reduce((acc, model) => {
    if (!acc[model.providerId]) {
      acc[model.providerId] = [];
    }
    acc[model.providerId].push(model);
    return acc;
  }, {} as Record<string, ModelOption[]>);

  return (
    <>
      <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
        {uploadedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Upload ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg"
                  style={{ border: '1px solid var(--border-primary)' }}
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'white' }}
                  title="删除图片"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {confirmedSelectionData && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: 'var(--bg-active)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
          >
            <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">
              {confirmedSelectionData.stockName || confirmedSelectionData.stockSymbol} | {confirmedSelectionData.timeframe} | {confirmedSelectionData.dataCount} 条K线 ({confirmedSelectionData.startTime} ~ {confirmedSelectionData.endTime})
            </span>
            <button
              onClick={clearConfirmedSelectionData}
              className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              title="移除已选数据"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="分析市场、技术指标或上传图表..."
            className="w-full bg-transparent px-4 pt-3 pb-2 text-sm focus:outline-none resize-none"
            style={{ color: 'var(--text-primary)' }}
            rows={3}
          />

          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
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
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title="上传图片"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                onClick={handleRegionSelection}
                className="p-1 rounded transition-colors"
                style={
                  isInSelectionMode
                    ? { background: 'var(--bg-active)', cursor: 'default', color: 'var(--accent-primary)' }
                    : { color: 'var(--text-muted)' }
                }
                onMouseEnter={(e) => {
                  if (!isInSelectionMode) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isInSelectionMode) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
                title={isInSelectionMode ? "已在框选模式中" : "框选图表区域"}
              >
                <Box className="w-4 h-4" />
              </button>

              <div className="h-3 w-px mx-0.5" style={{ background: 'var(--border-primary)' }} />

              {/* 场景选择器 - 显示全部文字 */}
              <button
                ref={sceneButtonRef}
                onClick={handleScenePickerToggle}
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title={currentScene?.description}
              >
                <span className="font-mono">{currentScene?.name || '选择场景'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* 模型选择器 - 简称显示 */}
              <button
                ref={modelButtonRef}
                onClick={handleModelPickerToggle}
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title={`模型: ${currentModel?.name || '选择模型'}`}
              >
                <span className="font-mono">{getModelShortName(currentModel)}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedImages.length === 0) || isLoading}
              className="p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = 'var(--accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                }
              }}
              title="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 场景选择弹窗 */}
      {showScenePicker && (
        <div
          className="fixed rounded-lg shadow-xl overflow-hidden min-w-[200px] z-[10000]"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="px-3 py-2 text-xs font-medium" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-primary)' }}>
            分析场景
          </div>
          {availableScenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                onSceneChange(scene.id);
                setShowScenePicker(false);
              }}
              className="w-full px-3 py-2 text-left text-xs transition-colors"
              style={
                selectedSceneId === scene.id
                  ? { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }
                  : { color: 'var(--text-muted)' }
              }
              onMouseEnter={(e) => {
                if (selectedSceneId !== scene.id) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSceneId !== scene.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title={scene.description}
            >
              <div className="font-medium">{scene.icon} {scene.name}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>{scene.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* 模型选择弹窗 */}
      {showModelPicker && (
        <div
          ref={modelPickerRef}
          className="fixed rounded-lg shadow-xl overflow-hidden min-w-[240px] max-h-[400px] overflow-y-auto z-[10000]"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            transform: 'translateY(-100%)',
          }}
        >
          {Object.entries(groupedModels).map(([providerId, models]) => (
            <div key={providerId}>
              <div className="px-3 py-2 text-xs font-medium sticky top-0" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                {models[0]?.name.split(' - ')[0] || providerId}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setShowModelPicker(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs transition-colors"
                  style={
                    selectedModel === model.id
                      ? { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }
                      : { color: 'var(--text-muted)' }
                  }
                  onMouseEnter={(e) => {
                    if (selectedModel !== model.id) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedModel !== model.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  title={model.description}
                >
                  <div className="font-medium">{model.name.split(' - ')[1]}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>{model.description}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] animate-fade-in">
          <div className="px-4 py-2 rounded-lg shadow-lg text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
            已在框选模式中，请先完成或取消当前框选
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
