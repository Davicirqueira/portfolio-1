# Plano de Implementação

- [x] 1. Atualizar configuração do portfólio


  - Remover referência ao GitHub do objeto `social` em `portfolio.ts`
  - Atualizar URLs do LinkedIn e Twitter com perfis corretos do Sr. Gilberto
  - Modificar textos da seção de contato para refletir perfil de engenheiro de processos
  - _Requisitos: 1.3, 2.1, 2.2, 5.2, 5.3_

- [x] 2. Criar componente SocialIcons


  - Criar arquivo `SocialIcons.tsx` em `components/ui/`
  - Definir interface `SocialIconsProps` com props necessárias (email, linkedin, twitter, className, iconSize)
  - Implementar renderização de ícones usando Lucide React (Mail, Linkedin, Twitter)
  - Aplicar cores específicas de cada plataforma (Gmail vermelho, LinkedIn azul, Twitter azul)
  - _Requisitos: 1.1, 1.4_

- [x] 2.1 Implementar animações e interatividade

  - Adicionar animações Framer Motion para hover (scale 1.1, transição de cor)
  - Implementar feedback de tap (scale 0.95)
  - Adicionar animação de entrada com stagger delay entre ícones
  - _Requisitos: 1.5_

- [x] 2.2 Implementar acessibilidade

  - Adicionar aria-labels descritivos para cada ícone (ex: "Enviar email para Gilberto", "Visitar perfil no LinkedIn")
  - Garantir navegação por teclado com foco visível (outline 2px)
  - Implementar ativação com Enter e Espaço
  - _Requisitos: 3.1, 3.2, 3.3, 3.4_

- [x] 2.3 Implementar responsividade

  - Definir tamanhos de ícones para mobile (40px), tablet (48px), desktop (56px)
  - Ajustar espaçamento entre ícones para cada breakpoint (16px, 24px, 32px)
  - Implementar layout vertical para mobile e horizontal para tablet/desktop
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [x] 2.4 Configurar links e segurança

  - Implementar link mailto para Gmail usando email do Sr. Gilberto
  - Configurar links externos (LinkedIn, Twitter) com target="_blank"
  - Adicionar rel="noopener noreferrer" para segurança
  - _Requisitos: 1.2, 5.1, 5.2, 5.3, 5.4_

- [ ]* 2.5 Escrever testes unitários para SocialIcons
  - Testar renderização correta de ícones baseado em props
  - Validar aplicação de aria-labels
  - Verificar geração correta de hrefs (mailto, URLs externas)
  - Testar aplicação de classes CSS responsivas
  - _Requisitos: 1.1, 1.2, 3.1, 4.1_

- [x] 3. Integrar SocialIcons na seção de contato


  - Importar componente `SocialIcons` em `page.tsx`
  - Substituir links textuais de redes sociais pelo componente `SocialIcons`
  - Passar props corretas (email, linkedin, twitter) do hook `usePortfolio()`
  - Ajustar layout e espaçamento da seção
  - _Requisitos: 1.1, 1.2, 1.3_

- [x] 3.1 Atualizar conteúdo da seção

  - Modificar título da seção para refletir perfil de engenheiro de processos
  - Atualizar texto descritivo com linguagem técnica apropriada
  - Manter cards de informação (Email, Telefone, Localização)
  - Garantir hierarquia visual clara
  - _Requisitos: 2.1, 2.2, 2.3, 2.4_

- [ ]* 3.2 Escrever testes de integração
  - Testar renderização completa da seção de contato
  - Validar integração com hook usePortfolio
  - Verificar funcionamento de animações Framer Motion
  - Testar responsividade em diferentes breakpoints
  - _Requisitos: 1.1, 2.1, 4.1_

- [x] 4. Checkpoint - Garantir que tudo está funcionando



  - Verificar que todos os ícones são renderizados corretamente
  - Testar cliques em cada ícone (Gmail, LinkedIn, Twitter)
  - Validar que GitHub não aparece em nenhum lugar
  - Testar navegação por teclado
  - Verificar responsividade em mobile, tablet e desktop
  - Garantir que animações estão suaves
  - Perguntar ao usuário se há dúvidas ou ajustes necessários

- [ ]* 5. Testes de acessibilidade
  - Executar testes de navegação por teclado (Tab, Enter, Espaço)
  - Validar indicadores de foco visíveis
  - Testar com screen reader (NVDA ou JAWS)
  - Verificar contraste de cores (mínimo 4.5:1)
  - Validar tamanho de toque em mobile (mínimo 44x44px)
  - _Requisitos: 3.1, 3.2, 3.3, 3.4_

- [ ]* 6. Validação final e refinamento
  - Testar em diferentes navegadores (Chrome, Firefox, Safari, Edge)
  - Validar em dispositivos reais (iOS, Android)
  - Ajustar animações se necessário
  - Otimizar performance (verificar bundle size)
  - Documentar mudanças no código
