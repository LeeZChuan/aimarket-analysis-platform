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

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Image as ImageIcon, X, ChevronDown, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
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
  const { setTriggerRegionSelection, confirmedSelectionData, clearConfirmedSelectionData } = useChartStore();
  const [input, setInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showScenePicker, setShowScenePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const [showDataTooltip, setShowDataTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, width: 0 });
  const dataBarRef = useRef<HTMLDivElement>(null);
  const tooltipHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const scenePickerRef = useRef<HTMLDivElement>(null);
  const sceneButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showModelPicker && !showScenePicker) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        showModelPicker &&
        modelPickerRef.current && !modelPickerRef.current.contains(target) &&
        modelButtonRef.current && !modelButtonRef.current.contains(target)
      ) {
        setShowModelPicker(false);
      }
      if (
        showScenePicker &&
        scenePickerRef.current && !scenePickerRef.current.contains(target) &&
        sceneButtonRef.current && !sceneButtonRef.current.contains(target)
      ) {
        setShowScenePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showModelPicker, showScenePicker]);

  const handleDataBarMouseEnter = useCallback(() => {
    if (tooltipHideTimer.current) clearTimeout(tooltipHideTimer.current);
    if (dataBarRef.current) {
      const rect = dataBarRef.current.getBoundingClientRect();
      setTooltipPosition({ top: rect.top - 8, left: rect.left, width: rect.width });
    }
    setShowDataTooltip(true);
  }, []);

  const handleDataBarMouseLeave = useCallback(() => {
    tooltipHideTimer.current = setTimeout(() => setShowDataTooltip(false), 150);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (tooltipHideTimer.current) clearTimeout(tooltipHideTimer.current);
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    tooltipHideTimer.current = setTimeout(() => setShowDataTooltip(false), 150);
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
            ref={dataBarRef}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-default"
            style={{ background: 'var(--bg-active)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
            onMouseEnter={handleDataBarMouseEnter}
            onMouseLeave={handleDataBarMouseLeave}
          >
            <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">
              {confirmedSelectionData.stockName || confirmedSelectionData.stockSymbol} · {confirmedSelectionData.timeframe} · {confirmedSelectionData.dataCount} 条K线
            </span>
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-disabled)' }}>悬停预览</span>
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
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title="框选图表区域"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <line x1="4" y1="2.5" x2="4" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="12" y1="2.5" x2="12" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="4" cy="8" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="8" r="1.6" fill="currentColor" />
                </svg>
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
          ref={scenePickerRef}
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

      {/* 选区数据悬浮预览 */}
      {showDataTooltip && confirmedSelectionData && (() => {
        const d = confirmedSelectionData;
        const kd = d.klineData;
        const overallHigh = Math.max(...kd.map(k => k.high));
        const overallLow = Math.min(...kd.map(k => k.low));
        const firstOpen = kd[0]?.open ?? 0;
        const lastClose = kd[kd.length - 1]?.close ?? 0;
        const pctChange = firstOpen > 0 ? ((lastClose - firstOpen) / firstOpen) * 100 : 0;
        const totalVolume = kd.reduce((s, k) => s + k.volume, 0);
        const avgVolume = kd.length > 0 ? totalVolume / kd.length : 0;
        const isPositive = pctChange >= 0;
        const previewRows = kd.slice(0, 5);

        const fmt = (n: number) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fmtVol = (n: number) => {
          if (n >= 1e8) return `${(n / 1e8).toFixed(2)}亿`;
          if (n >= 1e4) return `${(n / 1e4).toFixed(2)}万`;
          return n.toFixed(0);
        };
        const fmtDate = (ts: number) => {
          const dt = new Date(ts);
          return `${dt.getMonth() + 1}/${dt.getDate()}`;
        };

        return (
          <div
            className="fixed z-[10001] rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              width: `${Math.max(tooltipPosition.width, 280)}px`,
              transform: 'translateY(-100%)',
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {/* 标题 */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {d.stockName || d.stockSymbol}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--bg-hover)', color: 'var(--accent-primary)' }}>
                  {d.timeframe}
                </span>
              </div>
              <div
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded"
                style={{
                  background: isPositive ? 'rgba(0,208,156,0.12)' : 'rgba(255,73,118,0.12)',
                  color: isPositive ? '#00D09C' : '#FF4976',
                }}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
              </div>
            </div>

            {/* 统计指标 */}
            <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--border-primary)' }}>
              {[
                { label: '开盘', value: fmt(firstOpen) },
                { label: '收盘', value: fmt(lastClose), accent: true },
                { label: 'K线数', value: `${d.dataCount}` },
                { label: '区间高', value: fmt(overallHigh) },
                { label: '区间低', value: fmt(overallLow) },
                { label: '均量', value: fmtVol(avgVolume) },
              ].map(item => (
                <div key={item.label} className="px-3 py-2.5 flex flex-col gap-0.5" style={{ background: 'var(--bg-secondary)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>{item.label}</span>
                  <span className="text-xs font-mono font-medium" style={{ color: item.accent ? (isPositive ? '#00D09C' : '#FF4976') : 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* 时间范围 */}
            <div className="px-4 py-2 flex items-center gap-2 text-[11px]" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-disabled)' }}>范围</span>
              <span className="font-mono">{d.startTime}</span>
              <span style={{ color: 'var(--text-disabled)' }}>→</span>
              <span className="font-mono">{d.endTime}</span>
            </div>

            {/* 前5条数据预览 */}
            {previewRows.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-primary)' }}>
                <div className="px-4 py-2 text-[10px] font-medium" style={{ color: 'var(--text-disabled)' }}>
                  前 {previewRows.length} 条数据预览{kd.length > 5 ? ` (共 ${kd.length} 条)` : ''}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-disabled)' }}>
                        {['日期', '开', '高', '低', '收', '量'].map(h => (
                          <td key={h} className="px-3 py-1.5 text-right first:text-left font-medium">{h}</td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => {
                        const up = row.close >= row.open;
                        return (
                          <tr key={i} style={{ borderTop: '1px solid var(--border-primary)' }}>
                            <td className="px-3 py-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>{fmtDate(row.timestamp)}</td>
                            <td className="px-3 py-1.5 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{fmt(row.open)}</td>
                            <td className="px-3 py-1.5 text-right font-mono" style={{ color: '#00D09C' }}>{fmt(row.high)}</td>
                            <td className="px-3 py-1.5 text-right font-mono" style={{ color: '#FF4976' }}>{fmt(row.low)}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-medium" style={{ color: up ? '#00D09C' : '#FF4976' }}>{fmt(row.close)}</td>
                            <td className="px-3 py-1.5 text-right font-mono" style={{ color: 'var(--text-muted)' }}>{fmtVol(row.volume)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

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

    
    </>
  );
}
