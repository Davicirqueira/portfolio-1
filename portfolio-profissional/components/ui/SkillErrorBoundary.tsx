'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SkillErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SkillErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          className="bg-card border border-border rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Erro ao carregar competência
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ocorreu um erro inesperado ao exibir esta competência técnica.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Tentar novamente
          </button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}