
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="max-w-lg mx-auto mt-10">
        <Card>
            <CardHeader>
                NewFlight
            </CardHeader>
            
        </Card>
    </div>
    );
}


