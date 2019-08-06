/*global $A */
({
  /**
   * Initialize the component
   **/
  initializeComponent : function(component, helper) {
    helper.noop();
  },
  
  closeOverlay : function(component, event, helper){
    console.log('close overlay requested');

    var shouldRefresh = event.getParam('shouldRefresh') === true;
    if (shouldRefresh){
      $A.get('e.force:refreshView').fire();
    }
    
    var overlayLib = component.find('shareContainerOverlayLib');
    overlayLib.notifyClose();
  },
  
  /**
   * Displays an error
   * @param errorTitle (String)
   * @param errorMsg (String)
   **/
  displayError: function(errorType, errorCode){
    var errorTitle = errorType?errorType:'Error';
    var errorMsg = 'An error occurred: ' + errorCode + '. Please contact your System Administrator';
    
    //-- send a toast message
    var resultsToast = $A.get('e.force:showToast');
    resultsToast.setParams({
      'title': errorTitle,
      'message': errorMsg
    });
    resultsToast.fire();
  },
  
  log : function(msg){console.log.apply(this, arguments);}, // eslint-disable-line
  warn : function(msg){console.warn.apply(this, arguments);}, // eslint-disable-line
  error : function(msg){console.error.apply(this, arguments);}, // eslint-disable-line
  noop : function(){}
});