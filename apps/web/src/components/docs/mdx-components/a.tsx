import { Link } from '@/navigation'
import { cn } from '@/lib/utils'

export const a = ({
  className,
  href,
  ...props
}: React.HTMLAttributes<HTMLAnchorElement>) => {
  // Check if it's an internal link
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'))
  
  if (isInternalLink) {
    return (
      <Link
        href={href}
        className={cn('font-medium underline underline-offset-4', className)}
        {...props}
      />
    )
  }
  
  // External links use regular anchor tag
  return (
    <a
      href={href}
      className={cn('font-medium underline underline-offset-4', className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  )
}
