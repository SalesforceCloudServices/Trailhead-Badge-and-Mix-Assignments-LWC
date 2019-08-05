import { LightningElement, track, api } from 'lwc'; // eslint-disable-line no-unused-vars

import shareUtilFindMatchingUsers from '@salesforce/apex/TH_ShareUtil.findMatchingUsers';

/** Represents the enter key */
const KEY_ENTER = 13;

/** Represents the timeout to provide for waiting for input prior to doing the search */
const DELAY = 600;

/** wildcard to apply to the search */
const WILDCARD = '%';

/**
 * Lightning Component that represents the share popup.
 * @component <c:th_overlay-share> or <th_overlay-share>
 */
export default class th_overlayShare extends LightningElement {

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

  /** initialize the component */
  connectedCallback(){
    this.clearUserSearch();
  }

  /** handle when the ok button is pressed */
  onOkButtonClick(){
    console.log('okay button was clicked');
  }

  /**
   * Handles when the cancel / close button is clicked
   */
  onCloseButtonClick(){
    console.log('close button was clicked');
  }

  /**
   * Handles when the user presses the key up in the user search box.
   */
  handleSearchKeyUp(evt){
    console.log('key up');
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
    }, DELAY);
  }

  /**
   * Handles when the user search is no longer the focus.
   */
  handleSearchBlur(evt){
    console.log('search blur');
    const searchVal = evt.target.value;
    this.searchUsers(searchVal);
  }

  /**
   * Performs the search on a user.
   * @param {string} userSearch - the string to use in the search for users.
   */
  searchUsers (userSearchStr) {
    console.log('user search is getting performed with:' + userSearchStr);
    
    if (!userSearchStr){
      this.clearUserSearch();
    } else if (userSearchStr.length < 3){
      return;
    }
    
    let userSearchWild = WILDCARD + userSearchStr + WILDCARD;

    shareUtilFindMatchingUsers( {userSearch:userSearchWild} )
      .then(data => {
        //-- @TODO: handle data
        console.log('got a list of results');
        this.targetUserOptions = data;
        
        if (data){
          if (typeof data.length !== 'undefined'){
            if (data.length === 1){
              this.targetUserId = data[0].value;
              this.targetUserSearch = data[0].label;
              this.targetUserOption = data[0];
            }
          }
        }
      })
      .catch(error => {
        //-- @TODO: handle error
        console.error('error occurred searchUsers:jsImportedApexMethodName', JSON.stringify(error));
        this.error = error;
      })
  }

  /**
   * Clears the user search
   */
  clearUserSearch(){
    this.targetUserSearch = '';
    this.targetUserOptions = [];
    this.targetUserId = null;
    this.targetUserOption = null;
  }

  /**
   * Handles when the target user is selected
   */
  handleTargetUserChanged(evt){
    console.log('user selected the target user');

    this.targetUserOption = this.targetUserOptions.find((targetUserOption) => {
      return targetUserOption && targetUserOption.value === evt.target.value;
    });

    if (this.targetUserOption){
      this.targetUserSearch = this.targetUserOption.label;
      this.targetUserId = this.targetUserOption.value;
    }
  }
}