# Design Document - Sistema de Dashboard Administrativo

## Overview

O Sistema de Dashboard Administrativo é uma aplicação web completa que permitirá ao proprietário do portfólio gerenciar todo o conteúdo do site de forma intuitiva e segura. O sistema será construído como uma extensão do portfólio existente em Next.js, aproveitando a infraestrutura atual e mantendo consistência tecnológica.

A arquitetura seguirá o padrão de Single Page Application (SPA) com autenticação baseada em sessão, interface responsiva e operações CRUD completas para todas as seções do portfólio. O sistema incluirá gerenciamento dinâmico de modais, upload de imagens e persistência de dados em tempo real.

## Architecture

### Tecnologias Base
- **Frontend**: Next.js 16 com React 19, TypeScript, Tailwind CSS
- **Autenticação**: NextAuth.js com provider customizado
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Upload de Imagens**: Cloudinary ou AWS S3 com Next.js Image Optimization
- **Validação**: Zod (já utilizado no projeto)
- **Formulários**: React Hook Form (já utilizado no projeto)
- **Animações**: Framer Motion (já utilizado no projeto)

### Estrutura de Rotas
```
/admin
├── /login                    # Página de autenticação
├── /dashboard               # Dashboard principal
├── /dashboard/home          # Edição da seção Home
├── /dashboard/about         # Edição da seção Sobre
├── /dashboard/skills        # Edição de habilidades
├── /dashboard/experience    # Edição de experiência
├── /dashboard/projects      # Edição de projetos
├── /dashboard/education     # Edição de formação
├── /dashboard/testimonials  # Edição de depoimentos
├── /dashboard/contact       # Edição de contato
├── /dashboard/stats         # Edição de estatísticas
└── /dashboard/media         # Gerenciamento de imagens
```

### Arquitetura de Componentes
```
components/
├── admin/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   ├── forms/
│   │   ├── HomeEditor.tsx
│   │   ├── AboutEditor.tsx
│   │   ├── SkillEditor.tsx
│   │   ├── ProjectEditor.tsx
│   │   ├── ExperienceEditor.tsx
│   │   ├── EducationEditor.tsx
│   │   ├── TestimonialEditor.tsx
│   │   ├── ContactEditor.tsx
│   │   └── StatsEditor.tsx
│   ├── modals/
│   │   ├── ModalManager.tsx
│   │   ├── EducationModalEditor.tsx
│   │   ├── SkillModalEditor.tsx
│   │   └── ProjectModalEditor.tsx
│   ├── media/
│   │   ├── ImageUploader.tsx
│   │   ├── ImagePreview.tsx
│   │   └── MediaLibrary.tsx
│   └── ui/
│       ├── SaveButton.tsx
│       ├── CancelButton.tsx
│       ├── LoadingState.tsx
│       └── SuccessMessage.tsx
```

## Components and Interfaces

### Authentication Module
```typescript
interface AuthenticationModule {
  login(credentials: LoginCredentials): Promise<AuthResult>
  logout(): Promise<void>
  validateSession(): Promise<boolean>
  protectRoute(component: React.Component): React.Component
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthResult {
  success: boolean
  user?: AdminUser
  error?: string
}

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin'
  lastLogin: Date
}
```

### Content Editor Interface
```typescript
interface ContentEditor<T> {
  data: T
  isLoading: boolean
  isDirty: boolean
  errors: ValidationErrors
  save(): Promise<SaveResult>
  cancel(): void
  reset(): void
  validate(): ValidationResult
}

interface SaveResult {
  success: boolean
  data?: any
  error?: string
  timestamp: Date
}
```

### Modal Manager Interface
```typescript
interface ModalManager {
  modals: DynamicModal[]
  createModal(type: ModalType, data: ModalData): Promise<DynamicModal>
  updateModal(id: string, data: Partial<ModalData>): Promise<DynamicModal>
  deleteModal(id: string): Promise<boolean>
  getModal(id: string): DynamicModal | null
}

interface DynamicModal {
  id: string
  type: 'education' | 'skill' | 'project'
  title: string
  content: ModalContent
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ModalContent {
  [key: string]: any // Flexível para diferentes tipos de modal
}
```

### Image Upload System Interface
```typescript
interface ImageUploadSystem {
  upload(file: File, category: ImageCategory): Promise<UploadResult>
  replace(existingUrl: string, newFile: File): Promise<UploadResult>
  delete(url: string): Promise<boolean>
  getPreview(file: File): string
  validateFile(file: File): ValidationResult
}

interface UploadResult {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

type ImageCategory = 'profile' | 'project' | 'general'
```

## Data Models

