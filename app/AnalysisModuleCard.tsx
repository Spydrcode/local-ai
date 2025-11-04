
"use client";

export default function AnalysisModuleCard({ module, status, error, onRunAction, data }: {
  module: any;
  status: string;
  error?: string;
  onRunAction: () => void;
  data?: any;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'running': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '⏳';
      case 'error': return '❌';
      default: return '▶️';
    }
  };

  const formatAnalysisData = (moduleId: string, data: any) => {
    if (!data) return null;

    // Special handling for 30-day social calendar
    if (module.id.includes('social-calendar') && data.calendar && Array.isArray(data.calendar)) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-300 border border-slate-700 rounded-xl">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="px-2 py-2">Day</th>
                <th className="px-2 py-2">Platform</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Content</th>
                <th className="px-2 py-2">Hashtags</th>
                <th className="px-2 py-2">Time</th>
                <th className="px-2 py-2">Copy</th>
              </tr>
            </thead>
            <tbody>
              {data.calendar.map((item: any, idx: number) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-800/40'}>
                  <td className="px-2 py-2 font-semibold text-emerald-400">{item.day}</td>
                  <td className="px-2 py-2">
                    {item.platform === 'Facebook' && <span title="Facebook">📘</span>}
                    {item.platform === 'Instagram' && <span title="Instagram">📸</span>}
                    {item.platform === 'LinkedIn' && <span title="LinkedIn">💼</span>}
                    <span className="ml-1">{item.platform}</span>
                  </td>
                  <td className="px-2 py-2 capitalize">{item.type}</td>
                  <td className="px-2 py-2 max-w-xs whitespace-pre-wrap">{item.content}</td>
                  <td className="px-2 py-2 text-blue-300">{item.hashtags}</td>
                  <td className="px-2 py-2">{item.time}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(
                        `${item.content}\n${item.hashtags}\n${item.time}`
                      )}
                      className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white"
                    >
                      📋
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-2">Tip: Click the copy button to copy the full post for any day.</p>
        </div>
      );
    }

    // Handle content/social media posts (Facebook, Instagram)
    if ((module.id.includes('facebook-posts') || module.id.includes('instagram-posts')) && data.posts && Array.isArray(data.posts)) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-slate-400 mb-3">{data.summary || `Generated ${data.posts.length} posts`}</p>
          {data.posts.slice(0, 3).map((post: any, idx: number) => (
            <div key={idx} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">{post.type || 'Post'} #{idx + 1}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(post.formatted_content)}
                  className="text-xs bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded text-white"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans">{post.formatted_content}</pre>
            </div>
          ))}
          {data.posts.length > 3 && (
            <p className="text-xs text-slate-500">... and {data.posts.length - 3} more posts</p>
          )}
        </div>
      );
    }
    // ...strategic analysis and fallback rendering omitted for brevity...
    return null;
  };

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${module.color}-500/20 rounded-xl flex items-center justify-center`}>
          <span className="text-2xl">{module.icon}</span>
        </div>
        <span className={`text-sm font-medium ${getStatusColor(status)}`}>
          {getStatusIcon(status)} {status.replace('-', ' ')}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">
        {module.title}
      </h4>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        {module.description}
      </p>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
      {data && (
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
          {formatAnalysisData(module.id, data)}
        </div>
      )}
      <button
        onClick={onRunAction}
        disabled={status === 'running'}
        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
          status === 'completed'
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
            : status === 'running'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
            : 'bg-slate-600 hover:bg-slate-500 text-white'
        }`}
      >
        {status === 'running' ? 'Running...' : status === 'completed' ? 'Re-run Analysis' : 'Run Analysis'}
      </button>
    </div>
  );
}
