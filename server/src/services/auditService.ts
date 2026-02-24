import prisma from '../config/database';

interface AuditEntry {
  projectId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId: string;
  entityName: string;
  changes?: Record<string, any>;
}

/**
 * Log an audit event for any entity change.
 * Fire-and-forget: errors are logged but never block the main request.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        projectId: entry.projectId,
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType || 'flag',
        entityId: entry.entityId,
        entityName: entry.entityName,
        changes: entry.changes || {},
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit entry:', err);
  }
}

/**
 * Compute a shallow diff between two objects (before/after).
 * Only returns fields that actually changed.
 */
export function computeChanges(before: Record<string, any>, after: Record<string, any>): Record<string, any> {
  const diff: Record<string, { from: any; to: any }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    // Skip internal/meta fields
    if (['updatedAt', 'createdAt', 'project'].includes(key)) continue;

    const oldVal = JSON.stringify(before[key]);
    const newVal = JSON.stringify(after[key]);

    if (oldVal !== newVal) {
      diff[key] = { from: before[key], to: after[key] };
    }
  }

  return diff;
}
