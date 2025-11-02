import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export default function AlertBanner({ type, title, children, onClose }: AlertProps) {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'text-green-800',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      title: 'text-yellow-800',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      title: 'text-red-800',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
      title: 'text-blue-800',
    },
  };

  const style = styles[type];

  return (
    <div className={`border rounded-lg p-4 ${style.container}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${style.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
