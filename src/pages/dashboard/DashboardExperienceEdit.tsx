import { useParams } from "react-router-dom";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardExperienceEdit() {
  const { id } = useParams();
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Experience</h1>
        <p className="text-muted-foreground">Editing experience: {id}</p>
      </main>
      <BottomNav />
    </div>
  );
}
