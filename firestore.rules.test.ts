/**
 * Security Rules Specification Verification Matrix (Dirty Dozen)
 *
 * This test suite defines the 12 adversarial payloads from security_spec.md
 * that firestore.rules enforces with PERMISSION_DENIED.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid?: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated write to site_settings/main',
    collection: 'site_settings/main',
    operation: 'update',
    auth: null,
    payload: { contact: { phone: '+880000000000' } },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Self-admin escalation by non-admin user',
    collection: 'admins/attackerUid',
    operation: 'create',
    auth: { uid: 'attackerUid', email: 'attacker@example.com', email_verified: true },
    payload: { uid: 'attackerUid', email: 'attacker@example.com', addedBy: 'attackerUid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified admin email spoof attack',
    collection: 'site_settings/main',
    operation: 'update',
    auth: { uid: 'spoofUid', email: 'quranicshifa.official@gmail.com', email_verified: false },
    payload: { publishedUrl: 'https://evil.example.com' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Public unauthenticated listing of all videos without published filter',
    collection: 'videos',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Public unauthenticated get of unpublished service draft',
    collection: 'services/draft_1',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Ghost field / shadow update injection',
    collection: 'services/srv_1',
    operation: 'create',
    auth: { uid: 'adminUid', email: 'quranicshifa.official@gmail.com', email_verified: true },
    payload: { order: 1, published: true, isSuperAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'ID poisoning path traversal guard',
    collection: 'services/..bad..id',
    operation: 'create',
    auth: { uid: 'adminUid', email: 'quranicshifa.official@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial-of-Wallet 2MB videoUrl payload',
    collection: 'videos/vid_1',
    operation: 'create',
    auth: { uid: 'adminUid', email: 'quranicshifa.official@gmail.com', email_verified: true },
    payload: { platform: 'youtube', videoUrl: 'x'.repeat(2048) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client-forged past timestamp instead of request.time',
    collection: 'videos/vid_1',
    operation: 'create',
    auth: { uid: 'adminUid', email: 'quranicshifa.official@gmail.com', email_verified: true },
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable createdAt tampering on update',
    collection: 'videos/vid_1',
    operation: 'update',
    auth: { uid: 'adminUid', email: 'quranicshifa.official@gmail.com', email_verified: true },
    payload: { createdAt: '2025-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Invalid video platform enum',
    collection: 'videos/vid_1',
    operation: 'create',
    auth: { uid: 'adminUid', email: 'quranicshifa.official@gmail.com', email_verified: true },
    payload: { platform: 'tiktok' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Cross-user admin registry list scrape',
    collection: 'admins',
    operation: 'list',
    auth: { uid: 'regularUser', email: 'visitor@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
