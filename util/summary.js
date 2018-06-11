// Safely extracts deeply nested summary of
// error object produced by the Dropbox SDK

module.exports = function summary (err) {
 
  return err &&
         err.error && 
         err.error.error_summary;   
};