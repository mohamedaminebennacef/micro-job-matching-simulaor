const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export interface User {
  id: string;
  email: string;
  role: "MANAGER" | "STUDENT";
  studentId: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  major: string;
  graduationYear: number;
  bio: string;
  experience: string;
  skills: string[];
  interests: string[];
  availability: string | null;
  preferredWorkTypes: string[];
}

export interface UserProfile extends User {
  student: StudentProfile | null;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signUp(
  email: string,
  password: string,
  role: "MANAGER" | "STUDENT",
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export async function getMe(): Promise<User> {
  return request<User>("/api/auth/me");
}

export async function getProfile(): Promise<UserProfile> {
  return request<UserProfile>("/api/users/me/profile");
}

export async function updateProfile(
  data: Partial<StudentProfile>,
): Promise<StudentProfile> {
  return request<StudentProfile>("/api/users/me/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export interface GigInput {
  title: string;
  description: string;
  location: string;
  durationHours: number;
  hourlyRate: number;
  skills?: string[];
  schedule?: string;
  contact?: string;
}

export function createGigInput(data: {
  title: string;
  description: string;
  location: string;
  durationHours: number;
  hourlyRate: number;
  skills: string[];
  schedule: string | undefined;
  contact: string | undefined;
}): GigInput {
  return {
    title: data.title,
    description: data.description,
    location: data.location,
    durationHours: data.durationHours,
    hourlyRate: data.hourlyRate,
    ...(data.skills.length > 0 ? { skills: data.skills } : {}),
    ...(data.schedule ? { schedule: data.schedule } : {}),
    ...(data.contact ? { contact: data.contact } : {}),
  };
}

export type GigStatus =
  | "Open"
  | "Assigned"
  | "InProgress"
  | "PendingConfirmation"
  | "Completed";

export interface GigResult {
  id: string;
  createdAt: string;
  completedAt?: string;
  status: GigStatus;
  gig: GigInput;
  candidates: CandidateScore[];
  assignedStudentId?: string;
  selectedCandidate?: CandidateScore;
  manager: {
    name: string;
    email: string;
  };
}

export interface StudentProfileShort {
  id: string;
  name: string;
  major: string;
  skills: string[];
  interests: string[];
}

export interface CandidateScore {
  student: StudentProfileShort;
  matchPercent: number;
  justification: string;
}

export async function createGig(gig: GigInput): Promise<GigResult> {
  return request<GigResult>("/api/gigs", {
    method: "POST",
    body: JSON.stringify(gig),
  });
}

export async function listGigs(): Promise<GigResult[]> {
  return request<GigResult[]>("/api/gigs");
}

export async function getGig(id: string): Promise<GigResult> {
  return request<GigResult>(`/api/gigs/${id}`);
}

export async function assignGig(
  gigId: string,
  studentId: string,
): Promise<GigResult> {
  return request<GigResult>(`/api/gigs/${gigId}/assign`, {
    method: "POST",
    body: JSON.stringify({ studentId }),
  });
}

export async function acceptAssignment(gigId: string): Promise<GigResult> {
  return request<GigResult>(`/api/gigs/${gigId}/accept`, { method: "POST" });
}

export async function declineAssignment(gigId: string): Promise<GigResult> {
  return request<GigResult>(`/api/gigs/${gigId}/decline`, { method: "POST" });
}

export async function completeAssignment(gigId: string): Promise<GigResult> {
  return request<GigResult>(`/api/gigs/${gigId}/complete`, { method: "POST" });
}

export async function confirmCompletion(gigId: string): Promise<GigResult> {
  return request<GigResult>(`/api/gigs/${gigId}/confirm`, { method: "POST" });
}

export type NotificationType = "INFO" | "SUCCESS" | "WARNING";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function listNotifications(): Promise<NotificationItem[]> {
  return request<NotificationItem[]>("/api/notifications");
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  return request<{ count: number }>("/api/notifications/unread");
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  return request<NotificationItem>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(): Promise<{ count: number }> {
  return request<{ count: number }>("/api/notifications/read-all", {
    method: "PATCH",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return request<void>(`/api/notifications/${id}`, { method: "DELETE" });
}
