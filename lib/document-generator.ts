import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, PageOrientation } from 'docx';

// ✅ PDF 生成函数
export const generatePDFFromElement = async (elementId: string, filename = 'document.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('未找到预览内容，无法生成PDF');
    return;
  }

  const opt = {
    margin:       0,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  {
      scale: 2,
      useCORS: true,
    },
    jsPDF:        {
      unit: 'mm',
      format: [70, 100],
      orientation: 'portrait',
    }
  };

  try {
    await html2pdf().from(element).set(opt).save();
  } catch (err) {
    console.error('生成PDF失败:', err);
    alert('生成 PDF 时出现错误');
  }
};

// ✅ Word 生成函数
export const generateDOCXFromMarkdown = async (markdown: string, filename = 'document.docx') => {
  try {
    const lines = markdown.split('\n');
    const paragraphs: Paragraph[] = [];

    for (const line of lines) {
      const run = new TextRun({
        text: line,
        font: 'Noto Sans SC',
        size: 20, // 10pt 字号 = 20 half-points
      });
      const para = new Paragraph({
        children: [run],
        spacing: { line: 276 }, // 1.4 行距
      });
      paragraphs.push(para);
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.PORTRAIT,
                width: 1984, // 70mm * 56.7
                height: 2835, // 100mm * 56.7
              },
              margin: {
                top: 283,
                bottom: 283,
                left: 283,
                right: 283,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('生成 Word 失败:', err);
    alert('生成 Word 时出现错误');
  }
};
