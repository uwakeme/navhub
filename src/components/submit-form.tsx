'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Category } from "@/generated/client"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
})

interface SubmitFormProps {
  categories: Category[]
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        throw new Error('Failed to submit')
      }

      toast.success("Website submitted successfully! It will be visible after approval.")
      form.reset()
      router.push('/')
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Submit a Website</h1>
          <p className="text-muted-foreground">
            Share a useful developer tool or resource with the community.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Next.js" {...field} />
              </FormControl>
              <FormDescription>
                The name of the website or tool.
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
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of what this website does..." 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit Website</Button>
      </form>
    </Form>
  )
}
