import { useMemo } from 'react'
import { 
  BarChart, 
  PieChart, 
  Timeline, 
  ProgressBar, 
  Alert, 
  TaskList,
  StatsCard
} from '../components/SmartComponents'

export interface SmartComponentMatch {
  type: string
  startIndex: number
  endIndex: number
  content: string
  component: React.ReactNode
}

export const useSmartComponents = (markdown: string) => {
  const smartComponents = useMemo(() => {
    const components: SmartComponentMatch[] = []
    let componentKey = 0
    
    // Parse chart blocks
    const chartRegex = /```chart\n([\s\S]*?)```/g
    let match
    
    while ((match = chartRegex.exec(markdown)) !== null) {
      const chartContent = match[1].trim()
      const lines = chartContent.split('\n')
      const type = lines[0]?.toLowerCase()
      
      if (type === 'bar' || type === 'line' || type === 'pie' || type === 'donut') {
        const data: any = { labels: [], datasets: [{ data: [] }] }
        
        lines.slice(1).forEach(line => {
          const [label, value] = line.split(':').map(s => s.trim())
          if (label && value) {
            data.labels.push(label)
            data.datasets[0].data.push(parseFloat(value))
          }
        })
        
        const component = type === 'bar' || type === 'line' 
          ? <BarChart key={`chart-${componentKey++}`} data={data} />
          : <PieChart key={`chart-${componentKey++}`} data={data} />
        
        components.push({
          type: 'chart',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          content: match[0],
          component
        })
      }
    }
    
    // Parse timeline blocks
    const timelineRegex = /```timeline\n([\s\S]*?)```/g
    
    while ((match = timelineRegex.exec(markdown)) !== null) {
      const items = match[1].trim().split('\n').filter(line => line.trim())
      
      components.push({
        type: 'timeline',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        content: match[0],
        component: <Timeline key={`timeline-${componentKey++}`} items={items} />
      })
    }
    
    // Parse progress bars
    const progressRegex = /\[progress:(\d+)(?::(.+?))?\]/g
    
    while ((match = progressRegex.exec(markdown)) !== null) {
      const value = parseInt(match[1])
      const label = match[2]
      
      components.push({
        type: 'progress',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        content: match[0],
        component: <ProgressBar key={`progress-${componentKey++}`} value={value} label={label} />
      })
    }
    
    // Parse task lists
    const taskRegex = /```tasks?\n([\s\S]*?)```/g
    
    while ((match = taskRegex.exec(markdown)) !== null) {
      const tasks = match[1].trim().split('\n').filter(line => line.trim())
      
      components.push({
        type: 'tasks',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        content: match[0],
        component: <TaskList key={`tasks-${componentKey++}`} tasks={tasks} />
      })
    }
    
    // Parse alert/callout blocks
    const alertRegex = /:::(info|warning|error|success|tip)\n([\s\S]*?):::/g
    
    while ((match = alertRegex.exec(markdown)) !== null) {
      const type = match[1]
      const content = match[2].trim()
      
      components.push({
        type: 'alert',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        content: match[0],
        component: (
          <Alert key={`alert-${componentKey++}`} type={type}>
            {content}
          </Alert>
        )
      })
    }
    
    // Parse stats blocks
    const statsRegex = /```stats?\n([\s\S]*?)```/g
    
    while ((match = statsRegex.exec(markdown)) !== null) {
      const lines = match[1].trim().split('\n')
      const stats = lines.map(line => {
        const parts = line.split('|').map(p => p.trim())
        return {
          title: parts[0] || '',
          value: parts[1] || '',
          change: parts[2],
          icon: parts[3]
        }
      })
      
      components.push({
        type: 'stats',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        content: match[0],
        component: (
          <div key={`stats-${componentKey++}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
            {stats.map((stat, i) => (
              <StatsCard key={i} {...stat} />
            ))}
          </div>
        )
      })
    }
    
    // Sort by start index
    components.sort((a, b) => a.startIndex - b.startIndex)
    
    return components
  }, [markdown])
  
  // Transform markdown to include React components
  const transformMarkdown = (md: string): string => {
    let transformedMd = md
    const placeholders: { [key: string]: React.ReactNode } = {}
    
    // Replace smart component syntax with placeholders
    smartComponents.forEach((comp, index) => {
      const placeholder = `<!--SMART_COMPONENT_${index}-->`
      placeholders[placeholder] = comp.component
      transformedMd = transformedMd.replace(comp.content, placeholder)
    })
    
    return transformedMd
  }
  
  // Get enhanced markdown with placeholders
  const enhancedMarkdown = useMemo(() => transformMarkdown(markdown), [markdown, smartComponents])
  
  // Get component map for rendering
  const componentMap = useMemo(() => {
    const map: { [key: string]: React.ReactNode } = {}
    smartComponents.forEach((comp, index) => {
      map[`<!--SMART_COMPONENT_${index}-->`] = comp.component
    })
    return map
  }, [smartComponents])
  
  return {
    smartComponents,
    enhancedMarkdown,
    componentMap,
    hasSmartComponents: smartComponents.length > 0
  }
}