import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, ChevronDownIcon, CopyIcon } from './Icons';
import { PromptEntry, PRESET_SCOPES, PRESET_MODEL_NAMES } from '../types';
import { ReferencePool } from './ReferencePool';

interface AnnotationPanelProps {
  prompts: PromptEntry[];
  onAddPrompt: () => void;
  onRemovePrompt: (id: string) => void;
  onUpdatePrompt: (id: string, field: keyof PromptEntry, value: string) => void;
  onClonePrompt: (id: string) => void;
  onAddPromptText: (id: string) => void;
  onRemovePromptText: (id: string, index: number) => void;
  onUpdatePromptText: (id: string, index: number, value: string) => void;
  onRefUpload: (promptId: string, files: FileList) => void;
  onRefRemove: (promptId: string, refId: string) => void;
  onTargetUpload: (promptId: string, files: FileList) => void;
  onTargetRemove: (promptId: string, refId: string) => void;
  onTargetUpdateModel: (promptId: string, refId: string, model: string) => void;
  lang?: 'en' | 'zh';
}

const TEXT = {
  en: {
    listTitle: "Prompts & Tasks",
    listDesc: "Define editing prompts with specific references, task scopes and goals.",
    addPrompt: "Add Prompt",
    promptEntry: "Prompt Entry",
    clone: "Clone",
    promptContent: "Prompt Content",
    promptPlaceholder: "e.g., Change the background to a cyberpunk city night scene...",
    addPromptText: "Add Variant",
    removePromptText: "Remove",
    promptVariant: "Variant",
    taskScope: "Task Scope",
    scopePlaceholder: "Select or type custom scope...",
    purpose: "Purpose / Goal",
    purposePlaceholder: "e.g., Test subject identity retention...",
    addNew: "Add New Prompt Entry",
    customScope: "Type above to create custom scope...",
    targetTitle: "Target Results",
    targetEmpty: "Drag & drop or click Add",
    targetAdd: "Add",
    targetModelPlaceholder: "Model name"
  },
  zh: {
    listTitle: "指令与任务",
    listDesc: "定义包含具体参考图、任务范围和目标的编辑指令。",
    addPrompt: "添加指令",
    promptEntry: "指令条目",
    clone: "克隆",
    promptContent: "指令内容",
    promptPlaceholder: "例如：将背景修改为赛博朋克风格的城市夜景...",
    addPromptText: "添加变体",
    removePromptText: "删除",
    promptVariant: "变体",
    taskScope: "任务范围",
    scopePlaceholder: "选择或输入自定义范围...",
    purpose: "目的 / 目标",
    purposePlaceholder: "例如：测试主体人物的一致性保持...",
    addNew: "添加新指令条目",
    customScope: "在上方输入以创建自定义范围...",
    targetTitle: "目标结果",
    targetEmpty: "拖拽或点击添加",
    targetAdd: "添加",
    targetModelPlaceholder: "模型名称"
  }
};

