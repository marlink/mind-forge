# Frontend Component Documentation

## Overview

This document describes the reusable UI components available in the MindForge frontend application.

## Component Library

### Button

A versatile button component with multiple variants and sizes.

**Location**: `client/app/components/Button.tsx`

**Props**:
- `variant`: `'primary' | 'secondary' | 'danger' | 'outline'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `isLoading`: `boolean` - Shows loading spinner
- `disabled`: `boolean`
- Standard HTML button props

**Usage**:
```tsx
import { Button } from '../components/Button';

<Button variant="primary" size="md">Click Me</Button>
<Button variant="outline" isLoading={loading}>Loading...</Button>
```

### Card

A container component for grouping related content.

**Location**: `client/app/components/Card.tsx`

**Props**:
- `title`: `string` - Card title
- `headerActions`: `React.ReactNode` - Actions in header
- `className`: `string` - Additional CSS classes
- `onClick`: `() => void` - Optional click handler
- `children`: `React.ReactNode`

**Usage**:
```tsx
import { Card } from '../components/Card';

<Card title="My Card" headerActions={<Button>Action</Button>}>
  Content here
</Card>
```

### Form Components

#### Input

Text input field with label, error, and helper text support.

**Location**: `client/app/components/Form.tsx`

**Props**:
- `label`: `string` - Input label
- `error`: `string` - Error message
- `helperText`: `string` - Helper text below input
- Standard HTML input props

**Usage**:
```tsx
import { Input } from '../components/Form';

<Input
  label="Email"
  type="email"
  name="email"
  required
  error={errors.email}
  helperText="Enter your email address"
/>
```

#### Textarea

Multi-line text input with label and error support.

**Props**: Same as Input (except `type`)

**Usage**:
```tsx
import { Textarea } from '../components/Form';

<Textarea
  label="Description"
  name="description"
  rows={5}
  required
/>
```

#### Select

Dropdown select with options.

**Props**:
- `options`: `Array<{ value: string; label: string }>`
- Same label/error props as Input

**Usage**:
```tsx
import { Select } from '../components/Form';

<Select
  label="Status"
  name="status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
/>
```

#### Checkbox

Checkbox input with label.

**Props**:
- `label`: `string`
- `error`: `string`
- Standard HTML checkbox props

### Loading Components

**Location**: `client/app/components/Loading.tsx`

#### LoadingSpinner

Circular loading spinner.

**Usage**:
```tsx
import { LoadingSpinner } from '../components/Loading';

<LoadingSpinner />
```

#### LoadingSkeleton

Skeleton loader for content placeholders.

**Props**:
- `lines`: `number` - Number of skeleton lines

**Usage**:
```tsx
import { LoadingSkeleton } from '../components/Loading';

<LoadingSkeleton lines={3} />
```

#### PageLoading

Full-page loading component.

**Usage**:
```tsx
import { PageLoading } from '../components/Loading';

<PageLoading />
```

### Error Components

**Location**: `client/app/components/Error.tsx`

#### ErrorMessage

Displays error messages with optional retry action.

**Props**:
- `message`: `string` - Error message
- `title`: `string` - Optional error title
- `onRetry`: `() => void` - Optional retry callback
- `showHomeLink`: `boolean` - Show link to home

**Usage**:
```tsx
import { ErrorMessage } from '../components/Error';

<ErrorMessage
  title="Failed to load"
  message="Something went wrong"
  onRetry={handleRetry}
/>
```

#### EmptyState

Displays empty state with optional action.

**Props**:
- `title`: `string`
- `message`: `string`
- `action`: `React.ReactNode` - Optional action button

**Usage**:
```tsx
import { EmptyState } from '../components/Error';

<EmptyState
  title="No items"
  message="Get started by creating your first item"
  action={<Button>Create Item</Button>}
/>
```

### Modal

Full-featured modal/dialog component.

**Location**: `client/app/components/Modal.tsx`

**Props**:
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string` - Optional title
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `closeOnOverlayClick`: `boolean` (default: `true`)
- `footer`: `React.ReactNode` - Optional footer content
- `children`: `React.ReactNode`

**Usage**:
```tsx
import { Modal } from '../components/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure?</p>
</Modal>
```

### Toast

Toast notification system with context provider.

**Location**: `client/app/components/Toast.tsx`

**Setup**: Wrap app with `ToastProvider` (already done in `layout.tsx`)

**Usage**:
```tsx
import { useToast } from '../components/Toast';

const { showToast } = useToast();

showToast('Success!', 'success');
showToast('Error occurred', 'error');
showToast('Info message', 'info');
showToast('Warning', 'warning');
```

