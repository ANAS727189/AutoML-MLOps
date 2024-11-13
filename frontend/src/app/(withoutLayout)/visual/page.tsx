
"use client"

import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DraggableChart from '@/components/DraggableChart'
import { Maximize2, Minimize2 } from 'lucide-react'

export default function VisualizePage() {
const [csvFiles, setCsvFiles] = useState<string[]>([])
const [selectedCsv, setSelectedCsv] = useState<string>('')
const [columns, setColumns] = useState<string[]>([])
const [charts, setCharts] = useState<{ id: string, type: string }[]>([])
const [isFullscreen, setIsFullscreen] = useState(false)

useEffect(() => {
fetchCsvFiles()
}, [])

useEffect(() => {
if (selectedCsv) {
fetchColumns(selectedCsv)
}
}, [selectedCsv])

const fetchCsvFiles = async () => {
try {
const response = await fetch('http://localhost:3001/api/models')
if (response.ok) {
const data = await response.json()
const csvFiles = data.filter((model: any) => model.name.endsWith('.csv')).map((model: any) => model.name)
setCsvFiles(csvFiles)
}
} catch (error) {
console.error('Error fetching CSV files:', error)
}
}

const fetchColumns = async (filename: string) => {
try {
const response = await fetch(`http://localhost:3001/api/csv-data/${filename}`)
if (response.ok) {
const data = await response.json()
if (data.length > 0) {
setColumns(Object.keys(data[0]))
}
}
} catch (error) {
console.error('Error fetching CSV columns:', error)
}
}

const addChart = (type: string) => {
const newChart = {
id: `chart-${Date.now()}`,
type,
}
setCharts([...charts, newChart])
}

const toggleFullscreen = () => {
setIsFullscreen(!isFullscreen)
}

return (
<div className="mt-8 min-h-screen bg-slate-950 text-white p-8">
<DndProvider backend={HTML5Backend}>
<Card className={`m-4 p-2 bg-slate-900 border-slate-800 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
<CardHeader>
<CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
Data Visualization
</CardTitle>
</CardHeader>
<CardContent>
<div className="mb-6 flex flex-wrap gap-4">
<Select onValueChange={setSelectedCsv}>
<SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
<SelectValue placeholder="Select CSV file" />
</SelectTrigger>
<SelectContent className="bg-slate-800 border-slate-700 text-white">
{csvFiles.map(file => (
<SelectItem key={file} value={file}>{file}</SelectItem>
))}
</SelectContent>
</Select>
<Button onClick={() => addChart('line')} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
Add Line Chart
</Button>
<Button onClick={() => addChart('bar')} variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-none">
Add Bar Chart
</Button>
<Button onClick={() => addChart('scatter')} variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-none">
Add Scatter Plot
</Button>
<Button onClick={toggleFullscreen} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-none">
{isFullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
</Button>
</div>
<div 
className={`relative w-full rounded-lg overflow-auto ${isFullscreen ? 'h-[calc(200vh-200px)]' : 'h-[calc(150vh-300px)]'}`}
style={{
backgroundColor: '#1e293b',
backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
backgroundSize: '20px 20px'
}}
>
{charts.map(chart => (
<DraggableChart
key={chart.id}
id={chart.id}
type={chart.type}
filename={selectedCsv}
columns={columns}
/>
))}
</div>
</CardContent>
</Card>
</DndProvider>
</div>
)
}



