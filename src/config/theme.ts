/**
 * 供组件属性、Canvas 和平台 API 使用的主题颜色。
 * SCSS 对应值维护在 styles/theme.scss；修改品牌色时应同步更新两处。
 */
export const themeColors = Object.freeze({
  primary: '#246BFD',
  primarySoft: '#E5EDFF',
  primaryDeep: '#102A43',
  accent: '#21B8C7',
  success: '#16A36A',
  warning: '#F59E0B',
  danger: '#D64545',
  text: '#172033',
  textSecondary: '#667085',
  textMuted: '#8A94A6',
  iconMuted: '#7C879B',
  white: '#FFFFFF',
} as const)
