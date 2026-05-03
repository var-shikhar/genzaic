"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Package,
  Store,
  BarChart3,
  Wallet,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { getInitials } from "@/lib/utils"
import { Wordmark } from "@/components/brand/primitives"

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
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        aria-label={collapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  if (!collapsed) {
    return (
      <nav className="space-y-1">
        {navItems.map(renderItem)}
      </nav>
    )
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
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-card sticky top-0 h-screen shrink-0 transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b h-16",
          collapsed ? "justify-center px-2" : "px-4 justify-between",
        )}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <Wordmark size="md" />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <ScrollArea className={cn("flex-1", collapsed ? "p-2" : "p-4")}>
        <SidebarNav collapsed={collapsed} />
      </ScrollArea>
    </aside>
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
    const stored = typeof window !== "undefined"
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
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-5 border-b">
                <Link
                  href="/dashboard"
                  className="flex items-center"
                  onClick={() => setMobileOpen(false)}
                >
                  <Wordmark size="md" />
                </Link>
              </div>
              <div className="p-4">
                <SidebarNav onItemClick={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>

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
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

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
