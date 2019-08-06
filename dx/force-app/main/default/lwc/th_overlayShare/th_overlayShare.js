import { LightningElement, track, api } from 'lwc'; // eslint-disable-line no-unused-vars

/** apex method to find the users */
import shareUtilFindMatchingUsers from '@salesforce/apex/TH_ShareUtil.findMatchingUsers';

/** apex method to share a chatter post */
import shareUtilMentionTrailheadToUser from '@salesforce/apex/TH_ShareUtil.mentionTrailheadToUser';

/** Minimum characters to enter before doing a search */
import shareUtilMinCharSearchThreshold from '@salesforce/label/c.th_TrailheadMinCharSearchThreshold';

/** Represents the timeout to provide for waiting for input prior to doing the search */
import shareUtilInputSearchDelay from '@salesforce/label/c.th_TrailheadInputSearchDelay';

const MIN_SEARCH_THRESHOLD = Number.parseInt(shareUtilMinCharSearchThreshold, 10);
const INPUT_SEARCH_DELAY = Number.parseInt(shareUtilInputSearchDelay, 10);

/** indicates that the overlay should close */
const EVENT_CLOSE_REQUEST = 'closerequest';

/** Represents the enter key */
const KEY_ENTER = 13; // eslint-disable-line no-unused-vars

/** wildcard to apply to the search */
const WILDCARD = '%';

/**
 * Lightning Component that represents the share popup.
 * @component <c:th_overlay-share> or <th_overlay-share>
 */
export default class th_overlayShare extends LightningElement {

  /** the trailhead assignment entry */
  @api trailheadEntry;

  /** The default message to use when sharing the assignment entry */
  @api defaultMessage;

  /** timeout used for running the search */
  @track delayTimeout;

  /**
   * Represents the string to search by to find the user to @mention
   * @type {string}
   */
  @track targetUserSearch;

  /**
   * Collection of possible search results in user key value pairs 
   * @type {KeyValue[]}
   */
  @track targetUserOptions;

  /**
   * Id of the user that we will use to @mention the user.
   * @type {string}
   */
  @track targetUserId;

  /**
   * User object of the user to @mention
   * @type {sobject}
   */
  @track targetUserOption;

  /**
   * Message to send in the chatter post
   * @type {string}
   */
  @track message;

  //-- getter / setters

  /**
   * Determines whether a user has been selected and the message can proceed
   */
  @api
  get isUserSelected(){
    return this.targetUserOption !== null;
  }

  /** Whether there are any user options (true) or an empty list (false) */
  @api
  get userOptionsAvailable(){
    return this.targetUserOptions && this.targetUserOptions.length > 0;
  }

  /** initialize the component */
  connectedCallback(){
    this.clearUserSearch();
    this.message = '' + this.defaultMessage;
  }

  /**
   * Clears the user search
   */
  clearUserSearch(){
    this.targetUserSearch = '';
    this.targetUserOptions = [];
    this.targetUserId = null;
    this.targetUserOption = null;
    this.message = '';
  }

  /**
   * Clears the current user selection
   */
  clearUserSelection(){
    this.targetUserOption = null;
  }

  /**
   * Performs the search on a user.
   * @param {string} userSearch - the string to use in the search for users.
   */
  searchUsers (userSearchStr) {
    // console.log('user search is getting performed with:' + userSearchStr);
    
    if (!userSearchStr){
      this.clearUserSearch();
    } else if (userSearchStr.length < MIN_SEARCH_THRESHOLD){
      return;
    }

    //-- we restart the search
    this.clearUserSelection();
    
    let userSearchWild = WILDCARD + userSearchStr + WILDCARD;

    shareUtilFindMatchingUsers( {userSearch:userSearchWild} )
      .then(data => {
        this.targetUserOptions = data;
        
        if (data){
          if (typeof data.length !== 'undefined'){
            if (data.length === 1){
              this.selectTargetUserById(data[0].value);
            }
          }
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('error occurred searchUsers:jsImportedApexMethodName', JSON.stringify(error));
        this.error = error;
      });
  }

  //-- handlers

  /** handle when the ok button is pressed */
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
   */
  onCloseButtonClick(){
    this.requestPopupClose(false);
  }

  /**
   * Requests that the popup be closed
   * @param {boolean} shouldRefresh - whether the list should be refreshed after closing.
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
   */
  handleTargetUserChanged(evt){
    this.selectTargetUserById(evt.target.value);
  }
  
  //-- private methods

  /**
   * Selects a user from the list of target users
   * @param targetUserId {string} - id of the target user
   * @return {object} - the target user label value pair
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
      this.clearUserSearch();
    }
  }
}