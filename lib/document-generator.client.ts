import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFFromElement = async (elementId: string, filename = 'document.pdf') => {
  const container = document.getElementById(elementId);
  if (!container) {
    alert('找不到内容');
    return;
  }

  const pages = Array.from(container.children) as HTMLElement[];
  const pdf = new jsPDF({
    unit: 'mm',
    format: [70, 100],
    orientation: 'portrait'
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    // 确保当前页内容加载完成
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = 70;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(filename);
};
