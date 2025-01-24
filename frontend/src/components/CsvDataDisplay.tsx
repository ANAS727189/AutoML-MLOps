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
  const [gridReady, setGridReady] = useState(false);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1
  };

  useEffect(() => {
    if (!csvData) return;

    try {
      const rows = csvData.trim().split('\n');
      if (rows.length === 0) return;

      const headers = rows[0].split(',').map(header => header.trim());
      
      // Set column definitions first
      const newColumnDefs = headers.map(header => ({
        field: header,
        headerName: header,
      }));
      setColumnDefs(newColumnDefs);

      // Then set row data
      const data = rows.slice(1)
        .filter(row => row.trim().length > 0)
        .map(row => {
          const values = row.split(',');
          return headers.reduce((obj: { [key: string]: any }, header, index) => {
            obj[header] = values[index]?.trim() ?? '';
            return obj;
          }, {});
        });
      setRowData(data);
      setGridReady(true);
    } catch (error) {
      console.error('Error parsing CSV data:', error);
    }
  }, [csvData]);

  const handleDownload = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full bg-slate-800 border-slate-700 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Trained Model Data</h2>
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm" 
          className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        {gridReady && columnDefs.length > 0 && (
          <div className="ag-theme-alpine-dark" style={{ height: 400, width: '100%' }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={5}
              domLayout='autoHeight'
              onGridReady={(params) => {
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}