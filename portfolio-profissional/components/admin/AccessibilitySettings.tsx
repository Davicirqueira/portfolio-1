'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { useAccessibility } from '@/lib/context/AccessibilityContext';
import { useI18n } from '@/lib/context/I18nContext';
import { useTranslation } from '@/lib/context/I18nContext';
import { 
  Eye, 
  Type, 
  Keyboard, 
  Volume2, 
  Palette, 
  Zap,
  RotateCcw,
  Languages
} from 'lucide-react';

export function AccessibilitySettings() {
  const { preferences, updatePreferences, resetPreferences } = useAccessibility();
  const { language, setLanguage } = useI18n();
  const { t } = useTranslation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'en' | 'pt');
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetPreferences();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('settings.accessibility')}</h2>
        <p className="text-muted-foreground">
          Configure accessibility preferences for better usability
        </p>
      </div>

      <div className="grid gap-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the admin interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="language-select">{t('settings.language')}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language-select" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Accessibility
            </CardTitle>
            <CardDescription>
              Adjust visual settings for better readability and contrast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast">{t('settings.highContrast')}</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => 
                    updatePreferences({ highContrast: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="font-size">{t('settings.fontSize')}</Label>
                  <p className="text-sm text-muted-foreground">
                    Adjust text size for better readability
                  </p>
                </div>
                <Select 
                  value={preferences.fontSize} 
                  onValueChange={(value: any) => 
                    updatePreferences({ fontSize: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motion and Animation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Motion & Animation
            </CardTitle>
            <CardDescription>
              Control animations and motion effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reduced-motion">{t('settings.reducedMotion')}</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce or disable animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={preferences.reducedMotion}
                onCheckedChange={(checked) => 
                  updatePreferences({ reducedMotion: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation and Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Navigation & Input
            </CardTitle>
            <CardDescription>
              Configure keyboard navigation and input preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-nav">{t('settings.keyboardNavigation')}</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable enhanced keyboard navigation support
                  </p>
                </div>
                <Switch
                  id="keyboard-nav"
                  checked={preferences.keyboardNavigation}
                  onCheckedChange={(checked) => 
                    updatePreferences({ keyboardNavigation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader">{t('settings.screenReader')}</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize interface for screen reader users
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={preferences.screenReader}
                  onCheckedChange={(checked) => 
                    updatePreferences({ screenReader: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Reset Settings
            </CardTitle>
            <CardDescription>
              Reset all accessibility preferences to default values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccessibleButton
              variant={showResetConfirm ? "destructive" : "outline"}
              onClick={handleReset}
              ariaLabel={showResetConfirm ? "Confirm reset settings" : "Reset accessibility settings"}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {showResetConfirm ? "Confirm Reset" : "Reset All Settings"}
            </AccessibleButton>
            {showResetConfirm && (
              <p className="text-sm text-muted-foreground mt-2">
                Click again to confirm reset
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}