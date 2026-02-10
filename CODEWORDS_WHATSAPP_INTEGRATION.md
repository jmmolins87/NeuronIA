# CodeWords WhatsApp Lead Integration

## Configuración

### 1. API Route
API Route creada en `/app/api/whatsapp-lead/route.ts`

### 2. Variable de entorno
Agregada en `.env.local`:
```bash
CODEWORDS_API_KEY="cwk-tu-api-key-aqui"
```

### 3. Componente del formulario
Componente creado en `/components/WhatsAppLeadForm.tsx`

## Flujo de integración

1. **Visitante** ingresa su teléfono de WhatsApp en el formulario
2. **API Route** Next.js captura el teléfono y llama a CodeWords API
3. **CodeWords** registra el lead y envía el primer mensaje de WhatsApp
4. **Agente ClinvetIA** toma el control automáticamente

## Uso

Importa y usa el componente donde necesites:
```tsx
import WhatsAppLeadForm from '@/components/WhatsAppLeadForm';

export default function MiPagina() {
  return (
    <div>
      <WhatsAppLeadForm />
    </div>
  );
}
```

## Endpoints disponibles
- `POST /api/whatsapp-lead` - Recibe teléfono y activa el setter

## Variables de entorno requeridas
- `CODEWORDS_API_KEY` - Tu API key de CodeWords (consíguela en codewords.agemo.ai/account/keys)

## Respuesta esperada
El agente setter ClinvetIA iniciará automáticamente la conversación por WhatsApp con el lead registrado.