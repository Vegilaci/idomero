const ADMIN_PASSWORD = "NagyonErosKod.123!"; // ezt majd cseréld le

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem("isAdmin", "true");
    return true;
  }

  return false;
}

export function logout() {
  localStorage.removeItem("isAdmin");
}

export function isAdmin(): boolean {
  return localStorage.getItem("isAdmin") === "true";
}