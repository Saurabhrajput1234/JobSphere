import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  TextField,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';

const ResumeUpload = ({ onSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.includes('pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file || !title) {
      setError('Please provide both a title and a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('title', title);
    formData.append('is_default', true);

    try {
      console.log('Uploading resume:', {
        title,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const response = await axios.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      if (response.data) {
        setSuccess('Resume uploaded successfully');
        setFile(null);
        setTitle('');
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.resume?.[0] || 
                          'Failed to upload resume';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!user || user.role !== 'job_seeker') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Only job seekers can upload resumes. Please log in with a job seeker account.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Your Resume
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Resume Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          helperText="Give your resume a descriptive title"
        />

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            mb: 2,
            mt: 2,
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop the file here' : 'Drag and drop your resume here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select a file
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            Supported format: PDF (Max size: 5MB)
          </Typography>
        </Box>

        {file && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Selected file: {file.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || !title || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : null}
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </Button>
      </Paper>
    </Container>
  );
};

export default ResumeUpload; 