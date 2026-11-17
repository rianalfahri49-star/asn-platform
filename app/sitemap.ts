import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{
 const base="https://suksescpns.vercel.app";
 const pages=["","/materi","/latihan","/simulasi","/paket","/peringkat","/kebijakan-privasi","/syarat-ketentuan"] as const;
 return pages.map(path=>({url:base+path,lastModified:new Date(),changeFrequency:path===""?("weekly" as const):("monthly" as const),priority:path===""?1:0.7}));
}
