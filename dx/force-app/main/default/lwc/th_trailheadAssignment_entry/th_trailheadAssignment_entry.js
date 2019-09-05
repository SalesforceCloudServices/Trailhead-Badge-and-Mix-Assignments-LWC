/**
 * Represents an entry in the list of trailhead assignments.
 */

import { LightningElement, api, track, wire } from 'lwc';

//-- pubsub to support enrolling in one component visually notifies the other components to refresh
import { fireEvent as firePubSubEvent } from 'c/th_pubsub';
//-- support page reference within the pubsub
import { CurrentPageReference } from 'lightning/navigation';


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
// import TRAILHEAD_SHARE_INCOMPLETE_MSG from '@salesforce/label/c.th_TrailheadShareIncompleteMsg';
/** The message to share for completed trailhead items */
// import TRAILHEAD_SHARE_COMPLETE_MSG from '@salesforce/label/c.th_TrailheadShareCompleteMsg';

/** The standard event status */
const STATUS_STANDARD = 'event-standard';
/** The event is now due */
const STATUS_DUE = 'event-due';
/** The event is considered 'upcoming' */
const STATUS_UPCOMING = 'event-upcoming';

/** The event to dispatch when a new enrollment has been requested */
const EVENT_ENROLLMENT = 'enrollment';

/** milliseconds per day */
// const MILLI_PER_DAY = 24 * 60 * 60 * 1000;

export default class Th_trailheadAssignment_entry extends LightningElement {

  @wire(CurrentPageReference) pageRef;

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

  //-- @TODO: remove
  /**
   * Whether the share form is shown
   * @type {boolean}
  */
  @track isShareFormShown;

  /**
   * Whether the add form is shown
   * @type {boolean}
   */
  @track isAddFormShown;



  //-- methods

  /** Called on initial creation */
  connectedCallback(){
    if (!this.assignmentEntry){
      this.assignmentEntry = {};
    }

    //-- default the eligibility of the buttons
    this.btnAddEligible = this.btnAddEligible !== false;
    this.btnShareEligible = this.btnShareEligible !== false;

    this.isShareFormShown = false;
    this.isAddFormShown = false;
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

  

  //-- handlers

  /**
   * Handles when the user clicks the Add button
   */
  @api
  handleAddClick(){
    if (!this.assignmentEntry){
      return;
    }

    if (this.isAddFormShown === false) {
      //-- show the form
      this.isAddFormShown = true;
      //-- hide the share form, so only one is shown at a time.
      this.isShareFormShown = false;
    } else { // this.isAddFormShown === true
      //-- hide the form
      this.isAddFormShown = false;
    }
  }

  /**
   * Handles when the user clicks the Share button
   */
  @api
  handleShareClick(){
    if (!this.assignmentEntry){
      return;
    }

    if (this.isShareFormShown === false) {
      //-- show the form
      this.isShareFormShown = true;
      //-- hide the share form, so only one is shown at a time.
      this.isAddFormShown = false;
    } else { // this.isAddFormShown === true
      //-- hide the form
      this.isShareFormShown = false;
    }
  }

  /** Handles when a user requests that the share form be closed */
  @api
  handleShareCloseRequest(evt){
    // console.log('share form has requested to close');
    this.isShareFormShown = false;
  }

  /**
   * Handles when a user requests that the add form be closed
   */
  @api
  handleAddCloseRequest(evt){
    //console.log('add form has requested to close');
    this.isAddFormShown = false;

    if (evt && evt.detail){
      if (evt.detail.shouldRefresh === true) {
        this.btnAddEligible = false;

        //-- let any other components that need to know that an enrollment occurred.
        firePubSubEvent(this.pageRef, EVENT_ENROLLMENT, evt.detail);
      }
    }
  }



  //-- getter / setters

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
    let result = 'slds-p-left_xxx-small ';

    let daysUntilDue = this.assignmentEntry.NumDaysUntilDue;
    if (daysUntilDue < 0){
      result += STATUS_DUE;
    } else if (daysUntilDue < this.upcomingEventWindow){
      result += STATUS_UPCOMING;
    } else {
      result += STATUS_STANDARD;
    }

    return result;
  }
}