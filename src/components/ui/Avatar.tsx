import React from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  firstName: string
  lastName: string
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ firstName, lastName, avatarUrl, size = 'md', className }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover ring-2 ring-white dark:ring-slate-800', sizes[size], className)}
      />
    )
  }

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-orange-500', 'bg-red-500', 'bg-teal-500',
  ]
  const color = colors[(firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length]

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-slate-800',
      sizes[size], color, className
    )}>
      {getInitials(firstName, lastName)}
    </div>
  )
}
