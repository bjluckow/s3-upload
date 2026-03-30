import { Suspense } from "react";
import HomePageContent from "./content";

export default function Page() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-xl font-semibold">
                    S3 Uploads{" "}
                    <span className="opacity-30">
                        (powered by{" "}
                        <a href="https://pqina.nl" className="underline">
                            pqina.nl
                        </a>
                        )
                    </span>
                </h1>
            </header>
            <Suspense>
                <HomePageContent />
            </Suspense>
        </div>
    );
}
