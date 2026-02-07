export default async function Layout({
                                         children,
                                         params,
                                     }: {
    children: React.ReactNode
    params: Promise<{ username: string }>
}) {
    const { username } = await params;

    return (
        <div>
            {children}
        </div>
    )
}