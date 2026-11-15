# Domain Documenting Reference

Source basis: `init-domain-document.md`.

## Discovery Principles

- Domain experts, developers, and source code should share the same model.
- Focus on business events and workflows before data structures.
- Split the problem domain into smaller subdomains.
- Create one model per subdomain in the solution space.
- Build ubiquitous language and use it consistently in conversation, documents, and code.
- Ignore technical concerns during early event storming.
- Avoid database-first and class-first design.
- Keep attention on business value: earning money, saving money, reducing waste, or improving important workflows.

## Event Storming

Start with domain events: things that happened in business language.

Example event forms:

- Order form received
- Order placed
- Order shipped
- Order change requested
- Order cancellation requested
- Refund requested
- Quote form received
- Quote issued
- New customer registration requested
- New customer registered

Put events in time order. Look for gaps between events. Identify which team or context produces each event and which team or context consumes it.

After events, document commands: requests that cause events.

Use this flow:

```text
Event -> Command -> Business workflow -> Output event -> Command -> ...
```

## Bounded Contexts

A bounded context is the solution-space boundary in which a model and its language have one meaning.

When defining contexts:

- Listen for domain expert language.
- Pay attention to existing team boundaries.
- Keep the "bounded" part explicit.
- Design for autonomy.
- Design for smooth business workflows.
- Separate contexts enough that dependency and interface control are possible.

Create a context map in text or diagram form so the whole system can be seen at once.

Classify contexts when possible:

- Core domain: central to business differentiation.
- Supporting domain: important but not the main differentiator.
- Generic domain: common capability not unique to the business.

## Ubiquitous Language

Use domain terms everywhere. If the business says `Order`, use `Order` in documents and code. Avoid design terms that only exist because of implementation habits, such as `OrderManager`.

Define terms by rules, not vibes. Include constraints, lifecycle states, and context-specific meanings.

## Domain Document Format

Use natural language and a lightweight type notation. Do not discuss classes, methods, functions, database tables, or framework implementation at this stage.

Recommended notation:

- `AND`: both parts are required.
- `OR`: exactly one of the alternatives is required unless otherwise stated.
- `NOT`: excluded or invalid condition.
- `list of`: collection.
- `???`: unresolved domain detail that must be clarified.

Workflow template:

```text
Bounded context: <ContextName>

Workflow: <WorkflowName>
    triggered by:
        '<EventName>' event
    primary input:
        <Input>
    other input:
        <OtherInputOrDependency>
    output events:
        '<OutputEvent>' event
    side-effects:
        <Business-visible side effect>
```

Data template:

```text
data <Name> =
    <PartA>
    AND <PartB>
    AND list of <PartC>

data <Choice> =
    <CaseA>
    OR <CaseB>
```

Workflow detail template:

```text
workflow '<WorkflowName>' =
    input: <Input>
    output (on success):
        <SuccessOutput>
        AND <OutputEvent>
    output (on error):
        <Error>

    do <StepOne>
    if <condition> then:
        return with <Error>
    do <StepTwo>
    return <OutputEvent>
```

Substep template:

```text
substep '<SubstepName>' =
    input: <Input>
    output: <Output> OR <Error>
    dependencies: <DependencyA>, <DependencyB>

    <business rule>
    <business rule>

    if everything is OK, then:
        return <Output>
    else:
        return <Error>
```

## Clarification Triggers

Ask the user or domain expert before implementation when:

- A term has multiple meanings across contexts.
- A workflow boundary is unclear.
- An event could belong to more than one team/context.
- A business rule uses vague words such as valid, approved, active, complete, normal, or premium.
- Data constraints are missing.
- A lifecycle state is implied but not named.
- An external dependency looks like a domain rule but may be infrastructure.
