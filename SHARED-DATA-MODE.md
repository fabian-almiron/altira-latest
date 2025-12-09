# Shared Data Mode

## Overview
The application has been configured so that **all authenticated users see the same data** across the board. Every user can view, access, and manage all chats and clients regardless of who originally created them.

## Changes Made

### 1. Database Queries (`lib/db/queries.ts`)
Added two new functions to fetch data without user filtering:

- **`getAllChatOwnershipsWithNames()`** - Returns ALL chats from all users
- **`getAllClients()`** - Returns ALL clients from all users

These functions are used instead of the user-specific versions:
- ~~`getChatOwnershipsWithNamesByUserId()`~~ → `getAllChatOwnershipsWithNames()`
- ~~`getClientsByUserId()`~~ → `getAllClients()`

### 2. Chats API (`app/api/chats/route.ts`)
- Changed to use `getAllChatOwnershipsWithNames()` instead of filtering by user ID
- All authenticated users now see all chats
- Console logs updated to reflect shared mode

### 3. Clients API (`app/api/clients/route.ts`)
- Changed to use `getAllClients()` instead of filtering by user ID
- All authenticated users now see all clients with their website counts

### 4. Individual Chat Access (`app/api/chats/[chatId]/route.ts`)
- **GET route**: Removed ownership verification - any authenticated user can view any chat
- **DELETE route**: Removed ownership check - any authenticated user can delete any chat (and its associated GitHub/Vercel resources)

## How It Works

### Before (Per-User Data):
- User A creates Chat 1 → Only User A sees Chat 1
- User B creates Chat 2 → Only User B sees Chat 2
- User A creates Client X → Only User A sees Client X

### After (Shared Data):
- User A creates Chat 1 → **All users** see Chat 1
- User B creates Chat 2 → **All users** see Chat 2
- User A creates Client X → **All users** see Client X
- Any user can view, edit, or delete any chat/client

## Security Considerations

⚠️ **Important Notes**:

1. **Authentication Still Required**: Users must be logged in to access the application
2. **No Ownership Checks**: The system no longer verifies who owns what data
3. **Shared Management**: Any authenticated user can:
   - View all chats and their messages
   - Delete any chat (including GitHub repos and Vercel deployments)
   - View and manage all clients
   - Edit or delete any client

## Use Cases

This configuration is ideal for:
- **Team Collaboration**: Multiple team members working on the same set of projects
- **Agency Dashboard**: All agents seeing all client work
- **Shared Workspace**: Single organization with trusted users
- **Demo/Testing**: Quick sharing of generated sites without complex permissions

## Reverting to Per-User Mode

If you want to revert back to per-user data isolation, simply:

1. In `app/api/chats/route.ts`: Change `getAllChatOwnershipsWithNames()` back to `getChatOwnershipsWithNamesByUserId({ userId: session.user.id })`
2. In `app/api/clients/route.ts`: Change `getAllClients()` back to `getClientsByUserId({ userId: session.user.id })`
3. In `app/api/chats/[chatId]/route.ts`: Re-enable the ownership checks in both GET and DELETE routes

## Testing

To verify the shared data mode is working:

1. Register User A and create a chat → Note the chat appears
2. Log out
3. Register User B → User B should see the chat created by User A
4. Create a new chat as User B
5. Log out and log back in as User A → User A should now see both chats

Both users will see identical data in:
- Dashboard (/chats)
- Individual chat pages (/chats/[chatId])
- Clients page (/clients)

