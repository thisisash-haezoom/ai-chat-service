"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  ListOrdered,
  List,
  TextQuote,
  Code,
  SquareTerminal,
  Send,
  Plus,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";

type ChannelMember = {
  name: string;
  role: string;
  roleColor: string;
};

const CHANNEL_MEMBERS: ChannelMember[] = [
  { name: "James (PM)", role: "PM", roleColor: "#007acc" },
  { name: "Sarah (Designer)", role: "DESIGNER", roleColor: "#ffbd2e" },
  { name: "Kevin (Backend Engineer)", role: "BACKEND", roleColor: "#27c93f" },
  { name: "Alex (Frontend Engineer)", role: "FRONTEND", roleColor: "#4bb3fd" },
  { name: "Ryan (Data Engineer)", role: "DATA", roleColor: "#c586c0" },
  { name: "Emma (QA Engineer)", role: "QA", roleColor: "#e36209" },
];

interface ChatEditorProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatEditor({
  onSend,
  placeholder = "#main.chat에 메시지 보내기",
  disabled = false,
}: ChatEditorProps) {
  const [showMention, setShowMention] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [hasContent, setHasContent] = useState(false);
  const [, setRenderTick] = useState(0);
  const mentionRef = useRef<HTMLDivElement>(null);

  const filteredMembers = CHANNEL_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        dropcursor: false,
        gapcursor: false,
        // Disable default enter behavior to control it via editorProps
        // Actually, we want to keep it and only override in handleKeyDown
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "w-full bg-[#1e1e1e] p-3 text-[14px] text-[#cccccc] outline-none font-sans min-h-[50px] max-h-[250px] overflow-y-auto focus:outline-none",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Enter") {
          // 1. Mention navigation (highest priority)
          if (showMention && filteredMembers.length > 0) {
            if (event.key === "Enter") {
              event.preventDefault();
              handleMentionSelect(filteredMembers[mentionIndex]);
              return true;
            }
          }

          if (event.shiftKey) {
            // === RULE 2: Shift+Enter = ALWAYS new line / continue block ===
            event.preventDefault();
            
            if (editor?.isActive("listItem")) {
              // Slack-like: Shift+Enter in list creates a NEW ITEM to continue the list
              editor.chain().focus().splitListItem("listItem").run();
            } else if (editor?.isActive("codeBlock")) {
              // In code block, Shift+Enter just adds a newline
              editor.chain().focus().newlineInCode().run();
            } else if (editor?.isActive("blockquote")) {
              // In blockquote, Shift+Enter adds a hard break to stay within the quote
              editor.chain().focus().setHardBreak().run();
            } else {
              // Default Shift+Enter
              editor?.chain().focus().setHardBreak().run();
            }
            return true;
          } else {
            // === RULE 1: Enter = Send UNLESS in special context ===
            // Following user's "enter로 전송은 되는데" and "그냥 enter는 무조건 enter야"
            // To be Slack-like: Enter in list -> New item. Enter in code -> New line.
            // But if NOT in those, Enter -> Send.
            
            const isSpecial = editor?.isActive("listItem") || editor?.isActive("codeBlock") || editor?.isActive("blockquote");
            
            if (isSpecial) {
              // Let TipTap handle it (new item / newline)
              return false; 
            } else {
              // Regular text: Enter sends the message
              event.preventDefault();
              doSendInternal();
              return true;
            }
          }
        }

        // Mention navigation keys
        if (showMention && filteredMembers.length > 0) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setMentionIndex((prev) => Math.min(prev + 1, filteredMembers.length - 1));
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setMentionIndex((prev) => Math.max(prev - 1, 0));
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setShowMention(false);
            return true;
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      // "텍스트에디터가 공백을 포함하여 1자라도 있는 순간 send 가능"
      // !ed.isEmpty check is safer than text.length because it accounts for nodes like code blocks
      setHasContent(!ed.isEmpty || ed.getText().length > 0);

      // Detect @ for mention
      const cursorPos = ed.state.selection.from;
      const docText = ed.state.doc.textBetween(0, cursorPos, "\n");
      const atIndex = docText.lastIndexOf("@");

      if (atIndex !== -1) {
        const afterAt = docText.substring(atIndex + 1);
        const charBefore = atIndex > 0 ? docText[atIndex - 1] : " ";
        if ((charBefore === " " || charBefore === "\n" || atIndex === 0) && !afterAt.includes(" ")) {
          setShowMention(true);
          setMentionFilter(afterAt);
          setMentionIndex(0);
          return;
        }
      }
      setShowMention(false);
      setMentionFilter("");
    },
    onSelectionUpdate: () => setRenderTick((t) => t + 1),
    onTransaction: () => setRenderTick((t) => t + 1),
  });

  // Use a stable reference for sending to avoid stale closure issues in handleKeyDown
  const doSendInternal = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    // Check content again just in case
    if (editor.isEmpty && editor.getText().trim().length === 0) return;

    onSend(html);
    editor.commands.clearContent();
    setHasContent(false);
  }, [editor, onSend]);

  const handleMentionSelect = (member: ChannelMember) => {
    if (!editor) return;
    const cursorPos = editor.state.selection.from;
    const docText = editor.state.doc.textBetween(0, cursorPos, "\n");
    const atIndex = docText.lastIndexOf("@");

    if (atIndex !== -1) {
      editor.chain().focus()
        .deleteRange({ from: atIndex + 1, to: cursorPos + 1 })
        .insertContent(`<strong style="color: ${member.roleColor}">@${member.name}</strong> `)
        .run();
    }
    setShowMention(false);
    setMentionFilter("");
  };

  if (!editor) return null;

  const isActive = (name: string) => editor.isActive(name);

  return (
    <div className={cn("w-full bg-[#1e1e1e] border border-[#333] focus-within:border-[#007acc]/70 rounded-md overflow-hidden transition-colors flex flex-col", disabled && "opacity-50 pointer-events-none")}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[#252526] border-b border-[#333]">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={isActive("bold")} title="Bold"><Bold size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={isActive("italic")} title="Italic"><Italic size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={isActive("underline")} title="Underline"><UnderlineIcon size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={isActive("strike")} title="Strikethrough"><Strikethrough size={15} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => {
          const url = window.prompt("URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} active={isActive("link")} title="Link"><LinkIcon size={15} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={isActive("orderedList")} title="Ordered List"><ListOrdered size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={isActive("bulletList")} title="Bullet List"><List size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={isActive("blockquote")} title="Block Quote"><TextQuote size={15} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={isActive("code")} title="Inline Code"><Code size={15} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={isActive("codeBlock")} title="Code Block"><SquareTerminal size={15} /></ToolBtn>
      </div>

      <div className="relative" ref={mentionRef}>
        {showMention && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-0 bg-[#252526] border border-[#444] rounded-t-md shadow-xl z-50 max-h-[200px] overflow-y-auto">
            {filteredMembers.map((member, i) => (
              <button key={member.name} onClick={() => handleMentionSelect(member)} className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#37373d] transition-colors", i === mentionIndex && "bg-[#37373d]")}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${member.roleColor}20`, color: member.roleColor }}>{member.name[0]}</div>
                <div className="flex-1"><span className="text-[13px] font-semibold text-white">{member.name}</span></div>
                <span className="text-[9px] px-1.5 py-0.5 border rounded uppercase font-bold tracking-wider" style={{ borderColor: `${member.roleColor}40`, color: member.roleColor }}>{member.role}</span>
              </button>
            ))}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between p-2 pl-3 bg-[#1e1e1e]">
        <div className="flex items-center gap-1">
          <button className="flex items-center justify-center w-6 h-6 rounded-full bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#cccccc] transition-colors"><Plus size={14} /></button>
          <div className="w-[1px] h-4 bg-[#444] mx-2"></div>
          <button onClick={() => { editor?.chain().focus().insertContent("@").run(); setShowMention(true); }} className="p-1 px-1.5 hover:bg-[#333] rounded text-[#b4b4b4] hover:text-white transition-colors"><AtSign size={15} /></button>
        </div>
        <button onClick={doSendInternal} disabled={!hasContent} className={cn("p-1.5 px-3 rounded text-[13px] font-bold flex items-center gap-1.5 transition-colors", hasContent ? "bg-[#007a5a] text-white hover:bg-[#148567] cursor-pointer" : "bg-[#252526] text-[#858585] cursor-not-allowed")}><Send size={14} /></button>
      </div>
    </div>
  );
}

function ToolBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button onMouseDown={(e) => { e.preventDefault(); onClick(); }} className={cn("p-1.5 px-1.5 rounded transition-all duration-100", active ? "bg-[#007acc]/30 text-white ring-1 ring-[#007acc]/50" : "text-[#b4b4b4] hover:bg-[#333] hover:text-white")} title={title}>{children}</button>
  );
}

function Divider() { return <div className="w-[1px] h-4 bg-[#444] mx-1" />; }
