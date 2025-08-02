import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  gradient?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  hover = false,
  glow = false,
  gradient = false
}) => {
  const baseClasses = 'glass-effect rounded-xl backdrop-blur-md'
  const hoverClasses = hover ? 'hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300' : ''
  const glowClasses = glow ? 'glow-border' : ''
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${glowClasses} ${className}`}>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}