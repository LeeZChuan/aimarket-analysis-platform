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
  onDrawEnd: ({ overlay }) => {
    if (overlay.points.length === 2) {
      const x1 = overlay.points[0].timestamp;
      const y1 = overlay.points[0].value;
      const x2 = overlay.points[1].timestamp;
      const y2 = overlay.points[1].value;

      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const top = Math.min(y1, y2);
      const bottom = Math.max(y1, y2);

      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;
      const radiusX = (right - left) / 2;
      const radiusY = (bottom - top) / 2;

      overlay.points = [
        { timestamp: left, value: centerY },
        { timestamp: right, value: centerY },
        { timestamp: centerX, value: top },
        { timestamp: centerX, value: bottom }
      ];
    }
  },
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) {
      return [];
    }

    let centerX, centerY, radiusX, radiusY;

    if (coordinates.length === 4) {
      const xs = coordinates.map(c => c.x);
      const ys = coordinates.map(c => c.y);
      const left = Math.min(...xs);
      const right = Math.max(...xs);
      const top = Math.min(...ys);
      const bottom = Math.max(...ys);

      centerX = (left + right) / 2;
      centerY = (top + bottom) / 2;
      radiusX = (right - left) / 2;
      radiusY = (bottom - top) / 2;
    } else {
      const x1 = coordinates[0].x;
      const y1 = coordinates[0].y;
      const x2 = coordinates[1].x;
      const y2 = coordinates[1].y;

      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const top = Math.min(y1, y2);
      const bottom = Math.max(y1, y2);

      centerX = (left + right) / 2;
      centerY = (top + bottom) / 2;
      radiusX = (right - left) / 2;
      radiusY = (bottom - top) / 2;
    }

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
