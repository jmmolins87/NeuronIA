"use client"

/**
 * Demo Controls
 * 
 * Controls for DEMO mode users to regenerate mock data.
 * Only visible when user.mode === "DEMO"
 */

import * as React from "react"
import { RefreshCw, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDemoStore } from "@/lib/admin/demo-store"

export function DemoControls() {
  const { regenerateData, seed } = useDemoStore()
  const [open, setOpen] = React.useState(false)
  const [customSeed, setCustomSeed] = React.useState("")
  const [isRegenerating, setIsRegenerating] = React.useState(false)

  const handleRegenerate = React.useCallback(() => {
    setIsRegenerating(true)
    
    // Small delay for UX (show loading state)
    setTimeout(() => {
      regenerateData(customSeed || undefined)
      setIsRegenerating(false)
      setOpen(false)
      setCustomSeed("")
    }, 300)
  }, [customSeed, regenerateData])

  const handleQuickRegenerate = React.useCallback(() => {
    setIsRegenerating(true)
    setTimeout(() => {
      regenerateData()
      setIsRegenerating(false)
    }, 300)
  }, [regenerateData])

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickRegenerate}
        disabled={isRegenerating}
        aria-label="Regenerar datos demo rápidamente"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
        Regenerar Datos
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Opciones avanzadas de regeneración"
          >
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Regenerar Datos Demo</DialogTitle>
            <DialogDescription>
              Genera un nuevo conjunto de datos ficticios. Usa una semilla personalizada
              para obtener resultados consistentes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-seed">Semilla Actual</Label>
              <Input
                id="current-seed"
                value={seed || ""}
                readOnly
                className="bg-muted"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="custom-seed">
                Semilla Personalizada (opcional)
              </Label>
              <Input
                id="custom-seed"
                placeholder="Ej: mi-demo-2024"
                value={customSeed}
                onChange={(e) => setCustomSeed(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deja vacío para generar datos aleatorios. Misma semilla = mismos datos.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setCustomSeed("")
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                "Regenerar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
