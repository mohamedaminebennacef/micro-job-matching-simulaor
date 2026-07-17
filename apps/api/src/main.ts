import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { OpenAPIObject } from "@nestjs/swagger";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      methods: ["GET", "POST"],
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
    tags: [{ name: "CampusGigs" }],
    paths: {
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
    },
    components: {
      schemas: {
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
            status: { type: "string", enum: ["Open", "Assigned"] },
            gig: { $ref: "#/components/schemas/CreateGigDto" },
            candidates: {
              type: "array",
              items: { $ref: "#/components/schemas/CandidateScore" },
            },
            assignedStudentId: { type: "string", format: "uuid", nullable: true },
            selectedCandidate: { $ref: "#/components/schemas/CandidateScore" },
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
  await app.listen(port);
}

bootstrap();
