

export default function authCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
            <p>There was an error verifying your login code.</p>
        </div>
    )
}