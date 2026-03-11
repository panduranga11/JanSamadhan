# JanSamadhan - Frontend Technical Architecture

Welcome to the frontend technical documentation for **JanSamadhan**, extracted for backend architecture design.

---

# 1. Project Overview

* **Purpose of application**: "JanSamadhan" is a grievance/complaint redressal system where citizens can register, report issues with location and images, and track their resolution. Officials/Admins can manage users, view complaints, and update their statuses.
* **Core features implemented**: 
  - User Authentication (Login / Registration)
  - User Profile Management
  - Complaint Submission Form (with category, location, and image upload mock)
  - User Dashboard / Complaint Tracking (Filtering by status, viewing timeline)
  - Public Community Discussion / Chat
  - Admin Dashboard (Statistics, Recent Activity)
  - Admin Complaint Management (View all, filter, approve/reject workflow)
  - Admin User Management (View all users, roles, statuses)
* **Tech stack used**:
  - **Framework**: React 19, Vite
  - **State management**: React Context API (`AuthContext`, `LanguageContext`), overriding local component state (`useState`, `useEffect`)
  - **Routing**: React Router v7 (`react-router-dom`)
  - **UI library**: Tailwind CSS v4, Framer Motion (for animations), Lucide React (for icons)
  - **Internationalization**: `react-i18next`
* **Folder structure of frontend**:
  - `src/assets/`: Static asset files (images, icons).
  - `src/components/`: Reusable UI components (e.g., `ChatWidget.jsx`, `StatusBadge.jsx`, `ComplaintCard.jsx`, `ProtectedRoute.jsx`).
  - `src/context/`: React Context providers (`AuthContext.jsx`, `LanguageContext.jsx`) managing global state like user sessions and localization.
  - `src/layouts/`: Structural wrapper components defining the layout for different route groups (`MainLayout.jsx` for users, `AdminLayout.jsx` for admins, `PublicLayout.jsx` for public pages).
  - `src/lib/`: Utility/helper functions directory.
  - `src/locales/` & `src/i18n.js`: Localization configurations and translation files.
  - `src/pages/`: Main page components that correspond to individual routes (`Home.jsx`, `Login.jsx`, `Register.jsx`, `Profile.jsx`, `RaiseComplaint.jsx`, `MyComplaints.jsx`, `Chat.jsx`, `ComplaintDetails.jsx`).
    - `src/pages/admin/`: Admin-specific page components (`AdminDashboard.jsx`, `ManageComplaints.jsx`, `Users.jsx`).
  - `src/routes/`: Route definitions connecting URLs to components (`AppRoutes.jsx`).
  - `src/services/`: API integration layer. Wraps `fetch` calls to backend endpoints (`api.js`, `authService.js`, `complaintService.js`, `userService.js`).

---

# 2. User Roles and Access Control

* **Role name**: `user`
  * **Permissions**: Access public pages, authenticate, manage own account profile, raise complaints, view own submitted complaints, view complaint details/timelines, participate in public community chat.
  * **Accessible routes**: `/`, `/login`, `/register`, `/profile`, `/raise-complaint`, `/my-complaints`, `/chat`, `/complaint/:id`
  * **Restricted routes**: `/admin`, `/admin/complaints`, `/admin/users`
  * **UI components conditionally rendered for this role**: In `ComplaintDetails.jsx`, users see the "Edit" complaint button.

* **Role name**: `admin`
  * **Permissions**: All `user` permissions, plus access to the admin dashboard, management of all user complaints across the system, updating complaint statuses, and managing system users.
  * **Accessible routes**: `/`, `/login`, `/register`, `/profile`, `/raise-complaint`, `/my-complaints`, `/chat`, `/complaint/:id`, `/admin`, `/admin/complaints`, `/admin/users`
  * **Restricted routes**: None within the application.
  * **UI components conditionally rendered for this role**: In `ComplaintDetails.jsx`, admins see the "Update Status" button instead of the user's "Edit" button. In `ChatWidget.jsx`, messages sent by admins conditionally render an "Official" badge next to their name. Admins also see the `AdminLayout` navigation wrapper on admin routes.

