import type { OverlayTemplate } from 'klinecharts';

export const rectOverlay: OverlayTemplate = {
  name: 'rect',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  styles: {
    rect: {
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

    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    return [
      {
        type: 'rect',
        attrs: { x, y, width, height },
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
