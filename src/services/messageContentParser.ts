import type { AIMessage } from '../types/ai';
import type { AgentMessageContent } from '../types/conversation';

type LegacyTextBlock = {
  type: 'text';
  text: string;
};

function isLegacyTextBlock(block: unknown): block is LegacyTextBlock {
  return Boolean(
    block
    && typeof block === 'object'
    && 'type' in block
    && 'text' in block
    && (block as LegacyTextBlock).type === 'text'
    && typeof (block as LegacyTextBlock).text === 'string'
  );
}

function parseLegacyTextBlocks(parsed: unknown): string | null {
  if (!Array.isArray(parsed)) return null;
  if (parsed.length === 0) return '';
  if (!parsed.every(isLegacyTextBlock)) return null;

  return parsed.map((block) => block.text).join('');
}

export function parseConversationMessageContent(
  role: 'user' | 'assistant',
  content: string | AIMessage | AgentMessageContent,
): string | AIMessage | AgentMessageContent {
  if (role !== 'assistant' || typeof content !== 'string') {
    return content;
  }

  const trimmedContent = content.trimStart();
  if (!trimmedContent.startsWith('{') && !trimmedContent.startsWith('[')) {
    return content;
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'text' in parsed &&
      'toolCalls' in parsed
    ) {
      return parsed as AgentMessageContent;
    }

    const legacyText = parseLegacyTextBlocks(parsed);
    if (legacyText !== null) {
      return legacyText;
    }
  } catch {
    return content;
  }

  return content;
}
