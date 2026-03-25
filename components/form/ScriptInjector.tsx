"use client";

import { useEffect, useRef } from "react";

/**
 * Injects HTML + scripts into the DOM properly.
 * `dangerouslySetInnerHTML` doesn't execute <script> tags (browser innerHTML behavior).
 * This component extracts scripts and appends them as real DOM elements so they execute.
 */
export function ScriptInjector({ html }: { html: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const injectedRef = useRef(false);

    useEffect(() => {
        if (!containerRef.current || injectedRef.current) return;
        injectedRef.current = true;

        const container = containerRef.current;

        // Parse the HTML
        const temp = document.createElement("div");
        temp.innerHTML = html;

        // Move non-script nodes into the container
        const fragment = document.createDocumentFragment();
        const scripts: HTMLScriptElement[] = [];

        Array.from(temp.childNodes).forEach((node) => {
            if (node instanceof HTMLElement && node.tagName === "SCRIPT") {
                scripts.push(node as HTMLScriptElement);
            } else {
                fragment.appendChild(node.cloneNode(true));
            }
        });

        container.appendChild(fragment);

        // Create real script elements so the browser executes them
        scripts.forEach((original) => {
            const script = document.createElement("script");
            // Copy attributes (src, async, defer, type, etc.)
            Array.from(original.attributes).forEach((attr) => {
                script.setAttribute(attr.name, attr.value);
            });
            // Copy inline content
            if (original.textContent) {
                script.textContent = original.textContent;
            }
            container.appendChild(script);
        });
    }, [html]);

    return <div ref={containerRef} />;
}
