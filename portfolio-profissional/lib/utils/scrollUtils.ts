/**
 * Utilitários para gerenciamento seguro de scroll
 */

/**
 * Força o desbloqueio do scroll em caso de emergência
 * Útil para resolver problemas onde o scroll fica travado
 */
export function forceUnlockScroll(): void {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.height = '';
  
  // Remover qualquer classe que possa estar bloqueando scroll
  document.body.classList.remove('overflow-hidden', 'fixed', 'no-scroll');
  document.documentElement.classList.remove('overflow-hidden', 'fixed', 'no-scroll');
}

/**
 * Verifica se o scroll está funcionando corretamente
 */
export function isScrollWorking(): boolean {
  const body = document.body;
  const html = document.documentElement;
  
  // Verificar se há estilos que podem bloquear scroll
  const bodyOverflow = window.getComputedStyle(body).overflow;
  const htmlOverflow = window.getComputedStyle(html).overflow;
  const bodyPosition = window.getComputedStyle(body).position;
  
  return (
    bodyOverflow !== 'hidden' &&
    htmlOverflow !== 'hidden' &&
    bodyPosition !== 'fixed'
  );
}

/**
 * Diagnóstica problemas de scroll e tenta corrigi-los
 */
export function diagnoseAndFixScroll(): {
  wasFixed: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  let wasFixed = false;
  
  const body = document.body;
  const html = document.documentElement;
  
  // Verificar overflow no body
  if (window.getComputedStyle(body).overflow === 'hidden') {
    issues.push('Body overflow está definido como hidden');
    body.style.overflow = '';
    wasFixed = true;
  }
  
  // Verificar overflow no html
  if (window.getComputedStyle(html).overflow === 'hidden') {
    issues.push('HTML overflow está definido como hidden');
    html.style.overflow = '';
    wasFixed = true;
  }
  
  // Verificar position fixed no body
  if (window.getComputedStyle(body).position === 'fixed') {
    issues.push('Body position está definido como fixed');
    body.style.position = '';
    wasFixed = true;
  }
  
  // Verificar altura do body
  const bodyHeight = window.getComputedStyle(body).height;
  if (bodyHeight === '100vh' || bodyHeight === '100%') {
    issues.push('Body height pode estar limitando o scroll');
  }
  
  return { wasFixed, issues };
}

/**
 * Adiciona um botão de emergência para desbloqueio de scroll (apenas em desenvolvimento)
 */
export function addEmergencyScrollButton(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Remover botão existente se houver
  const existingButton = document.getElementById('emergency-scroll-unlock');
  if (existingButton) {
    existingButton.remove();
  }
  
  const button = document.createElement('button');
  button.id = 'emergency-scroll-unlock';
  button.textContent = '🔓 Unlock Scroll';
  button.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: #ff4444;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    opacity: 0.7;
  `;
  
  button.addEventListener('click', () => {
    const result = diagnoseAndFixScroll();
    forceUnlockScroll();
    
    console.log('🔓 Emergency scroll unlock executed');
    console.log('Issues found:', result.issues);
    console.log('Was fixed:', result.wasFixed);
    
    // Mostrar feedback visual
    button.textContent = '✅ Fixed!';
    setTimeout(() => {
      button.textContent = '🔓 Unlock Scroll';
    }, 2000);
  });
  
  document.body.appendChild(button);
}