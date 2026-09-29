import { createServerFn } from "@tanstack/react-start";
export const submitInquiry=createServerFn({method:"POST"}).inputValidator((data:any)=>({propertyId:data.propertyId?String(data.propertyId):null,name:String(data.name??"").trim().slice(0,120),phone:String(data.phone??"").trim().slice(0,40),email:String(data.email??"").trim().toLowerCase().slice(0,254),message:String(data.message??"").trim().slice(0,2000),allowPhone:Boolean(data.allowPhone),allowSms:Boolean(data.allowSms),allowWhatsapp:Boolean(data.allowWhatsapp)})).handler(async({data})=>{
 if(data.name.length<2||!data.phone||!data.email||!data.message) throw new Error("INVALID_INQUIRY");
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
 const {error}=await supabaseAdmin.from("inquiries").insert({property_id:data.propertyId,name:data.name,phone:data.phone,email:data.email,message:data.message,allow_phone:data.allowPhone,allow_sms:data.allowSms,allow_whatsapp:data.allowWhatsapp});
 if(error) throw new Error(error.message);
 const token=process.env["WHATSAPP_ACCESS_TOKEN"],phoneId=process.env["WHATSAPP_PHONE_NUMBER_ID"],to=process.env["WHATSAPP_TO"];
 if(token&&phoneId&&to){const text=["New NavalHomes inquiry",`Name: ${data.name}`,`Phone: ${data.phone}`,`Email: ${data.email}`,`Message: ${data.message}`,`Phone permission: ${data.allowPhone?"Yes":"No"}`,`SMS permission: ${data.allowSms?"Yes":"No"}`,`WhatsApp permission: ${data.allowWhatsapp?"Yes":"No"}`].join("\n");await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to,type:"text",text:{body:text}})});}
 return {ok:true};
});