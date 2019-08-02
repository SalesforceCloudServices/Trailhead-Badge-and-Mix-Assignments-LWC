global class TH_Recommendations {

    /** represents a completed trailhead assignment status */
    public static final String ASSIGNMENT_STATUS_COMPLETED = 'Completed';

    /** represents an undefined status */
    public static final String ASSIGNMENT_STATUS_UNDEFINED = '';

    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    //-- Class to get trailhead recommendations based for the current user
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    @AuraEnabled(cacheable=false)
    public static TH_Assignments.TrailheadEntry[] getRecommendedEntries(Id recordId) {
        system.debug('** recordId **');
        system.debug(recordId);
        /** Final list of all the trialhead entries we will return */
        TH_Assignments.TrailheadEntry[] results = new TH_Assignments.TrailheadEntry[]{};
        /** collection of recommendations */
        TH_Recommendation__c [] recommendations;
        /** current user id */
        Id userId = UserInfo.getUserId();

        /** collection of ids for all the badges to recommend */
        Set<Id> Badges = new Set<Id>();
        /** collection of ids for all the trailmixes to recommend */
        Set<Id> Trailmixes = new Set<Id>();

        /** collection of badges we will recommend that the user has an assignment to */
        Map<Id,trailheadapp__User_Badge__c> badgeAssignmentMap = new Map<Id,trailheadapp__User_Badge__c>();
        /** collection of trailmixes we will recommend that the user has an assignment to */
        Map<Id,trailheadapp__User_Trailmix__c> trailmixAssignmentMap = new Map<Id,trailheadapp__User_Trailmix__c>();

        //-- determine all the recommendations

        if(recordId <> null){
            String sObjName = recordId.getSObjectType().getDescribe().getName();
            recommendations = [Select Id, Badge__c, Trailmix__c, OwnerId From TH_Recommendation__c Where OwnerId=:userId And 
                    ((Object_API_Name__c =:sObjName And Record_Id__c ='') Or (Record_Id__c =:recordId))];
        } else {
            recommendations = [Select Id, Badge__c, Trailmix__c, OwnerId From TH_Recommendation__c Where OwnerId=:userId];
        }
        system.debug('** TH_Recommendation__c **');
        system.debug(recommendations);

        //-- determine the ids of all the badges and trailmixes to be recommended

        for(TH_Recommendation__c thr : recommendations){
            if(thr.Badge__c <> null) Badges.add(thr.Badge__c);
            if(thr.Trailmix__c <> null) Trailmixes.add(thr.Trailmix__c);
        }

        system.debug('** Badges & Trailmixes **');
        system.debug(Badges);
        system.debug(Trailmixes);

        //-- determine if there are any user assignments for those badges and trailmixes
        
        //-- @TODO: replace ub with uBadge, ut with uTrail, etc.
        trailheadapp__User_Badge__c [] uBadges;
        trailheadapp__User_Badge__c uBadge;
        trailheadapp__User_Trailmix__c [] uTrails;     
        trailheadapp__User_Trailmix__c uTrail;
        if (Badges.size() > 0){
            uBadges = [
                Select Id, trailheadapp__Due_Date__c, trailheadapp__Status__c, trailheadapp__Badge__c 
                From trailheadapp__User_Badge__c 
                Where trailheadapp__User__c =:userId and trailheadapp__Badge__c in :Badges
            ];
            for (trailheadapp__User_Badge__c ub : uBadges ){
                if (ub.trailheadapp__Status__c == ASSIGNMENT_STATUS_COMPLETED){
                    Badges.remove(ub.trailheadapp__Badge__c);
                } else {
                    //-- it isn't completed but there is still an assignment
                    badgeAssignmentMap.put(ub.trailheadapp__Badge__c, ub);
                }
            }
        }
        if (Trailmixes.size() > 0){
            uTrails = [
                Select Id, trailheadapp__Due_At__c, trailheadapp__Status__c, trailheadapp__Trailmix__c
                From trailheadapp__User_Trailmix__c 
                Where trailheadapp__User__c =:userId and trailheadapp__Trailmix__c in :Trailmixes
            ];
            for (trailheadapp__User_Trailmix__c ut : uTrails ){
                if (ut.trailheadapp__Status__c == ASSIGNMENT_STATUS_COMPLETED){
                    Trailmixes.remove(ut.trailheadapp__Trailmix__c);
                } else {
                    //-- it isn't completed but there is still an assignment
                    trailmixAssignmentMap.put(ut.trailheadapp__Trailmix__c, ut);
                }
            }
        }
        system.debug('** Badges & Trailmixes **');
        system.debug(Badges);
        system.debug(Trailmixes);

        //-- determine the underlying badges
        
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
        
        //-- generate the entries
        
        if(thBadges != null){
            for (trailheadapp__Badge__c b : thBadges){
                DateTime dueDate = null;
                String assignmentStatus = ASSIGNMENT_STATUS_UNDEFINED;

                if (badgeAssignmentMap.containsKey(b.Id)){
                    uBadge = badgeAssignmentMap.get(b.Id);
                    dueDate = uBadge.trailheadapp__Due_Date__c;
                    assignmentStatus = uBadge.trailheadapp__Status__c;
                }
                //-- badgeTrailmixAssignmentMap
                TH_Assignments.TrailheadEntry newEntry = new TH_Assignments.TrailheadEntry(
                    (String)b.Id,
                    b.Name,
                    assignmentStatus,
                    dueDate,
                    b.trailheadapp__URL__c,
                    b.trailheadapp__Icon__c,
                    Label.th_TrailheadTypeBadge
                );
                results.add(newEntry);
            }
        }
        if(thTrails != null){
            for (trailheadapp__Trailmix__c t : thTrails){
                DateTime dueDate = null;
                String assignmentStatus = ASSIGNMENT_STATUS_UNDEFINED;

                if (trailmixAssignmentMap.containsKey(t.Id)){
                    uTrail = trailmixAssignmentMap.get(t.Id);
                    dueDate = uTrail.trailheadapp__Due_At__c;
                    assignmentStatus = uBadge.trailheadapp__Status__c;
                }

                TH_Assignments.TrailheadEntry newEntry = new TH_Assignments.TrailheadEntry(
                    (String)t.Id,
                    t.Name,
                    assignmentStatus,
                    dueDate,
                    t.trailheadapp__URL__c,
                    null,
                    Label.th_TrailheadTypeTrailmix
                );
                results.add(newEntry);
            }
        }

        //-- return the results

        return results;
    }
}