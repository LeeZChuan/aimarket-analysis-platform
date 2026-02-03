import html2canvas from 'html2canvas';

export const captureScreenshot = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: 2,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedBody = clonedDoc.body;

        clonedBody.querySelectorAll('svg').forEach((svg) => {
          const computedStyle = window.getComputedStyle(svg as Element);
          const width = svg.getAttribute('width') || computedStyle.width;
          const height = svg.getAttribute('height') || computedStyle.height;

          if (width && width !== 'auto') svg.setAttribute('width', width);
          if (height && height !== 'auto') svg.setAttribute('height', height);

          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        });

        clonedBody.querySelectorAll('*').forEach((element) => {
          const computedStyle = window.getComputedStyle(element as Element);
          if (computedStyle.fontFamily) {
            (element as HTMLElement).style.fontFamily = computedStyle.fontFamily;
          }
        });
      }
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `screenshot-${timestamp}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

    return true;
  } catch (error) {
    console.error('Screenshot failed:', error);
    throw error;
  }
};
