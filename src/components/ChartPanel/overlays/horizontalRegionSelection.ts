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
const minDistance = 30;

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
  onRightClick: () => true,
  createPointFigures: (params) => {
    const { coordinates, bounding } = params;

    if (!coordinates || coordinates.length === 0 || !coordinates[0]) {
      return [];
    }

    const defaultWidth = 120;
    const canvasHeight = bounding.height || 400;

    coordinates[0].y = canvasHeight / 2;

    if (coordinates.length > 1 && coordinates[1]) {
      coordinates[1].y = canvasHeight / 2;
    }

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

    if (coordinates[0].x < bounding.left + minDistance) {
      coordinates[0].x = bounding.left + minDistance;
    }
    if (coordinates.length > 1 && coordinates[1] && coordinates[1].x > bounding.width - bounding.left - minDistance) {
      coordinates[1].x = bounding.width - bounding.left - minDistance;
    }

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

    const selectionRect: RectAttrs = {
      x: leftX,
      y: 0,
      width: rightX - leftX,
      height: canvasHeight
    };

    const leftHandleY = canvasHeight / 2;
    const handleSize = 12;
    const rightHandleY = canvasHeight / 2;

    return [
      {
        type: 'rect',
        attrs: selectionRect,
        ignoreEvent: true
      },
      {
        type: 'line',
        attrs: startLines,
        ignoreEvent: true
      },
      {
        type: 'line',
        attrs: endLines,
        ignoreEvent: true
      },

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
        },
        ignoreEvent: true
      },
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
        },
        ignoreEvent: true
      },
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
        },
        ignoreEvent: true
      },

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
        },
        ignoreEvent: true
      },
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
        },
        ignoreEvent: true
      },
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
        },
        ignoreEvent: true
      },
    ];
  },
};
