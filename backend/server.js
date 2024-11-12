import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path'; 
import fs from 'fs';
import cors from 'cors';
import Papa from 'papaparse';


const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use('/models', express.static('models')); // Serve model files statically

// Endpoint to get model details
app.get('/api/model-details/:filename', (req, res) => {
  const filePath = path.join('models', req.params.filename);
  try {
    const stats = fs.statSync(filePath);
    const modelDetails = {
      name: req.params.filename,
      size: stats.size,
      created: stats.birthtime,
      lastModified: stats.mtime,
      path: `/models/${req.params.filename}` // URL path for downloading
    };
    res.json(modelDetails);
  } catch (error) {
    res.status(404).json({ error: 'Model file not found' });
  }
});

// Enhanced models list endpoint
app.get('/api/models', (req, res) => {
  fs.readdir('models', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading models directory' });
    }
    
    const modelsList = files.map(filename => {
      const filePath = path.join('models', filename);
      const stats = fs.statSync(filePath);
      return {
        name: filename,
        size: stats.size,
        created: stats.birthtime,
        lastModified: stats.mtime,
        downloadUrl: `/models/${filename}`
      };
    });
    
    res.json(modelsList);
  });
});

app.post('/api/train', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const outputPath = path.join('models', `${Date.now()}_model.pkl`);
  
  const originalFilename = req.file.originalname;
  const fileMetadata = {
    originalFilename,
    timestamp: Date.now(),
  };

  const pythonProcess = spawn('python', ['train_model.py', filePath, outputPath]);

  let pythonOutput = '';
  let pythonError = '';

  pythonProcess.stdout.on('data', (data) => {
    pythonOutput += data.toString();
    console.log(`Python script output: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    pythonError += data.toString();
    console.error(`Python script error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Error training model', output: pythonOutput, errorOutput: pythonError });
    }
    
    const metadataPath = outputPath.replace('.pkl', '_metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    res.json({ 
      message: 'Model trained successfully', 
      modelPath: outputPath,
      output: pythonOutput,
      metrics: metadata.metrics,
      problemType: metadata.problem_type
    });
  });
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join('models', req.params.filename);
  res.download(filePath);
});

// New endpoint to serve model CSV data
app.get('/api/model-csv/:filename', (req, res) => {
  const filePath = path.join('models', req.params.filename.replace('.pkl', '.csv'));
  try {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    res.header('Content-Type', 'text/csv');
    res.send(csvContent);
  } catch (error) {
    res.status(404).json({ error: 'Model CSV file not found' });
  }
});

import { promises as fss } from 'fs';


// New prediction endpoint
app.post('/api/predict/:model_filename', async (req, res) => {
  try {
    const modelPath = path.join('models', req.params.model_filename);
    const inputData = req.body;
    
    //Validate model file exists
    try {
      await fss.access(modelPath);
    } catch (err) {
      return res.status(404).json({
        status: 'error',
        message: 'Model file not found',
        details: { modelPath }
      });
    }
    // Create temp directory if it doesn't exist
    try {
      await fss.mkdir('temp', { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }


    // Create a temporary JSON file to store input data
    const inputPath = path.join('temp', `${Date.now()}_input.json`);
    await fss.writeFile(inputPath, JSON.stringify(inputData));
    // Create promise to handle Python process
    const prediction = await new Promise((resolve, reject) => {

      //["python", "-m", "venv", "sklearn_1_3_2_env"],
    // ["source", "sklearn_1_3_2_env/bin/activate"],
    // ["pip", "install", "scikit-learn==1.3.2", "pandas", "joblib"],
    // pip install pandas matplotlib seaborn

      const pythonProcess = spawn('python', ['predict.py', modelPath, inputPath]);

      let pythonOutput = '';
      let pythonError = '';
      
      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process failed: ${pythonError}`));
        } else {
          resolve(pythonOutput);
        }
      });
      
      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });
    
    // Clean up temporary file
    try {
      await fss.unlink(inputPath);
    } catch (err) {
      console.error('Error cleaning up temporary file:', err);
    }
    console.log(prediction);
    // Parse and return the prediction result
    const result = JSON.parse(prediction);

    res.json(result);
    
  } catch (error) {
    // Clean up any remaining temporary files in case of errors
    const inputPath = path.join('temp', `${Date.now()}_input.json`);
    try {
      await fss.unlink(inputPath);
    } catch (err) {
      // Ignore errors during cleanup
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error making prediction',
      details: error.stack
    });
  }
});


// Endpoint to get required features for a model
app.get('/api/model-features/:model_filename', (req, res) => {
  const metadataPath = path.join('models', req.params.model_filename.replace('.pkl', '_metadata.json'));
  
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    res.json({
      status: 'success',
      features: metadata.features,
      problem_type: metadata.problem_type,
      target_column: metadata.target_column
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: 'Model metadata not found'
    });
  }
});


app.get('/api/csv-data/:filename', async (req, res) => {
  try {
    const filePath = path.join('models', req.params.filename.replace('.pkl', '.csv'));
    const fileContent = await fss.readFile(filePath, 'utf8');
    const parsedData = Papa.parse(fileContent, { header: true });
    res.json(parsedData.data);
  } catch (error) {
    res.status(404).json({ error: 'CSV file not found' });
  }
});

// New endpoint for generating graphs
app.get('/api/generate-graph/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { graphType, xColumn, yColumn } = req.query;

    if (!graphType || !xColumn || !yColumn) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const csvPath = path.join('models', filename.replace('.pkl', '.csv'));

    const pythonProcess = spawn('python', ['generate_graph.py', csvPath, graphType, xColumn, yColumn]);

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Error generating graph', errorOutput: pythonError });
      }

      try {
        const result = JSON.parse(pythonOutput);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Error parsing Python output', errorOutput: pythonOutput });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
