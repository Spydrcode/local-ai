"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import type {
  ContractorProfile,
  ContractorIndustry,
  CustomerType,
  PricingModel,
  LeadSource
} from '@/lib/types/contractor';

interface ContractorOnboardingFlowProps {
  demoId: string;
  onComplete: (profile: ContractorProfile) => void;
  initialData?: Partial<ContractorProfile>;
}

const INDUSTRIES: ContractorIndustry[] = [
  'HVAC',
  'Plumbing',
  'Roofing',
  'Remodeling',
  'Landscaping',
  'Propane',
  'Electrical',
  'Painting',
  'Concrete',
  'Fencing',
  'Other'
];

const CUSTOMER_TYPES: CustomerType[] = ['residential', 'commercial', 'industrial', 'fleet'];

const PRICING_MODELS: { value: PricingModel; label: string }[] = [
  { value: 'flat_rate', label: 'Flat Rate (fixed pricing per service)' },
  { value: 'per_hour', label: 'Per Hour (hourly billing)' },
  { value: 'estimate_based', label: 'Estimate-Based (custom quotes)' },
  { value: 'seasonal', label: 'Seasonal (varies by season)' }
];

const LEAD_SOURCES: LeadSource[] = [
  'referrals',
  'google',
  'facebook',
  'nextdoor',
  'yelp',
  'instagram',
  'website',
  'door_hangers',
  'truck_wraps',
  'other'
];

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

