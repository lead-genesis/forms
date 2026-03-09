"use client";

import { useMemo } from 'react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { cn } from '@/lib/utils';

interface TiptapRendererProps {
    content: any;
    className?: string;
}

export const TiptapRenderer = ({ content, className }: TiptapRendererProps) => {
    const html = useMemo(() => {
        if (!content) return '';

        try {
            return generateHTML(content, [
                StarterKit,
                Underline,
                Link.configure({
                    HTMLAttributes: {
                        class: "text-primary underline",
                    },
                }),
                Image.configure({
                    HTMLAttributes: {
                        class: "rounded-3xl max-w-full h-auto my-12 border border-zinc-100 shadow-sm mx-auto block",
                    },
                }),
            ]);
        } catch (error) {
            console.error('Error generating HTML from Tiptap JSON:', error);
            return '';
        }
    }, [content]);

    return (
        <div
            className={cn(
                "prose prose-zinc prose-lg max-w-none dark:prose-invert",
                "prose-headings:text-black prose-headings:font-bold",
                "prose-p:text-zinc-600 prose-p:leading-relaxed",
                "prose-a:text-black prose-a:font-semibold prose-a:underline prose-a:decoration-zinc-300 hover:prose-a:decoration-black prose-a:transition-all",
                "prose-blockquote:border-l-black prose-blockquote:italic prose-blockquote:bg-zinc-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl",
                "prose-img:rounded-3xl prose-img:shadow-xl",
                className
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
