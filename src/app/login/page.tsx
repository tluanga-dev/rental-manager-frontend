import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rental Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive rental and inventory management system
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}