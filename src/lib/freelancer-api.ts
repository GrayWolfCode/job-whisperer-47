const BASE_URL = "https://www.freelancer.com/api/projects/0.1/projects/active/";
const USERS_URL = "https://www.freelancer.com/api/users/0.1/self";

const OAUTH_TOKEN = "pKph7V9y0BSHVFZxOzOOdMnWQNO1HK";

const authHeaders: HeadersInit = {
  "freelancer-oauth-v1": OAUTH_TOKEN,
};

export interface FreelancerProject {
  id: number;
  title: string;
  description: string;
  budget: { minimum: number; maximum: number };
  currency: { sign: string; code: string };
  jobs: { id: number; name: string }[];
  bid_stats: { bid_count: number; bid_avg: number | null };
  owner_info?: {
    country?: { name: string; flag_url?: string };
    reputation?: {
      entire_history?: {
        all: number | null;
        overall: number | null;
      };
    };
    registration_date?: number;
    status?: { payment_verified?: boolean };
    primary_currency?: { sign: string };
    employer_reputation?: {
      entire_history?: {
        all: number | null;
        overall: number | null;
      };
    };
  };
  time_submitted?: number;
  type?: string;
}

export interface FreelancerUser {
  id: number;
  username: string;
  display_name: string;
}

export async function fetchProjects(limit = 100, offset = 0): Promise<{ projects: FreelancerProject[]; totalCount: number }> {
  const url = `${BASE_URL}?owner_info=true&limit=${limit}&offset=${offset}&full_description=true&job_details=true&compact=true&count=true`;
  const response = await fetch(url, { headers: authHeaders });
  if (!response.ok) throw new Error("Failed to fetch projects");
  const data = await response.json();
  return {
    projects: data.result.projects,
    totalCount: data.result.total_count ?? 10000,
  };
}

export async function fetchSelf(): Promise<FreelancerUser> {
  const response = await fetch(USERS_URL, { headers: authHeaders });
  if (!response.ok) throw new Error("Failed to fetch user info");
  const data = await response.json();
  return {
    id: data.result.id,
    username: data.result.username,
    display_name: data.result.display_name || data.result.username,
  };
}

export function getProjectUrl(id: number): string {
  return `https://www.freelancer.com/projects/${id}`;
}

export function formatTimeAgo(timestamp?: number): string {
  if (!timestamp) return "";
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}
