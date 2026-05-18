/*
  # Remove Unused Indexes

  Drop unused index that is not being utilized by the database query planner.
  Unused indexes consume storage and slow down write operations without providing query optimization benefits.
*/

DROP INDEX IF EXISTS idx_components_user_id;