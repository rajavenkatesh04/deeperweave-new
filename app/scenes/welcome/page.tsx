import { Suspense } from 'react';
import { WelcomeScene } from './WelcomeScene';

export default function WelcomePage() {
    return (
        <Suspense>
            <WelcomeScene />
        </Suspense>
    );
}
