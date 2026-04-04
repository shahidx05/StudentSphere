import { useRef, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

const FileUpload = ({ multiple = false, accept = 'image/*,application/pdf', onChange, label }) => {
  const inputRef = useRef();
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFiles = (newFiles) => {
    const arr = Array.from(newFiles);
    setFiles(arr);
    onChange(multiple ? arr : arr[0]);

    const imagePreviews = arr.map((f) =>
      f.type.startsWith('image/') ? URL.createObjectURL(f) : null
    );
    setPreviews(imagePreviews);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange(multiple ? newFiles : newFiles[0] || null);
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-sm text-text-secondary font-medium">{label}</label>}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-border-light hover:bg-surface-2'
        }`}
      >
        <Upload size={24} className="mx-auto text-muted mb-2" />
        <p className="text-text-secondary text-sm">
          {dragging ? 'Drop files here' : 'Click or drag & drop to upload'}
        </p>
        <p className="text-text-muted text-xs mt-1">Max 5MB per file • Images & PDFs</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div key={idx} className="relative group">
              {previews[idx] ? (
                <img
                  src={previews[idx]}
                  alt={file.name}
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-surface-2 border border-border flex flex-col items-center justify-center gap-1">
                  <FileText size={20} className="text-muted" />
                  <span className="text-[9px] text-muted truncate w-14 text-center px-1">
                    {file.name.split('.').pop().toUpperCase()}
                  </span>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
