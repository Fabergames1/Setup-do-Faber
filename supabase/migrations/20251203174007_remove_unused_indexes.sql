/*
  # Remove Unused Indexes

  Drop indexes that are not being used by the query planner.
  These indexes add maintenance overhead without providing query performance benefits.

  Indexes being removed:
  - idx_profiles_user_id
  - idx_profiles_email
  - idx_profiles_display_name
  - idx_components_user_id
  - idx_fb_components_category
*/

DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_display_name;
DROP INDEX IF EXISTS idx_components_user_id;
DROP INDEX IF EXISTS idx_fb_components_category;