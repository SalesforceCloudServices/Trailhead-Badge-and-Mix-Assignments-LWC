({
  /**
   * Handles when the component is initialized
   */
  init : function(component, event, helper) { // eslint-disable-line no-unused-vars
    // helper.log('overlayAddAssignWrapContainer initialized');
    helper.initializeComponent(component, helper);
  },

  /**
   * Handles a request to close the overlay.
   */
  handleCloseRequest : function(component, event, helper){
    helper.closeOverlay(component, event, helper);
  }
});