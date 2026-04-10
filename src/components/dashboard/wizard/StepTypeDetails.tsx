import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import type { WizardData } from "./types";

interface Props {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export default function StepTypeDetails({ data, onChange }: Props) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Experience Title</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Sunrise Yoga on the Rooftop"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe what participants can expect..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={data.category} onValueChange={(v) => onChange({ category: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat: any) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Cover Photo</Label>
        {data.coverImagePreview ? (
          <div className="relative w-full max-w-md">
            <img
              src={data.coverImagePreview}
              alt="Cover preview"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => onChange({ coverImage: null, coverImagePreview: null })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload cover photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        )}
      </div>
    </div>
  );
}
