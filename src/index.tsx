import React, { useState, useEffect, useRef } from 'react';

interface ConsoleProps {
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  process: string;
  message: string;
}

const generateLogs = (): LogEntry[] => {
  const processes = ['kernel', 'systemd', 'NetworkManager', 'zos-shell', 'audio-driver', 'usb-handler'];
  const messages = {
    info: ['Service started', 'Connection established', 'Config loaded', 'Cache cleared', 'Sync complete'],
    warning: ['High memory usage', 'Slow response time', 'Deprecated API call', 'Rate limit approaching'],
    error: ['Connection failed', 'Permission denied', 'File not found', 'Timeout exceeded'],
    debug: ['Entering function', 'Variable state', 'Loop iteration', 'Return value'],
  };

  return Array.from({ length: 50 }, (_, i) => {
    const level = (['info', 'info', 'info', 'warning', 'error', 'debug'] as const)[Math.floor(Math.random() * 6)];
    return {
      id: String(i),
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      level,
      process: processes[Math.floor(Math.random() * processes.length)],
      message: messages[level][Math.floor(Math.random() * messages[level].length)],
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const Console: React.FC<ConsoleProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'debug'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paused, setPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(generateLogs());
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const processes = ['kernel', 'systemd', 'zos-shell'];
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: Math.random() > 0.9 ? 'error' : Math.random() > 0.8 ? 'warning' : 'info',
        process: processes[Math.floor(Math.random() * processes.length)],
        message: 'New event logged',
      };
      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.process.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'debug': return 'text-gray-400';
    }
  };

  const getLevelBg = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'bg-blue-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'error': return 'bg-red-500/20';
      case 'debug': return 'bg-gray-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-white font-mono text-sm">
      <div className="p-3 border-b border-white/10 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-white/10 rounded text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="flex gap-1">
          {(['all', 'info', 'warning', 'error', 'debug'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-xs uppercase transition-colors
                ${filter === f ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}
              `}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPaused(!paused)}
          className={`px-3 py-1 rounded text-xs transition-colors
            ${paused ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}
          `}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>

        <button
          onClick={() => setLogs([])}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className={`flex items-start gap-3 px-3 py-1.5 border-b border-white/5 hover:bg-white/5 ${getLevelBg(log.level)}`}
          >
            <span className="text-white/40 shrink-0">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className={`uppercase text-xs px-1.5 py-0.5 rounded shrink-0 ${getLevelColor(log.level)}`}>
              {log.level}
            </span>
            <span className="text-purple-400 shrink-0">[{log.process}]</span>
            <span className="text-white/80">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <div className="px-3 py-2 border-t border-white/10 text-xs text-white/50">
        {filteredLogs.length} entries • {paused ? 'Paused' : 'Live'}
      </div>
    </div>
  );
};

export default Console;
