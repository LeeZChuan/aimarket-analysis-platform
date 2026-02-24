import type { OverlayTemplate } from 'klinecharts';

export const circleOverlay: OverlayTemplate = {
  name: 'circle',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  styles: {
    circle: {
      style: 'stroke_fill',
      color: 'rgba(58, 159, 255, 0.25)',
      borderColor: '#3A9FFF',
      borderSize: 1
    }
  },
  onRightClick: () => true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) {
      return [];
    }

    const x1 = coordinates[0].x;
    const y1 = coordinates[0].y;
    const x2 = coordinates[1].x;
    const y2 = coordinates[1].y;

    const xDis = Math.abs(x2 - x1);
    const yDis = Math.abs(y2 - y1);
    const radius = Math.sqrt(xDis * xDis + yDis * yDis);

    return [
      {
        type: 'circle',
        attrs: {
          x: x1,
          y: y1,
          r: radius
        },
        styles: {
          style: 'stroke_fill',
          color: 'rgba(58, 159, 255, 0.25)',
          borderColor: '#3A9FFF',
          borderSize: 1
        }
      }
    ];
  }
};
