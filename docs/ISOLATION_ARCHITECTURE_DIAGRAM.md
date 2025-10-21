# 数据隔离架构图

## 🏗️ 整体架构图

```mermaid
graph TB
    subgraph "Application Layer"
        A1[User API]
        A2[Admin API] 
        A3[System API]
    end
    
    subgraph "Framework Layer - @hl8/nestjs-isolation"
        F1[IsolationContextService]
        F2[MultiLevelIsolationService]
        F3[IsolationGuard]
        F4[IsolationExtractionMiddleware]
        F5[@CurrentContext Decorator]
        F6[@RequireLevel Decorator]
    end
    
    subgraph "Infrastructure Layer - @hl8/infrastructure-kernel"
        I1[IsolationContextManager]
        I2[AccessControlService]
        I3[AuditLogService]
        I4[SecurityMonitorService]
        I5[CacheService]
        I6[DatabaseService]
    end
    
    subgraph "Domain Layer - @hl8/domain-kernel"
        D1[IsolationContext Entity]
        D2[IsolationLevel Enum]
        D3[SharingLevel Enum]
        D4[Value Objects]
        D5[Business Rules]
    end
    
    A1 --> F3
    A2 --> F3
    A3 --> F3
    
    F3 --> F2
    F4 --> F1
    F5 --> F1
    F6 --> F3
    
    F1 --> I1
    F2 --> I2
    
    I1 --> D1
    I2 --> D1
    I3 --> D1
    I4 --> D1
    I5 --> D1
    I6 --> D1
    
    D1 --> D2
    D1 --> D3
    D1 --> D4
    D1 --> D5
```

## 🔐 隔离层级图

```mermaid
graph TD
    subgraph "Isolation Levels"
        P[Platform Level<br/>平台级]
        T[Tenant Level<br/>租户级]
        O[Organization Level<br/>组织级]
        D[Department Level<br/>部门级]
        U[User Level<br/>用户级]
    end
    
    P --> T
    T --> O
    O --> D
    D --> U
    
    P -.->|"Can access all"| T
    P -.->|"Can access all"| O
    P -.->|"Can access all"| D
    P -.->|"Can access all"| U
    
    T -.->|"Can access tenant data"| O
    T -.->|"Can access tenant data"| D
    T -.->|"Can access tenant data"| U
    
    O -.->|"Can access org data"| D
    O -.->|"Can access org data"| U
    
    D -.->|"Can access dept data"| U
```

## 🔄 数据流图

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Guard
    participant Service
    participant Repository
    participant Database
    participant Cache
    
    Client->>Middleware: HTTP Request
    Middleware->>Middleware: Extract Context
    Middleware->>Guard: Set Context
    Guard->>Guard: Validate Level
    Guard->>Service: Authorized Request
    Service->>Repository: Query with Context
    Repository->>Database: Build WHERE clause
    Database->>Repository: Return filtered data
    Repository->>Service: Return data
    Service->>Cache: Store with context key
    Service->>Client: Return response
```

## 🛡️ 权限控制流图

```mermaid
flowchart TD
    Start([Request]) --> Extract[Extract Context]
    Extract --> Validate{Validate Context}
    Validate -->|Invalid| Deny[Access Denied]
    Validate -->|Valid| CheckLevel{Check Required Level}
    CheckLevel -->|Insufficient| Deny
    CheckLevel -->|Sufficient| CheckData{Check Data Access}
    CheckData -->|No Access| Deny
    CheckData -->|Access Granted| Filter[Apply Data Filtering]
    Filter --> Execute[Execute Operation]
    Execute --> Audit[Log Access]
    Audit --> Success[Success Response]
    Deny --> LogDenial[Log Denial]
    LogDenial --> Error[Error Response]
```

## 🏢 多租户架构图

```mermaid
graph TB
    subgraph "Platform Level"
        P[Platform Admin]
    end
    
    subgraph "Tenant A"
        TA[Tenant A Admin]
        subgraph "Organization A1"
            OA1[Org A1 Admin]
            subgraph "Department A1-1"
                DA1[Dept A1-1 Admin]
                UA1[User A1-1-1]
                UA2[User A1-1-2]
            end
            subgraph "Department A1-2"
                DA2[Dept A1-2 Admin]
                UA3[User A1-2-1]
            end
        end
        subgraph "Organization A2"
            OA2[Org A2 Admin]
            DA3[Dept A2-1 Admin]
            UA4[User A2-1-1]
        end
    end
    
    subgraph "Tenant B"
        TB[Tenant B Admin]
        subgraph "Organization B1"
            OB1[Org B1 Admin]
            DB1[Dept B1-1 Admin]
            UB1[User B1-1-1]
        end
    end
    
    P -.->|"Full Access"| TA
    P -.->|"Full Access"| TB
    
    TA -.->|"Tenant Access"| OA1
    TA -.->|"Tenant Access"| OA2
    
    OA1 -.->|"Org Access"| DA1
    OA1 -.->|"Org Access"| DA2
    
    DA1 -.->|"Dept Access"| UA1
    DA1 -.->|"Dept Access"| UA2
