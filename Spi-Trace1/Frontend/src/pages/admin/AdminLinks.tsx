import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useScan, DarkWebLink } from '@/contexts/ScanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Calendar,
  Search,
  Check,
  X,
  Network,
  Activity,
  ToggleRight,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLinks() {
  const { darkWebLinks, addDarkWebLink, updateDarkWebLink, removeDarkWebLink, toggleDarkWebLink, refreshData } = useScan();

  const [searchQuery, setSearchQuery] = useState('');

  // Refresh data on mount to ensure we have the latest list
  useState(() => {
    refreshData?.();
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ url: '', name: '' });
  const [editingLink, setEditingLink] = useState<DarkWebLink | null>(null);

  const filteredLinks = darkWebLinks.filter(
    (link) =>
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledCount = darkWebLinks.filter((l) => l.status === 'enabled').length;
  const disabledCount = darkWebLinks.filter((l) => l.status === 'disabled').length;

  const handleAddLink = async () => {
    if (!newLink.url.trim() || !newLink.name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const success = await addDarkWebLink(newLink.url.trim(), newLink.name.trim());
    if (success) {
      setNewLink({ url: '', name: '' });
      setIsAddDialogOpen(false);
      toast.success('Dark web source added successfully');
    } else {
      toast.error('Failed to add source');
    }
  };

  const handleEditLink = async () => {
    if (!editingLink) return;
    const success = await updateDarkWebLink(editingLink.id, {
      url: editingLink.url,
      name: editingLink.name,
    });

    if (success) {
      setIsEditDialogOpen(false);
      setEditingLink(null);
      toast.success('Source updated successfully');
    } else {
      toast.error('Failed to update source');
    }
  };

  const handleDeleteLink = async (id: string) => {
    const success = await removeDarkWebLink(id);
    if (success) {
      setDeleteConfirmId(null);
      toast.success('Source removed successfully');
    } else {
      toast.error('Failed to remove source');
    }
  };

  const handleToggleLink = async (id: string, currentStatus: string) => {
    const success = await toggleDarkWebLink(id);
    if (success) {
      toast.success(
        currentStatus === 'enabled'
          ? 'Source disabled - will not be scanned'
          : 'Source enabled - will be scanned'
      );
    } else {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <PageTransition>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Network className="w-8 h-8" />
                Manage Dark Web Sources
              </h1>
              <p className="text-muted-foreground">
                Configure dark web forums and marketplaces to scan
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyber hover:bg-cyber/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Dark Web Source</DialogTitle>
                  <DialogDescription>
                    Add a new dark web forum or marketplace to the scanning list.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Source Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Dark Forum, Shadow Market"
                      value={newLink.name}
                      onChange={(e) =>
                        setNewLink({ ...newLink, name: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">The display name for this source</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL / Identifier</Label>
                    <Input
                      id="url"
                      placeholder="e.g., darkforum.onion"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink({ ...newLink, url: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">The .onion URL or unique identifier</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-cyber hover:bg-cyber/90" onClick={handleAddLink}>
                    Add Source
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sources</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{darkWebLinks.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Network className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-safe/30 bg-safe/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-safe">Active Sources</p>
                    <p className="text-3xl font-bold text-safe mt-2">{enabledCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-safe/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-safe" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Disabled</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{disabledCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <ToggleRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Banner */}
          <motion.div variants={fadeInUp}>
            <Card className="border-cyber/30 bg-cyber/5">
              <CardContent className="pt-6 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-cyber flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">Active sources are scanned</p>
                  <p className="text-sm text-muted-foreground">
                    Only sources marked as active will be included in user scans. Disable sources to exclude them from scanning operations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search */}
          <motion.div variants={fadeInUp}>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
              />
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={fadeInUp}>
            {filteredLinks.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? 'No sources found' : 'No sources added yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try a different search term' : 'Add your first dark web source to get started'}
                </p>
                {!searchQuery && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-cyber hover:bg-cyber/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Source
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Dark Web Source</DialogTitle>
                        <DialogDescription>
                          Add a new dark web forum or marketplace to the scanning list.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Source Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Dark Forum, Shadow Market"
                            value={newLink.name}
                            onChange={(e) =>
                              setNewLink({ ...newLink, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="url">URL / Identifier</Label>
                          <Input
                            id="url"
                            placeholder="e.g., darkforum.onion"
                            value={newLink.url}
                            onChange={(e) =>
                              setNewLink({ ...newLink, url: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-cyber hover:bg-cyber/90" onClick={handleAddLink}>
                          Add Source
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredLinks.map((link, index) => (
                          <motion.tr
                            key={link.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group transition hover:bg-muted/30 ${link.status === 'disabled' ? 'opacity-60' : ''
                              }`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${link.status === 'enabled'
                                      ? 'bg-safe/10'
                                      : 'bg-muted'
                                    }`}
                                >
                                  <Globe
                                    className={`w-5 h-5 transition ${link.status === 'enabled'
                                        ? 'text-safe'
                                        : 'text-muted-foreground'
                                      }`}
                                  />
                                </div>
                                <div>
                                  <span className="font-medium text-foreground block">
                                    {link.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ID: {link.id.slice(0, 8)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-sm bg-muted px-3 py-1 rounded font-mono">
                                {link.url}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={link.status === 'enabled'}
                                  onCheckedChange={() =>
                                    handleToggleLink(link.id, link.status)
                                  }
                                />
                                <span
                                  className={`text-sm font-medium ${link.status === 'enabled'
                                      ? 'text-safe'
                                      : 'text-muted-foreground'
                                    }`}
                                >
                                  {link.status === 'enabled' ? 'Active' : 'Disabled'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(link.addedAt), 'MMM d, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingLink(link);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeleteConfirmId(link.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Dark Web Source</DialogTitle>
              <DialogDescription>
                Update the source details.
              </DialogDescription>
            </DialogHeader>
            {editingLink && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Source Name</Label>
                  <Input
                    id="edit-name"
                    value={editingLink.name}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL / Identifier</Label>
                  <Input
                    id="edit-url"
                    value={editingLink.url}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, url: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-cyber hover:bg-cyber/90" onClick={handleEditLink}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteConfirmId}
          onOpenChange={() => setDeleteConfirmId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Source</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this dark web source? This action
                cannot be undone and future scans will not include this source.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmId && handleDeleteLink(deleteConfirmId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Source
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageTransition>
    </AdminLayout>
  );
}
