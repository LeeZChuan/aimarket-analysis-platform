/**
 * Nunjucks 提示词渲染引擎封装
 * 
 * 提供类 Jinja2 的模板渲染能力
 */

import nunjucks from 'nunjucks';
import type { PromptContext, RenderedPrompt } from './types';

/**
 * 提示词渲染引擎
 */
class PromptEngine {
  private env: nunjucks.Environment;

  constructor() {
    // 创建 Nunjucks 环境（不从文件系统加载，使用字符串模板）
    this.env = new nunjucks.Environment(null, {
      autoescape: false, // 不转义 HTML，因为我们处理的是纯文本
      trimBlocks: true,  // 移除块标签后的第一个换行
      lstripBlocks: true, // 移除块标签前的空格
    });

    // 注册自定义过滤器
    this.registerFilters();
  }

  /**
   * 注册自定义过滤器
   */
  private registerFilters(): void {
    // 格式化价格
    this.env.addFilter('price', (value: number, decimals = 2) => {
      if (typeof value !== 'number') return value;
      return `$${value.toFixed(decimals)}`;
    });

    // 格式化百分比
    this.env.addFilter('percent', (value: number, decimals = 2) => {
      if (typeof value !== 'number') return value;
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(decimals)}%`;
    });

    // 格式化大数字（K, M, B）
    this.env.addFilter('compact', (value: number) => {
      if (typeof value !== 'number') return value;
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
      return value.toString();
    });

    // 格式化日期
    this.env.addFilter('formatDate', (timestamp: number, format = 'YYYY-MM-DD') => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
    });

    // 截断文本
    this.env.addFilter('truncate', (text: string, length = 100, suffix = '...') => {
      if (typeof text !== 'string') return text;
      if (text.length <= length) return text;
      return text.substring(0, length) + suffix;
    });

    // 默认值（Nunjucks 内置有 default，这里提供别名）
    this.env.addFilter('fallback', (value: unknown, defaultValue: unknown) => {
      return value ?? defaultValue;
    });
  }

  /**
   * 渲染模板字符串
   * 
   * @param template - Nunjucks/Jinja2 模板字符串
   * @param context - 渲染上下文
   * @returns 渲染后的字符串
   */
  render(template: string, context: PromptContext): string {
    try {
      // 添加默认上下文
      const fullContext = {
        ...context,
        timestamp: context.timestamp ?? Date.now(),
        date: context.date ?? new Date().toISOString().split('T')[0],
      };

      return this.env.renderString(template, fullContext);
    } catch (error) {
      console.error('Prompt template render error:', error);
      throw new Error(`模板渲染失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 渲染完整提示词（系统提示词 + 用户提示词）
   * 
   * @param systemTemplate - 系统提示词模板
   * @param sceneTemplate - 场景提示词模板
   * @param context - 渲染上下文
   * @returns 渲染后的提示词
   */
  renderPrompt(
    systemTemplate: string | undefined,
    sceneTemplate: string,
    context: PromptContext
  ): RenderedPrompt {
    const result: RenderedPrompt = {
      userPrompt: this.render(sceneTemplate, context),
    };

    if (systemTemplate) {
      result.systemPrompt = this.render(systemTemplate, context);
    }

    return result;
  }

  /**
   * 验证模板语法
   * 
   * @param template - 模板字符串
   * @returns 是否有效
   */
  validate(template: string): { valid: boolean; error?: string } {
    try {
      // 尝试编译模板
      nunjucks.compile(template, this.env);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 添加自定义过滤器
   * 
   * @param name - 过滤器名称
   * @param fn - 过滤器函数
   */
  addFilter(name: string, fn: (...args: unknown[]) => unknown): void {
    this.env.addFilter(name, fn);
  }

  /**
   * 添加全局变量
   * 
   * @param name - 变量名
   * @param value - 变量值
   */
  addGlobal(name: string, value: unknown): void {
    this.env.addGlobal(name, value);
  }
}

// 导出单例
export const promptEngine = new PromptEngine();

// 导出类用于测试或自定义实例
export { PromptEngine };

