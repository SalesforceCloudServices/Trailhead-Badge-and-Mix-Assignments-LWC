/*global $A */

/** {require('../../lwc/th_trailheadAssignments/__types__/CustomTypes')} **/

({
  /**
   * Initialize the component
   **/
  initializeComponent : function(component, helper) {
    helper.noop();
  },

  /**
   * Handles when a user requests adding a trailhead assignment
   */
  handleShareTrailheadRequest : function(component, event, helper){
    var modalBody;
    var overlayLib = component.find('contextualRecommendOverlayLib');

    var recordId = null;
    var assignmentEntry = null;
    var entryName = null;
    var message = '';
    /** @type {EventShareTrailheadDetail} */
    var eventParams = event.getParams();

    if (eventParams){
      recordId = eventParams.entryId;
      entryName = eventParams.entryName;
      assignmentEntry = JSON.parse(JSON.stringify(eventParams.entry));
      message = eventParams.message;
    }

    $A.createComponent('c:th_overlayShare_wrap',
      {
        recordId: recordId,
        assignmentEntry: assignmentEntry,
        defaultShareMessage: message
      },
      function(content, status){
        if (status === 'SUCCESS'){
          modalBody = content;
          overlayLib.showCustomModal({
            header: 'Share: ' + entryName,
            body: modalBody,
            showCloseButton: true,
            closeCallback: function(){
              console.log('you closed the add assignment modal. captured from wrapper.'); // eslint-disable-line no-console
            }
          });
        }
      }
    );
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