// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// import Map from 'ol/Map';

// pdfMake.vfs = pdfFonts.pdfMake.vfs;

// export const createMapImage = (map: Map): string => {
//   const mapCanvas = document.createElement('canvas');
//   const size = map.getSize();
//   if (!size) return '';

//   mapCanvas.width = size[0];
//   mapCanvas.height = size[1];
//   const mapContext = mapCanvas.getContext('2d');
//   if (!mapContext) return '';

//   Array.from(document.getElementsByClassName('ol-layer')).forEach(
//     (layer: any) => {
//       if (layer.children.length > 0) {
//         const canvas = layer.children[0];
//         if (canvas.tagName === 'CANVAS') {
//           mapContext.drawImage(canvas, 0, 0);
//         }
//       }
//     }
//   );

//   return mapCanvas.toDataURL('image/jpeg', 1.0);
// };

// export const generateMapPDF = (imageData: string) => {
//   const now = new Date();
//   const dateStr = now.toLocaleDateString('pl-PL');
//   const timeStr = now.toLocaleTimeString('pl-PL');

//   const docDefinition = {
//     pageSize: 'A4',
//     pageOrientation: 'landscape',
//     content: [
//       {
//         image: imageData,
//         width: 780,
//         alignment: 'center'
//       }
//     ],
//     footer: {
//       columns: [
//         { text: `Wygenerowano: ${dateStr} ${timeStr}`, alignment: 'left', margin: [20, 0] },
//         { text: 'Geoportal Toruń', alignment: 'right', margin: [0, 0, 20, 0] }
//       ],
//       margin: [0, 0, 0, 20]
//     },
//     pageMargins: [20, 20, 20, 40]
//   };

//   pdfMake.createPdf(docDefinition).download(`mapa-torun-${dateStr.replace(/\./g, '-')}.pdf`);
// };