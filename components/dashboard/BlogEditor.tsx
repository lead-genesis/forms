"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import {
    Bold, Italic, List, ListOrdered, Heading1, Heading2,
    Image as ImageIcon, Link as LinkIcon, Underline as UnderlineIcon,
    Quote, Code, Redo, Undo
} from "lucide-react";

interface BlogEditorProps {
    content: any;
    onChange: (content: any) => void;
    placeholder?: string;
}

const MenuButton = ({
    onClick,
    active,
    disabled,
    children,
    title
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
            "p-2 rounded-lg transition-colors hover:bg-secondary/80",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        {children}
    </button>
);

export const BlogEditor = ({ content, onChange, placeholder = "Start writing your blog post..." }: BlogEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline cursor-pointer",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-xl max-w-full h-auto my-6 border border-border/50 shadow-sm",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
    });

    if (!editor) {
        return <div className="h-64 rounded-2xl bg-secondary/30 animate-pulse border border-border/50" />;
    }

    const addImage = () => {
        const url = window.prompt("Enter image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className="w-full border border-border/50 rounded-2xl overflow-hidden bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50 bg-secondary/5">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="Underline"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </MenuButton>

                <div className="w-px h-6 bg-border mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </MenuButton>

                <div className="w-px h-6 bg-border mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </MenuButton>

                <div className="w-px h-6 bg-border mx-1" />

                <MenuButton onClick={setLink} active={editor.isActive("link")} title="Add Link">
                    <LinkIcon className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={addImage} title="Add Image">
                    <ImageIcon className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive("codeBlock")}
                    title="Code Block"
                >
                    <Code className="w-4 h-4" />
                </MenuButton>

                <div className="flex-1" />

                <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                    <Undo className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                    <Redo className="w-4 h-4" />
                </MenuButton>
            </div>

            <EditorContent
                editor={editor}
                className="p-6 min-h-[400px] prose prose-sm max-w-none focus:outline-none dark:prose-invert prose-headings:font-bold prose-p:text-muted-foreground prose-a:text-primary"
            />
        </div>
    );
};
