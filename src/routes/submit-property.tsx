import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createSubmissionUpload, submitPropertySubmission } from "@/lib/submissions.functions";
export const Route=createFileRoute("/submit-property")({
 head:()=>({meta:[{title:"Submit a Property — Liberty Crest Realty"},{name:"description",content:"Submit your Texas property for review by Liberty Crest Realty."},{property:"og:title",content:"Submit a Property — Liberty Crest Realty"},{property:"og:description",content:"Send your property details for private review before listing."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),
 component:SubmitProperty});
const locations=["Dallas","Houston","Rio Grande Valley"];
const types=["House","Condo","Apartment","Multi-family","Land","Commercial","Mixed-use","Other"];
function SubmitProperty(){
 const [files,setFiles]=useState<File[]>([]),[contractFile,setContractFile]=useState<File|null>(null),[rights,setRights]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState<null|{contact:string;whatsapp:boolean}>(null);
 async function uploadOne(file:File,kind:"media"|"contract"){
  const u=await createSubmissionUpload({data:{filename:file.name,kind}});
  const {error}=await supabase.storage.from("property-submissions").uploadToSignedUrl(u.path,u.token,file,{contentType:file.type});
  if(error)throw new Error("Upload failed for "+file.name+". Please try again.");
  return u.path;
 }
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);
  try{
   if(!f.get("preferredContact"))throw new Error("Please choose how you'd like to be contacted.");
   const mediaPaths:string[]=[];
   for(const file of files){
    if(file.size>25*1024*1024)throw new Error("Each photo or video must be 25 MB or smaller.");
    mediaPaths.push(await uploadOne(file,"media"));
   }
   let contractPath:string|null=null;
   if(rights&&contractFile){
    if(contractFile.size>20*1024*1024)throw new Error("Contract document must be 20 MB or smaller.");
    contractPath=await uploadOne(contractFile,"contract");
   }
   const payload:Record<string,unknown>={};f.forEach((v,k)=>{if(typeof v==="string")payload[k]=v;});
   const r=await submitPropertySubmission({data:{...payload,hasContractRights:rights,authorized:f.get("authorized")==="on",whatsappAvailable:f.get("whatsappAvailable")==="on",mediaPaths,contractPath}});
   setDone({contact:r.preferredContact,whatsapp:f.get("whatsappAvailable")==="on"});window.scrollTo({top:0,behavior:"smooth"});
  }catch(e){setError(e instanceof Error?e.message:"Submission failed. Please try again.");}finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-[#f5f3ee] text-[#171716]"><header className="border-b border-black/10 px-6 py-6"><div className="mx-auto flex max-w-7xl justify-between"><Link to="/" className="font-serif text-3xl">Liberty Crest Realty</Link><Link to="/" className="text-xs uppercase tracking-wider"><ArrowLeft className="mr-2 inline size-4"/>Marketplace</Link></div></header>
 <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-20"><aside><p className="eyebrow">Seller intake · Texas</p><h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">Submit your<br/><i>opportunity.</i></h1><p className="mt-6 max-w-md text-sm leading-7 text-black/60">Provide property details, upload photos, and optionally offer contractual rights. All submissions remain private until admin review and approval.</p><div className="mt-8 space-y-4 border-t border-black/10 pt-6 text-sm text-black/60"><p>01. Complete the property details.</p><p>02. Upload photos and optional contract documents.</p><p>03. Liberty Crest Realty reviews the submission before publication.</p></div><p className="mt-8 text-xs leading-5 text-black/45">Contract documents are stored privately. Contract rights are not advertised as available until eligibility and required disclosures are verified.</p></aside>
 <section className="bg-white p-6 shadow-sm md:p-10">{done?<div className="py-14"><CheckCircle2 className="size-12"/><p className="eyebrow mt-6">Submission received</p><h2 className="mt-3 font-serif text-4xl">Thank you.</h2><p className="mt-4 text-sm leading-7 text-black/60">Your submission is pending review and will not appear publicly until approved.</p><Link to="/" className="mt-8 inline-flex bg-black px-6 py-4 text-xs uppercase tracking-wider text-white">Return to marketplace</Link></div>:
 <form onSubmit={submit} className="space-y-9">
 <section><p className="eyebrow">01 / Property details</p><div className="mt-5 grid gap-5 sm:grid-cols-2">
 <label className="field sm:col-span-2">Property title<input required minLength={4} maxLength={180} name="title" placeholder="e.g. Oak Street investment property"/></label>
 <label className="field">Market<select name="location">{locations.map(x=><option key={x}>{x}</option>)}</select></label><label className="field">City<input required name="city"/></label>
 <label className="field">Property type<select name="propertyType">{types.map(x=><option key={x}>{x}</option>)}</select></label><label className="field">Listing intent<select name="listingStatus"><option>For Sale</option><option>For Rent</option></select></label>
 <label className="field">Asking price (USD)<input required type="number" min="0" step="1" name="askingPrice"/></label><label className="field">Neighborhood<input name="neighborhood"/></label>
 <label className="field">Bedrooms<input type="number" min="0" name="bedrooms" defaultValue="0"/></label><label className="field">Bathrooms<input type="number" min="0" step=".5" name="bathrooms" defaultValue="0"/></label>
 <label className="field">Square feet<input type="number" min="0" name="sqft" defaultValue="0"/></label><label className="field">Lot size (acres)<input type="number" min="0" step=".001" name="lotSize"/></label>
 <label className="field sm:col-span-2">Property address (optional; not displayed publicly)<input name="address"/></label><label className="field sm:col-span-2">Description<textarea required name="description" rows={4} maxLength={5000}/></label></div></section>
 <section><p className="eyebrow">02 / Photos and videos</p><label className="mt-4 flex cursor-pointer flex-col items-center border border-dashed border-black/20 p-8 text-center"><Upload className="size-6"/><span className="mt-3 text-sm">Choose photos or videos (up to 20)</span><input className="sr-only" type="file" accept="image/*,video/mp4,video/quicktime" multiple onChange={e=>setFiles(old=>[...old,...Array.from(e.target.files??[])].slice(0,20))}/></label>
 {files.length?<div className="mt-4 space-y-2">{files.map((file,i)=><div key={i} className="flex items-center justify-between border-b border-black/10 py-2 text-sm"><span className="truncate">{file.name}</span><button type="button" onClick={()=>setFiles(old=>old.filter((_,j)=>j!==i))}><X className="size-4"/></button></div>)}</div>:null}</section>
 <section><p className="eyebrow">03 / Seller details</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="field">Full name<input required name="sellerName"/></label><label className="field">Phone<input required name="sellerPhone"/></label><label className="field">Email<input required type="email" name="sellerEmail"/></label><label className="field">Your relationship<select name="sellerRole"><option>Owner</option><option>Authorized representative</option><option>Contract holder</option><option>Wholesaler</option><option>Other</option></select></label></div></section>
 <section className="border-t border-black/10 pt-7"><label className="flex items-start gap-3"><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)} className="mt-1"/><span><strong>I'm offering contractual rights too</strong><span className="mt-1 block text-sm text-black/55">Optional. Contract rights must be reviewed separately.</span></span></label>
 {rights?<div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="field">Contract type<select name="contractType"><option>Purchase agreement</option><option>Assignment agreement</option><option>Other</option></select></label><label className="field">Proposed assignment price (USD)<input required type="number" min="1" name="contractPrice"/></label><label className="field">Contract status<select name="contractStatus"><option>Signed purchase contract</option><option>Assignment rights to verify</option><option>Consent required / pending</option><option>Unsure</option></select></label><label className="field">Private contract document (PDF/image)<input type="file" accept="application/pdf,image/*" onChange={e=>setContractFile(e.target.files?.[0]??null)}/></label><label className="field sm:col-span-2">Notes<textarea name="contractNotes" rows={3}/></label></div>:null}</section>
 <label className="flex items-start gap-3 text-sm leading-6"><input required type="checkbox" name="authorized" className="mt-1"/><span>I confirm I am the owner, authorized representative, or contract holder and may submit these details and files for review.</span></label>
 {error?<p role="alert" className="bg-red-50 p-4 text-sm text-red-800">{error}</p>:null}<button disabled={busy} className="flex w-full items-center justify-center bg-black px-6 py-4 text-xs uppercase tracking-wider text-white disabled:opacity-50">{busy?"Submitting…":"Submit for review"}<ArrowRight className="ml-2 size-4"/></button>
 </form>}</section></div></main>;
}
