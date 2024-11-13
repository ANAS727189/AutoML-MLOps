
'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Eye, FileUp, X } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

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
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [fileContent, setFileContent] = useState<string | null>(null);

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
const file = event.target.files?.[0] || null;
setSelectedFile(file);
onFileChange(event);
};

const handleFileView = () => {
if (selectedFile) {
const reader = new FileReader();
reader.onload = (e) => {
setFileContent(e.target?.result as string);
};
reader.readAsText(selectedFile);
}
};

const handleFileRemove = () => {
setSelectedFile(null);
setFileContent(null);
};

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
>
<Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg overflow-hidden">
<CardHeader className="bg-slate-800 border-b border-slate-700">
<h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Train New Model</h2>
</CardHeader>
<CardContent className="p-6">
<form onSubmit={onSubmit} className="space-y-6">
<div className="relative group">
<Input 
type="file" 
onChange={handleFileChange} 
accept=".csv"
className="sr-only"
id="file-upload"
/>
<label 
htmlFor="file-upload"
className="flex items-center justify-center w-full px-4 py-2 bg-slate-700 text-white rounded-lg cursor-pointer hover:bg-slate-600 transition-colors duration-200 border-2 border-dashed border-slate-600 group-hover:border-blue-400"
>
<FileUp className="mr-2 h-5 w-5" />
<span>{selectedFile ? selectedFile.name : "Choose CSV File"}</span>
</label>
</div>

<AnimatePresence>
{selectedFile && (
<motion.div
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
transition={{ duration: 0.3 }}
className="flex justify-between items-center bg-slate-700 p-2 rounded-md"
>
<span className="text-sm text-white truncate">{selectedFile.name}</span>
<div className="flex space-x-2">
<Button
type="button"
variant="outline"
size="sm"
onClick={handleFileView}
className="bg-blue-600 hover:bg-blue-700 text-white border-none"
>
<Eye className="h-4 w-4" />
<span className="sr-only">View file</span>
</Button>
<Button
type="button"
variant="outline"
size="sm"
onClick={handleFileRemove}
className="bg-red-600 hover:bg-red-700 text-white border-none"
>
<X className="h-4 w-4" />
<span className="sr-only">Remove file</span>
</Button>
</div>
</motion.div>
)}
</AnimatePresence>

<div className="space-y-4">
<div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
<Button
type="button"
variant={isAutomatic ? "default" : "outline"}
onClick={() => setIsAutomatic(true)}
className={`${isAutomatic ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'} text-white transition-colors duration-200 flex-1`}
>
Automatic
</Button>
<Button
type="button"
variant={!isAutomatic ? "default" : "outline"}
onClick={() => setIsAutomatic(false)}
className={`${!isAutomatic ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'} text-white transition-colors duration-200 flex-1`}
>
Manual
</Button>
</div>

{!isAutomatic && columns.length > 0 && (
<Select
value={selectedColumn}
onValueChange={setSelectedColumn}
>
<SelectTrigger className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600 transition-colors duration-200">
<SelectValue placeholder="Select target column" />
</SelectTrigger>
<SelectContent className="bg-slate-800 text-white border-slate-700">
{columns.map((column) => (
<SelectItem key={column} value={column} className="hover:bg-slate-700">
{column}
</SelectItem>
))}
</SelectContent>
</Select>
)}
</div>

<Button 
type="submit" 
disabled={isTraining || (!isAutomatic && !selectedColumn) || !selectedFile}
className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
>
{isTraining ? 'Training...' : 'Train Model'}
<Upload className="ml-2 h-4 w-4" />
</Button>
</form>

{(trainingOutput || fileContent) && (
<Dialog>
<DialogTrigger asChild>
<Button variant="outline" className="mt-6 w-full bg-slate-700 text-white hover:bg-slate-600 transition-colors duration-200 border border-slate-600 hover:border-blue-400">
{fileContent ? 'View File Contents' : 'View Training Details'}
<Eye className="ml-2 h-4 w-4" />
</Button>
</DialogTrigger>
<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-800 text-white border border-slate-700">
<DialogHeader>
<DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
{fileContent ? 'File Contents' : 'Training Output'}
</DialogTitle>
</DialogHeader>
<pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm text-gray-300 border border-slate-700">
{fileContent || trainingOutput}
</pre>
</DialogContent>
</Dialog>
)}
</CardContent>
</Card>
</motion.div>
);
}


