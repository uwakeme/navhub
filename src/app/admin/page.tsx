import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { WebsiteActions } from "@/components/admin/website-actions"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - NavHub",
}

export default async function AdminPage() {
  const session = await auth()
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const pendingWebsites = await prisma.website.findMany({
    where: { status: 'PENDING' },
    include: { category: true, submittedBy: true },
    orderBy: { createdAt: 'desc' }
  })

  const allWebsites = await prisma.website.findMany({
    include: { category: true, submittedBy: true },
    orderBy: { createdAt: 'desc' },
    take: 100 // Limit for now
  })

  function WebsiteTable({ websites }: { websites: typeof pendingWebsites }) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.map((website) => (
              <TableRow key={website.id}>
                <TableCell className="font-medium">{website.title}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={website.url}>
                  {website.url}
                </TableCell>
                <TableCell>{website.category.name}</TableCell>
                <TableCell>{website.submittedBy?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant={
                    website.status === 'APPROVED' ? 'default' : 
                    website.status === 'PENDING' ? 'secondary' : 'destructive'
                  }>
                    {website.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <WebsiteActions websiteId={website.id} status={website.status} />
                </TableCell>
              </TableRow>
            ))}
            {websites.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No websites found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval ({pendingWebsites.length})</TabsTrigger>
          <TabsTrigger value="all">All Websites</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <WebsiteTable websites={pendingWebsites} />
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          <WebsiteTable websites={allWebsites} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
