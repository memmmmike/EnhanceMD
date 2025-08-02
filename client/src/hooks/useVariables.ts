import { useState, useMemo, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface Variable {
  name: string
  value: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'list'
  description?: string
}

export interface Template {
  id: string
  name: string
  description?: string
  content: string
  variables: Variable[]
  category?: string
}

// Built-in templates
export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'proposal',
    name: 'Business Proposal',
    category: 'Business',
    description: 'Professional business proposal template',
    content: `# {{companyName}} Business Proposal

## Executive Summary

We are pleased to present this proposal for {{projectName}} to {{clientName}}.

### Project Overview
- **Start Date**: {{startDate}}
- **Duration**: {{duration}} months
- **Budget**: ${{budget}}

### Team Members
{{#teamMembers}}
- {{name}} - {{role}}
{{/teamMembers}}

### Key Deliverables
1. {{deliverable1}}
2. {{deliverable2}}
3. {{deliverable3}}

---

*Prepared by {{authorName}} on {{date}}*`,
    variables: [
      { name: 'companyName', value: 'Your Company', type: 'text' },
      { name: 'projectName', value: 'New Project', type: 'text' },
      { name: 'clientName', value: 'Client Name', type: 'text' },
      { name: 'startDate', value: new Date().toISOString().split('T')[0], type: 'date' },
      { name: 'duration', value: '3', type: 'number' },
      { name: 'budget', value: '50000', type: 'number' },
      { name: 'teamMembers', value: JSON.stringify([
        { name: 'John Doe', role: 'Project Manager' },
        { name: 'Jane Smith', role: 'Lead Developer' }
      ]), type: 'list' },
      { name: 'deliverable1', value: 'Initial Design', type: 'text' },
      { name: 'deliverable2', value: 'Development', type: 'text' },
      { name: 'deliverable3', value: 'Testing & Deployment', type: 'text' },
      { name: 'authorName', value: 'Your Name', type: 'text' },
      { name: 'date', value: new Date().toLocaleDateString(), type: 'text' }
    ]
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    category: 'Business',
    description: 'Structured meeting notes template',
    content: `# Meeting Notes: {{meetingTitle}}

**Date**: {{date}}  
**Time**: {{time}}  
**Location**: {{location}}

## Attendees
{{#attendees}}
- {{name}} ({{department}})
{{/attendees}}

## Agenda
{{#agendaItems}}
1. {{item}}
{{/agendaItems}}

## Discussion Points
{{discussionNotes}}

## Action Items
{{#actionItems}}
- [ ] {{task}} - **Assigned to**: {{assignee}} - **Due**: {{dueDate}}
{{/actionItems}}

## Next Meeting
{{nextMeetingDate}} at {{nextMeetingTime}}

---
*Notes taken by {{notesTaker}}*`,
    variables: [
      { name: 'meetingTitle', value: 'Weekly Team Sync', type: 'text' },
      { name: 'date', value: new Date().toLocaleDateString(), type: 'date' },
      { name: 'time', value: '10:00 AM', type: 'text' },
      { name: 'location', value: 'Conference Room A', type: 'text' },
      { name: 'attendees', value: JSON.stringify([
        { name: 'Alice Johnson', department: 'Engineering' },
        { name: 'Bob Smith', department: 'Product' }
      ]), type: 'list' },
      { name: 'agendaItems', value: JSON.stringify([
        { item: 'Project Status Update' },
        { item: 'Budget Review' },
        { item: 'Q&A' }
      ]), type: 'list' },
      { name: 'discussionNotes', value: 'Key discussion points here...', type: 'text' },
      { name: 'actionItems', value: JSON.stringify([
        { task: 'Update project timeline', assignee: 'Alice', dueDate: 'Next Friday' }
      ]), type: 'list' },
      { name: 'nextMeetingDate', value: 'Next Monday', type: 'text' },
      { name: 'nextMeetingTime', value: '10:00 AM', type: 'text' },
      { name: 'notesTaker', value: 'Your Name', type: 'text' }
    ]
  },
  {
    id: 'report',
    name: 'Monthly Report',
    category: 'Reports',
    description: 'Monthly performance report template',
    content: `# {{reportType}} Report - {{month}} {{year}}

## Executive Summary

This report covers the period from {{startPeriod}} to {{endPeriod}}.

### Key Metrics

\`\`\`stats
Revenue|${{revenue}}|{{revenueChange}}%|trophy
Users|{{userCount}}|{{userChange}}%|users
Growth|{{growthRate}}%|{{growthChange}}%|fire
\`\`\`

### Performance Overview

[progress:{{completionRate}}:Overall Completion]

## Detailed Analysis

{{#sections}}
### {{title}}
{{content}}

**Status**: {{status}}  
**Progress**: {{progress}}%

{{/sections}}

## Recommendations

{{#recommendations}}
1. {{item}}
{{/recommendations}}

## Conclusion

{{conclusion}}

---

*Report prepared by {{preparedBy}}*  
*Date: {{reportDate}}*`,
    variables: [
      { name: 'reportType', value: 'Monthly Performance', type: 'text' },
      { name: 'month', value: new Date().toLocaleString('default', { month: 'long' }), type: 'text' },
      { name: 'year', value: new Date().getFullYear().toString(), type: 'text' },
      { name: 'startPeriod', value: 'Start Date', type: 'date' },
      { name: 'endPeriod', value: 'End Date', type: 'date' },
      { name: 'revenue', value: '125000', type: 'number' },
      { name: 'revenueChange', value: '+15', type: 'text' },
      { name: 'userCount', value: '5200', type: 'number' },
      { name: 'userChange', value: '+8', type: 'text' },
      { name: 'growthRate', value: '23', type: 'number' },
      { name: 'growthChange', value: '+5', type: 'text' },
      { name: 'completionRate', value: '85', type: 'number' },
      { name: 'sections', value: JSON.stringify([
        { title: 'Sales Performance', content: 'Sales exceeded targets...', status: 'On Track', progress: 92 }
      ]), type: 'list' },
      { name: 'recommendations', value: JSON.stringify([
        { item: 'Increase marketing budget' },
        { item: 'Expand team size' }
      ]), type: 'list' },
      { name: 'conclusion', value: 'Overall performance exceeded expectations...', type: 'text' },
      { name: 'preparedBy', value: 'Your Name', type: 'text' },
      { name: 'reportDate', value: new Date().toLocaleDateString(), type: 'date' }
    ]
  }
]

