/**
 * Defines any types used in javascript that need to be defined
 */

/**
 * Describes an Assignment to a Trailhead Entry (either Module or Trail)
 * @typedef AssignmentEntry
 * @property {string} Id - Id of the user assignment
 * @property {string} Name - Name of the Badge or Trailmix
 * @property {string} Status - Status of the current assignment
 * @property {date} DueDate - Due date for the assignment
 * @property {integer} NumDaysUntilDue - # Days until Due
 * @property {string} URL - URL of the Badge or Trailmix
 * @property {string} Icon - Icon URL of the Badge or Trailmix
 * @property {string} EntryType - Type of Entry (i.e. Badge or Trailmix)
 */

/**
 * Badge Assignment Counts
 * @typedef BadgeAssignmentCount
 * @property {integer} badgeAssignmentCount - # of badges assigned
 * @property {integer} trailmixAssignmentCount - # of trailmixes assigned
 */