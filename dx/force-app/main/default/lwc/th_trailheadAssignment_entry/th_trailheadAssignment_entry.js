/**
 * Represents an entry in the list of trailhead assignments.
 */
import { LightningElement, api } from 'lwc';

//-- note: custom labels are currently supported in LWC - Custom Settings require an apex callout
//-- because this is an organization wide value, the choice was made to use custom labels instead

/** The default address to show for a trail */
import TRAILHEAD_TRAIL_ICON from '@salesforce/label/c.th_trailhead_trail_icon';

/** The TrailMix entry type */
import ENTRY_TYPE_TRAILMIX from '@salesforce/label/c.th_TrailheadTypeTrailmix';

/** The standard event status */
const STATUS_STANDARD = 'event-standard';
/** The event is now due */
const STATUS_DUE = 'event-due';
/** The event is considered 'upcoming' */
const STATUS_UPCOMING = 'event-upcoming';

/** The event to dispatch when we want to add an assignment to a specific trailhead trail or module */
const EVENT_ADD_ASSIGNMENT = 'requestaddassignment';

/** The event to dispatch when we want to share a specific trailhead trail or module */
const EVENT_SHARE_TRAILHEAD = 'requestsharetrailhead';

/** milliseconds per day */
// const MILLI_PER_DAY = 24 * 60 * 60 * 1000;

export default class Th_trailheadAssignment_entry extends LightningElement {

  /** the assignment */
  @api assignmentEntry;

  /** length of time until the upcoming event window is closed */
  @api upcomingEventWindow;

  /** Whether the Add button is eligible to be shown (admin setting) */
  @api btnAddEligible;

  /** whether the Share button is eliglbe to be shown (admin setting) */
  @api btnShareEligible;

  /** called on initial creation */
  connectedCallback(){
    if (!this.assignmentEntry){
      this.assignmentEntry = {};
    }

    //-- default the eligibility of the buttons
    //-- @TODO - remove / use via the metadata.
    this.btnAddEligible = this.btnAddEligible !== false;
    this.btnShareEligible = this.btnShareEligible !== false;
  }

  /** url for the icon to show */
  @api
  get iconURL(){
    let result = this.assignmentEntry.Icon;
    if (!result || this.assignmentEntry.EntryType === ENTRY_TYPE_TRAILMIX){
      result = TRAILHEAD_TRAIL_ICON;
    }
    return result;
  }

  /** whether the add button should be shown */
  @api
  get showAddBtn(){
    let result = this.btnAddEligible && !Th_trailheadAssignment_entry.isCurrentlyAssigned(this.assignmentEntry);
    return result;
  }

  /** whether the share button should be shown */
  @api
  get showShareBtn(){
    return this.btnShareEligible;
  }

  /** whether there is a due date assigned */
  @api
  get hasDueDate(){
    //-- move truthy evaluation here for clarity
    return this.assignmentEntry.DueDate ? true : false;
  }

  @api
  get statusClass(){
    let result = STATUS_STANDARD;

    let daysUntilDue = this.assignmentEntry.NumDaysUntilDue;
    if (daysUntilDue < 0){
      result = STATUS_DUE;
    } else if (daysUntilDue < this.upcomingEventWindow){
      result = STATUS_UPCOMING;
    }

    result += ' slds-p-left_xxx-small';

    return result;
  }

  @api
  handleAddClick(){
    // @TODO
    console.log('add button was clicked');

    if (!this.assignmentEntry){
      return;
    }

    const eventAdd = new CustomEvent(EVENT_ADD_ASSIGNMENT,
      {
        detail: {
          entryType: this.assignmentEntry.EntryType,
          entryId: this.assignmentEntry.Id
        }
      }
    );

    this.dispatchEvent(eventAdd);
  }

  @api
  handleShareClick(){
    // @TODO
    console.log('share button was clicked');

    if (!this.assignmentEntry){
      return;
    }

    let message = 'Hey this might be interesting. Should we check it out?';
    if (Th_trailheadAssignment_entry.isAssignmentCompleted(this.assignmentEntry)){
      message = 'Hey I completed this. check it out';
    }

    const eventShare = new CustomEvent(EVENT_SHARE_TRAILHEAD,
      {
        detail: {
          entryType: this.assignmentEntry.EntryType,
          entryId: this.assignmentEntry.Id,
          message: message
        }
      }
    );

    this.dispatchEvent(eventShare);
  }

  //-- internal methods
  /**
   * Whether an assignmentEntry is already assigned to the current person.
   * @param assignmentEntry - AssignmentEntry - The assignment entry given for the current person
   * @return boolean - whether the assignment is currently assigned to the current user (true) or not (false)
   */
  static isCurrentlyAssigned(assignmentEntry){
    //-- there are three statuses: Assigned, In Progress and Completed
    //-- assume if there is any of those statuses, then it is assigned.
    if (!assignmentEntry){
      return false;
    }
    let status = assignmentEntry.Status;
    let result = false;
    if (status){
      result = true;
    }
    return result;
  }

  /**
   * Whether an assignmentEntry has been completed by the current person.
   * @param assignmentEntry - AssignmentEntry - the assignment entry given for the current person
   * @return boolean - whether the assignment has been completed by the current user (true) or not (false)
   */
  static isAssignmentCompleted(assignmentEntry){
    //-- there are three statuses: Assigned, In Progress and Completed
    //-- assume completed ONLY if the Status is Completed
    if (!assignmentEntry){
      return false;
    }
    let status = assignmentEntry.Status;
    let result = false;
    if (status === 'Completed'){
      result = true;
    }
    return result;
  }
}