import type { OverlayTemplate } from 'klinecharts';

export const textSegmentOverlay: OverlayTemplate = {
  name: 'textSegment',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay }) => {
    if (coordinates.length < 2) {
      return [];
    }

    const figures: Array<{
      type: string;
      attrs: Record<string, unknown>;
      styles?: Record<string, unknown>;
      ignoreEvent?: boolean;
    }> = [
      {
        type: 'line',
        attrs: {
          coordinates: [
            { x: coordinates[0].x, y: coordinates[0].y },
            { x: coordinates[1].x, y: coordinates[1].y },
          ],
        },
        styles: {
          style: 'solid',
          color: '#3A9FFF',
          size: 2,
        },
      },
    ];

    const extData = overlay.extendData as { text?: string } | undefined;
    const text = extData?.text;
    if (text) {
      const midX = (coordinates[0].x + coordinates[1].x) / 2;
      const midY = (coordinates[0].y + coordinates[1].y) / 2;

      figures.push({
        type: 'text',
        ignoreEvent: false,
        attrs: {
          x: midX,
          y: midY - 10,
          text,
          align: 'center',
          baseline: 'bottom',
        },
        styles: {
          style: 'stroke_fill',
          color: '#FFFFFF',
          size: 12,
          family: 'Helvetica Neue',
          weight: 'normal',
          paddingLeft: 6,
          paddingRight: 6,
          paddingTop: 4,
          paddingBottom: 4,
          borderStyle: 'solid',
          borderDashedValue: [2, 2],
          borderSize: 1,
          borderRadius: 4,
          borderColor: '#3A9FFF',
          backgroundColor: 'rgba(58, 159, 255, 0.85)',
        },
      });
    }

    return figures;
  },
  onDrawEnd: ({ overlay }) => {
    window.dispatchEvent(
      new CustomEvent('textSegmentDrawEnd', {
        detail: { id: overlay.id },
      })
    );
    return true;
  },
  onDoubleClick: ({ overlay }) => {
    window.dispatchEvent(
      new CustomEvent('textSegmentEdit', {
        detail: { id: overlay.id, currentText: (overlay.extendData as { text?: string })?.text ?? '' },
      })
    );
    return true;
  },
};
