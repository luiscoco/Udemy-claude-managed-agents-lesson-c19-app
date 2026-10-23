import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 19,
  title: "The Tool Confirmation Round Trip",
  description: "In a managed session, the agent loop runs remotely. There is no local can-use-tool callback executing inside your application’s agent loop.",
  concepts: ["Bind approval to the original call", "Check current pending state", "Uncertain delivery needs reconciliation"],
  scope: "Runs a local confirmation state machine. Allow/Deny here does not confirm a real provider tool. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Approve the current call", "input": {"eventId": "sevt_write", "decision": "allow", "deliveryAcknowledged": true}, "expected": "passed", "checks": {"state": "acknowledged"}}, {"id": "1", "label": "Reject wrong correlation", "input": {"eventId": "toolu_wrong", "decision": "allow", "deliveryAcknowledged": true}, "expected": "rejected", "checks": {}}, {"id": "2", "label": "Lost acknowledgement", "input": {"eventId": "sevt_write", "decision": "deny", "deliveryAcknowledged": false}, "expected": "unconfirmed", "checks": {"state": "uncertain"}}],
  async run(input) {

const id=text(input,"eventId"), decision=text(input,"decision");
if(id!=="sevt_write"||!["allow","deny"].includes(decision))return report("rejected","Decision does not match the captured pending call",{},["Inspect the canonical request","Verify event correlation and the selected decision"]);
const acknowledged=flag(input,"deliveryAcknowledged");
return report(acknowledged?"passed":"unconfirmed","Confirmation receipt is separate from tool execution",{state:acknowledged?"acknowledged":"uncertain",event:{type:"user.tool_confirmation",tool_use_id:id,result:decision},toolSuccess:"not observed"},["Claim the pending decision before sending","Use the captured event identifier","Do not blindly resend an uncertain confirmation"]);

  }
};
