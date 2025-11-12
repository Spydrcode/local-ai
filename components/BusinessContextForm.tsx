"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BusinessContext } from "@/lib/data-collectors";
import { useState } from "react";

interface BusinessContextFormProps {
  onSubmit: (context: BusinessContext) => void;
  initialData?: BusinessContext;
  isLoading?: boolean;
}

export function BusinessContextForm({
  onSubmit,
  initialData,
  isLoading = false,
}: BusinessContextFormProps) {
  const [formData, setFormData] = useState<BusinessContext>({
    industry: initialData?.industry || "",
    subNiche: initialData?.subNiche || "",
    targetAudience: initialData?.targetAudience || "",
    primaryServices: initialData?.primaryServices || [],
    competitors: initialData?.competitors || [],
    marketingGoals: initialData?.marketingGoals || [],
    currentChallenges: initialData?.currentChallenges || [],
    budget: initialData?.budget || { monthly: undefined, currency: "USD" },
    geographicScope: initialData?.geographicScope || [],
  });

  // Temporary input states for array fields
  const [serviceInput, setServiceInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [challengeInput, setChallengeInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [competitorWebsite, setCompetitorWebsite] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addArrayItem = (field: keyof BusinessContext, value: string) => {
    if (!value.trim()) return;

    const currentArray = formData[field] as string[];
    setFormData({
      ...formData,
      [field]: [...currentArray, value.trim()],
    });
  };

  const removeArrayItem = (field: keyof BusinessContext, index: number) => {
    const currentArray = formData[field] as string[];
    setFormData({
      ...formData,
      [field]: currentArray.filter((_, i) => i !== index),
    });
  };

  const addCompetitor = () => {
    if (!competitorName.trim()) return;

    setFormData({
      ...formData,
      competitors: [
        ...(formData.competitors || []),
        {
          name: competitorName.trim(),
          website: competitorWebsite.trim() || undefined,
        },
      ],
    });

    setCompetitorName("");
    setCompetitorWebsite("");
  };

  const removeCompetitor = (index: number) => {
    setFormData({
      ...formData,
      competitors: formData.competitors?.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="industry" className="text-slate-300">
              Industry
            </Label>
            <Input
              id="industry"
              value={formData.industry || ""}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              placeholder="e.g., Restaurant, Home Services, Healthcare"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="subNiche" className="text-slate-300">
              Sub-Niche (Optional)
            </Label>
            <Input
              id="subNiche"
              value={formData.subNiche || ""}
              onChange={(e) =>
                setFormData({ ...formData, subNiche: e.target.value })
              }
              placeholder="e.g., Texas BBQ Catering, Emergency Plumbing"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="targetAudience" className="text-slate-300">
              Target Audience
            </Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience || ""}
              onChange={(e) =>
                setFormData({ ...formData, targetAudience: e.target.value })
              }
              placeholder="e.g., Busy professionals aged 25-45 in downtown area"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>
      </Card>

      {/* Services */}
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Primary Services</h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addArrayItem("primaryServices", serviceInput);
                  setServiceInput("");
                }
              }}
              placeholder="Add a service and press Enter"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button
              type="button"
              onClick={() => {
                addArrayItem("primaryServices", serviceInput);
                setServiceInput("");
              }}
              variant="secondary"
            >
              Add
            </Button>
          </div>

          {formData.primaryServices && formData.primaryServices.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.primaryServices.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("primaryServices", index)}
                    className="hover:text-emerald-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Competitors */}
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Competitors</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
              placeholder="Competitor name"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <div className="flex gap-2">
              <Input
                value={competitorWebsite}
                onChange={(e) => setCompetitorWebsite(e.target.value)}
                placeholder="Website (optional)"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button
                type="button"
                onClick={addCompetitor}
                variant="secondary"
              >
                Add
              </Button>
            </div>
          </div>

          {formData.competitors && formData.competitors.length > 0 && (
            <div className="space-y-2">
              {formData.competitors.map((competitor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{competitor.name}</p>
                    {competitor.website && (
                      <p className="text-sm text-slate-400">{competitor.website}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCompetitor(index)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Marketing Goals */}
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Marketing Goals</h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addArrayItem("marketingGoals", goalInput);
                  setGoalInput("");
                }
              }}
              placeholder="Add a goal and press Enter"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button
              type="button"
              onClick={() => {
                addArrayItem("marketingGoals", goalInput);
                setGoalInput("");
              }}
              variant="secondary"
            >
              Add
            </Button>
          </div>

          {formData.marketingGoals && formData.marketingGoals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.marketingGoals.map((goal, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  {goal}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("marketingGoals", index)}
                    className="hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Current Challenges */}
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Current Challenges</h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={challengeInput}
              onChange={(e) => setChallengeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addArrayItem("currentChallenges", challengeInput);
                  setChallengeInput("");
                }
              }}
              placeholder="Add a challenge and press Enter"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button
              type="button"
              onClick={() => {
                addArrayItem("currentChallenges", challengeInput);
                setChallengeInput("");
              }}
              variant="secondary"
            >
              Add
            </Button>
          </div>

          {formData.currentChallenges && formData.currentChallenges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.currentChallenges.map((challenge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm"
                >
                  {challenge}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("currentChallenges", index)}
                    className="hover:text-orange-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Budget & Geographic Scope */}
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Budget & Location</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget" className="text-slate-300">
                Monthly Marketing Budget
              </Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget?.monthly || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: {
                      ...formData.budget,
                      monthly: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="1000"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="currency" className="text-slate-300">
                Currency
              </Label>
              <select
                id="currency"
                value={formData.budget?.currency || "USD"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: { ...formData.budget, currency: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Geographic Scope</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("geographicScope", locationInput);
                    setLocationInput("");
                  }
                }}
                placeholder="Add a location and press Enter"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button
                type="button"
                onClick={() => {
                  addArrayItem("geographicScope", locationInput);
                  setLocationInput("");
                }}
                variant="secondary"
              >
                Add
              </Button>
            </div>

            {formData.geographicScope && formData.geographicScope.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.geographicScope.map((location, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("geographicScope", index)}
                      className="hover:text-purple-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
        >
          {isLoading ? "Saving..." : "Save Business Context"}
        </Button>
      </div>
    </form>
  );
}
