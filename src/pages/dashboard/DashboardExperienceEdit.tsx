import { useParams } from "react-router-dom";

export default function DashboardExperienceEdit() {
  const { id } = useParams();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Experience</h1>
      <p className="text-muted-foreground">Editing experience: {id}</p>
    </div>
  );
}
