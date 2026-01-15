'use client';

import { useEffect } from 'react';
import { addEmergencyScrollButton } from '@/lib/utils/scrollUtils';

export function ScrollEmergencyButton() {
  useEffect(() => {
    // Adicionar botão de emergência apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      addEmergencyScrollButton();
    }
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}