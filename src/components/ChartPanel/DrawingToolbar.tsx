/**
 * 绘图工具栏组件
 *
 * 功能：
 * - 提供左侧垂直工具栏
 * - 水平线/垂直线/趋势线工具
 * - 价格线工具（价格线、价格通道、平行线等）
 * - 形状工具（矩形、圆形、三角形）
 * - 标注工具（注释、标签）
 * - 其他工具（斐波那契、文本）
 * - 清除所有绘图功能
 * - 可折叠展开
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表面板左侧工具栏
 */

import { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Circle,
  Square,
  Triangle,
  Type,
  Eraser,
  ChevronLeft,
  ChevronRight,
  Activity,
  MessageSquare,
  Tag,
} from 'lucide-react';
import {
  HorizontalLine,
  HorizontalRayLine,
  HorizontalSegment,
  VerticalLine,
  VerticalRayLine,
  VerticalSegment,
  DiagonalLine,
  DiagonalRayLine,
  DiagonalSegment,
  ParallelLines,
  PriceChannel,
} from './icons/CustomIcons';

export type DrawingTool =
  | 'none'
  | 'horizontalRayLine'
  | 'horizontalSegment'
  | 'horizontalStraightLine'
  | 'verticalRayLine'
  | 'verticalSegment'
  | 'verticalStraightLine'
  | 'rayLine'
  | 'segment'
  | 'straightLine'
  | 'priceLine'
  | 'priceChannelLine'
  | 'parallelStraightLine'
  | 'fibonacciLine'
  | 'simpleAnnotation'
  | 'simpleTag'
  | 'rect'
  | 'circle'
  | 'arc'
  | 'triangle'
  | 'text'
  | 'horizontalRegionSelection';

interface ToolGroup {
  tool: DrawingTool;
  icon: any;
  label: string;
}

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClearAll: () => void;
}

