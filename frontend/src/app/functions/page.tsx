'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';
import TrainNewModel from '@/components/TrainNewModel';
import CurrentTrainedModel from '@/components/CurrentTrainedModel';
import PreviousModels from '@/components/PreviousModels';
import CsvDataDisplay from '@/components/CsvDataDisplay';

interface ModelInfo {
  name: string;
  size: number;
  created: string;
  lastModified: string;
  downloadUrl: string;
  isNew?: boolean;
}

interface Metrics {
  accuracy: number;
  mse: number;
  r2: number;
  cv_mean: number;
  cv_std: number;
}

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
  const [chartData, setChartData] = useState<any[]>([]);
  const [csvContent, setCsvContent] = useState<string>('');
  const [metrics, setMetrics] = useState<Metrics>({
    accuracy: 0,
    mse: 0,
    r2: 0,
    cv_mean: 0,
    cv_std: 0
  });
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

      // Read CSV headers to get columns
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
      
      // Set the newly trained model
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
        setMetrics(data.metrics);  // Add this line
        
        // Fetch CSV content for the newly trained model
        fetchCsvContent(newModelInfo.name);
      }
      
      fetchModels();
    } catch (error) {
      console.error('Error training model:', error);
      setError('Failed to train model. Please try again later.');
    } finally {
      setIsTraining(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AutoML Functions</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {newModel && csvContent && (
          <CsvDataDisplay
            csvData={csvContent}
            fileName={newModel.name}
          />
        )}
      </div>

      {newModel && (
  <CurrentTrainedModel
    model={newModel}
    metrics={metrics}
    onDownload={handleDownload}
    csvContent={csvContent}
  />
)}
      {previousModels.length > 0 && (
        <PreviousModels models={previousModels} onDownload={handleDownload} />
      )}
    </div>
  );
}