**Hierarchy Structure**:
- Public (Unauthenticated)
  └── User (Authenticated citizens)
      └── Admin (Authenticated officials with elevated privileges)

---

# 3. Routing Architecture

* **Route path**: `/`
  * **Component name**: `Home` (wrapped in `PublicLayout`)
  * **Is it protected?**: No
  * **Required role**: N/A
  * **API endpoint expected**: N/A
  * **Description of page functionality**: Landing page introducing the JanSamadhan platform.

* **Route path**: `/login`
  * **Component name**: `Login`
  * **Is it protected?**: No
  * **Required role**: N/A
  * **API endpoint expected**: `POST /api/auth/login`
  * **Description of page functionality**: User authentication form to log into the application.

* **Route path**: `/register`
  * **Component name**: `Register`
  * **Is it protected?**: No
  * **Required role**: N/A
  * **API endpoint expected**: `POST /api/auth/register`
  * **Description of page functionality**: Form for new users to create an account.

* **Route path**: `/profile`
  * **Component name**: `Profile` (wrapped in `MainLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'user', 'admin'
  * **API endpoint expected**: `GET /api/users/profile`, `PUT /api/users/profile`
  * **Description of page functionality**: Displays and allows editing of user account details.

* **Route path**: `/raise-complaint`
  * **Component name**: `RaiseComplaint` (wrapped in `MainLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'user', 'admin'
  * **API endpoint expected**: `POST /api/complaints`
  * **Description of page functionality**: Form for users to submit a new grievance with details, location, and optional images.

* **Route path**: `/my-complaints`
  * **Component name**: `MyComplaints` (wrapped in `MainLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'user', 'admin'
  * **API endpoint expected**: `GET /api/complaints`
  * **Description of page functionality**: List view of all complaints submitted by the authenticated user, complete with status filtering.

* **Route path**: `/chat`
  * **Component name**: `Chat` (wrapped in `MainLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'user', 'admin'
  * **API endpoint expected**: `GET /api/chat/messages`, `POST /api/chat/messages`
  * **Description of page functionality**: Public community discussion channel for citizens and officials to communicate.

* **Route path**: `/complaint/:id`
  * **Component name**: `ComplaintDetails` (wrapped in `MainLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'user', 'admin'
  * **API endpoint expected**: `GET /api/complaints/:id`, `PUT /api/complaints/:id/status`
  * **Description of page functionality**: Detailed view of a specific complaint, showing full description, images, location map, status timeline, and an activity/update log.

* **Route path**: `/admin`
  * **Component name**: `AdminDashboard` (wrapped in `AdminLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'admin'
  * **API endpoint expected**: `GET /api/admin/stats` (implied)
  * **Description of page functionality**: Top-level dashboard for officials showing system-wide statistics and recent activities.

* **Route path**: `/admin/complaints`
  * **Component name**: `ManageComplaints` (wrapped in `AdminLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'admin'
  * **API endpoint expected**: `GET /api/complaints` (all complaints for admins)
  * **Description of page functionality**: Data table view for admins to view, search, filter, and quick-approve/reject all submitted complaints.

* **Route path**: `/admin/users`
  * **Component name**: `Users` (UsersPage, wrapped in `AdminLayout`)
  * **Is it protected?**: Yes
  * **Required role**: 'admin'
  * **API endpoint expected**: `GET /api/users` (all users)
  * **Description of page functionality**: Data table view for admins to manage system users, their roles, and account statuses.

---

# 4. Authentication System (Frontend Side)

* **How login works**: User enters email and password on the `Login` page. Form submission calls `loginService` in `authService.js`. The service returns a user object and a JWT token. `AuthContext` receives this data, sets local component state (`user`), and stores it.
* **How registration works**: User enters `fullName`, `email`, and `password` on the `Register` page. Form submission calls `registerService`. Returns a user object and a token, which are stored identically to the login flow.
* **Token storage method**: Stored in `localStorage` under the key `'token'`. The user object is separately serialized and stored in `localStorage` underneath the key `'user'`.
* **Is JWT assumed?**: Yes. The `api.js` interceptor automatically reads `'token'` from `localStorage` and appends it to headers as `Authorization: Bearer ${token}` for every API request.
* **Is refresh token implemented?**: NOT IMPLEMENTED.
* **Is role stored in token?**: On the frontend UI, the role is read directly from the `user` JSON object stored in `localStorage` (e.g., `user.role`), which is initially returned by the login/register API. While it may also be encoded in the JWT on a backend, the frontend explicitly relies on the `user` object in storage for Routing and UI conditional checks.
* **Logout mechanism**: Calling `logout()` in `AuthContext` executes `logoutService()` (which calls `localStorage.removeItem('token')`). The `AuthContext` then sets the `user` state to `null`, and explicitly calls `localStorage.removeItem('user')` and `localStorage.removeItem('token')`.

---

# 5. Complaint Module

## Complaint Creation Form
* `title`: String | Required: Yes | Validation: Browser required | Dropdown: N/A | File uploads: N/A
* `category`: String | Required: Yes | Validation: Browser required | Dropdown: "Roads & Transport", "Electricity", "Water Supply", "Sanitation & Garbage", "Other" | File uploads: N/A
* `location`: String | Required: Yes | Validation: Browser required | Dropdown: N/A | File uploads: N/A
* `description`: String (Textarea) | Required: Yes | Validation: Browser required | Dropdown: N/A | File uploads: N/A
* `image`: File | Required: No (Optional) | Validation: MAX. 5MB (UI text) | Dropdown: N/A | File uploads: SVG, PNG, JPG

## Complaint Status Workflow (Frontend logic)
* **What statuses exist?**: "Pending", "In Progress", "Resolved", "Rejected"
* **Who can change status?**: Admin (Admins see "Update Status" button in `ComplaintDetails.jsx` and quick approve/reject actions in `ManageComplaints.jsx`).
* **Is status change tracked?**: Yes. `ComplaintDetails.jsx` renders an `Activity Log` (`updates` array) tracking actions like "Status Changed" or "Technician Assigned" including who performed it, time, and optional notes.
* **Any timeline UI?**: Yes. A vertical "Status Timeline" component exists on the complaint details page showing chronological progression (e.g., Submitted -> Assigned -> Resolved) with completion checkmarks.

## Complaint Views
* **User complaint view**: `MyComplaints.jsx` displays a grid of `ComplaintCard` components for the user's specific complaints. Detailed view (`ComplaintDetails.jsx`) shows full complaint breakdown, map placeholder, activity log, status timeline, and if resolved, a Star Rating UI for experience feedback.
* **Admin complaint view**: `ManageComplaints.jsx` displays a data table of all complaints globally, listing ID, Title, Date, Status Badge, and Action buttons (Approve, Reject, Options tooltip).
* **Filtering options**: 
  - In `MyComplaints.jsx`: Fully implemented frontend filtering dropdown by status ("All Status", "Pending", "In Progress", "Resolved").
  - In `ManageComplaints.jsx`: Filter button UI exists but logic is NOT IMPLEMENTED.
* **Search functionality**: Dashboard `ManageComplaints.jsx` contains a search input field, but the logic is NOT IMPLEMENTED.

---

# 6. Admin Module

* **Page name**: Admin Dashboard (`AdminDashboard.jsx`)
  * **Features available**: Top-level statistic cards, Mock Recent Activity feed, Quick Action buttons (Generate Report, Manage Roles).
  * **Filters**: None.
  * **Bulk actions**: None.
  * **Data expected from backend**: Summarized system statistics (Total Users, Total Complaints, count of Resolved, count of Pending), array of recent chronological events.

* **Page name**: Manage Complaints (`ManageComplaints.jsx`)
  * **Features available**: Tabular view of all system complaints, Status Badges, Quick action buttons (Approve/Resolve, Reject).
  * **Filters**: UI present for Search bar and Filter toggle (Logic NOT IMPLEMENTED).
  * **Bulk actions**: None.
  * **Data expected from backend**: Array of all complaint objects across all users.

* **Page name**: User Management (`Users.jsx`)
  * **Features available**: Tabular view of all system users displaying Avatar, Name, Email, Role (Admin/Citizen), and account Status (Active/Inactive), Options toggle.
  * **Filters**: None.
  * **Bulk actions**: None.
  * **Data expected from backend**: Array of all user objects containing base identity fields and access roles.

---

# 7. Chat System

* **Is it real-time?**: Chat has auto-scrolling to recent messages and simulated delay responses, but true real-time syncing over network is NOT IMPLEMENTED.
* **WebSocket used?**: NOT IMPLEMENTED.
* **Polling?**: NOT IMPLEMENTED.
* **Message structure**: 
  - `id`: Unique identifier (Timestamp/number)
  - `text`: String
  - `sender`: String (Display name)
  - `role`: String ('resident', 'official')
  - `time`: String (e.g. "10:30 AM")
  - `initials`: String (Generated from name)
  - `color`: String (Tailwind class string for UI)
  - `isMe`: Boolean (Determines if message bubbles align to the right side)
* **Moderation implemented?**: NOT IMPLEMENTED.
* **Public or complaint-specific?**: Public channel. Termed as "Community Discussion" with a sub-header "Public Channel" inside `ChatWidget.jsx`.

---

# 8. Notifications System

* **Toast only?**: NOT IMPLEMENTED. 
* **Real-time?**: NOT IMPLEMENTED.
* **Stored in UI state?**: NOT IMPLEMENTED.
* **Any unread counter?**: NOT IMPLEMENTED.

---

# 9. Expected Backend API Structure

* **Method**: `POST`
  * **Endpoint URL**: `/api/auth/login`
  * **Request body structure**: `{ "email": "string", "password": "string" }`
  * **Expected response structure**: `{ "user": { "id": "string", "name": "string", "email": "string", "role": "string" }, "token": "string" }`

* **Method**: `POST`
  * **Endpoint URL**: `/api/auth/register`
  * **Request body structure**: `{ "fullName": "string", "email": "string", "password": "string" }`
  * **Expected response structure**: `{ "user": { "id": "string", "name": "string", "email": "string", "role": "string" }, "token": "string" }`

* **Method**: `GET`
  * **Endpoint URL**: `/api/users/profile`
  * **Request body structure**: N/A
  * **Expected response structure**: `{ "name": "string", "email": "string", "phone": "string", "address": "string", "role": "string" }`

* **Method**: `PUT`
  * **Endpoint URL**: `/api/users/profile`
  * **Request body structure**: `{ "name": "string", "email": "string", "phone": "string", "address": "string" }`
  * **Expected response structure**: `{ "name": "string", "email": "string", "phone": "string", "address": "string", "role": "string" }`

* **Method**: `GET`
  * **Endpoint URL**: `/api/complaints`
  * **Request body structure**: N/A
  * **Expected response structure**: `[{ "id": "string", "title": "string", "status": "string", "date": "string", "description": "string" }]`

* **Method**: `POST`
  * **Endpoint URL**: `/api/complaints`
  * **Request body structure**: `multipart/form-data` containing: `title` (text), `category` (text), `description` (text), `location` (text), `image` (file)
  * **Expected response structure**: `{ "id": "string", "title": "string", "category": "string", "status": "string", "date": "string", "location": "string", "description": "string" }`

---

# 10. Data Models (Frontend Assumptions)

* **User model fields**:
  - `id`: UUID / String
  - `name` / `fullName`: String
  - `email`: String (Unique)
  - `phone`: String
  - `address`: String
  - `password`: String (Hashed on backend)
  - `role`: Enum ("user", "admin", "Citizen", "Official")
  - `status`: Enum ("Active", "Inactive")

* **Complaint model fields**:
  - `id`: UUID / String
  - `userId`: Reference to User model (implied owner)
  - `title`: String
  - `category`: String / Enum ("Roads", "Electricity", "Water", "Sanitation", "Other")
  - `description`: String
  - `location`: String (or Map Coordinates)
  - `images`: Array of Strings (URLs resolving to image uploads)
  - `status`: String / Enum ("Pending", "In Progress", "Resolved", "Rejected")
  - `department`: String (Derived/Associated from category)
  - `date` / `createdAt`: Date / ISO String
  - `admin`: Reference to User model (Admin assigned to the case)
  - `timeline`: Array of Objects (`{ status: String, date: String, completed: Boolean }`)
  - `updates` / `activityLog`: Array of Objects (`{ user: String, action: String, note: String, time: String }`)

* **Admin model fields**: 
  Identical base structure to the `User model`, distinguished strictly varying by the `role="admin"` field. Admin profiles might also imply associations to a `department` string.

* **Chat message model fields**:
  - `id`: UUID / String
  - `text`: String
  - `sender`: String (Author's display name)
  - `role`: String (Sender's role: 'resident' or 'official')
  - `time` / `createdAt`: Date / ISO String

---

# 11. State Management Architecture

* **Global state**: Utilized strictly for core application wide data (Authentication, Locale).
* **Context API**: Extensively used. `AuthContext` exposes `user`, `login(fn)`, `logout(fn)`, `register(fn)`, and `loading` states across the node tree. `LanguageContext` is used similarly for i18n functions.
* **Redux**: NOT IMPLEMENTED.
* **Local state only**: Heavily relied upon via `useState` and `useEffect`. Pages fetching data (`ManageComplaints.jsx`, `MyComplaints.jsx`, `ComplaintDetails.jsx`) manage their own loading spinners, data resolution arrays, data filters, and form inputs without pushing caching to a global store like Redux or React Query. Component-specific UI behaviors (like `ChatWidget` scrolling or input handling) are encapsulated within the component instance.
* **Data flow explanation**: React Components invoke service helper functions (e.g. `getComplaints()`) which wrap an underlying standard Web `fetch` API (`api.js`) requesting the backend API. The API service reads the authentication bearer token dynamically from `localStorage`. Responses are returned to the component, decoded, and stored in component-level React State to trigger UI re-renders.

---

# 12. Any Hardcoded Logic That Backend Must Handle

* **Hardcoded categories**: In `RaiseComplaint.jsx`, `<option>` dropdowns are hardcoded to "Roads & Transport", "Electricity", "Water Supply", "Sanitation & Garbage", and "Other". The Backend database should formalize these into an Enum table or type.
* **Hardcoded status types**: Fronted expects string exact matches: "Pending", "In Progress", "Resolved", "Rejected". Handled as hardcoded lower-case mappings within `StatusBadge.jsx`.
* **Hardcoded departments**: Frontend Mock objects currently map "Electricity Department" manually to complaints in `ComplaintDetails.jsx`. Backend must manage mapping the submitted categories to specific agency departments.
* **Static role assumptions**: Authorization relies on precise string matching of roles (`allowedRoles={['user', 'admin']}`) in `ProtectedRoute.jsx` and throughout API mock services. The backend must enforce these specific Role-Based Access Control literal values. 
* **Mock delay times**: The API wrapper `services/*.js` uses hardcoded `setTimeout` functions to simulate Network Latency. These must be replaced with true asynchronous Axios/Fetch backend responses.
* **Chat Initialization**: Base chat interface is bootstrapped with three static placeholder messages inside a Javascript Array (`ChatWidget.jsx`). The backend must hydrate the initial array of messages upon page load.
