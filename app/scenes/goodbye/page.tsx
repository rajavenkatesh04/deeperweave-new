import { Suspense } from 'react';
import { GoodbyeScene } from './GoodbyeScene';

export default function GoodbyePage() {
    return (
        <Suspense>
            <GoodbyeScene />
        </Suspense>
    );
}
