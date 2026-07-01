import { randomUUID } from "node:crypto";
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { AssignGigDto } from "./dto/assign-gig.dto.js";
import { CreateGigDto } from "./dto/create-gig.dto.js";

type GigStatus = "Open" | "Assigned";

type StudentProfile = {
  id: string;
  name: string;
  major: string;
  skills: string[];
  interests: string[];
};

type CandidateScore = {
  student: StudentProfile;
  matchPercent: number;
  justification: string;
};

type GigRecord = {
  id: string;
  createdAt: string;
  status: GigStatus;
  gig: CreateGigDto;
  candidates: CandidateScore[];
  assignedStudentId?: string;
};

const mockStudents: StudentProfile[] = [
  {
    id: "2f5b7f8e-7e4d-4f77-b0a7-85f0b7657c11",
    name: "Maya Thompson",
    major: "History",
    skills: ["Archiving", "Organization", "Document care"],
    interests: ["libraries", "archives", "campus history"],
  },
  {
    id: "5abf44d0-0c8a-4f2a-8b21-5a7baf0874e1",
    name: "Ethan Park",
    major: "Computer Science",
    skills: ["Python", "React", "Debugging"],
    interests: ["automation", "hackathons", "productivity"],
  },
  {
    id: "1c0c48a9-2e4a-4c7f-8df4-5d72ecf86167",
    name: "Amina Hassan",
    major: "Business Administration",
    skills: ["Scheduling", "Logistics", "Communication"],
    interests: ["event planning", "operations", "people"],
  },
  {
    id: "dc7e72c4-5675-4fd9-b3c7-0f9d6d27d1b8",
    name: "Noah Kim",
    major: "Design",
    skills: ["Canva", "Flyer layout", "Typography"],
    interests: ["posters", "branding", "campus marketing"],
  },
  {
    id: "71cf0f73-0f01-4d3f-9d31-e2f2eb12c1f0",
    name: "Sofia Alvarez",
    major: "Biology",
    skills: ["Lab support", "Attention to detail", "Inventory"],
    interests: ["research", "specimen labeling", "student orgs"],
  },
];

@Injectable()
export class CampusGigsService {
  private readonly gigs = new Map<string, GigRecord>();

  createGig(createGigDto: CreateGigDto) {
    const candidates = mockStudents
      .map((student) => this.scoreCandidate(createGigDto, student))
      .sort((left, right) => right.matchPercent - left.matchPercent);

    const gigId = randomUUID();
    const record: GigRecord = {
      id: gigId,
      createdAt: new Date().toISOString(),
      status: "Open",
      gig: createGigDto,
      candidates,
    };

    this.gigs.set(gigId, record);

    return record;
  }

  getGig(id: string) {
    const gig = this.gigs.get(id);
    if (!gig) {
      throw new NotFoundException("Gig not found");
    }

    return gig;
  }

  assignGig(id: string, assignGigDto: AssignGigDto) {
    const gig = this.getGig(id);
    const candidate = gig.candidates.find(
      (entry) => entry.student.id === assignGigDto.studentId,
    );

    if (!candidate) {
      throw new BadRequestException(
        "Selected student is not part of this matching round",
      );
    }

    gig.status = "Assigned";
    gig.assignedStudentId = assignGigDto.studentId;

    return {
      ...gig,
      selectedCandidate: candidate,
    };
  }

  private scoreCandidate(
    createGigDto: CreateGigDto,
    student: StudentProfile,
  ): CandidateScore {
    const jobText =
      `${createGigDto.title} ${createGigDto.description} ${createGigDto.location}`.toLowerCase();
    const studentText = [student.major, ...student.skills, ...student.interests]
      .join(" ")
      .toLowerCase();
    const tokens = [
      "archive",
      "library",
      "flyer",
      "lab",
      "equipment",
      "organize",
      "detail",
      "distribution",
      "moving",
    ];

    let score = 20;

    for (const token of tokens) {
      if (jobText.includes(token) && studentText.includes(token)) {
        score += 16;
      }
    }

    if (
      jobText.includes("archive") &&
      student.major.toLowerCase().includes("history")
    ) {
      score += 28;
    }

    if (
      jobText.includes("flyer") &&
      student.skills.some((skill) => skill.toLowerCase().includes("layout"))
    ) {
      score += 24;
    }

    if (
      jobText.includes("lab") &&
      student.skills.some((skill) => skill.toLowerCase().includes("detail"))
    ) {
      score += 22;
    }

    if (
      jobText.includes("move") &&
      student.skills.some((skill) => skill.toLowerCase().includes("logistics"))
    ) {
      score += 18;
    }

    score = Math.max(5, Math.min(score, 99));

    const reason = this.buildJustification(createGigDto, student);

    return {
      student,
      matchPercent: score,
      justification: reason,
    };
  }

  private buildJustification(
    createGigDto: CreateGigDto,
    student: StudentProfile,
  ) {
    const headline = createGigDto.title.toLowerCase();

    if (headline.includes("archive") && student.major === "History") {
      return "Strong archival background and a history major make this a natural fit.";
    }

    if (headline.includes("flyer")) {
      return "This student brings visual communication skills that align with flyer distribution work.";
    }

    if (headline.includes("lab")) {
      return "Their attention to detail and lab support experience match the task well.";
    }

    return "Their profile shows the best overlap between the job requirements and listed skills.";
  }
}
