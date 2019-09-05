//-- include custom javascript types for tooltip / vscode intellisense
// require('../th_trailheadAssignments/__types__/CustomTypes')

import { LightningElement, track, api } from 'lwc'; // eslint-disable-line no-unused-vars

/** apex method to find the users */
import shareUtilFindMatchingUsers from '@salesforce/apex/TH_ShareUtil.findMatchingUsers';

/** apex method to share a chatter post */
import shareUtilMentionTrailheadToUser from '@salesforce/apex/TH_ShareUtil.mentionTrailheadToUser';

/** Minimum characters to enter before doing a search */
import shareUtilMinCharSearchThreshold from '@salesforce/label/c.th_TrailheadMinCharSearchThreshold';
const MIN_SEARCH_THRESHOLD = Number.parseInt(shareUtilMinCharSearchThreshold, 10);

/** Represents the timeout to provide for waiting for input prior to doing the search */
import shareUtilInputSearchDelay from '@salesforce/label/c.th_TrailheadInputSearchDelay';
const INPUT_SEARCH_DELAY = Number.parseInt(shareUtilInputSearchDelay, 10);

//-- custom labels for the message
/** The message to share for in-progress trailhead items */
import TRAILHEAD_SHARE_INCOMPLETE_MSG from '@salesforce/label/c.th_TrailheadShareIncompleteMsg';
/** The message to share for completed trailhead items */
import TRAILHEAD_SHARE_COMPLETE_MSG from '@salesforce/label/c.th_TrailheadShareCompleteMsg';




/** @type {string} - indicates that the overlay should close */
const EVENT_CLOSE_REQUEST = 'closerequest';

/** @type {string} - wildcard to apply to the search to support any position. */
const WILDCARD = '%';


/**
 * Represents the form to 'Share' the trailheadAssignment suggestion.
 * @component th_trailhead-assignment_entry-share or th_trailheadAssignment_entryShare
 */
export default class th_trailheadAssignment_entryShare extends LightningElement {

  /** @type {AssignmentEntry} - The trailhead assignment entry **/
  @api trailheadEntry;

  /** @type {AssignmentEntry} - the Trailhead entry */
  @api myTrailheadEntry;

  /** @type {Timeout} - timeout used for running the search */
  @track delayTimeout;

  /** @type {boolean} - Whether the spinning 'is searching' indicator should be shown (true) or not (false) **/
  @track isCurrentlySearching;

  /** @type {string} - Represents the string to search by to find the user to @mention */
  @track targetUserSearch;

  /** @type {KeyValue[]} - Collection of possible search results in user key value pairs **/
  @track targetUserOptions;

  /** @type {string} - Id of the user that we will use to @mention the user. **/
  @track targetUserId;

  /** @type {sobject} - User object of the user to @mention */
  @track targetUserOption;

  /** @type {string} - Message to send in the chatter post */
  @track message;

  //-- getter / setters

  /**
   * Determines whether a user has been selected and the message can proceed
   * @returns {boolean}
   **/
  @api
  get isUserSelected(){
    return this.targetUserOption !== null;
  }

  /**
   * Whether there are any user options (true) or an empty list (false)
   * @returns {boolean}
   **/
  @api
  get userOptionsAvailable(){
    return this.targetUserOptions && this.targetUserOptions.length > 0;
  }

  /**
   * Whether an assignmentEntry has been completed by the current person.
   * @returns {boolean} - whether the assignment has been completed by the current user (true) or not (false)
   */
  @api
  get isAssignmentCompleted(){
    //-- there are three statuses: Assigned, In Progress and Completed
    //-- assume completed ONLY if the Status is Completed
    if (!this.assignmentEntry){
      return false;
    }
    let status = this.assignmentEntry.Status;
    let result = false;
    if (status === 'Completed'){
      result = true;
    }
    return result;
  }

  /**
   * Determine the default message
   * @returns {string}
   */
  @api
  get defaultMessage(){
    let result = TRAILHEAD_SHARE_INCOMPLETE_MSG;
    if (this.isAssignmentCompleted){
      result = TRAILHEAD_SHARE_COMPLETE_MSG;
    }
    return result;
  }

  //-- methods

  /** initialize the component */
  connectedCallback(){
    this.resetForm();
    this.message = '' + this.defaultMessage;
  }

