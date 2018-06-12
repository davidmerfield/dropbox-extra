// Safely extracts deeply nested summary of
// error object produced by the Dropbox SDK

module.exports = function summary (err) {
 
  var summary = err &&
         err.error && 
         err.error.error_summary;

  if (!summary) return summary;

  if (summary[0] === '/') summary = summary.slice(1);
  
  while (['/', '.'].indexOf(summary.slice(-1)) > -1)
    summary = summary.slice(0, -1);

  return summary;
  
};