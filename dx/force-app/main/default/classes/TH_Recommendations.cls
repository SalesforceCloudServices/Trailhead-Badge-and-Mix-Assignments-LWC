global class TH_Recommendations {
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    //-- Class to get trailhead recommendations based for the current user
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    @AuraEnabled(cacheable=true)
    public static TH_Assignments.TrailheadEntry[] getRecommendedEntries(Id recordId) {
        system.debug('** recordId **');
        system.debug(recordId);
        TH_Assignments.TrailheadEntry[] results = new TH_Assignments.TrailheadEntry[]{};
        TH_Recommendation__c [] recomdendations;
        Id userId = UserInfo.getUserId();

        if(recordId <> null){
            String sObjName = recordId.getSObjectType().getDescribe().getName();
            recomdendations = [Select Id, Badge__c, Trailmix__c, OwnerId From TH_Recommendation__c Where OwnerId=:userId And Object_API_Name__c =:sObjName];
        } else {
            recomdendations = [Select Id, Badge__c, Trailmix__c, OwnerId From TH_Recommendation__c Where OwnerId=:userId];
        }
        system.debug('** TH_Recommendation__c **');
        system.debug(recomdendations);

        Set<Id> Badges = new Set<Id>();
        Set<Id> Trailmixes = new Set<Id>();
        for(TH_Recommendation__c thr : recomdendations){
            if(thr.Badge__c <> null) Badges.add(thr.Badge__c);
            if(thr.Trailmix__c <> null) Badges.add(thr.Trailmix__c);
        }
        system.debug('** Badges & Trailmixes **');
        system.debug(Badges);
        system.debug(Trailmixes);
        
        trailheadapp__User_Badge__c [] uBadges;
        trailheadapp__User_Trailmix__c [] uTrails;     
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
        return results;

    }
}
