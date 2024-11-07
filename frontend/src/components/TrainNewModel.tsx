'use client'

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from 'framer-motion';

interface TrainNewModelProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  isTraining: boolean;
  columns: string[];
  selectedColumn: string;
  setSelectedColumn: (column: string) => void;
  isAutomatic: boolean;
  setIsAutomatic: (isAutomatic: boolean) => void;
  trainingOutput: string;
}

export default function TrainNewModel({
  onFileChange,
  onSubmit,
  isTraining,
  columns,
  selectedColumn,
  setSelectedColumn,
  isAutomatic,
  setIsAutomatic,
  trainingOutput,
}: TrainNewModelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-white">Train New Model</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Input 
                type="file" 
                onChange={onFileChange} 
                accept=".csv"
                className="cursor-pointer bg-slate-700 text-white border-slate-600 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={isAutomatic ? "default" : "outline"}
                  onClick={() => setIsAutomatic(true)}
                  className={`${isAutomatic ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'} text-white transition-colors duration-200`}
                >
                  Automatic Target Selection
                </Button>
                <Button
                  type="button"
                  variant={!isAutomatic ? "default" : "outline"}
                  onClick={() => setIsAutomatic(false)}
                  className={`${!isAutomatic ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'} text-white transition-colors duration-200`}
                >
                  Manual Target Selection
                </Button>
              </div>

              {!isAutomatic && columns.length > 0 && (
                <Select
                  value={selectedColumn}
                  onValueChange={setSelectedColumn}
                >
                  <SelectTrigger className="bg-slate-700 text-white border-slate-600">
                    <SelectValue placeholder="Select target column" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 text-white border-slate-600">
                    {columns.map((column) => (
                      <SelectItem key={column} value={column} className="hover:bg-slate-600">
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isTraining || (!isAutomatic && !selectedColumn)}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white transition-all duration-200 transform hover:scale-105"
            >
              {isTraining ? 'Training...' : 'Train Model'}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {trainingOutput && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-4 w-full bg-slate-700 text-white hover:bg-slate-600 transition-colors duration-200">
                  View Training Details
                  <Eye className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-800 text-white border border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Training Output</DialogTitle>
                </DialogHeader>
                <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm text-gray-300">
                  {trainingOutput}
                </pre>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}