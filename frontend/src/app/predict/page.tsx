
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'

interface Model {
name: string;
}

export default function Predictor() {
const [models, setModels] = useState<Model[]>([]);
const [selectedModel, setSelectedModel] = useState('')
const [features, setFeatures] = useState([])
const [ProblemType, setProblemType] = useState('');
const [TargetColumn, setTargetColumn] = useState('');
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
setProblemType(data.problem_type);
setTargetColumn(data.target_column);
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
<div className="min-h-screen bg-slate-950 text-white p-6">
<motion.h1 
className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent"
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
>
ML Model Predictor
</motion.h1>
<Card className="bg-slate-900 border-slate-800">
<CardHeader>
<CardTitle className="text-3xl font-bold text-white">Make Predictions</CardTitle>
</CardHeader>
<CardContent>
{error && (
<Alert variant="destructive" className="mb-6 bg-red-900 border-red-700 text-white">
<AlertCircle className="h-4 w-4" />
<AlertTitle>Error</AlertTitle>
<AlertDescription>{error}</AlertDescription>
</Alert>
)}
<div className="mb-6">
<Label htmlFor="model-select" className="text-white mb-2 block text-lg font-semibold">Select Model</Label>
<Select onValueChange={handleModelSelect}>
<SelectTrigger className="bg-slate-800 border-slate-700 text-white">
<SelectValue placeholder="Choose a model" />
</SelectTrigger>
<SelectContent className="bg-slate-800 border-slate-700 text-white">
{models
.filter((model) => model.name.endsWith('pkl'))
.map((model) => (
<SelectItem key={model.name} value={model.name}>
{model.name}
</SelectItem>
))
}
</SelectContent>
</Select>
</div>
{features.length > 0 && (
<motion.div 
className="mb-6"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
>
<Card className="bg-slate-800 border-slate-700 mb-6">
<CardContent className="pt-6">
<div className="flex items-center mb-4">
<Info className="w-6 h-6 mr-2 text-blue-400" />
<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Model Information</h2>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<p className="text-sm text-slate-400 mb-1">Type:</p>
<p className="text-lg font-semibold text-blue-300">{ProblemType}</p>
</div>
<div>
<p className="text-sm text-slate-400 mb-1">Target Column:</p>
<p className="text-lg font-semibold text-teal-300">{TargetColumn}</p>
</div>
</div>
</CardContent>
</Card>
<h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Enter Feature Values:</h3>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
{features.map(feature => (
<div key={feature} className="mb-2">
<Label htmlFor={feature} className="text-white mb-2 block text-sm font-medium">{feature}</Label>
<Input
id={feature}
type="text"
onChange={(e) => handleInputChange(feature, e.target.value)}
value={inputData[feature] || ''}
className="bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-blue-400 transition-all duration-200"
/>
</div>
))}
</div>
<Button 
onClick={handlePredict} 
disabled={loading}
className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
>
{loading ? 'Predicting...' : 'Predict'}
</Button>
</motion.div>
)}
{prediction !== null && (
<motion.div 
className="mt-6"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.2 }}
>
<Card className="bg-slate-800 border-slate-700">
<CardContent className="pt-6">
<h3 className="text-xl font-semibold mb-2 text-purple-300">Prediction Result:</h3>
<p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">{prediction}</p>
</CardContent>
</Card>
</motion.div>
)}
</CardContent>
</Card>
</div>
)
}

