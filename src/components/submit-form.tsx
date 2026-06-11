'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Category } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Send, Loader2, Sparkles } from "lucide-react"
import { useState } from "react"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  description: z.string().optional(),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
})

interface SubmitFormProps {
  categories: Category[]
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const t = useTranslations('Submit')
  const router = useRouter()
  const [isFetching, setIsFetching] = useState(false)

  const dynamicFormSchema = z.object({
    title: z.string().min(2, {
      message: t('validation.title'),
    }),
    url: z.string().url({
      message: t('validation.url'),
    }),
    description: z.string().optional(),
    categoryId: z.string().min(1, {
      message: t('validation.category'),
    }),
  })

  const form = useForm<z.infer<typeof dynamicFormSchema>>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
    },
  })

  // Fetch metadata from URL
  const fetchMetadata = async () => {
    const url = form.getValues('url')
    if (!url) return

    setIsFetching(true)
    try {
      const res = await fetch(`/api/websites/metadata?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()

        // Only auto-fill title if empty
        if (data.title && !form.getValues('title')) {
          form.setValue('title', data.title)
        }

        // Only auto-fill description if empty
        if (data.description && !form.getValues('description')) {
          form.setValue('description', data.description)
        }
      }
    } catch (error) {
      // Silently fail - metadata fetch is optional
      console.debug('Failed to fetch metadata:', error)
    } finally {
      setIsFetching(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Submit error:', errorText)
        if (res.status === 401) {
          toast.error(t('error.unauthorized') || 'Please login to submit websites')
        } else if (res.status === 400) {
          toast.error(t('error.badRequest') || 'Invalid submission data')
        } else if (res.status === 409) {
          toast.error(t('error.duplicate') || 'Website already exists')
        } else {
          toast.error(t('error.serverError') || 'Server error. Please try again.')
        }
        return
      }

      toast.success(t('success.message'))
      form.reset()
      router.push('/')
    } catch (error) {
      toast.error(t('error.message'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto py-10">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-foreground bg-foreground text-background text-[10px] font-mono tracking-widest uppercase">
            <span className="text-accent">▸</span>
            <span>{'contribute'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono">
            <span className="text-muted-foreground">{'$'}</span> {t('title')}
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            <span className="text-accent">{'//'}</span> {t('description')}
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 bg-background p-8 border-2 border-border">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-mono text-xs uppercase tracking-widest">
                  <span className="text-accent">▸</span> {t('form.title')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.titlePlaceholder')}
                    className="bg-background border-input"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground font-mono text-xs">
                  <span className="text-accent">{'//'}</span> {t('form.titleDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-mono text-xs uppercase tracking-widest">
                  <span className="text-accent">▸</span> {t('form.url')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('form.urlPlaceholder')}
                      className="bg-background border-input pr-10 font-mono"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur()
                        fetchMetadata()
                      }}
                    />
                    {isFetching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent animate-spin" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-mono text-xs uppercase tracking-widest">
                  <span className="text-accent">▸</span> {t('form.category')}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-input w-full">
                      <SelectValue placeholder={t('form.categoryPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-mono text-xs uppercase tracking-widest">
                  <span className="text-accent">▸</span> {t('form.description')}{' '}
                  <span className="text-muted-foreground font-normal">(可选)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('form.descriptionPlaceholder')}
                    className="bg-background border-input min-h-[100px] font-mono"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground font-mono text-xs">
                  <span className="text-accent">{'//'}</span> {t('form.descriptionHint')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent h-12 font-mono uppercase tracking-widest text-xs"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t('form.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
