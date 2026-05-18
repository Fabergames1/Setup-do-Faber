/*
  # Add Index for Foreign Key

  Create a covering index for the foreign key constraint on components.user_id.
  This improves query performance for lookups on the user_id column and supports efficient constraint enforcement.
*/

CREATE INDEX IF NOT EXISTS idx_components_user_id ON components(user_id);