global class TH_Assignments {
    
    
    //-- IGNORED OFFSET/PAGE SIZES for combined collated results.
    public static final Integer NO_OFFSET = 0;
    public static final Integer MAX_RESULTS = 255;

    public static final String DEFAULT_STATUS = 'Assigned';
    
    /** format for external ids */
    public static final String FORMAT_EXTERNAL_ID = '{0}-{1}';

    /** represents a completed trailhead assignment status */
    public static final String ASSIGNMENT_STATUS_COMPLETED = 'Completed';

    /** represents an undefined status */
    public static final String ASSIGNMENT_STATUS_UNDEFINED = '';
    
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    //-- internal result classes
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    
    
    
    /**
     * Internal class to return counts of the trailhead assignments for the current user.
     * <p>Used in pagination</p>
     **/
    global class AssignmentCounts {
        AssignmentCounts(){
            this.numBadgeAssignments = 0;
            this.numTrailmixAssignments = 0;
            this.totalAssignments = 0;
        }

        @AuraEnabled public Integer numBadgeAssignments;
        @AuraEnabled public Integer numTrailmixAssignments;
        @AuraEnabled public Integer totalAssignments;
    }
    
    /**
     * Internal class that represents a generalized Trailhead assignment - Badge or TrailMix.
     **/
    global class TrailheadEntry implements Comparable{
        /** Id of the user assignment **/
     	@AuraEnabled public String Id;
     	/** Name of the Badge or Trailmix **/
        @AuraEnabled public String Name;
        /** Status of the current assignment **/
        @AuraEnabled public String Status;
        /** Due Date for the assignment **/
        @AuraEnabled public DateTime DueDate;
        /** # Days until Due **/
        @AuraEnabled public Integer NumDaysUntilDue;
        /** URL of the Badge or Trailmix **/
        @AuraEnabled public String URL;
        /** Icon of the Badge or Trailmix **/
        @AuraEnabled public String Icon;
        /** Type of Entry (i.e. Badge or Trailmix) **/
        @AuraEnabled public String EntryType;
        
        /**
         * Generic constructor
         * @deprecated - used only for testing
         **/
        public TrailheadEntry (String i, String n, String s, DateTime d, String u, String c, String e ){
            Id = i;
            Name = n;
            Status = s;
            DueDate = d;
            URL = u;
			Icon = c;
            EntryType = e;
        }
        
        /**
         * Constructor consuming a Trailmix Assignment
         **/
        public TrailheadEntry(trailheadapp__User_Trailmix__c uT){
            this.Id = uT.Id;
            this.Name = uT.trailheadapp__Trailmix__r.Name;
            this.Status = uT.trailheadapp__Status__c;
            this.DueDate = uT.trailheadapp__Due_At__c;
            this.URL = uT.trailheadapp__Trailmix__r.trailheadapp__URL__c;
            this.Icon = Label.th_trailhead_trail_icon;
            this.EntryType = Label.th_TrailheadTypeTrailmix;
        }
        
        /**
         * Constructor consuming a Badge Assignment
         **/
        public TrailheadEntry(trailheadapp__User_Badge__c uB){
            this.Id = uB.Id;
            this.Name = uB.trailheadapp__Badge__r.Name;
            this.Status = uB.trailheadapp__Status__c;
            this.DueDate = uB.trailheadapp__Due_Date__c;
            this.URL = uB.trailheadapp__URL__c;
            this.Icon = uB.trailheadapp__Badge__r.trailheadapp__Icon__c;
            this.EntryType = Label.th_TrailheadTypeBadge;
        }

        /**
         * Calculate the number of days until the assignment is due
         * @return Integer
         **/
        private Integer calculateDaysUntilDue(Date targetDate){
            Integer results = 0;
            if (targetDate == null){
                targetDate = Date.today();
            }
            if (this.DueDate != null){
                results = targetDate.daysBetween(this.DueDate.date());
            }
            this.NumDaysUntilDue = results;
            return results;
        }
        
        
        /**
         * Comparison method to allow collated sorting
         * @see https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_comparable.htm
         * @param compareTo (Object)
         * @return Integer
         **/
        global Integer compareTo(Object compareTo) {
            TrailheadEntry compareToE = (TrailheadEntry)compareTo;
            if (DueDate == compareToE.DueDate) return 0;
            if (DueDate > compareToE.DueDate || (DueDate == null && compareToE.DueDate != null)) return 1;
            return -1;        
        }
    }
    
    
    
    
    
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    //-- Aura Enabled methods
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #

    
    /**
     *  Determines the collated collection of Badges and TrailMixes associated to the user.
     *  @param whichType (String [TYPE_BADGE|TYPE_TRAILMIX|TYPE_BOTH]) - the type of assignments to count.
     *  @return TrailheadEntry[] - collection of generalized Badges and TrailMixes
     **/
    @AuraEnabled(cacheable=true)
    public static TrailheadEntry[] getAllAssignedTrailEntries(string whichType) {
        TrailheadEntry[] results = new TrailheadEntry[]{};
        
        //-- group and trim if both are included.
        if(whichType == Label.th_TrailheadTypeBoth){
            
            //-- ignore the offset and pageSize because of sorting.
            trailheadapp__User_Trailmix__c[] assignedT = getAssignedTrails(NO_OFFSET, MAX_RESULTS);
            for(trailheadapp__User_Trailmix__c uT : assignedT ){
                TrailheadEntry entry= new TrailheadEntry(uT);
                results.add(entry);
            }
            
            trailheadapp__User_Badge__c[] assignedB = getAssignedBadges(NO_OFFSET,  MAX_RESULTS);
            for(trailheadapp__User_Badge__c uB : assignedB ){           
                TrailheadEntry entry= new TrailheadEntry(uB);
                results.add(entry);
            }
            
            results.sort();
            
        } else if(whichType == Label.th_TrailheadTypeTrailmix){
            trailheadapp__User_Trailmix__c[] assignedT = getAssignedTrails(NO_OFFSET, MAX_RESULTS);
            for(trailheadapp__User_Trailmix__c uT : assignedT ){
                TrailheadEntry entry= new TrailheadEntry(uT);
                results.add(entry);
            }
        } else if(whichType == Label.th_TrailheadTypeBadge){
            trailheadapp__User_Badge__c[] assignedB = getAssignedBadges(NO_OFFSET, MAX_RESULTS);
            for(trailheadapp__User_Badge__c uB : assignedB ){           
                TrailheadEntry entry= new TrailheadEntry(uB);
                results.add(entry);
            }
        } else {
            System.assert(false, 'Unknown type of entry:' + whichType + '. Expecting one of the following [' +
                Label.th_TrailheadTypeBoth + ',' + Label.th_TrailheadTypeTrailmix + ',' + Label.th_TrailheadTypeBadge +
                ']'
            );
        }

        //-- assign due dates
        Date today = Date.today();
        for (TrailheadEntry entryToInitialize : results){
            entryToInitialize.calculateDaysUntilDue(today);
        }
        
        //-- test no results
        //results.clear();
        
        return results;
    }


    /**
     * Adds a trailhead module assignment for the current user.
     * @param moduleId (Id) - the id of the module or trail to assign them to.
     * @param dueDate (DateTime) - date the module is due
     * @param userId (Id) - the optional id of the user to assign it to.
     * @returns (Boolean) - whether the assignment could be created
     */
    @AuraEnabled
    public static Boolean addTrailheadModuleAssignment(Id moduleId, DateTime dueDate, Id userId){
        if (userId == null){
            userId = UserInfo.getUserId();
        }

        Trailheadapp__User_Badge__c result = null;
        Trailheadapp__Badge__c badge = null;
        String externalId = null;
        
        try {
            badge = [
                SELECT Id, Name,
                    trailheadapp__URL__c, trailheadapp__Type__c, trailheadapp__Badge_Icon__c,
                    trailheadapp__Description__c
                FROM trailheadapp__Badge__c
                WHERE id = :moduleId
                limit 1
            ];
            if (badge == null){
                throw new AuraHandledException('Module could not be found');
            }
        } catch( Exception err){
            throw new AuraHandledException('Module could not be found:' + moduleId);
        }

        //-- assume the badge exists or has been caught before
        // System.debug('Badge:'); System.debug(badge);

        externalId = String.format(FORMAT_EXTERNAL_ID,
            new Object[]{
                badge.Id,
                userId
            }
        );

        result = new trailheadapp__User_Badge__c(
            trailheadapp__User__c = userId,
            trailheadapp__Badge__c = badge.Id,
            trailheadapp__Due_Date__c = dueDate,
            trailheadapp__External_Id__c = externalId,
            trailheadapp__Status__c = DEFAULT_STATUS
        );

        try {
            insert result;
        } catch(Exception err){
            throw new AuraHandledException('Error occurred when assigning module:' + err.getMessage());
        }

        return true;
    }


    /**
     * Adds a trailhead trail assignment for the current user.
     * @param trailmixId (Id) - the id of the or trail to assign them to.
     * @param dueDate (DateTime) - date the module is due
     * @param userId (Id) - the optional id of the user to assign it to.
     * @returns (Boolean) - whether the assignment could be created
     */
    @AuraEnabled
    public static Boolean addTrailmixAssignment(Id trailmixId, DateTime dueDate, Id userId){
        if (userId == null){
            userId = UserInfo.getUserId();
        }

        //-- While the process is similar to assigning a module,
        //-- the fields and objects etc are so very different
        //-- it would just cause confusion to have multiple shadow versions
        //-- making it harder to read and harder to test

        SObject result = null;
        Trailheadapp__Trailmix__c trailmix = null;
        String externalId = null;
        
        try {
            trailmix = [
                SELECT Id, Name,
                    trailheadapp__URL__c, trailheadapp__Description__c,
                    trailheadapp__Slug__c, trailheadapp__External_Id__c
                FROM Trailheadapp__Trailmix__c
                WHERE id = :trailmixId
                limit 1
            ];
            if (trailmix == null){
                throw new AuraHandledException('Trailmix could not be found');
            }
        } catch( Exception err){
            throw new AuraHandledException('Trailmix could not be found:' + trailmixId);
        }

        //-- assume the badge exists or has been caught before
        // System.debug('trailmix:'); System.debug(trailmix);

        externalId = String.format(FORMAT_EXTERNAL_ID,
            new Object[]{
                trailmix.Id,
                userId
            }
        );

        //-- assume the badge exists or has been caught before
        // System.debug('Badge:'); System.debug(badge);

        result = new trailheadapp__Trailmix_Assignment__c(
            trailheadapp__User__c = userId,
            trailheadapp__Trailmix__c = trailmix.Id,
            trailheadapp__Due_Datetime__c = dueDate,
            // trailheadapp__External_Id__c = externalId, //-- no field... :(
            trailheadapp__Status__c = DEFAULT_STATUS
        );

        /*
        result = new Trailheadapp__User_Trailmix__c(
            trailheadapp__User__c = userId,
            trailheadapp__Trailmix__c = trailmix.Id,
            trailheadapp__Due_At__c = dueDate,
            trailheadapp__External_Id__c = externalId,
            trailheadapp__Status__c = DEFAULT_STATUS
        );
        */

        try {
            insert result;
        } catch(Exception err){
            throw new AuraHandledException('Error occurred when assigning module:' + err.getMessage());
        }

        return true;
    }


    /**
     * Determines a list of TrailheadEntries for a specific user.
     * @param badges (Set<Id>) - collection of Badges (by their ids) to retrieve
     * @param trailmixes (Set<Id>) - collection of TrailMixes (by their ids) to retrieve.
     * @param userId (Id) - Id of the user to consider when determining if assignments already exist.
     * @returns TrailheadEntry[] - collection of trailhead entries
     */
    public static TrailheadEntry[] determineEntriesByTrailheadId(
        Set<Id> badges, Set<id> trailmixes, Id userId
    ){
        /** whether to include Completed trails and badges */
        Boolean includeCompleted = false;
        
        /** Final list of all the trialhead entries we will return */
        TrailheadEntry[] results = new TrailheadEntry[]{};
        
        /** collection of badges we will recommend that the user has an assignment to */
        Map<Id,trailheadapp__User_Badge__c> badgeAssignmentMap = new Map<Id,trailheadapp__User_Badge__c>();
        /** collection of trailmixes we will recommend that the user has an assignment to */
        Map<Id,trailheadapp__User_Trailmix__c> trailmixAssignmentMap = new Map<Id,trailheadapp__User_Trailmix__c>();

        if (userId == null) {
            userId = UserInfo.getuserId();
        }

        //-- determine if there are any user assignments for those badges and trailmixes
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
            for (trailheadapp__User_Badge__c assignedUserBadge : uBadges ){
                if (!includeCompleted && assignedUserBadge.trailheadapp__Status__c == ASSIGNMENT_STATUS_COMPLETED){
                    Badges.remove(assignedUserBadge.trailheadapp__Badge__c);
                } else {
                    //-- it isn't completed but there is still an assignment
                    badgeAssignmentMap.put(assignedUserBadge.trailheadapp__Badge__c, assignedUserBadge);
                }
            }
        }
        if (Trailmixes.size() > 0){
            uTrails = [
                Select Id, trailheadapp__Due_At__c, trailheadapp__Status__c, trailheadapp__Trailmix__c
                From trailheadapp__User_Trailmix__c 
                Where trailheadapp__User__c =:userId and trailheadapp__Trailmix__c in :Trailmixes
            ];
            for (trailheadapp__User_Trailmix__c assignedUserTrail : uTrails ){
                if (!includeCompleted && assignedUserTrail.trailheadapp__Status__c == ASSIGNMENT_STATUS_COMPLETED){
                    Trailmixes.remove(assignedUserTrail.trailheadapp__Trailmix__c);
                } else {
                    //-- it isn't completed but there is still an assignment
                    trailmixAssignmentMap.put(assignedUserTrail.trailheadapp__Trailmix__c, assignedUserTrail);
                }
            }
        }
        // system.debug('** Badges & Trailmixes **');
        // system.debug(Badges);
        // system.debug(Trailmixes);

        //-- determine the underlying badges
        
        trailheadapp__Badge__c [] thBadges;
        trailheadapp__Trailmix__c [] thTrails;
        if (Badges.size() > 0){
            thBadges = [Select Id, Name,trailheadapp__Icon__c, trailheadapp__URL__c From trailheadapp__Badge__c Where Id in :Badges];
        }
        if(Trailmixes.size() > 0){
            thTrails = [Select Id, Name,trailheadapp__URL__c From trailheadapp__Trailmix__c Where Id in :Trailmixes];
        }
        // system.debug('** thBadges & thTrails **');
        // system.debug(thBadges);
        // system.debug(thTrails);
        
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
                TrailheadEntry newEntry = new TrailheadEntry (
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
                    assignmentStatus = uTrail.trailheadapp__Status__c;
                }

                TrailheadEntry newEntry = new TrailheadEntry(
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


    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    //-- private methods
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    
    
    
    
	/**
	 * Determines the current set of badges assigned to the current user.
	 * @param rowOffset (Integer) - the number of badges to skip for the current user (pagination)
	 * @param pageSize (Integer) - the number of records to return
	 * @return trailheadapp__User_Badge__c[] - collection of userBadge assignments for the user
	 **/
	 private static trailheadapp__User_Badge__c[] getAssignedBadges(integer rowOffset, integer pageSize) {
        
        //-- @KLUDGE / @TODO: revisit if valueOf is still needed
        //-- please see https://salesforce.stackexchange.com/questions/108355/limit-expression-must-be-of-type-integer-error-when-using-apex-variable-in-soq
        
        pageSize = Integer.valueOf(pageSize);
        rowOffset = Integer.valueOf(rowOffset);

        Id userId = UserInfo.getUserId();
        
        return [SELECT Id, trailheadapp__Badge__c, trailheadapp__Badge__r.trailheadapp__Icon__c,trailheadapp__Badge__r.Name, trailheadapp__URL__c, trailheadapp__Due_Date__c , trailheadapp__Status__c, trailheadapp__Badge_Icon__c
            FROM trailheadapp__User_Badge__c
            WHERE trailheadapp__User__c = :userId And trailheadapp__Finished_Date__c = null
            ORDER BY trailheadapp__Due_Date__c ASC NULLS LAST
            LIMIT :pageSize
            OFFSET :rowOffset];
    }
	
	/**
	 * Determines the current set of trailmixes assigned to the current user.
	 * @param rowOffset (Integer) - the number of badges to skip for the current user (pagination)
	 * @param pageSize (Integer) - the number of records to return
	 * @return trailheadapp__User_Trailmix__c[] - collection of Trailmix assignments for the user
	 **/
    private static trailheadapp__User_Trailmix__c[] getAssignedTrails(integer rowOffset, integer pageSize) {
        
        //-- @KLUDGE / @TODO: revisit if valueOf is still needed
        //-- please see https://salesforce.stackexchange.com/questions/108355/limit-expression-must-be-of-type-integer-error-when-using-apex-variable-in-soq
        
        pageSize = Integer.valueOf(pageSize);
        rowOffset = Integer.valueOf(rowOffset);

        Id userId = UserInfo.getUserId();
        
        return [SELECT Id, trailheadapp__Due_At__c, trailheadapp__Trailmix__r.trailheadapp__URL__c, trailheadapp__Trailmix__r.Name, trailheadapp__Status__c
            FROM trailheadapp__User_Trailmix__c
            WHERE trailheadapp__User__c = :UserId And trailheadapp__Completed_At__c = null
            ORDER BY trailheadapp__Due_At__c ASC NULLS LAST
            LIMIT :pageSize
            OFFSET :rowOffset];
    }
}