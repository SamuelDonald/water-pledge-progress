import { listPublishedProperties, getPublishedProperty } from "@/lib/navalhomes.functions";

export type Property = {
  id:string; slug:string; title:string;
  location:"Dallas"|"Houston"|"Rio Grande Valley"; city:string;
  status:"For Sale"|"For Rent"|"Sold"|"Rented";
  property_type:"House"|"Condo"|"Apartment"|"Multi-family"|"Land"|"Commercial"|"Mixed-use"|"Other";
  opportunity_type?:"contract_assignment"|"direct_purchase"|"seller_introduction"|null;
  contract_rights_verified?:boolean;
  written_disclosures_verified?:boolean;
  price:number; bedrooms:number; bathrooms:number; sqft:number; lot_size:number|null;
  description:string; neighborhood:string|null; address?:string|null;
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

export async function getProperties():Promise<Property[]> {
  try { return (await listPublishedProperties()) as Property[]; } catch { return []; }
}

export async function getPropertyBySlug(slug:string):Promise<Property|null> {
  try { return (await getPublishedProperty({ data: { slug } })) as Property | null; } catch { return null; }
}
