import { forwardRef, type ComponentPropsWithoutRef } from 'react';

const SmoothScroll = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`smooth-scroll-stack ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  ),
);

SmoothScroll.displayName = 'SmoothScroll';

export default SmoothScroll;