**Types**: `'success' | 'error' | 'info' | 'warning'`

### Table

Data table component with optional sorting.

**Location**: `client/app/components/Table.tsx`

**Props**:
- `data`: `T[]` - Array of data items
- `columns`: `Column<T>[]` - Column definitions
- `keyExtractor`: `(item: T, index: number) => string` - Unique key function
- `emptyMessage`: `string` - Message when no data
- `onRowClick`: `(item: T) => void` - Optional row click handler
- `striped`: `boolean` - Alternating row colors
- `hover`: `boolean` - Hover effect

**Column Definition**:
```typescript
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}
```

**Usage**:
```tsx
import { Table } from '../components/Table';

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <span className={`badge ${item.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
        {item.status}
      </span>
    )
  }
];

<Table
  data={users}
  columns={columns}
  keyExtractor={(item) => item.id}
  onRowClick={(item) => handleRowClick(item)}
/>
```

### Navigation

A reusable navigation header component for consistent page navigation.

**Location**: `client/app/components/Navigation.tsx`

**Props**:
- `user`: `{ id: string; name: string; email: string; role?: string } | null` - Current user object (optional)
- `showBackButton`: `boolean` - Show back button (default: `false`)
- `backHref`: `string` - URL for back button
- `backLabel`: `string` - Label for back button (default: `'Back'`)

**Features**:
- User authentication state handling
- Logout functionality
- Back button navigation
- Dashboard link
- Login/Register links for unauthenticated users

**Usage**:
```tsx
import { Navigation } from '../components/Navigation';

<Navigation
  user={user}
  showBackButton={true}
  backHref="/dashboard"
  backLabel="Back to Dashboard"
/>
```

### Calendar

A calendar component for displaying sessions in a month view.

**Location**: `client/app/components/Calendar.tsx`

**Props**:
- `sessions`: `Session[]` - Array of session objects
- `bootcampId`: `string` - ID of the bootcamp
- `onDateClick`: `(date: Date) => void` - Optional callback when a date is clicked
- `className`: `string` - Additional CSS classes

**Session Interface**:
```typescript
interface Session {
  id: string;
  day: number;
  theme: string;
  date: string;
  startTime: string;
  endTime: string;
  activities?: Array<{
    id: string;
    time: string;
    title: string;
    type: string;
  }>;
}
```

**Features**:
- Month navigation (previous/next/today)
- Visual indicators for dates with sessions
- Highlights today's date
- Shows session count per day
- Clickable dates to navigate to session details
- Legend for visual indicators

**Usage**:
```tsx
import { Calendar } from '../components/Calendar';

<Calendar
  sessions={sessions}
  bootcampId={bootcampId}
  onDateClick={(date) => {
    // Handle date click
    console.log('Clicked date:', date);
  }}
/>
```

### ProgressChart

Progress visualization components.

**Location**: `client/app/components/ProgressChart.tsx`

#### ProgressChart

Displays progress bars for skills with level-based colors.

**Props**:
- `progress`: `Array<{ skill: string; level: string; assessmentDate: string }>`

**Usage**:
```tsx
import { ProgressChart } from '../components/ProgressChart';

<ProgressChart progress={progressData} />
```

#### SkillDistribution

Shows distribution of skills across levels.

**Props**:
- `progress`: `Array<{ skill: string; level: string }>`

**Usage**:
```tsx
import { SkillDistribution } from '../components/ProgressChart';

