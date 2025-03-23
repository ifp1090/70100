'use client'

import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } from 'docx';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import html2canvas from 'html2canvas';

// 将毫米转换为磅（用于DOCX）
const mmToPt = (mm: number) => mm * 2.83465;

// 将毫米转换为像素（假设96 DPI）
const mmToPx = (mm: number) => mm * 3.779528;

// 计算内容需要的页数
export const calculatePages = (content: string, containerWidth: number, containerHeight: number, fontSize: number): number => {
  // 这是一个估算，实际页数可能会因为图片、表格等因素而变化
  const charsPerLine = Math.floor(containerWidth / (fontSize * 0.6));
  const linesPerPage = Math.floor(containerHeight / (fontSize * 1.5));
  const charsPerPage = charsPerLine * linesPerPage;
  
  // 考虑Markdown格式，增加一些额外空间
  const effectiveContent = content.length * 1.5;
  
  return Math.max(1, Math.ceil(effectiveContent / charsPerPage));
};

// 分页预览函数 - 将内容分割成多个页面
export const paginateContent = (markdownContent: string, pageWidth: number, pageHeight: number): string[] => {
  // 简单的分页策略：按照段落分割
  const paragraphs = markdownContent.split('\n\n');
  const pages: string[] = [];
  let currentPage = '';
  
  for (const paragraph of paragraphs) {
    // 如果当前段落是标题或者很短，直接添加到当前页
    if (paragraph.startsWith('#') || paragraph.length < 50) {
      if (currentPage) {
        currentPage += '\n\n' + paragraph;
      } else {
        currentPage = paragraph;
      }
    } 
    // 否则，检查当前页是否已经足够长，需要开始新页
    else if (currentPage.length > 500) { // 这个阈值需要根据实际情况调整
      pages.push(currentPage);
      currentPage = paragraph;
    } 
    // 继续添加到当前页
    else {
      if (currentPage) {
        currentPage += '\n\n' + paragraph;
      } else {
        currentPage = paragraph;
      }
    }
  }
  
  // 添加最后一页
  if (currentPage) {
    pages.push(currentPage);
  }
  
  return pages;
};

// PDF生成函数 - 支持多页
export const generatePDF = async (markdownContent: string, previewContainers: HTMLElement[]): Promise<string> => {
  if (!previewContainers || previewContainers.length === 0) {
    throw new Error('预览元素不存在');
  }

  // 创建PDF文档，设置单位为毫米
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [70, 100]
  });
  
  // 处理每一页
  for (let i = 0; i < previewContainers.length; i++) {
    // 如果不是第一页，添加新页
    if (i > 0) {
      doc.addPage([70, 100]);
    }
    
    // 使用html2canvas捕获当前页
    const canvas = await html2canvas(previewContainers[i], {
      scale: 2, // 提高分辨率
      useCORS: true, // 允许加载跨域图片
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // 将canvas转换为图片
    const imgData = canvas.toDataURL('image/png');
    
    // 将图片添加到当前页
    doc.addImage(imgData, 'PNG', 0, 0, 70, 100);
  }
  
  // 保存PDF为Blob URL
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
};

// DOCX生成函数 - 支持多页
export const generateDOCX = async (markdownContent: string, previewContainers: HTMLElement[]): Promise<string> => {
  if (!previewContainers || previewContainers.length === 0) {
    throw new Error('预览元素不存在');
  }

  // 创建文档部分
  const sections = [];
  
  // 处理每一页
  for (let i = 0; i < previewContainers.length; i++) {
    // 使用html2canvas捕获当前页
    const canvas = await html2canvas(previewContainers[i], {
      scale: 2, // 提高分辨率
      useCORS: true, // 允许加载跨域图片
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // 将canvas转换为图片数据
    const imgData = canvas.toDataURL('image/png');
    
    // 创建一个包含图片的文档部分
    sections.push({
      properties: {
        page: {
          size: {
            width: mmToPt(70),
            height: mmToPt(100),
          },
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
        },
      },
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: Buffer.from(imgData.split(',')[1], 'base64'),
              transformation: {
                width: mmToPt(70),
                height: mmToPt(100),
              },
            }),
          ],
        }),
      ],
    });
  }
  
  // 创建DOCX文档
  const doc = new Document({
    sections: sections,
  });

  // 生成DOCX文件
  try {
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('生成DOCX文件失败:', error);
    throw new Error('生成DOCX文件失败');
  }
};

// 下载文件函数
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
