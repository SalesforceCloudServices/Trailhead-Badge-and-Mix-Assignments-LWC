/**
 * Form for adding an assignment for an entry.
 * @component th_trailheadAssignment_entryAdd or th_trailhead-assignment_entry-add
 **/
import { LightningElement, api } from 'lwc';

/** indicates that the overlay should close */
const EVENT_CLOSE_REQUEST = 'closerequest';

export default class Th_trailheadAssignment_entryAdd extends LightningElement {
  /** 
   * The trailhead assignment entry
   * @type {AssignmentEntry}
   */
  @api trailheadEntry;

  /**
   * Handle when the close button is clicked
   */
  handleClose(){
    const eventClose = new CustomEvent(EVENT_CLOSE_REQUEST, {
      detail: {
        shouldRefresh: false
      }
    });
    this.dispatchEvent(eventClose);
  }
}