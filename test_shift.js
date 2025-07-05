// Test the new shift calculation logic
const pattern = [3,-3,4,-4,3,-3,4,-3,3,-4,4,-3,3,-4,4,-4];
const segments = pattern.map(p => ({ length: Math.abs(p), isWork: p > 0 }));

console.log('Pattern segments:');
segments.forEach((seg, i) => {
  console.log('Segment ' + i + ': ' + seg.length + ' days ' + (seg.isWork ? 'WORK' : 'OFF'));
});

const totalWorkDays = segments.reduce((sum, seg) => sum + (seg.isWork ? seg.length : 0), 0);
console.log('Total work days in pattern: ' + totalWorkDays);

// Test work day counting for first 42 days
let workDayCount = 0;
let calendarDay = 0;

console.log('\nWork day progression (first 42 calendar days):');
for (let i = 0; i < segments.length && calendarDay < 42; i++) {
  const seg = segments[i];
  for (let j = 0; j < seg.length && calendarDay < 42; j++) {
    calendarDay++;
    if (seg.isWork) {
      workDayCount++;
      const cycleWorkDay = ((workDayCount - 1) % 28) + 1;
      const shiftType = cycleWorkDay <= 14 ? 'DAY' : 'NIGHT';
      console.log('Calendar day ' + calendarDay + ', Work day ' + workDayCount + ', Cycle work day ' + cycleWorkDay + ', Shift: ' + shiftType);
    } else {
      console.log('Calendar day ' + calendarDay + ', OFF');
    }
  }
}
