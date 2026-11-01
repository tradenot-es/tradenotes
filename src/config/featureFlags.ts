/**
 * Feature Flags Configuration
 * 
 * Toggle these flags to enable/disable features across the app.
 * Change PRELAUNCH_MODE to true to show the PreLaunch page instead of Landing.
 * Change MAINTENANCE_MODE to true to show the Maintenance page.
 */

export const featureFlags = {
  /**
   * When true, shows the PreLaunch/Waitlist page instead of the Landing page.
   * Keep false: the waitlist on that page has no backend endpoint.
   */
  PRELAUNCH_MODE: false,
  
  /**
   * When true, shows the Maintenance page (takes priority over PRELAUNCH_MODE)
   */
  MAINTENANCE_MODE: false,
} as const;
