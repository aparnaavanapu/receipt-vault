import { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { createUploadUrl, uploadFileToS3 } from '../services/uploadService';

const UploadReceipt = () => {
  const auth = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles).map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'Ready to upload',
      objectKey: null,
    }));
    setFiles(prev => [...prev, ...fileArray]);
  };

  const updateFile = (index, updates) => {
    setFiles(currentFiles => currentFiles.map((file, fileIndex) => (
      fileIndex === index ? { ...file, ...updates } : file
    )));
  };

  const uploadReceipt = async (fileItem, index, accessToken) => {
    try {
      updateFile(index, { status: 'Generating upload URL...' });
      const { uploadUrl, objectKey } = await createUploadUrl({
        fileName: fileItem.file.name,
        contentType: fileItem.file.type,
        accessToken,
      });

      updateFile(index, { status: 'Uploading...', objectKey });
      await uploadFileToS3({ uploadUrl, file: fileItem.file });
      updateFile(index, { status: 'Uploaded', objectKey });
      return true;
    } catch (error) {
      console.error(`Upload failed for ${fileItem.name}:`, error);
      updateFile(index, { status: 'Upload Failed' });
      return false;
    }
  };

  const handleConfirmUpload = async () => {
    const accessToken = auth.user?.access_token;
    
    if (!accessToken) {
      setFiles(currentFiles => currentFiles.map(file => ({
        ...file,
        status: 'Upload Failed',
      })));
      console.error('No Cognito access token is available for the upload request.');
      return;
    }

    setIsUploading(true);
    const uploadResults = await Promise.all(
      files.map((fileItem, index) => uploadReceipt(fileItem, index, accessToken))
    );
    setIsUploading(false);

    if (uploadResults.every(Boolean)) {
      alert('All files uploaded successfully');
    }
  };

  return (
    <main className="md:ml-64 mt-16 p-container-padding min-h-screen bg-surface text-on-surface">
      <div className="mb-section-margin">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Upload Receipts</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Upload your receipts for processing and secure storage. We support JPG, PNG, and PDF formats.</p>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        className={`w-full max-w-3xl border-2 border-dashed rounded-lg p-section-margin flex flex-col items-center justify-center text-center transition-all bg-white mb-section-margin ${
          dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-outline'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4 text-primary">
          <UploadCloud size={32} />
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Drag & Drop files here</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">or click to browse your computer</p>
        
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleChange}
          accept="image/jpeg, image/png, application/pdf"
        />
        
        <button 
          onClick={onButtonClick}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 font-label-md text-label-md rounded transition-colors active:opacity-80"
        >
          Select Files
        </button>
        <p className="mt-4 text-label-sm font-label-sm text-outline">Maximum file size: 10MB per document</p>
      </div>

      {/* File List Section */}
      {files.length > 0 && (
        <div className="w-full max-w-3xl">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Files to Upload</h3>
          <div className="bg-white border border-outline-variant rounded-lg overflow-hidden divide-y divide-outline-variant">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center p-4 hover:bg-surface-container-lowest transition-colors">
                <div className="w-10 h-10 bg-surface-container-highest rounded flex items-center justify-center text-on-surface-variant mr-4 flex-shrink-0">
                  <FileType size={20} />
                </div>
                <div className="flex-grow min-w-0 pr-4">
                  <p className="font-label-md text-label-md text-on-surface truncate">{file.name}</p>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{file.size} • {file.status}</p>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm rounded uppercase tracking-wide mr-4 hidden sm:inline-block">Pending</span>
                  <button className="text-on-surface-variant hover:text-error transition-colors p-2">
                    <AlertCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-section-margin flex justify-end gap-gutter">
            <button 
              onClick={() => setFiles([])}
              className="px-6 py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-label-md text-label-md rounded transition-colors flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              Confirm Upload
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default UploadReceipt;
