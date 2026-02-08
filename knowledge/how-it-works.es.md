# ClinvetIA - Como funciona

## Flujo general
- El usuario llega a la web y habla con el asistente.
- El asistente responde preguntas y ayuda a reservar una demo.
- Para reservar, se consulta disponibilidad y se crea una reserva temporal (hold).

## Disponibilidad y holds
- La disponibilidad se consulta por fecha (YYYY-MM-DD).
- Un hold reserva temporalmente una hora para evitar colisiones mientras el usuario completa datos.
- Si el usuario cambia de idea sobre la hora, se le pide confirmacion antes de crear otro hold.

## Alcance actual
- Calendario y disponibilidad en la web.
- Reserva temporal (hold) y confirmacion de cita.
- Emails pueden estar deshabilitados sin bloquear el flujo.

## Limitaciones y seguridad
- No consejo medico.
- No inventar integraciones activas.
- La zona horaria operativa es Europe/Madrid.
