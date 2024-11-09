'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Predictor() {
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [features, setFeatures] = useState([])
  const [inputData, setInputData] = useState({})
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/models')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error('Error fetching models:', error)
      setError('Failed to fetch models. Please try again later.')
    }
  }

  const handleModelSelect = async (modelName: string) => {
    setSelectedModel(modelName)
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:3001/api/model-features/${modelName}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.status === 'success') {
        setFeatures(data.features)


        const emptyInputData = data.features.reduce((acc: any, feature: string) => {
            acc[feature] = ''
            return acc
          }, {})
    
          setInputData(emptyInputData)


      } else {
        throw new Error(data.message || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Error fetching model features:', error)
      setError('Failed to fetch model features. Please try again.')
      setFeatures([])
      setInputData({})
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (feature: string, value: string) => {
    setInputData(prev => ({ ...prev, [feature]: value }))
  }

  const handlePredict = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:3001/api/predict/${selectedModel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData)
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log(data);
      if (data.status === 'success') {
        setPrediction(data.prediction)
      } else {
        throw new Error(data.message || 'Prediction failed')
      }
    } catch (error) {
      console.error('Error making prediction:', error)
      setError('Failed to make prediction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">ML Model Predictor</h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <Label htmlFor="model-select">Select Model</Label>
        <Select onValueChange={handleModelSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map(model => (
              <SelectItem key={model.name} value={model.name}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {features.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Enter Feature Values:</h3>
          {features.map(feature => (
            <div key={feature} className="mb-2">
              <Label htmlFor={feature}>{feature}</Label>
              <Input
                id={feature}
                type="text"
                onChange={(e) => handleInputChange(feature, e.target.value)}
                value={inputData[feature] || ''}
              />
            </div>
          ))}
          <Button onClick={handlePredict} disabled={loading}>
            {loading ? 'Predicting...' : 'Predict'}
          </Button>
        </div>
      )}
      {prediction !== null && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Prediction Result:</h3>
          <p className="text-xl">{prediction}</p>
        </div>
      )}
    </div>
  )
}