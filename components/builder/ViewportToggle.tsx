import React from "react";
import { cn } from "@/lib/utils";
import { DesktopIcon, TabletIcon, MobileIcon } from "./icons";

export type ViewportMode = "desktop" | "tablet" | "mobile";

interface ViewportToggleProps {
    viewport: ViewportMode;
    setViewport: (mode: ViewportMode) => void;
}

export const ViewportToggle = ({ viewport, setViewport }: ViewportToggleProps) => {
    return (
        <div className="absolute top-6 left-6 z-40 bg-background/95 backdrop-blur-md border border-border/60 rounded-full p-1.5 shadow-sm flex items-center gap-1">
            <button
                onClick={() => setViewport("desktop")}
                className={cn(
                    "p-2 rounded-full transition-all duration-200",
                    viewport === "desktop"
                        ? "bg-foreground text-background shadow-sm"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Desktop View"
            >
                <DesktopIcon className="w-4 h-4" />
            </button>
            <button
                onClick={() => setViewport("tablet")}
                className={cn(
                    "p-2 rounded-full transition-all duration-200",
                    viewport === "tablet"
                        ? "bg-foreground text-background shadow-sm"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Tablet View"
            >
                <TabletIcon className="w-4 h-4" />
            </button>
            <button
                onClick={() => setViewport("mobile")}
                className={cn(
                    "p-2 rounded-full transition-all duration-200",
                    viewport === "mobile"
                        ? "bg-foreground text-background shadow-sm"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Mobile View"
            >
                <MobileIcon className="w-4 h-4" />
            </button>
        </div>
    );
};
