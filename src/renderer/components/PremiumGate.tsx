import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import { Button } from './ui/button'
import { Sparkles } from 'lucide-react'

interface PremiumGateProps {
  feature: string
  description: string
  icon: string
  children: React.ReactNode
}

/**
 * Wraps any premium feature. If the user is not premium, it shows a styled
 * upgrade prompt instead of the feature content. If premium, renders children.
 */
export function PremiumGate({ feature, description, icon, children }: PremiumGateProps) {
  const { isPremium } = useSettingsStore()
  const { setActiveView } = useUIStore()

  if (isPremium) return <>{children}</>

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #FE2C55 0%, #25F4EE 100%)' }}
      >
        {icon}
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">{feature}</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">{description}</p>

      <div className="flex flex-col gap-3 items-center w-full max-w-xs">
        <Button
          className="w-full gap-2 bg-[#FE2C55] hover:bg-[#E0234A] text-white border-none"
          onClick={() => setActiveView('upgrade')}
        >
          <Sparkles className="h-4 w-4" />
          Unlock Productivity Features
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Part of the Premium plan — from $2.99/month
        </p>
      </div>
    </div>
  )
}
