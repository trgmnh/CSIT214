import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function TripsPage() {
    const session = await auth();

    if (!session) {
        return <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
            <div>
                You need to be logged in to view this page
            </div>
        </div>
    }

    return ( 
    <div className="space-y-6 container mx-auto px-4 py-8">
        <h1> Dashboard</h1>
        <Button>New Trip</Button>
    </div>
    );
}


