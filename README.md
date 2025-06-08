# Porflyo: Automatic Portfolio Generator from GitHub Repositories

**Porflyo** is a personal project developed as part of my Final Degree Project (TFG).  
Its goal is to let users authenticate with their GitHub account, select a few public repositories, and instantly generate a clean and professional portfolio website, all hosted automatically, no manual deployment required.

This repository contains the full codebase: a backend service (Micronaut + Java), a frontend application (React + TypeScript), and the infrastructure setup designed to run in AWS.

---

## What is planned

- Let users authenticate via GitHub OAuth2 (Authorization Code flow)
- Fetch the authenticated user's public repositories
- Allow selecting repositories to showcase
- Saves user + repo selection in a database (DynamoDB)
- Generates a personalized portfolio page at a custom local domain

More features (analytics, customization), and more integrations (GitLab) are scoped for future work.

---

## Tech stack

### Frontend (in progress)

- **React** + **TypeScript**
- Handles GitHub OAuth redirect logic
- Fetches available repositories from the backend
- Stores selected repositories in the backend

### Backend (in progress)

- **Java 21**
- **Micronaut Framework**
- **Micronaut Security OAuth2** for GitHub login
- **JWT** for secure session representation
- **Cookies** (HTTP-only, signed) to persist the session in the browser
- **DynamoDB** to persist user data (user ID, selected repos)
- **Micronaut OpenAPI / Swagger** to generate and expose API documentation

### Infrastructure (in progress)

- **Terraform** to define AWS infrastructure (Lambda, API Gateway, DynamoDB, etc.)
- **AWS Lambda** as the intended compute runtime (but currently runs locally)
- **CloudWatch** and **AWS X-Ray** planned for tracing and monitoring
- **DynamoDB Local** used for development

---

## Architecture overview

Porflyo is built following a **modular architecture** inspired by microservices and serverless design principles. Although currently structured as a single service, it’s architected in a way that allows future separation into multiple services if needed.

### Why not run a monolithic container 24/7?

Because it’s:

- **More expensive**: Running an EC2 instance or a container permanently means **paying for uptime, even if there’s no traffic**.
- **Unnecessary**: Most user actions (e.g., logging in, selecting repos) are short-lived and sporadic.
- **Less scalable**: Traditional apps require provisioning for peak load, which leads to overprovisioning and wasted resources.

Instead, Porflyo is designed to work in a **serverless model**, where:

- The backend runs as **on-demand functions (AWS Lambda)** that only spin up when needed.
- You **only pay for the actual compute time** not idle time.
- Scaling is handled automatically by AWS.

This is especially useful for projects in early stages or with low to medium usage, like this TFG. It allows **staying within AWS’s free tier**, or at least keeping costs minimal.

Even though everything runs as one codebase now, the separation of concerns (authentication, portfolio generation, repository handling) means that the backend can be split into independent microservices in the future — if traffic grows or domain complexity increases.

Micronaut is well-suited for this because of its:

- **Low startup time**, which avoids long cold starts in Lambda
- **Small memory footprint**
- Ability to be compiled to **native images** with GraalVM (see section below)

In short: this architecture minimizes cost, avoids running idle infrastructure, and lays the groundwork for future modularization and scaling.

---

## Why Micronaut instead of Spring?

Choosing **Micronaut** over the more common **Spring Boot** was a deliberate decision:

- **Fast startup times**: Micronaut doesn’t rely on runtime reflection like Spring, so apps start faster and consume less memory, ideal for serverless environments (like AWS Lambda).
- **Compile time dependency injection**: All injection, validation, and bean wiring is resolved at compilation time, reducing runtime overhead and potential bugs.
- **Better native image support**: Micronaut is designed from the ground up to support GraalVM and native image generation with minimal configuration.
- **Smaller footprint**: Great for scenarios where cold starts matter, which is the case in Lambda-based architectures.

That said, Spring has a richer ecosystem and is more familiar to most teams. But for a focused project like this, where resource efficiency matters and the system is simple, Micronaut is a better fit.

---

## Future native image support

Although Porflyo currently runs on the JVM, Micronaut makes it relatively easy to compile the backend into a **native executable** using **GraalVM**.  
This reduces startup time to milliseconds and memory usage significantly, which is ideal for serverless (cold-start sensitive) environments.

Right now, native compilation is **not enabled** to avoid complexity during development, but the codebase is structured to support it later with minimal changes.

---

## OAuth2 with GitHub — how it works and why

Authentication is done through GitHub, using the **OAuth2 Authorization Code** flow.

### Why GitHub?

- It’s familiar to developers (the target audience of Porflyo)
- It allows easy access to public repositories and basic profile info
- It removes the need for users to manage passwords or accounts on the platform

### How the flow works

1. The frontend redirects the user to GitHub’s OAuth authorization page
2. Once the user approves access, GitHub redirects back with a temporary `code`
3. The backend exchanges this `code` for an **access token**
4. That token is used to:
   - Fetch the user’s GitHub profile (username, avatar)
   - List their public repositories
5. A JWT is generated and stored in a signed, HTTP-only cookie to maintain the session
6. On future requests, the backend reads the cookie to identify the user

GitHub does not issue refresh tokens. However, access tokens typically last a long time, and the session is preserved as long as the cookie is valid. When it expires, the user is redirected to log in again.

This approach simplifies the user flow and avoids needing a separate user database or credentials system.

---

## File structure

- `/core` — Micronaut backend (Java)
- `/web` — React frontend (TypeScript)
- `/infra` — Terraform (planned)
- `/docs` — Diagrams and project documentation

---

## License

This project is **source-available**.

You may:

- View the source code
- Fork the repository
- Open issues or submit pull requests

You may **not**:

- Use this code in other projects
- Redistribute modified or unmodified versions
- Commercialize this code or publish clones

See [`LICENSE`](./LICENSE) for full legal terms.

---

## About the author

I’m Mauro, a software engineering student passionate about clean architecture, automation, and building developer tools that actually save time.  
This project is part of my university thesis but also something I genuinely want to finish and polish. I enjoy backend work, devops, and writing code that explains itself.

If you find bugs, have feedback, or want to contribute, feel free to open an issue or PR.  
Just don’t fork it, rebrand it, and launch it on Product Hunt, please.