export function ContractorOnboardingFlow({
  demoId,
  onComplete,
  initialData
}: ContractorOnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ContractorProfile>>({
    primary_industry: initialData?.primary_industry || undefined,
    service_types: initialData?.service_types || [],
    service_area: initialData?.service_area || {
      cities: [],
      zip_ranges: [],
      radius_miles: 25
    },
    customer_types: initialData?.customer_types || [],
    pricing_model: initialData?.pricing_model || undefined,
    peak_seasons: initialData?.peak_seasons || [],
    off_seasons: initialData?.off_seasons || [],
    crew_size: initialData?.crew_size || 0,
    roles: initialData?.roles || [],
    competitors: initialData?.competitors || [],
    lead_sources: initialData?.lead_sources || [],
    photos: initialData?.photos || [],
    kpis: initialData?.kpis || {},
    profile_completeness: 0
  });

  // Temporary input states
  const [serviceTypeInput, setServiceTypeInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleCount, setRoleCount] = useState('');
  const [competitorName, setCompetitorName] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');

  const totalSteps = 6;

  const updateFormData = (updates: Partial<ContractorProfile>) => {
    setFormData({ ...formData, ...updates });
  };

  const addServiceType = () => {
    if (serviceTypeInput.trim() && !formData.service_types?.includes(serviceTypeInput.trim())) {
      updateFormData({
        service_types: [...(formData.service_types || []), serviceTypeInput.trim()]
      });
      setServiceTypeInput('');
    }
  };

  const removeServiceType = (index: number) => {
    updateFormData({
      service_types: formData.service_types?.filter((_, i) => i !== index)
    });
  };

  const addCity = () => {
    if (cityInput.trim() && !formData.service_area?.cities.includes(cityInput.trim())) {
      updateFormData({
        service_area: {
          ...formData.service_area!,
          cities: [...formData.service_area!.cities, cityInput.trim()]
        }
      });
      setCityInput('');
    }
  };

  const removeCity = (index: number) => {
    updateFormData({
      service_area: {
        ...formData.service_area!,
        cities: formData.service_area!.cities.filter((_, i) => i !== index)
      }
    });
  };

  const addZipRange = () => {
    if (zipInput.trim() && !formData.service_area?.zip_ranges.includes(zipInput.trim())) {
      updateFormData({
        service_area: {
          ...formData.service_area!,
          zip_ranges: [...formData.service_area!.zip_ranges, zipInput.trim()]
        }
      });
      setZipInput('');
    }
  };

  const removeZipRange = (index: number) => {
    updateFormData({
      service_area: {
        ...formData.service_area!,
        zip_ranges: formData.service_area!.zip_ranges.filter((_, i) => i !== index)
      }
    });
  };

  const addRole = () => {
    if (roleTitle.trim() && roleCount && parseInt(roleCount) > 0) {
      updateFormData({
        roles: [
          ...(formData.roles || []),
          { title: roleTitle.trim(), count: parseInt(roleCount) }
        ]
      });
      setRoleTitle('');
      setRoleCount('');
    }
  };

  const removeRole = (index: number) => {
    updateFormData({
      roles: formData.roles?.filter((_, i) => i !== index)
    });
  };

  const addCompetitor = () => {
    if (competitorName.trim()) {
      updateFormData({
        competitors: [
          ...(formData.competitors || []),
          {
            name: competitorName.trim(),
            url: competitorUrl.trim() || undefined,
            excluded: false
          }
        ]
      });
      setCompetitorName('');
      setCompetitorUrl('');
    }
  };

  const removeCompetitor = (index: number) => {
    updateFormData({
      competitors: formData.competitors?.filter((_, i) => i !== index)
    });
  };

  const toggleLeadSource = (source: LeadSource) => {
    const current = formData.lead_sources || [];
    if (current.includes(source)) {
      updateFormData({
        lead_sources: current.filter(s => s !== source)
      });
    } else {
      updateFormData({
        lead_sources: [...current, source]
      });
    }
  };

  const toggleSeason = (season: string, type: 'peak' | 'off') => {
    const field = type === 'peak' ? 'peak_seasons' : 'off_seasons';
    const current = formData[field] || [];
    if (current.includes(season)) {
      updateFormData({
        [field]: current.filter(s => s !== season)
      });
    } else {
      updateFormData({
        [field]: [...current, season]
      });
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 1:
        return formData.primary_industry && formData.service_types && formData.service_types.length > 0;
      case 2:
        return formData.service_area?.cities.length! > 0 || formData.service_area?.radius_miles! > 0;
      case 3:
        return formData.customer_types && formData.customer_types.length > 0;
      case 4:
        return true; // Optional step
      case 5:
        return true; // Optional step
      case 6:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step - submit
      onComplete(formData as ContractorProfile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Business Basics</h3>
            <p className="text-slate-400 mb-6">Tell us about your core business</p>

            <div className="space-y-6">
              <div>
                <Label className="text-slate-300 mb-3 block">Primary Industry *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {INDUSTRIES.map(industry => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => updateFormData({ primary_industry: industry })}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.primary_industry === industry
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {formData.primary_industry === 'Other' && (
                <div>
                  <Label htmlFor="industry_other" className="text-slate-300">
                    Specify Industry
                  </Label>
                  <Input
                    id="industry_other"
                    value={formData.industry_other || ''}
                    onChange={(e) => updateFormData({ industry_other: e.target.value })}
                    placeholder="e.g., Pool Installation"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              )}

              <div>
                <Label className="text-slate-300 mb-2 block">Services You Offer *</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={serviceTypeInput}
                    onChange={(e) => setServiceTypeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceType())}
                    placeholder="e.g., Emergency Repair, Installation"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                  <Button type="button" onClick={addServiceType} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.service_types?.map((service, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:bg-red-500/20"
                      onClick={() => removeServiceType(i)}
                    >
                      {service} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Service Area</h3>
            <p className="text-slate-400 mb-6">Where do you serve customers?</p>

            <div className="space-y-6">
              <div>
                <Label className="text-slate-300 mb-2 block">Cities *</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                    placeholder="e.g., Austin, Round Rock"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                  <Button type="button" onClick={addCity} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.service_area?.cities.map((city, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:bg-red-500/20"
                      onClick={() => removeCity(i)}
                    >
                      {city} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">ZIP Ranges (optional)</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addZipRange())}
                    placeholder="e.g., 78701-78799"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                  <Button type="button" onClick={addZipRange} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.service_area?.zip_ranges.map((zip, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:bg-red-500/20"
                      onClick={() => removeZipRange(i)}
                    >
                      {zip} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="radius" className="text-slate-300">
                  Service Radius (miles) *
                </Label>
                <Input
                  id="radius"
                  type="number"
                  value={formData.service_area?.radius_miles || ''}
                  onChange={(e) => updateFormData({
                    service_area: {
                      ...formData.service_area!,
                      radius_miles: parseInt(e.target.value) || 0
                    }
                  })}
                  placeholder="25"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Customers & Pricing</h3>
            <p className="text-slate-400 mb-6">Who you serve and how you price</p>

            <div className="space-y-6">
              <div>
                <Label className="text-slate-300 mb-3 block">Customer Types *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CUSTOMER_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const current = formData.customer_types || [];
                        updateFormData({
                          customer_types: current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type]
                        });
                      }}
                      className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        formData.customer_types?.includes(type)
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-300 mb-3 block">Pricing Model</Label>
                <div className="space-y-2">
                  {PRICING_MODELS.map(model => (
                    <button
                      key={model.value}
                      type="button"
                      onClick={() => updateFormData({ pricing_model: model.value })}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        formData.pricing_model === model.value
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium">{model.label.split('(')[0]}</div>
                      <div className="text-sm opacity-75">({model.label.split('(')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-300 mb-3 block">Peak Seasons (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SEASONS.map(season => (
                    <button
                      key={season}
                      type="button"
                      onClick={() => toggleSeason(season, 'peak')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.peak_seasons?.includes(season)
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Your Team</h3>
            <p className="text-slate-400 mb-6">Tell us about your crew (optional)</p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="crew_size" className="text-slate-300">
                  Total Crew Size
                </Label>
                <Input
                  id="crew_size"
                  type="number"
                  value={formData.crew_size || ''}
                  onChange={(e) => updateFormData({ crew_size: parseInt(e.target.value) || 0 })}
                  placeholder="12"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Crew Roles</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Role (e.g., Installer)"
                    className="bg-slate-800/50 border-slate-700 text-white flex-1"
                  />
                  <Input
                    type="number"
                    value={roleCount}
                    onChange={(e) => setRoleCount(e.target.value)}
                    placeholder="Count"
                    className="bg-slate-800/50 border-slate-700 text-white w-24"
                  />
                  <Button type="button" onClick={addRole} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.roles?.map((role, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <span className="text-white">
                        {role.title} <span className="text-slate-400">({role.count})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRole(i)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );

      case 5:
        return (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Competitors</h3>
            <p className="text-slate-400 mb-6">Add 3-5 known competitors (optional)</p>

            <div className="space-y-6">
              <div>
                <Label className="text-slate-300 mb-2 block">Add Competitor</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={competitorName}
                    onChange={(e) => setCompetitorName(e.target.value)}
                    placeholder="Company name"
                    className="bg-slate-800/50 border-slate-700 text-white flex-1"
                  />
                  <Input
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="Website (optional)"
                    className="bg-slate-800/50 border-slate-700 text-white flex-1"
                  />
                  <Button type="button" onClick={addCompetitor} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.competitors?.map((comp, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="text-white">
                        <div className="font-medium">{comp.name}</div>
                        {comp.url && (
                          <div className="text-sm text-slate-400">{comp.url}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCompetitor(i)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );

      case 6:
        return (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">Lead Sources & KPIs</h3>
            <p className="text-slate-400 mb-6">Help us understand your business metrics (optional)</p>

            <div className="space-y-6">
              <div>
                <Label className="text-slate-300 mb-3 block">Where do you get leads?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {LEAD_SOURCES.map(source => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => toggleLeadSource(source)}
                      className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        formData.lead_sources?.includes(source)
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {source.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leads_per_week" className="text-slate-300">
                    Leads per Week
                  </Label>
                  <Input
                    id="leads_per_week"
                    type="number"
                    value={formData.kpis?.leads_per_week || ''}
                    onChange={(e) => updateFormData({
                      kpis: { ...formData.kpis, leads_per_week: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="15"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="close_rate" className="text-slate-300">
                    Close Rate (%)
                  </Label>
                  <Input
                    id="close_rate"
                    type="number"
                    step="0.01"
                    max="100"
                    value={formData.kpis?.close_rate ? formData.kpis.close_rate * 100 : ''}
                    onChange={(e) => updateFormData({
                      kpis: { ...formData.kpis, close_rate: parseFloat(e.target.value) / 100 || undefined }
                    })}
                    placeholder="35"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="avg_ticket" className="text-slate-300">
                    Average Ticket ($)
                  </Label>
                  <Input
                    id="avg_ticket"
                    type="number"
                    value={formData.kpis?.avg_ticket || ''}
                    onChange={(e) => updateFormData({
                      kpis: { ...formData.kpis, avg_ticket: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="850"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="time_to_complete" className="text-slate-300">
                    Job Duration (days)
                  </Label>
                  <Input
                    id="time_to_complete"
                    type="number"
                    value={formData.kpis?.time_to_complete_days || ''}
                    onChange={(e) => updateFormData({
                      kpis: { ...formData.kpis, time_to_complete_days: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="2"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-slate-400">
            {Math.round((step / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          variant="secondary"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext()}
        >
          {step === totalSteps ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
