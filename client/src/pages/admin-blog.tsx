import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  tags: string[] | null;
  published: boolean;
  publishedAt: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlog() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: posts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
  });

  const form = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      tags: "",
      published: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
      };
      return apiRequest("/api/admin/blog", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Success", description: "Blog post created successfully" });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create blog post", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BlogPostForm }) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
      };
      return apiRequest(`/api/admin/blog/${id}`, "PUT", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Success", description: "Blog post updated successfully" });
      setEditingPost(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update blog post", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/blog/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      toast({ title: "Success", description: "Blog post deleted successfully" });
      setDeletingPostId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    form.reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage || "",
      tags: post.tags?.join(", ") || "",
      published: post.published,
    });
  };

  const handleSubmit = (data: BlogPostForm) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient-admin" data-testid="heading-blog-admin">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog posts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-admin" data-testid="button-create-post">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Blog Post</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          data-testid="input-title"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!editingPost) {
                              form.setValue("slug", generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="input-excerpt" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Markdown)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={8} data-testid="input-content" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-featured-image" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="tutorial, beginner, networking" data-testid="input-tags" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <FormLabel>Publish immediately</FormLabel>
                        <p className="text-sm text-muted-foreground">Make this post visible to the public</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-published" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-admin" disabled={createMutation.isPending} data-testid="button-submit-post">
                    {createMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold" data-testid={`post-title-${post.id}`}>{post.title}</h3>
                  <Badge variant={post.published ? "default" : "secondary"} data-testid={`post-status-${post.id}`}>
                    {post.published ? (
                      <><Eye className="w-3 h-3 mr-1" /> Published</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Slug: {post.slug}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span>Tags: {post.tags.join(", ")}</span>
                  )}
                  {post.publishedAt && (
                    <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={editingPost?.id === post.id} onOpenChange={(open) => !open && setEditingPost(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(post)} data-testid={`button-edit-${post.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Blog Post</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-edit-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug (URL)</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-edit-slug" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} data-testid="input-edit-excerpt" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content (Markdown)</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={8} data-testid="input-edit-content" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="featuredImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Featured Image URL (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-edit-featured-image" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags (comma-separated)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="tutorial, beginner, networking" data-testid="input-edit-tags" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="published"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <FormLabel>Published</FormLabel>
                                <p className="text-sm text-muted-foreground">Make this post visible to the public</p>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-edit-published" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" className="bg-gradient-admin" disabled={updateMutation.isPending} data-testid="button-update-post">
                            {updateMutation.isPending ? "Updating..." : "Update Post"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setEditingPost(null)} data-testid="button-cancel-edit">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" size="sm" onClick={() => setDeletingPostId(post.id)} data-testid={`button-delete-${post.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {posts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No blog posts yet. Create your first post to get started!</p>
          </Card>
        )}
      </div>

      <AlertDialog open={deletingPostId !== null} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPostId && deleteMutation.mutate(deletingPostId)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
