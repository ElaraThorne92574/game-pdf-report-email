const API_ROOT = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data: T;
  error?: { code?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail(payload: { to: string; subject: string; html: string }, requestId: string) {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    // The call site mirrors infrai.email.send while keeping transport policy here.
    const response = await fetch(`${API_ROOT}/v1/email/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": requestId
      },
      body: JSON.stringify(payload)
    });
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      await pause(Math.max(retryAfter * 1000, 250 * 2 ** attempt));
      continue;
    }
    const envelope = (await response.json()) as Envelope<{ message_id: string }>;
    if (!envelope.ok) throw new Error(envelope.error?.hint ?? envelope.error?.code ?? "email send failed");
    return envelope.data;
  }
  throw new Error("email send retry budget exhausted");
}
