import React from 'react';

const Alert = ({ message, type = 'info', onClose }) => {
  const getAlertConfig = (alertType) => {
    switch (alertType) {
      case 'success':
        return {
          className: 'alert alert-success',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          className: 'alert alert-warning',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      case 'error':
        return {
          className: 'alert alert-error',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          className: 'alert alert-info',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
    }
  };

  const config = getAlertConfig(type);

  return (
    <div 
      role="alert" 
      className={`${config.className} ${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-4 mb-4 flex items-center gap-3`}
    >
      <div className={config.iconColor}>
        {config.icon}
      </div>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.iconColor} hover:opacity-70 transition-opacity ml-2`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Quick use components
export const InfoAlert = ({ message, onClose }) => (
  <Alert message={message} type="info" onClose={onClose} />
);

export const SuccessAlert = ({ message, onClose }) => (
  <Alert message={message} type="success" onClose={onClose} />
);

export const WarningAlert = ({ message, onClose }) => (
  <Alert message={message} type="warning" onClose={onClose} />
);

export const ErrorAlert = ({ message, onClose }) => (
  <Alert message={message} type="error" onClose={onClose} />
);

// Usage examples
export const AlertExamples = () => {
  const [alerts, setAlerts] = React.useState([
    { id: 1, type: 'info', message: 'New update available', show: true },
    { id: 2, type: 'success', message: 'Purchase confirmed successfully!', show: true },
    { id: 3, type: 'warning', message: 'Warning: Invalid email address!', show: true },
    { id: 4, type: 'error', message: 'Error! Operation failed', show: true }
  ]);

  const hideAlert = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, show: false } : alert
    ));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Alert Examples</h2>
      
      {alerts.filter(alert => alert.show).map(alert => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => hideAlert(alert.id)}
        />
      ))}

      {/* Direct usage examples */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Direct Usage:</h3>
        
        <InfoAlert message="Important information for user" />
        <SuccessAlert message="Operation completed successfully" />
        <WarningAlert message="Please pay attention to this warning" />
        <ErrorAlert message="An error occurred that needs to be fixed" />
      </div>
    </div>
  );
};

export default Alert;