const { fromZonedTime } = require('date-fns-tz');
console.log(fromZonedTime("2024-05-15T\n", "America/New_York"));
console.log(fromZonedTime("2024-05-15T", "America/New_York"));
console.log(fromZonedTime("2024-05-15", "America/New_York"));