```

## 🔧 技术实现图

```mermaid
graph LR
    subgraph "Request Processing"
        R1[HTTP Request]
        R2[Extract Headers]
        R3[Create Context]
        R4[Set in CLS]
    end
    
    subgraph "Authorization"
        A1[Guard Check]
        A2[Level Validation]
        A3[Permission Check]
    end
    
    subgraph "Data Access"
        D1[Build Query]
        D2[Apply Filters]
        D3[Execute Query]
        D4[Return Data]
    end
    
    subgraph "Caching"
        C1[Generate Cache Key]
        C2[Check Cache]
        C3[Store Result]
    end
    
    subgraph "Auditing"
        L1[Log Access]
        L2[Record Metrics]
        L3[Security Monitor]
    end
    
    R1 --> R2
    R2 --> R3
    R3 --> R4
    R4 --> A1
    A1 --> A2
    A2 --> A3
    A3 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 --> C1
    C1 --> C2
    C2 --> C3
    D4 --> L1
    L1 --> L2
    L2 --> L3
```

## 📊 性能监控图

```mermaid
graph TB
    subgraph "Metrics Collection"
        M1[Access Count]
        M2[Response Time]
        M3[Error Rate]
        M4[Cache Hit Rate]
    end
    
    subgraph "Health Checks"
        H1[Database Health]
        H2[Cache Health]
        H3[Isolation Health]
        H4[Service Health]
    end
    
    subgraph "Alerting"
        A1[Threshold Alerts]
        A2[Anomaly Detection]
        A3[Security Alerts]
        A4[Performance Alerts]
    end
    
    M1 --> A1
    M2 --> A1
    M3 --> A2
    M4 --> A1
    
    H1 --> A3
    H2 --> A3
    H3 --> A3
    H4 --> A4
```

## 🔒 安全架构图

```mermaid
graph TB
    subgraph "Security Layers"
        S1[Authentication]
        S2[Authorization]
        S3[Data Isolation]
        S4[Audit Logging]
        S5[Security Monitoring]
    end
    
    subgraph "Threat Protection"
        T1[SQL Injection Prevention]
        T2[Data Leakage Prevention]
        T3[Unauthorized Access Prevention]
        T4[Audit Trail Protection]
    end
    
    subgraph "Compliance"
        C1[GDPR Compliance]
        C2[Data Retention]
        C3[Access Logging]
        C4[Privacy Protection]
    end
    
    S1 --> T1
    S2 --> T2
    S3 --> T3
    S4 --> T4
    S5 --> T1
    
    T1 --> C1
    T2 --> C2
    T3 --> C3
    T4 --> C4
```

## 🚀 部署架构图

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Load Balancer]
    end
    
    subgraph "Application Servers"
        AS1[App Server 1]
        AS2[App Server 2]
        AS3[App Server N]
    end
    
    subgraph "Database Cluster"
        DB1[Primary DB]
        DB2[Replica DB 1]
        DB3[Replica DB 2]
    end
    
    subgraph "Cache Cluster"
        C1[Redis Master]
        C2[Redis Slave 1]
        C3[Redis Slave 2]
    end
    
    subgraph "Monitoring"
        M1[Prometheus]
        M2[Grafana]
        M3[AlertManager]
    end
    
    LB --> AS1
    LB --> AS2
    LB --> AS3
    
    AS1 --> DB1
    AS2 --> DB1
    AS3 --> DB1
    
    DB1 --> DB2
    DB1 --> DB3
    
    AS1 --> C1
    AS2 --> C1
    AS3 --> C1
    
    C1 --> C2
    C1 --> C3
    
    AS1 --> M1
    AS2 --> M1
    AS3 --> M1
    
    M1 --> M2
    M1 --> M3
```

---

**文档版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: HL8 开发团队
