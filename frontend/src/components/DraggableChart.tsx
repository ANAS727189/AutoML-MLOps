"use client"

import React, { useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DraggableChartProps {
  id: string
  type: string
  filename: string
  columns: string[]
}

export default function DraggableChart({ id, type, filename, columns }: DraggableChartProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedX, setSelectedX] = useState(columns[0] || '')
  const [selectedY, setSelectedY] = useState(columns[1] || '')
  const [chartImage, setChartImage] = useState<string | null>(null)

  const [, drag] = useDrag({
    type: 'chart',
    item: { id, type: 'chart' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })


  useEffect(() => {
    if (selectedX && selectedY) {
      fetchChart()
    }
  }, [selectedX, selectedY, type, filename])

  const fetchChart = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/generate-graph/${filename}?graphType=${type}&xColumn=${selectedX}&yColumn=${selectedY}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.status === 'success') {
        setChartImage(`data:image/png;base64,${data.image}`)
      } else {
        console.error('Error generating chart:', data.message)
      }
    } catch (error) {
      console.error('Error fetching chart:', error)
    }
  }

  const ref = React.useRef<HTMLDivElement>(null);
    drag(ref);
  
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: 'move',
      }}
      onMouseDown={(e) => {
        const startX = e.pageX - position.x
        const startY = e.pageY - position.y
        const onMouseMove = (e: MouseEvent) => {
          setPosition({
            x: e.pageX - startX,
            y: e.pageY - startY,
          })
        }
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }}
    >
      <Card className="w-[600px] text-white bg-black shadow-slate-950 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">{type.charAt(0).toUpperCase() + type.slice(1)} Chart</CardTitle>
          <div className="flex space-x-2">
            <Select value={selectedX} onValueChange={setSelectedX}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="X Axis" />
              </SelectTrigger>
              <SelectContent>
                {columns.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedY} onValueChange={setSelectedY}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Y Axis" />
              </SelectTrigger>
              <SelectContent>
                {columns.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {chartImage && <img src={chartImage} alt="Chart" className="w-full h-auto" />}
        </CardContent>
      </Card>
    </div>
  )
}