'use client'

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface CurrentTrainedModelProps {
  model: ModelInfo;
  metrics: Metrics;
  problemType: string;
  onDownload: (model: ModelInfo) => void;
  csvContent: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function CurrentTrainedModel({ model, metrics, problemType, onDownload, csvContent }: CurrentTrainedModelProps) {
  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const rows = csvContent.split('\n');
  const headers = rows[0].split(',');
  const data = rows.slice(1, 6).map(row => row.split(',')); 

  const metricsData = [
    { name: 'Accuracy', value: metrics?.accuracy },
    { name: 'R2 Score', value: metrics?.r2 },
    { name: 'MSE', value: metrics?.mse },
    { name: 'CV Mean', value: metrics?.cv_mean },
  ].filter(item => item.value !== undefined);

  const cvData = [
    { name: 'CV Mean', value: metrics?.cv_mean },
    { name: 'CV Std', value: metrics?.cv_std },
  ].filter(item => item.value !== undefined);

  return (
    <Card className="mt-8">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Current Trained Model</h2>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span className="font-medium">{model.name}</span>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                <div>Size: {formatSize(model.size)}</div>
                <div>Created: {formatDate(model.created)}</div>
                <div>Problem Type: {problemType}</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDownload(model)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {metricsData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Model Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {cvData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Cross-Validation Results</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cvData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(4)}`}
                  >
                    {cvData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {metrics?.classification_report && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Classification Report</h3>
            <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto">
              {metrics?.classification_report}
            </pre>
          </div>
        )}

        {csvContent && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Model Data Preview</h3>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">
              View Full Model Data
              <Eye className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Full Model Data (CSV)</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(1).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.split(',').map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={() => {
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${model.name}.csv`;
              a.click();
            }}>
              Download Full CSV
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}