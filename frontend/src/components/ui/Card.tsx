import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-850/80 border border-slate-800 rounded-xl p-6 shadow-sm backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
