const fs = require("fs");
const path = require("path");
// Log status:
// INFO: Informational messages that confirm that things are working as expected. These messages are generally used for routine events.
// WARN or WARNING: Indicates a potential issue or a situation that may need attention in the future but does not currently impact the system's functionality.
// ERROR: Indicates a failure or an error that needs immediate attention. This status is used for unexpected and critical issues.
// DEBUG: Used for detailed debugging information. These logs are typically only enabled in development or debugging environments.
// TRACE: Provides the most detailed information, usually used for tracking the flow of execution in a program. Similar to DEBUG but with more detailed information.

// Function to record a log entry to a file
function recordLogEntry(status, service, logMessage) {
  // Get the current date and time
  const timestamp = Date.now();
  const formattedTimestamp = formatTimestamp(timestamp);

  // Format the log entry
  const logEntry = `${formattedTimestamp} - [${status}] - [${service}] - ${logMessage}\n`;
  console.log(logEntry);

  // Define the path to the log file
  const logFilePath = path.join(__dirname, "logs", "app.log");

  // Check if the log file exists
  fs.access(logFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Log file does not exist, create it
      fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
      fs.writeFileSync(logFilePath, ""); // Create an empty log file
    }

    // Append the log entry to the log file
    fs.appendFile(logFilePath, logEntry, (appendErr) => {
      //   if (appendErr) {
      //     console.error("Error writing to log file:", appendErr);
      //   } else {
      //     console.log("Log entry recorded to file:", logEntry);
      //   }
    });
  });
}

// Function to format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year}-${hours}:${minutes}:${seconds}`;
}

// Export the recordLogEntry function
module.exports = recordLogEntry;
