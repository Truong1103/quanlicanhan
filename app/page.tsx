"use client"

import dynamic from "next/dynamic";
export const dynamic = "force-dynamic";
const HomePage = dynamic(() => import("./HomePageContent"), { ssr: false });
export default function Page() { return <HomePage /> }
