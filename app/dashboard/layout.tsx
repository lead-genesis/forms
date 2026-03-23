"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    sansFont,
} from "@/lib/design-system";
import {
    ArrowRightStartOnRectangleIcon,
    Squares2X2Icon,
    UsersIcon,
    Bars2Icon,
    XMarkIcon,
    DocumentTextIcon,
    UserGroupIcon,
    TagIcon,
    ChevronRightIcon,
    RectangleStackIcon,
    NewspaperIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

// ── Breadcrumb config ────────────────────────────────────────────────────────
// Each entry: path prefix → label. More specific paths first (sorted by length).
type BreadcrumbSegment = { label: string; href: string };

function buildBreadcrumbs(pathname: string, brandName?: string | null): BreadcrumbSegment[] {
    const crumbs: BreadcrumbSegment[] = [{ label: "Dashboard", href: "/dashboard" }];

    if (pathname === "/dashboard") return crumbs;

    const segments = pathname.split("/").filter(Boolean); // ["dashboard", "brands", "abc123", "blogs", "xyz"]

    // We build crumbs from known patterns
    if (segments[1] === "forms") {
        crumbs.push({ label: "Forms", href: "/dashboard/forms" });
        if (segments[2]) crumbs.push({ label: "Form", href: pathname });
    } else if (segments[1] === "leads") {
        crumbs.push({ label: "Leads", href: "/dashboard/leads" });
    } else if (segments[1] === "brands") {
        crumbs.push({ label: "Brands", href: "/dashboard/brands" });
        if (segments[2]) {
            crumbs.push({ label: brandName || "Brand", href: `/dashboard/brands/${segments[2]}` });
            if (segments[3] === "blogs") {
                crumbs.push({ label: "Blogs", href: `/dashboard/brands/${segments[2]}/blogs` });
                if (segments[4]) {
                    crumbs.push({ label: segments[4] === "new" ? "New Blog" : "Edit Blog", href: pathname });
                }
            }
        }
    } else if (segments[1] === "blogs") {
        crumbs.push({ label: "Blogs", href: "/dashboard/blogs" });
        if (segments[2] === "new") {
            crumbs.push({ label: "New Blog", href: pathname });
        } else if (segments[2]) {
            crumbs.push({ label: "Edit Blog", href: pathname });
        }
    } else if (segments[1] === "verticals") {
        crumbs.push({ label: "Verticals", href: "/dashboard/verticals" });
    } else if (segments[1] === "users") {
        crumbs.push({ label: "Users", href: "/dashboard/users" });
    } else if (segments[1] === "settings") {
        crumbs.push({ label: "Settings", href: "/dashboard/settings" });
    } else if (segments[1] === "products") {
        crumbs.push({ label: "Products", href: "/dashboard/products" });
    }

    return crumbs;
}

// ── Page title map ───────────────────────────────────────────────────────────
function getPageTitle(pathname: string): string {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.startsWith("/dashboard/forms")) return "Forms";
    if (pathname.startsWith("/dashboard/leads")) return "Leads";
    if (pathname.startsWith("/dashboard/verticals")) return "Verticals";
    if (pathname.startsWith("/dashboard/users")) return "Users";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    if (pathname.startsWith("/dashboard/products")) return "Products";
    if (pathname === "/dashboard/blogs") return "Blogs";
    if (pathname === "/dashboard/blogs/new") return "New Blog";
    if (pathname.startsWith("/dashboard/blogs/")) return "Edit Blog";
    if (pathname.match(/\/dashboard\/brands\/[^/]+\/blogs\/new/)) return "New Blog";
    if (pathname.match(/\/dashboard\/brands\/[^/]+\/blogs\/.+/)) return "Edit Blog";
    if (pathname.match(/\/dashboard\/brands\/[^/]+\/blogs/)) return "Blogs";
    if (pathname.match(/\/dashboard\/brands\/[^/]+/)) return "Brand";
    if (pathname.startsWith("/dashboard/brands")) return "Brands";
    return "Dashboard";
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ email?: string; first_name?: string; last_name?: string } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (!profile && pathname !== "/onboarding") {
                    router.push("/onboarding");
                    return;
                }

                setUser({
                    email: user.email,
                    first_name: profile?.first_name,
                    last_name: profile?.last_name,
                });
            }
        };
        getUser();
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    // Listen for brand-name updates from the brand detail page
    const [brandName, setBrandName] = useState<string | null>(null);
    useEffect(() => {
        const handler = (e: Event) => setBrandName((e as CustomEvent).detail);
        window.addEventListener("brand-name", handler);
        return () => window.removeEventListener("brand-name", handler);
    }, []);
    // Reset brand name when navigating away from a brand page
    useEffect(() => {
        if (!pathname.match(/\/dashboard\/brands\/[^/]+/)) setBrandName(null);
    }, [pathname]);

    const pageTitle = getPageTitle(pathname);
    const breadcrumbs = buildBreadcrumbs(pathname, brandName);

    const navGroups = [
        {
            label: "Overview",
            items: [
                { href: "/dashboard", label: "Overview", icon: Squares2X2Icon },
            ],
        },
        {
            label: "Lead Gen",
            items: [
                { href: "/dashboard/forms", label: "Forms", icon: DocumentTextIcon },
                { href: "/dashboard/leads", label: "Leads", icon: UserGroupIcon },
            ],
        },
        {
            label: "Content",
            items: [
                { href: "/dashboard/brands", label: "Brands", icon: TagIcon },
                { href: "/dashboard/blogs", label: "Blogs", icon: NewspaperIcon },
                { href: "/dashboard/verticals", label: "Verticals", icon: RectangleStackIcon },
            ],
        },
        {
            label: "Team",
            items: [
                { href: "/dashboard/users", label: "Users", icon: UsersIcon },
            ],
        },
    ];

    useEffect(() => {
        document.title = pageTitle === "Dashboard" ? "Dashboard - Genesis Flow" : `${pageTitle} - Genesis Flow`;
    }, [pageTitle]);

    const userDisplayName = user?.first_name ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : (user?.email?.split('@')[0] || "User");
    const userInitials = user?.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}` : (user?.email?.[0]?.toUpperCase() || "U");

    const showBreadcrumbs = breadcrumbs.length > 1;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-background hidden md:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-border/40">
                {/* Logo */}
                <div className="h-14 flex items-center px-5 mt-2">
                    <Link href="/dashboard">
                        <Logo />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 pt-2 overflow-y-auto space-y-4">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                                {group.label}
                            </p>
                            <div className="space-y-px">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[15px] font-medium transition-all duration-150",
                                                isActive
                                                    ? "bg-secondary text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-[18px] h-[18px] shrink-0 transition-colors duration-150",
                                                isActive ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground"
                                            )} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="p-3 border-t border-border/60">
                    <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center ring-1 ring-border/80">
                            <span className={cn("text-[10px] font-bold text-foreground/60", sansFont)}>
                                {userInitials}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate leading-tight">{userDisplayName}</p>
                            <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">{user?.email || 'Loading...'}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-3 py-1.5 mt-0.5 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors w-full"
                    >
                        <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        {/* Slide-in panel */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-72 bg-background z-50 md:hidden flex flex-col shadow-2xl border-r border-border/40"
                        >
                            {/* Header with close */}
                            <div className="h-14 flex items-center justify-between px-4 mt-2">
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Logo />
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Nav */}
                            <nav className="flex-1 px-3 pt-2 overflow-y-auto">
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0 },
                                        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
                                    }}
                                    initial="hidden"
                                    animate="show"
                                    className="space-y-4"
                                >
                                    {navGroups.map((group) => (
                                        <div key={group.label}>
                                            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                                                {group.label}
                                            </p>
                                            <motion.ul
                                                variants={{ hidden: {}, show: {} }}
                                                className="space-y-px"
                                            >
                                                {group.items.map((item) => {
                                                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                                    return (
                                                        <motion.li
                                                            key={item.href}
                                                            variants={{
                                                                hidden: { x: -10, opacity: 0 },
                                                                show: { x: 0, opacity: 1 }
                                                            }}
                                                        >
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className={cn(
                                                                    "group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[15px] font-medium transition-all duration-150",
                                                                    isActive
                                                                        ? "bg-secondary text-foreground"
                                                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                                                )}
                                                            >
                                                                <item.icon className={cn(
                                                                    "w-[18px] h-[18px] shrink-0 transition-colors duration-150",
                                                                    isActive ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground"
                                                                )} />
                                                                {item.label}
                                                            </Link>
                                                        </motion.li>
                                                    );
                                                })}
                                            </motion.ul>
                                        </div>
                                    ))}
                                </motion.div>
                            </nav>

                            {/* Bottom */}
                            <div className="p-3 border-t border-border/60">
                                <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center ring-1 ring-border/80">
                                        <span className={cn("text-[10px] font-bold text-foreground/60", sansFont)}>
                                            {userInitials}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium truncate leading-tight">{userDisplayName}</p>
                                        <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">{user?.email || 'Loading...'}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2.5 px-3 py-1.5 mt-0.5 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors w-full"
                                >
                                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* ── Unified Top Header Bar ── */}
                <header className="h-12 border-b border-border/40 bg-background/70 backdrop-blur-xl sticky top-0 z-20 flex items-center px-4 md:px-6 transition-all duration-300">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-1.5 -ml-1.5 mr-3 rounded-lg hover:bg-secondary/80 transition-colors"
                        aria-label="Open menu"
                    >
                        <Bars2Icon className="w-5 h-5 text-foreground/80" />
                    </button>

                    {/* Left: Breadcrumbs — only show when deeper than root */}
                    <div className="flex-1 flex items-center min-w-0">
                        {showBreadcrumbs && (
                            <nav className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60 overflow-hidden">
                                {breadcrumbs.slice(0, -1).map((crumb, i) => (
                                    <React.Fragment key={crumb.href}>
                                        {i > 0 && <ChevronRightIcon className="w-3 h-3 text-muted-foreground/30 shrink-0" />}
                                        <Link
                                            href={crumb.href}
                                            className="hover:text-primary transition-colors whitespace-nowrap truncate max-w-[120px]"
                                        >
                                            {crumb.label}
                                        </Link>
                                    </React.Fragment>
                                ))}
                                <ChevronRightIcon className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                            </nav>
                        )}
                    </div>

                    {/* Center: Dynamic Page Title with AnimatePresence */}
                    <div className="absolute left-1/2 md:left-[calc(50vw-16rem)] -translate-x-1/2 flex items-center justify-center max-w-[40%]">
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={pathname}
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -5, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className={cn(
                                    "font-bold text-foreground tracking-tight truncate",
                                    sansFont
                                )}
                                style={{ fontSize: "14px" }}
                            >
                                {pageTitle}
                            </motion.h1>
                        </AnimatePresence>
                    </div>

                    {/* Right: Actions / Profile Placeholder */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-secondary/40 border border-border/40 text-[10px] font-medium text-muted-foreground/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                        </div>
                        <div className="w-7 h-7 rounded-full bg-secondary/60 border border-border/40 flex items-center justify-center ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 cursor-pointer">
                            <span className={cn("text-[9px] font-bold text-foreground/50", sansFont)}>
                                {userInitials}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="py-6 lg:py-10 mx-auto flex-1 flex flex-col w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
