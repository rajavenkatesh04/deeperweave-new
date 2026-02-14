import { getProfileCounts } from '@/lib/data/profile-data';
import Link from 'next/link';

export async function ProfileStats({ userId, username }: { userId: string, username: string }) {
    const counts = await getProfileCounts(userId);

    return (
        <div className="flex items-center w-full justify-between md:justify-start gap-0 md:gap-10">
            <StatItem label="Logs" value={counts.logs} href={`/profile/${username}/timeline`} />
            <StatItem label="Followers" value={counts.followers} href={`/profile/${username}/followers`} />
            <StatItem label="Following" value={counts.following} href={`/profile/${username}/following`} />
        </div>
    );
}

// Sub-component handles the text layout changes (stacked vs side-by-side)
function StatItem({ label, value, href }: { label: string, value: number, href: string }) {
    return (
        <Link href={href} className="flex flex-col md:flex-row items-center md:gap-1.5 group cursor-pointer">
            <span className="font-bold text-lg md:text-base text-zinc-900 dark:text-zinc-100 group-hover:opacity-80">
                {value}
            </span>
            <span className="text-xs md:text-base text-zinc-500 capitalize group-hover:underline decoration-zinc-400 underline-offset-4">
                {label}
            </span>
        </Link>
    );
}