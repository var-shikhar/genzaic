"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
} from "lucide-react"
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
import { InstallAppMenuItem } from "@/components/pwa/InstallAppMenuItem"
import { getInitials } from "@/lib/utils"

interface BuyerProfileMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    isSeller?: boolean
    role?: string
  }
}

// Buyer-side avatar dropdown. "My purchases" deliberately does NOT appear in
// this menu — the buyer header already has a standalone "My Purchases" link,
// so duplicating it in the dropdown is clutter. The menu's job here is the
// cross-context jumps: switch to the seller dashboard (or start selling if
// they aren't a seller yet), plus account settings + log out.
export function BuyerProfileMenu({ user }: BuyerProfileMenuProps) {
  const router = useRouter()
  const isSeller = user.isSeller === true || user.role === "seller"

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-9 px-2"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs gradient-primary text-white">
              {user.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
            {user.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isSeller ? (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Seller dashboard
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/onboarding">
              <Store className="mr-2 h-4 w-4" />
              Start selling
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/my-purchases/settings">
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
  )
}
