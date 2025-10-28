import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Demo {
  id: string
  businessName: string
  websiteUrl: string
  siteSummary?: string
  porterAnalysis?: any
  createdAt: string
}

interface DemoStore {
  currentDemoId: string | null
  demoData: Demo | null
  loading: boolean
  error: string | null
  
  // Actions
  setCurrentDemo: (id: string) => void
  loadDemoData: (id: string) => Promise<void>
  clearDemo: () => void
  setError: (error: string | null) => void
}

export const useDemoStore = create<DemoStore>()(
  devtools(
    (set, get) => ({
      currentDemoId: null,
      demoData: null,
      loading: false,
      error: null,

      setCurrentDemo: (id) => set({ currentDemoId: id }),

      loadDemoData: async (id) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`/api/demos/${id}`)
          if (!response.ok) throw new Error('Failed to fetch demo')
          
          const data = await response.json()
          set({ demoData: data, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          })
        }
      },

      clearDemo: () => set({ 
        currentDemoId: null, 
        demoData: null, 
        error: null 
      }),

      setError: (error) => set({ error })
    }),
    { name: 'demo-store' }
  )
)