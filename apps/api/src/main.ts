import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { OpenAPIObject } from "@nestjs/swagger";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  try {
    console.log("[startup] BOOT: bootstrap() called");
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      },
    });
    app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  const document = {
    openapi: "3.0.0",
    info: {
      title: "CampusGigs API",
      description:
        "CampusGigs micro-job matching simulator API with gig creation, retrieval, assignment, and health check endpoints.",
      version: "1.0.0",
    },
    servers: [{ url: process.env.CORS_ORIGIN ?? "http://localhost:4000" }],
    tags: [{ name: "CampusGigs" }, { name: "Auth" }, { name: "Users" }, { name: "Notifications" }],
    paths: {
      "/api/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignupDto" },
              },
            },
          },
          responses: {
            201: { description: "User created." },
            409: { description: "Email already in use." },
          },
        },
      },
      "/api/auth/signin": {
        post: {
          tags: ["Auth"],
          summary: "Sign in and receive a JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SigninDto" },
              },
            },
          },
          responses: {
            200: {
              description: "JWT token returned.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      access_token: { type: "string" },
                      user: { $ref: "#/components/schemas/UserProfile" },
                    },
                  },
                },
              },
            },
            401: { description: "Invalid credentials." },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          security: [{ Bearer: [] }],
          responses: {
            200: { description: "Current user." },
            401: { description: "Unauthorized." },
          },
        },
      },
      "/api/users/me/profile": {
        get: {
          tags: ["Users"],
          summary: "Get own profile (student details)",
          security: [{ Bearer: [] }],
          responses: {
            200: { description: "User profile with student data." },
          },
        },
        put: {
          tags: ["Users"],
          summary: "Update own student profile",
          security: [{ Bearer: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProfileDto" },
              },
            },
          },
          responses: {
            200: { description: "Profile updated." },
          },
        },
      },
      "/api/health": {
        get: {
          tags: ["CampusGigs"],
          summary: "Health check",
          responses: {
            200: {
              description: "Service is running.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean", example: true },
                      service: { type: "string", example: "campusgigs-api" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/gigs": {
        post: {
          tags: ["CampusGigs"],
          summary: "Create a gig and generate ranked candidates",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateGigDto" },
                example: {
                  title: "Need help moving lab equipment",
                  description: "Move boxed equipment from the lab to storage.",
                  location: "Science Hall, Room 204",
                  durationHours: 2,
                  hourlyRate: 18,
                },
              },
            },
          },
          responses: {
            201: {
              description: "Gig created with ranked candidates.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GigRecord" },
                },
              },
            },
          },
        },
      },
      "/api/gigs/{id}": {
        get: {
          tags: ["CampusGigs"],
          summary: "Get a previously created gig",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Gig UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: {
              description: "Gig record returned.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GigRecord" },
                },
              },
            },
            404: {
              description: "Gig not found.",
            },
          },
        },
      },
      "/api/gigs/{id}/assign": {
        post: {
          tags: ["CampusGigs"],
          summary: "Assign a gig to a student",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Gig UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AssignGigDto" },
                example: {
                  studentId: "2f5b7f8e-7e4d-4f77-b0a7-85f0b7657c11",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Gig assigned successfully.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GigRecord" },
                },
              },
            },
            400: {
              description: "Selected student is not part of this matching round.",
            },
            404: {
              description: "Gig not found.",
            },
          },
        },
      },
      "/api/gigs/{id}/accept": {
        post: {
          tags: ["CampusGigs"],
          summary: "Accept an assigned gig (starts work)",
          security: [{ Bearer: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Gig UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Gig accepted and moved to in progress." },
            401: { description: "Unauthorized." },
            403: { description: "Student role required." },
          },
        },
      },
      "/api/gigs/{id}/decline": {
        post: {
          tags: ["CampusGigs"],
          summary: "Decline an assigned gig (returns gig to open)",
          security: [{ Bearer: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Gig UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Gig declined and returned to open." },
            401: { description: "Unauthorized." },
            403: { description: "Student role required." },
          },
        },
      },
      "/api/gigs/{id}/complete": {
        post: {
          tags: ["CampusGigs"],
          summary: "Mark an in-progress gig as awaiting confirmation",
          security: [{ Bearer: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Gig UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Gig marked as pending completion." },
            401: { description: "Unauthorized." },
            403: { description: "Student role required." },
          },
        },
      },
      "/api/gigs/{id}/confirm": {
        post: {
          tags: ["CampusGigs"],
          summary: "Confirm completion of a gig",
          security: [{ Bearer: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Gig UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Gig marked as completed." },
            401: { description: "Unauthorized." },
            403: { description: "Manager role required." },
          },
        },
      },
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "List own notifications, newest first",
          security: [{ Bearer: [] }],
          responses: {
            200: {
              description: "List of notifications.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/NotificationRecord" },
                  },
                },
              },
            },
            401: { description: "Unauthorized." },
          },
        },
      },
      "/api/notifications/unread": {
        get: {
          tags: ["Notifications"],
          summary: "Get unread notification count",
          security: [{ Bearer: [] }],
          responses: {
            200: {
              description: "Unread count.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { count: { type: "number", example: 3 } },
                  },
                },
              },
            },
            401: { description: "Unauthorized." },
          },
        },
      },
      "/api/notifications/{id}/read": {
        patch: {
          tags: ["Notifications"],
          summary: "Mark a notification as read",
          security: [{ Bearer: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Notification UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: {
              description: "Notification marked as read.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/NotificationRecord" },
                },
              },
            },
            401: { description: "Unauthorized." },
            404: { description: "Notification not found." },
          },
        },
      },
      "/api/notifications/read-all": {
        patch: {
          tags: ["Notifications"],
          summary: "Mark all own notifications as read",
          security: [{ Bearer: [] }],
          responses: {
            200: {
              description: "All notifications marked as read.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { count: { type: "number" } },
                  },
                },
              },
            },
            401: { description: "Unauthorized." },
          },
        },
      },
      "/api/notifications/{id}": {
        delete: {
          tags: ["Notifications"],
          summary: "Delete a notification",
          security: [{ Bearer: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Notification UUID",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Notification deleted." },
            401: { description: "Unauthorized." },
            404: { description: "Notification not found." },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SignupDto: {
          type: "object",
          required: ["email", "password", "role"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            role: { type: "string", enum: ["MANAGER", "STUDENT"] },
            studentId: { type: "string", format: "uuid", description: "Required for STUDENT role" },
          },
        },
        SigninDto: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string" },
            role: { type: "string", enum: ["MANAGER", "STUDENT"] },
          },
        },
        UpdateProfileDto: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            major: { type: "string" },
            graduationYear: { type: "number" },
            bio: { type: "string" },
            experience: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            interests: { type: "array", items: { type: "string" } },
            availability: { type: "array", items: { type: "string" } },
            preferredWorkTypes: { type: "array", items: { type: "string" } },
          },
        },
        CreateGigDto: {
          type: "object",
          required: ["title", "description", "location", "durationHours", "hourlyRate"],
          properties: {
            title: { type: "string", example: "Need help moving lab equipment" },
            description: {
              type: "string",
              example: "Move boxed equipment from the lab to storage.",
            },
            location: { type: "string", example: "Science Hall, Room 204" },
            durationHours: { type: "number", example: 2, minimum: 1 },
            hourlyRate: { type: "number", example: 18, minimum: 0 },
          },
        },
        AssignGigDto: {
          type: "object",
          required: ["studentId"],
          properties: {
            studentId: {
              type: "string",
              format: "uuid",
              example: "2f5b7f8e-7e4d-4f77-b0a7-85f0b7657c11",
            },
          },
        },
        StudentProfile: {
          type: "object",
          required: ["id", "name", "major", "skills", "interests"],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            major: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            interests: { type: "array", items: { type: "string" } },
          },
        },
        CandidateScore: {
          type: "object",
          required: ["student", "matchPercent", "justification"],
          properties: {
            student: { $ref: "#/components/schemas/StudentProfile" },
            matchPercent: { type: "number", example: 95 },
            justification: { type: "string" },
          },
        },
        GigRecord: {
          type: "object",
          required: ["id", "createdAt", "status", "gig", "candidates"],
          properties: {
            id: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            completedAt: { type: "string", format: "date-time", nullable: true },
            status: {
              type: "string",
              enum: ["Open", "Assigned", "InProgress", "PendingConfirmation", "Completed"],
            },
            gig: { $ref: "#/components/schemas/CreateGigDto" },
            candidates: {
              type: "array",
              items: { $ref: "#/components/schemas/CandidateScore" },
            },
            assignedStudentId: { type: "string", format: "uuid", nullable: true },
            selectedCandidate: { $ref: "#/components/schemas/CandidateScore" },
            manager: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
        NotificationRecord: {
          type: "object",
          required: ["id", "title", "message", "type", "read", "createdAt"],
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            message: { type: "string" },
            type: { type: "string", enum: ["INFO", "SUCCESS", "WARNING"] },
            link: { type: "string", nullable: true },
            read: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  } as OpenAPIObject;
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = Number(process.env.PORT ?? 4000);
  console.log(`[startup] BOOT: listening on port ${port}`);
  await app.listen(port);
  console.log(`[startup] BOOT: listening complete`);
  } catch (err) {
    console.error("[startup] BOOT FAILED:", err);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  console.error("[startup] UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("[startup] UNHANDLED REJECTION:", err);
  process.exit(1);
});

bootstrap();
