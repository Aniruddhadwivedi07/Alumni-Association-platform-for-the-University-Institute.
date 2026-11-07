function errorHandler(err, req, res, next) {
  // Handle syntax error for malformed JSON bodies
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON payload'
      }
    });
  }

  // Fallback for unexpected server errors - do not expose stack trace or internal details
  console.error('Unhandled Server Error:', err.message || err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal server error occurred'
    }
  });
}

module.exports = {
  errorHandler
};

