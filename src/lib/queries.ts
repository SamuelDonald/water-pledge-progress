import { queryOptions } from "@tanstack/react-query";
import {
  getCampaignDetail,
  getCampaigns,
  getHome,
  getMapData,
  getStories,
  getStory,
  getTransparency,
} from "./content.functions";

export const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHome(),
});

export const campaignsQuery = queryOptions({
  queryKey: ["campaigns"],
  queryFn: () => getCampaigns(),
});

export const campaignQuery = (slug: string) =>
  queryOptions({
    queryKey: ["campaign", slug],
    queryFn: () => getCampaignDetail({ data: { slug } }),
  });

export const storiesQuery = queryOptions({
  queryKey: ["stories"],
  queryFn: () => getStories(),
});

export const storyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["story", slug],
    queryFn: () => getStory({ data: { slug } }),
  });

export const mapQuery = queryOptions({
  queryKey: ["map"],
  queryFn: () => getMapData(),
});

export const transparencyQuery = queryOptions({
  queryKey: ["transparency"],
  queryFn: () => getTransparency(),
});
