'use client';

import { useState, useRef, useCallback, useImperativeHandle } from 'react';
import Image from 'next/image';
import { searchAll } from '@/lib/actions/media-actions';
import { TierType, TIER_LIMITS, ProfileSectionResolved } from '@/lib/definitions';
import { Entity } from '@/lib/types/tmdb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Film, GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import { FilmIcon, TvIcon, UserIcon as PersonIcon } from '@heroicons/react/24/solid';

/* ─── Types ──────────────────────────────────────────────────────── */

export interface LocalItem {
    id: string;
    media_type: 'movie' | 'tv' | 'person';
    media_id: number;
    title: string;
    poster_path: string | null;
}

export interface LocalSection {
    id: string;
    title: string;
    rank: number;
    items: LocalItem[];
}

export interface ProfileSectionsEditorHandle {
    getSections: () => LocalSection[];
    isDirty: () => boolean;
}

interface SearchResult {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title: string;
    poster_path: string | null;
    subtitle?: string;
}

interface Props {
    initialSections: ProfileSectionResolved[];
    tier: TierType;
    onDirty: () => void;
    ref: React.Ref<ProfileSectionsEditorHandle>;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function tmpId() {
    return `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function toLocalSection(s: ProfileSectionResolved): LocalSection {
    return {
        id: s.id,
        title: s.title,
        rank: s.rank,
        items: s.items.map(item => ({
            id: item.id,
            media_type: item.media_type,
            media_id: item.media_id,
            title: item.title,
            poster_path: item.poster_path,
        })),
    };
}

function normaliseEntity(entity: Entity): SearchResult | null {
    const mt = (entity as Entity & { media_type?: string }).media_type;
    if (mt === 'movie' && 'title' in entity) {
        return { id: entity.id, media_type: 'movie', title: entity.title, poster_path: entity.poster_path ?? null, subtitle: (entity as any).release_date?.slice(0, 4) };
    }
    if (mt === 'tv' && 'name' in entity) {
        return { id: entity.id, media_type: 'tv', title: (entity as any).name, poster_path: (entity as any).poster_path ?? null, subtitle: (entity as any).first_air_date?.slice(0, 4) };
    }
    if (mt === 'person' && 'name' in entity) {
        return { id: entity.id, media_type: 'person', title: (entity as any).name, poster_path: (entity as any).profile_path ?? null, subtitle: (entity as any).known_for_department };
    }
    return null;
}

/* ─── Search Dialog ──────────────────────────────────────────────── */

function SearchDialog({
    open,
    onOpenChange,
    onAdd,
    existingIds,
    itemCount,
    itemLimit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (result: SearchResult) => void;
    existingIds: Set<string>;
    itemCount: number;
    itemLimit: number;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const atLimit = itemCount >= itemLimit;

    const ICONS = { movie: FilmIcon, tv: TvIcon, person: PersonIcon } as const;

    const handleSearch = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) { setResults([]); return; }
        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const raw = await searchAll(value);
                setResults(raw.map(normaliseEntity).filter(Boolean) as SearchResult[]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const handleOpenChange = (o: boolean) => {
        onOpenChange(o);
        if (!o) { setQuery(''); setResults([]); }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add to section</DialogTitle>
                </DialogHeader>

                <div className="relative mt-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <Input
                        value={query}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Search movies, shows, people…"
                        className="pl-9"
                        autoFocus
                    />
                    {isSearching && <Spinner className="absolute right-3 top-2.5 text-zinc-400" />}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-0.5">
                    {query.length < 2 && (
                        <p className="text-sm text-zinc-400 text-center py-8">Type at least 2 characters…</p>
                    )}
                    {query.length >= 2 && !isSearching && results.length === 0 && (
                        <p className="text-sm text-zinc-400 text-center py-8">No results found</p>
                    )}
                    {results.map(r => {
                        const key = `${r.media_type}-${r.id}`;
                        const added = existingIds.has(key);
                        const Icon = ICONS[r.media_type];
                        return (
                            <button
                                key={key}
                                type="button"
                                disabled={added || atLimit}
                                onClick={() => !added && !atLimit && onAdd(r)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                    {r.poster_path ? (
                                        <Image src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} alt={r.title} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{r.title}</p>
                                    <p className="text-[11px] text-zinc-400 capitalize">
                                        {r.media_type}{r.subtitle ? ` · ${r.subtitle}` : ''}
                                    </p>
                                </div>
                                {added && <span className="text-[10px] text-zinc-400 shrink-0">Added</span>}
                            </button>
                        );
                    })}
                </div>

                {atLimit && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center pt-1">
                        Section is full ({itemLimit}/{itemLimit} items)
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* ─── Item Card ──────────────────────────────────────────────────── */

function ItemCard({ item, onRemove }: { item: LocalItem; onRemove: () => void }) {
    return (
        <div className="flex flex-col items-center gap-1.5 w-24 shrink-0">
            <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                {item.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-7 h-7 text-zinc-400 opacity-30" />
                    </div>
                )}
            </div>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 text-center leading-tight line-clamp-2 w-full px-0.5">
                {item.title}
            </p>
            <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-[10px]"
                title="Remove"
            >
                <Trash2 className="w-3 h-3" />
                Remove
            </button>
        </div>
    );
}

/* ─── Section Card ───────────────────────────────────────────────── */

function SectionCard({
    section,
    itemLimit,
    isDragging,
    isDragTarget,
    onTitleChange,
    onDelete,
    onItemAdd,
    onItemRemove,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: {
    section: LocalSection;
    itemLimit: number;
    isDragging: boolean;
    isDragTarget: boolean;
    onTitleChange: (id: string, title: string) => void;
    onDelete: (id: string) => void;
    onItemAdd: (sectionId: string, result: SearchResult) => void;
    onItemRemove: (sectionId: string, itemId: string) => void;
    onDragStart: (id: string) => void;
    onDragOver: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, id: string) => void;
    onDragEnd: () => void;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const existingIds = new Set(section.items.map(i => `${i.media_type}-${i.media_id}`));
    const atLimit = section.items.length >= itemLimit;

    return (
        <div
            ref={cardRef}
            onDragOver={e => onDragOver(e, section.id)}
            onDrop={e => onDrop(e, section.id)}
            onDragEnd={() => {
                if (cardRef.current) cardRef.current.draggable = false;
                onDragEnd();
            }}
            className={`rounded-xl border bg-white dark:bg-zinc-900 p-4 transition-all duration-150 select-none ${
                isDragging
                    ? 'opacity-40 border-zinc-200 dark:border-zinc-800'
                    : isDragTarget
                    ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/30 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800'
            }`}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <GripVertical
                    className="w-4 h-4 text-zinc-400 cursor-grab active:cursor-grabbing shrink-0"
                    onMouseDown={() => {
                        if (cardRef.current) {
                            cardRef.current.draggable = true;
                            cardRef.current.ondragstart = () => onDragStart(section.id);
                        }
                    }}
                />
                <Input
                    value={section.title}
                    onChange={e => onTitleChange(section.id, e.target.value)}
                    placeholder="Section title…"
                    className="h-8 text-sm font-semibold border-transparent bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-950 px-2 flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={atLimit}
                    onClick={() => setSearchOpen(true)}
                    className="gap-1.5 shrink-0 h-8"
                >
                    <Plus className="w-3.5 h-3.5" />
                    {atLimit ? `${itemLimit}/${itemLimit}` : 'Add'}
                </Button>
                <button
                    type="button"
                    onClick={() => onDelete(section.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    title="Delete section"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Items */}
            {section.items.length === 0 ? (
                <div className="flex items-center justify-center py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-400">No items yet — click Add to get started</p>
                </div>
            ) : (
                <div className="flex gap-4 flex-wrap">
                    {section.items.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onRemove={() => onItemRemove(section.id, item.id)}
                        />
                    ))}
                </div>
            )}

            <SearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                onAdd={result => onItemAdd(section.id, result)}
                existingIds={existingIds}
                itemCount={section.items.length}
                itemLimit={itemLimit}
            />
        </div>
    );
}

/* ─── Main Editor ────────────────────────────────────────────────── */

export function ProfileSectionsEditor({ initialSections, tier, onDirty, ref }: Props) {
    const limits = TIER_LIMITS[tier];
    const [sections, setSections] = useState<LocalSection[]>(() => initialSections.map(toLocalSection));
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragTargetId, setDragTargetId] = useState<string | null>(null);
    const initialSnapshot = useRef(JSON.stringify(initialSections.map(toLocalSection)));
    const onDirtyRef = useRef(onDirty);
    onDirtyRef.current = onDirty;

    useImperativeHandle(ref, () => ({
        getSections: () => sections,
        isDirty: () => JSON.stringify(sections) !== initialSnapshot.current,
    }));

    const mutate = (fn: (prev: LocalSection[]) => LocalSection[]) => {
        setSections(fn);
        onDirtyRef.current();
    };

    /* ── Drag-and-drop ── */
    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (id !== draggingId) setDragTargetId(id);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggingId || draggingId === targetId) return;
        mutate(prev => {
            const from = prev.findIndex(s => s.id === draggingId);
            const to   = prev.findIndex(s => s.id === targetId);
            if (from === -1 || to === -1) return prev;
            const next = [...prev];
            const [removed] = next.splice(from, 1);
            next.splice(to, 0, removed);
            return next.map((s, i) => ({ ...s, rank: i + 1 }));
        });
    };

    const handleDragEnd = () => {
        setDraggingId(null);
        setDragTargetId(null);
    };

    /* ── Section ops ── */
    const handleAddSection = () => {
        if (sections.length >= limits.sections) return;
        mutate(prev => [
            ...prev,
            { id: tmpId(), title: 'Untitled Section', rank: prev.length + 1, items: [] },
        ]);
    };

    const handleTitleChange = useCallback((id: string, title: string) => {
        mutate(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDeleteSection = useCallback((id: string) => {
        mutate(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, rank: i + 1 })));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Item ops ── */
    const handleItemAdd = useCallback((sectionId: string, result: SearchResult) => {
        mutate(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            if (s.items.some(i => i.media_type === result.media_type && i.media_id === result.id)) return s;
            if (s.items.length >= limits.items) return s;
            return {
                ...s,
                items: [...s.items, {
                    id: tmpId(),
                    media_type: result.media_type,
                    media_id: result.id,
                    title: result.title,
                    poster_path: result.poster_path,
                }],
            };
        }));
    }, [limits.items]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleItemRemove = useCallback((sectionId: string, itemId: string) => {
        mutate(prev => prev.map(s =>
            s.id !== sectionId ? s : { ...s, items: s.items.filter(i => i.id !== itemId) }
        ));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const atSectionLimit = sections.length >= limits.sections;

    return (
        <div className="space-y-3">
            {sections.map(section => (
                <SectionCard
                    key={section.id}
                    section={section}
                    itemLimit={limits.items}
                    isDragging={draggingId === section.id}
                    isDragTarget={dragTargetId === section.id}
                    onTitleChange={handleTitleChange}
                    onDelete={handleDeleteSection}
                    onItemAdd={handleItemAdd}
                    onItemRemove={handleItemRemove}
                    onDragStart={setDraggingId}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                />
            ))}

            <button
                type="button"
                onClick={handleAddSection}
                disabled={atSectionLimit}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors ${
                    atSectionLimit
                        ? 'border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300'
                }`}
            >
                <Plus className="w-4 h-4" />
                {atSectionLimit
                    ? `${limits.sections}/${limits.sections} sections (upgrade for more)`
                    : 'Add Section'}
            </button>
        </div>
    );
}