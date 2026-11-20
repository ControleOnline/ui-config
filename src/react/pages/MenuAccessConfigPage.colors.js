// Fixed colors of the menu access page body (categories and routes), by function (app-community#1718).
// They are not read from the themes table yet; when they move there, only this file changes.
// Each value is written once, in `palette`; tokens below give it a function.
const palette = {
  white: '#FFFFFF',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#D8E0EA',
  slate500: '#64748B',
  slate700: '#334155',
  slate900: '#0F172A',
};

const menuAccessColors = {
  // Category and route cards
  blockBackground: palette.white,
  blockBorder: palette.slate400,
  headerBackground: palette.slate100,
  divider: palette.slate200,
  textTitle: palette.slate900,
  textLabel: palette.slate500,
  iconMuted: palette.slate500,
  // Text fields, color fields and dropdowns
  inputBackground: palette.white,
  inputBorder: palette.slate300,
  inputText: palette.slate900,
  // Menu type badge (HOME / TOOLBAR / CONFIGURATOR)
  badgeBackground: palette.slate200,
  badgeText: palette.slate700,
};

export default menuAccessColors;
