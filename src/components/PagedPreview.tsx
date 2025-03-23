import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

interface Props {
  markdown: string;
}

const PAGE_WIDTH_MM = 70;
const PAGE_HEIGHT_MM = 100;
const MM_TO_PX = 3.78; // 1mm = ~3.78px

const PAGE_STYLE = {
  width: `${PAGE_WIDTH_MM * MM_TO_PX}px`,
  height: `${PAGE_HEIGHT_MM * MM_TO_PX}px`,
  padding: `${5 * MM_TO_PX}px`, // 5mm padding
  boxSizing: 'border-box' as const,
  overflow: 'hidden' as const,
  border: '1px solid #ccc',
  marginBottom: '20px',
  background: 'white',
  fontFamily: '"Noto Sans SC", "Arial", sans-serif',
  fontSize: '12px',
  lineHeight: 1.4,
  color: '#111',
};

export default function PagedPreview({ markdown }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.width = `${PAGE_WIDTH_MM * MM_TO_PX - 2 * 5 * MM_TO_PX}px`;
    temp.style.padding = `${5 * MM_TO_PX}px`;
    temp.style.fontSize = '12px';
    temp.style.lineHeight = '1.4';
    temp.style.fontFamily = '"Noto Sans SC", "Arial", sans-serif';
    document.body.appendChild(temp);

    temp.innerHTML = markdown
      .split('\n')
      .map((line) => line.trim())
      .join('<br/>');

    const pageHeightPx = PAGE_HEIGHT_MM * MM_TO_PX;
    const lineHeight = 17;
    const totalHeight = temp.scrollHeight;
    const pageCount = Math.ceil(totalHeight / pageHeightPx);

    const lines = markdown.split('\n');
    const linesPerPage = Math.floor(pageHeightPx / lineHeight);

    const newPages: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      const chunk = lines.slice(i * linesPerPage, (i + 1) * linesPerPage).join('\n');
      newPages.push(chunk);
    }

    setPages(newPages);
    document.body.removeChild(temp);
  }, [markdown]);

  return (
    <div ref={containerRef}>
      {pages.map((page, index) => (
        <div key={index} style={PAGE_STYLE}>
          <ReactMarkdown
            children={page}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          />
        </div>
      ))}
    </div>
  );
}
