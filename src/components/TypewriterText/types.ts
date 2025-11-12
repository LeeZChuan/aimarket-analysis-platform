/**
 * TypewriterText 组件属性
 */
export interface TypewriterTextProps {
  /** 要显示的文本内容 */
  text: string;
  /** 打字速度（毫秒/字符），默认 30ms */
  speed?: number;
  /** 打字完成后的回调函数 */
  onComplete?: () => void;
  /** 自定义类名 */
  className?: string;
}