  /**
   * Clears the user search
   */
  resetForm(){
    this.targetUserSearch = '';
    this.targetUserOptions = [];
    this.targetUserId = null;
    this.targetUserOption = null;
    this.message = '';
    this.isCurrentlySearching = false;
  }


  
  //-- private methods

  /**
   * Selects a user from the list of target users
   * @param targetUserId {string} - id of the target user
   * @return {object} - the target user label value pair
   * @private
   */
  selectTargetUserById(targetUserId){
    this.targetUserOption = this.targetUserOptions.find((targetUserOption) => {
      return targetUserOption && targetUserOption.value === targetUserId;
    });

    if (this.targetUserOption){
      this.targetUserSearch = this.targetUserOption.label;
      this.targetUserId = this.targetUserOption.value;
      this.targetUserOptions = [];
    } else {
      this.resetForm();
    }
  }

  /**
   * Clears the current user selection
   * @private
   */
  clearUserSelection(){
    this.targetUserOption = null;
  }

  /**
   * Performs the search on a user.
   * @param {string} userSearch - the string to use in the search for users.
   * @private
   */
  searchUsers (userSearchStr) {
    // console.log('user search is getting performed with:' + userSearchStr);
    
    if (!userSearchStr){
      this.resetForm();
    } else if (userSearchStr.length < MIN_SEARCH_THRESHOLD){
      return;
    }

    //-- we restart the search
    this.clearUserSelection();
    this.isCurrentlySearching = true;
    
    let userSearchWild = WILDCARD + userSearchStr + WILDCARD;

    shareUtilFindMatchingUsers( {userSearch:userSearchWild} )
      .then(data => {
        this.isCurrentlySearching = false;
        this.targetUserOptions = data;
        this.targetUserId = null;
        
        if (data){
          if (typeof data.length !== 'undefined'){
            if (data.length === 1){
              this.selectTargetUserById(data[0].value);
            }
          }
        }
      })
      .catch(error => {
        this.isCurrentlySearching = false;
        // eslint-disable-next-line no-console
        console.error('error occurred searchUsers:jsImportedApexMethodName', JSON.stringify(error));
        this.error = error;
      });
  }

  //-- handlers

  /**
   * handle when the ok button is pressed
   * @private
   */
  onOkButtonClick(){
    let inputMessage = this.template.querySelector('.input-message');

    if (!inputMessage || !inputMessage.checkValidity() || !this.targetUserId || !this.trailheadEntry){
      return;
    }

    shareUtilMentionTrailheadToUser(
      {
        targetUserId:this.targetUserId,
        trailheadURL: this.trailheadEntry.URL,
        message: inputMessage.value
      }
    )
      .then(isSuccessful => {
        this.requestPopupClose(false);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('error occurred jsMethodName:jsImportedApexMethodName', JSON.stringify(error));
      });
  }

  /**
   * Handles when the cancel / close button is clicked
   * @private
   */
  onCloseButtonClick(){
    this.requestPopupClose(false);
  }

  /**
   * Requests that the popup be closed
   * @param {boolean} shouldRefresh - whether the list should be refreshed after closing.
   * @private
   */
  requestPopupClose(shouldRefresh){

    shouldRefresh = (shouldRefresh)?true:false;

    const eventClose = new CustomEvent(EVENT_CLOSE_REQUEST, {
      detail: {
        shouldRefresh: shouldRefresh
      }
    });
    this.dispatchEvent(eventClose);
  }

  /**
   * Handles when the user presses the key up in the user search box.
   * @private
   */
  handleSearchKeyUp(evt){
    /*
    const isEnterKey = evt.keyCode === KEY_ENTER;
    if (isEnterKey) {
      let searchVal = evt.target.value;
      this.searchUsers(searchVal);
    }
    */

    window.clearTimeout(this.delayTimeout);
    const searchValue = evt.target.value;
    
    //-- perfom a search similar to the lwc-recipes
    //-- https://github.com/trailheadapps/lwc-recipes/blob/master/force-app/main/default/lwc/compositionContactSearch/compositionContactSearch.js

    //-- this disable line is needed to support the setTimeout
    // eslint-disable-next-line @lwc/lwc/no-async-operation

    this.delayTimeout = setTimeout(() => { // eslint-disable-line
      this.searchUsers(searchValue);
    }, INPUT_SEARCH_DELAY);
  }

  /**
   * Handles when the target user is selected
   * @private
   */
  handleTargetUserChanged(evt){
    this.selectTargetUserById(evt.target.value);
  }
}