import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../../../supabase/types/database.types";

export async function getOwnProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*, roles(name, label)")
    .eq("id", userData.user.id)
    .single();
  if (error) throw error;
  return data as unknown as Profile;
}

export interface UpdateProfileInput {
  fullName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  country?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
}

export async function updateOwnProfile(input: UpdateProfileInput) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      avatar_url: input.avatarUrl,
      phone: input.phone,
    })
    .eq("id", userData.user.id);
  if (error) throw error;

  // Extended preference fields (display_name, bio, website, country,
  // timezone, language, date_format) live in auth.users.user_metadata via
  // updateUser, since they are personalization-only and don't need to be
  // queried/filtered from SQL the way core profile fields do.
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      display_name: input.displayName,
      bio: input.bio,
      website: input.website,
      country: input.country,
      timezone: input.timezone,
      language: input.language,
      date_format: input.dateFormat,
    },
  });
  if (metaError) throw metaError;
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop();
  const path = `${userData.user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { cacheControl: "3600", upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq("id", userData.user.id);
  if (updateError) throw updateError;

  return publicUrlData.publicUrl;
}

export async function deleteAvatar(currentAvatarPath: string) {
  const { error } = await supabase.storage.from("avatars").remove([currentAvatarPath]);
  if (error) throw error;
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userData.user.id);
  }
}
