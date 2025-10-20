'use server';

// Clean up old analysis results (call periodically)
export async function cleanupOldResults() {
  try {
    return {
      success: true,
      message: 'No-op: results are persisted in DB',
    };
  } catch (error) {
    console.error('Error cleaning up old results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}