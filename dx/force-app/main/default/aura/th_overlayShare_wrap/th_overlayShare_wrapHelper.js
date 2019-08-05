/*global $A */
({
  /**
   * Initialize the component
   **/
  initializeComponent : function(component, helper) {
    helper.noop();
  },
  
  /**
   * performs a server side call
   * @param exampleRecordId (Id)
   **/
  makeServerSideCallout : function(component, helper, recordId) {
    var action = component.get('c.methodToCall');
    action.setParams({ recordId: recordId });
    
    action.setCallback(this, function(response){
      var state = response.getState();
      if( state === 'SUCCESS' ){
        helper.error('action success');
        var results = response.getReturnValue();
        helper.log('results came back:');
        helper.log(results);
      } else {
        helper.error('Error occurred from Action');
        
        //-- https://developer.salesforce.com/blogs/2017/09/error-handling-best-practices-lightning-apex.html
        var errors = response.getError();
        helper.handleCallError(component, helper, state, errors);
      }
    });
    //-- optionally set storable, abortable, background flags here
    $A.enqueueAction(action);
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