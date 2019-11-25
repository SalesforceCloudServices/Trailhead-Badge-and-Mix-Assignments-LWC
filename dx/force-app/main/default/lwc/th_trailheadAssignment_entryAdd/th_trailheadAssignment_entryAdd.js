//-- include custom javascript types for tooltip / vscode intellisense
// require('../th_trailheadAssignments/__types__/CustomTypes')

import { LightningElement, api, track } from 'lwc'; // eslint-disable-line no-unused-vars

//-- import the apex methods
import apexAddTrailheadModuleAssignment from '@salesforce/apex/TH_Assignments.addTrailheadModuleAssignment';
import apexAddTrailmixAssignment from '@salesforce/apex/TH_Assignments.addTrailmixAssignment';

/** type of trailhead entries */
import ENTRY_TYPE_BADGE from '@salesforce/label/c.th_TrailheadTypeBadge';

/** The TrailMix entry type */
import ENTRY_TYPE_TRAILMIX from '@salesforce/label/c.th_TrailheadTypeTrailmix';



/** indicates that the overlay should close */
const EVENT_CLOSE_REQUEST = 'closerequest';



/**
 * Form for adding an assignment for an entry.
 * @component th_trailheadAssignment_entryAdd or th_trailhead-assignment_entry-add
 **/
export default class Th_trailheadAssignment_entryAdd extends LightningElement {

  /** @type {AssignmentEntry} - The trailhead assignment entry */
  @api trailheadEntry;

  /** initialize the component */
  connectedCallback(){
    this.resetForm();
  }

  /** clears the form */
  resetForm(){
    // const dateInput = this.template.querySelector('.input-dueDate');
    // dateInput.value = null;
  }



  //-- private methods

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



  //-- handlers

  /**
   * handle whent he ok button is pressed
   * @private
   */
  onOkButtonClick(){
    const dateInput = this.template.querySelector('.input-dueDate');
    let dueDate = dateInput.value;

    //-- do any validation
    if (!dueDate){
      dueDate = null;
    }

    if (!this.trailheadEntry){
      // eslint-disable-next-line no-console
      console.error('Unknown Trailhead Entry:null'); // eslint-disable-line no-console
      return;
    }

    //-- destruct from the trailheadEntry
    //-- @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const {
      EntryType:entryType,
      Id:entryId,
      Name:entryName
    } = this.trailheadEntry;

    if (entryType === ENTRY_TYPE_BADGE){
      // console.log('add badge assignment');
      apexAddTrailheadModuleAssignment(
        {
          moduleId:entryId,
          dueDate:dueDate,
          userId:null
        }
      )
        .then(data => {
          this.requestPopupClose(true);
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('error occurred while adding module:' + entryName, JSON.stringify(error));
          this.error = error;
        });
    } else if (entryType === ENTRY_TYPE_TRAILMIX){
      // console.log('add trailmix assignent');
      apexAddTrailmixAssignment(
        {
          trailmixId:entryId,
          dueDate:dueDate,
          userId:null
        }
      )
        .then(data => {
          // console.log('successfully added assignment');
          this.requestPopupClose(true);
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('error occurred while adding module:' + entryName, JSON.stringify(error));
          this.error = error;
        });
    } else {
      // eslint-disable-next-line no-console
      console.error('unknown entry type');
    }
  }

  /**
   * handle when the cancel button is pressed
   * @private
   */
  onCloseButtonClick(){
    this.requestPopupClose(false);
  }
}