"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

export default function DocsPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-green-900 text-white p-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        AutoML Documentation
      </motion.h1>

      <Tabs defaultValue="overview" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-slate-950 rounded-lg p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Model Training</TabsTrigger>
          <TabsTrigger value="visualization">Data Visualization</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <motion.div {...fadeIn}>
            <Card className="bg-blue-800/30 border-blue-700">
              <CardHeader>
                <CardTitle>Welcome to AutoML</CardTitle>
                <CardDescription className="text-blue-200">Your one-stop solution for automated machine learning</CardDescription>
              </CardHeader>
              <CardContent>
                <p>AutoML simplifies the process of training and deploying machine learning models. With our intuitive interface, you can:</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>Upload your dataset and train models with a single click</li>
                  <li>Visualize your data and model performance</li>
                  <li>Make predictions using your trained models</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="training">
          <motion.div {...fadeIn}>
            <Card className="bg-blue-800/30 border-blue-700">
              <CardHeader>
                <CardTitle>Model Training</CardTitle>
                <CardDescription className="text-blue-200">Train your machine learning models effortlessly</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-4">
                  <li>
                    <strong>Upload your CSV file:</strong>
                    <p>Use the file upload button to select your dataset in CSV format.</p>
                  </li>
                  <li>
                    <strong>Select target column:</strong>
                    <p>Choose the column you want to predict, or let AutoML automatically detect it.</p>
                  </li>
                  <li>
                    <strong>Train your model:</strong>
                    <p>Click the &quot;Train Model&quot; button and let AutoML handle the rest!</p>
                  </li>
                  <li>
                    <strong>Review results:</strong>
                    <p>Once training is complete, you&apos;ll see performance metrics and can download your model.</p>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="visualization">
          <motion.div {...fadeIn}>
            <Card className="bg-slate-800/30 border-blue-700">
              <CardHeader>
                <CardTitle>Data Visualization</CardTitle>
                <CardDescription className="text-blue-200">Gain insights from your data with interactive charts</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Our visualization tools help you understand your data better:</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>Select from various chart types: line, bar, and scatter plots</li>
                  <li>Drag and drop charts to create custom dashboards</li>
                  <li>Interact with charts to explore data relationships</li>
                  <li>Export visualizations for presentations or reports</li>
                </ul>
                <p className="mt-4">To get started with visualization:</p>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                  <li>Navigate to the &quot;Visualize&quot; page</li>
                  <li>Select a CSV file from your trained models</li>
                  <li>Choose chart type and data columns to visualize</li>
                  <li>Customize and interact with your charts</li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <p className="text-xl">Ready to get started?</p>
        <button className="mt-4 px-6 py-3 bg-slate-900 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors duration-300">
        <Link href="/" passHref>
          Go to Dashboard
        </Link>
        </button>
      </motion.div>
    </div>
  )
}