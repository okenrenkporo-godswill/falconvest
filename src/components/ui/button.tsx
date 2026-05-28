import React, { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import Link from "next/link";

interface ButtonProps<T extends ElementType = "button"> {
  as?: T;
  href?: string;
  className?: string;
  children: ReactNode;
  // Allow any additional props for the rendered element
  [key: string]: any;
}

export const Button = <T extends ElementType = "button">({
  as,
  href,
  className = "",
  children,
  ...rest
}: ButtonProps<T>) => {
  const Component = as || (href ? Link : "button");
  // If using Next.js Link, we need to pass href directly to Link component
  if (Component === Link && href) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  // For other components (including native button), spread props
  return (
    <Component href={href} className={className} {...rest}>
      {children}
    </Component>
  );
};
