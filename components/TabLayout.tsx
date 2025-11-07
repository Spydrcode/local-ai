"use client"

import type React from 'react'
import { useState } from 'react'

export interface Tab {
  id: string
  label: string
  description?: string
}

interface TabLayoutProps {
  tabs: Tab[]
  defaultTab?: string
  children: (activeTab: string) => React.ReactNode
}

export default function TabLayout({ tabs, defaultTab, children }: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-6 py-3 text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
                }
              `}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {children(activeTab)}
      </div>
    </div>
  )
}
