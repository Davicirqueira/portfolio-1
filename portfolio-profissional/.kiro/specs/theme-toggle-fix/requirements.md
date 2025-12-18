# Requirements Document

## Introduction

O sistema de alternância de tema (ThemeToggle) do portfolio não está funcionando corretamente devido a uma incompatibilidade entre as variáveis CSS definidas no globals.css e a configuração do Tailwind CSS. As variáveis CSS estão definidas com valores hexadecimais diretos, mas o Tailwind está configurado para usar valores HSL, causando falha na aplicação dos temas.

## Glossary

- **ThemeToggle**: Componente React responsável por alternar entre temas claro e escuro
- **CSS Variables**: Variáveis CSS customizadas definidas no arquivo globals.css
- **Tailwind Config**: Arquivo de configuração do Tailwind CSS que mapeia as cores do sistema
- **Theme System**: Sistema completo de gerenciamento de temas incluindo contexto, hooks e utilitários
- **HSL Values**: Valores de cor no formato Hue, Saturation, Lightness
- **Data Attribute**: Atributo HTML usado para aplicar o tema escuro ([data-theme="dark"])

## Requirements

### Requirement 1

**User Story:** Como usuário do portfolio, eu quero poder alternar entre tema claro e escuro, para que eu possa visualizar o conteúdo na aparência que prefiro.

#### Acceptance Criteria

1. WHEN a user clicks the theme toggle button THEN the system SHALL switch between light and dark themes immediately
2. WHEN the theme changes THEN the system SHALL persist the user's preference in localStorage
3. WHEN a user visits the site THEN the system SHALL load their previously selected theme preference
4. WHEN no theme preference is stored THEN the system SHALL default to the system preference (light/dark mode)
5. WHEN the system theme preference changes THEN the system SHALL update automatically if user selected "system" mode

### Requirement 2

**User Story:** Como desenvolvedor, eu quero que as variáveis CSS sejam compatíveis com a configuração do Tailwind, para que os temas sejam aplicados corretamente em todos os componentes.

#### Acceptance Criteria

1. WHEN CSS variables are defined THEN the system SHALL use HSL format values compatible with Tailwind's hsl() function calls
2. WHEN Tailwind classes reference theme colors THEN the system SHALL resolve to the correct CSS variable values
3. WHEN the dark theme is active THEN the system SHALL apply all dark theme variables correctly
4. WHEN the light theme is active THEN the system SHALL apply all light theme variables correctly
5. WHEN theme transitions occur THEN the system SHALL maintain smooth visual transitions without flashing

### Requirement 3

**User Story:** Como usuário, eu quero que o botão de alternância de tema tenha feedback visual claro, para que eu saiba qual tema está ativo e possa alternar facilmente.

#### Acceptance Criteria

1. WHEN the light theme is active THEN the system SHALL display a sun icon in the toggle button
2. WHEN the dark theme is active THEN the system SHALL display a moon icon in the toggle button
3. WHEN hovering over the toggle button THEN the system SHALL provide visual feedback with hover effects
4. WHEN the theme is loading THEN the system SHALL show a loading state to prevent layout shift
5. WHEN the toggle button is clicked THEN the system SHALL provide smooth icon transition animations