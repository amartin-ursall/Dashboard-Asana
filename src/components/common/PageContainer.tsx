import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  className,
  maxWidth = '7xl'
}: PageContainerProps) {
  return (
    <div className={cn(
      maxWidthClasses[maxWidth],
      'mx-auto px-4 sm:px-6 lg:px-8',
      className
    )}>
      <div className="py-8 md:py-10 lg:py-12">
        {children}
      </div>
    </div>
  );
}
