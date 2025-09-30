import { auth } from "@/auth";


export default async function TripsPage() {
    const session = await auth();

    if (!session) {
        return <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
            <div>
                You need to be logged in to view this page
            </div>
        </div>
    }

    return <div>TripsPage</div>;
}