"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MeetingContext, Material } from "../types/meetingContext";

interface MeetingPreparationProps {
  onContextChange?: (context: MeetingContext) => void;
}

export default function MeetingPreparation({ onContextChange }: MeetingPreparationProps) {
  const [context, setContext] = useState<MeetingContext>({
    id: Date.now().toString(),
    title: "",
    backgroundInfo: "",
    agenda: [""],
    participants: [""],
    materials: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateContext = useCallback((updates: Partial<MeetingContext>) => {
    setContext(prevContext => {
      const newContext = {
        ...prevContext,
        ...updates,
        updatedAt: new Date()
      };
      return newContext;
    });
  }, []);

  // Use useEffect to notify parent of context changes
  useEffect(() => {
    if (onContextChange) {
      onContextChange(context);
    }
  }, [context, onContextChange]);

  const handleAddAgendaItem = () => {
    updateContext({
      agenda: [...context.agenda, ""]
    });
  };

  const handleUpdateAgendaItem = (index: number, value: string) => {
    const newAgenda = [...context.agenda];
    newAgenda[index] = value;
    updateContext({ agenda: newAgenda });
  };

  const handleRemoveAgendaItem = (index: number) => {
    if (context.agenda.length > 1) {
      const newAgenda = context.agenda.filter((_, i) => i !== index);
      updateContext({ agenda: newAgenda });
    }
  };

  const handleAddParticipant = () => {
    updateContext({
      participants: [...context.participants, ""]
    });
  };

  const handleUpdateParticipant = (index: number, value: string) => {
    const newParticipants = [...context.participants];
    newParticipants[index] = value;
    updateContext({ participants: newParticipants });
  };

  const handleRemoveParticipant = (index: number) => {
    if (context.participants.length > 1) {
      const newParticipants = context.participants.filter((_, i) => i !== index);
      updateContext({ participants: newParticipants });
    }
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    
    const newMaterials: Material[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const material: Material = {
        id: Date.now().toString() + i,
        type: 'file',
        name: file.name,
        originalName: file.name,
        content: '',
        fileSize: file.size,
        mimeType: file.type,
        extractedAt: new Date(),
        status: 'processing'
      };

      newMaterials.push(material);
    }

    // Add all materials at once with processing status
    setContext(prevContext => ({
      ...prevContext,
      materials: [...prevContext.materials, ...newMaterials],
      updatedAt: new Date()
    }));

    // Process each file
    for (let i = 0; i < newMaterials.length; i++) {
      const material = newMaterials[i];
      const file = files[i];

      try {
        // Process file based on type
        let extractedContent = '';
        
        if (file.type.startsWith('text/')) {
          extractedContent = await file.text();
        } else if (file.type === 'application/pdf') {
          extractedContent = `[PDF] ${file.name} - PDF処理機能は実装中です\n\nファイル情報:\n- サイズ: ${(file.size / 1024).toFixed(1)} KB\n- 種類: ${file.type}`;
        } else if (file.type.includes('officedocument') || file.type.includes('ms-')) {
          extractedContent = `[Office] ${file.name} - Office文書処理機能は実装中です\n\nファイル情報:\n- サイズ: ${(file.size / 1024).toFixed(1)} KB\n- 種類: ${file.type}`;
        } else if (file.type.startsWith('image/')) {
          extractedContent = `[画像] ${file.name} - OCR機能は実装中です\n\nファイル情報:\n- サイズ: ${(file.size / 1024).toFixed(1)} KB\n- 種類: ${file.type}`;
        } else {
          extractedContent = `[${file.type}] ${file.name} - サポートされていないファイル形式\n\nファイル情報:\n- サイズ: ${(file.size / 1024).toFixed(1)} KB`;
        }

        // Update specific material status
        setContext(prevContext => ({
          ...prevContext,
          materials: prevContext.materials.map(m => 
            m.id === material.id 
              ? { ...m, content: extractedContent, status: 'completed' as const }
              : m
          ),
          updatedAt: new Date()
        }));

      } catch (error) {
        console.error('File processing error:', error);
        setContext(prevContext => ({
          ...prevContext,
          materials: prevContext.materials.map(m => 
            m.id === material.id 
              ? { ...m, status: 'error' as const, error: 'ファイル処理中にエラーが発生しました' }
              : m
          ),
          updatedAt: new Date()
        }));
      }
    }

    setIsProcessing(false);
  }, []);

  const handleUrlFetch = useCallback(async () => {
    if (!urlInput.trim()) return;
    
    const currentUrl = urlInput.trim();
    setIsProcessing(true);
    
    const material: Material = {
      id: Date.now().toString(),
      type: 'url',
      name: currentUrl,
      url: currentUrl,
      content: '',
      extractedAt: new Date(),
      status: 'processing'
    };

    // Add material with processing status
    setContext(prevContext => ({
      ...prevContext,
      materials: [...prevContext.materials, material],
      updatedAt: new Date()
    }));

    try {
      // 簡易的なURL検証
      new URL(currentUrl); // URLの形式をチェック
      
      // 現時点では基本的な情報のみを保存（将来的にWebスクレイピング機能を追加予定）
      const extractedContent = `[Webサイト] ${currentUrl}\n\nURL情報:\n- サイト: ${currentUrl}\n- 登録日時: ${new Date().toLocaleString()}\n\n※ Webページの自動取得機能は今後実装予定です。現在は手動でページ内容をコピーして背景情報欄に追加してください。`;
      
      // Update material status
      setContext(prevContext => ({
        ...prevContext,
        materials: prevContext.materials.map(m => 
          m.id === material.id 
            ? { ...m, content: extractedContent, status: 'completed' as const }
            : m
        ),
        updatedAt: new Date()
      }));
      
      // Clear URL input after successful addition
      setUrlInput("");
    } catch (error) {
      console.error('URL fetch error:', error);
      setContext(prevContext => ({
        ...prevContext,
        materials: prevContext.materials.map(m => 
          m.id === material.id 
            ? { ...m, status: 'error' as const, error: 'URL形式が正しくありません' }
            : m
        ),
        updatedAt: new Date()
      }));
    }

    setIsProcessing(false);
  }, [urlInput]);

  const handleRemoveMaterial = (materialId: string) => {
    updateContext({
      materials: context.materials.filter(m => m.id !== materialId)
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">会議準備</h2>
            <p className="text-blue-100 text-sm">事前情報・資料の準備</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 会議タイトル */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            会議タイトル
          </label>
          <input
            type="text"
            value={context.title}
            onChange={(e) => updateContext({ title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="会議のタイトルを入力..."
          />
        </div>

        {/* 背景情報 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            会議の背景・目的
          </label>
          <textarea
            value={context.backgroundInfo}
            onChange={(e) => updateContext({ backgroundInfo: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="会議の背景情報や目的を入力..."
          />
        </div>

        {/* アジェンダ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              アジェンダ
            </label>
            <button
              onClick={handleAddAgendaItem}
              className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50"
            >
              + 項目追加
            </button>
          </div>
          <div className="space-y-2">
            {context.agenda.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateAgendaItem(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="アジェンダ項目を入力..."
                />
                <button
                  onClick={() => handleRemoveAgendaItem(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  disabled={context.agenda.length === 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 参加者 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              参加者
            </label>
            <button
              onClick={handleAddParticipant}
              className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50"
            >
              + 参加者追加
            </button>
          </div>
          <div className="space-y-2">
            {context.participants.map((participant, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={participant}
                  onChange={(e) => handleUpdateParticipant(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="参加者名を入力..."
                />
                <button
                  onClick={() => handleRemoveParticipant(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  disabled={context.participants.length === 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ファイルアップロード */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            関連資料
          </label>
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              ファイルをドラッグ&ドロップまたは
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              disabled={isProcessing}
            >
              ファイルを選択
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files);
                }
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.gif,.bmp,.tiff"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              対応形式: PDF, Office文書, テキスト, 画像ファイル
            </p>
          </div>
        </div>

        {/* URL追加 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            関連Webサイト
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
            <button
              onClick={handleUrlFetch}
              disabled={isProcessing || !urlInput.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </div>
        </div>

        {/* アップロード済み資料一覧 */}
        {context.materials.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              アップロード済み資料 ({context.materials.length})
            </label>
            <div className="space-y-2">
              {context.materials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      material.status === 'completed' ? 'bg-green-500' :
                      material.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {material.name}
                      </p>
                      {material.status === 'error' && material.error && (
                        <p className="text-xs text-red-500">{material.error}</p>
                      )}
                      {material.status === 'completed' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {material.content.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMaterial(material.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}