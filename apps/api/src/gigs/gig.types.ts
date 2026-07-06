import type { CreateGigDto } from "../dto/create-gig.dto.js";

export type GigStatus = "Open" | "Assigned";

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
  status: GigStatus;
  gig: CreateGigDto;
  candidates: GigCandidate[];
  assignedStudentId?: string | null;
  selectedCandidate?: GigCandidate;
};
