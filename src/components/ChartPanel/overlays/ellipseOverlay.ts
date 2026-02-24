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
  onRightClick: () => true,
  onDrawEnd: ({ overlay }) => {
    if (overlay.points.length === 2) {
      const x1 = overlay.points[0].timestamp!;
      const y1 = overlay.points[0].value!;
      const x2 = overlay.points[1].timestamp!;
      const y2 = overlay.points[1].value!;

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const hw = Math.abs(x2 - x1) / 2;
      const hh = Math.abs(y2 - y1) / 2;

      overlay.points = [
        { timestamp: cx, value: cy },
        { timestamp: cx + hw, value: cy },
        { timestamp: cx, value: cy + hh }
      ];
    }
  },
  performEventPressedMove: ({ points, performPointIndex, performPoint }) => {
    if (points.length !== 3) return;

    if (performPointIndex === 0) {
      const dTs = performPoint.timestamp! - points[0].timestamp!;
      const dVal = performPoint.value! - points[0].value!;
      const p1Ts = points[1].timestamp!;
      const p1Val = points[1].value!;
      const p2Ts = points[2].timestamp!;
      const p2Val = points[2].value!;

      points[0].timestamp = performPoint.timestamp;
      points[0].value = performPoint.value;
      points[1].timestamp = p1Ts + dTs;
      points[1].value = p1Val + dVal;
      points[2].timestamp = p2Ts + dTs;
      points[2].value = p2Val + dVal;
    } else {
      points[performPointIndex].timestamp = performPoint.timestamp;
      points[performPointIndex].value = performPoint.value;
    }
  },
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return [];

    const figures: any[] = [];
    const segments = 60;

    if (coordinates.length >= 3) {
      const cx = coordinates[0].x;
      const cy = coordinates[0].y;
      const ax = coordinates[1].x - cx;
      const ay = coordinates[1].y - cy;
      const bx = coordinates[2].x - cx;
      const by = coordinates[2].y - cy;

      const ellipsePoints: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 * Math.PI;
        const cosT = Math.cos(t);
        const sinT = Math.sin(t);
        ellipsePoints.push({
          x: cx + ax * cosT + bx * sinT,
          y: cy + ay * cosT + by * sinT
        });
      }

      figures.push({
        type: 'polygon',
        attrs: { coordinates: ellipsePoints },
        styles: {
          style: 'stroke_fill',
          color: 'rgba(58, 159, 255, 0.25)',
          borderColor: '#3A9FFF',
          borderSize: 2
        }
      });

      figures.push({
        type: 'line',
        attrs: { coordinates: [coordinates[0], coordinates[1]] },
        styles: { style: 'dashed', color: 'rgba(58, 159, 255, 0.4)', size: 1, dashedValue: [4, 3] }
      });

      figures.push({
        type: 'line',
        attrs: { coordinates: [coordinates[0], coordinates[2]] },
        styles: { style: 'dashed', color: 'rgba(6, 182, 212, 0.4)', size: 1, dashedValue: [4, 3] }
      });

    } else {
      const x1 = coordinates[0].x;
      const y1 = coordinates[0].y;
      const x2 = coordinates[1].x;
      const y2 = coordinates[1].y;
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = (x2 - x1) / 2;
      const ry = (y2 - y1) / 2;

      const ellipsePoints: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 * Math.PI;
        ellipsePoints.push({
          x: cx + rx * Math.cos(t),
          y: cy + ry * Math.sin(t)
        });
      }

      figures.push({
        type: 'polygon',
        attrs: { coordinates: ellipsePoints },
        styles: {
          style: 'stroke_fill',
          color: 'rgba(58, 159, 255, 0.25)',
          borderColor: '#3A9FFF',
          borderSize: 2
        }
      });
    }

    return figures;
  }
};
