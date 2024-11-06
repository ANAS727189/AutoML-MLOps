'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Download, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ModelInfo {
  name: string;
  size: number;
  created: string;
  lastModified: string;
  downloadUrl: string;
}

export default function Functions() {
  const [file, setFile] = useState<File | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainingOutput, setTrainingOutput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
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
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to fetch models. Please try again later.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setIsTraining(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

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
      console.log(data.message);
      fetchModels();
    } catch (error) {
      console.error('Error training model:', error);
      setError('Failed to train model. Please try again later.');
    } finally {
      setIsTraining(false);
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

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AutoML Functions</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Train New Model</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".csv"
                  className="cursor-pointer"
                />
              </div>
              <Button type="submit" disabled={!file || isTraining}>
                {isTraining ? 'Training...' : 'Train Model'}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {trainingOutput && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    View Training Details
                    <Eye className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Training Output</DialogTitle>
                  </DialogHeader>
                  <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {trainingOutput}
                  </pre>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Trained Models</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {models.map((model, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      <div>Size: {formatSize(model.size)}</div>
                      <div>Created: {formatDate(model.created)}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(model)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}