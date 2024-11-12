"use client"

import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import DraggableChart from '@/components/DraggableChart'

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
    <div className="mt-10">
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen pt-8 ${isFullscreen ? 'fixed top-0 left-0 w-full h-full bg-black z-50' : ''}`}>
        <div className="mb-4 flex space-x-4">
          <Select onValueChange={setSelectedCsv}>
            <SelectTrigger className="w-[200px] text-white">
              <SelectValue placeholder="Select CSV file" />
            </SelectTrigger>
            <SelectContent>
              {csvFiles.map(file => (
                <SelectItem key={file} value={file}>{file}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => addChart('line')}>Add Line Chart</Button>
          <Button onClick={() => addChart('bar')}>Add Bar Chart</Button>
          <Button onClick={() => addChart('scatter')}>Add Scatter Plot</Button>
          {1 && (
            <Button onClick={toggleFullscreen}>Toogle Fullscreen</Button>
          )}
        </div>
        <div 
          className={`relative w-full h-[calc(100vh-120px)] rounded-lg overflow-auto ${isFullscreen ? 'h-full' : ''}`}
          style={{
            backgroundColor: 'black',
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
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
      </div>
    </DndProvider>
    </div>
  )
}