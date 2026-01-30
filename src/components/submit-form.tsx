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
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 text-slate-600 dark:text-slate-400 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>贡献资源</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-600 dark:text-slate-400">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('description')}
          </p>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-6 bg-white dark:bg-[#1e293b]/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700/50">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300">{t('form.title')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('form.titlePlaceholder')} 
                    className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-slate-500/50 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500/20"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-slate-500 dark:text-slate-500">
                  {t('form.titleDescription')}
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
                <FormLabel className="text-slate-700 dark:text-slate-300">{t('form.url')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder={t('form.urlPlaceholder')} 
                      className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-slate-500/50 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500/20 pr-10"
                      {...field} 
                      onBlur={(e) => {
                        field.onBlur()
                        fetchMetadata()
                      }}
                    />
                    {isFetching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 animate-spin" />
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
                <FormLabel className="text-slate-700 dark:text-slate-300">{t('form.category')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 focus:border-slate-400 dark:focus:border-slate-500/50 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500/20">
                      <SelectValue placeholder={t('form.categoryPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700/50">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-500/20 focus:text-slate-600 dark:focus:text-slate-300"
                      >
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
                <FormLabel className="text-slate-700 dark:text-slate-300">
                  {t('form.description')} <span className="text-slate-400 dark:text-slate-500">(可选)</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t('form.descriptionPlaceholder')} 
                    className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-slate-500/50 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500/20 resize-none min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-slate-500 dark:text-slate-500">
                  {t('form.descriptionHint')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-slate-600 hover:bg-slate-700 text-white border-0 h-11"
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
