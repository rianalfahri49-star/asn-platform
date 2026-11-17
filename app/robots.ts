import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/",disallow:["/admin","/api/","/akun","/masuk","/lupa-password","/reset-password"]},sitemap:"https://suksescpns.vercel.app/sitemap.xml"};}