export function DrawingToolbar({ activeTool, onToolChange, onClearAll }: DrawingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showHorizontalLineMenu, setShowHorizontalLineMenu] = useState(false);
  const [showVerticalLineMenu, setShowVerticalLineMenu] = useState(false);
  const [showGeneralLineMenu, setShowGeneralLineMenu] = useState(false);
  const [showPriceLineMenu, setShowPriceLineMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showAnnotationMenu, setShowAnnotationMenu] = useState(false);
  const [selectedHorizontalLine, setSelectedHorizontalLine] = useState<DrawingTool>('horizontalStraightLine');
  const [selectedVerticalLine, setSelectedVerticalLine] = useState<DrawingTool>('verticalStraightLine');
  const [selectedGeneralLine, setSelectedGeneralLine] = useState<DrawingTool>('straightLine');
  const [selectedPriceLine, setSelectedPriceLine] = useState<DrawingTool>('priceLine');
  const [selectedShape, setSelectedShape] = useState<DrawingTool>('rect');
  const [selectedAnnotation, setSelectedAnnotation] = useState<DrawingTool>('simpleAnnotation');

  const horizontalLineMenuRef = useRef<HTMLDivElement>(null);
  const verticalLineMenuRef = useRef<HTMLDivElement>(null);
  const generalLineMenuRef = useRef<HTMLDivElement>(null);
  const priceLineMenuRef = useRef<HTMLDivElement>(null);
  const shapeMenuRef = useRef<HTMLDivElement>(null);
  const annotationMenuRef = useRef<HTMLDivElement>(null);

  // 关闭所有菜单
  const closeAllMenus = () => {
    setShowHorizontalLineMenu(false);
    setShowVerticalLineMenu(false);
    setShowGeneralLineMenu(false);
    setShowPriceLineMenu(false);
    setShowShapeMenu(false);
    setShowAnnotationMenu(false);
  };

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // 检查是否点击在任何菜单外部
      if (
        horizontalLineMenuRef.current && !horizontalLineMenuRef.current.contains(target) &&
        verticalLineMenuRef.current && !verticalLineMenuRef.current.contains(target) &&
        generalLineMenuRef.current && !generalLineMenuRef.current.contains(target) &&
        priceLineMenuRef.current && !priceLineMenuRef.current.contains(target) &&
        shapeMenuRef.current && !shapeMenuRef.current.contains(target) &&
        annotationMenuRef.current && !annotationMenuRef.current.contains(target)
      ) {
        closeAllMenus();
      }
    };

    // 只在有菜单打开时添加监听
    const hasOpenMenu = showHorizontalLineMenu || showVerticalLineMenu || showGeneralLineMenu || 
                        showPriceLineMenu || showShapeMenu || showAnnotationMenu;
    
    if (hasOpenMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showHorizontalLineMenu, showVerticalLineMenu, showGeneralLineMenu, 
      showPriceLineMenu, showShapeMenu, showAnnotationMenu]);

  const horizontalLineTools: ToolGroup[] = [
    { tool: 'horizontalStraightLine', icon: HorizontalLine, label: '水平直线' },
    { tool: 'horizontalRayLine', icon: HorizontalRayLine, label: '水平射线' },
    { tool: 'horizontalSegment', icon: HorizontalSegment, label: '水平线段' },
  ];

  const verticalLineTools: ToolGroup[] = [
    { tool: 'verticalStraightLine', icon: VerticalLine, label: '垂直直线' },
    { tool: 'verticalRayLine', icon: VerticalRayLine, label: '垂直射线' },
    { tool: 'verticalSegment', icon: VerticalSegment, label: '垂直线段' },
  ];

  const generalLineTools: ToolGroup[] = [
    { tool: 'straightLine', icon: DiagonalLine, label: '直线' },
    { tool: 'rayLine', icon: DiagonalRayLine, label: '射线' },
    { tool: 'segment', icon: DiagonalSegment, label: '线段' },
  ];

  const priceLineTools: ToolGroup[] = [
    { tool: 'priceLine', icon: TrendingUp, label: '价格线' },
    { tool: 'priceChannelLine', icon: PriceChannel, label: '价格通道' },
    { tool: 'parallelStraightLine', icon: ParallelLines, label: '平行线' },
  ];

  const shapeTools: ToolGroup[] = [
    { tool: 'rect', icon: Square, label: '矩形' },
    { tool: 'circle', icon: Circle, label: '圆形' },
    { tool: 'triangle', icon: Triangle, label: '三角形' },
  ];

  const annotationTools: ToolGroup[] = [
    { tool: 'simpleAnnotation', icon: MessageSquare, label: '注释' },
    { tool: 'simpleTag', icon: Tag, label: '标签' },
  ];

  const otherTools: ToolGroup[] = [
    { tool: 'fibonacciLine', icon: Activity, label: '斐波那契' },
    { tool: 'text', icon: Type, label: '文本' },
  ];

  const handleToolSelect = (
    tool: DrawingTool,
    setter: React.Dispatch<React.SetStateAction<DrawingTool>>,
    menuSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(tool);
    onToolChange(tool);
    menuSetter(false);
  };

  const renderToolButton = (
    tools: ToolGroup[],
    selectedTool: DrawingTool,
    showMenu: boolean,
    setShowMenu: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedTool: React.Dispatch<React.SetStateAction<DrawingTool>>,
    menuRef: React.RefObject<HTMLDivElement>
  ) => {
    const currentTool = tools.find(t => t.tool === selectedTool);
    const Icon = currentTool?.icon || HorizontalLine;
    const isActive = tools.some(t => t.tool === activeTool);

    const handleMenuToggle = () => {
      // 如果当前菜单是关闭的，先关闭所有其他菜单
      if (!showMenu) {
        closeAllMenus();
      }
      // 然后切换当前菜单状态
      setShowMenu(!showMenu);
    };

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleMenuToggle}
          className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
            isActive ? 'bg-[#3A9FFF] text-white' : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
          }`}
          title={currentTool?.label}
        >
          <div className="flex items-center gap-0.5">
            <Icon className="w-3.5 h-3.5" />
            <ChevronRight className="w-2 h-2" />
          </div>
        </button>

        {showMenu && (
          <div className="absolute left-full top-0 ml-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl py-1 z-50 min-w-[120px]">
            {tools.map(({ tool, icon: ToolIcon, label }) => (
              <button
                key={tool}
                onClick={() => handleToolSelect(tool, setSelectedTool, setShowMenu)}
                className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
                  selectedTool === tool
                    ? 'bg-[#3A9FFF]/20 text-[#3A9FFF]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <ToolIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex">
      <div
        className={`bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col items-center py-3 gap-1 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-12 opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        <button
          onClick={() => setIsExpanded(false)}
          className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A9FFF] hover:bg-[#2A2A2A] transition-all flex items-center justify-center group"
          title="收起工具栏"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-[#3A9FFF] transition-colors" />
        </button>

        {isExpanded && (
          <>
            <div className="h-px w-8 bg-[#2A2A2A] my-1" />

            {renderToolButton(
              horizontalLineTools,
              selectedHorizontalLine,
              showHorizontalLineMenu,
              setShowHorizontalLineMenu,
              setSelectedHorizontalLine,
              horizontalLineMenuRef
            )}

            {renderToolButton(
              verticalLineTools,
              selectedVerticalLine,
              showVerticalLineMenu,
              setShowVerticalLineMenu,
              setSelectedVerticalLine,
              verticalLineMenuRef
            )}

            {renderToolButton(
              generalLineTools,
              selectedGeneralLine,
              showGeneralLineMenu,
              setShowGeneralLineMenu,
              setSelectedGeneralLine,
              generalLineMenuRef
            )}

            <div className="h-px w-8 bg-[#2A2A2A] my-1" />

            {renderToolButton(
              priceLineTools,
              selectedPriceLine,
              showPriceLineMenu,
              setShowPriceLineMenu,
              setSelectedPriceLine,
              priceLineMenuRef
            )}

            {otherTools.map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => onToolChange(tool)}
                className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
                  activeTool === tool
                    ? 'bg-[#3A9FFF] text-white'
                    : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}

            <div className="h-px w-8 bg-[#2A2A2A] my-1" />

            {renderToolButton(
              shapeTools,
              selectedShape,
              showShapeMenu,
              setShowShapeMenu,
              setSelectedShape,
              shapeMenuRef
            )}

            {renderToolButton(
              annotationTools,
              selectedAnnotation,
              showAnnotationMenu,
              setShowAnnotationMenu,
              setSelectedAnnotation,
              annotationMenuRef
            )}

            <div className="h-px w-8 bg-[#2A2A2A] my-1" />

            <button
              onClick={onClearAll}
              className="w-9 h-9 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
              title="清除所有绘图"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute left-0 top-3 w-5 h-10 bg-[#1A1A1A] border border-[#2A2A2A] border-l-0 rounded-r-full hover:border-[#3A9FFF] hover:bg-[#2A2A2A] transition-all flex items-center justify-center group z-10"
          title="展开工具栏"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3A9FFF] transition-colors" />
        </button>
      )}
    </div>
  );
}
