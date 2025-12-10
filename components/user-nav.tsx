'use client'

import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'

export function UserNav() {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const initials = user?.emailAddresses[0]?.emailAddress
    ?.split('@')[0]
    ?.slice(0, 2)
    ?.toUpperCase() || 'U'

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild suppressHydrationWarning>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {!isSignedIn ? <User className="h-4 w-4" /> : initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {!isSignedIn ? 'Not signed in' : user?.fullName || 'User'}
            </p>
            {user?.emailAddresses[0]?.emailAddress && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.emailAddresses[0].emailAddress}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isSignedIn && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/sign-up" className="cursor-pointer">
                <span>Create Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sign-in" className="cursor-pointer">
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {isSignedIn && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/account" className="cursor-pointer flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          <DropdownMenuItem
              onClick={handleSignOut}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
