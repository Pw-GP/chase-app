'use client'
import dynamic from 'next/dynamic'
const PasteEmail = dynamic(() => import('./inner'), { ssr: false })
export default function Page() { return <PasteEmail /> }
