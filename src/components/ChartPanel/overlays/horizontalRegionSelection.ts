/**
 * 水平方向区域选择覆盖物
 * 
 * 功能：
 * - 在图表上绘制可拖拽的矩形选择区域
 * - 左右两个拖拽手柄用于调整选择范围
 * - 左上角关闭按钮用于删除选择
 * - 限制拖拽范围在可视区域内
 * 
 * 使用方式：
 * import { horizontalRegionSelection } from './overlays/horizontalRegionSelection';
 * import { registerOverlay } from 'klinecharts';
 * registerOverlay(horizontalRegionSelection);
 */

import type { OverlayTemplate } from 'klinecharts';

interface Coordinate {
  x: number;
  y: number;
}

interface LineAttrs {
  coordinates: Coordinate[];
}

interface RectAttrs {
  x: number;
  y: number;
  width: number;
  height: number;
}

let lastPosition = [0, 0];
const minDistance = 30; // 最小宽度

export const horizontalRegionSelection: OverlayTemplate = {
  name: 'horizontalRegionSelection',
  totalStep: 2,
  needDefaultPointFigure: false,
  needAlwaysShowPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
  mode: 'weak_magnet',
  styles: {
    line: {
      size: 1,
      color: '#3A9FFF'
    },
    rect: {
      color: 'rgba(58, 159, 255, 0.1)'
    }
  },
  createPointFigures: (params) => {
    const { coordinates, bounding } = params;
    
    // 检查是否有足够的坐标点
    if (!coordinates || coordinates.length === 0 || !coordinates[0]) {
      return [];
    }
    
    // 默认宽度
    const defaultWidth = 120;
    // 画布高度
    const canvasHeight = bounding.height || 400;

    // 保持Y坐标在中间
    coordinates[0].y = canvasHeight / 2;
    
    // 确保第二个坐标点存在
    if (coordinates.length > 1 && coordinates[1]) {
      coordinates[1].y = canvasHeight / 2;
    }

    // 限制拖拽，保持最小距离（仅在有两个坐标点时）
    if (coordinates.length > 1 && coordinates[1]) {
      if (lastPosition[0] < coordinates[0].x || lastPosition[1] < coordinates[1].x) {
        const distance = coordinates[1].x - coordinates[0].x;
        if (distance <= minDistance) {
          coordinates[0].x = coordinates[1].x - minDistance;
        }
      }
      
      if (lastPosition[0] > coordinates[0].x || lastPosition[1] > coordinates[1].x) {
        const distance = coordinates[1].x - coordinates[0].x;
        if (distance <= minDistance) {
          coordinates[1].x = coordinates[0].x + minDistance;
        }
      }
      
      lastPosition = [coordinates[0].x, coordinates[1].x];
    }

    // 限制在可视区域内
    if (coordinates[0].x < bounding.left + minDistance) {
      coordinates[0].x = bounding.left + minDistance;
    }
    if (coordinates.length > 1 && coordinates[1] && coordinates[1].x > bounding.width - bounding.left - minDistance) {
      coordinates[1].x = bounding.width - bounding.left - minDistance;
    }

    // 初始化两条垂直线的位置
    const leftX = coordinates[0].x;
    let rightX = 0;
    
    if (coordinates.length < 2 || !coordinates[1]) {
      rightX = leftX + defaultWidth;
    } else {
      rightX = coordinates[1].x;
    }

    const startCoordinates: Coordinate[] = [
      { x: leftX, y: 0 },
      { x: leftX, y: canvasHeight }
    ];

    const endCoordinates: Coordinate[] = [
      { x: rightX, y: 0 },
      { x: rightX, y: canvasHeight }
    ];

    const startLines: LineAttrs[] = [{
      coordinates: [...startCoordinates]
    }];
    
    const endLines: LineAttrs[] = [{
      coordinates: [...endCoordinates]
    }];

    // 选择区域的矩形
    const selectionRect: RectAttrs = {
      x: leftX,
      y: 0,
      width: rightX - leftX,
      height: canvasHeight
    };

    // 左侧拖拽手柄
    const leftHandle: RectAttrs = {
      x: leftX - 5,
      y: canvasHeight / 2 - 20,
      width: 10,
      height: 40
    };

    // 右侧拖拽手柄
    const rightHandle: RectAttrs = {
      x: rightX - 5,
      y: canvasHeight / 2 - 20,
      width: 10,
      height: 40
    };

    return [
      // 背景矩形
      {
        type: 'rect',
        attrs: selectionRect,
        ignoreEvent: true
      },
      // 左侧线
      {
        type: 'line',
        attrs: startLines,
        ignoreEvent: true
      },
      // 右侧线
      {
        type: 'line',
        attrs: endLines,
        ignoreEvent: true
      },
      // 左侧手柄
      {
        type: 'rect',
        attrs: leftHandle,
        styles: {
          style: 'fill',
          color: '#3A9FFF',
          borderColor: '#FFFFFF',
          borderSize: 1
        }
      },
      // 右侧手柄
      {
        type: 'rect',
        attrs: rightHandle,
        styles: {
          style: 'fill',
          color: '#3A9FFF',
          borderColor: '#FFFFFF',
          borderSize: 1
        }
      },
      // 关闭按钮 - 圆形背景
      {
        type: 'circle',
        attrs: {
          x: leftX + 10,
          y: 15,
          r: 10
        },
        styles: {
          style: 'fill',
          color: '#FF4976'
        }
      },
      // 关闭按钮 - X文字
      {
        type: 'text',
        attrs: {
          x: leftX + 10,
          y: 15,
          text: '×'
        },
        styles: {
          color: '#FFFFFF',
          size: 18,
          family: 'Arial',
          weight: 'bold'
        }
      }
    ];
  },
  // 点击关闭按钮时删除覆盖物
  onPressedMoveEnd: (params) => {
    const { overlay } = params;
    return overlay;
  }
};
