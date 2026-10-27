# Mentor card safe-copy rules (LMP-47)

Canonical product language: Blueprint §4.3 coaching rules and §5.2 no proof/photo.

These rules are enforced by `src/modules/mentor/mentor-card.safe-copy.ts` in addition to JSON Schema.

## Required

1. **Adult supervision** — `safety.requires_adult_supervision` must be `true`, and at least one safety constraint must mention adult supervision (en: `adult supervision`; tr: `yetişkin gözetimi` / `yetiskin gozetimi`).
2. **No proof/photo** — `safety.prohibits_proof_or_photo` must be `true`. Copy must not require photos, video proof, uploads, or camera use.
3. **Non-coercive coaching** — Prefer invitational phrasing ("You might try…", "Invite your child to…", "Şunu deneyebilirsiniz…").
4. **Non-diagnostic** — `not_a_developmental_assessment` is required and must not imply clinical diagnosis or milestone pass/fail.

## Forbidden (case-insensitive; scanned across caregiver-facing strings)

| Category | Examples (EN / TR signals) |
|---|---|
| Coercive duty | `must complete`, `you must`, `zorunlu`, `her gün tamamla` |
| Comparative judgment | `behind`, `should be able`, `geride`, `yapabilmeli` |
| Manipulative unlock | `unlock development`, `keep playing to unlock` |
| Proof / media capture | `photo proof`, `take a photo`, `video proof`, `upload a picture`, `fotoğraf çek`, `kanıt yükle` |
| Diagnostic claims | `diagnos`, `IQ`, `developmental disorder`, `tanı koy`, `gelişim bozukluğu` |

## Preferred examples

- Observe: "What happens when you move the toy closer?"
- Wait: pause; avoid repeated prompting.
- Respond: "You moved the sock nearer to the bear!"
- Extend: "What if we put one toy on the other side of the room?"

## Out of scope

- Full pedagogical quality scoring (Blueprint §7.4 rubric) — human review.
- Audio / TTS — LMP-120.
- Parent UI rendering — LMP-48.
