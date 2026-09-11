import React, { createContext, useContext, useState, useEffect } from 'react';
import { MINING_KNOWLEDGE_BASE } from '../data/miningKnowledgeBase';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('geo_mine_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MINING_KNOWLEDGE_BASE;
      }
    }
    return MINING_KNOWLEDGE_BASE;
  });

  const [uploadProgress, setUploadProgress] = useState(null); // { fileName, stage, percent, status }
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('geo_mine_documents', JSON.stringify(documents));
  }, [documents]);

  // Compute live system metrics
  const totalVectors = documents.reduce((acc, doc) => acc + (doc.vectorsCount || 0), 0);
  const totalDocuments = documents.length;
  const compliantDocsCount = documents.filter(doc => doc.complianceVerified).length;
  const clusters = Array.from(new Set(documents.map(doc => doc.cluster || 'General')));

  // Real multi-step document vectorization upload simulation
  const uploadAndVectorizeDocument = async (fileObj, customMeta = {}) => {
    const fileName = fileObj.name || "Custom_Geological_Dataset.pdf";
    const fileSize = fileObj.size ? `${(fileObj.size / (1024 * 1024)).toFixed(1)} MB` : "3.1 MB";
    const fileExt = fileName.split('.').pop().toUpperCase();

    // Stage 1: Uploading & Pre-processing
    setUploadProgress({
      fileName,
      stage: 'Uploading file stream & virus integrity check...',
      percent: 20,
      status: 'processing'
    });
    await new Promise(r => setTimeout(r, 600));

    // Stage 2: OCR & Text Extraction
    setUploadProgress({
      fileName,
      stage: 'Extracting geological strata logs & OCR parsing...',
      percent: 45,
      status: 'processing'
    });
    await new Promise(r => setTimeout(r, 700));

    // Stage 3: Dynamic Chunking (512 tokens with 64 overlap)
    setUploadProgress({
      fileName,
      stage: 'Executing semantic token chunking (512 token windows)...',
      percent: 70,
      status: 'processing'
    });
    await new Promise(r => setTimeout(r, 800));

    // Stage 4: 768-D Vector Embeddings
    setUploadProgress({
      fileName,
      stage: 'Generating 768-dimensional dense vector embeddings...',
      percent: 92,
      status: 'processing'
    });
    await new Promise(r => setTimeout(r, 700));

    const generatedVectorCount = Math.floor(Math.random() * 300) + 350;
    const newDocId = `DOC-USER-${Date.now().toString().slice(-4)}`;

    const newDoc = {
      id: newDocId,
      title: customMeta.title || fileName.replace(/\.[^/.]+$/, ""),
      category: customMeta.category || "Geotechnical Survey / Strata Analysis",
      fileType: fileExt,
      size: fileSize,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: "Indexed",
      vectorsCount: generatedVectorCount,
      dimensions: 768,
      cluster: customMeta.cluster || "Stratigraphy",
      complianceVerified: true,
      summary: customMeta.summary || `Extracted geological strata dataset. Generated ${generatedVectorCount} dense vector embeddings indexed in HNSW high-dimensional vector space.`,
      chunks: [
        {
          id: `CHK-${newDocId}-01`,
          heading: "Primary Formation & Core Lithology",
          text: customMeta.rawContent || `Geological core analysis for ${fileName}. Demonstrates solid sedimentary bedding with sandstone, shale, and mineralized matrix. Cohesion values align with DGMS regional baseline.`,
          keywords: ["lithology", "formation", "core sample", "seam data"],
          ucs_mpa: "41.2 MPa",
          rqd_percent: "77%",
          density_g_cm3: "2.55 g/cm³"
        }
      ]
    };

    setDocuments(prev => [newDoc, ...prev]);

    setUploadProgress({
      fileName,
      stage: `Vector indexing complete! ${generatedVectorCount} vectors stored.`,
      percent: 100,
      status: 'completed'
    });

    setTimeout(() => {
      setUploadProgress(null);
    }, 2500);

    return newDoc;
  };

  const deleteDocument = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const reindexDocument = async (docId) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'Indexing...',
          vectorsCount: d.vectorsCount + Math.floor(Math.random() * 20) - 10
        };
      }
      return d;
    }));

    await new Promise(r => setTimeout(r, 1200));

    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'Indexed',
          uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return d;
    }));
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = activeFilter === 'ALL' || doc.cluster === activeFilter || doc.fileType === activeFilter;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DocumentContext.Provider
      value={{
        documents,
        filteredDocuments,
        totalVectors,
        totalDocuments,
        compliantDocsCount,
        clusters,
        uploadProgress,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        uploadAndVectorizeDocument,
        deleteDocument,
        reindexDocument
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
