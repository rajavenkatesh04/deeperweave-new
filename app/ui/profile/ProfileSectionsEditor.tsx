'use client';

import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
    createSection,
    updateSectionTitle,
    deleteSection,
    addSectionItem,
    deleteSectionItem,
} from '@/lib/actions/section-actions';
import { searchAll } from '@/lib/actions/media-actions';
import { TierType, TIER_LIMITS, ProfileSectionResolved, SectionItemResolved } from '@/lib/definitions';
import { Entity } from '@/lib/types/tmdb';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    PlusIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    FilmIcon,
    TvIcon,
    UserIcon as PersonIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';
import { Spinner } from '@/components/ui/spinner';

/* ─── Types ─────────────────────────────────────────────────────── */

interface EditorItem {
    id: string;
    media_id: number;
    media_type: 'movie' | 'tv' | 'person';
    rank: number;
    title: string;
    poster_path: string | null;
}

interface EditorSection {
    id: string;
    title: string;
    rank: number;
    items: EditorItem[];
}

interface SearchResult {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title: string;
    poster_path: string | null;
    subtitle?: string;
}

/* ─── Helpers ───────────────────────────────────────────────────── */

function normaliseEntity(entity: Entity): SearchResult | null {
    const mt = (entity as any).media_type as 'movie' | 'tv' | 'person' | undefined;
    if (!mt || !['movie', 'tv', 'person'].includes(mt)) return null;

    if (mt === 'movie' && 'title' in entity) {
        return {
            id: entity.id,
            media_type: 'movie',
            title: entity.title,
            poster_path: entity.poster_path ?? null,
            subtitle: (entity as any).release_date?.slice(0, 4),
        };
    }
    if (mt === 'tv' && 'name' in entity) {
        return {
            id: entity.id,
            media_type: 'tv',
            title: (entity as any).name,
            poster_path: (entity as any).poster_path ?? null,
            subtitle: (entity as any).first_air_date?.slice(0, 4),
        };
    }
    if (mt === 'person' && 'name' in entity) {
        return {
            id: entity.id,
            media_type: 'person',
            title: (entity as any).name,
            poster_path: (entity as any).profile_path ?? null,
            subtitle: (entity as any).known_for_department,
        };
    }
    return null;
}

function toEditorSection(s: ProfileSectionResolved): EditorSection {
    return {
        id: s.id,
        title: s.title,
        rank: s.rank,
        items: s.items.map(item => ({
            id: item.id,
            media_id: item.media_id,
            media_type: item.media_type,
            rank: item.rank,
            title: item.title,
            poster_path: item.poster_path,
        })),
    };
}

const MEDIA_ICONS = {
    movie:  FilmIcon,
    tv:     TvIcon,
    person: PersonIcon,
} as const;

/* ─── Item Chip ─────────────────────────────────────────────────── */

function ItemChip({ item, onRemove }: { item: EditorItem; onRemove: () => void }) {
    const Icon = MEDIA_ICONS[item.media_type];
    const imgPath = item.media_type === 'person'
        ? item.poster_path
        : item.poster_path;

    return (
        <div className="relative group flex flex-col items-center gap-1 w-16 shrink-0">
            <div className="relative w-14 h-20 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {imgPath ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w185${imgPath}`}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-zinc-400" />
                    </div>
                )}
                {/* Remove button on hover */}
                <button
                    onClick={onRemove}
                    className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Remove"
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                </button>
            </div>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 text-center leading-tight line-clamp-2 w-full px-0.5">
                {item.title}
            </p>
        </div>
    );
}

/* ─── Search Dropdown ───────────────────────────────────────────── */

