import { LightningElement, track, api } from 'lwc'; // eslint-disable-line no-unused-vars

export default class th_overlayShare extends LightningElement {

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
}