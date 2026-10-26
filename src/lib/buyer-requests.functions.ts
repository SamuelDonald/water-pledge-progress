import { createServerFn } from "@tanstack/react-start";

const marketOptions = ["Dallas", "Houston", "Rio Grande Valley"];
const valid = (v: unknown, list: readonly string[]) => typeof v === "string" && list.includes(v);
const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export type BuyerRequestInput = {
  homeType: string; priceRange: string; use: string; military: string; branch: string; downPayment: string;
  journey: string; credit: string; employment: string; income: string; timeline: string; path: string;
  markets: string[]; city: string; area: string; notes: string; name: string; email: string; phone: string; contactConsent: boolean;
};

export const submitBuyerRequest = createServerFn({ method: "POST" })
  .inputValidator((d: BuyerRequestInput) => ({
    homeType: clean(d.homeType, 80), priceRange: clean(d.priceRange, 80), use: clean(d.use, 80),
    military: clean(d.military, 80), branch: clean(d.branch, 80), downPayment: clean(d.downPayment, 80),
    journey: clean(d.journey, 80), credit: clean(d.credit, 80), employment: clean(d.employment, 100),
    income: clean(d.income, 80), timeline: clean(d.timeline, 80), path: clean(d.path, 100),
    markets: Array.isArray(d.markets) ? d.markets.filter((x) => valid(x, marketOptions)).slice(0, 3) : [],
    city: clean(d.city, 160), area: clean(d.area, 160), notes: clean(d.notes, 2000),
    name: clean(d.name, 120), email: clean(d.email, 254).toLowerCase(), phone: clean(d.phone, 40),
    contactConsent: d.contactConsent === true,
  }))
  .handler(async ({ data }) => {
    const enumValues = {
      homeType: ["Single-family home", "Townhouse or duplex", "Condo", "Multi-family property", "Land or other", "Not sure yet"],
      priceRange: ["Under $100,000", "$100,000–$149,999", "$150,000–$199,999", "$200,000–$300,000", "$300,001–$400,000", "$400,001–$500,000", "Over $500,000", "Flexible / not sure"],
      use: ["Primary residence", "Second home", "Rental or investment property", "Other / undecided"],
      military: ["No", "Active duty", "Reserve or National Guard", "Veteran", "Prefer not to say"],
      downPayment: ["0% / no down payment planned", "1–4%", "5–10%", "11–20%", "More than 20%", "Not sure yet"],
      journey: ["Looking around", "Getting serious", "Ready to buy"],
      timeline: ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "6–12 months", "More than 12 months", "No specific timeline"],
      path: ["Traditional home purchase", "Explore contractual rights to a property", "Open to both", "Need more information"],
    };
    if (!valid(data.homeType, enumValues.homeType) || !valid(data.priceRange, enumValues.priceRange) ||
      !valid(data.use, enumValues.use) || !valid(data.military, enumValues.military) ||
      !valid(data.downPayment, enumValues.downPayment) || !valid(data.journey, enumValues.journey) ||
      !valid(data.timeline, enumValues.timeline) || !valid(data.path, enumValues.path) ||
      !data.markets.length || data.name.length < 2 || !/^\S+@\S+\.\S+$/.test(data.email) ||
      data.phone.replace(/\D/g, "").length < 7 || !data.contactConsent) {
      throw new Error("Please check your answers and contact details.");
    }
    const branchOptions = ["Army", "Navy", "Air Force", "Marine Corps", "Space Force", "Coast Guard", "Other", "Prefer not to say"];
    const creditOptions = ["Below 580", "580–619", "620–639", "640–699", "700–749", "750 or higher", "Not sure", "Prefer not to say"];
    const employmentOptions = ["Employed full-time", "Employed part-time", "Self-employed / business owner", "Contractor / freelance", "Retired", "Not currently employed", "Other / prefer not to say"];
    const incomeOptions = ["Under $25,000", "$25,000–$49,999", "$50,000–$74,999", "$75,000–$99,999", "$100,000–$149,999", "$150,000 or more", "Not sure / prefer not to say"];
    if (data.branch && !branchOptions.includes(data.branch)) throw new Error("Invalid branch selection.");
    if (data.credit && !creditOptions.includes(data.credit)) throw new Error("Invalid credit score selection.");
    if (data.employment && !employmentOptions.includes(data.employment)) throw new Error("Invalid employment selection.");
    if (data.income && !incomeOptions.includes(data.income)) throw new Error("Invalid income selection.");
    if (["Active duty", "Reserve or National Guard", "Veteran"].includes(data.military) && !data.branch) throw new Error("Please select a branch of service.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await (supabaseAdmin as any).from("buyer_requests").insert({
      home_type: data.homeType, price_range: data.priceRange, intended_use: data.use,
      military_status: data.military, military_branch: data.branch || null, down_payment_range: data.downPayment,
      buying_journey: data.journey, credit_score_range: data.credit || null, employment_situation: data.employment || null,
      annual_income_range: data.income || null, timeline: data.timeline, opportunity_path: data.path,
      preferred_markets: data.markets, preferred_city: data.city || null, preferred_area: data.area || null,
      additional_notes: data.notes || null, contact_name: data.name, contact_email: data.email,
      contact_phone: data.phone, contact_consent: true, status: "new",
    }).select("id").single();
    if (error) {
      console.error("buyer_request_insert_failed", error.code);
      throw new Error("Could not save your request.");
    }
    return { ok: true, requestId: row.id };
  });
