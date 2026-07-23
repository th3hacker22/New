# Agent Rules & Instructions

This file defines custom rules and persistent guidelines for the AI assistant. The system automatically loads this file and enforces its instructions on every interaction.

## Core Rules

1. **Skill Verification on Every Turn (MANDATORY)**:
   - For every request or command from the user, the agent **MUST** proactively check the available system skills and any custom installed skills.
   - If a skill is relevant to the task (e.g., Gemini API, Firebase, maps, OAuth, etc.), the agent **MUST** call `view_file` on the corresponding `SKILL.md` before making edits or explaining the plan.
   - Always prioritize following the specific instructions and best practices outlined in the relevant Skill.
   - **Custom Installed Skills**: Fully incorporate and adhere to instructions from:
     - `frontend-design`: Apply premium visual guidelines, elegant layouts, consistent typography, robust spacing patterns, and high visual polish.
     - `vercel-react-best-practices`: Follow React hook optimization, clean state management, modular component design, and performant coding practices.
     - `improve-codebase-architecture`: Keep files modular, maintain absolute type safety, define types early, and organize modules logically.
     - `web-design-guidelines`: Ensure responsive fluid layouts, optimal contrast, minimum touch-target sizing, and professional visual hierarchy.
