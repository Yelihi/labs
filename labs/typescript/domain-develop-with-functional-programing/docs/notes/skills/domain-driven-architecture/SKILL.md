---
name: domain-driven-architecture
description: Guide and apply domain-driven design architecture from the local notes init-domain-document.md and modeling-to-typescript.md. Use during early business/domain model design, when starting or structuring project architecture, when defining bounded contexts, during DDD/event-storming style discovery, when creating domain documents, when designing interface/entity/domain types for frontend or TypeScript implementation, when translating domain documents into TypeScript functional domain models, or when reviewing whether code follows the project's domain-driven design rules.
---

# Domain-Driven Architecture

## Purpose

Use this skill to make project architecture follow the note-based DDD workflow:

1. Discover the domain before choosing technical structure.
2. Document bounded contexts, workflows, commands, events, inputs, outputs, dependencies, and rules in ubiquitous language.
3. Translate the domain document into TypeScript models using explicit types, functional workflows, and dependency signatures.
4. Review implementation decisions against the domain model instead of database, class, framework, or CRUD-first structure.

## Invocation Timing

Invoke this skill at two primary harness stages:

1. Early business model design: before UI architecture, component structure, API DTOs, state stores, database shape, or framework folders are designed. Use it to discover domain events, commands, workflows, bounded contexts, ubiquitous language, and unresolved business questions.
2. Interface/entity design: before creating TypeScript domain types, frontend state models, form models, API-facing interfaces, workflow signatures, entities, value objects, aggregate roots, or state machines. Use it to ensure interface and entity shapes reflect the domain model rather than transport or UI convenience.

Also invoke it for review when an implementation begins to accumulate boolean flags, optional-field bags, mixed DTO/domain types, unclear context boundaries, or technical names that are not part of the ubiquitous language.

## Required Workflow

Before creating or changing architecture, read only the references needed for the task:

- Read `references/domain-documenting.md` when the task involves requirements, bounded contexts, event storming, workflow discovery, ubiquitous language, or architecture boundaries.
- Read `references/typescript-modeling.md` when the task involves TypeScript modeling, fp-ts style workflow signatures, entity/value object decisions, aggregate design, state modeling, or dependency modeling.

Then proceed in this order:

1. Identify the business goal and money/time-saving outcome the domain supports.
2. Capture domain events first, then the commands that trigger them.
3. Group workflows and language into bounded contexts and subdomains.
4. Mark each bounded context as core, supporting, or generic when enough context exists.
5. Define each workflow as input, other input/dependencies, output events, errors, side effects, and substeps.
6. Define data with AND, OR, NOT, list of, ranges, and unknowns before writing TypeScript.
7. Ask the user when domain meaning, boundary ownership, or business rules are ambiguous.
8. Only after the domain document is coherent, map it to TypeScript types, workflow signatures, and module boundaries.

## Architecture Rules

Prefer boundaries around bounded contexts and workflows. Avoid starting from database tables, controllers, screens, classes, methods, or framework folders.

Use the same ubiquitous language in documents, folders, file names, types, functions, tests, and API contracts. Do not introduce technical names such as `OrderManager` into the design language unless the domain expert would use that term.

Make the domain layer describe business rules and transitions. Keep infrastructure, persistence, UI, transport, and remote service details outside the domain model unless the user explicitly asks for integration code.

Represent cross-context communication with explicit events, commands, and interfaces. Treat one team's output as another team's input when documenting pipelines.

## TypeScript Modeling Rules

When translating from the domain document:

- Model simple domain values with branded types or small classes, especially when primitive types share runtime shapes but differ in domain meaning.
- Put validation in constructors/factories that return `Either`, `Option`, `Task`, or `TaskEither` as appropriate.
- Model AND as records/classes and OR as union types.
- Model unknown domain concepts as explicit unresolved types such as `type Undefined = never` until clarified.
- Model workflows as function signatures before implementation.
- Model dependencies as function parameters for internal workflows, but hide them from public APIs.
- Use entities only when identity matters across value changes. Compare entities by id.
- Use value objects when equality is structural and identity does not matter.
- Treat aggregate roots as consistency and transaction boundaries. Modify aggregate internals through the aggregate root.
- Avoid boolean flags for domain states. Use separate types and discriminated unions/state machines.
- Avoid one object with optional fields when the domain allows a small finite set of valid combinations. Model those combinations explicitly.

## Implementation Output

For a new project or architecture setup, produce these artifacts when relevant:

- Bounded context map or text equivalent.
- Ubiquitous language glossary.
- Domain events and commands list.
- Workflow document with input, output, errors, dependencies, side effects, and substeps.
- TypeScript domain model skeleton.
- Module/folder boundary proposal based on bounded contexts.
- Open questions for domain experts.

For an existing project, inspect current structure first and then suggest or apply the smallest changes that align it with the domain document.
