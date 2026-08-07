import sanJuan from "@/assets/campaign-san-juan.jpg";
import loiza from "@/assets/campaign-loiza.jpg";
import school from "@/assets/campaign-school.jpg";
import cistern from "@/assets/campaign-cistern.jpg";
import carmen from "@/assets/story-carmen.jpg";
import heroTruck from "@/assets/hero-water-truck.jpg";

export const heroImage = heroTruck;

const campaignImages: Record<string, string> = {
  "water-for-san-juan-families": sanJuan,
  "emergency-water-trucks-for-loiza": loiza,
  "school-water-supply-initiative": school,
  "community-cistern-installation": cistern,
};

const storyImages: Record<string, string> = {
  "carmen-rio-piedras": carmen,
  "don-tito-pinones": loiza,
  "escuela-luis-munoz": school,
  "cisterna-yabucoa": cistern,
};

export function campaignImage(slug: string | null | undefined) {
  if (slug && campaignImages[slug]) return campaignImages[slug];
  return heroTruck;
}

export function storyImage(slug: string | null | undefined) {
  if (slug && storyImages[slug]) return storyImages[slug];
  return heroTruck;
}
