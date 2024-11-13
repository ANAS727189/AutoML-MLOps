
"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'

interface Step {
name: string
description: string
}

const steps: Step[] = [
{ name: 'Data Preprocessing', description: 'Cleaning and preparing the dataset' },
{ name: 'Feature Engineering', description: 'Creating and selecting relevant features' },
{ name: 'Model Selection', description: 'Choosing the best algorithm for the task' },
{ name: 'Training', description: 'Fitting the model to the training data' },
{ name: 'Evaluation', description: 'Assessing model performance' },
{ name: 'Finalization', description: 'Preparing the model for deployment' },
]

export default function ImprovedTrainingFlowChart({ currentStep = 0 }: { currentStep?: number }) {
return (
<div className="w-full max-w-4xl mx-auto bg-slate-900 rounded-xl shadow-lg p-6 space-y-8">
<h2 className="text-2xl font-bold text-center text-white mb-6">Training Process</h2>
<div className="relative">
{steps.map((step, index) => (
<React.Fragment key={step.name}>
<motion.div
className={`flex items-center mb-8 ${
index === steps.length - 1 ? '' : 'pb-8 border-l-2 border-slate-700'
}`}
initial={{ opacity: 0, x: -50 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.5, delay: index * 0.1 }}
>
<div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 shadow">
<motion.div
initial={{ scale: 0 }}
animate={{ scale: index <= currentStep ? 1 : 0 }}
transition={{ duration: 0.3, delay: index * 0.1 }}
>
{index < currentStep ? (
<CheckCircle className="w-6 h-6 text-green-500" />
) : index === currentStep ? (
<Circle className="w-6 h-6 text-blue-500" />
) : (
<Circle className="w-6 h-6 text-slate-600" />
)}
</motion.div>
</div>
<div className="ml-12">
<h3 className={`text-lg font-semibold mb-1 ${
index <= currentStep ? 'text-white' : 'text-slate-400'
}`}>
{step.name}
</h3>
<p className="text-sm text-slate-400">{step.description}</p>
</div>
</motion.div>
{index < steps.length - 1 && (
<motion.div
className="absolute left-3.5 ml-0.5 w-0.5 h-8 bg-blue-500"
initial={{ scaleY: 0 }}
animate={{ scaleY: index < currentStep ? 1 : 0 }}
transition={{ duration: 0.5 }}
/>
)}
</React.Fragment>
))}
</div>
<motion.div
className="flex justify-center items-center mt-8"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.5 }}
>
<p className="text-slate-300 mr-2">
{currentStep < steps.length ? 'In Progress' : 'Training Complete'}
</p>
{currentStep < steps.length && (
<motion.div
animate={{ rotate: 360 }}
transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
>
<ArrowRight className="w-5 h-5 text-blue-500" />
</motion.div>
)}
</motion.div>
</div>
)
}

