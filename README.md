# Rental Frontend

A modern Next.js frontend application for the rental management system, built with TypeScript, Tailwind CSS, and a comprehensive tech stack.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Zustand** - State management
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Axios** - HTTP client for API calls

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   └── layouts/           # Layout components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── types/                 # TypeScript type definitions
└── api/                   # API service functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update the API URL in `.env.local` if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Key Features

### State Management with Zustand

- Lightweight and intuitive state management
- Persistent authentication state
- TypeScript support out of the box

### API Integration with TanStack Query

- Automatic caching and background refetching
- Optimistic updates for mutations
- Loading and error states handling
- DevTools for debugging

### Form Handling

- React Hook Form for performance and flexibility
- Zod schemas for validation
- Integration with shadcn/ui form components
- Type-safe form data

### UI Components

- shadcn/ui for consistent and accessible components
- Tailwind CSS for styling
- Dark mode support (configured in shadcn)
- Responsive design

## Development Guidelines

### API Calls

Use the custom hooks in `src/hooks/use-api.ts`:

```typescript
// Query data
const { data, isLoading, error } = useApiQuery(['users'], '/users');

// Mutate data
const mutation = useApiMutation('/users', 'POST', {
  onSuccess: () => {
    // Handle success
  },
  invalidateQueries: [['users']]
});
```

### State Management

Access Zustand stores with proper TypeScript support:

```typescript
const { user, login, logout } = useAuthStore();
```

### Form Validation

Create Zod schemas in `src/lib/validations.ts` and use with React Hook Form:

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {...}
});
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Integration with Backend

This frontend is designed to work with the FastAPI backend located in `../rental-backend-fastapi/`. Make sure the backend server is running on the configured API URL for full functionality.

## Future Enhancements

- Authentication and authorization
- Role-based access control
- Real-time updates with WebSockets
- Advanced filtering and search
- Reporting and analytics dashboards
- Mobile responsive design improvements
