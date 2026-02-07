// app/ui/profile/ProfileStats.tsx
import { getProfileCounts } from '@/lib/data/profile-data';
import Link from 'next/link';

export async function ProfileStats({ userId, username }: { userId: string, username: string }) {
    const counts = await getProfileCounts(userId); // Your fetcher

    return (
        <div className="flex items-center justify-between md:justify-start md:gap-8 px-4 md:px-0">
            <StatItem label="Logs" value={counts.logs} href={`/profile/${username}/timeline`} />
            <StatItem label="Followers" value={counts.followers} href={`/profile/${username}/followers`} />
            <StatItem label="Following" value={counts.following} href={`/profile/${username}/following`} />
        </div>
    );
}

function StatItem({ label, value, href }: { label: string, value: number, href: string }) {
    return (
        <Link href={href} className="flex flex-col items-center md:items-start group">
      <span className="font-bold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors">
        {value}
      </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </span>
        </Link>
    );
}
