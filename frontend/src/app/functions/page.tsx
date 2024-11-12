'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';
import TrainNewModel from '@/components/TrainNewModel';
import CurrentTrainedModel from '@/components/CurrentTrainedModel';
import PreviousModels from '@/components/PreviousModels';
import CsvDataDisplay from '@/components/CsvDataDisplay';
import { motion } from 'framer-motion';
import DataVisualization from '@/components/DraggableChart';

interface ModelInfo {
  name: string;
  size: number;
  created: string;
  lastModified: string;
  downloadUrl: string;
  isNew?: boolean;
}

interface Metrics {
  accuracy?: number;
  mse?: number;
  r2?: number;
  cv_mean?: number;
  cv_std?: number;
  classification_report?: string;
}

const TrainingFlowChart = ({ step }: { step: number }) => {
  const steps = [
    'Data Preprocessing',
    'Feature Engineering',
    'Model Selection',
    'Training',
    'Evaluation',
    'Finalization'
  ];

  return (
    <div className="mt-8 p-4 bg-slate-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-white">Training Process</h3>
      <div className="space-y-4">
        {steps.map((s, index) => (
          <motion.div
            key={s}
            className={`p-2 rounded ${index <= step ? 'bg-blue-600' : 'bg-slate-700'}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <motion.div
              className={`h-2 rounded ${index <= step ? 'bg-blue-400' : 'bg-slate-600'}`}
              initial={{ width: '0%' }}
              animate={{ width: index <= step ? '100%' : '0%' }}
              transition={{ duration: 0.5 }}
            />
            <span className={index <= step ? 'text-blue-200' : 'text-slate-400'}>{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function Functions() {
  const [file, setFile] = useState<File | null>(null);
  const [allModels, setAllModels] = useState<ModelInfo[]>([]);
  const [newModel, setNewModel] = useState<ModelInfo | null>(null);
  const [previousModels, setPreviousModels] = useState<ModelInfo[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainingOutput, setTrainingOutput] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [isAutomatic, setIsAutomatic] = useState(true);
  const [csvContent, setCsvContent] = useState<string>('');
  const [metrics, setMetrics] = useState<Metrics>({});
  const [problemType, setProblemType] = useState<string>('');
  const [trainingStep, setTrainingStep] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/models');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllModels(data);
      setPreviousModels(data.filter((model: ModelInfo) => !model.isNew));
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to fetch models. Please try again later.');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const headers = text.split('\n')[0].split(',');
        setColumns(headers.map(h => h.trim()));
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setIsTraining(true);
    setError(null);
    setTrainingStep(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetColumn', isAutomatic ? 'auto' : selectedColumn);

    try {
      const response = await fetch('http://localhost:3001/api/train', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTrainingOutput(data.output);
      
      if (data.modelPath) {
        const newModelInfo: ModelInfo = {
          name: data.modelPath.split('/').pop() || '',
          size: 0,
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          downloadUrl: `/api/download/${data.modelPath.split('/').pop()}`,
          isNew: true
        };
        setNewModel(newModelInfo);
        setMetrics(data.metrics);
        setProblemType(data.problemType);
        
        fetchCsvContent(newModelInfo.name);
      }
      
      fetchModels();
    } catch (error) {
      console.error('Error training model:', error);
      setError('Failed to train model. Please try again later.');
    } finally {
      setIsTraining(false);
      setTrainingStep(-1);
    }
  };

  const fetchCsvContent = async (modelName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/model-csv/${modelName}`);
      if (response.ok) {
        const text = await response.text();
        setCsvContent(text);
      } else {
        console.error('Failed to fetch CSV content');
        setError('Failed to fetch CSV content for the model.');
      }
    } catch (error) {
      console.error('Error fetching CSV content:', error);
      setError('An error occurred while fetching CSV content.');
    }
  };

  const handleDownload = async (model: ModelInfo) => {
    try {
      window.open(`http://localhost:3001${model.downloadUrl}`, '_blank');
    } catch (error) {
      console.error('Error downloading model:', error);
      setError('Failed to download model');
    }
  };

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingStep((prev) => (prev + 1) % 6);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AutoML Functions
        </motion.h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900 border-red-700 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <TrainNewModel
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            isTraining={isTraining}
            columns={columns}
            selectedColumn={selectedColumn}
            setSelectedColumn={setSelectedColumn}
            isAutomatic={isAutomatic}
            setIsAutomatic={setIsAutomatic}
            trainingOutput={trainingOutput}
          />

          {isTraining ? (
            <TrainingFlowChart step={trainingStep} />
          ) : (
            csvContent && (
              <CsvDataDisplay
                csvData={csvContent}
                fileName={newModel?.name || 'model_data.csv'}
              />
            )
          )}
        </div>

        {newModel && (
          <div>
            <CurrentTrainedModel
              model={newModel}
              metrics={metrics}
              problemType={problemType}
              onDownload={handleDownload}
              csvContent={csvContent}
            />
          </div>
      
        )}
        {previousModels.length > 0 && (
          <PreviousModels models={previousModels} onDownload={handleDownload} />
        )}
      </div>
    </div>
  );
}