'use client'

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface ModelInfo {
  name: string;
  size: number;
  created: string;
  lastModified: string;
  downloadUrl: string;
  isNew?: boolean;
}

interface PreviousModelsProps {
  models: ModelInfo[];
  onDownload: (model: ModelInfo) => void;
}

export default function PreviousModels({ models, onDownload }: PreviousModelsProps) {
  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const columnDefs = [
    { headerName: 'Name', field: 'name' as keyof ModelInfo },
    { headerName: 'Size', field: 'size' as keyof ModelInfo, valueFormatter: (params: any) => formatSize(params.value) },
    { headerName: 'Created', field: 'created' as keyof ModelInfo, valueFormatter: (params: any) => formatDate(params.value) },
    { headerName: 'Last Modified', field: 'lastModified' as keyof ModelInfo, valueFormatter: (params: any) => formatDate(params.value) },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => (
        <Button variant="outline" size="sm" onClick={() => onDownload(params.data)}>
          <Download className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <Card className="lg:col-span-2 bg-slate-200">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Previous Models</h2>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={models}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </CardContent>
    </Card>
  );
}