import { useEffect, useRef } from 'react';

/**
 * Hook para gerenciar o bloqueio de scroll de forma segura
 * Garante que o scroll seja sempre restaurado, mesmo em caso de erros
 */
export function useScrollLock(isLocked: boolean) {
  const scrollPositionRef = useRef<number>(0);
  const isLockedRef = useRef<boolean>(false);

  useEffect(() => {
    const lockScroll = () => {
      if (isLockedRef.current) return; // Já está bloqueado
      
      // Salvar posição atual do scroll
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
      
      // Aplicar estilos para bloquear scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      
      isLockedRef.current = true;
    };

    const unlockScroll = () => {
      if (!isLockedRef.current) return; // Já está desbloqueado
      
      // Restaurar estilos
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restaurar posição do scroll
      window.scrollTo(0, scrollPositionRef.current);
      
      isLockedRef.current = false;
    };

    if (isLocked) {
      lockScroll();
    } else {
      unlockScroll();
    }

    // Cleanup: sempre restaurar scroll quando o componente for desmontado
    return () => {
      if (isLockedRef.current) {
        unlockScroll();
      }
    };
  }, [isLocked]);

  // Função de emergência para forçar desbloqueio
  const forceUnlock = () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    isLockedRef.current = false;
  };

  return { forceUnlock };
}