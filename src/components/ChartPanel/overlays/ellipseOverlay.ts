import type { OverlayTemplate } from 'klinecharts';

export const ellipseOverlay: OverlayTemplate = {
  name: 'ellipse',
  totalStep: 5,
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
    if (coordinates.length < 4) {
      return [];
    }

    const xs = coordinates.map(c => c.x);
    const ys = coordinates.map(c => c.y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);

    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const radiusX = (right - left) / 2;
    const radiusY = (bottom - top) / 2;

    const ellipsePoints: Array<{ x: number; y: number }> = [];
    const segments = 60;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      ellipsePoints.push({ x, y });
    }

    return [
      {
        type: 'polygon',
        attrs: {
          coordinates: ellipsePoints
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
