'use client'

import { Button } from "@/components/ui/button"
import { Check, X, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface WebsiteActionsProps {
  websiteId: string
  status: string
}

export function WebsiteActions({ websiteId, status }: WebsiteActionsProps) {
  const router = useRouter()

  const handleAction = async (action: 'approve' | 'reject' | 'delete') => {
    try {
      let res
      if (action === 'delete') {
        res = await fetch(`/api/admin/websites/${websiteId}`, {
          method: 'DELETE',
        })
      } else {
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
        res = await fetch(`/api/admin/websites/${websiteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      }

      if (!res.ok) throw new Error('Action failed')
      
      toast.success(`Website ${action}d successfully`)
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'PENDING' && (
        <>
          <Button size="icon" variant="outline" className="h-8 w-8 text-green-600" onClick={() => handleAction('approve')}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8 text-red-600" onClick={() => handleAction('reject')}>
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleAction('delete')}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  )
}
