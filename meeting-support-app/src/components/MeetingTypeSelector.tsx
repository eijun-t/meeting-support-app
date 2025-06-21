"use client";

import { useState } from "react";

export type MeetingType = "in-person" | "online";

interface MeetingTypeSelectorProps {
  selectedType: MeetingType;
  onTypeChange: (type: MeetingType) => void;
}

export default function MeetingTypeSelector({ selectedType, onTypeChange }: MeetingTypeSelectorProps) {
  const meetingTypes = [
    {
      id: "in-person" as MeetingType,
      title: "対面会議",
      description: "マイク音声を使用",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      features: ["マイク音声", "話者認識", "ノイズキャンセル"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "online" as MeetingType,
      title: "オンラインMTG",
      description: "システム音声を使用",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      features: ["システム音声", "画面音声キャプチャ", "Zoom/Teams対応"],
      color: "from-emerald-500 to-green-600"
    }
  ];

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">音声入力:</span>
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {meetingTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedType === type.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="w-4 h-4">
                {type.icon}
              </div>
              <span>{type.title}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {selectedType === "in-person" ? "マイク音声を使用" : "システム音声を使用"}
      </div>
    </div>
  );
}