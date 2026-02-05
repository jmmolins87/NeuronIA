"use client"

import * as React from "react"
import { Cookie } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CancelButton } from "@/components/cta/cancel-button"
import { BorderButton } from "@/components/cta/border-button"

const STORAGE_KEY = "clinvetia-cookie-preferences"

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
}

interface CookieConsentContextValue {
  preferences: CookiePreferences | null
  updatePreferences: (prefs: Partial<CookiePreferences>) => void
  showSettings: () => void
}

const CookieConsentContext = React.createContext<CookieConsentContextValue | undefined>(undefined)

export function useCookieConsent() {
  const context = React.useContext(CookieConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider")
  }
  return context
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const [preferences, setPreferences] = React.useState<CookiePreferences | null>(null)
  const [showDialog, setShowDialog] = React.useState(false)
  const [showCustomize, setShowCustomize] = React.useState(false)
  const [tempPreferences, setTempPreferences] = React.useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: 0,
  })

  // Load preferences on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences
        setPreferences(parsed)
      } catch {
        // Invalid data, show dialog
        setShowDialog(true)
      }
    } else {
      // No preferences found, show dialog
      setShowDialog(true)
    }
  }, [])

  const savePreferences = React.useCallback((prefs: CookiePreferences) => {
    const prefsWithTimestamp = {
      ...prefs,
      timestamp: Date.now(),
      necessary: true, // Always true
    }
    setPreferences(prefsWithTimestamp)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsWithTimestamp))
    setShowDialog(false)
    setShowCustomize(false)
  }, [])

  const handleAcceptAll = React.useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    })
  }, [savePreferences])

  const handleRejectAll = React.useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    })
  }, [savePreferences])

  const handleCustomize = React.useCallback(() => {
    setShowCustomize(true)
  }, [])

  const handleSaveCustom = React.useCallback(() => {
    savePreferences(tempPreferences)
  }, [savePreferences, tempPreferences])

  const updatePreferences = React.useCallback((prefs: Partial<CookiePreferences>) => {
    if (preferences) {
      savePreferences({ ...preferences, ...prefs })
    }
  }, [preferences, savePreferences])

  const showSettings = React.useCallback(() => {
    if (preferences) {
      setTempPreferences(preferences)
    }
    setShowDialog(true)
    setShowCustomize(true)
  }, [preferences])

  const contextValue = React.useMemo(
    () => ({
      preferences,
      updatePreferences,
      showSettings,
    }),
    [preferences, updatePreferences, showSettings]
  )

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <AlertDialogTitle className="text-2xl">{t("cookies.title")}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {t("cookies.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {showCustomize && (
            <div className="space-y-4 py-4">
              {/* Necessary Cookies */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                <Checkbox
                  id="cookie-necessary"
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="cookie-necessary"
                    className="text-base font-medium cursor-not-allowed"
                  >
                    {t("cookies.categories.necessary.title")}{" "}
                    <span className="text-sm text-muted-foreground">
                      {t("cookies.categories.necessary.required")}
                    </span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("cookies.categories.necessary.description")}
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Checkbox
                  id="cookie-analytics"
                  checked={tempPreferences.analytics}
                  onCheckedChange={(checked) =>
                    setTempPreferences((prev) => ({
                      ...prev,
                      analytics: checked === true,
                    }))
                  }
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="cookie-analytics" className="text-base font-medium cursor-pointer">
                    {t("cookies.categories.analytics.title")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("cookies.categories.analytics.description")}
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Checkbox
                  id="cookie-marketing"
                  checked={tempPreferences.marketing}
                  onCheckedChange={(checked) =>
                    setTempPreferences((prev) => ({
                      ...prev,
                      marketing: checked === true,
                    }))
                  }
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="cookie-marketing" className="text-base font-medium cursor-pointer">
                    {t("cookies.categories.marketing.title")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("cookies.categories.marketing.description")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            {!showCustomize ? (
              <>
                <CancelButton onClick={handleRejectAll}>
                  {t("cookies.rejectAll")}
                </CancelButton>
                <BorderButton onClick={handleCustomize}>
                  {t("cookies.customize")}
                </BorderButton>
                <AlertDialogAction onClick={handleAcceptAll}>
                  {t("cookies.acceptAll")}
                </AlertDialogAction>
              </>
            ) : (
              <>
                <CancelButton
                  onClick={() => {
                    setShowCustomize(false)
                    setTempPreferences({
                      necessary: true,
                      analytics: false,
                      marketing: false,
                      timestamp: Date.now(),
                    })
                  }}
                >
                  {t("common.back")}
                </CancelButton>
                <AlertDialogAction onClick={handleSaveCustom}>
                  {t("cookies.savePreferences")}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CookieConsentContext.Provider>
  )
}
