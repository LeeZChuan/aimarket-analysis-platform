import tokensRaw from '../../tokens.json';

type Tokens = typeof tokensRaw;
type Theme = 'dark' | 'light';

const tokens = tokensRaw as Tokens;

function resolvePrimitive(ref: string): string {
  if (!ref.startsWith('{') || !ref.endsWith('}')) return ref;
  const path = ref.slice(1, -1).split('.');
  let current: unknown = tokens;
  for (const key of path) {
    if (current == null || typeof current !== 'object') return ref;
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === 'string') return current;
  return ref;
}

function buildCSSVariables(theme: Theme): string {
  const semantic = tokens.semantic[theme];
  const p = tokens.primitive;
  const lines: string[] = [];

  lines.push(`  --font-family-base: ${p.typography.fontFamily.base};`);
  lines.push(`  --font-family-mono: ${p.typography.fontFamily.mono};`);

  lines.push(`  --duration-fast: ${p.duration.fast};`);
  lines.push(`  --duration-normal: ${p.duration.normal};`);
  lines.push(`  --duration-slow: ${p.duration.slow};`);
  lines.push(`  --easing-standard: ${p.easing.standard};`);

  lines.push(`  --radius-sm: ${p.radius.sm};`);
  lines.push(`  --radius-md: ${p.radius.md};`);
  lines.push(`  --radius-lg: ${p.radius.lg};`);
  lines.push(`  --radius-xl: ${p.radius.xl};`);

  lines.push(`  --bg-transparent: ${resolvePrimitive(semantic.bg.transparent)};`);
  lines.push(`  --bg-primary: ${resolvePrimitive(semantic.bg.primary)};`);
  lines.push(`  --bg-secondary: ${resolvePrimitive(semantic.bg.secondary)};`);
  lines.push(`  --bg-tertiary: ${resolvePrimitive(semantic.bg.tertiary)};`);
  lines.push(`  --bg-hover: ${resolvePrimitive(semantic.bg.hover)};`);
  lines.push(`  --bg-active: ${resolvePrimitive(semantic.bg.active)};`);

  lines.push(`  --border-primary: ${resolvePrimitive(semantic.border.primary)};`);
  lines.push(`  --border-secondary: ${resolvePrimitive(semantic.border.secondary)};`);
  lines.push(`  --border-hover: ${resolvePrimitive(semantic.border.hover)};`);
  lines.push(`  --border-active: ${resolvePrimitive(semantic.border.active)};`);

  lines.push(`  --text-primary: ${resolvePrimitive(semantic.text.primary)};`);
  lines.push(`  --text-secondary: ${resolvePrimitive(semantic.text.secondary)};`);
  lines.push(`  --text-tertiary: ${resolvePrimitive(semantic.text.tertiary)};`);
  lines.push(`  --text-muted: ${resolvePrimitive(semantic.text.muted)};`);
  lines.push(`  --text-disabled: ${resolvePrimitive(semantic.text.disabled)};`);

  lines.push(`  --accent-primary: ${resolvePrimitive(semantic.accent.primary)};`);
  lines.push(`  --accent-primary-rgb: ${semantic.accent.primaryRgb};`);
  lines.push(`  --accent-hover: ${resolvePrimitive(semantic.accent.hover)};`);
  lines.push(`  --accent-active: ${resolvePrimitive(semantic.accent.active)};`);

  lines.push(`  --success: ${resolvePrimitive(semantic.status.success)};`);
  lines.push(`  --success-rgb: ${semantic.status.successRgb};`);
  lines.push(`  --error: ${resolvePrimitive(semantic.status.error)};`);
  lines.push(`  --error-rgb: ${semantic.status.errorRgb};`);
  lines.push(`  --warning: ${resolvePrimitive(semantic.status.warning)};`);
  lines.push(`  --warning-rgb: ${semantic.status.warningRgb};`);

  lines.push(`  --chart-grid: ${resolvePrimitive(semantic.chart.grid)};`);
  lines.push(`  --chart-candle-up: ${resolvePrimitive(semantic.chart.candleUp)};`);
  lines.push(`  --chart-candle-down: ${resolvePrimitive(semantic.chart.candleDown)};`);

  lines.push(`  --scrollbar-track: ${resolvePrimitive(semantic.scrollbar.track)};`);
  lines.push(`  --scrollbar-thumb: ${resolvePrimitive(semantic.scrollbar.thumb)};`);
  lines.push(`  --scrollbar-thumb-hover: ${resolvePrimitive(semantic.scrollbar.thumbHover)};`);

  lines.push(`  --shadow-sm: ${semantic.shadow.sm};`);
  lines.push(`  --shadow-md: ${semantic.shadow.md};`);
  lines.push(`  --shadow-lg: ${semantic.shadow.lg};`);

  return lines.join('\n');
}

function injectTokens(): void {
  const id = 'astratrade-design-tokens';
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const darkVars = buildCSSVariables('dark');
  const lightVars = buildCSSVariables('light');

  const baseVars = `
  --font-family-base: ${tokens.primitive.typography.fontFamily.base};
  --font-family-mono: ${tokens.primitive.typography.fontFamily.mono};
  --duration-fast: ${tokens.primitive.duration.fast};
  --duration-normal: ${tokens.primitive.duration.normal};
  --duration-slow: ${tokens.primitive.duration.slow};
  --easing-standard: ${tokens.primitive.easing.standard};
  --radius-sm: ${tokens.primitive.radius.sm};
  --radius-md: ${tokens.primitive.radius.md};
  --radius-lg: ${tokens.primitive.radius.lg};
  --radius-xl: ${tokens.primitive.radius.xl};
`;

  const css = `
:root {
${baseVars}
}

[data-theme='dark'] {
${darkVars}
}

[data-theme='light'] {
${lightVars}
}
`;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);
}

function getToken(path: string): string {
  const parts = path.split('.');
  let current: unknown = tokens;
  for (const key of parts) {
    if (current == null || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === 'string') return resolvePrimitive(current);
  return '';
}

function getSemanticToken(theme: Theme, path: string): string {
  return getToken(`semantic.${theme}.${path}`);
}

export { injectTokens, getToken, getSemanticToken, buildCSSVariables };
export type { Theme };
