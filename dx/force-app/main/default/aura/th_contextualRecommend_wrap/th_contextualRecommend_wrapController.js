({
  handleAddAssignmentRequest: function(component, event, helper){
    helper.log('add assignment was requested');
  },

  handleShareTrailheadRequest: function(component, event, helper){
    helper.log('shareTrailhead was requested');
    helper.handleShareTrailheadRequest(component, event, helper);
  }
});