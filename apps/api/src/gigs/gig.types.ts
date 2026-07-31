import type { CreateGigDto } from "../dto/create-gig.dto.js";

export type GigStatus =
  | "Open"
  | "Assigned"
  | "InProgress"
  | "PendingConfirmation"
  | "Completed";

export type StudentScoringInput = {
  id: string;
  fullName: string;
  major: string;
  skills: string[];
  interests: string[];
};

export type GigCandidate = {
  student: {
    id: string;
    name: string;
    major: string;
    skills: string[];
    interests: string[];
  };
  matchPercent: number;
  justification: string;
};

export type GigResponse = {
  id: string;
  createdAt: string;
  completedAt?: string | null;
  status: GigStatus;
  gig: CreateGigDto;
  candidates: GigCandidate[];
  assignedStudentId?: string | null;
  selectedCandidate?: GigCandidate;
  manager: {
    name: string;
    email: string;
  };
};
