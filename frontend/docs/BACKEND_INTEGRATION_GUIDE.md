# Amplivo Frontend - Backend Integration Guide

This document outlines the architecture, service layer, state management, and the steps required to connect the React/Next.js frontend to the upcoming Python FastAPI backend.

## 1. Architecture Overview

The frontend is built with:
*   **Next.js 16 (App Router)** for routing and rendering.
*   **React 19** for UI components.
*   **Tailwind CSS** for styling.
*   **Zustand** for global state management.
*   **Axios** for HTTP requests (configured with interceptors for JWT auth).
*   **React Hook Form & Zod** for form validation.

The frontend is strictly separated into UI components and a **Service Layer**. 
Currently, the service layer returns mock data. When the backend is ready, you will ONLY need to update the service files—the UI components will remain unchanged.

## 2. Directory Structure for Integration

*   `src/services/` - Contains all API calls. This is the primary folder you will work in.
*   `src/store/` - Zustand stores (`authStore.ts`, `uiStore.ts`).
*   `src/data/` - Contains mock JSON data (`erp.ts`). **This folder should be deleted once the backend is fully integrated.**
*   `src/components/auth/` - Contains `ProtectedRoute.tsx` which relies on the `authStore`.

## 3. The API Client (`src/services/api.ts`)

We have created a centralized Axios instance that handles:
1.  Base URL configuration via environment variables.
2.  Automatic attachment of the JWT `Authorization: Bearer <token>` header to all requests.
3.  Response interception to handle `401 Unauthorized` errors (automatically logs the user out).

### Environment Variables Required
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 4. Authentication Flow

1.  User submits login form (`src/app/login/page.tsx`).
2.  Form calls `login()` from `src/store/authStore.ts`.
3.  `authStore` calls `authService.login(email, password)`.
4.  **Backend Expectation:** The backend should return a JSON response containing:
    *   `token` (string, JWT)
    *   `user` (object: `{ id, name, email, role, avatar }`)
5.  `authStore` saves the token and user to `localStorage` (via Zustand persist middleware) and updates the state.
6.  The `ProtectedRoute` component checks this state and allows access.

## 5. Integrating Specific Modules

Below is the guide for replacing the mock services with real API calls. 
Search for `TODO: API INTEGRATION` in the codebase to find these exact spots.

### A. Authentication (`src/services/authService.ts`)
*   Remove the `setTimeout` mock block.
*   Uncomment the `api.post('/auth/login', credentials)` code.
*   Ensure your FastAPI backend has a POST `/auth/login` endpoint.

### B. Leads Module (`src/services/leadService.ts`)
*   Currently, this returns mock data.
*   Implement `api.get('/leads')` for fetching all leads.
*   Implement `api.post('/leads', data)` for creating a lead.
*   Implement `api.put('/leads/:id', data)` for updating status.

### C. Campaign Module (`src/services/campaignService.ts`)
*   Implement `api.get('/campaigns')` for the analytics dashboard.
*   Implement `api.get('/campaigns/:id')` for specific campaign details.

### D. ERP Data Replacement (`src/data/erp.ts`)
Currently, many Admin and Portal pages directly import mock arrays from `src/data/erp.ts`. 

**Steps for full integration:**
1.  Create corresponding service files (e.g., `clientService.ts`, `projectService.ts`, `invoiceService.ts`).
2.  In the page components (e.g., `src/app/admin/crm/page.tsx`), replace the static import:
    ```javascript
    // Remove this:
    import { leads, clients } from '@/data/erp';
    
    // Add this:
    import { useEffect, useState } from 'react';
    import { leadService } from '@/services/leadService';
    
    // Inside component:
    const [leads, setLeads] = useState([]);
    useEffect(() => {
      leadService.getAll().then(setLeads);
    }, []);
    ```

## 6. Required Backend Endpoints (Checklist)

For the frontend to be 100% functional without mock data, the FastAPI backend must implement the following REST endpoints:

### Auth
*   [ ] `POST /auth/login`
*   [ ] `POST /auth/register` (optional, if admins create users)
*   [ ] `GET /auth/me` (validate token and get user profile)

### CRM & Leads
*   [ ] `GET /leads`
*   [ ] `POST /leads`
*   [ ] `PUT /leads/:id`

### Clients (Portal & Admin)
*   [ ] `GET /clients`
*   [ ] `GET /clients/:id`

### Campaigns & Analytics
*   [ ] `GET /analytics/overview` (MRR, Traffic, Conversions)
*   [ ] `GET /campaigns`

### Projects & SEO
*   [ ] `GET /projects`
*   [ ] `GET /seo/rankings`

### Finance
*   [ ] `GET /invoices`
*   [ ] `GET /invoices/:id/download`

### Team & Roles
*   [ ] `GET /users`
*   [ ] `GET /roles`

## 7. Next Steps for Backend Team
1.  Review the Types defined in the frontend (`src/store/` and services) to ensure the FastAPI Pydantic models match the expected JSON structure.
2.  Implement JWT authentication on the backend.
3.  Replace the mock API calls in `src/services/` one by one.
4.  Remove `src/data/erp.ts` once all endpoints are connected.
