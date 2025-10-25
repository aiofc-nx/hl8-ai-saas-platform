# Audit Logging Requirements

> **Purpose**: Document audit logging requirements and implementation  
> **Scope**: Security events, data access, compliance

---

## Overview

Audit logging is essential for security, compliance, and operational visibility. All security events, data access, and administrative actions are logged with complete traceability.

---

## Audit Event Categories

### 1. Authentication Events

```typescript
interface AuthenticationAuditEvent {
  event: 'login_success' | 'login_failure' | 'logout' | 'token_refresh' | 'mfa_challenge';
  userId?: UserId;
  username?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
}
```

**Logged Events**:
- Successful login
- Failed login attempts
- Token refresh
- Password reset requests
- MFA challenges
- Account lockouts

### 2. Authorization Events

```typescript
interface AuthorizationAuditEvent {
  event: 'permission_granted' | 'permission_denied' | 'role_assigned' | 'role_revoked';
  userId: UserId;
  tenantId: TenantId;
  action: string;
  resource: string;
  success: boolean;
  deniedReason?: string;
}
```

**Logged Events**:
- Permission checks
- Role assignments
- Permission denied events
- Cross-tenant access attempts
- Unauthorized access attempts

### 3. Data Access Events

```typescript
interface DataAccessAuditEvent {
  event: 'data_read' | 'data_created' | 'data_updated' | 'data_deleted' | 'data_exported';
  userId: UserId;
  tenantId: TenantId;
  resource: string;
  resourceId: string;
  action: string;
  fieldsAccessed?: string[];
  timestamp: Date;
}
```

**Logged Events**:
- Data reads (sensitive data)
- Data modifications
- Data deletions
- Data exports
- Bulk operations

### 4. Administrative Events

```typescript
interface AdministrativeAuditEvent {
  event: 'config_changed' | 'user_created' | 'user_deleted' | 'role_modified' | 'policy_changed';
  userId: UserId;
  targetType: string;
  targetId: string;
  changes: Record<string, any>;
  timestamp: Date;
}
```

**Logged Events**:
- Configuration changes
- User management
- Role modifications
- Policy changes
- System settings

### 5. Security Events

```typescript
interface SecurityAuditEvent {
  event: 'security_violation' | 'suspicious_activity' | 'breach_attempt' | 'data_leak_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: UserId;
  tenantId?: TenantId;
  description: string;
  details: Record<string, any>;
  timestamp: Date;
}
```

**Logged Events**:
- Security violations
- Suspicious patterns
- Intrusion attempts
- Data leak detection
- Anomalous behavior

---

## Audit Log Implementation

### Log Structure

```typescript
interface AuditLogEntry {
  // Identification
  id: string;
  timestamp: Date;
  eventType: EventType;
  eventCategory: EventCategory;
  
  // Actor
  userId: UserId;
  username: string;
  userRoles: string[];
  
  // Context
  tenantId?: TenantId;
  organizationId?: OrganizationId;
  departmentId?: DepartmentId;
  
  // Action
  action: string;
  resource: string;
  resourceId?: string;
  
  // Result
  success: boolean;
  statusCode?: number;
  
  // Request context
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  
  // Changes
  changes?: Record<string, { old: any; new: any }>;
  fieldsAccessed?: string[];
  
  // Metadata
  metadata?: Record<string, any>;
}
```

### Log Storage

```typescript
// Audit log table structure
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  
  user_id UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  user_roles TEXT[],
  
  tenant_id UUID,
  organization_id UUID,
  department_id UUID,
  
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  
  success BOOLEAN NOT NULL,
  status_code INT,
  
  ip_address INET NOT NULL,
  user_agent TEXT,
  session_id UUID,
  
  changes JSONB,
  fields_accessed TEXT[],
  
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
```

### Logging Service

