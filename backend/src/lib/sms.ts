/**
 * Отправка SMS через Twilio REST API (без SDK — через fetch).
 * Настраивается переменными окружения:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (номер-отправитель в формате +1...)
 * Если не заданы — SMS не отправляется (dev: код в логе/ответе).
 */
export function smsConfigured(): boolean {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!smsConfigured()) return false;
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM!;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    if (!res.ok) {
      console.error("[sms] Twilio error:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[sms] send failed:", e instanceof Error ? e.message : e);
    return false;
  }
}
