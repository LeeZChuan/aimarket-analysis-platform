import type { OverlayTemplate } from 'klinecharts';

const MIN_DISTANCE_PX = 30;

export const horizontalRegionSelection: OverlayTemplate = {
  name: 'horizontalRegionSelection',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: false,
  styles: {
    line: { size: 1, color: '#3A9FFF' },
    rect: { color: 'rgba(58, 159, 255, 0.1)' },
  },
  onRightClick: () => true,

  performEventPressedMove: ({ points, performPointIndex, performPoint }) => {
    if (points.length < 2) return;
    const fixedValue = points[0].value;
    performPoint.value = fixedValue;

    if (performPointIndex === 0) {
      points[0].timestamp = performPoint.timestamp;
      points[0].value = fixedValue;
    } else if (performPointIndex === 1) {
      points[1].timestamp = performPoint.timestamp;
      points[1].value = fixedValue;
    }
  },

  createPointFigures: (params) => {
    const { coordinates, bounding } = params;

    if (!coordinates || coordinates.length === 0 || !coordinates[0]) {
      return [];
    }

    const canvasHeight = bounding.height || 400;

    coordinates[0].y = canvasHeight / 2;
    if (coordinates.length > 1 && coordinates[1]) {
      coordinates[1].y = canvasHeight / 2;
    }

    let leftX = coordinates[0].x;
    let rightX = coordinates.length > 1 && coordinates[1]
      ? coordinates[1].x
      : leftX + 120;

    if (leftX > rightX) {
      [leftX, rightX] = [rightX, leftX];
    }
    if (rightX - leftX < MIN_DISTANCE_PX) {
      rightX = leftX + MIN_DISTANCE_PX;
    }

    const minX = bounding.left;
    const maxX = bounding.width - bounding.left;
    if (leftX < minX) leftX = minX;
    if (rightX > maxX) rightX = maxX;

    const handleY = canvasHeight / 2;
    const handleRadius = 6;

    return [
      {
        type: 'rect',
        attrs: { x: leftX, y: 0, width: rightX - leftX, height: canvasHeight },
        ignoreEvent: true,
      },
      {
        type: 'line',
        attrs: [{ coordinates: [{ x: leftX, y: 0 }, { x: leftX, y: canvasHeight }] }],
        ignoreEvent: true,
      },
      {
        type: 'line',
        attrs: [{ coordinates: [{ x: rightX, y: 0 }, { x: rightX, y: canvasHeight }] }],
        ignoreEvent: true,
      },
      {
        type: 'circle',
        attrs: { x: leftX, y: handleY, r: handleRadius },
        styles: { style: 'fill', color: '#3A9FFF' },
        ignoreEvent: true,
      },
      {
        type: 'circle',
        attrs: { x: rightX, y: handleY, r: handleRadius },
        styles: { style: 'fill', color: '#3A9FFF' },
        ignoreEvent: true,
      },
    ];
  },
};