### Portfolio Data Model (Estendido)
```typescript
interface ExtendedPortfolioConfig extends PortfolioConfig {
  id: string
  version: number
  lastModified: Date
  modifiedBy: string
  isPublished: boolean
  draftData?: Partial<PortfolioConfig>
}

interface ContentSection {
  id: string
  name: string
  data: any
  lastModified: Date
  isPublished: boolean
}
```

### Admin Settings Model
```typescript
interface AdminSettings {
  id: string
  autoSave: boolean
  autoSaveInterval: number // em segundos
  requirePreview: boolean
  backupRetention: number // em dias
  allowedImageFormats: string[]
  maxImageSize: number // em MB
  createdAt: Date
  updatedAt: Date
}
```

### Audit Log Model
```typescript
interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  section: string
  oldData?: any
  newData?: any
  timestamp: Date
  ipAddress: string
  userAgent: string
}

type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout'
```

### Database Schema (Prisma)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  auditLogs AuditLog[]
  @@map("users")
}

model PortfolioData {
  id           String   @id @default(cuid())
  version      Int      @default(1)
  data         Json
  isPublished  Boolean  @default(false)
  lastModified DateTime @default(now())
  modifiedBy   String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("portfolio_data")
}

model DynamicModal {
  id        String   @id @default(cuid())
  type      String
  title     String
  content   Json
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("dynamic_modals")
}

model MediaFile {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  url         String
  publicId    String?
  category    String
  size        Int
  mimeType    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("media_files")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  section   String
  oldData   Json?
  newData   Json?
  timestamp DateTime @default(now())
  ipAddress String
  userAgent String
  
  user User @relation(fields: [userId], references: [id])
  @@map("audit_logs")
}

