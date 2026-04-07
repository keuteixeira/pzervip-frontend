/**
 * Link oficial do WhatsApp Web/App (`api.whatsapp.com/send`).
 * `phoneDigits` — só dígitos, com DDI (ex.: Brasil 55 + DDD + número).
 */
export function buildWhatsAppSendUrl(phoneDigits: string, displayName: string): string {
  const phone = phoneDigits.replace(/\D/g, '')
  const name = displayName.trim()
  const text =
    name.length > 0
      ? `Olá! Vi o perfil de ${name} no Prazer.Vip e gostaria de agendar com você. Quais os horários disponíveis?`
      : 'Olá! Vi seu perfil no Prazer.Vip e gostaria de agendar com você. Quais os horários disponíveis?'
  const params = new URLSearchParams({
    phone,
    text,
    type: 'phone_number',
    app_absent: '0',
  })
  return `https://api.whatsapp.com/send/?${params.toString()}`
}
