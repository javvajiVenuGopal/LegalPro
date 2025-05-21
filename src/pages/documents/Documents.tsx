import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../../components/ui/Button';
import { Search, Upload, Trash2, FolderPlus, X, Folder, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatFileSize } from '../../lib/utils';
import { Document } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface Folder {
  id: string;
  name: string;
  count: number;
  parent?: string | null;
  children?: Folder[];
  files?: Document[];
}

export const Documents: React.FC = () => {
  const { user, Token: token } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSize, setFilterSize] = useState<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await axios.get('http://127.0.0.1:7000/law/documents/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [token]);

  const fetchFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const res = await axios.get('http://127.0.0.1:7000/law/folders/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(res.data);
    } catch {
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [fetchDocuments, fetchFolders]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesFolder = !selectedFolder || (doc as any).folder === selectedFolder;
      const matchesType = !filterType || doc.type === filterType;
      const matchesDate = !filterDate || formatDate(doc.date) === filterDate;
      const matchesSize = !filterSize || formatFileSize(doc.size) <= filterSize;
      return matchesSearch && matchesFolder && matchesType && matchesDate && matchesSize;
    });
  }, [documents, debouncedSearch, selectedFolder, filterType, filterDate, filterSize]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    if (selectedFolder) formData.append('folder', selectedFolder);
    formData.append('owner', user?.id);
    setUploading(true);
    try {
      await axios.post('http://127.0.0.1:7000/law/documents/', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      await fetchDocuments();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileUrl: string) => {
    try {
      const relativePath = new URL(fileUrl).pathname.replace(/^\/+/, '');
      const downloadUrl = `http://127.0.0.1:7000/${relativePath}`;
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileUrl.split('/').pop() || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Download failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await axios.delete(`http://127.0.0.1:7000/law/documents/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };
const handleView = (fileUrl: string) => {
  try {
    const relativePath = new URL(fileUrl).pathname.replace(/^\/+/, '');
    const viewUrl = `http://127.0.0.1:7000/${relativePath}`;
    window.open(viewUrl, '_blank');
  } catch (error) {
    console.error('View failed:', error);
    alert('Could not open file.');
  }
};

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await axios.post('http://127.0.0.1:7000/law/folders/', {
        name: newFolderName, parent: newFolderParent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFolders();
      setShowNewFolder(false);
      setNewFolderName('');
    } catch {
      alert('Failed to create folder');
    }
  };

  const renderFolders = (folders: Folder[]) =>
    folders.map(folder => (
      <div key={folder.id} className="ml-4">
        <button
          onClick={() => setSelectedFolder(folder.id)}
          className={`w-full text-left px-3 py-2 rounded-md ${selectedFolder === folder.id ? 'bg-primary-100' : 'hover:bg-gray-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              <span>{folder.name}</span>
            </div>
            <Badge>{folder.count}</Badge>
          </div>
        </button>
        {folder.children && renderFolders(folder.children)}
      </div>
    ));

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-600">Manage and organize your legal documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewFolder(true)}><FolderPlus className="mr-2" /> New Folder</Button>
          <div className="relative inline-block">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button disabled={uploading}><Upload className="mr-2" /> {uploading ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Folders</CardTitle></CardHeader>
            <CardContent>{loadingFolders ? 'Loading...' : renderFolders(folders)}</CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-wrap gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  className="pl-10 pr-4 py-2 w-full border rounded-md"
                  placeholder="Search..."
                  value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md p-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">TXT</option>
              </select>
              <input
                type="date"
                className="border rounded-md p-2"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max Size (MB)"
                className="border rounded-md p-2"
                value={filterSize || ''}
                onChange={(e) => setFilterSize(Number(e.target.value))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              {loadingDocs ? (
                <div>Loading documents...</div>
              ) : filteredDocuments.length === 0 ? (
                <div>No documents found</div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center">
                      <span>{doc.name}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleView(doc.file)}>View</Button>
                        <Button variant="outline" onClick={() => handleDownload(doc.file)}>Download</Button>
                        <Button variant="outline" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Create New Folder</h2>
              <button onClick={() => setShowNewFolder(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Folder Name"
              className="w-full mb-4 p-2 border rounded-md"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <Button onClick={handleCreateFolder}>Create</Button>
          </div>
        </div>
      )}
    </div>
  );
};

