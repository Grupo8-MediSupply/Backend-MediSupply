import { SetMetadata } from '@nestjs/common';

export const AUDIT_META_KEY = 'audit_metadata';

export interface AuditMetadata {
  module: string; 
  action: string; 
}

export const Auditable = (meta: AuditMetadata) => SetMetadata(AUDIT_META_KEY, meta);
