import type { OverlayTemplate } from 'klinecharts';

export const ellipseOverlay: OverlayTemplate = {
  name: 'ellipse',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  styles: {
    polygon: {
      style: 'stroke_fill',
      color: 'rgba(58, 159, 255, 0.25)',
      borderColor: '#3A9FFF',
      borderSize: 2
    }
  },
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) {
      return [];
    }

    const x1 = coordinates[0].x;
    const y1 = coordinates[0].y;
    const x2 = coordinates[1].x;
    const y2 = coordinates[1].y;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    const points: Array<{ x: number; y: number }> = [];
    const segments = 60;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      points.push({ x, y });
    }

    return [
      {
        type: 'polygon',
        attrs: {
          coordinates: points
        },
        styles: {
          style: 'stroke_fill',
          color: 'rgba(58, 159, 255, 0.25)',
          borderColor: '#3A9FFF',
          borderSize: 2
        }
      }
    ];
  }
};
