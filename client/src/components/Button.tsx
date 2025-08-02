import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg overflow-hidden group',
  {
    variants: {
      variant: {
        gradient: 'btn-gradient text-white hover:shadow-lg hover:shadow-purple-500/25',
        outline: 'glass-effect text-gray-300 hover:text-white hover:border-white/20',
        ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
        glow: 'glow-border glass-effect text-white hover:shadow-lg'
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg'
      }
    },
    defaultVariants: {
      variant: 'gradient',
      size: 'md'
    }
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant, 
  size, 
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`${buttonVariants({ variant, size })} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2 transition-transform group-hover:translate-x-[-2px]">
          {icon}
        </span>
      )}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="ml-2 transition-transform group-hover:translate-x-[2px]">
          {icon}
        </span>
      )}
    </button>
  )
}