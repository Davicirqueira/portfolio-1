# Documento de Design

## Visão Geral

Este documento descreve o design para aprimoramento da seção de contato do portfólio profissional do Sr. Gilberto Nascimento. O objetivo é criar uma experiência visual mais profissional e alinhada com seu perfil de engenheiro de processos, substituindo links textuais por ícones clicáveis das redes sociais (Gmail, LinkedIn, Twitter) e removendo referências ao GitHub.

A solução será implementada através de modificações na página principal (`page.tsx`) e no arquivo de configuração (`portfolio.ts`), mantendo a arquitetura existente do projeto Next.js com TypeScript e Framer Motion para animações.

## Arquitetura

### Estrutura Atual

A seção de contato está implementada diretamente no componente `page.tsx` (linhas ~700-800), utilizando:
- Framer Motion para animações
- Dados do hook `usePortfolio()` que consome `portfolioConfig`
- Cards de informação para Email, Telefone e Localização
- Links textuais para redes sociais (GitHub, LinkedIn, Twitter)

### Mudanças Propostas

1. **Atualização de Dados**: Modificar `portfolio.ts` para remover GitHub e adicionar URLs corretos
2. **Componente de Ícones Sociais**: Criar novo componente `SocialIcons.tsx` para renderizar ícones clicáveis
3. **Atualização da Seção**: Modificar a seção de contato em `page.tsx` para usar o novo componente
4. **Personalização de Conteúdo**: Ajustar textos para refletir perfil de engenheiro de processos

## Componentes e Interfaces

### 1. SocialIcons Component

**Localização**: `portfolio-profissional/components/ui/SocialIcons.tsx`

**Props Interface**:
```typescript
interface SocialIconsProps {
  email: string;
  linkedin?: string;
  twitter?: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}
```

**Responsabilidades**:
- Renderizar ícones das redes sociais (Gmail, LinkedIn, Twitter)
- Aplicar animações de hover usando Framer Motion
- Garantir acessibilidade com aria-labels apropriados
- Suportar navegação por teclado
- Abrir links em novas abas com segurança (rel="noopener noreferrer")

### 2. Atualização do PortfolioConfig

**Localização**: `portfolio-profissional/lib/config/portfolio.ts`

**Modificações na Interface Social**:
```typescript
social: {
  linkedin: string;
  twitter: string;
  // github removido
  // website mantido se necessário
}
```

### 3. Atualização da Seção de Contato

