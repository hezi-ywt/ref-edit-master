import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { AnnotationPanel } from './components/AnnotationPanel';
import { DownloadIcon, XIcon, ImportIcon, SunIcon, MoonIcon, LanguagesIcon } from './components/Icons';
import { DatasetEntry, PromptEntry, PRESET_SCOPES, ReferenceImage, TargetImage } from './types';

const APP_TEXT = {
  en: {
    preview: "Preview",
    import: "Import",
    importing: "Importing...",
    export: "Export ZIP",
    zipping: "Zipping...",
    titleSuffix: "Master",
    targetModelRequired: "Please fill model name for all target results before exporting.",
    targetModelMissingOnImport: "Target results imported. Please fill model names for comparison."
  },
  zh: {
    preview: "结构预览",
    import: "导入",
    importing: "导入中...",
    export: "导出数据包",
    zipping: "打包中...",
    titleSuffix: "Master",
    targetModelRequired: "请为所有目标结果填写模型名称后再导出。",
    targetModelMissingOnImport: "已导入目标结果，请补充模型名称用于对比。"
  }
};

function App() {
  // Initialize with one empty prompt
  const [prompts, setPrompts] = useState<PromptEntry[]>([{
    id: 'init-1',
    text: '',
    scope: PRESET_SCOPES[0],
    purpose: '',
    references: [],
    targets: []
  }]);

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  // Default to Light Mode (false = light, true = dark)
  const [darkMode, setDarkMode] = useState(false);
  // Language State
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const importInputRef = useRef<HTMLInputElement>(null);
  
  const t = APP_TEXT[lang];

  // Prompt Handlers
  const handleAddPrompt = () => {
    setPrompts(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      text: '',
      scope: PRESET_SCOPES[0],
      purpose: '',
      references: [],
      targets: []
    }]);
  };

  const handleClonePrompt = (id: string) => {
    setPrompts(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      
      const original = prev[index];
      const newPrompt: PromptEntry = {
        ...original,
        id: Math.random().toString(36).substring(2, 9),
        // Deep copy references with new IDs but same blob URL and File
        references: original.references.map(ref => ({
          ...ref,
          id: Math.random().toString(36).substring(2, 9)
        })),
        targets: original.targets.map(ref => ({
          ...ref,
          id: Math.random().toString(36).substring(2, 9)
        }))
      };

      const newPrompts = [...prev];
      newPrompts.splice(index + 1, 0, newPrompt);
      return newPrompts;
    });
  };

  const handleRemovePrompt = (id: string) => {
    setPrompts(prev => {
       const prompt = prev.find(p => p.id === id);
       // Cleanup URLs for this prompt
       if (prompt) {
         prompt.references.forEach(ref => URL.revokeObjectURL(ref.url));
         prompt.targets.forEach(ref => URL.revokeObjectURL(ref.url));
       }
       return prev.filter(p => p.id !== id);
    });
  };

  const handleUpdatePrompt = (id: string, field: keyof PromptEntry, value: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Reference Handlers (Scoped to Prompt)
  const handleRefUpload = (promptId: string, files: FileList) => {
    setPrompts(prev => prev.map(p => {
      if (p.id !== promptId) return p;
      
      const newRefs = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        url: URL.createObjectURL(file),
      }));
      
      return { ...p, references: [...p.references, ...newRefs] };
    }));
  };

  const handleRefRemove = (promptId: string, refId: string) => {
    setPrompts(prev => prev.map(p => {
      if (p.id !== promptId) return p;
      
      const target = p.references.find(r => r.id === refId);
      if (target) URL.revokeObjectURL(target.url);
      
      return { ...p, references: p.references.filter(r => r.id !== refId) };
    }));
  };

  const handleTargetUpload = (promptId: string, files: FileList) => {
    setPrompts(prev => prev.map(p => {
      if (p.id !== promptId) return p;
      
      const newTargets = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        url: URL.createObjectURL(file),
        model: ''
      }));
      
      return { ...p, targets: [...p.targets, ...newTargets] };
    }));
  };

  const handleTargetRemove = (promptId: string, refId: string) => {
    setPrompts(prev => prev.map(p => {
      if (p.id !== promptId) return p;
      
      const target = p.targets.find(r => r.id === refId);
      if (target) URL.revokeObjectURL(target.url);
      
      return { ...p, targets: p.targets.filter(r => r.id !== refId) };
    }));
  };

  const handleTargetUpdateModel = (promptId: string, refId: string, model: string) => {
    setPrompts(prev => prev.map(p => {
      if (p.id !== promptId) return p;
      return {
        ...p,
        targets: p.targets.map(t => t.id === refId ? { ...t, model } : t)
      };
    }));
  };

  // Simplified for preview only
  const generatePreviewData = () => ({
    prompts: prompts.map((p, idx) => ({
      case_folder: `case_${String(idx + 1).padStart(2, '0')}`,
      prompt: p.text,
      scope: p.scope,
      purpose: p.purpose,
      references: p.references.map((r, i) => {
        const ext = r.file.name.split('.').pop() || 'png';
        return `ref_${i + 1}.${ext}`;
      }),
      targets: p.targets.map((r, i) => {
        const ext = r.file.name.split('.').pop() || 'png';
        return `target_${i + 1}.${ext}`;
      })
    })),
    total_cases: prompts.length,
    timestamp: new Date().toISOString()
  });

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const hasMissingTargetModel = prompts.some(p => p.targets.some(t => t.model.trim() === ''));
      if (hasMissingTargetModel) {
        alert(t.targetModelRequired);
        setIsExporting(false);
        return;
      }

      const zip = new JSZip();
      const rootFolder = zip.folder(`RefEdit_Dataset_${new Date().toISOString().split('T')[0]}`);
      
      // Filter out empty prompts
      const validPrompts = prompts.filter(p => p.text.trim() !== '' || p.references.length > 0 || p.targets.length > 0);

      // Process each prompt as a separate case
      validPrompts.forEach((prompt, index) => {
        const caseFolderName = `case_${String(index + 1).padStart(2, '0')}`;
        const caseFolder = rootFolder?.folder(caseFolderName);

        if (!caseFolder) return;

        const referenceMapping: Array<{original: string, saved_as: string}> = [];

        // Save and Rename References
        prompt.references.forEach((ref, refIndex) => {
          const extension = ref.file.name.split('.').pop() || 'png';
          // Renaming to ref_1, ref_2 etc to match order
          const newFileName = `ref_${refIndex + 1}.${extension}`;
          
          caseFolder.file(newFileName, ref.file);
          
          referenceMapping.push({
            original: ref.file.name,
            saved_as: newFileName
          });
        });

        // Save and Rename Targets
        const targetMapping: Array<{original: string, saved_as: string, model: string}> = [];

        prompt.targets.forEach((ref, refIndex) => {
          const extension = ref.file.name.split('.').pop() || 'png';
          const newFileName = `target_${refIndex + 1}.${extension}`;
          
          caseFolder.file(newFileName, ref.file);
          
          targetMapping.push({
            original: ref.file.name,
            saved_as: newFileName,
            model: ref.model
          });
        });

        // Create Case Metadata
        const caseMetadata = {
          id: prompt.id,
          prompt: prompt.text,
          scope: prompt.scope,
          purpose: prompt.purpose,
          references: referenceMapping.map(r => r.saved_as),
          targets: targetMapping.map(r => r.saved_as),
          target_models: targetMapping.map(r => ({
            file: r.saved_as,
            model: r.model
          }))
        };

        caseFolder.file("metadata.json", JSON.stringify(caseMetadata, null, 2));
      });

      // Add a summary file at root
      const summary = {
        generated_at: new Date().toISOString(),
        total_cases: validPrompts.length,
        cases: validPrompts.map((p, i) => ({
          folder: `case_${String(i + 1).padStart(2, '0')}`,
          scope: p.scope
        }))
      };
      rootFolder?.file("dataset_summary.json", JSON.stringify(summary, null, 2));

      // Generate the zip
      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger Download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RefEdit_Dataset_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to create zip file. See console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const newPrompts: PromptEntry[] = [];
      const allZipPaths = Object.keys(zip.files);
      
      // Find all metadata.json files in the zip
      // Filter out MAC OS artifacts (._ files and __MACOSX folder)
      const metadataFiles = Object.keys(zip.files).filter(path => {
        const isMetadata = path.endsWith('metadata.json');
        const isMacArtifact = path.includes('__MACOSX') || path.split('/').pop()?.startsWith('._');
        return isMetadata && !isMacArtifact;
      });
      
      // Sort keys to maintain order (e.g., case_01/metadata.json comes before case_02/metadata.json)
      metadataFiles.sort();

      if (metadataFiles.length === 0) {
        throw new Error("No valid 'metadata.json' files found in the ZIP archive.");
      }

      const guessTargetFiles = (folderPath: string) => {
        const lowerFolder = folderPath.toLowerCase();
        return allZipPaths
          .filter(path => {
            const lowerPath = path.toLowerCase();
            if (!lowerPath.startsWith(lowerFolder)) return false;
            const fileName = lowerPath.slice(lowerFolder.length);
            if (fileName.includes('/')) return false;
            return /^target_\d+\.(png|jpe?g|webp|gif|bmp|svg)$/.test(fileName);
          })
          .sort();
      };

      for (const metadataPath of metadataFiles) {
        const fileData = await zip.file(metadataPath)?.async('string');
        if (!fileData) continue;

        try {
          const metadata = JSON.parse(fileData);
          
          // Determine the folder path of this metadata file
          // If metadataPath is "metadata.json", index is -1, substring(0, -1) -> "" (correct)
          // If metadataPath is "folder/metadata.json", index is 6, substring(0, 6) -> "folder/" (correct)
          const folderPath = metadataPath.substring(0, metadataPath.lastIndexOf('metadata.json'));
          
          const loadedReferences: ReferenceImage[] = [];
          const loadedTargets: TargetImage[] = [];

          if (Array.isArray(metadata.references)) {
            for (const refFilename of metadata.references) {
              // Construct the path to the image in the zip
              const imagePath = folderPath + refFilename;
              const imageFile = zip.file(imagePath);
              
              if (imageFile) {
                const blob = await imageFile.async('blob');
                // Determine mime type from extension
                const ext = refFilename.split('.').pop()?.toLowerCase() || 'png';
                const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
                const file = new File([blob], refFilename, { type: mimeType });
                
                loadedReferences.push({
                  id: Math.random().toString(36).substring(2, 9),
                  url: URL.createObjectURL(file),
                  file: file
                });
              } else {
                 console.warn(`Reference image not found in zip: ${imagePath}`);
              }
            }
          }

          const targetEntries = Array.isArray(metadata.targets)
            ? metadata.targets
            : guessTargetFiles(folderPath);

          const targetModels: Record<string, string> = {};
          if (Array.isArray(metadata.target_models)) {
            metadata.target_models.forEach((entry: any) => {
              if (entry?.file) targetModels[entry.file] = entry?.model || '';
            });
          }

          if (Array.isArray(targetEntries) && targetEntries.length > 0) {
            for (const entry of targetEntries) {
              const refFilename = typeof entry === 'string'
                ? entry
                : (entry?.file || entry?.saved_as || entry?.filename);
              if (!refFilename) continue;
              
              const imagePath = folderPath + refFilename;
              const imageFile = zip.file(imagePath);
              
              if (imageFile) {
                const blob = await imageFile.async('blob');
                const ext = refFilename.split('.').pop()?.toLowerCase() || 'png';
                const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
                const file = new File([blob], refFilename, { type: mimeType });
                
                loadedTargets.push({
                  id: Math.random().toString(36).substring(2, 9),
                  url: URL.createObjectURL(file),
                  file: file,
                  model: typeof entry === 'string'
                    ? (targetModels[refFilename] || '')
                    : (entry?.model || targetModels[refFilename] || '')
                });
              } else {
                console.warn(`Target image not found in zip: ${imagePath}`);
              }
            }
          }

          newPrompts.push({
            id: metadata.id || Math.random().toString(36).substring(2, 9),
            text: metadata.prompt || '',
            scope: metadata.scope || PRESET_SCOPES[0],
            purpose: metadata.purpose || '',
            references: loadedReferences,
            targets: loadedTargets
          });

        } catch (err) {
          console.warn(`Failed to parse metadata file: ${metadataPath}`, err);
        }
      }

      if (newPrompts.length > 0) {
        // Cleanup existing object URLs
        prompts.forEach(p => {
          p.references.forEach(r => URL.revokeObjectURL(r.url));
          p.targets.forEach(r => URL.revokeObjectURL(r.url));
        });
        setPrompts(newPrompts);
        const hasMissingTargetModel = newPrompts.some(p => p.targets.some(t => t.model.trim() === ''));
        if (hasMissingTargetModel) {
          alert(t.targetModelMissingOnImport);
        }
      } else {
        throw new Error("No valid data could be parsed from the metadata files.");
      }

    } catch (error: any) {
      console.error("Import failed:", error);
      alert(`Failed to import dataset: ${error.message}`);
    } finally {
      setIsImporting(false);
      // Reset input
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-col h-screen w-screen bg-orange-50 dark:bg-slate-950 text-stone-800 dark:text-slate-100 font-sans transition-colors duration-300">
        {/* Header */}
        <header className="h-14 border-b border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 dark:bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 dark:shadow-indigo-500/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">Ref-Edit <span className="text-orange-500 dark:text-indigo-400 font-light">{t.titleSuffix}</span></h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="p-2 text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-indigo-400 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-1"
              title={lang === 'zh' ? "Switch to English" : "切换到中文"}
            >
              <LanguagesIcon className="w-5 h-5" />
              <span className="text-xs font-bold w-4">{lang === 'zh' ? 'CN' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
             <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-stone-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-yellow-400 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-2"
              title="Toggle Theme"
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setShowJsonPreview(true)}
              className="text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              {t.preview}
            </button>
            
            <input 
              type="file" 
              ref={importInputRef} 
              onChange={handleImport} 
              accept=".zip" 
              className="hidden" 
            />
            
            <button 
              onClick={() => importInputRef.current?.click()}
              disabled={isImporting || isExporting}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-all shadow-sm border border-stone-200 dark:border-slate-700"
            >
              {isImporting ? (
                 <div className="w-4 h-4 border-2 border-stone-400 dark:border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <ImportIcon className="w-4 h-4" />
              )}
              {isImporting ? t.importing : t.import}
            </button>

            <button 
              onClick={handleExport}
              disabled={isExporting || isImporting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg 
                ${isExporting 
                  ? 'bg-stone-200 dark:bg-slate-700 text-stone-500 dark:text-slate-400 cursor-wait' 
                  : 'bg-stone-800 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 hover:shadow-xl'}`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-400 dark:border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  {t.zipping}
                </>
              ) : (
                <>
                  <DownloadIcon className="w-4 h-4" />
                  {t.export}
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-h-0 bg-transparent relative">
          <AnnotationPanel 
            prompts={prompts}
            onAddPrompt={handleAddPrompt}
            onRemovePrompt={handleRemovePrompt}
            onUpdatePrompt={handleUpdatePrompt}
            onClonePrompt={handleClonePrompt}
            onRefUpload={handleRefUpload}
            onRefRemove={handleRefRemove}
            onTargetUpload={handleTargetUpload}
            onTargetRemove={handleTargetRemove}
            onTargetUpdateModel={handleTargetUpdateModel}
            lang={lang}
          />
        </main>

        {/* JSON Preview Modal */}
        {showJsonPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-stone-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center p-4 border-b border-stone-200 dark:border-slate-800">
                <h3 className="font-mono text-sm text-indigo-600 dark:text-indigo-400">Dataset Structure Preview</h3>
                <button onClick={() => setShowJsonPreview(false)} className="text-stone-400 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-stone-50 dark:bg-slate-950">
                <pre className="font-mono text-xs text-green-600 dark:text-green-400">
                  {JSON.stringify(generatePreviewData(), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;