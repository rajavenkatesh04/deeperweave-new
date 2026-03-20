'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Trash2, X, Search, Film } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

import { ProfileSectionWithItems, SectionItemWithMedia, TierType, SECTION_LIMITS } from '@/lib/definitions';
import { createSection, deleteSection, addSectionItem, removeSectionItem } from '@/lib/actions/section-actions';
import { searchMedia } from '@/lib/actions/media-actions';
import type { Movie, TV } from '@/lib/types/tmdb';

interface Props {
    initialSections: ProfileSectionWithItems[];
    userId: string;
    tier: TierType;
}

export function ProfileSectionsEditor({ initialSections, userId, tier }: Props) {
    const [sections, setSections] = useState<ProfileSectionWithItems[]>(initialSections);
    const [isPending, startTransition] = useTransition();

    // --- Create Section Dialog ---
    const [createOpen, setCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    // --- Add Item Dialog ---
    const [addItemSectionId, setAddItemSectionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<(Movie | TV)[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const limit = SECTION_LIMITS[tier] ?? 2;

    // Debounced media search — only runs after mount when dialog is open
    useEffect(() => {
        if (!addItemSectionId) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const q = searchQuery.trim();
            if (q.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            const results = await searchMedia(q);
            setSearchResults(results);
            setIsSearching(false);
        }, 400);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery, addItemSectionId]);

    const handleCreateSection = () => {
        startTransition(async () => {
            const result = await createSection(newTitle);
            if (result.error) { toast.error(result.error); return; }
            setSections(prev => [...prev, { ...result.data!, items: [] } as ProfileSectionWithItems]);
            setNewTitle('');
            setCreateOpen(false);
            toast.success('Section created');
        });
    };

    const handleDeleteSection = (sectionId: string) => {
        startTransition(async () => {
            const result = await deleteSection(sectionId);
            if (result.error) { toast.error(result.error); return; }
            setSections(prev => prev.filter(s => s.id !== sectionId));
            toast.success('Section deleted');
        });
    };

    const handleAddItem = (mediaId: number, mediaType: 'movie' | 'tv', mediaTitle: string, mediaPoster: string | null) => {
        if (!addItemSectionId) return;
        const sectionId = addItemSectionId;

        startTransition(async () => {
            const result = await addSectionItem(sectionId, mediaId, mediaType);
            if (result.error) { toast.error(result.error); return; }

            const newItem: SectionItemWithMedia = {
                id: crypto.randomUUID(),
                section_id: sectionId,
                media_type: mediaType,
                media_id: mediaId,
                rank: 999,
                is_private: false,
                created_at: new Date().toISOString(),
                media_title: mediaTitle,
                media_poster: mediaPoster,
            };
            setSections(prev => prev.map(s =>
                s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
            ));
            toast.success(`Added to section`);
        });
    };

    const handleRemoveItem = (itemId: string, sectionId: string) => {
        startTransition(async () => {
            const result = await removeSectionItem(itemId, userId);
            if (result.error) { toast.error(result.error); return; }
            setSections(prev => prev.map(s =>
                s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
            ));
        });
    };

    const openAddItemDialog = (sectionId: string) => {
        setAddItemSectionId(sectionId);
        setSearchQuery('');
        setSearchResults([]);
    };

    const closeAddItemDialog = () => {
        setAddItemSectionId(null);
        setSearchQuery('');
        setSearchResults([]);
    };

    const currentSection = sections.find(s => s.id === addItemSectionId);

    return (
        <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Showcase</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    disabled={sections.length >= limit || isPending}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Section
                </Button>
            </div>

            <p className="text-xs text-muted-foreground px-1">
                {sections.length}/{limit} sections used · {tier} plan
            </p>

            {sections.length === 0 && (
                <Card className="border-dashed bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                        <Film className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No sections yet. Add one to showcase your favorites.</p>
                    </CardContent>
                </Card>
            )}

            {sections.map(section => (
                <Card key={section.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{section.title}</CardTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteSection(section.id)}
                                disabled={isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {section.items.map(item => (
                                <div key={item.id} className="relative group">
                                    <div className="w-16 h-24 rounded-md overflow-hidden bg-muted border">
                                        {item.media_poster ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w185${item.media_poster}`}
                                                alt={item.media_title}
                                                width={64}
                                                height={96}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Film className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id, section.id)}
                                        disabled={isPending}
                                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            {section.items.length < 10 && (
                                <button
                                    type="button"
                                    onClick={() => openAddItemDialog(section.id)}
                                    disabled={isPending}
                                    className="w-16 h-24 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Create Section Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>New Section</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <Input
                            placeholder="e.g. Top 3 Movies"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            maxLength={50}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSection(); } }}
                            autoFocus
                        />
                        <Button
                            className="w-full"
                            onClick={handleCreateSection}
                            disabled={!newTitle.trim() || isPending}
                        >
                            {isPending ? <Spinner /> : 'Create'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Item Dialog */}
            <Dialog open={!!addItemSectionId} onOpenChange={open => { if (!open) closeAddItemDialog(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add to &ldquo;{currentSection?.title}&rdquo;</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search movies & TV shows..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="max-h-80 overflow-y-auto space-y-1">
                            {isSearching && (
                                <div className="flex justify-center py-6">
                                    <Spinner />
                                </div>
                            )}
                            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
                            )}
                            {!isSearching && searchResults.map(media => {
                                const id = media.id;
                                const title = media.media_type === 'movie' ? (media as Movie).title : (media as TV).name;
                                const poster = media.poster_path;
                                const year = media.media_type === 'movie'
                                    ? (media as Movie).release_date?.slice(0, 4)
                                    : (media as TV).first_air_date?.slice(0, 4);
                                const alreadyAdded = currentSection?.items.some(i => i.media_id === id && i.media_type === media.media_type);

                                return (
                                    <button
                                        key={`${media.media_type}-${id}`}
                                        type="button"
                                        disabled={isPending || alreadyAdded}
                                        onClick={() => handleAddItem(id, media.media_type as 'movie' | 'tv', title, poster)}
                                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="w-9 h-14 rounded shrink-0 overflow-hidden bg-muted">
                                            {poster && (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w92${poster}`}
                                                    alt={title}
                                                    width={36}
                                                    height={56}
                                                    className="object-cover w-full h-full"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{media.media_type}{year ? ` · ${year}` : ''}</p>
                                        </div>
                                        {alreadyAdded && <span className="text-xs text-muted-foreground shrink-0">Added</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}