import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
