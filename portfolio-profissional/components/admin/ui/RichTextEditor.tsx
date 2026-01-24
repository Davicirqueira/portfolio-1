"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react"
import { Button } from "@/components/ui/Button"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Digite seu texto aqui...",
  minHeight = "200px",
  className = ""
}: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [selectedText, setSelectedText] = useState("")

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }

  const handleSelectionChange = () => {
    const selection = window.getSelection()
    if (selection) {
      setSelectedText(selection.toString())
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
      handleInput()
    }
  }

  const insertLink = () => {
    const url = prompt("Digite a URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const formatBlock = (tag: string) => {
    execCommand("formatBlock", tag)
  }

  if (!isClient) {
    return (
      <div 
        className={`w-full border border-border rounded-lg bg-background ${className}`}
        style={{ minHeight }}
      >
        <div className="p-4 text-muted-foreground">
          Carregando editor...
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full border border-border rounded-lg bg-background ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        {/* Formatação de Texto */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("bold")}
            className="h-8 w-8 p-0"
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("italic")}
            className="h-8 w-8 p-0"
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("underline")}
            className="h-8 w-8 p-0"
            title="Sublinhado"
          >
            <Underline className="w-4 h-4" />
          </Button>
        </div>

        {/* Listas */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertUnorderedList")}
            className="h-8 w-8 p-0"
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertOrderedList")}
            className="h-8 w-8 p-0"
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        {/* Alinhamento */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("justifyLeft")}
            className="h-8 w-8 p-0"
            title="Alinhar à esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("justifyCenter")}
            className="h-8 w-8 p-0"
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("justifyRight")}
            className="h-8 w-8 p-0"
            title="Alinhar à direita"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Formatação de Bloco */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatBlock("blockquote")}
            className="h-8 w-8 p-0"
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertLink}
            className="h-8 w-8 p-0"
            title="Inserir link"
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>

        {/* Títulos */}
        <div className="flex items-center gap-1">
          <select
            onChange={(e) => formatBlock(e.target.value)}
            className="h-8 px-2 text-sm border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            defaultValue=""
          >
            <option value="">Parágrafo</option>
            <option value="h1">Título 1</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
            <option value="h4">Título 4</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        className="p-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset text-foreground"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          line-height: 1.2;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
          line-height: 1.3;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
          line-height: 1.4;
        }
        
        [contenteditable] h4 {
          font-size: 1.125rem;
          font-weight: bold;
          margin: 0.625rem 0;
          line-height: 1.4;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
          line-height: 1.5;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        [contenteditable] a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          text-decoration: none;
        }
        
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}