model AdminSettings {
  id                  String   @id @default(cuid())
  autoSave           Boolean  @default(true)
  autoSaveInterval   Int      @default(30)
  requirePreview     Boolean  @default(false)
  backupRetention    Int      @default(30)
  allowedImageFormats String[] @default(["jpg", "jpeg", "png", "webp"])
  maxImageSize       Int      @default(5)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  @@map("admin_settings")
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Authentication properties (1.2, 1.3, 1.4, 1.5) can be grouped as they all test authentication system behavior
- Content validation properties (2.2, 4.3, 6.2, 8.2, 9.2, 10.2) share similar validation patterns
- Data persistence properties (2.3, 3.3, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 13.1, 13.2) can be consolidated into comprehensive persistence properties
- Image upload properties (2.5, 3.5, 11.1-11.5) can be grouped under image system behavior
- Modal management properties (4.2, 4.4, 5.2, 5.3, 5.4, 7.2, 7.3, 7.4) share similar modal operations
- UI feedback properties (2.4, 12.3, 12.4) can be consolidated into general UI feedback behavior

### Core Properties

**Property 1: Authentication System Integrity**
*For any* login attempt with valid credentials, the authentication system should grant access and create a secure session, while *for any* invalid credentials, access should be rejected with appropriate error messages
**Validates: Requirements 1.2, 1.3**

**Property 2: Route Protection Consistency**
*For any* unauthenticated access attempt to protected routes, the system should redirect to login page and preserve the intended destination
**Validates: Requirements 1.4, 1.5**

**Property 3: Content Validation Uniformity**
*For any* content modification across all sections (Home, About, Experience, Projects, Statistics, Testimonials, Contact), the system should validate required fields and data formats before allowing save operations
**Validates: Requirements 2.2, 4.3, 6.2, 8.2, 9.2, 10.2**

**Property 4: Data Persistence Atomicity**
*For any* content save operation, the persistence layer should store data immediately with atomic transactions, maintaining integrity and reflecting changes in real-time across dashboard and public portfolio views
**Validates: Requirements 2.3, 3.3, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 13.1, 13.2, 13.3, 13.4, 13.5**

**Property 5: Modal Management Consistency**
*For any* modal operation (create, edit, delete) across all modal types (Education, Skills, Projects), the modal manager should maintain data integrity, provide confirmation for destructive operations, and update all associated references
**Validates: Requirements 4.2, 4.4, 5.2, 5.3, 5.4, 7.2, 7.3, 7.4**

**Property 6: Image Upload System Reliability**
*For any* image upload operation, the system should validate file formats and sizes, provide preview functionality, update all references throughout the portfolio, and handle failures gracefully while preserving existing images
**Validates: Requirements 2.5, 3.5, 11.1, 11.2, 11.3, 11.4, 11.5**

**Property 7: UI Feedback Consistency**
*For any* user action (save, navigation, changes), the dashboard should provide immediate visual feedback, confirmation messages, and preserve unsaved changes during navigation
**Validates: Requirements 2.4, 12.2, 12.3, 12.4**

**Property 8: Responsive Design Adaptability**
*For any* device type (mobile, tablet, desktop), the dashboard interface should adapt appropriately, maintain session state across device switches, and ensure all functionality remains accessible
**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

**Property 9: Rich Text Editor Preservation**
*For any* rich text content modification (About section, Experience descriptions), the system should preserve formatting during save operations and provide consistent editing capabilities
**Validates: Requirements 3.2, 3.3, 6.3, 9.3**

**Property 10: Automatic Data Generation**
*For any* testimonial creation, the system should automatically generate client initials from names, and *for any* statistics modification, should maintain proper numeric formatting and data type consistency
**Validates: Requirements 9.2, 8.3**

## Error Handling

### Authentication Errors
- Invalid credentials: Clear error messages without revealing system details
- Session expiration: Automatic redirect with destination preservation
- Network failures: Retry mechanisms with user feedback
- Account lockout: Progressive delays and security notifications

### Content Validation Errors
- Required field validation: Inline error messages with field highlighting
- Data format validation: Real-time feedback with format examples
- File upload errors: Clear error descriptions with suggested solutions
- Network timeout: Auto-save recovery with conflict resolution

### Database Errors
- Connection failures: Graceful degradation with offline mode
- Transaction conflicts: Automatic retry with user notification
- Data corruption: Backup restoration with audit trail
- Storage limits: Proactive warnings with cleanup suggestions

### UI/UX Error Handling
- Component failures: Error boundaries with fallback interfaces
- Navigation errors: Breadcrumb recovery with state preservation
- Form submission errors: Field-level validation with progress indication
- Image processing errors: Fallback images with retry options

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing:**
- Specific examples that demonstrate correct behavior
- Integration points between components
- Edge cases and error conditions
- Authentication flows and session management
- File upload scenarios
- Database operations

**Property-Based Testing:**
- Universal properties that should hold across all inputs
- Authentication system integrity across various credential combinations
- Content validation consistency across all sections
- Data persistence atomicity for any content type
- Modal management operations for all modal types
- Image upload reliability for various file types and sizes
- UI feedback consistency across all user actions
- Responsive design adaptability across device types

**Property-Based Testing Configuration:**
- Library: **fast-check** for TypeScript/JavaScript property-based testing
- Minimum iterations: **100** per property test
- Each property-based test must include a comment with the format: `**Feature: admin-dashboard, Property {number}: {property_text}**`
- Each property test must reference the specific correctness property from this design document

**Testing Requirements:**
- Unit tests verify specific examples, edge cases, and error conditions
- Property tests verify universal properties across all valid inputs
- Both approaches are complementary and required for comprehensive coverage
- Property tests catch general correctness issues that unit tests might miss
- Unit tests provide concrete examples of expected behavior

### Test Organization
```
tests/
├── unit/
│   ├── auth/
│   ├── components/
│   ├── api/
│   └── utils/
├── integration/
│   ├── auth-flow.test.ts
│   ├── content-management.test.ts
│   └── image-upload.test.ts
└── property/
    ├── auth-properties.test.ts
    ├── content-properties.test.ts
    ├── modal-properties.test.ts
    ├── image-properties.test.ts
    └── ui-properties.test.ts
```

### Performance Testing
- Load testing for concurrent admin sessions
- Image upload performance with various file sizes
- Database query optimization validation
- Real-time update performance testing
- Mobile device performance benchmarks

### Security Testing
- Authentication bypass attempts
- SQL injection prevention
- XSS protection validation
- File upload security scanning
- Session hijacking prevention
- CSRF protection verification

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation support
- Color contrast validation
- Focus management testing
- ARIA label verification
- Mobile accessibility compliance

## Implementation Considerations

### Security Measures
- Password hashing with bcrypt
- JWT tokens for session management
- CSRF protection on all forms
- File upload validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection with content sanitization

### Performance Optimizations
- Image optimization and compression
- Lazy loading for large content sections
- Database query optimization with indexes
- Caching strategies for frequently accessed data
- Progressive loading for dashboard sections
- Debounced auto-save functionality

### Scalability Considerations
- Database connection pooling
- Image storage with CDN integration
- Horizontal scaling support
- Background job processing for heavy operations
- API rate limiting
- Monitoring and logging infrastructure

### Accessibility Features
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Focus management
- Alternative text for images

### Browser Compatibility
- Modern browser support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Progressive enhancement for older browsers
- Polyfills for missing features
- Responsive design for all screen sizes
- Touch-friendly interfaces for mobile devices