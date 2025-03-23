'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';

interface PagedPreviewProps {
  markdown: string;
}

export default function PagedPreview({ markdown }: PagedPreviewProps) {
  const [pages, setPages] = useState<JSX.Element[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.width = '70mm';
    div.style.padding = '0';
    div.style.lineHeight = '1.5';
    div.style.fontSize = '10pt';
    div.style.fontFamily = 'Noto Sans SC, sans-serif';
    document.body.appendChild(div);

    const elements: JSX.Element[] = markdown
      .split('\n\n')
      .map((block, i) => (
        <div key={i} className="mb-2 break-inside-avoid">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
          >
            {block}
          </ReactMarkdown>
        </div>
      ));

    const tempPages: JSX.Element[][] = [];
    let currentPage: JSX.Element[] = [];
    let currentHeight = 0;
    const maxHeight = 100 * 3.78 - 16; // 100mm to px - padding buffer

    elements.forEach((el, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'mb-2';
      div.appendChild(wrapper);
      wrapper.innerHTML = document.createElement('div').appendChild(document.createTextNode(el.props.children)).textContent || '';
      const height = wrapper.offsetHeight;
      div.removeChild(wrapper);

      currentHeight += height;
      if (currentHeight > maxHeight) {
        if (currentPage.length > 0) tempPages.push(currentPage);
        currentPage = [el];
        currentHeight = height;
      } else {
        currentPage.push(el);
      }
    });

    if (currentPage.length > 0) tempPages.push(currentPage);
    setPages(tempPages);
    document.body.removeChild(div);
  }, [markdown]);

  return (
    <div className="flex flex-col items-center gap-4">
      {pages.map((content, i) => (
        <div
          key={i}
          className="w-[70mm] h-[100mm] overflow-hidden bg-white text-black p-4 shadow-md text-[10pt] leading-relaxed"
        >
          {content.map((el, j) => (
            <div key={j}>{el}</div>
          ))}
        </div>
      ))}
    </div>
  );
}