import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BlogPost } from "@shared/schema";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function AdminBlogModern() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft" as "draft" | "published",
  });
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/blog", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post created successfully" });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/blog/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post deleted" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
    });
    setEditingPost(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="Blog Admin"
        description="Manage blog posts, articles, and documentation"
        icon={FileText}
        action={
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg"
            onClick={handleOpenNew}
            data-testid="button-create-post"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        }
      />

      <ModernCard delay={0.1}>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
            </div>
          ) : posts && posts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover-elevate"
                  >
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="text-gray-600 font-mono text-sm">{post.slug}</TableCell>
                    <TableCell>
                      {post.status === "published" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" data-testid={`button-edit-${post.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(post.id)}
                          data-testid={`button-delete-${post.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No blog posts yet. Create your first post!</p>
            </div>
          )}
        </div>
      </ModernCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-post">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              {editingPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
            <DialogDescription>
              Write and publish blog posts for your platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="How to troubleshoot network issues"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-post-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Slug</label>
              <Input
                placeholder="troubleshoot-network-issues"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                data-testid="input-post-slug"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Excerpt</label>
              <Textarea
                placeholder="Brief summary of the post..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                data-testid="input-post-excerpt"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content (Markdown)</label>
              <Textarea
                placeholder="Write your post content in markdown..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                data-testid="input-post-content"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                data-testid="select-post-status"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
              onClick={handleSubmit}
              disabled={createMutation.isPending || !formData.title || !formData.slug}
              data-testid="button-submit-post"
            >
              {createMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
