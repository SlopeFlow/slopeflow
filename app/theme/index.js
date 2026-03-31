// THEME — Teen Trading App
// Vibe: clean, bold, high-contrast. Snowboard culture meets finance.

export const colors = {
  bg:           '#0D0D0D',   // near black — mountain night
  card:         '#1A1A1A',   // surface
  border:       '#2A2A2A',
  accent:       '#00E5FF',   // electric cyan — BTC glow
  green:        '#00E676',   // price up
  red:          '#FF1744',   // price down
  gold:         '#FFD600',   // XP / streak
  textPrimary:  '#FFFFFF',
  textSecondary:'#9E9E9E',
  textMuted:    '#616161',
};

export const fonts = {
  heading: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  subhead: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  body:    { fontSize: 15, fontWeight: '400', color: colors.textSecondary },
  label:   { fontSize: 12, fontWeight: '600', color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' },
  price:   { fontSize: 36, fontWeight: '900', color: colors.textPrimary },
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 40,
};

export const radius = {
  sm: 8, md: 14, lg: 22, full: 999,
};
