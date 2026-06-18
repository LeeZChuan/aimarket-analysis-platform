/**
 * Markdown渲染器组件
 *
 * 功能：
 * - 将Markdown格式文本转换为HTML渲染
 * - 支持标题（H1-H6）
 * - 支持列表（有序列表、无序列表）
 * - 支持代码块（含语言标识）和行内代码
 * - 支持表格（GFM 管道表格，含对齐、横向滚动）
 * - 支持粗体、斜体、粗斜体、删除线文本
 * - 支持链接（自动在新标签页打开）
 * - 支持引用块
 * - 支持分隔线
 *
 * 使用位置：
 * - /components/AIAssistant/AIMessageRenderer/index.tsx - 渲染AI回复中的Markdown内容
 */

import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

type CellAlign = 'left' | 'center' | 'right';

/** 行内 Markdown 解析：粗斜体 / 粗体 / 斜体 / 删除线 / 行内代码 / 链接 */
function parseInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (boldItalicMatch) {
      parts.push(
        <strong key={key++} className="font-bold italic text-white">
          {boldItalicMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldItalicMatch[0].length);
      continue;
    }

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

    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      parts.push(
        <del key={key++} className="line-through text-gray-500">
          {strikeMatch[1]}
        </del>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="bg-[#2A2A2A] text-[#3A9FFF] px-1.5 py-0.5 rounded text-[13px] font-mono">
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
}

/** 拆分一行表格为单元格（处理首尾管道符与转义） */
function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let current = '';
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '\\' && trimmed[i + 1] === '|') {
      current += '|';
      i++;
      continue;
    }
    if (ch === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

/** 判断是否为表格分隔行，如 |:---|:---:|---:|（容忍多余冒号/空格，如 ::----:） */
function isTableSeparator(line: string): boolean {
  if (!line.includes('-')) return false;
  const cells = splitTableRow(line);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:*-+:*$/.test(cell.trim()));
}

function parseAlignments(separatorLine: string): CellAlign[] {
  return splitTableRow(separatorLine).map((cell) => {
    const c = cell.trim();
    const left = c.startsWith(':');
    const right = c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return 'left';
  });
}

