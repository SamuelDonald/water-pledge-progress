import { createServerFn } from "@tanstack/react-start";

async function signMedia(admin: any, rows: any[]) {
  for (const p of rows) {
    const media = (p.property_media ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
    for (const m of media) {
      if (m.storage_path) {
        const { data } = await admin.storage.from("property-media").createSignedUrl(m.storage_path, 60 * 60 * 24);
        m.url = data?.signedUrl ?? m.url;
      }
    }
    p.media = media;
    delete p.property_media;
    delete p.address;
  }
  return rows;
}

export const listPublishedProperties = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any).from("properties").select("*, property_media(*)").eq("is_published", true)
    .order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return signMedia(supabaseAdmin, data ?? []);
});

export const getPublishedProperty = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => ({ slug: String(d.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await (supabaseAdmin as any).from("properties").select("*, property_media(*)").eq("slug", data.slug).eq("is_published", true).maybeSingle();
    if (!row) return null;
    return (await signMedia(supabaseAdmin, [row]))[0];
  });

export const submitInquiry=createServerFn({method:"POST"}).inputValidator((data:any)=>({propertyId:data.propertyId?String(data.propertyId):null,name:String(data.name??"").trim().slice(0,120),phone:String(data.phone??"").trim().slice(0,40),email:String(data.email??"").trim().toLowerCase().slice(0,254),message:String(data.message??"").trim().slice(0,2000),allowPhone:Boolean(data.allowPhone),allowSms:Boolean(data.allowSms),allowWhatsapp:Boolean(data.allowWhatsapp)})).handler(async({data})=>{
 if(data.name.length<2||!data.phone||!/^\S+@\S+\.\S+$/.test(data.email)||!data.message) throw new Error("INVALID_INQUIRY");
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
 const {error}=await (supabaseAdmin as any).from("inquiries").insert({property_id:data.propertyId,name:data.name,phone:data.phone,email:data.email,message:data.message,allow_phone:data.allowPhone,allow_sms:data.allowSms,allow_whatsapp:data.allowWhatsapp});
 if(error) throw new Error("Could not save inquiry");
 const token=process.env["WHATSAPP_ACCESS_TOKEN"],phoneId=process.env["WHATSAPP_PHONE_NUMBER_ID"],to=process.env["WHATSAPP_TO"];
 if(token&&phoneId&&to){const text=["New NavalHomes inquiry",`Name: ${data.name}`,`Phone: ${data.phone}`,`Email: ${data.email}`,`Message: ${data.message}`].join("\n");await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to,type:"text",text:{body:text}})}).catch(()=>{});}
 return {ok:true};
});
