import { supabase } from "@/integrations/supabase/client";

export type Property = {
  id:string; slug:string; title:string;
  location:"Dallas"|"Houston"|"Rio Grande Valley"; city:string;
  status:"For Sale"|"For Rent"|"Sold"|"Rented";
  property_type:"House"|"Condo"|"Apartment"|"Multi-family"|"Land"|"Commercial"|"Mixed-use"|"Other";
  opportunity_type?:"contract_assignment"|"direct_purchase"|"seller_introduction";
  contract_acquisition_price?:number|null;
  contract_rights_verified?:boolean;
  written_disclosures_verified?:boolean;
  price:number; bedrooms:number; bathrooms:number; sqft:number; lot_size:number|null;
  description:string; neighborhood:string|null; address:string|null;
  seller_or_contract_holder_label?:string|null;
  opportunity_summary?:string|null;
  latitude:number|null; longitude:number|null; is_featured:boolean; is_published:boolean;
  created_at?:string;
  media?:{id:string;media_type:"image"|"video";url:string;caption:string|null;sort_order:number}[];
};

export const locationImages = {
  Dallas:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=85",
  Houston:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2400&q=85",
  "Rio Grande Valley":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85",
} as const;

export const fallbackProperties:Property[] = [];

export async function getProperties():Promise<Property[]> {
  const {data,error}=await (supabase as any).from("properties").select("*, property_media(*)").eq("is_published",true).order("is_featured",{ascending:false}).order("created_at",{ascending:false});
  return error || !data?.length ? fallbackProperties : data as unknown as Property[];
}

export async function getPropertyBySlug(slug:string):Promise<Property|null> {
  const {data,error}=await (supabase as any).from("properties").select("*, property_media(*)").eq("slug",slug).eq("is_published",true).maybeSingle();
  if(!error && data) return data as unknown as Property;
  return fallbackProperties.find(p=>p.slug===slug) ?? null;
}
