import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 px-5 py-2 text-white/80">
      <div className="flex space-x-1" aria-hidden>
        <div className="h-2 w-2 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="h-2 w-2 rounded-full bg-cyan-200 animate-bounce" style={{ animationDelay: '120ms' }}></div>
        <div className="h-2 w-2 rounded-full bg-cyan-100 animate-bounce" style={{ animationDelay: '240ms' }}></div>
      </div>
      <span className="text-xs tracking-wide uppercase">Pensando...</span>
    </div>
  );
};
