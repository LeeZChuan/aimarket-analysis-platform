import type { OverlayTemplate } from 'klinecharts';

export const triangleOverlay: OverlayTemplate = {
  name: 'triangle',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  styles: {
    polygon: {
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

    if (coordinates.length === 2) {
      return [
        {
          type: 'line',
          attrs: {
            coordinates: [
              { x: coordinates[0].x, y: coordinates[0].y },
              { x: coordinates[1].x, y: coordinates[1].y }
            ]
          },
          styles: {
            color: '#3A9FFF',
            size: 1
          }
        }
      ];
    }

    return [
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: coordinates[0].x, y: coordinates[0].y },
            { x: coordinates[1].x, y: coordinates[1].y },
            { x: coordinates[2].x, y: coordinates[2].y }
          ]
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
