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
   * Keep false: the waitlist endpoint was not carried over from Lovable.
   */
  PRELAUNCH_MODE: false,
  
  /**
   * When true, shows the Maintenance page (takes priority over PRELAUNCH_MODE)
   */
  MAINTENANCE_MODE: false,

  /**
   * AI features (trading assistant, chart screenshot analysis, daily summary,
   * news translation). Off since the move away from Lovable: they ran on
   * Lovable's AI gateway and need a new provider before they can return.
   */
  AI_FEATURES: false,
} as const;
