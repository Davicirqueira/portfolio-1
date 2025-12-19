# 🎨 Animações e Interatividade

Este documento descreve todas as animações e efeitos interativos implementados no portfólio.

## 🚀 Componentes Animados

### 1. AnimatedSection
Componente wrapper para animações de entrada baseadas em scroll.

```tsx
<AnimatedSection direction="up" delay={0.2}>
  <h2>Conteúdo animado</h2>
</AnimatedSection>
```

**Propriedades:**
- `direction`: 'up' | 'down' | 'left' | 'right' | 'fade'
- `delay`: Atraso em segundos
- `duration`: Duração da animação
- `once`: Animar apenas uma vez

### 2. AnimatedCard
Card com efeitos 3D e hover interativo.

```tsx
<AnimatedCard hoverScale={1.05} tiltIntensity={10} glowEffect>
  <p>Conteúdo do card</p>
</AnimatedCard>
```

**Propriedades:**
- `hoverScale`: Escala no hover
- `tiltIntensity`: Intensidade do efeito 3D
- `glowEffect`: Ativar efeito de brilho

### 3. TypewriterText
Efeito de máquina de escrever com múltiplos textos.

```tsx
<TypewriterText 
  texts={['Desenvolvedor', 'Designer', 'Criativo']}
  speed={100}
  deleteSpeed={50}
/>
```

### 4. AnimatedCounter
Contador animado que conta até um valor específico.

```tsx
<AnimatedCounter 
  value={100} 
  suffix="+" 
  duration={2}
/>
```

### 5. AnimatedProgressBar
Barra de progresso animada para habilidades.

```tsx
<AnimatedProgressBar 
  label="JavaScript"
  percentage={90}
  color="blue"
/>
```

### 6. ParticleBackground
Background com partículas animadas e conexões.

```tsx
<ParticleBackground />
```

### 7. MagneticButton
Botão com efeito magnético que segue o mouse.

```tsx
<MagneticButton strength={0.3}>
  <span>Botão Magnético</span>
</MagneticButton>
```

## 🎯 Efeitos Especiais

### 1. Mouse Follower
Cursor personalizado que segue o mouse com efeito de blend.

### 2. Scroll Progress
Barra de progresso no topo da página indicando o scroll.

### 3. Scroll to Top
Botão flutuante para voltar ao topo com animação suave.

### 4. Parallax Effects
Elementos que se movem em velocidades diferentes durante o scroll.

## 🎨 Classes CSS Utilitárias

### Animações CSS
```css
.animate-fade-in-up
.animate-fade-in-down
.animate-fade-in-left
.animate-fade-in-right
.animate-pulse
.animate-bounce
.animate-float
.animate-glow
```

### Efeitos de Hover
```css
.hover-lift        /* Eleva o elemento */
.hover-scale       /* Aumenta a escala */
.hover-rotate      /* Rotaciona levemente */
.hover-glow        /* Adiciona brilho */
```

### Efeitos Visuais
```css
.gradient-text           /* Texto com gradiente */
.gradient-text-animated  /* Texto com gradiente animado */
.glass                   /* Efeito de vidro */
.glass-dark             /* Efeito de vidro escuro */
.shimmer                /* Efeito de brilho */
.neon                   /* Efeito neon */
```

## ⚡ Performance

### Otimizações Implementadas
- **Intersection Observer**: Animações só executam quando visíveis
- **Reduced Motion**: Respeita preferências de acessibilidade
- **GPU Acceleration**: Usa transform e opacity para animações suaves
- **Debounced Events**: Eventos de scroll e resize otimizados

### Configuração de Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🎮 Interatividade

### Gestos e Interações
- **Hover Effects**: Todos os elementos interativos têm feedback visual
- **Click Animations**: Botões têm animação de clique (scale down)
- **Magnetic Effects**: Alguns elementos "atraem" o cursor
- **3D Tilt**: Cards respondem à posição do mouse

### Navegação Animada
- **Smooth Scroll**: Navegação suave entre seções
- **Active States**: Indicadores visuais da seção ativa
- **Mobile Menu**: Menu mobile com animações de slide

## 🔧 Configuração

### Arquivo de Configuração
```typescript
// lib/config/animations.ts
export const animationConfig = {
  duration: { fast: 0.3, normal: 0.6, slow: 1.2 },
  easing: { easeOut: [0.25, 0.25, 0.25, 0.75] },
  variants: { fadeInUp: { /* ... */ } }
};
```

### Hooks Personalizados
```typescript
// useScrollAnimation
const { scrollY, scrollYProgress, isScrolled } = useScrollAnimation();

// useParallax
const y = useParallax(scrollYProgress, 100);
```

## 🎨 Temas e Cores

### Suporte a Tema Escuro
Todas as animações se adaptam automaticamente ao tema:
- Partículas mudam de cor
- Efeitos de brilho se ajustam
- Gradientes respondem ao tema

### Variáveis CSS Dinâmicas
```css
:root {
  --primary: 217 91% 60%;
  --animation-duration: 0.6s;
  --hover-scale: 1.05;
}
```

## 📱 Responsividade

### Breakpoints
- **Mobile**: Animações simplificadas
- **Tablet**: Efeitos intermediários
- **Desktop**: Todas as animações ativas

### Touch Devices
- Hover effects adaptados para touch
- Gestos de swipe em carrosséis
- Feedback tátil em interações

## 🚀 Como Usar

1. **Importe o componente desejado**
2. **Configure as propriedades**
3. **Adicione ao seu JSX**
4. **Teste em diferentes dispositivos**

### Exemplo Completo
```tsx
import { AnimatedSection, AnimatedCard } from '@/components/ui';

export function MySection() {
  return (
    <AnimatedSection direction="up" delay={0.2}>
      <div className="grid grid-cols-3 gap-6">
        {items.map((item, index) => (
          <AnimatedCard 
            key={item.id}
            hoverScale={1.05}
            tiltIntensity={5}
            glowEffect
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </AnimatedCard>
        ))}
      </div>
    </AnimatedSection>
  );
}
```

## 🎯 Próximos Passos

### Melhorias Futuras
- [ ] Animações baseadas em gestos
- [ ] Efeitos de partículas mais complexos
- [ ] Transições de página com Framer Motion
- [ ] Animações de loading personalizadas
- [ ] Efeitos de som (opcional)

### Performance
- [ ] Lazy loading de animações pesadas
- [ ] Web Workers para cálculos complexos
- [ ] Otimização para dispositivos de baixa performance