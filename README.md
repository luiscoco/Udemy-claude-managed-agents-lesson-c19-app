# C19 · The Tool Confirmation Round Trip

Runs a local confirmation state machine. Allow/Deny here does not confirm a real provider tool. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Bind approval to the original call
- Check current pending state
- Uncertain delivery needs reconciliation

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3019`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3019
```

## How the app was build

### 1. Bind the decision to the captured pending call

The local pending call is sevt_write, and the only supported decisions are allow and deny. A different event ID or decision cannot produce a confirmation plan.

Source: [src/lesson.ts](src/lesson.ts#L13) · selected statements

```typescript
const id = text(input, "eventId"),
  decision = text(input, "decision");

if (id !== "sevt_write" || !["allow", "deny"].includes(decision))
  return report(
    "rejected",
    "Decision does not match the captured pending call",
    {},
    [
      "Inspect the canonical request",
      "Verify event correlation and the selected decision",
    ],
  );
```

### 2. Separate acknowledgement from execution

The prepared user.tool_confirmation uses tool_use_id to correlate the original call. An unacknowledged delivery remains uncertain, and toolSuccess stays not observed even after acknowledgement; the reducer sends no confirmation.

Source: [src/lesson.ts](src/lesson.ts#L15) · selected statements

```typescript
const acknowledged = flag(input, "deliveryAcknowledged");

return report(
  acknowledged ? "passed" : "unconfirmed",
  "Confirmation receipt is separate from tool execution",
  {
    state: acknowledged ? "acknowledged" : "uncertain",
    event: { type: "user.tool_confirmation", tool_use_id: id, result: decision },
    toolSuccess: "not observed",
  },
  [
    "Claim the pending decision before sending",
    "Use the captured event identifier",
    "Do not blindly resend an uncertain confirmation",
  ],
);
```

### Check your understanding

Run **Approve the current call** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "eventId": "sevt_write",
    "decision": "allow",
    "deliveryAcknowledged": true
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "state": "acknowledged"
  }
}
```

Then try **Reject wrong correlation**. Its expected outcome is `rejected`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
