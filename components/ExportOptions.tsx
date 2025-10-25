'use client';

import { CheckCircle2, Download, FileSpreadsheet, FileText, Loader2, Presentation } from 'lucide-react';
import React, { useState } from 'react';

interface ExportOptionsProps {
  demoId: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ demoId }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'pptx') => {
    try {
      setDownloading(format);
      setSuccess(null);

      const response = await fetch(`/api/export/${demoId}?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `analysis.${format}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(format);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const exportOptions = [
    {
      format: 'pdf' as const,
      title: 'PDF Report',
      description: 'Comprehensive strategic analysis report with executive summary, insights, and recommendations',
      icon: FileText,
      color: 'red',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      format: 'excel' as const,
      title: 'Excel Tracker',
      description: 'Financial projections spreadsheet with action item tracker and ROI calculations',
      icon: FileSpreadsheet,
      color: 'green',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      format: 'pptx' as const,
      title: 'PowerPoint Presentation',
      description: 'Executive presentation slides ready for stakeholder meetings and boardroom discussions',
      icon: Presentation,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center mb-2">
          <Download className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold">Export Your Analysis</h2>
        </div>
        <p className="text-white/90">
          Download professional reports and presentations to share with stakeholders
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isDownloading = downloading === option.format;
          const isSuccess = success === option.format;

          return (
            <div 
              key={option.format}
              className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all hover:shadow-lg"
            >
              {/* Card Header */}
              <div className={`bg-linear-to-r ${option.gradient} p-6 text-white`}>
                <Icon className="h-12 w-12 mb-3" />
                <h3 className="text-xl font-bold">{option.title}</h3>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4 min-h-[60px]">
                  {option.description}
                </p>

                {/* Download Button */}
                <button
                  onClick={() => handleExport(option.format)}
                  disabled={isDownloading || !!downloading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                    isSuccess
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                      : isDownloading
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : `bg-linear-to-r ${option.gradient} text-white hover:opacity-90 active:scale-95`
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download {option.format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6">
                <div className="text-xs text-gray-500">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span>Branded with We Build Apps</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span>Professional formatting</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span>Ready to share</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Export Usage Tips</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">📄 PDF Report</h4>
            <p className="text-blue-700">
              Perfect for email distribution, client presentations, and archival documentation. Includes all strategic insights and recommendations.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">📊 Excel Tracker</h4>
            <p className="text-blue-700">
              Ideal for financial planning, budget tracking, and action item management. Customize formulas and add your own data.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">📽️ PowerPoint</h4>
            <p className="text-blue-700">
              Great for boardroom presentations, stakeholder meetings, and investor pitches. Customize slides with your branding.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Need Help Presenting Your Strategy?</h3>
        <p className="text-white/90 mb-4">
          We Build Apps can help you create custom presentations and executive summaries
        </p>
        <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Schedule Consultation
        </button>
      </div>
    </div>
  );
};

export default ExportOptions;
