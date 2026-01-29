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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.titlePlaceholder')} {...field} />
              </FormControl>
              <FormDescription>
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
              <FormLabel>{t('form.url')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('form.urlPlaceholder')} 
                  {...field} 
                  onBlur={fetchMetadata}
                />
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
              <FormLabel>{t('form.category')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.categoryPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormLabel>{t('form.description')} <span className="text-muted-foreground">(可选)</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('form.descriptionPlaceholder')} 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {t('form.descriptionHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">{t('form.submit')}</Button>
      </form>
    </Form>
  )
}