**Localização**: `portfolio-profissional/app/page.tsx` (seção #contato)

**Mudanças**:
- Substituir título "Vamos Trabalhar Juntos?" por texto mais alinhado ao perfil de engenheiro
- Atualizar descrição para refletir expertise em processos
- Remover links textuais de redes sociais
- Integrar componente `SocialIcons`
- Manter cards de informação (Email, Telefone, Localização)

## Modelos de Dados

### Social Links Configuration

```typescript
interface SocialLinks {
  linkedin: string;
  twitter: string;
}
```

**Valores Atualizados**:
```typescript
social: {
  linkedin: "https://linkedin.com/in/gilberto-nascimento",
  twitter: "https://twitter.com/gilberto_eng"
}
```

### Icon Mapping

```typescript
type SocialPlatform = 'gmail' | 'linkedin' | 'twitter';

interface IconConfig {
  platform: SocialPlatform;
  icon: React.ComponentType;
  label: string;
  href: string;
  ariaLabel: string;
}
```

## Propriedades de Corretude

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. Propriedades servem como ponte entre especificações legíveis por humanos e garantias de corretude verificáveis por máquina.*

### Propriedade 1: Ícones renderizados para todas as redes sociais configuradas

*Para qualquer* configuração de redes sociais válida (contendo LinkedIn e Twitter), quando a seção de contato é renderizada, então o sistema deve exibir exatamente um ícone clicável para cada rede social configurada, e nenhum ícone para GitHub.

**Valida: Requisitos 1.1, 1.3**

### Propriedade 2: Redirecionamento correto de ícones

*Para qualquer* ícone de rede social renderizado, quando um usuário clica no ícone, então o sistema deve redirecionar para a URL correta correspondente àquela rede social específica.

**Valida: Requisitos 1.2, 5.1, 5.2, 5.3**

### Propriedade 3: Atributos de segurança em links externos

*Para qualquer* link externo (LinkedIn, Twitter), quando o link é renderizado, então o elemento deve incluir os atributos `target="_blank"` e `rel="noopener noreferrer"`.

**Valida: Requisitos 5.4**

### Propriedade 4: Acessibilidade de ícones

*Para qualquer* ícone de rede social renderizado, o elemento deve incluir um atributo `aria-label` descritivo que identifica a rede social e a ação de redirecionamento.

**Valida: Requisitos 3.1, 3.2**

### Propriedade 5: Navegação por teclado

*Para qualquer* ícone de rede social, quando o elemento recebe foco via navegação por teclado (Tab), então deve exibir um indicador visual de foco claramente visível, e deve ser ativável usando as teclas Enter ou Espaço.

**Valida: Requisitos 3.3, 3.4**

### Propriedade 6: Responsividade de ícones

*Para qualquer* tamanho de viewport (mobile: <768px, tablet: 768-1024px, desktop: >1024px), quando a seção de contato é renderizada, então os ícones devem ajustar seu tamanho e espaçamento apropriadamente para aquele breakpoint.

**Valida: Requisitos 4.1, 4.2, 4.3, 4.4**

### Propriedade 7: Ausência de GitHub

*Para qualquer* renderização da seção de contato, o sistema não deve exibir nenhum ícone, link ou referência ao GitHub.

**Valida: Requisitos 1.3**

### Propriedade 8: Feedback visual de hover

*Para qualquer* ícone de rede social, quando o cursor do mouse está sobre o elemento, então o sistema deve aplicar transformações visuais (escala, cor, ou animação) que indiquem que o elemento é interativo.

**Valida: Requisitos 1.5**

### Propriedade 9: Conteúdo profissional apropriado

*Para qualquer* texto exibido na seção de contato (título, descrição), o conteúdo deve refletir o perfil profissional de engenheiro de processos e utilizar linguagem técnica apropriada.

**Valida: Requisitos 2.1, 2.2, 2.3**

## Tratamento de Erros

### Cenários de Erro

1. **URL de Rede Social Inválida**
   - **Detecção**: Validação de formato de URL no build time
   - **Tratamento**: Console warning em desenvolvimento, ícone não renderizado em produção
   - **Recuperação**: Sistema continua funcionando com ícones válidos

2. **Ícone Não Carregado**
   - **Detecção**: Erro de importação do componente de ícone
   - **Tratamento**: Fallback para texto descritivo
   - **Recuperação**: Usuário ainda pode acessar o link

3. **Email Inválido**
   - **Detecção**: Validação de formato de email
   - **Tratamento**: Console error, link mailto não funcional
   - **Recuperação**: Informação de email ainda visível nos cards

### Validações

```typescript
// Validação de URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validação de Email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## Estratégia de Testes

### Testes Unitários

1. **SocialIcons Component**
   - Renderização correta de ícones baseado em props
   - Aplicação correta de aria-labels
   - Geração correta de hrefs
   - Aplicação de classes CSS responsivas

2. **Validação de Dados**
   - Validação de URLs de redes sociais
   - Validação de formato de email
   - Ausência de GitHub na configuração

### Testes de Integração

1. **Seção de Contato Completa**
   - Renderização de todos os elementos
   - Integração com usePortfolio hook
   - Animações Framer Motion funcionando
   - Responsividade em diferentes breakpoints

### Testes de Acessibilidade

1. **Navegação por Teclado**
   - Tab navigation através dos ícones
   - Ativação com Enter/Espaço
   - Indicadores de foco visíveis

2. **Screen Readers**
   - Aria-labels lidos corretamente
   - Estrutura semântica apropriada
   - Anúncios de navegação

### Testes Manuais

1. **Verificação Visual**
   - Alinhamento e espaçamento de ícones
   - Animações de hover suaves
   - Consistência com tema do portfólio

2. **Funcionalidade de Links**
   - Gmail abre cliente de email
   - LinkedIn abre perfil em nova aba
   - Twitter abre perfil em nova aba

## Considerações de Design

### Biblioteca de Ícones

Utilizaremos **Lucide React** (já presente no projeto) para ícones consistentes:
- `Mail` para Gmail
- `Linkedin` para LinkedIn  
- `Twitter` para Twitter

### Paleta de Cores

Ícones utilizarão cores da marca de cada plataforma:
- Gmail: `#EA4335` (vermelho Google)
- LinkedIn: `#0A66C2` (azul LinkedIn)
- Twitter: `#1DA1F2` (azul Twitter)

Com suporte ao tema dark/light do portfólio.

### Animações

Usando Framer Motion para:
- **Hover**: Scale 1.1, rotação sutil, transição de cor
- **Tap**: Scale 0.95 para feedback tátil
- **Entrada**: Fade in com stagger delay entre ícones

### Responsividade

Breakpoints:
- **Mobile (<768px)**: Ícones 40px, espaçamento 16px, layout vertical
- **Tablet (768-1024px)**: Ícones 48px, espaçamento 24px, layout horizontal
- **Desktop (>1024px)**: Ícones 56px, espaçamento 32px, layout horizontal

## Fluxo de Implementação

1. **Fase 1: Preparação de Dados**
   - Atualizar `portfolio.ts` removendo GitHub
   - Adicionar URLs corretos para LinkedIn e Twitter
   - Atualizar textos da seção para perfil de engenheiro

2. **Fase 2: Componente de Ícones**
   - Criar `SocialIcons.tsx` com interface de props
   - Implementar renderização de ícones com Lucide
   - Adicionar animações Framer Motion
   - Implementar acessibilidade (aria-labels, keyboard nav)

3. **Fase 3: Integração**
   - Atualizar seção de contato em `page.tsx`
   - Substituir links textuais por componente `SocialIcons`
   - Ajustar layout e espaçamento
   - Testar responsividade

4. **Fase 4: Refinamento**
   - Ajustar animações e transições
   - Validar acessibilidade
   - Testar em diferentes dispositivos
   - Otimizar performance

## Dependências

- **Lucide React**: Biblioteca de ícones (já instalada)
- **Framer Motion**: Animações (já instalada)
- **Next.js**: Framework (já instalado)
- **TypeScript**: Tipagem (já instalado)
- **Tailwind CSS**: Estilização (já instalado)

## Considerações de Performance

1. **Tree Shaking**: Importar apenas ícones necessários do Lucide
2. **Lazy Loading**: Não necessário (componente pequeno, above-the-fold)
3. **Animações**: Usar `transform` e `opacity` para performance GPU
4. **Bundle Size**: Impacto mínimo (~2KB adicional)

## Acessibilidade (WCAG 2.1 AA)

- **Contraste**: Ícones com contraste mínimo 4.5:1
- **Tamanho de Toque**: Mínimo 44x44px em mobile
- **Foco Visível**: Outline de 2px com cor de contraste
- **Navegação por Teclado**: Ordem lógica de tab
- **Screen Readers**: Labels descritivos e semântica apropriada
