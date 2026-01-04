// Navigation sections
export const NAVIGATION_SECTIONS = [
  { id: 'home', label: 'Início' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'depoimentos', label: 'Depoimentos' },
  { id: 'contato', label: 'Contato' },
] as const;

// Section ID mapping for cases where HTML IDs might differ from navigation IDs
export const SECTION_ID_MAPPING = {
  'home': 'home',
  'sobre': 'sobre', 
  'habilidades': 'habilidades',
  'projetos': 'projetos',
  'experiencia': 'experiencia', // HTML uses 'experiencia' (without accent)
  'depoimentos': 'depoimentos',
  'contato': 'contato'
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Analytics events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  SECTION_VIEW: 'section_view',
  PROJECT_CLICK: 'project_click',
  CONTACT_SUBMIT: 'contact_submit',
  THEME_TOGGLE: 'theme_toggle',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'portfolio-theme',
  ANALYTICS: 'portfolio-analytics',
  CONTACT_COOLDOWN: 'portfolio-contact-cooldown',
} as const;