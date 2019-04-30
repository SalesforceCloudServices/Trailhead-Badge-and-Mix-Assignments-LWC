global class TH_Contextual_Badge_Recommend {
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    //-- Class to find contextual badge recommendations based on Record Id, Current User, and Custom Settings  
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    
    @AuraEnabled(cacheable=true)
    public static TH_Assignments.TrailheadEntry[] getRecommendedEntries(Id recordId) {
    	TH_Assignments.TrailheadEntry[] results = new TH_Assignments.TrailheadEntry[]{};
            
        // Step 1: Check for Custom Settings Records
        String sObjName = recordId.getSObjectType().getDescribe().getName();
        TH_Context_Badge_Recommend__c [] contextBadges = getCBs(sObjName);

        if (contextBadges.size() > 0){
            // Step 2: Query Record for fields in the metadata type records
            sObject obj = getRecord(recordId, sObjName, contextBadges);            
            system.debug('** obj **');
            system.debug(obj);
            
            // Step 3: Check field values and seperate out Badges and Trailmixes
            Set<Id> Badges = new Set<Id>();
            Set<Id> Trailmixes = new Set<Id>();
            for(TH_Context_Badge_Recommend__c cb : contextBadges){
                boolean addBadge = false;

                 if(cb.Object_API_Name__c != 'OpportunityLineItem'){
                    if(cb.Field_Value__c == obj.get(cb.Field_API_Name__c)) addBadge= True;
                } else {
                    for(OpportunityLineItem oli : obj.getSObjects('OpportunityLineItems')){
                        system.debug('** oli **');
                        system.debug(oli);
                        if(cb.Field_API_Name__c.startsWith('Product2')){
                            if(cb.Field_Value__c == oli.Product2.get(cb.Field_API_Name__c.substring(9))) addBadge= True;
                        } else if(cb.Field_Value__c == oli.get(cb.Field_API_Name__c)) addBadge= True; 
                    } 
                }
                if(addBadge){
                    Id myId = Id.valueOf(cb.Badge_Id__c);
                    if(myId.getSObjectType().getDescribe().getName() == 'trailheadapp__Badge__c' ){
                        Badges.add(myId);
                    } else If(myId.getSObjectType().getDescribe().getName() == 'trailheadapp__Trailmix__c' ) {
                        Trailmixes.add(myId);
                    }
                }
            }
            system.debug('** Badges & Trailmixes **');
            system.debug(Badges);
            system.debug(Trailmixes);
            
            // Step 4: Check for badge or trailmix completion
            trailheadapp__User_Badge__c [] uBadges;
            trailheadapp__User_Trailmix__c [] uTrails;
            Id userId = UserInfo.getUserId();
            if (Badges.size() > 0){
                uBadges = [Select Id, trailheadapp__Due_Date__c, trailheadapp__Status__c, trailheadapp__Badge__c 
                                                         From trailheadapp__User_Badge__c 
                                                         Where trailheadapp__User__c =:userId and trailheadapp__Badge__c in :Badges];
                for (trailheadapp__User_Badge__c ub : uBadges ){
                    if (ub.trailheadapp__Status__c == 'Completed') Badges.remove(ub.trailheadapp__Badge__c);
                }
            }
            if (Trailmixes.size() > 0){
                uTrails = [Select Id, trailheadapp__Due_At__c, trailheadapp__Status__c, trailheadapp__Trailmix__c
                                                         From trailheadapp__User_Trailmix__c 
                                                         Where trailheadapp__User__c =:userId and trailheadapp__Trailmix__c in :Trailmixes];
                for (trailheadapp__User_Trailmix__c ut : uTrails ){
                    if (ut.trailheadapp__Status__c == 'Completed') Trailmixes.remove(ut.trailheadapp__Trailmix__c);
                }
            }
            system.debug('** Badges & Trailmixes **');
            system.debug(Badges);
            system.debug(Trailmixes);
            
            // Step 5: Get Badges and Trailmixes Records
            trailheadapp__Badge__c [] thBadges;
            trailheadapp__Trailmix__c [] thTrails;
            if (Badges.size() > 0){
                thBadges = [Select Id, Name,trailheadapp__Icon__c, trailheadapp__URL__c From trailheadapp__Badge__c Where Id in :Badges];
            }
            if(Trailmixes.size() > 0){
                thTrails = [Select Id, Name,trailheadapp__URL__c From trailheadapp__Trailmix__c Where Id in :Trailmixes];
            }
            system.debug('** thBadges & thTrails **');
            system.debug(thBadges);
            system.debug(thTrails);
            
            // Step 6: Create Trailhead Entries
            if(thBadges != null){
                for (trailheadapp__Badge__c b : thBadges){
                    DateTime dueDate;
                    for(trailheadapp__User_Badge__c ub: uBadges) if (ub.trailheadapp__Badge__c == b.Id) dueDate= ub.trailheadapp__Due_Date__c;
                    TH_Assignments.TrailheadEntry newEntry = new TH_Assignments.TrailheadEntry((String)b.Id,b.Name,'',dueDate,b.trailheadapp__URL__c,b.trailheadapp__Icon__c,Label.th_TrailheadTypeBadge);
                    results.add(newEntry);
                }
            }
            if(thTrails != null){
                for (trailheadapp__Trailmix__c t : thTrails){
                    DateTime dueDate;
                    for(trailheadapp__User_Trailmix__c ut: uTrails) if (ut.trailheadapp__Trailmix__c == t.Id) dueDate= ut.trailheadapp__Due_At__c;
                    TH_Assignments.TrailheadEntry newEntry = new TH_Assignments.TrailheadEntry((String)t.Id,t.Name,'',dueDate,t.trailheadapp__URL__c,null,Label.th_TrailheadTypeTrailmix);
                    results.add(newEntry);
                }
            }
        }
        
        // Step 7: Send the entries back
        system.debug('** results **');
        system.debug(results);
        return results;
    }

    // Gets the MDT records for an object
    // Special case for Opportunity only, get child OpportunityLineItem Records
    public static TH_Context_Badge_Recommend__c [] getCBs(String sObj){
        TH_Context_Badge_Recommend__c [] contextBadges;
        if(sObj == 'Opportunity'){
            contextBadges = [Select Object_API_Name__c,Field_API_Name__c, Field_Value__c, Badge_Id__c 
            From TH_Context_Badge_Recommend__c Where Object_API_Name__c =: sObj Or Object_API_Name__c = 'OpportunityLineItem'];
        } else {
           contextBadges = [Select Object_API_Name__c, Field_API_Name__c, Field_Value__c, Badge_Id__c 
           From TH_Context_Badge_Recommend__c Where Object_API_Name__c =: sObj];
        }
        return contextBadges;
    }
    
    // Gets the fields for an object
    // Special case for Opportunity only, get child OpportunityLineItem Records
    public static sObject getRecord(Id recordId, String sObj, TH_Context_Badge_Recommend__c[] contextBadges){
        Set<String> fields_set = new Set<String>();
        Set<String> fields_set_OLI = new Set<String>();
        for(TH_Context_Badge_Recommend__c cb : contextBadges){
            if(cb.Object_API_Name__c == 'OpportunityLineItem'){
                fields_set_OLI.add(cb.Field_API_Name__c);
            } else {
                fields_set.add(cb.Field_API_Name__c);
            }
        } 
        string fields = string.join(new List<String>(fields_set), ',');
        if(sObj == 'Opportunity' && fields_set_OLI.size() > 0){
            string fields_OLI = string.join(new List<String>(fields_set_OLI), ',');
            return Database.query('Select Id,' + fields + ', ( Select Id, '+ fields_OLI + ' From OpportunityLineItems) From ' +  sObj + ' Where Id =\'' + recordId+'\'');
        } else {
            return Database.query('Select Id,' + fields + ' From ' +  sObj + ' Where Id =\'' + recordId+'\'');
        }
    }
}