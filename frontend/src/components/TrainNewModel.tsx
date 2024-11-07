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
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Train New Model</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input 
              type="file" 
              onChange={onFileChange} 
              accept=".csv"
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={isAutomatic ? "default" : "outline"}
                onClick={() => setIsAutomatic(true)}
              >
                Automatic Target Selection
              </Button>
              <Button
                type="button"
                variant={!isAutomatic ? "default" : "outline"}
                onClick={() => setIsAutomatic(false)}
              >
                Manual Target Selection
              </Button>
            </div>

            {!isAutomatic && columns.length > 0 && (
              <Select
                value={selectedColumn}
                onValueChange={setSelectedColumn}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
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
          >
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
  );
}

