import { supabase } from "../../lib/supabaseClient";

export interface EnquiryInput {
  rentalPlanId: string;
  tournamentId?: string;
  organizationName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  message?: string;
}

const PLATFORM_WHATSAPP_NUMBER = "919400667313"; // country code + number, no symbols

/**
 * Saves the enquiry to the database first (so Super Admin always has a
 * record even if the organizer never actually sends the WhatsApp message),
 * then returns the wa.me deep link pre-filled with the same details.
 */
export async function submitRentalEnquiry(input: EnquiryInput): Promise<{ whatsappUrl: string }> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: plan } = await supabase.from("rental_plans").select("name").eq("id", input.rentalPlanId).single();

  const { error } = await supabase.from("rental_enquiries").insert({
    organizer_id: userData.user.id,
    rental_plan_id: input.rentalPlanId,
    tournament_id: input.tournamentId ?? null,
    organization_name: input.organizationName,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    contact_email: input.contactEmail,
    message: input.message ?? null,
  });
  if (error) throw error;

  const text = [
    `Hi TournamentLive, I'd like to activate a rental plan.`,
    ``,
    `Plan: ${plan?.name ?? "—"}`,
    `Organization: ${input.organizationName}`,
    `Contact: ${input.contactName} (${input.contactPhone})`,
    input.message ? `Note: ${input.message}` : null,
  ].filter(Boolean).join("\n");

  const whatsappUrl = `https://wa.me/${PLATFORM_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  return { whatsappUrl };
}

export async function listOwnEnquiries() {
  const { data, error } = await supabase
    .from("rental_enquiries")
    .select("*, rental_plans(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
