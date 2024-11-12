'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface CsvDataDisplayProps {
  csvData: string;
  fileName: string;
}

export default function CsvDataDisplay({ csvData, fileName }: CsvDataDisplayProps) {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);

  useEffect(() => {
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
    const data = rows.slice(1).map(row => {
      const values = row.split(',');
      return headers.reduce((obj: { [key: string]: any }, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });

    setColumnDefs(headers.map(header => ({
      field: header,
      headerName: header,
      sortable: true,
      filter: true
    })));
    setRowData(data);
  }, [csvData]);

  const handleDownload = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <Card className="w-full bg-slate-800 border-slate-700 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Trained Model Data</h2>
        <Button onClick={handleDownload} variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-alpine-dark" style={{ height: 400, width: '100%' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={true}
            paginationPageSize={5}
            domLayout='autoHeight'
          />
        </div> 
      </CardContent>
    </Card>
  );
}