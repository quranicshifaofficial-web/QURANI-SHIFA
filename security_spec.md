# Security Specification — কুরআনী শিফা (QURANI SHIFA)

## 1. Data Invariants

1. **Public Read Isolation**: Unauthenticated visitors may ONLY read `/site_settings/main` and documents in `/services` or `/videos` where `published == true`. Unpublished drafts are strictly readable only by verified admins.
2. **Zero Public Admin Registration**: No user may create or escalate their own entry in `/admins/{adminUid}`. Only the bootstrapped verified admin (`quranicshifa.official@gmail.com`) or an already-verified admin in `/admins/{uid}` may write to `/admins`, `/site_settings`, `/services`, or `/videos`.
3. **Email Verification Enforcement**: Every admin check requires `request.auth != null && request.auth.token.email_verified == true`.
4. **Strict Schema & Volumetric Bounds**: All documents validate exact allowed keys (`hasAll` + `hasOnly`), string `.size()` limits, valid ID regex (`^[a-zA-Z0-9_\-]+$`), immutable `createdAt`, and server-enforced `request.time` timestamps.
5. **No PII Leakage**: `/admins/{adminUid}` contains admin emails/UIDs and is strictly unreadable by public or non-admin users (`get` limited to self or admin; `list` limited to admin).

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Unauthenticated Write to `site_settings/main`**: Anonymous client attempts to overwrite `contact.phone` -> `PERMISSION_DENIED`.
2. **Self-Admin Escalation**: Signed-in non-admin user attempts `setDoc(doc(db, 'admins', myUid), { uid: myUid, email: 'attacker@example.com', ... })` -> `PERMISSION_DENIED`.
3. **Unverified Admin Email Spoof**: Signed-in user with `email_verified: false` and `email: 'quranicshifa.official@gmail.com'` attempts write -> `PERMISSION_DENIED`.
4. **Public Listing of Unpublished Videos**: Unauthenticated visitor queries `/videos` without `where('published', '==', true)` -> `PERMISSION_DENIED`.
5. **Public Reading of Unpublished Service Draft**: Unauthenticated visitor calls `getDoc` on `/services/draft-1` where `published == false` -> `PERMISSION_DENIED`.
6. **Ghost Field / Shadow Update**: Authenticated admin attempts to inject `{ isSuperAdmin: true }` into `/services/s1` -> `PERMISSION_DENIED` (`hasOnly` rejection).
7. **ID Poisoning Attack**: Admin attempts to write to `/services/` with a 300-character or special-character document ID (`../../etc`) -> `PERMISSION_DENIED` (`isValidId` rejection).
8. **Denial-of-Wallet Large String Injection**: Admin attempts to store a 2MB string in `videoUrl` -> `PERMISSION_DENIED` (`videoUrl.size() <= 1024`).
9. **Timestamp Forgery**: Admin attempts to write `createdAt` or `updatedAt` in the past instead of `serverTimestamp()` (`request.time`) -> `PERMISSION_DENIED`.
10. **Immutable `createdAt` Tampering**: Admin attempts to alter `createdAt` during an update on `/videos/v1` -> `PERMISSION_DENIED`.
11. **Invalid Video Platform Enum**: Admin attempts to set `platform: 'tiktok'` on `/videos/v1` -> `PERMISSION_DENIED`.
12. **Cross-User Admin List Scrape**: Signed-in non-admin attempts `getDocs(collection(db, 'admins'))` -> `PERMISSION_DENIED`.
