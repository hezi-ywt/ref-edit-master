export interface ReferenceImage {
  id: string;
  url: string;
  file: File;
}

export interface PromptEntry {
  id: string;
  text: string;      // The prompt content
  scope: string;     // Task Scope (e.g., Object Replacement)
  purpose: string;   // Purpose/Description
  references: ReferenceImage[]; // References specific to this prompt
}

export interface DatasetEntry {
  prompts: PromptEntry[];
  timestamp: number;
}

// Renamed from PRESET_TASK_LABELS to define scopes
export const PRESET_SCOPES = [
  'Style Transfer (风格迁移)',
  'Object Replacement (物体替换)',
  'Character Reference (角色参考)',
  'Worldview & Scenario (世界观与场景)',
  'Text & Layout (文字与排版)',
  'Comics/Manga (漫画/分镜生成)',
  'Corner Cases (高难度综合题)',
];