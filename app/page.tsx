"use client"

import dynamicImport from "next/dynamic";
export const dynamic = "force-dynamic";
const HomePage = dynamicImport(() => import("./HomePageContent"), { ssr: false });
export default function Page() { return <HomePage /> }
