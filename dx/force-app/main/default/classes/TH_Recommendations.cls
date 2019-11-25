/**
 * Class to get trailhead recommendations based for the current user
 */
global class TH_Recommendations {

    /**
     * Determines the recommended entries for a given record
     * @param recordId (Id) - id of the record we want to find recommendations for.
     * @returns TH_Assignments.TrailheadEntry[] - list of trialhead entries
     */
    @AuraEnabled(cacheable=false)
    public static TH_Assignments.TrailheadEntry[] getRecommendedEntries(Id recordId) {
        system.debug('** recordId **');
        system.debug(recordId);

        /** Final list of all the trialhead entries we will return */
        TH_Assignments.TrailheadEntry[] results = new TH_Assignments.TrailheadEntry[]{};

        /** current user id */
        Id userId = UserInfo.getUserId();

        /** collection of ids for all the badges to recommend */
        Set<Id> Badges = new Set<Id>();
        /** collection of ids for all the trailmixes to recommend */
        Set<Id> Trailmixes = new Set<Id>();

        /** collection of recommendations */
        TH_Recommendation__c [] recommendations;

        //-- determine all the recommendations
        if(recordId <> null){
            String sObjName = recordId.getSObjectType().getDescribe().getName();
            recommendations = [Select Id, Badge__c, Trailmix__c, OwnerId From TH_Recommendation__c Where OwnerId=:userId And 
                    ((Object_API_Name__c =:sObjName And Record_Id__c ='') Or (Record_Id__c =:recordId))];
        } else {
            recommendations = [Select Id, Badge__c, Trailmix__c, OwnerId From TH_Recommendation__c Where OwnerId=:userId];
        }
        // system.debug('** TH_Recommendation__c **');
        // system.debug(recommendations);

        //-- determine the ids of all the badges and trailmixes to be recommended
        for(TH_Recommendation__c thr : recommendations){
            if(thr.Badge__c <> null) Badges.add(thr.Badge__c);
            if(thr.Trailmix__c <> null) Trailmixes.add(thr.Trailmix__c);
        }

        // system.debug('** Badges & Trailmixes **');
        // system.debug(Badges);
        // system.debug(Trailmixes);

        /** Final list of all the trialhead entries we will return */
        results = TH_Assignments.determineEntriesByTrailheadId(badges, trailmixes, userId);

        return results;
    }
}