"use client";

import {
    ArrowUpRight,
    Calendar,
    DollarSign,
    Loader2,
    Target,
    TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ROIData {
  initialInvestment: {
    total: number;
    breakdown: Array<{ item: string; cost: number }>;
  };
  projectedRevenue: {
    month3: { revenue: number; description: string };
    month6: { revenue: number; description: string };
    month12: { revenue: number; description: string };
  };
  metrics: {
    breakEvenMonths: number;
    roi3Month: string;
    roi6Month: string;
    roi12Month: string;
    projectedAnnualGrowth: string;
  };
  keyDrivers: string[];
}

export default function ROICalculator({ demoId }: { demoId: string }) {
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchROI() {
      try {
        setLoading(true);
        const response = await fetch(`/api/roi-calculator/${demoId}`);
        if (!response.ok) throw new Error("Failed to fetch ROI data");
        const data = await response.json();
        setRoiData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ROI data");
      } finally {
        setLoading(false);
      }
    }

    if (demoId) {
      fetchROI();
    }
  }, [demoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-gray-600">Calculating ROI projections...</span>
      </div>
    );
  }

  if (error || !roiData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Failed to load ROI calculator: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">ROI Financial Projections</h2>
            <p className="mt-1 text-emerald-100">
              See the financial impact of implementing your strategic plan
            </p>
          </div>
        </div>
      </div>

      {/* Investment Required */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Initial Investment Required</h3>
        </div>
        
        <div className="mb-4 text-3xl font-bold text-gray-900">
          ${roiData.initialInvestment.total.toLocaleString()}
        </div>

        <div className="space-y-2">
          {roiData.initialInvestment.breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-gray-700">{item.item}</span>
              <span className="font-semibold text-gray-900">
                ${item.cost.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Projections Timeline */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Projected Revenue Growth</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* 3 Month */}
          <div className="rounded-lg border-2 border-emerald-100 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-900">3 Months</span>
              <Calendar className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mb-2 text-2xl font-bold text-emerald-900">
              ${roiData.projectedRevenue.month3.revenue.toLocaleString()}
            </div>
            <p className="text-sm text-emerald-700">
              {roiData.projectedRevenue.month3.description}
            </p>
          </div>

          {/* 6 Month */}
          <div className="rounded-lg border-2 border-blue-100 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">6 Months</span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mb-2 text-2xl font-bold text-blue-900">
              ${roiData.projectedRevenue.month6.revenue.toLocaleString()}
            </div>
            <p className="text-sm text-blue-700">
              {roiData.projectedRevenue.month6.description}
            </p>
          </div>

          {/* 12 Month */}
          <div className="rounded-lg border-2 border-purple-100 bg-purple-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">12 Months</span>
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mb-2 text-2xl font-bold text-purple-900">
              ${roiData.projectedRevenue.month12.revenue.toLocaleString()}
            </div>
            <p className="text-sm text-purple-700">
              {roiData.projectedRevenue.month12.description}
            </p>
          </div>
        </div>
      </div>

      {/* ROI Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Break-Even & ROI */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Return on Investment</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Break-Even Point</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <ArrowUpRight className="h-4 w-4" />
                {roiData.metrics.breakEvenMonths} months
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">3-Month ROI</span>
              <span className="font-bold text-emerald-600">{roiData.metrics.roi3Month}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">6-Month ROI</span>
              <span className="font-bold text-blue-600">{roiData.metrics.roi6Month}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">12-Month ROI</span>
              <span className="font-bold text-purple-600">{roiData.metrics.roi12Month}</span>
            </div>
            <div className="mt-4 rounded-lg bg-linear-to-r from-emerald-50 to-teal-50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Annual Growth Rate</span>
                <span className="text-lg font-bold text-emerald-700">
                  {roiData.metrics.projectedAnnualGrowth}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Drivers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Key Growth Drivers</h4>
          <div className="space-y-3">
            {roiData.keyDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500"></div>
                <p className="text-sm text-gray-700">{driver}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="rounded-lg bg-linear-to-r from-gray-50 to-gray-100 p-6">
        <p className="text-center text-sm text-gray-600">
          <strong className="text-gray-900">Ready to achieve these results?</strong> Contact We Build Apps to discuss implementing your strategic plan and turning these projections into reality.
        </p>
      </div>
    </div>
  );
}
