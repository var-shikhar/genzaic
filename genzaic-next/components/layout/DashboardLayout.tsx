"use client"

import { RouteLoadingOverlay } from "@/components/layout/RouteLoadingOverlay"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { InstallAppMenuItem } from "@/components/pwa/InstallAppMenuItem"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/ui/logo"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, getInitials } from "@/lib/utils"
import {
  BarChart3,
  ChevronDown,
  FileCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/storefront", label: "Storefront", icon: Store },
  { href: "/dashboard/sales", label: "Sales", icon: BarChart3 },
  { href: "/dashboard/payouts", label: "Payouts", icon: Wallet },
  { href: "/dashboard/kyc", label: "KYC", icon: FileCheck },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const SIDEBAR_PREF_KEY = "dashboard:sidebar-collapsed"

function SidebarNav({
  onItemClick,
  collapsed,
}: {
  onItemClick?: () => void
  collapsed?: boolean
}) {
  const pathname = usePathname()

  const renderItem = (item: (typeof navItems)[number]) => {
    const isActive =
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href)
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onItemClick}
        className={cn(
          "flex items-center rounded-lg text-sm font-medium transition-all",
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
          isActive
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        aria-label={collapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  if (!collapsed) {
    return <nav className="space-y-1">{navItems.map(renderItem)}</nav>
  }

  return (
    <TooltipProvider delayDuration={150}>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{renderItem(item)}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  )
}

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const [peeking, setPeeking] = useState(false)
  // Single shared timer for both open and close. Whichever event fires last
  // wins, so a quick in-and-out won't leave the panel stuck open.
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Two independent flags: the header (logo + toggle) only ever expands
  // when the user has the sidebar fully open via the toggle. The nav
  // (ScrollArea) additionally expands during a hover peek. This keeps the
  // toggle button at the same pixel position whether peeking or not, and
  // avoids the wordmark sliding under the page header on overlay.
  const headerExpanded = !collapsed
  const navExpanded = !collapsed || peeking
  const overlaying = collapsed && peeking

  const cancelPeekTimer = () => {
    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current)
      peekTimerRef.current = null
    }
  }

  // A small open delay keeps the panel from flashing open when the cursor
  // just grazes the nav on the way somewhere else. The close delay is a bit
  // longer so a brief stray (e.g. heading toward the toggle) doesn't yank
  // the panel away mid-interaction.
  const schedulePeekOpen = () => {
    cancelPeekTimer()
    if (!collapsed) return
    peekTimerRef.current = setTimeout(() => setPeeking(true), 150)
  }

  const schedulePeekClose = () => {
    cancelPeekTimer()
    peekTimerRef.current = setTimeout(() => setPeeking(false), 200)
  }

  useEffect(() => cancelPeekTimer, [])

  return (
    // Outer wrapper keeps the collapsed-width slot in the flex layout so the
    // main content never shifts when the sidebar peeks open on hover.
    //
    // The wrapper is `sticky top-0`, which establishes its own stacking
    // context. Anything inside (including the aside's own z-index) only
    // stacks *within* that context. To the outer flex parent the wrapper
    // sits at `z: auto`, so right-column content paints over it in document
    // order — that's what was leaking through during a peek. Lifting the
    // wrapper itself to z-50 when overlaying puts the whole stacking context
    // above the page header (z-40) and the storefront editor content.
    <div
      className={cn(
        "hidden lg:block sticky top-0 h-screen shrink-0 transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
        overlaying && "z-50",
      )}
    >
      <aside
        // Closing fires only when the cursor truly leaves the aside, so
        // moving from the nav up to the (still-collapsed) header during a
        // peek doesn't close it.
        onMouseLeave={schedulePeekClose}
        className={cn(
          "absolute top-0 left-0 h-full flex flex-col border-r overflow-hidden transition-[width,box-shadow] duration-300 ease-out",
          navExpanded ? "w-64" : "w-16",
          // Same primary wash in every state. While peeking, we additionally
          // paint a solid bg-background underneath via the gradient layer so
          // the main content behind doesn't bleed through the 10% alpha. The
          // z-50 puts the overlay above the page header (z-40) so nothing
          // bleeds in from the right column.
          overlaying
            ? "z-50 shadow-2xl bg-background bg-gradient-to-r from-primary/10 to-primary/10"
            : "bg-primary/10",
        )}
      >
        {/* Header content matrix:
             - Always-expanded (toggler off): wordmark + toggle, justify-between
             - Peeking (collapsed + hover):   wordmark only — peek is a preview,
                                              pinning is done from the resting toggle
             - Resting collapsed:             toggle only, centered in a w-16 box */}
        <div
          className={cn(
            "flex items-center border-b h-16 shrink-0",
            navExpanded && "px-4",
            !collapsed && "justify-between",
          )}
        >
          {navExpanded && (
            <Link href="/dashboard" className="flex items-center">
              <Logo width={110} height={22} />
            </Link>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
          {collapsed && !peeking && (
            <div className="w-16 shrink-0 flex items-center justify-center">
              <button
                type="button"
                onClick={onToggle}
                aria-label="Expand sidebar"
                className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        {/* Peek opens from the nav region only — hovering the header (toggle
            button) never triggers it, so the toggle stays put and clickable. */}
        <ScrollArea
          onMouseEnter={schedulePeekOpen}
          className={cn("flex-1", navExpanded ? "p-4" : "p-2")}
        >
          <SidebarNav collapsed={!navExpanded} />
        </ScrollArea>
      </aside>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sidebar collapse state. Persist user's preference, but auto-collapse when
  // the user lands on /dashboard/storefront so the live-preview pane has
  // breathing room. The user can still toggle it open mid-session.
  const [collapsed, setCollapsed] = useState(false)
  // Track whether the user has explicitly toggled within this navigation, so
  // route-change auto-collapse doesn't keep overriding their choice when they
  // open the sidebar manually on /storefront.
  const [userToggledFor, setUserToggledFor] = useState<string | null>(null)

  // Hydrate persisted preference once.
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(SIDEBAR_PREF_KEY)
        : null
    if (stored === "1") setCollapsed(true)
    else if (stored === "0") setCollapsed(false)
  }, [])

  // Route-driven auto-collapse for the storefront editor.
  useEffect(() => {
    if (!pathname) return
    if (userToggledFor === pathname) return
    if (pathname.startsWith("/dashboard/storefront")) {
      setCollapsed(true)
    }
  }, [pathname, userToggledFor])

  const handleToggle = () => {
    setCollapsed((c) => {
      const next = !c
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_PREF_KEY, next ? "1" : "0")
      }
      return next
    })
    setUserToggledFor(pathname)
  }

  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        image?: string | null
        storeUrl?: string | null
      }
    | undefined

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <RouteLoadingOverlay />
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            {/* Solid background on mobile so the sheet doesn't bleed the dim
                backdrop through a translucent tint. The `bg-primary/10` overlay
                preserves the brand wash that the desktop aside uses. */}
            <SheetContent side="left" className="w-64 p-0 bg-background">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="h-full bg-primary/10">
                <div className="p-5 border-b">
                  <Link
                    href="/dashboard"
                    className="flex items-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Logo width={110} height={22} />
                  </Link>
                </div>
                <div className="p-4">
                  <SidebarNav onItemClick={() => setMobileOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="text-xs gradient-primary text-white">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-purchases">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My purchases
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <InstallAppMenuItem />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* <PushOptInBanner /> */}

        {/* Main content. No overflow-auto here: the parent flex uses
            min-h-screen (not a fixed height), so overflow-auto would create
            a non-scrolling scroll-containing-block that breaks every
            `position: sticky` descendant (incl. the storefront editor's
            live preview). The page scrolls on <html>; the header above
            already has its own `sticky top-0`. */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
