"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const toolbarActions = [
  { label: "Negrita", command: "bold" },
  { label: "Itálica", command: "italic" },
  { label: "Subrayar", command: "underline" },
  { label: "Lista", command: "insertUnorderedList" },
  { label: "Enlace", command: "createLink", prompt: "URL del enlace" },
];

export default function RichTextEditor({ name, defaultValue = "" }) {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(defaultValue);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue;
      setHtml(defaultValue);
    }
  }, [defaultValue]);

  const applyCommand = (action) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (action.prompt) {
      const value = window.prompt(action.prompt);
      if (value) {
        document.execCommand(action.command, false, value);
      }
    } else {
      document.execCommand(action.command, false, undefined);
    }
    setHtml(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    setHtml(editorRef.current.innerHTML);
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-inner shadow-sky-900/10 backdrop-blur">
        {toolbarActions.map((action) => (
          <Button
            key={action.command}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => applyCommand(action)}
            className="rounded-xl border-sky-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:-translate-y-px hover:bg-sky-50/80"
          >
            {action.label}
          </Button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="min-h-[220px] rounded-3xl border border-white/70 bg-white/80 p-4 text-base text-slate-800 shadow-lg shadow-sky-900/10 transition focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2"
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
      <textarea name={name} value={html} readOnly hidden />
    </div>
  );
}
