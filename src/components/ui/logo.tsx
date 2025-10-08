import Link from 'next/link';
import { Zap, TrendingUp } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}

export function Logo({
  className = '',
  showText = true,
  size = 'md',
  asLink = true,
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-gradient-to-br from-growth-500 to-primary font-bold text-white shadow-lg`}
        >
          <Zap className="h-4 w-4" />
        </div>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-success-500 p-0.5">
          <TrendingUp className="h-2 w-2 text-white" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} bg-gradient-to-r from-growth-600 to-primary bg-clip-text font-bold text-transparent`}
          >
            Zero Barriers
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Growth Accelerator
          </span>
        </div>
      )}
    </div>
  );

  return asLink ? <Link href="/">{logoContent}</Link> : logoContent;
}