export const useVariables = () => {
  const [variables, setVariables] = useState<Variable[]>([])
  const [templates, setTemplates] = useState<Template[]>(() => {
    // Load saved templates from localStorage
    const saved = localStorage.getItem('enhancemd-templates')
    if (saved) {
      try {
        const userTemplates = JSON.parse(saved)
        return [...DEFAULT_TEMPLATES, ...userTemplates]
      } catch {
        return DEFAULT_TEMPLATES
      }
    }
    return DEFAULT_TEMPLATES
  })
  
  // Process markdown with variables
  const processTemplate = useCallback((content: string, vars: Variable[]): string => {
    let processed = content
    
    // Simple variable replacement
    vars.forEach(variable => {
      const regex = new RegExp(`{{${variable.name}}}`, 'g')
      processed = processed.replace(regex, variable.value)
    })
    
    // Handle list/array variables with Mustache-like syntax
    vars.filter(v => v.type === 'list').forEach(variable => {
      try {
        const listData = JSON.parse(variable.value)
        if (Array.isArray(listData)) {
          // Find all list blocks for this variable
          const listRegex = new RegExp(`{{#${variable.name}}}([\\s\\S]*?){{/${variable.name}}}`, 'g')
          processed = processed.replace(listRegex, (match, template) => {
            return listData.map(item => {
              let itemProcessed = template
              Object.keys(item).forEach(key => {
                const itemRegex = new RegExp(`{{${key}}}`, 'g')
                itemProcessed = itemProcessed.replace(itemRegex, item[key])
              })
              return itemProcessed.trim()
            }).join('\n')
          })
        }
      } catch (e) {
        console.error('Error processing list variable:', variable.name, e)
      }
    })
    
    // Handle conditional blocks (if variable exists and is truthy)
    vars.forEach(variable => {
      const ifRegex = new RegExp(`{{#if ${variable.name}}}([\\s\\S]*?){{/if}}`, 'g')
      processed = processed.replace(ifRegex, (match, content) => {
        if (variable.value && variable.value !== 'false' && variable.value !== '0') {
          return content
        }
        return ''
      })
    })
    
    // Handle inverse conditional blocks (if variable doesn't exist or is falsy)
    vars.forEach(variable => {
      const unlessRegex = new RegExp(`{{#unless ${variable.name}}}([\\s\\S]*?){{/unless}}`, 'g')
      processed = processed.replace(unlessRegex, (match, content) => {
        if (!variable.value || variable.value === 'false' || variable.value === '0') {
          return content
        }
        return ''
      })
    })
    
    // Process computed variables (basic expressions)
    const computedRegex = /{{=\s*(.+?)\s*}}/g
    processed = processed.replace(computedRegex, (match, expression) => {
      try {
        // Create a safe evaluation context with variable values
        const context: any = {}
        vars.forEach(v => {
          if (v.type === 'number') {
            context[v.name] = parseFloat(v.value)
          } else if (v.type === 'boolean') {
            context[v.name] = v.value === 'true'
          } else {
            context[v.name] = v.value
          }
        })
        
        // Simple safe evaluation (only basic math and string operations)
        const safeExpression = expression
          .replace(/[^a-zA-Z0-9_+\-*/\s().]/g, '') // Remove unsafe characters
        
        // Use Function constructor for safe evaluation
        const func = new Function(...Object.keys(context), `return ${safeExpression}`)
        const result = func(...Object.values(context))
        
        return String(result)
      } catch (e) {
        console.error('Error evaluating expression:', expression, e)
        return match
      }
    })
    
    return processed
  }, [])
  
  // Add a new variable
  const addVariable = useCallback((variable: Variable) => {
    setVariables(prev => [...prev, variable])
    toast.success(`Variable "${variable.name}" added`)
  }, [])
  
  // Update a variable
  const updateVariable = useCallback((name: string, value: string) => {
    setVariables(prev => prev.map(v => 
      v.name === name ? { ...v, value } : v
    ))
  }, [])
  
  // Remove a variable
  const removeVariable = useCallback((name: string) => {
    setVariables(prev => prev.filter(v => v.name !== name))
    toast.success(`Variable "${name}" removed`)
  }, [])
  
  // Save a template
  const saveTemplate = useCallback((template: Template) => {
    const newTemplate = { ...template, id: `user-${Date.now()}` }
    setTemplates(prev => {
      const updated = [...prev, newTemplate]
      // Save user templates to localStorage
      const userTemplates = updated.filter(t => t.id.startsWith('user-'))
      localStorage.setItem('enhancemd-templates', JSON.stringify(userTemplates))
      return updated
    })
    toast.success(`Template "${template.name}" saved`)
  }, [])
  
  // Delete a template
  const deleteTemplate = useCallback((id: string) => {
    if (!id.startsWith('user-')) {
      toast.error('Cannot delete built-in templates')
      return
    }
    
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      // Update localStorage
      const userTemplates = updated.filter(t => t.id.startsWith('user-'))
      localStorage.setItem('enhancemd-templates', JSON.stringify(userTemplates))
      return updated
    })
    toast.success('Template deleted')
  }, [])
  
  // Load a template
  const loadTemplate = useCallback((templateId: string): { content: string, variables: Variable[] } | null => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return null
    
    setVariables(template.variables)
    return {
      content: processTemplate(template.content, template.variables),
      variables: template.variables
    }
  }, [templates, processTemplate])
  
  // Get processed content with current variables
  const getProcessedContent = useCallback((content: string): string => {
    return processTemplate(content, variables)
  }, [variables, processTemplate])
  
  return {
    variables,
    templates,
    addVariable,
    updateVariable,
    removeVariable,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
    processTemplate,
    getProcessedContent,
    setVariables
  }
}