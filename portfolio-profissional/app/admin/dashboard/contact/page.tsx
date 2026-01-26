'use client';

import React, { useState, useEffect } from 'react';
import { ContactEditor } from '@/components/admin/forms/ContactEditor';
import { ContactInfo } from '@/lib/types/portfolio';

export default function ContactAdminPage() {
  const [contactData, setContactData] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial contact data
    const loadContactData = async () => {
      try {
        const response = await fetch('/api/admin/contact');
        if (response.ok) {
          const result = await response.json();
          setContactData(result.data);
        } else {
          console.error('Failed to load contact data');
        }
      } catch (error) {
        console.error('Error loading contact data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContactData();
  }, []);

  const handleSave = async (data: ContactInfo) => {
    try {
      const response = await fetch('/api/admin/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao salvar informações de contato');
      }

      const result = await response.json();
      setContactData(result.data);
      
      console.log('Contact data saved successfully');
    } catch (error) {
      console.error('Error saving contact data:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContactEditor
        initialData={contactData || undefined}
        onSave={handleSave}
      />
    </div>
  );
}