```typescript
@Injectable()
export class AuditLogService {
  
  async log(event: AuditLogEntry): Promise<void> {
    // 1. Create audit log entry
    const entry = AuditLogEntry.create(
      eventType,
      eventCategory,
      userId,
      action,
      resource,
      context
    );
    
    // 2. Enrich with request context
    entry.enrichWithRequest(request);
    
    // 3. Save to database
    await this.auditLogRepo.save(entry);
    
    // 4. Send to external systems (if configured)
    await this.sendToExternalSystems(entry);
    
    // 5. Alert on critical events
    if (this.isCriticalEvent(entry)) {
      await this.alertService.sendAlert(entry);
    }
  }
  
  private async sendToExternalSystems(entry: AuditLogEntry): Promise<void> {
    // Send to SIEM (Security Information and Event Management)
    if (this.config.siemEnabled) {
      await this.siemClient.send(entry);
    }
    
    // Send to analytics
    if (this.config.analyticsEnabled) {
      await this.analyticsClient.send(entry);
    }
  }
}
```

---

## Compliance Requirements

### GDPR Requirements

**Right to Access**: Users can request their audit logs.

```typescript
async function getUserAuditLogs(
  userId: UserId,
  startDate: Date,
  endDate: Date
): Promise<AuditLogEntry[]> {
  return this.auditLogRepo.findByUser(userId, startDate, endDate);
}
```

**Right to Deletion**: Audit logs for deleted users must be anonymized.

```typescript
async function anonymizeUserAuditLogs(userId: UserId): Promise<void> {
  // Anonymize user data in audit logs
  await this.auditLogRepo.updateByUser(userId, {
    userId: null,
    username: '[DELETED]',
    ipAddress: '0.0.0.0'
  });
}
```

### SOC 2 Requirements

- All administrative actions are logged
- Logs are tamper-proof
- Logs are retained for specified period
- Log access is restricted

---

## Retention and Archival

### Retention Policy

```typescript
interface AuditLogRetention {
  online: {
    period: '90 days'; // Keep in primary database
    enabled: true;
  };
  archive: {
    period: '7 years'; // Move to cold storage
    format: 'parquet';
    compression: 'gzip';
  };
  deletion: {
    period: '10 years'; // Permanently delete
  };
}
```

### Archival Process

```typescript
async function archiveAuditLogs(): Promise<void> {
  // 1. Find logs older than retention period
  const logsToArchive = await this.auditLogRepo.findOlderThan(
    Date.now() - 90 * 24 * 60 * 60 * 1000
  );
  
  // 2. Export to archival format
  const archiveFile = await this.exportLogs(logsToArchive);
  
  // 3. Upload to cold storage
  await this.storageService.upload(archiveFile, 'audit-logs');
  
  // 4. Delete from primary database
  await this.auditLogRepo.deleteMany(logsToArchive.map(l => l.id));
}
```

---

## Query and Analysis

### Query API

```typescript
@Controller('api/audit-logs')
export class AuditLogController {
  
  @Get()
  async query(
    @Query('userId') userId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50
  ) {
    const filter = AuditLogFilter.create({
      userId,
      tenantId,
      eventType,
      startDate,
      endDate
    });
    
    return this.auditLogService.query(filter, page, limit);
  }
}
```

### Analytics and Reporting

```typescript
// Security analytics
interface SecurityAnalytics {
  failedLoginAttempts(userId: UserId, period: Period): Promise<number>;
  suspiciousActivities(tenantId: TenantId): Promise<SecurityEvent[]>;
  dataAccessPatterns(userId: UserId): Promise<AccessPattern[]>;
  complianceViolations(tenantId: TenantId): Promise<Violation[]>;
}
```

---

## Security and Integrity

### Tamper Protection

- Audit logs are append-only
- Cryptographic hashing of log entries
- Digital signatures for critical events
- Immutable storage for compliance

### Access Control

- Only authorized roles can view audit logs
- Audit logs of audit log access (meta-logging)
- Encryption of sensitive data in logs
- Redaction of PII in logs

---

## Related Documentation

- [Permission Hierarchy](./permission-hierarchy.md)
- [Multi-Tenant Security](./tenant-security.md)
- [Compliance Requirements](../compliance/requirements.md)
