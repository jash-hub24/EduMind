# EduMind Backend

Spring Boot 3 REST API for the EduMind learning platform. It uses Java 17, Maven, Spring Web, Spring Data JPA, MySQL, Jakarta Validation, Spring Security, BCrypt, and signed JWT bearer tokens. The existing React frontend is unchanged.

## Local Run

Install Java 17 and Maven, then create the database with MySQL or start the full stack with Docker Compose. Set credentials in the shell rather than committing them:

```sh
export MYSQL_ROOT_PASSWORD='your-local-mysql-password'
export JWT_SECRET='replace-with-a-random-secret-at-least-32-characters-long'
docker compose up --build
```

Run this from `backend/`. Compose exposes MySQL at `localhost:3307` to avoid conflicts with a locally installed MySQL server; the API is at `http://localhost:8080`. The frontend origin `http://localhost:5173` is allowed by default. For local Maven development, set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET`, then run `mvn spring-boot:run`. Hibernate updates the schema by default; use `DDL_AUTO=validate` in deployments with managed migrations.

The demo accounts are `student@edumind.com` / `student1234` and `admin@edumind.com` / `admin1234`. These BCrypt-hashed credentials are for local prototypes only. Change or remove them before deployment. Admin role assignment is not available through public registration; new registrations always create student accounts.

## Tests

Automated integration tests use an isolated in-memory H2 database; they do not need MySQL:

```sh
mvn clean test
mvn clean package
```

## API Notes

All request and response payloads are JSON. Login and registration return a JWT; send it as `Authorization: Bearer <token>`. Admin write operations require a `FACULTY_ADMIN` token. Student-specific progress, attempt, and bookmark operations require a `STUDENT` token and enforce student ownership. Public GET catalog endpoints do not require a token.

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{"email":"student@edumind.com","password":"student1234"}
```

```http
POST /api/auth/register
Content-Type: application/json

{"fullName":"Taylor Student","email":"taylor@example.com","password":"strong-password"}
```

### Browse and manage materials

```http
GET /api/materials?q=normalization
GET /api/materials?subjectId=1
GET /api/materials/1
```

Create or update with an admin token:

```json
{
  "title": "Normalization Review",
  "description": "Worked examples for relational normalization.",
  "subjectId": 1,
  "topic": "Normalization",
  "semester": 4,
  "resourceType": "NOTES",
  "difficulty": "INTERMEDIATE",
  "fileUrl": "https://example.com/material.pdf"
}
```

`resourceType` must be `NOTES`, `PDF`, `VIDEO`, `QUESTION_BANK`, or `PYQ`. Use `POST /api/materials`, `PUT /api/materials/{id}`, or `DELETE /api/materials/{id}`. `uploadedBy` and `createdAt` are assigned by the server.

### Subjects and quizzes

`GET /api/subjects`, `GET /api/subjects/{id}`, `POST /api/subjects`, `PUT /api/subjects/{id}`, and `DELETE /api/subjects/{id}` manage subjects. The six demo subjects are seeded on an empty database.

`GET /api/quizzes`, `GET /api/quizzes/{id}`, and `GET /api/quizzes/{id}/questions` list quizzes. Correct answers are never included in the public question response. Admins can create or replace quizzes using `POST /api/quizzes` and `PUT /api/quizzes/{id}` with a `subjectId` and non-empty `questions` array. Admins can also manage individual questions at `/api/quizzes/{id}/questions`.

Submit one answer per question using the authenticated student's `studentId`:

```http
POST /api/quizzes/1/submit
Authorization: Bearer <student-token>
Content-Type: application/json

{"studentId":1,"answers":[{"questionId":1,"selectedOption":"B"}]}
```

The response includes the calculated score, percentage, correct/incorrect answer details, and weak topics. Use `GET /api/quizzes/attempts/{attemptId}` to view a saved result.

### Progress, bookmarks, and recommendations

- `GET /api/progress/{studentId}` returns study hours, quiz attempts, average score, completed-material count, weak topics, streak, and recent attempts.
- `POST /api/progress/{studentId}/study-hours` with `{"hours":1.5}` records a study session.
- `POST /api/progress/{studentId}/materials/{materialId}/complete` marks a material complete.
- `GET /api/bookmarks/{studentId}`, `POST /api/bookmarks` with `{"studentId":1,"materialId":1}`, and `DELETE /api/bookmarks/{id}` manage bookmarks. Duplicate student/material bookmarks return `409 Conflict`.
- `GET /api/recommendations/{studentId}` returns ranked resources using quiz weak topics, average score, completion, bookmarks, and recent attempts.
- Admin analytics are available at `GET /api/analytics/students`.

### Flashcards, summaries, and demo AI

Flashcard CRUD uses `/api/flashcards` and `/api/flashcards/{id}`. `GET /api/summaries/{materialId}` reads a saved summary; admins can create/update one at `POST /api/summaries`.

The prototype AI routes are `POST /api/ai/ask`, `/summarize`, `/flashcards`, `/scan-solve`, and `/recommendations`. Their responses are structured demo output and explicitly marked `DEMO` (or `DEMO_RULE_BASED`); no external AI, OCR, or model is connected. `AiService` is the replacement boundary for a future provider.

## Postman

Import the endpoint examples above into a collection and set `baseUrl` to `http://localhost:8080`. Run login first, save `token` from the response, then use `Authorization: Bearer {{token}}`; use the admin demo account for management endpoints and the student demo account for quiz/progress/bookmark endpoints. Errors use a JSON body with `timestamp`, `status`, `error`, `message`, `path`, and optional `validationErrors`.