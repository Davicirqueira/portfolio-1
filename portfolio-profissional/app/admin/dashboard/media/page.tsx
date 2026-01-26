'use client';

import React, { useState } from 'react';
import { MediaLibrary } from '@/components/admin/media/MediaLibrary';
import { MediaCleanup } from '@/components/admin/media/MediaCleanup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Image as ImageIcon, 
  Settings, 
  BarChart3,
  FolderOpen
} from 'lucide-react';

type TabType = 'library' | 'cleanup' | 'analytics';

export default function MediaAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('library');

  const tabs = [
    {
      id: 'library' as TabType,
      label: 'Biblioteca',
      icon: FolderOpen,
      description: 'Gerencie suas imagens e arquivos'
    },
    {
      id: 'cleanup' as TabType,
      label: 'Limpeza',
      icon: Settings,
      description: 'Otimize o armazenamento'
    },
    {
      id: 'analytics' as TabType,
      label: 'Estatísticas',
      icon: BarChart3,
      description: 'Análise de uso'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return (
          <MediaLibrary
            allowUpload={true}
            allowDelete={true}
            allowBulkOperations={true}
            allowMultiSelect={true}
            viewMode="grid"
          />
        );
      case 'cleanup':
        return <MediaCleanup />;
      case 'analytics':
        return (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              Estatísticas em Desenvolvimento
            </h3>
            <p className="text-muted-foreground">
              Análises detalhadas de uso de mídia estarão disponíveis em breve
            </p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ImageIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Mídia</h1>
          <p className="text-muted-foreground">
            Gerencie imagens, otimize armazenamento e analise o uso de mídia
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}