// Internal component for the custom dropdown
const TaskScopeSelector = ({ value, onChange, t }: { value: string, onChange: (val: string) => void, t: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          placeholder={t.scopePlaceholder}
          className="w-full bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm text-stone-800 dark:text-slate-200 focus:outline-none focus:border-orange-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-orange-500/50 dark:focus:ring-indigo-500/50 placeholder-stone-400 dark:placeholder-slate-600 transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-0 top-0 h-full px-3 text-stone-500 dark:text-slate-500 hover:text-orange-500 dark:hover:text-indigo-400 flex items-center justify-center transition-colors"
        >
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg shadow-xl shadow-stone-300/50 dark:shadow-black/50 max-h-60 overflow-y-auto overflow-x-hidden">
          {PRESET_SCOPES.map((scope) => (
            <div
              key={scope}
              onClick={() => {
                onChange(scope);
                setIsOpen(false);
              }}
              className="px-3 py-2.5 text-sm text-stone-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-indigo-600 hover:text-orange-700 dark:hover:text-white cursor-pointer transition-colors border-b border-stone-100 dark:border-slate-700/50 last:border-0"
            >
              {scope}
            </div>
          ))}
          <div className="px-3 py-2 text-xs text-stone-500 dark:text-slate-500 bg-stone-50 dark:bg-slate-900/50 border-t border-stone-100 dark:border-slate-700 italic">
            {t.customScope}
          </div>
        </div>
      )}
    </div>
  );
};

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  prompts,
  onAddPrompt,
  onRemovePrompt,
  onUpdatePrompt,
  onClonePrompt,
  onAddPromptText,
  onRemovePromptText,
  onUpdatePromptText,
  onRefUpload,
  onRefRemove,
  onTargetUpload,
  onTargetRemove,
  onTargetUpdateModel,
  lang = 'zh'
}) => {
  const t = TEXT[lang];

  return (
    <div className="h-full flex flex-col bg-transparent px-6 py-6">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-stone-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            {t.listTitle}
          </h2>
          <p className="text-xs text-stone-500 dark:text-slate-500 mt-1">{t.listDesc}</p>
        </div>
        <button 
          onClick={onAddPrompt}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-stone-500/20 dark:shadow-indigo-500/20"
        >
          <PlusIcon className="w-4 h-4" /> {t.addPrompt}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          {prompts.map((item, idx) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-orange-300 dark:hover:border-slate-700 transition-colors group relative overflow-hidden">
              
              {/* Header: Index & Controls */}
              <div className="flex justify-between items-center px-4 py-2 bg-stone-50/80 dark:bg-slate-950/50 border-b border-stone-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-slate-800 text-xs font-mono text-orange-600 dark:text-indigo-400 border border-stone-200 dark:border-slate-700 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider">{t.promptEntry}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onClonePrompt(item.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-indigo-300 hover:bg-stone-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Clone this prompt entry"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    {t.clone}
                  </button>
                  {prompts.length > 1 && (
                    <button
                      onClick={() => onRemovePrompt(item.id)}
                      className="p-1.5 text-stone-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete Prompt"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Left: Content Input */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-stone-500 dark:text-slate-500 uppercase">{t.promptContent}</label>
                      <button
                        onClick={() => onAddPromptText(item.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 dark:text-indigo-400 hover:text-orange-700 dark:hover:text-indigo-300 hover:bg-orange-50 dark:hover:bg-indigo-500/10 rounded transition-colors"
                      >
                        <PlusIcon className="w-3 h-3" />
                        {t.addPromptText}
                      </button>
                    </div>
                    {item.texts.map((text, textIndex) => (
                      <div key={textIndex} className="flex gap-2">
                        <div className="flex-1 relative">
                          {item.texts.length > 1 && (
                            <span className="absolute -left-6 top-3 text-xs text-stone-400 dark:text-slate-600 font-mono">
                              {textIndex + 1}
                            </span>
                          )}
                          <textarea
                            value={text}
                            onChange={(e) => onUpdatePromptText(item.id, textIndex, e.target.value)}
                            placeholder={t.promptPlaceholder}
                            className="w-full h-20 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 rounded-lg p-3 text-sm text-stone-800 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-700 focus:outline-none focus:border-orange-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-orange-500/50 dark:focus:ring-indigo-500/50 resize-y transition-all leading-relaxed"
                          />
                        </div>
                        {item.texts.length > 1 && (
                          <button
                            onClick={() => onRemovePromptText(item.id, textIndex)}
                            className="shrink-0 h-8 px-2 text-xs text-stone-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded transition-colors"
                            title={t.removePromptText}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Nested Reference Pool */}
                  <div className="flex-1">
                     <ReferencePool 
                        references={item.references}
                        onUpload={(files) => onRefUpload(item.id, files)}
                        onRemove={(refId) => onRefRemove(item.id, refId)}
                        lang={lang}
                     />
                  </div>
                </div>

                {/* Right: Metadata & Scope */}
                <div className="lg:col-span-5 flex flex-col gap-4 bg-stone-50/50 dark:bg-slate-950/30 rounded-lg p-4 border border-stone-200/60 dark:border-slate-800/50">
                  
                  {/* Task Scope with Custom Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-stone-500 dark:text-slate-500 uppercase">{t.taskScope}</label>
                    <TaskScopeSelector 
                      value={item.scope} 
                      onChange={(val) => onUpdatePrompt(item.id, 'scope', val)}
                      t={t}
                    />
                  </div>

                  {/* Purpose Description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-stone-500 dark:text-slate-500 uppercase">{t.purpose}</label>
                    <textarea
                      value={item.purpose}
                      onChange={(e) => onUpdatePrompt(item.id, 'purpose', e.target.value)}
                      placeholder={t.purposePlaceholder}
                      className="w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-lg p-3 text-sm text-stone-800 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-700 focus:outline-none focus:border-orange-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-orange-500/50 dark:focus:ring-indigo-500/50 resize-y min-h-[60px] max-h-[120px]"
                    />
                  </div>

                  {/* Target Results */}
                  <div className="flex flex-col gap-2">
                    <ReferencePool
                      references={item.targets}
                      onUpload={(files) => onTargetUpload(item.id, files)}
                      onRemove={(refId) => onTargetRemove(item.id, refId)}
                      compact
                      lang={lang}
                      labels={{
                        title: t.targetTitle,
                        empty: t.targetEmpty,
                        add: t.targetAdd,
                        modelPlaceholder: t.targetModelPlaceholder
                      }}
                      showModel
                      onUpdateModel={(refId, model) => onTargetUpdateModel(item.id, refId, model)}
                      modelOptions={PRESET_MODEL_NAMES}
                    />
                  </div>
                </div>
              </div>

            </div>
          ))}
          
          <div 
            onClick={onAddPrompt}
            className="group cursor-pointer border-2 border-dashed border-stone-300 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-stone-400 dark:text-slate-600 hover:border-orange-400 dark:hover:border-indigo-500/30 hover:bg-orange-50/50 dark:hover:bg-slate-900/50 transition-all"
          >
            <div className="p-3 rounded-full bg-stone-100 dark:bg-slate-900 group-hover:scale-110 transition-transform mb-2">
              <PlusIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-stone-500 dark:text-slate-500 group-hover:text-orange-500 dark:group-hover:text-indigo-400">{t.addNew}</span>
          </div>

        </div>
      </div>
    </div>
  );
};