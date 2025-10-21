"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * SafeLink ensures that navigation always uses Next.js client-side routing
 * and provides debugging information for navigation issues
 */
export const SafeLink = ({ href, children, className, onClick }: SafeLinkProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default browser navigation
    e.preventDefault();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }
    
    // Use Next.js router for client-side navigation
    router.push(href);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default SafeLink;
