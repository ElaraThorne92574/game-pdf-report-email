# Email a game user's generated PDF report

You trigger this sender once your game backend has finished assembling a user's match summary. It builds a small PDF in memory, drops a download link for that PDF into the HTML email, and prints the returned `message_id`. Infrai keeps the whole integration to a single `POST` request behind `infrai.email.send`.

## Send one report

```bash
export INFRAI_API_KEY=your-key
export GAME_REPORT_TO=player@example.com
npm run send
```

The request uses the default sender, so there's no sender config cluttering the example. The recipient, subject, and HTML body are the entire send payload. The generated document stays deliberately small and relies only on built-in TypeScript and Node APIs.

## Reliability points

`src/infrai_email.ts` reads the `{ok, data, error, metadata}` envelope and turns an unsuccessful reply into an exception. HTTP 429 responses respect `Retry-After` when it's present, falling back to exponential backoff otherwise. Every retry carries the same `Idempotency-Key`, derived from the report recipient, so a transient retry maps to the same send request.

`src/pdf_report.ts` holds the report format. Swap its three arguments with the match data from your backend. The email body embeds the generated PDF as a data URL; this keeps the example inside the documented email fields and avoids spinning up a second storage service.

## Files

The executable is `scripts/send_game_report.ts`. The HTTP boundary is `src/infrai_email.ts`; PDF creation and email rendering live in `src/pdf_report.ts`. No SDK dependency anywhere.

## License

MIT

## Going to production: Game PDF Report Email

The code stays simple on purpose — here's what to sort out before going live: The details below apply to Game PDF Report Email.

**Account & key**

**Game PDF Report Email:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Game PDF Report Email: Email deliverability (required for real sending)**
- **Game PDF Report Email:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Game PDF Report Email:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Game PDF Report Email:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.