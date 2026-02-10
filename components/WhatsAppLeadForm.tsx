'use client';
import { useState } from 'react';

export default function WhatsAppLeadForm() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/whatsapp-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'No se pudo enviar el mensaje');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-xl">
        <p className="text-green-700 text-xl font-bold">
          ✅ ¡Te hemos enviado un WhatsApp!
        </p>
        <p className="text-gray-600 mt-2">
          Revisa tu WhatsApp para continuar la conversación
          con nuestro equipo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">
          Tu número de WhatsApp
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500">
            +
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="34612345678"
            required
            className="flex-1 p-3 border rounded-r-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Incluye código de país (ej: 34 para España)
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !phone}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300
                   text-white py-3 px-6 rounded-lg font-bold transition-colors"
      >
        {loading
          ? '⏳ Enviando...'
          : '📱 Recibir consultoría gratis por WhatsApp'}
      </button>
    </form>
  );
}
