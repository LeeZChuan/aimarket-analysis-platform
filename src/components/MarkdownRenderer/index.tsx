import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const parsedContent = useMemo(() => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let codeBlock: { language: string; lines: string[] } | null = null;

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type;
        elements.push(
          <ListTag
            key={elements.length}
            className={`${
              currentList.type === 'ul' ? 'list-disc' : 'list-decimal'
            } list-inside mb-3 space-y-1 text-gray-300`}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="text-gray-300 ml-2">
                {parseInline(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlock) {
        elements.push(
          <pre key={elements.length} className="bg-[#1e1e1e] rounded-lg p-3 mb-3 overflow-x-auto">
            <code className="block text-sm text-gray-300 font-mono">
              {codeBlock.lines.join('\n')}
            </code>
          </pre>
        );
        codeBlock = null;
      }
    };

    const parseInline = (text: string): (string | JSX.Element)[] => {
      const parts: (string | JSX.Element)[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
        if (boldMatch) {
          parts.push(
            <strong key={key++} className="font-bold text-white">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch[0].length);
          continue;
        }

        const italicMatch = remaining.match(/^\*(.+?)\*/);
        if (italicMatch) {
          parts.push(
            <em key={key++} className="italic text-gray-300">
              {italicMatch[1]}
            </em>
          );
          remaining = remaining.slice(italicMatch[0].length);
          continue;
        }

        const codeMatch = remaining.match(/^`(.+?)`/);
        if (codeMatch) {
          parts.push(
            <code key={key++} className="bg-[#2A2A2A] text-[#3A9FFF] px-1.5 py-0.5 rounded text-sm font-mono">
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeMatch[0].length);
          continue;
        }

        const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={key++}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3A9FFF] hover:underline"
            >
              {linkMatch[1]}
            </a>
          );
          remaining = remaining.slice(linkMatch[0].length);
          continue;
        }

        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      }

      return parts;
    };

    lines.forEach((line, index) => {
      if (codeBlock) {
        if (line.trim() === '```') {
          flushCodeBlock();
        } else {
          codeBlock.lines.push(line);
        }
        return;
      }

      if (line.trim().startsWith('```')) {
        flushList();
        const language = line.trim().slice(3).trim();
        codeBlock = { language, lines: [] };
        return;
      }

      if (line.trim().match(/^#{1,6}\s/)) {
        flushList();
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s/, '');
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const classes = {
          h1: 'text-2xl font-bold text-white mb-4 mt-6',
          h2: 'text-xl font-bold text-white mb-3 mt-5',
          h3: 'text-lg font-semibold text-white mb-2 mt-4',
          h4: 'text-base font-semibold text-gray-200 mb-2 mt-3',
          h5: 'text-sm font-semibold text-gray-200 mb-2 mt-2',
          h6: 'text-xs font-semibold text-gray-200 mb-2 mt-2',
        }[HeadingTag] || '';

        elements.push(
          <HeadingTag key={elements.length} className={classes}>
            {parseInline(text)}
          </HeadingTag>
        );
        return;
      }

      if (line.trim().match(/^[-*]\s/)) {
        const item = line.replace(/^[-*]\s/, '');
        if (currentList?.type === 'ul') {
          currentList.items.push(item);
        } else {
          flushList();
          currentList = { type: 'ul', items: [item] };
        }
        return;
      }

      if (line.trim().match(/^\d+\.\s/)) {
        const item = line.replace(/^\d+\.\s/, '');
        if (currentList?.type === 'ol') {
          currentList.items.push(item);
        } else {
          flushList();
          currentList = { type: 'ol', items: [item] };
        }
        return;
      }

      if (line.trim().startsWith('>')) {
        flushList();
        const text = line.replace(/^>\s?/, '');
        elements.push(
          <blockquote
            key={elements.length}
            className="border-l-4 border-[#3A9FFF] pl-4 py-2 mb-3 bg-[#0D0D0D] text-gray-400 italic"
          >
            {parseInline(text)}
          </blockquote>
        );
        return;
      }

      if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        elements.push(<hr key={elements.length} className="border-[#2A2A2A] my-4" />);
        return;
      }

      if (line.trim() === '') {
        flushList();
        return;
      }

      flushList();
      elements.push(
        <p key={elements.length} className="text-gray-300 mb-3 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    });

    flushList();
    flushCodeBlock();

    return elements;
  }, [content]);

  return <div className={`markdown-body ${className}`}>{parsedContent}</div>;
}
