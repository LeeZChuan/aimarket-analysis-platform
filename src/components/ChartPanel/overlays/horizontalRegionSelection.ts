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
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
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

    // 左侧拖拽手柄（使用箭头组合）
    const leftHandleY = canvasHeight / 2;
    const handleSize = 12;
    
    // 右侧拖拽手柄
    const rightHandleY = canvasHeight / 2;

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
      
      // 左侧手柄背景圆
      {
        type: 'circle',
        attrs: {
          x: leftX,
          y: leftHandleY,
          r: handleSize
        },
        styles: {
          style: 'fill',
          color: '#3A9FFF'
        }
      },
      // 左侧手柄左箭头
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: leftX - 3, y: leftHandleY },
            { x: leftX - 7, y: leftHandleY - 4 },
            { x: leftX - 7, y: leftHandleY + 4 }
          ]
        },
        styles: {
          style: 'fill',
          color: '#FFFFFF'
        }
      },
      // 左侧手柄右箭头
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: leftX + 3, y: leftHandleY },
            { x: leftX + 7, y: leftHandleY - 4 },
            { x: leftX + 7, y: leftHandleY + 4 }
          ]
        },
        styles: {
          style: 'fill',
          color: '#FFFFFF'
        }
      },
      
      // 右侧手柄背景圆
      {
        type: 'circle',
        attrs: {
          x: rightX,
          y: rightHandleY,
          r: handleSize
        },
        styles: {
          style: 'fill',
          color: '#3A9FFF'
        }
      },
      // 右侧手柄左箭头
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: rightX - 3, y: rightHandleY },
            { x: rightX - 7, y: rightHandleY - 4 },
            { x: rightX - 7, y: rightHandleY + 4 }
          ]
        },
        styles: {
          style: 'fill',
          color: '#FFFFFF'
        }
      },
      // 右侧手柄右箭头
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: rightX + 3, y: rightHandleY },
            { x: rightX + 7, y: rightHandleY - 4 },
            { x: rightX + 7, y: rightHandleY + 4 }
          ]
        },
        styles: {
          style: 'fill',
          color: '#FFFFFF'
        }
      },
      
      // 关闭按钮背景圆
      {
        type: 'circle',
        attrs: {
          x: leftX + 10,
          y: 15,
          r: 8
        },
        styles: {
          style: 'fill',
          color: '#888888',
          borderColor: '#FFFFFF',
          borderSize: 1
        }
      },
      // 关闭按钮 X 线1
      {
        type: 'line',
        attrs: [
          {
            coordinates: [
              { x: leftX + 6, y: 11 },
              { x: leftX + 14, y: 19 }
            ]
          }
        ],
        styles: {
          color: '#FFFFFF',
          size: 2
        }
      },
      // 关闭按钮 X 线2
      {
        type: 'line',
        attrs: [
          {
            coordinates: [
              { x: leftX + 14, y: 11 },
              { x: leftX + 6, y: 19 }
            ]
          }
        ],
        styles: {
          color: '#FFFFFF',
          size: 2
        }
      }
    ];
  }
};
