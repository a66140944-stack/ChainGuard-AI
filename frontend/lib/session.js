export function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = window.localStorage.getItem("chainguard_user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("chainguard_user", JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("chainguard_user");
}
