export const USER_ACCOUNT_ACTION_EVENT = "personaAI-user-account-action"

export type UserAccountAction = "profile" | "add-account" | "log-out"

export function dispatchUserAccountAction(action: UserAccountAction) {
  window.dispatchEvent(
    new CustomEvent<UserAccountAction>(USER_ACCOUNT_ACTION_EVENT, {
      detail: action,
    })
  )
}
