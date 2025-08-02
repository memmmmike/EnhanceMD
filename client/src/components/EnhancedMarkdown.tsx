import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Alert } from './SmartComponents'

interface EnhancedMarkdownProps {
  content: string
  componentMap: { [key: string]: React.ReactNode }
}

export const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({ content, componentMap }) => {
  // Custom component for rendering HTML comments (our placeholders)
  const components: any = {
    // Handle images
    img: ({ node, ...props }: any) => {
      return <img {...props} className="max-w-full h-auto mx-auto my-4 rounded-lg shadow-lg" />
    },
    
    // Handle center tags
    center: ({ children }: any) => (
      <div className="text-center">{children}</div>
    ),
    
    // Handle small tags
    small: ({ node, ...props }: any) => (
      <small className="text-sm text-gray-600" {...props} />
    ),
    
    // Handle paragraph with potential smart components
    p: ({ children, ...props }: any) => {
      // Check if this paragraph contains a smart component placeholder
      if (typeof children === 'string' && children.startsWith('<!--SMART_COMPONENT_')) {
        const component = componentMap[children]
        if (component) {
          return <>{component}</>
        }
      }
      
      // Check for array of children
      if (Array.isArray(children)) {
        const hasPlaceholder = children.some(
          child => typeof child === 'string' && child.startsWith('<!--SMART_COMPONENT_')
        )
        
        if (hasPlaceholder) {
          return (
            <>
              {children.map((child, i) => {
                if (typeof child === 'string' && child.startsWith('<!--SMART_COMPONENT_')) {
                  return <React.Fragment key={i}>{componentMap[child]}</React.Fragment>
                }
                return child
              })}
            </>
          )
        }
      }
      
      return <p {...props}>{children}</p>
    },
    
    // Handle code blocks - check for smart component syntax
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      
      // Check if this is an inline placeholder
      if (inline && typeof children === 'string' && children.startsWith('<!--SMART_COMPONENT_')) {
        const component = componentMap[children]
        if (component) {
          return <>{component}</>
        }
      }
      
      // Regular code block
      if (!inline && language) {
        return (
          <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        )
      }
      
      // Inline code
      return (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      )
    },
    
    // Handle blockquotes that might be alerts
    blockquote: ({ children, ...props }: any) => {
      // Check if this is an alert syntax
      const text = typeof children === 'string' ? children : 
        Array.isArray(children) && children[0]?.props?.children ? 
        children[0].props.children : ''
      
      if (typeof text === 'string') {
        const alertMatch = text.match(/^\[!(INFO|WARNING|ERROR|SUCCESS|TIP)\]\s*(.*)/s)
        if (alertMatch) {
          const type = alertMatch[1].toLowerCase()
          const content = alertMatch[2]
          return <Alert type={type}>{content}</Alert>
        }
      }
      
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600" {...props}>
          {children}
        </blockquote>
      )
    }
  }
  
  
  return (
    <div className="enhanced-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        urlTransform={(url) => url}
        components={components}
      >
        {content}
      </ReactMarkdown>
      
      {/* Render any smart components that weren't embedded */}
      {Object.entries(componentMap).map(([key, component]) => {
        if (content.includes(key)) {
          return <React.Fragment key={key}>{component}</React.Fragment>
        }
        return null
      })}
    </div>
  )
}