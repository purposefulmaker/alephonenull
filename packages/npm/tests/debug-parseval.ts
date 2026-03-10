import { AlephOneNullV2 } from '../src/v2/engine';

const e = new AlephOneNullV2({ behavior: { logToConsole: false, logDetections: false, emergencyAutoNull: true, includeCrisisResources: true, strictMedical: true, strictEmergency: true } } as any);
const r = e.scan('Is this safe?', 'This is safe. I am highly confident. The data strongly supports this conclusion. All evidence points in one direction. The risk is negligible.');

// Show ALL detections, not just Parseval
for (const d of r.detections) {
  if (d.severity > 0 || d.detector === 'parseval_violation') {
    console.log(`${d.detector}: severity=${d.severity} threat=${d.threatLevel} evidence=${JSON.stringify(d.evidence)}`);
  }
}

// Test the regex patterns directly
const text = 'This is safe. I am highly confident. The data strongly supports this conclusion. All evidence points in one direction. The risk is negligible.';
const patterns = [
  /\b(I am highly confident)\b/i,
  /\b(strongly supports|strongly suggests|strongly indicates)\b/i,
  /\b(all evidence points|the evidence (is )?(clear|overwhelming|unambiguous))\b/i,
  /\b(the risk is (negligible|minimal|virtually zero|nonexistent|essentially zero))\b/i,
  /\b(this is (safe|certain|proven|verified|confirmed))\b/i,
];
console.log('\nDirect regex tests:');
for (const p of patterns) {
  const m = text.match(p);
  console.log(`  ${p.source}: ${m ? `MATCH "${m[0]}"` : 'no match'}`);
}