<SkillDistribution progress={progressData} />
```

## Dashboard Components

### StudentDashboard

Student-specific dashboard with progress tracking.

**Location**: `client/app/components/dashboards/StudentDashboard.tsx`

**Props**:
- `userId`: `string`
- `studentId`: `string` (optional)
- `enrollments`: `Enrollment[]` (optional)

**Features**:
- Active/completed bootcamp stats
- Progress visualization
- Recent progress records
- Communication links

### ParentDashboard

Parent dashboard for monitoring children's progress.

**Location**: `client/app/components/dashboards/ParentDashboard.tsx`

**Props**:
- `userId`: `string`
- `children`: `Child[]` (optional)

**Features**:
- Children overview
- Enrollment tracking
- Communication hub

### FacilitatorDashboard

Facilitator dashboard for managing bootcamps and sessions.

**Location**: `client/app/components/dashboards/FacilitatorDashboard.tsx`

**Props**:
- `userId`: `string`

**Features**:
- Bootcamp management
- Upcoming sessions
- Quick stats
- Session management links

### AdminDashboard

Admin dashboard for system management.

**Location**: `client/app/components/dashboards/AdminDashboard.tsx`

**Props**:
- `userId`: `string`

**Features**:
- System statistics
- Quick actions
- Management interface

## Page Components

### Session Detail Page

**Location**: `client/app/bootcamps/[id]/sessions/[sessionId]/page.tsx`

**Route**: `/bootcamps/:bootcampId/sessions/:sessionId`

**Features**:
- Session information display
- Activities timeline
- Attendance summary (facilitators/admins)
- Activity details

### Communications Page

**Location**: `client/app/communications/page.tsx`

**Route**: `/communications`

**Features**:
- List all communications
- Filter by status (all/unread/sent)
- View communication details
- Compose new messages
- Mark as read functionality

### Discussions Page

**Location**: `client/app/bootcamps/[id]/discussions/page.tsx`

**Route**: `/bootcamps/:bootcampId/discussions`

**Features**:
- List discussion topics for a bootcamp
- Filter by day
- Create/edit/delete discussion topics (facilitators/admins)
- View discussion details (prompt, guidance, expected outcomes, tags)
- Role-based access control

### Knowledge Streams Page

**Location**: `client/app/knowledge-streams/page.tsx`

**Route**: `/knowledge-streams`

**Features**:
- List all knowledge streams
- View stream details and levels
- Assign streams to students (facilitators/admins)
- View assigned streams (students)
- Role-based views

### Progress Tracking Page

**Location**: `client/app/progress/page.tsx`

**Route**: `/progress`

**Features**:
- View student progress records
- Filter by skill and bootcamp
- Create progress records (facilitators/admins)
- Progress visualization charts
- Student selection (facilitators/admins)
- Role-based access (students see their own progress)

## Utilities

### useForm Hook

A powerful form management hook with built-in validation.

**Location**: `client/app/lib/useForm.ts`

**Usage**:
```tsx
import { useForm, validators } from '../lib/useForm';
import { Input } from '../components/Form';

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm<FormData>({
    initialValues: { email: '', password: '' },
    validationRules: {
      email: [validators.required(), validators.email()],
      password: [validators.required(), validators.minLength(6)],
    },
    onSubmit: async (values) => {
      // Handle form submission
      await login(values);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email ? errors.email : undefined}
      />
      <Input
        name="password"
        label="Password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password ? errors.password : undefined}
      />
      <Button type="submit" disabled={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

**Available Validators**:
- `validators.required(message?)` - Field is required
- `validators.email(message?)` - Valid email format
- `validators.minLength(min, message?)` - Minimum string length
- `validators.maxLength(max, message?)` - Maximum string length
- `validators.min(min, message?)` - Minimum number value
- `validators.max(max, message?)` - Maximum number value
- `validators.pattern(regex, message)` - Regex pattern match
- `validators.match(fieldName, message?)` - Match another field value

### API Client

A utility for making consistent API requests with automatic authentication.

**Location**: `client/app/lib/api.ts`

**Usage**:
```tsx
import { api, ApiClientError } from '../lib/api';

// GET request
const { data } = await api.get('/api/bootcamps', {
  params: { status: 'PUBLISHED', page: 1 },
});

// POST request
try {
  const { data } = await api.post('/api/bootcamps', {
    title: 'New Bootcamp',
    description: '...',
  });
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(error.message);
    if (error.errors) {
      // Handle validation errors
    }
  }
}

// PUT request
await api.put(`/api/bootcamps/${id}`, { title: 'Updated' });

// DELETE request
await api.delete(`/api/bootcamps/${id}`);
```

**Auth Helpers**:
```tsx
import { auth } from '../lib/api';

// Check if user is authenticated
if (auth.isAuthenticated()) {
  // User is logged in
}

// Get token
const token = auth.getToken();

// Set token (usually done after login)
auth.setToken(token);

// Remove token (logout)
auth.removeToken();
```

## Styling

All components use Tailwind CSS for styling. The design system follows:

- **Primary Color**: Blue (`primary-600`, `primary-500`, etc.)
- **Success**: Green
- **Error**: Red
- **Warning**: Yellow
- **Info**: Blue

Components are responsive and follow mobile-first design principles.

## Best Practices

1. **Always use TypeScript types** - All components are fully typed
2. **Handle loading states** - Use Loading components during async operations
3. **Show error states** - Use ErrorMessage for errors, EmptyState for empty data
4. **Consistent spacing** - Use Tailwind spacing utilities
5. **Accessibility** - Components include ARIA labels and keyboard navigation where applicable