function SearchDropdown({
    onSelect,
    onClose,
}: {
    onSelect: (result: SearchResult) => void;
    onClose: () => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) { setResults([]); return; }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            const raw = await searchAll(value);
            setResults(raw.map(normaliseEntity).filter(Boolean) as SearchResult[]);
            setIsSearching(false);
        }, 400);
    };

    return (
        <div ref={containerRef} className="relative mt-3">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={e => handleChange(e.target.value)}
                    placeholder="Search movies, shows, people…"
                    className="pl-9 pr-4 h-9 text-sm"
                />
                {isSearching && (
                    <Spinner className="absolute right-3 top-2.5 text-zinc-400" />
                )}
            </div>

            {results.length > 0 && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                    {results.slice(0, 6).map(r => {
                        const Icon = MEDIA_ICONS[r.media_type];
                        return (
                            <button
                                key={`${r.media_type}-${r.id}`}
                                onClick={() => { onSelect(r); onClose(); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                            >
                                <div className="relative w-8 h-11 shrink-0 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                    {r.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                                            alt={r.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
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
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Section Card ──────────────────────────────────────────────── */

function SectionCard({
    section,
    itemLimit,
    onTitleSave,
    onDelete,
    onItemAdd,
    onItemRemove,
}: {
    section: EditorSection;
    itemLimit: number;
    onTitleSave: (sectionId: string, title: string) => Promise<void>;
    onDelete: (sectionId: string) => Promise<void>;
    onItemAdd: (sectionId: string, result: SearchResult) => Promise<void>;
    onItemRemove: (sectionId: string, itemId: string) => Promise<void>;
}) {
    const [title, setTitle] = useState(section.title);
    const [showSearch, setShowSearch] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleTitleBlur = () => {
        if (title.trim() === section.title) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onTitleSave(section.id, title), 600);
    };

    const atItemLimit = section.items.length >= itemLimit;

    return (
        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Bars3Icon className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0 cursor-grab" />
                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        placeholder="Section title…"
                        className="h-8 text-sm font-semibold border-transparent bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 px-2"
                    />
                    <button
                        onClick={() => startDeleteTransition(() => onDelete(section.id))}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        title="Delete section"
                    >
                        {isDeleting ? <Spinner /> : <TrashIcon className="w-4 h-4" />}
                    </button>
                </div>

                {/* Items */}
                <div className="flex items-start gap-3 flex-wrap min-h-[5rem]">
                    {section.items.map(item => (
                        <ItemChip
                            key={item.id}
                            item={item}
                            onRemove={() => onItemRemove(section.id, item.id)}
                        />
                    ))}

                    {!atItemLimit && !showSearch && (
                        <button
                            onClick={() => setShowSearch(true)}
                            className="w-14 h-20 rounded-md border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors shrink-0"
                            title="Add item"
                        >
                            <PlusIcon className="w-5 h-5 text-zinc-400" />
                        </button>
                    )}

                    {atItemLimit && (
                        <p className="text-[10px] text-zinc-400 self-center ml-1">
                            {itemLimit}/{itemLimit} items
                        </p>
                    )}
                </div>

                {/* Search */}
                {showSearch && (
                    <SearchDropdown
                        onSelect={result => onItemAdd(section.id, result)}
                        onClose={() => setShowSearch(false)}
                    />
                )}
            </CardContent>
        </Card>
    );
}

/* ─── Main Editor ───────────────────────────────────────────────── */

interface Props {
    initialSections: ProfileSectionResolved[];
    tier: TierType;
}

export function ProfileSectionsEditor({ initialSections, tier }: Props) {
    const limits = TIER_LIMITS[tier];
    const [sections, setSections] = useState<EditorSection[]>(initialSections.map(toEditorSection));
    const [isAdding, startAddTransition] = useTransition();

    const atSectionLimit = sections.length >= limits.sections;

    /* ── Add section ── */
    const handleAddSection = () => {
        startAddTransition(async () => {
            const result = await createSection('Untitled Section');
            if (result.error) { toast.error(result.error); return; }
            setSections(prev => [...prev, { id: result.id, title: 'Untitled Section', rank: prev.length + 1, items: [] }]);
        });
    };

    /* ── Title save ── */
    const handleTitleSave = useCallback(async (sectionId: string, title: string) => {
        const result = await updateSectionTitle(sectionId, title);
        if (result.error) toast.error(result.error);
        else setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title } : s));
    }, []);

    /* ── Delete section ── */
    const handleDelete = useCallback(async (sectionId: string) => {
        const result = await deleteSection(sectionId);
        if (result.error) { toast.error(result.error); return; }
        // Don't call reorderSections inside the state updater — server actions trigger
        // revalidatePath which causes a router update mid-render ("Cannot update Router
        // while rendering"). deleteSection already invalidates the cache, so rank gaps
        // are cosmetic and resolved on the next server fetch.
        setSections(prev => prev.filter(s => s.id !== sectionId).map((s, i) => ({ ...s, rank: i + 1 })));
    }, []);

    /* ── Add item ── */
    const handleItemAdd = useCallback(async (sectionId: string, result: SearchResult) => {
        const res = await addSectionItem(sectionId, result.media_type, result.id);
        if (res.error && res.error !== 'Already in this section') { toast.error(res.error); return; }
        if (res.error === 'Already in this section') { toast.info('Already in this section'); return; }

        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newItem: EditorItem = {
                id: res.id,
                media_id: result.id,
                media_type: result.media_type,
                rank: s.items.length + 1,
                title: result.title,
                poster_path: result.poster_path,
            };
            return { ...s, items: [...s.items, newItem] };
        }));
    }, []);

    /* ── Remove item ── */
    const handleItemRemove = useCallback(async (sectionId: string, itemId: string) => {
        const res = await deleteSectionItem(itemId);
        if (res.error) { toast.error(res.error); return; }
        setSections(prev => prev.map(s =>
            s.id !== sectionId ? s : { ...s, items: s.items.filter(i => i.id !== itemId) }
        ));
    }, []);

    return (
        <div className="space-y-3">
            {sections.map(section => (
                <SectionCard
                    key={section.id}
                    section={section}
                    itemLimit={limits.items}
                    onTitleSave={handleTitleSave}
                    onDelete={handleDelete}
                    onItemAdd={handleItemAdd}
                    onItemRemove={handleItemRemove}
                />
            ))}

            {/* Add section button */}
            <button
                onClick={handleAddSection}
                disabled={atSectionLimit || isAdding}
                className={cn(
                    'w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors',
                    atSectionLimit
                        ? 'border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300'
                )}
            >
                {isAdding ? <Spinner /> : <PlusIcon className="w-4 h-4" />}
                {atSectionLimit
                    ? `${limits.sections}/${limits.sections} sections (upgrade for more)`
                    : 'Add Section'}
            </button>
        </div>
    );
}