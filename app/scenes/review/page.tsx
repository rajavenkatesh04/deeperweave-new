import { Suspense } from 'react';
import { ReviewScene } from './ReviewScene';

export default function ReviewScenePage() {
    return (
        <Suspense>
            <ReviewScene />
        </Suspense>
    );
}
