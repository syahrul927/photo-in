# Workspace System Architecture

## Overview
This document describes the comprehensive workspace system built into this photo management application. The system provides multi-tenancy support with workspace isolation, role-based access control (RBAC), and invitation-based user onboarding.

## Core Components

### 1. Workspace Schema (`src/server/db/schemas/workspace/index.ts`)
- **Model**: `Workspace`
- **Fields**:
  - `id`: UUID primary key
  - `name`: Workspace display name
  - `description`: Optional description
  - `icon`: Optional workspace icon/image
  - `ownerId`: Reference to the user who owns the workspace
  - `createdAt`, `updatedAt`: Timestamps
- **Relationships**: One workspace has many members, one workspace has one owner

### 2. Membership Schema (`src/server/db/schemas/membership/index.ts`)
- **Model**: `Membership`
- **Fields**:
  - `userId`: Reference to user
  - `workspaceId`: Reference to workspace
  - `role`: User role in workspace (owner, admin, member)
  - `keyWorkspace`: Unique identifier for workspace access (format: `userId-workspaceName`)
- **Constraints**: Composite primary key (`userId`, `workspaceId`), unique `keyWorkspace`

### 3. Invitation Schema (`src/server/db/schemas/invitation/index.ts`)
- **Model**: `Invitation`
- **Fields**:
  - `id`: UUID primary key
  - `email`: Invitee email address
  - `role`: Assigned role (member/admin)
  - `secretKey`: Verification key (6+ characters)
  - `workspaceId`: Target workspace
  - `invitedBy`: Who sent the invitation
  - `status`: pending/accepted/expired
  - `acceptedAt`: When accepted (nullable)

## Authentication Flow

### User Authentication (`src/server/auth/config.ts`)
- **Provider**: Credentials-based authentication
- **Strategy**: JWT-based sessions
- **Workflow**:
  1. User submits email/password via login form
  2. Auth provider queries user with memberships and workplaces
  3. Password validated using custom `comparePassword` function
  4. User object returned with workspace list
  5. JWT token contains workspace info for session management

### Session Management
- **JWT Strategy**: User workspaces embedded in token
- **Session Structure**: 
  ```typescript
  {
    user: {
      id: string,
      name: string,
      email: string,
      workspaces: Array<{
        workspaceId: string,
        keyWorkspace: string,
        name: string,
        role: Role,
        description?: string,
        icon?: string
      }>
    }
  }
  ```

## Workspace Context & State Management

### useWorkspace Hook (`src/hooks/use-workspace.ts`)
- **Purpose**: Manage active workspace state across the application
- **Storage**: LocalStorage with key `currentWorkspace`
- **Fallback**: First workspace in user list
- **Structure**: Provides `activeWorkspace` object with full details and role

### Workspace Utils (`src/lib/workspace-utils.ts`)
- **Constants**: `CURRENT_WORKSPACE` storage key
- **Functions**:
  - `keyWorkspaceBuilder(counterWorkspace, userId?)`: Generates unique workspace keys
  - `getWorkspaceHeader(headers)`: Extracts workspace from HTTP headers

## Invitation System (`src/features/auth/invitation-form/`)

### Workflow
1. **Admin sends invitation** through settings interface
2. **Invitation created** with email, role, secretKey, workspaceId
3. **Email sent** to invitee with special link (format: `/auth/invitation/{id}`)
4. **Invitation Link Validation**: Invitees click link to access invitation form
5. **Email Verification**: Validation step at `/auth/invitation/{id}`
6. **Registration**: Email + secret key validation, then complete profile setup
7. **Membership Creation**: User added to workspace with specified role

### Invitation Context (`src/hooks/use-invitation.tsx`)
- **State Management**: Centralized invitation data across registration flow
- **Schema**: Validates email, secretKey, name, invitationId, password
- **Provider**: Wraps invitation forms for shared state access

### Validation Process (`src/server/api/routers/register-member-router/`)
- **validateInvitationLink**: Verify invitation exists and isn't expired
- **validateInvitationEmailKey**: Match email address with secret key
- **registerInformationUser**: Create user account and add to workspace

## Role-Based Access Control (RBAC)

### Roles Hierarchy
- **owner**: Full workspace control, can delete workspace
- **admin**: Can manage users, edit settings, moderate content
- **member**: Basic access, can share photos within workspace

### Permission System
- **Location**: `src/config/permissions.ts`
- **Integration**: Used throughout components for UI and API access control
- **Validation**: Checked in both frontend components and API routes

## User Interface Integration

### Team Switcher (`src/components/sidebar/team-switcher.tsx`)
- **Purpose**: Workspace selection dropdown in sidebar
- **Behavior**: Displays available workspaces, updates active workspace on selection
- **Integration**: Uses useWorkspace hook for state management

### URL Structure
- **Dashboard**: `(dashboard)` route group for authenticated users
- **Public Routes**: Separate routing for public gallery/event views
- **Settings**: `/settings/{workspaceId}` for workspace-specific settings

## Data Flow Examples

### Login Flow
```
User Login → Auth Config → JWT with Workspaces → useWorkspace Hook → Active Workspace State
```

### Invitation Flow
```
Admin Invite → Invitation Created → Email Sent → User Clicks Link → 
Validation Form → Complete Registration → Membership Created → 
User Added to Workspace → Welcome to Dashboard
```

### Workspace Context
```
useWorkspace → localStorage → JWT session → API requests with workspace header
```

## Security Design
- **Tenant Isolation**: Workspace-based data filtering in all API routes
- **Role Validation**: Both frontend and backend permission checks
- **Invitation Security**: Expirable single-use invitation links with secret keys
- **Session Security**: JWT tokens with workspace scope embedded

## Future Considerations
- **Workspace Deletion**: Configurable cascade behavior for data
- **Workspace Transfer**: Owner role can be transferred between users
- **Team Templates**: Pre-configured workspace setups for different use cases
- **Workspace Scoping**: All API endpoints filtered by current workspace context