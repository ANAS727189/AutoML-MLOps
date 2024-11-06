import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

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
  
  // Store the original filename
  const originalFilename = req.file.originalname;
  const fileMetadata = {
    originalFilename,
    timestamp: Date.now(),
  };

  const pythonProcess = spawn('python', ['train_model.py', filePath, outputPath]);

  let pythonOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    pythonOutput += data.toString();
    console.log(`Python script output: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Error training model', output: pythonOutput });
    }
    
    // Save metadata along with the model
    const metadataPath = outputPath.replace('.pkl', '_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      ...fileMetadata,
      trainingOutput: pythonOutput,
      completedAt: Date.now()
    }));

    res.json({ 
      message: 'Model trained successfully', 
      modelPath: outputPath,
      output: pythonOutput 
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});