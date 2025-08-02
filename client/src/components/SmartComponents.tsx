import React from 'react'
import {
  ChartBarIcon,
  ChartPieIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

// Parse chart data from markdown
export const parseChartData = (content: string): { type: string; data: any } | null => {
  const chartMatch = content.match(/```chart\n([\s\S]*?)```/);
  if (!chartMatch) return null;
  
  try {
    const lines = chartMatch[1].trim().split('\n');
    const type = lines[0].toLowerCase();
    const data: any = { labels: [], datasets: [] };
    
    if (type === 'bar' || type === 'line') {
      // Parse bar/line chart data
      // Format: Label: Value
      const values: number[] = [];
      lines.slice(1).forEach(line => {
        const [label, value] = line.split(':').map(s => s.trim());
        if (label && value) {
          data.labels.push(label);
          values.push(parseFloat(value));
        }
      });
      data.datasets.push({ data: values });
    } else if (type === 'pie' || type === 'donut') {
      // Parse pie/donut chart data
      lines.slice(1).forEach(line => {
        const [label, value] = line.split(':').map(s => s.trim());
        if (label && value) {
          data.labels.push(label);
          if (!data.datasets[0]) data.datasets[0] = { data: [] };
          data.datasets[0].data.push(parseFloat(value));
        }
      });
    }
    
    return { type, data };
  } catch {
    return null;
  }
}

// Bar Chart Component
export const BarChart: React.FC<{ data: any }> = ({ data }) => {
  const maxValue = Math.max(...(data.datasets[0]?.data || [0]));
  
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">Bar Chart</h3>
      </div>
      <div className="space-y-3">
        {data.labels.map((label: string, i: number) => {
          const value = data.datasets[0]?.data[i] || 0;
          const percentage = (value / maxValue) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 font-medium">{label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Pie Chart Component
export const PieChart: React.FC<{ data: any }> = ({ data }) => {
  const total = data.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 1;
  const colors = [
    'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <ChartPieIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Pie Chart</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative w-48 h-48 mx-auto">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.datasets[0]?.data.map((value: number, i: number) => {
              const percentage = (value / total) * 100;
              const offset = data.datasets[0].data
                .slice(0, i)
                .reduce((a: number, b: number) => a + (b / total) * 100, 0);
              
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={`hsl(${i * 45}, 70%, 50%)`}
                  strokeWidth="20"
                  strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                  strokeDashoffset={-offset * 2.51}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.labels.map((label: string, i: number) => {
            const value = data.datasets[0]?.data[i] || 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                <span className="text-sm text-gray-700">{label}</span>
                <span className="text-sm font-semibold text-gray-900 ml-auto">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Timeline Component
export const Timeline: React.FC<{ items: string[] }> = ({ items }) => {
  const parseTimelineItem = (item: string) => {
    const match = item.match(/^(\d{4}(?:-\d{2})?(?:-\d{2})?)\s*:\s*(.+)$/);
    if (match) {
      return { date: match[1], text: match[2] };
    }
    return { date: '', text: item };
  };
  
  const parsedItems = items.map(parseTimelineItem);
  
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
      <div className="flex items-center gap-2 mb-6">
        <ClockIcon className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-emerald-400" />
        <div className="space-y-6">
          {parsedItems.map((item, i) => (
            <div key={i} className="relative flex items-start gap-4">
              <div className="w-8 h-8 bg-white border-2 border-green-400 rounded-full flex items-center justify-center z-10">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="flex-1 -mt-1">
                {item.date && (
                  <div className="text-xs font-semibold text-green-600 mb-1">
                    {item.date}
                  </div>
                )}
                <div className="text-gray-700">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
export const ProgressBar: React.FC<{ value: number; label?: string }> = ({ value, label }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className="my-4">
      {label && <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>}
      <div className="relative bg-gray-200 rounded-full h-8 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
          style={{ width: `${clampedValue}%` }}
        >
          <span className="text-xs font-bold text-white">{clampedValue}%</span>
        </div>
      </div>
    </div>
  );
}

// Alert/Callout Component
export const Alert: React.FC<{ type: string; children: React.ReactNode }> = ({ type, children }) => {
  const configs = {
    info: {
      icon: <InformationCircleIcon className="w-5 h-5" />,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClass: 'text-blue-500'
    },
    warning: {
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClass: 'text-yellow-500'
    },
    error: {
      icon: <XCircleIcon className="w-5 h-5" />,
      className: 'bg-red-50 border-red-200 text-red-800',
      iconClass: 'text-red-500'
    },
    success: {
      icon: <CheckCircleIcon className="w-5 h-5" />,
      className: 'bg-green-50 border-green-200 text-green-800',
      iconClass: 'text-green-500'
    },
    tip: {
      icon: <LightBulbIcon className="w-5 h-5" />,
      className: 'bg-purple-50 border-purple-200 text-purple-800',
      iconClass: 'text-purple-500'
    }
  };
  
  const config = configs[type as keyof typeof configs] || configs.info;
  
  return (
    <div className={`my-4 p-4 border rounded-lg flex items-start gap-3 ${config.className}`}>
      <div className={config.iconClass}>{config.icon}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// Stats Card Component
export const StatsCard: React.FC<{ title: string; value: string; change?: string; icon?: string }> = ({ 
  title, 
  value, 
  change,
  icon 
}) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    users: <UserGroupIcon className="w-8 h-8" />,
    fire: <FireIcon className="w-8 h-8" />,
    trophy: <TrophyIcon className="w-8 h-8" />,
    sparkles: <SparklesIcon className="w-8 h-8" />,
    globe: <GlobeAltIcon className="w-8 h-8" />,
    location: <MapPinIcon className="w-8 h-8" />,
    calendar: <CalendarIcon className="w-8 h-8" />
  };
  
  const isPositive = change && change.startsWith('+');
  const isNegative = change && change.startsWith('-');
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 font-medium ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-purple-500 opacity-20">
            {iconMap[icon] || iconMap.sparkles}
          </div>
        )}
      </div>
    </div>
  );
}

// Task List Component
export const TaskList: React.FC<{ tasks: string[] }> = ({ tasks }) => {
  const parsedTasks = tasks.map(task => {
    const completed = task.startsWith('[x]') || task.startsWith('[X]');
    const text = task.replace(/^\[[xX\s]\]\s*/, '');
    return { completed, text };
  });
  
  const completedCount = parsedTasks.filter(t => t.completed).length;
  const percentage = Math.round((completedCount / parsedTasks.length) * 100);
  
  return (
    <div className="my-6 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Tasks</h3>
        <div className="text-sm text-gray-600">
          {completedCount}/{parsedTasks.length} ({percentage}%)
        </div>
      </div>
      <div className="mb-3">
        <ProgressBar value={percentage} />
      </div>
      <div className="space-y-2">
        {parsedTasks.map((task, i) => (
          <div key={i} className="flex items-center gap-3">
            {task.completed ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
            )}
            <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Parse and render smart components from markdown
export const parseSmartComponents = (content: string): React.ReactNode[] => {
  const components: React.ReactNode[] = [];
  let key = 0;
  
  // Parse charts
  const chartRegex = /```chart\n([\s\S]*?)```/g;
  let match;
  while ((match = chartRegex.exec(content)) !== null) {
    const chartData = parseChartData(match[0]);
    if (chartData) {
      if (chartData.type === 'bar' || chartData.type === 'line') {
        components.push(<BarChart key={`chart-${key++}`} data={chartData.data} />);
      } else if (chartData.type === 'pie' || chartData.type === 'donut') {
        components.push(<PieChart key={`chart-${key++}`} data={chartData.data} />);
      }
    }
  }
  
  // Parse timelines
  const timelineRegex = /```timeline\n([\s\S]*?)```/g;
  while ((match = timelineRegex.exec(content)) !== null) {
    const items = match[1].trim().split('\n').filter(line => line.trim());
    components.push(<Timeline key={`timeline-${key++}`} items={items} />);
  }
  
  // Parse progress bars
  const progressRegex = /\[progress:(\d+)(?::(.+?))?\]/g;
  while ((match = progressRegex.exec(content)) !== null) {
    const value = parseInt(match[1]);
    const label = match[2];
    components.push(<ProgressBar key={`progress-${key++}`} value={value} label={label} />);
  }
  
  // Parse task lists
  const taskListRegex = /```tasks?\n([\s\S]*?)```/g;
  while ((match = taskListRegex.exec(content)) !== null) {
    const tasks = match[1].trim().split('\n').filter(line => line.trim());
    components.push(<TaskList key={`tasks-${key++}`} tasks={tasks} />);
  }
  
  // Parse stats cards
  const statsRegex = /```stats?\n([\s\S]*?)```/g;
  while ((match = statsRegex.exec(content)) !== null) {
    const lines = match[1].trim().split('\n');
    const stats = lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        title: parts[0] || '',
        value: parts[1] || '',
        change: parts[2],
        icon: parts[3]
      };
    });
    
    components.push(
      <div key={`stats-${key++}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>
    );
  }
  
  return components;
}