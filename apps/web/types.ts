import { z } from 'zod';

export const AuthFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const WebsiteFormSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export type AuthForm = z.infer<typeof AuthFormSchema>;
export type WebsiteForm = z.infer<typeof WebsiteFormSchema>;

export interface SignupResponse {
  id: string;
}

export interface SigninResponse {
  jwt: string;
}

export interface AddWebsiteResponse {
  id: string;
}

export interface Website {
  id: string;
  url: string;
  user_id: string;
  time_added: string;
  ticks: WebsiteTick[];
}

export interface WebsiteTick {
  id: string;
  response_time_ms: number;
  status: "Up" | "Down" | "Unknown";
  website_id: string;
  region_id: string;
  createdAt: string;
  region?: {
    id: string;
    name: string;
  };
}

export interface WebsitesResponse {
  websites: Website[];
}
