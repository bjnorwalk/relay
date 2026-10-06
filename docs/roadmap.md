# Roadmap

Relay is in early development. Milestones define scope, not promised release dates.

## Milestone 1: Editor Foundation

### Phase 1: Repository foundation

- [x] pnpm workspace and pinned toolchain.
- [x] Next.js App Router with strict TypeScript.
- [x] ESLint, Prettier, EditorConfig, and root scripts.
- [x] Project, contribution, architecture, and design documentation.
- [x] Editor engine ADR and frontend CI configuration.
- [x] Minimal page suitable for production build validation.

The foundation is pushed to GitHub with frontend CI. No editor UI or editor
behavior is included in this phase.

### Phase 2: Application shell — complete

**Issue: Build the Relay application/editor shell.**

Acceptance criteria:

- Establish semantic design tokens and light/dark themes.
- Compose a minimal sidebar, document header, document canvas, and status area.
- Preserve a comfortable document width and prioritize editing space on mobile.
- Provide semantic landmarks, labeled controls, and visible keyboard focus.
- Give every visible control real behavior; defer share, presence, and save
  indicators that have no implemented operation behind them.
- Keep feature ownership clear and pass formatting, lint, typecheck, and build.

Implemented a static document preview, responsive workspace navigation, sidebar
collapse, semantic tokens, self-hosted typography, and system/light/dark themes.
Sharing, sample document switching, Home, and Commands are explicitly disabled;
the status area does not claim that content is saved.

The shell does not include Tiptap, persistence, comments, presence, or backend
integration. Validate its responsive and keyboard behavior before Phase 3.

### Phase 3A: Tiptap editor foundation — complete

**Issue: Integrate the single-user Tiptap editor foundation.**

Implemented an empty editable document body in `features/editor`, with a
centralized StarterKit configuration, placeholder, document typography, narrow
client boundary, and focused state/history/serialization tests. The title is
separate. Content lives only in the editor instance and resets on refresh.

### Phase 3B: Rich-text formatting controls — next issue

**Issue: Add accessible formatting controls to the single-user editor.**

Add explicit controls for the base schema with predictable selection/focus
handling and meaningful command tests. Introduce links and task lists only with
their corresponding behavior. Do not add persistence or collaboration.

### Phase 3C: Contextual selection toolbar

Introduce selection tools after formatting commands are stable.

### Phase 3D: Keyboard behavior and shortcuts

Refine and test keyboard interaction before adding the slash command system.

### Phase 4: Slash commands

Add a polished block command interface with filtering and mandatory keyboard
navigation. Test filtering, active-item movement, command execution, Escape,
selection preservation, and focus return.

### Phase 5: Local persistence

Persist document content across reloads through a small document feature
boundary. Test serialization, restore, malformed data, unavailable storage, and
failed writes. Save status must reflect real outcomes. Keep storage simple and
prepare for later synchronization without building it yet.

## Later milestones

Sequence and contracts remain subject to architecture decisions:

1. Real-time coauthoring: synchronization model, Go/WebSocket interoperability,
   collaborator presence and selections.
2. Offline editing and reconnection: automatic recovery, concurrent updates,
   durable acknowledgement, and failure testing.
3. Review workflows: comments, permissions, and share links.
4. Visual document history: snapshots, diffs, and restoration.
5. Document branching: comparison, merge review, and explicit conflict semantics.
6. Operational quality: observable synchronization metrics, load tests, and
   documented performance measurements.

Authentication, Yjs, WebSockets, Redis, PostgreSQL, object storage, and backend
services are outside Milestone 1. Introduce each only with a concrete need and
an explicit boundary. Never publish performance numbers without benchmarks.
