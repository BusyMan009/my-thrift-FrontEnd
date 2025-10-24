// ConfirmationDialog.jsx - Centered confirmation dialog with Lucide icons
import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ConfirmationDialog = ({
  // Dialog state
  open = false,
  onClose,
  
  // Content
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  
  // Buttons
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  
  // Styling
  type = "warning", // "warning", "danger", "success", "info"
  confirmButtonStyle = "danger", // "danger", "primary", "success"
  
  // Loading state
  isLoading = false,
  
  // Additional options
  showIcon = true,
  size = "sm", // "xs", "sm", "md", "lg"
}) => {
  
  // Animation state
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  // Icon mapping based on type
  const iconMap = {
    warning: AlertTriangle,
    danger: AlertTriangle,
    success: CheckCircle,
    info: Info,
    error: X,
  };
  
  // Icon colors based on type
  const iconColorMap = {
    warning: "text-amber-400",
    danger: "text-red-400", 
    success: "text-green-400",
    info: "text-blue-400",
    error: "text-red-400",
  };
  
  // Icon background colors
  const iconBgMap = {
    warning: "bg-amber-500/10",
    danger: "bg-red-500/10",
    success: "bg-green-500/10", 
    info: "bg-blue-500/10",
    error: "bg-red-500/10",
  };
  
  // Confirm button styles
  const confirmButtonMap = {
    danger: "bg-red-600 hover:bg-red-500 focus:ring-red-600",
    primary: "bg-[#834d1a] hover:bg-[#6d3e15] focus:ring-[#834d1a]",
    success: "bg-green-600 hover:bg-green-500 focus:ring-green-600",
  };
  
  // Dialog sizes
  const sizeMap = {
    xs: "max-w-xs",
    sm: "max-w-sm", 
    md: "max-w-md",
    lg: "max-w-lg",
  };
  
  const IconComponent = iconMap[type];
  const iconColor = iconColorMap[type];
  const iconBg = iconBgMap[type];
  const confirmButtonClass = confirmButtonMap[confirmButtonStyle];
  const dialogSize = sizeMap[size];
  
  const handleConfirm = () => {
    if (onConfirm && !isLoading) {
      onConfirm();
    }
  };
  
  const handleClose = () => {
    if (!isLoading && onClose) {
      onClose();
    }
  };

  if (!isVisible && !open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${
      open ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop with blur effect */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-all duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        style={{backgroundColor: 'rgba(131, 77, 26, 0.7)'}}
        onClick={handleClose}
      />
      
      {/* Dialog Panel - Centered with smooth animation */}
      <div
        className={`relative bg-[#F8F5E9] rounded-lg shadow-xl w-full ${dialogSize} transition-all duration-300 ease-out ${
          open 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Content */}
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            {showIcon && IconComponent && (
              <div className={`mx-auto flex w-12 h-12 shrink-0 items-center justify-center rounded-full ${iconBg} sm:mx-0 sm:w-10 sm:h-10`}>
                <IconComponent aria-hidden="true" className={`w-6 h-6 ${iconColor}`} />
              </div>
            )}
            
            {/* Text Content */}
            <div className={`mt-3 text-center sm:mt-0 ${showIcon ? 'sm:ml-4' : ''} sm:text-left`}>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 bg-[rgba(131,77,26,0.05)]">
          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto transition-colors ${confirmButtonClass} ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
          
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto transition-colors ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 ring-gray-200' 
                : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-[#834d1a] focus:ring-offset-2'
            }`}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;