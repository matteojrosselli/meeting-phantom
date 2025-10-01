/**
 * T061: Loading States & Optimistic Updates
 *
 * Reusable loading components for better UX during async operations.
 */

import React from 'react';

/**
 * Spinner component for inline loading states
 */
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} text-blue-600`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Full-page loading overlay
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

/**
 * Card skeleton for loading state
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
};

/**
 * List skeleton for loading multiple items
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Button with loading state
 */
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}> = ({ loading, children, onClick, disabled, variant = 'primary', className = '' }) => {
  const baseClasses =
    'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Content wrapper with loading state
 */
export const LoadingWrapper: React.FC<{
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}> = ({ loading, error, children, skeleton }) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <>{skeleton || <PageLoader />}</>;
  }

  return <>{children}</>;
};

/**
 * Optimistic update wrapper
 */
export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = React.useState<T>(initialData);
  const [optimisticData, setOptimisticData] = React.useState<T | null>(null);

  const updateOptimistically = React.useCallback(
    async (
      optimisticValue: T,
      updateFn: () => Promise<T>
    ): Promise<{ success: boolean; data?: T }> => {
      // Set optimistic value immediately
      setOptimisticData(optimisticValue);

      try {
        // Perform actual update
        const result = await updateFn();

        // Update with real data
        setData(result);
        setOptimisticData(null);

        return { success: true, data: result };
      } catch (error) {
        // Revert to previous data on error
        setOptimisticData(null);
        console.error('Optimistic update failed:', error);

        return { success: false };
      }
    },
    []
  );

  return {
    data: optimisticData || data,
    isOptimistic: optimisticData !== null,
    updateOptimistically,
    setData,
  };
}

/**
 * Toast notification for optimistic updates
 */
export const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColors[type]} border rounded-lg shadow-lg p-4 max-w-sm flex items-start z-50`}
    >
      <p className={`${textColors[type]} flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`ml-3 ${textColors[type]} hover:opacity-70`}
      >
        ✕
      </button>
    </div>
  );
};
