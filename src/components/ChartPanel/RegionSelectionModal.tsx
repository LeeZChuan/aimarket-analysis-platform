/**
 * 区域选择确认弹窗
 * 
 * 功能：
 * - 显示用户框选的时间范围和数据数量
 * - 提供确认和取消操作
 * - 美观的动画效果
 */

import { X, Calendar, BarChart3, Clock } from 'lucide-react';
import type { RegionSelectionData } from '../../store/useChartStore';

interface RegionSelectionModalProps {
  data: RegionSelectionData;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RegionSelectionModal({ data, onConfirm, onCancel }: RegionSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl w-[400px] animate-scale-in">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h3 className="text-white font-medium flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3A9FFF]" />
            区域选择确认
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
            title="关闭"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {/* 时间周期 */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#3A9FFF] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">时间周期</div>
                <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">当前周期</span>
                    <span className="text-sm text-[#3A9FFF] font-semibold">{data.timeframe}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 时间范围 */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#3A9FFF] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">选择时间范围</div>
                <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">开始时间</span>
                    <span className="text-sm text-white font-mono">{data.startTime}</span>
                  </div>
                  <div className="h-px bg-[#2A2A2A]" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">结束时间</span>
                    <span className="text-sm text-white font-mono">{data.endTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 数据统计 */}
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-[#3A9FFF] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">数据统计</div>
                <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">K线数量</span>
                    <span className="text-sm text-[#3A9FFF] font-semibold">{data.dataCount} 根</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-[#3A9FFF]/10 border border-[#3A9FFF]/20 rounded-lg p-3">
            <p className="text-xs text-[#3A9FFF]">
              确认后，将使用此区域数据进行 AI 分析
            </p>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center gap-3 p-4 border-t border-[#2A2A2A]">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#3A9FFF] text-white rounded-lg hover:bg-[#2A8FEF] transition-colors text-sm font-medium"
          >
            确认分析
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