const alignClass: Record<CellAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const parsedContent = useMemo(() => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type;
        elements.push(
          <ListTag
            key={elements.length}
            className={`${
              currentList.type === 'ul' ? 'list-disc' : 'list-decimal'
            } list-outside ml-5 mb-3 space-y-1 text-gray-300`}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="text-gray-300 pl-1 leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // ── 代码块 ──────────────────────────────────────────────
      if (trimmed.startsWith('```')) {
        flushList();
        const language = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim() !== '```') {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // 跳过结束的 ```
        elements.push(
          <div key={elements.length} className="mb-3 rounded-lg overflow-hidden border border-[#2A2A2A]">
            {language && (
              <div className="bg-[#2A2A2A] px-3 py-1 text-xs text-gray-400 font-mono">
                {language}
              </div>
            )}
            <pre className="bg-[#1e1e1e] p-3 overflow-x-auto">
              <code className="block text-[13px] text-gray-300 font-mono leading-relaxed whitespace-pre">
                {codeLines.join('\n')}
              </code>
            </pre>
          </div>
        );
        continue;
      }

      // ── 表格 ────────────────────────────────────────────────
      // 容错：表头与分隔行、数据行之间可能被模型插入了空行
      const sepIdx = (() => {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        return j;
      })();
      if (
        trimmed.includes('|') &&
        sepIdx < lines.length &&
        isTableSeparator(lines[sepIdx])
      ) {
        flushList();
        const headerCells = splitTableRow(line);
        const aligns = parseAlignments(lines[sepIdx]);
        i = sepIdx + 1;
        const rows: string[][] = [];
        // 收集数据行，跳过行间空行；遇到「空行后不再是表格行」则结束
        while (i < lines.length) {
          const rowTrimmed = lines[i].trim();
          if (rowTrimmed === '') {
            let j = i + 1;
            while (j < lines.length && lines[j].trim() === '') j++;
            if (j < lines.length && lines[j].includes('|')) {
              i = j;
              continue;
            }
            break;
          }
          if (!rowTrimmed.includes('|')) break;
          rows.push(splitTableRow(lines[i]));
          i++;
        }

        elements.push(
          <div key={elements.length} className="mb-3 overflow-x-auto rounded-lg border border-[#2A2A2A]">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#1f1f1f]">
                  {headerCells.map((cell, idx) => (
                    <th
                      key={idx}
                      className={`px-3 py-2 font-semibold text-white border-b border-[#2A2A2A] whitespace-nowrap ${
                        alignClass[aligns[idx] || 'left']
                      }`}
                    >
                      {parseInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#161616]' : 'bg-transparent'}>
                    {headerCells.map((_, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-3 py-2 text-gray-300 border-b border-[#222] align-top ${
                          alignClass[aligns[cIdx] || 'left']
                        }`}
                      >
                        {parseInline(row[cIdx] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // ── 标题 ────────────────────────────────────────────────
      if (trimmed.match(/^#{1,6}\s/)) {
        flushList();
        const level = trimmed.match(/^#+/)?.[0].length || 1;
        const text = trimmed.replace(/^#+\s/, '');
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const classes = {
          h1: 'text-2xl font-bold text-white mb-4 mt-6',
          h2: 'text-xl font-bold text-white mb-3 mt-5 pb-1 border-b border-[#2A2A2A]',
          h3: 'text-lg font-semibold text-white mb-2 mt-4',
          h4: 'text-base font-semibold text-gray-100 mb-2 mt-3',
          h5: 'text-sm font-semibold text-gray-200 mb-2 mt-2',
          h6: 'text-xs font-semibold text-gray-300 mb-2 mt-2',
        }[HeadingTag] || '';

        elements.push(
          <HeadingTag key={elements.length} className={classes}>
            {parseInline(text)}
          </HeadingTag>
        );
        i++;
        continue;
      }

      // ── 无序列表 ────────────────────────────────────────────
      if (trimmed.match(/^[-*]\s/)) {
        const item = trimmed.replace(/^[-*]\s/, '');
        if (currentList?.type === 'ul') {
          currentList.items.push(item);
        } else {
          flushList();
          currentList = { type: 'ul', items: [item] };
        }
        i++;
        continue;
      }

      // ── 有序列表 ────────────────────────────────────────────
      if (trimmed.match(/^\d+\.\s/)) {
        const item = trimmed.replace(/^\d+\.\s/, '');
        if (currentList?.type === 'ol') {
          currentList.items.push(item);
        } else {
          flushList();
          currentList = { type: 'ol', items: [item] };
        }
        i++;
        continue;
      }

      // ── 引用块 ──────────────────────────────────────────────
      if (trimmed.startsWith('>')) {
        flushList();
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <blockquote
            key={elements.length}
            className="border-l-4 border-[#3A9FFF] pl-4 py-2 mb-3 bg-[#0D0D0D] rounded-r text-gray-400"
          >
            {quoteLines.map((q, idx) => (
              <div key={idx} className="leading-relaxed">
                {q ? parseInline(q) : '\u00A0'}
              </div>
            ))}
          </blockquote>
        );
        continue;
      }

      // ── 分隔线 ──────────────────────────────────────────────
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushList();
        elements.push(<hr key={elements.length} className="border-[#2A2A2A] my-4" />);
        i++;
        continue;
      }

      // ── 空行 ────────────────────────────────────────────────
      if (trimmed === '') {
        flushList();
        i++;
        continue;
      }

      // ── 普通段落 ────────────────────────────────────────────
      flushList();
      elements.push(
        <p key={elements.length} className="text-gray-300 mb-3 leading-relaxed">
          {parseInline(line)}
        </p>
      );
      i++;
    }

    flushList();
    return elements;
  }, [content]);

  return <div className={`markdown-body break-words ${className}`}>{parsedContent}</div>;
}
