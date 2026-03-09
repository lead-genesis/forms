"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

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

    // Map routes to page titles
    const pageTitleMap: Record<string, string> = {
        "/dashboard": "Overview",
        "/dashboard/forms": "Forms",
        "/dashboard/leads": "Leads",
        "/dashboard/brands": "Brands",
        "/dashboard/users": "Users",
        "/dashboard/settings": "Settings",
        "/dashboard/products": "Products",
    };

    const sortedPaths = Object.keys(pageTitleMap).sort((a, b) => b.length - a.length);
    const matchedPath = sortedPaths.find((path) => pathname.startsWith(path));
    const pageTitle = matchedPath ? pageTitleMap[matchedPath] : "Dashboard";

    const navGroups = [
        {
            label: "Main",
            items: [
                { href: "/dashboard", label: "Overview", icon: Squares2X2Icon },
                { href: "/dashboard/forms", label: "Forms", icon: DocumentTextIcon },
                { href: "/dashboard/leads", label: "Leads", icon: UserGroupIcon },
                { href: "/dashboard/brands", label: "Brands", icon: TagIcon },
                { href: "/dashboard/users", label: "Users", icon: UsersIcon },
            ],
        },
    ];

    useEffect(() => {
        document.title = pageTitle === "Dashboard" ? "Dashboard - Genesis Flow" : `${pageTitle} - Genesis Flow`;
    }, [pageTitle]);

    const userDisplayName = user?.first_name ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : (user?.email?.split('@')[0] || "User");
    const userInitials = user?.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}` : (user?.email?.[0]?.toUpperCase() || "U");

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-secondary/20 hidden md:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-border/60">
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
                                    const isActive = pathname === item.href;
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
                            className="fixed inset-y-0 left-0 w-72 bg-secondary/20 z-50 md:hidden flex flex-col shadow-2xl border-r border-border/60"
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
                                                    const isActive = pathname === item.href;
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
                {/* Mobile header with hamburger */}
                <header className="md:hidden h-14 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
                    <Link href="/dashboard" className="flex items-center">
                        <Logo />
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-1.5 -mr-1.5 rounded-lg hover:bg-secondary transition-colors"
                        aria-label="Open menu"
                    >
                        <Bars2Icon className="w-6 h-6 text-foreground" />
                    </button>
                </header>

                <div className={cn(
                    "py-6 lg:py-10 mx-auto flex-1 flex flex-col",
                    pathname === "/dashboard/settings" ? "max-w-4xl px-6 lg:px-10" : "w-full"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
