import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, PageOrientation } from 'docx';

// ✅ PDF 生成函数
export const generatePDFFromElement = async (elementId: string, filename = 'document.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('找不到预览内容，无法导出 PDF');
    return;
  }

  // 克隆节点，避免原页面被破坏
  const clone = element.cloneNode(true) as HTMLElement;

  // 创建隐藏容器放入 clone
  const hiddenContainer = document.createElement('div');
  hiddenContainer.style.position = 'fixed';
  hiddenContainer.style.top = '-9999px';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.width = '70mm';
  hiddenContainer.style.height = '100mm';
  hiddenContainer.style.padding = '0';
  hiddenContainer.style.background = 'white';
  hiddenContainer.appendChild(clone);
  document.body.appendChild(hiddenContainer);

  try {
    // 等图片加载完成
    await Promise.all(
      Array.from(clone.querySelectorAll('img')).map(img => {
        if (!img.complete) {
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // 忽略加载失败
          });
        }
      })
    );

    await html2pdf().from(hiddenContainer).set({
      margin:       0,
      filename:     filename,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  {
        scale: 2,
        useCORS: true,
        logging: true
      },
      jsPDF:        {
        unit: 'mm',
        format: [70, 100],
        orientation: 'portrait',
      }
    }).save();
  } catch (err) {
    console.error('生成 PDF 出错:', err);
    alert('生成 PDF 时出错');
  } finally {
    document.body.removeChild(hiddenContainer);
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
