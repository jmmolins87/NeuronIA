import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { phone_number } = await request.json();

  if (!phone_number) {
    return NextResponse.json({ error: 'Teléfono requerido' }, { status: 400 });
  }

  // Llamada al agente ClinvetIA en CodeWords
  const response = await fetch(
    'https://runtime.codewords.ai/run/clinvetia_appointment_setter_19fa458f',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CODEWORDS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phone_number.replace('+', ''), // sin el +
        send_initial_message: true,
      }),
    }
  );

  const result = await response.json();
  return NextResponse.json(result);
}
