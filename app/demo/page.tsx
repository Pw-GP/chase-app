'use client'
import dynamic from 'next/dynamic'
const DemoApp = dynamic(() => import('./demo-inner'), { ssr: false })
export default function DemoPage() { return <DemoApp /> }
