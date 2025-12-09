type UserType = 'guest' | 'user'

interface Entitlements {
  maxMessagesPerDay: number
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account (anonymous)
   */
  guest: {
    maxMessagesPerDay: 5,
  },

  /*
   * For users with an account
   */
  user: {
    maxMessagesPerDay: 50,
  },
}

// For anonymous users (no session)
export const anonymousEntitlements: Entitlements = {
  maxMessagesPerDay: 3,
}
