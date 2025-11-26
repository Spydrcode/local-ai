"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function ContractorMonthlyReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo_id = searchParams?.get('demo_id');

  const [selectedMonth, setSelectedMonth] = useState('');
  const [reportType, setReportType] = useState<'executive' | 'investor' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/contractor/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_id,
          month: selectedMonth,
          report_type: reportType
        })
      });

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!demo_id) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Missing Demo ID</h2>
          <p className="text-slate-400 mb-4">Please start from the contractor dashboard.</p>
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const months = [
    'January 2025', 'February 2025', 'March 2025', 'April 2025',
    'May 2025', 'June 2025', 'July 2025', 'August 2025',
    'September 2025', 'October 2025', 'November 2025', 'December 2025'
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push(`/contractor/dashboard?demo_id=${demo_id}`)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">
            📄 Monthly One-Pager
          </h1>
          <p className="text-slate-400">
            Executive summary for you • Investor-grade for lenders
          </p>
        </div>

        {/* Report Type Selection */}
        {!reportType && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="p-8 bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer"
              onClick={() => setReportType('executive')}
            >
              <div className="text-5xl mb-4">👔</div>
              <h2 className="text-2xl font-bold text-white mb-3">Executive Summary</h2>
              <p className="text-slate-400 mb-4">
                1-page report with metrics, trends, and action items for owners
              </p>
              <ul className="space-y-2 text-sm text-slate-400 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  Revenue & profit trends
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  Lead conversion rates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  Top 3 action items
                </li>
              </ul>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                For Internal Use
              </Badge>
            </Card>

            <Card
              className="p-8 bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-colors cursor-pointer"
              onClick={() => setReportType('investor')}
            >
              <div className="text-5xl mb-4">💼</div>
              <h2 className="text-2xl font-bold text-white mb-3">Investor Report</h2>
              <p className="text-slate-400 mb-4">
                Professional report formatted for banks, investors, and lenders
              </p>
              <ul className="space-y-2 text-sm text-slate-400 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  Financial statements format
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  Growth projections
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  Risk assessment
                </li>
              </ul>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                For Lenders/Investors
              </Badge>
            </Card>
          </div>
        )}

        {/* Report Generation Form */}
        {reportType && !report && (
          <Card className="p-8 bg-slate-900/50 border-slate-800">
            <Button
              variant="secondary"
              onClick={() => setReportType(null)}
              className="mb-6"
            >
              ← Back to Selection
            </Button>

            <h2 className="text-2xl font-bold text-white mb-6">
              Generate {reportType === 'executive' ? 'Executive Summary' : 'Investor Report'}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-white"
              >
                <option value="">Choose month...</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={generateReport}
              disabled={!selectedMonth || isGenerating}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isGenerating ? 'Generating Report...' : 'Generate Report'}
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 mt-4">Generating your {reportType} report...</p>
            <p className="text-slate-500 text-sm mt-2">Analyzing metrics and trends</p>
          </div>
        )}

        {/* Report Display */}
        {report && (
          <div className="space-y-6">
            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {reportType === 'executive' ? 'Executive Summary' : 'Investor Report'}
                  </h2>
                  <p className="text-slate-400">{selectedMonth}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary">
                    📥 Download PDF
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReport(null);
                      setReportType(null);
                      setSelectedMonth('');
                    }}
                  >
                    Generate Another
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <div className="text-sm text-emerald-400 mb-1">Revenue</div>
                  <div className="text-2xl font-bold text-white">$87,500</div>
                  <div className="text-xs text-emerald-400 mt-1">↑ 12% vs last month</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-sm text-blue-400 mb-1">Jobs Completed</div>
                  <div className="text-2xl font-bold text-white">42</div>
                  <div className="text-xs text-blue-400 mt-1">↑ 8% vs last month</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="text-sm text-orange-400 mb-1">Profit Margin</div>
                  <div className="text-2xl font-bold text-white">28%</div>
                  <div className="text-xs text-orange-400 mt-1">↑ 3% vs last month</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-sm text-purple-400 mb-1">New Leads</div>
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-xs text-purple-400 mt-1">↑ 22% vs last month</div>
                </div>
              </div>

              {/* Report Sections */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Performance Highlights</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      Revenue up 12% month-over-month driven by increase in average ticket size
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      Customer acquisition cost decreased 15% due to improved SEO and referrals
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      Crew productivity improved 8% with new scheduling system
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Top 3 Action Items</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-red-500/20 text-red-400">High Priority</Badge>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Hire 2 additional crew members</h4>
                          <p className="text-sm text-slate-400">
                            Current backlog of 14 days. Target: 5-7 days to maintain quality and customer satisfaction
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-orange-500/20 text-orange-400">Medium Priority</Badge>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Increase prices by 8-10%</h4>
                          <p className="text-sm text-slate-400">
                            Market analysis shows competitors charging 12% more. Opportunity to improve margins
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-yellow-500/20 text-yellow-400">Low Priority</Badge>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Launch seasonal maintenance program</h4>
                          <p className="text-sm text-slate-400">
                            Recurring revenue opportunity with 35% of past customers qualifying
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorMonthlyReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ContractorMonthlyReportContent />
    </Suspense>
  );
}
