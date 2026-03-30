import { Suspense } from "react";
import HomePageContent from "./content";

export default function Page() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-xl font-semibold">S3 Uploads</h1>
            </header>
            <Suspense>
                <HomePageContent />
            </Suspense>
        </div>
    );
}