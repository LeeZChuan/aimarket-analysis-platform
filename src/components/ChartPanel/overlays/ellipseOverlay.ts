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

      overlay.points = [
        { timestamp: left, value: centerY },
        { timestamp: right, value: centerY },
        { timestamp: centerX, value: top },
        { timestamp: centerX, value: bottom }
      ];
    }
  },
  performEventPressedMove: ({ points, performPointIndex, performPoint }) => {
    if (points.length !== 4) {
      return;
    }

    if (performPointIndex === 0) {
      const oldCenterTs = (points[0].timestamp! + points[1].timestamp!) / 2;
      const oldCenterVal = (points[0].value! + points[1].value!) / 2;
      const newCenterTs = (performPoint.timestamp! + points[1].timestamp!) / 2;
      const newCenterVal = (performPoint.value! + points[1].value!) / 2;
      const dTs = newCenterTs - oldCenterTs;
      const dVal = newCenterVal - oldCenterVal;

      const p2Ts = points[2].timestamp!;
      const p2Val = points[2].value!;
      const p3Ts = points[3].timestamp!;
      const p3Val = points[3].value!;

      points[0].timestamp = performPoint.timestamp;
      points[0].value = performPoint.value;
      points[2].timestamp = p2Ts + dTs;
      points[2].value = p2Val + dVal;
      points[3].timestamp = p3Ts + dTs;
      points[3].value = p3Val + dVal;
    } else if (performPointIndex === 1) {
      const oldCenterTs = (points[0].timestamp! + points[1].timestamp!) / 2;
      const oldCenterVal = (points[0].value! + points[1].value!) / 2;
      const newCenterTs = (points[0].timestamp! + performPoint.timestamp!) / 2;
      const newCenterVal = (points[0].value! + performPoint.value!) / 2;
      const dTs = newCenterTs - oldCenterTs;
      const dVal = newCenterVal - oldCenterVal;

      const p2Ts = points[2].timestamp!;
      const p2Val = points[2].value!;
      const p3Ts = points[3].timestamp!;
      const p3Val = points[3].value!;

      points[1].timestamp = performPoint.timestamp;
      points[1].value = performPoint.value;
      points[2].timestamp = p2Ts + dTs;
      points[2].value = p2Val + dVal;
      points[3].timestamp = p3Ts + dTs;
      points[3].value = p3Val + dVal;
    } else if (performPointIndex === 2) {
      const oldCenterTs = (points[2].timestamp! + points[3].timestamp!) / 2;
      const oldCenterVal = (points[2].value! + points[3].value!) / 2;
      const newCenterTs = (performPoint.timestamp! + points[3].timestamp!) / 2;
      const newCenterVal = (performPoint.value! + points[3].value!) / 2;
      const dTs = newCenterTs - oldCenterTs;
      const dVal = newCenterVal - oldCenterVal;

      const p0Ts = points[0].timestamp!;
      const p0Val = points[0].value!;
      const p1Ts = points[1].timestamp!;
      const p1Val = points[1].value!;

      points[2].timestamp = performPoint.timestamp;
      points[2].value = performPoint.value;
      points[0].timestamp = p0Ts + dTs;
      points[0].value = p0Val + dVal;
      points[1].timestamp = p1Ts + dTs;
      points[1].value = p1Val + dVal;
    } else if (performPointIndex === 3) {
      const oldCenterTs = (points[2].timestamp! + points[3].timestamp!) / 2;
      const oldCenterVal = (points[2].value! + points[3].value!) / 2;
      const newCenterTs = (points[2].timestamp! + performPoint.timestamp!) / 2;
      const newCenterVal = (points[2].value! + performPoint.value!) / 2;
      const dTs = newCenterTs - oldCenterTs;
      const dVal = newCenterVal - oldCenterVal;

      const p0Ts = points[0].timestamp!;
      const p0Val = points[0].value!;
      const p1Ts = points[1].timestamp!;
      const p1Val = points[1].value!;

      points[3].timestamp = performPoint.timestamp;
      points[3].value = performPoint.value;
      points[0].timestamp = p0Ts + dTs;
      points[0].value = p0Val + dVal;
      points[1].timestamp = p1Ts + dTs;
      points[1].value = p1Val + dVal;
    }
  },
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) {
      return [];
    }

    const segments = 60;
    const ellipsePoints: Array<{ x: number; y: number }> = [];

    let cx: number, cy: number;
    let ax: number, ay: number;
    let bx: number, by: number;

    if (coordinates.length === 4) {
      cx = (coordinates[0].x + coordinates[1].x) / 2;
      cy = (coordinates[0].y + coordinates[1].y) / 2;
      ax = coordinates[0].x - cx;
      ay = coordinates[0].y - cy;
      bx = coordinates[2].x - cx;
      by = coordinates[2].y - cy;
    } else {
      const x1 = coordinates[0].x;
      const y1 = coordinates[0].y;
      const x2 = coordinates[1].x;
      const y2 = coordinates[1].y;
      cx = (x1 + x2) / 2;
      cy = (y1 + y2) / 2;
      ax = (x2 - x1) / 2;
      ay = 0;
      bx = 0;
      by = (y2 - y1) / 2;
    }

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * 2 * Math.PI;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      ellipsePoints.push({
        x: cx + ax * cosT + bx * sinT,
        y: cy + ay * cosT + by * sinT
      });
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
