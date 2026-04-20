import { supabase } from "@/integrations/supabase/client";
import { Camera } from "lucide-react";
import { toast } from "sonner";

const PhotoUpload = ({ studentId, currentUrl, onUpdate }: { studentId: string; currentUrl?: string; onUpdate: (url: string) => void }) => {
  const upload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${studentId}.${ext}`;
    const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
    if (upErr) return toast.error(upErr.message);
    const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
    const cacheBust = `${urlData.publicUrl}?t=${Date.now()}`;
    const { error } = await supabase.from("students").update({ profile_photo_url: urlData.publicUrl }).eq("id", studentId);
    if (error) return toast.error(error.message);
    toast.success("Photo updated!");
    onUpdate(cacheBust);
  };

  return (
    <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-accent hover:underline">
      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0]); }} />
      <Camera className="h-3 w-3" /> Change photo
    </label>
  );
};
export default PhotoUpload;
