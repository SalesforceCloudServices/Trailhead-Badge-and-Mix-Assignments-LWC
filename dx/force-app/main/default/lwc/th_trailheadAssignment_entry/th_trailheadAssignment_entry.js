/**
 * Represents an entry in the list of trailhead assignments.
 */
import { LightningElement, api } from 'lwc';

//-- import the custom javascript types
// require('../th_trailheadAssignments/__types__/CustomTypes);

//-- note: custom labels are currently supported in LWC - Custom Settings require an apex callout
//-- because this is an organization wide value, the choice was made to use custom labels instead

/** The default address to show for a trail */
import TRAILHEAD_TRAIL_ICON from '@salesforce/label/c.th_trailhead_trail_icon';

/** The TrailMix entry type */
import ENTRY_TYPE_TRAILMIX from '@salesforce/label/c.th_TrailheadTypeTrailmix';

//-- custom labels for the message
/** The message to share for in-progress trailhead items */
import TRAILHEAD_SHARE_INCOMPLETE_MSG from '@salesforce/label/c.th_TrailheadShareIncompleteMsg';
/** The message to share for completed trailhead items */
import TRAILHEAD_SHARE_COMPLETE_MSG from '@salesforce/label/c.th_TrailheadShareCompleteMsg';

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

  /**
   * the assignment
   * @type {AssignmentEntry}
   **/
  @api assignmentEntry;

  /**
   * Number of Days until an event is no longer considered 'upcoming'
   * @type {Number}
   **/
  @api upcomingEventWindow;

  /**
   * Whether the Add button is eligible to be shown (admin setting)
   * @type {boolean}
   **/
  @api btnAddEligible;

  /** Whether the Share button is eliglbe to be shown (admin setting)
   * @type {boolean} */
  @api btnShareEligible;

  /** Called on initial creation */
  connectedCallback(){
    if (!this.assignmentEntry){
      this.assignmentEntry = {};
    }

    //-- default the eligibility of the buttons
    //-- @TODO - remove / use via the metadata.
    this.btnAddEligible = this.btnAddEligible !== false;
    this.btnShareEligible = this.btnShareEligible !== false;
  }

  /** 
   * Url for the icon to show
   * @type {string}
   */
  @api
  get iconURL(){
    let result = this.assignmentEntry.Icon;
    if (!result || this.assignmentEntry.EntryType === ENTRY_TYPE_TRAILMIX){
      result = TRAILHEAD_TRAIL_ICON;
    }
    return result;
  }

  /**
   * whether the add button should be shown
   * @type {boolean}
   */
  @api
  get showAddBtn(){
    let result = this.btnAddEligible && !Th_trailheadAssignment_entry.isCurrentlyAssigned(this.assignmentEntry);
    return result;
  }

  /**
   * Whether the share button should be shown
   * @type {boolean}
   */
  @api
  get showShareBtn(){
    return this.btnShareEligible;
  }

  /**
   * Whether there is a due date assigned
   * @type {boolean}
   */
  @api
  get hasDueDate(){
    //-- move truthy evaluation here for clarity
    return this.assignmentEntry.DueDate ? true : false;
  }

  /**
   * CSS class of the status (based on whether it is overdue, upcoming or in the future)
   * @type {string}
   */
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

  /**
   * Handles when the user clicks the Add button
   */
  @api
  handleAddClick(){
    if (!this.assignmentEntry){
      return;
    }

    /** @type {EventAddAssignment} */
    const eventAdd = new CustomEvent(EVENT_ADD_ASSIGNMENT,
      {
        bubbles:true,
        composed:true,
        detail: {
          trailheadEntry: this.assignmentEntry,
          trailheadEntryName: this.assignmentEntry.Name,
          trailheadEntryType: this.assignmentEntry.EntryType
        }
      }
    );

    this.dispatchEvent(eventAdd);
  }

  /**
   * Handles when the user clicks the Share button
   */
  @api
  handleShareClick(){
    if (!this.assignmentEntry){
      return;
    }

    let defaultMessage = TRAILHEAD_SHARE_INCOMPLETE_MSG;
    if (Th_trailheadAssignment_entry.isAssignmentCompleted(this.assignmentEntry)){
      defaultMessage = TRAILHEAD_SHARE_COMPLETE_MSG;
    }

    /** @type {EventShareTrailhead} */
    const eventShare = new CustomEvent(EVENT_SHARE_TRAILHEAD,
      {
        bubbles: true,
        composed: true,
        detail: {
          trailheadEntry: this.assignmentEntry,
          trailheadEntryName: this.assignmentEntry.Name,
          trailheadEntryType: this.assignmentEntry.EntryType,
          defaultMessage: defaultMessage
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