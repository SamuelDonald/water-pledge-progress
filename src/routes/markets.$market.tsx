import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Compass, Home as HomeIcon } from "lucide-react";
import { locationImages } from "@/lib/navalhomes";

export const Route = createFileRoute("/markets/$market")({
  head: ({ params }) => {
    const market = marketStories[params.market];
    return { meta: [{ title: market ? market.metaTitle : "Texas Markets — Liberty Crest Realty" }, { name: "description", content: market?.metaDescription ?? "Explore Texas communities and share your property goals with Liberty Crest Realty." }] };
  },
  component: MarketStoryPage,
});

const marketStories = {
  dallas: {
    name: "Dallas",
    region: "Dallas–Fort Worth",
    metaTitle: "Discover Dallas–Fort Worth | Liberty Crest Realty",
    metaDescription: "Explore the character of Dallas–Fort Worth and share the home or property opportunity you are looking for with Liberty Crest Realty.",
    hero: locationImages.Dallas,
    intro: "Room for your next chapter.",
    lead: "A home search is about more than an address. It is about the pace of your mornings, the neighborhood you return to, and the space you want to grow into. Across Dallas–Fort Worth, city energy meets established residential streets, newer communities, and a wide variety of home styles.",
    paragraphs: [
      { title: "A city with many ways to feel at home", body: "Dallas–Fort Worth brings together walkable pockets, quiet residential streets, contemporary developments, and long-established communities. Whether you picture a low-maintenance townhome, a family home with a little more breathing room, or an investment property, the right fit starts with understanding what matters most to you." },
      { title: "Find your own rhythm", body: "From the cultural energy and dining of the urban core to leafy streets and neighborhood gathering places across the wider metro, the region offers different rhythms of daily life. Think about the commute you can live with, the places you want nearby, the kind of outdoor space you enjoy, and the community that feels right for this stage of life." },
      { title: "A more considered way to find a property", body: "Liberty Crest Realty starts with your brief rather than asking you to sort through a catalogue that may not match your needs. Tell us your preferred home type, price range, timing, and target community. Our team reviews the request and follows up about potential opportunities and practical next steps." },
    ],
    gallery: [
      { src: locationImages.Dallas, alt: "Contemporary residential architecture in a warm, natural setting", caption: "Modern lines and welcoming spaces" },
      { src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85", alt: "Light-filled living room with contemporary finishes", caption: "Spaces to settle into" },
      { src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85", alt: "Inviting modern home interior", caption: "Comfort with considered detail" },
      { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85", alt: "House exterior with landscaped surroundings", caption: "A place to make your own" },
      { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85", alt: "Warm, carefully styled residential interior", caption: "Everyday living, thoughtfully imagined" },
    ],
    highlights: ["Established neighborhoods and newer communities", "A broad mix of home styles and property types", "Urban amenities alongside quieter residential pockets"],
    close: "Let’s find the part of Dallas–Fort Worth that feels like your next chapter.",
  },
  houston: {
    name: "Houston",
    region: "Greater Houston",
    metaTitle: "Discover Greater Houston | Liberty Crest Realty",
    metaDescription: "Explore Greater Houston's residential character and tell Liberty Crest Realty what kind of property would fit your plans.",
    hero: locationImages.Houston,
    intro: "Space to live your way.",
    lead: "Greater Houston is a collection of distinct communities, each with its own feel. From energetic city neighborhoods to tree-lined residential streets and spacious suburban settings, the region offers many different ideas of what home can look like.",
    paragraphs: [
      { title: "A mosaic of neighborhoods", body: "Houston's scale is part of its character: different districts and surrounding communities offer different routines, home styles, and ways to spend a day. Some buyers are drawn to an active urban setting; others want a little more room, a calmer street, or easier access to the places that anchor everyday life." },
      { title: "Comfort, connection, and room to grow", body: "When choosing where to live, the small details matter. Consider the feel of the street, access to work and daily essentials, outdoor space, and whether you prefer a close-in neighborhood or a more spacious setting. Sharing these preferences helps turn a broad search into a more useful conversation." },
      { title: "Start with what matters to you", body: "Liberty Crest Realty uses a guided request process to understand your priorities before discussing possible opportunities. Share your target budget, property type, intended use, timeline, and preferred part of Greater Houston. Our team reviews your brief and contacts you about possible matches and next steps." },
    ],
    gallery: [
      { src: locationImages.Houston, alt: "Residential architecture with warm natural light", caption: "A welcoming place to land" },
      { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85", alt: "Contemporary home with an inviting exterior", caption: "A home with room to breathe" },
      { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85", alt: "Elegant residential interior with neutral finishes", caption: "Simple, considered interiors" },
      { src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85", alt: "Bright living space with open sightlines", caption: "Light-filled everyday spaces" },
      { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85", alt: "Comfortable residential living area", caption: "Comfort in the details" },
    ],
    highlights: ["Distinct urban, suburban, and residential communities", "Choices across different home styles and layouts", "Space to prioritize commute, lifestyle, and neighborhood feel"],
    close: "Tell us what home means to you in Greater Houston, and we’ll take it from there.",
  },
  "rio-grande-valley": {
    name: "Rio Grande Valley",
    region: "South Texas",
    metaTitle: "Discover the Rio Grande Valley | Liberty Crest Realty",
    metaDescription: "Explore the welcoming communities of the Rio Grande Valley and share your property goals with Liberty Crest Realty.",
    hero: locationImages["Rio Grande Valley"],
    intro: "A warmer kind of homecoming.",
    lead: "In the Rio Grande Valley, home can mean familiar community ties, sunlit days, local character, and a pace that feels personal. From McAllen and Edinburg to Brownsville and Harlingen, the Valley brings together growing cities and established neighborhoods across South Texas.",
    paragraphs: [
      { title: "Community is part of the landscape", body: "The Valley's sense of place is shaped by its South Texas roots, strong local identity, and communities where everyday connections matter. Each city has its own character, so the right starting point may be a particular neighborhood, proximity to family, work, schools, or the amenities you use most." },
      { title: "Different homes for different plans", body: "Whether you are looking for a first home, a place with more space, a second home, or an investment opportunity, it helps to be clear about your priorities. Think about the layout you need, how you plan to use the property, your budget, and how soon you hope to move." },
      { title: "A personal route to potential opportunities", body: "Liberty Crest Realty is built around understanding the buyer's brief first. Submit your preferred Valley city or neighborhood and the type of opportunity you have in mind. Our team will review the details and follow up about potential next steps, including direct-purchase or contractual-rights conversations where appropriate." },
    ],
    gallery: [
      { src: locationImages["Rio Grande Valley"], alt: "Residential home exterior framed by greenery", caption: "A welcoming South Texas setting" },
      { src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85", alt: "Bright home interior with a relaxed atmosphere", caption: "A calm place to return to" },
      { src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85", alt: "Thoughtfully styled living room", caption: "Everyday comfort" },
      { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85", alt: "Modern home with outdoor landscaping", caption: "Outdoor space and possibility" },
      { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85", alt: "Warm residential interior with natural textures", caption: "Room for your own story" },
    ],
    highlights: ["McAllen, Edinburg, Brownsville, Harlingen, and nearby communities", "A strong local identity and a variety of residential settings", "Options to explore around your own budget and timeline"],
    close: "Let’s talk about the community and property that could fit your plans in the Valley.",
  },
} as const;

function MarketStoryPage() {
  const { market: slug } = Route.useParams();
  const market = marketStories[slug as keyof typeof marketStories];
  if (!market) throw notFound();

  return <main className="min-h-screen bg-[#f5f3ee] text-[#171716]">
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 text-white lg:px-10">
      <Link to="/" className="font-serif text-2xl sm:text-3xl">Liberty Crest Realty</Link>
      <Link to="/" className="text-xs uppercase tracking-[.14em]"><ArrowLeft className="mr-2 inline size-4" />All markets</Link>
    </header>

    <section className="relative flex min-h-[76vh] items-end overflow-hidden bg-[#171716] text-white">
      <img src={market.hero} alt={market.name + " residential architecture"} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-36 lg:px-10 lg:pb-20">
        <p className="eyebrow text-white/70"><MapPin className="mr-2 inline size-3.5" />{market.region}</p>
        <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.5rem,8.5vw,7.8rem)] leading-[.88] tracking-[-.045em]">{market.name}<br /><i>{market.intro}</i></h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{market.lead}</p>
        <Link to="/find-a-home" search={{ market: market.name }} className="mt-8 inline-flex items-center bg-white px-7 py-4 text-xs uppercase tracking-[.15em] text-black transition hover:bg-[#e9e6de]">Start a property request <ArrowRight className="ml-3 size-4" /></Link>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[.7fr_1.3fr] lg:gap-20 lg:py-24">
      <div><p className="eyebrow">The feel of the place</p><h2 className="section-title mt-4">Find a setting<br /><i>that feels like you.</i></h2><p className="mt-5 text-sm leading-7 text-black/55">The right location is personal. Use this page to imagine the setting, then tell us what you need so the conversation can focus on your priorities.</p></div>
      <div className="space-y-6">{market.paragraphs.map((paragraph) => <article key={paragraph.title} className="border-t border-black/10 pt-5"><h3 className="font-serif text-2xl sm:text-3xl">{paragraph.title}</h3><p className="mt-3 text-sm leading-7 text-black/60">{paragraph.body}</p></article>)}</div>
    </section>

    <section className="bg-[#e9e6de] px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">A glimpse of residential life</p><h2 className="section-title mt-3">Imagine the<br /><i>possibilities.</i></h2></div><p className="max-w-md text-sm leading-7 text-black/55">Explore a range of residential styles and spaces as you think about what would make a place feel like home.</p></div>
        <div className="mt-9 grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] sm:gap-4 lg:grid-cols-6">
          {market.gallery.map((photo, index) => <figure key={photo.src + index} className={"group relative overflow-hidden bg-black " + (index === 0 ? "col-span-2 row-span-2 min-h-[440px] sm:min-h-[520px] lg:col-span-3" : index === 1 || index === 4 ? "col-span-2 lg:col-span-3" : "col-span-1 lg:col-span-1")}>
            <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm text-white sm:p-5">{photo.caption}</figcaption>
          </figure>)}
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
      <div><p className="eyebrow">A more personal process</p><h2 className="section-title mt-4">Your brief comes<br /><i>before the search.</i></h2><p className="mt-5 max-w-xl text-sm leading-7 text-black/60">Liberty Crest Realty is designed to start with the person, not just a property card. Share what you want, where you want to be, and the path you are considering. We review your request and follow up about possible opportunities and practical next steps.</p><p className="mt-4 max-w-xl text-sm leading-7 text-black/60">Depending on the opportunity, the conversation may involve a direct purchase or an interest in contractual rights. Those are different paths with different considerations: nothing is guaranteed by submitting a request, and any contractual arrangement should be reviewed carefully with independent legal and financial professionals before you commit.</p></div>
      <div className="bg-white p-7 shadow-sm sm:p-10"><p className="eyebrow">What happens next</p><div className="mt-7 space-y-6"><div className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center bg-[#e9e6de]"><HomeIcon className="size-5" /></span><div><h3 className="font-serif text-xl">1. Share your priorities</h3><p className="mt-2 text-sm leading-6 text-black/55">Tell us your property type, budget, timing, and preferred location.</p></div></div><div className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center bg-[#e9e6de]"><Compass className="size-5" /></span><div><h3 className="font-serif text-xl">2. We review the brief</h3><p className="mt-2 text-sm leading-6 text-black/55">Our team considers your preferences and what kind of conversation may be useful.</p></div></div><div className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center bg-[#e9e6de]"><CheckCircle2 className="size-5" /></span><div><h3 className="font-serif text-xl">3. An agent follows up</h3><p className="mt-2 text-sm leading-6 text-black/55">We contact you to discuss potential next steps. A request does not guarantee availability or a transaction.</p></div></div></div><Link to="/find-a-home" search={{ market: market.name }} className="mt-8 inline-flex w-full items-center justify-center bg-black px-6 py-4 text-xs uppercase tracking-[.15em] text-white transition hover:bg-black/80">Request a property in {market.name} <ArrowRight className="ml-3 size-4" /></Link></div>
    </section>

    <section className="bg-[#171716] px-6 py-16 text-white lg:px-10 lg:py-20"><div className="mx-auto max-w-7xl"><p className="eyebrow text-white/50">Why start here</p><h2 className="section-title mt-3 text-white">A search shaped<br /><i>around you.</i></h2><div className="mt-9 grid gap-4 sm:grid-cols-3">{market.highlights.map((highlight) => <div key={highlight} className="border-t border-white/20 pt-5"><CheckCircle2 className="size-5 text-white/65" /><p className="mt-4 font-serif text-xl">{highlight}</p></div>)}</div><div className="mt-10 flex flex-col justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-end"><p className="max-w-2xl font-serif text-2xl leading-snug sm:text-3xl">{market.close}</p><Link to="/find-a-home" search={{ market: market.name }} className="inline-flex w-fit shrink-0 items-center bg-white px-7 py-4 text-xs uppercase tracking-[.15em] text-black">Tell us what you need <ArrowRight className="ml-3 size-4" /></Link></div></div></section>

    <footer className="flex flex-col gap-4 bg-[#171716] px-6 py-7 text-[10px] uppercase tracking-[.15em] text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 Liberty Crest Realty · {market.region}</span><div className="flex flex-wrap gap-5"><Link to="/" className="hover:text-white">All markets</Link><Link to="/submit-property" className="hover:text-white">Submit a property</Link></div></footer>
  </main>;
}
