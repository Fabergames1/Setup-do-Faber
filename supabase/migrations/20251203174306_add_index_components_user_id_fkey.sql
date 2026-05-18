/*
  # Add Index for Foreign Key

  Create an index on the components.user_id column to cover the foreign key.
  This improves query performance when joining tables and filtering by user_id.
*/

CREATE INDEX IF NOT EXISTS idx_components_user_id_fkey ON public.components(user_id);