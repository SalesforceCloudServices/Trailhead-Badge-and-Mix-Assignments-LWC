global class TH_Assignments {
    
    //-- @TODO: use custom setting instead for this.
    public static final string TRAIL_ICON = 'https://trailhead-web.s3.amazonaws.com/uploads/users/5396019/photos/thumb_030804d3576dab0cdc2a558055816208e421312a9d1495117d57928ef380d7f2.png?updatedAt=20180906113753';
    
    public static final string TYPE_BADGE = 'Badge';
    public static final string TYPE_TRAILMIX = 'TrailMix';
    public static final String TYPE_BOTH = 'Both';
    
    //-- IGNORED OFFSET/PAGE SIZES for combined collated results.
    public static final Integer NO_OFFSET = 0;
    public static final Integer MAX_RESULTS = 255;
    
    
    
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    //-- internal result classes
    //-- #  #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #
    
    
    
    /**
     * Internal class to return counts of the trailhead assignments for the current user.
     * <p>Used in pagination</p>
     **/
    global class AssignmentCounts {
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
            this.Icon = TH_Assignments.TRAIL_ICON;
            this.EntryType = TH_Assignments.TYPE_TRAILMIX;
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
            this.EntryType = TH_Assignments.TYPE_BADGE;
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
     *  Determines the number of badges, trails and total assignments for the current user.
     *  <p>This has been separated out from retrieving the records to minimize network traffic</p>
     *  @param whichType (String [TYPE_BADGE|TYPE_TRAILMIX|TYPE_BOTH]) - the type of assignments to count.
     *  @return AssignmentCounts ({numBadgeAssignments:Integer,
     *                              numTrailmixAssignments:Integer,
     *                              totalAssignments:Integer})
     **/
    @AuraEnabled
    public static AssignmentCounts getAssignmentCount(String whichType){
        AssignmentCounts results = new AssignmentCounts();
        results.totalAssignments = 0;
        
        if(whichType==TH_Assignments.TYPE_BADGE || whichType==TH_Assignments.TYPE_BOTH){
            results.numBadgeAssignments = [SELECT count()  
				FROM trailheadapp__User_Badge__c  	
				Where trailheadapp__User__c = :UserInfo.getUserId() And trailheadapp__Finished_Date__c = null];
			
            results.totalAssignments += results.numBadgeAssignments;
        }
        if(whichType==TH_Assignments.TYPE_TRAILMIX || whichType==TH_Assignments.TYPE_BOTH){
            results.numTrailmixAssignments = [SELECT count()  
				FROM trailheadapp__User_Trailmix__c  	
				Where trailheadapp__User__c = :UserInfo.getUserId() And trailheadapp__Completed_At__c = null];
			
            results.totalAssignments += results.numTrailmixAssignments;
        }
        
        //-- test no results
        //results.numBadgeAssignments = 0;
        //results.numTrailmixAssignments = 0;
        //results.totalAssignments = 0;
        
        return(results);
    }
    
    /**
     *  Determines the collated collection of Badges and TrailMixes associated to the user.
	 *  @param rowOffset (Integer) - the number of badges to skip for the current user (pagination)
	 *  @param pageSize (Integer) - the number of records to return
     *  @param whichType (String [TYPE_BADGE|TYPE_TRAILMIX|TYPE_BOTH]) - the type of assignments to count.
     *  @return TrailheadEntry[] - collection of generalized Badges and TrailMixes
     **/
    @AuraEnabled
    public static TrailheadEntry[] getAssignedTrailEntries(integer rowOffset, integer pageSize, string whichEntries) {
        TrailheadEntry[] results = new TrailheadEntry[]{};
    
        //-- @KLUDGE / @TODO: revisit if valueOf is still needed
        //-- please see https://salesforce.stackexchange.com/questions/108355/limit-expression-must-be-of-type-integer-error-when-using-apex-variable-in-soq
        pageSize = Integer.valueOf(pageSize);
        rowOffset = Integer.valueOf(rowOffset);
        
        //-- group and trim if both are included.
        if(whichEntries == TH_Assignments.TYPE_BOTH){
            
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
            
            //-- splice to current pagination set.
            //-- making it work inline with limit/offsets
            TrailheadEntry[] resultSubset = new TrailheadEntry[]{};
            for(integer i = rowOffset; i < rowOffset + pageSize && i < results.size(); i++){
                resultSubset.add(results[i]);
            }
            results = resultSubset;
        } else if(whichEntries == TH_Assignments.TYPE_TRAILMIX){
            trailheadapp__User_Trailmix__c[] assignedT = getAssignedTrails(rowOffset,  pageSize);
            for(trailheadapp__User_Trailmix__c uT : assignedT ){
                TrailheadEntry entry= new TrailheadEntry(uT);
                results.add(entry);
            }
        } else if(whichEntries == TH_Assignments.TYPE_BADGE){
            trailheadapp__User_Badge__c[] assignedB = getAssignedBadges(rowOffset,  pageSize);
            for(trailheadapp__User_Badge__c uB : assignedB ){           
                TrailheadEntry entry= new TrailheadEntry(uB);
                results.add(entry);
            }
        } else {
            System.assert(false, 'Unknown type of entry:' + whichEntries + '. Expecting one of the following [' +
                TH_Assignments.TYPE_BOTH + ',' + TH_Assignments.TYPE_TRAILMIX + ',' + TH_Assignments.TYPE_BADGE +
                ']'
            );
        }
        
        //-- test no results
        //results.clear();
        
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
        
        return [SELECT Id, trailheadapp__Badge__c, trailheadapp__Badge__r.trailheadapp__Icon__c,trailheadapp__Badge__r.Name, trailheadapp__URL__c, trailheadapp__Due_Date__c , trailheadapp__Status__c, trailheadapp__Badge_Icon__c
            FROM trailheadapp__User_Badge__c
            WHERE trailheadapp__User__c = :UserInfo.getUserId() And trailheadapp__Finished_Date__c = null
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
        
        return [SELECT Id, trailheadapp__Due_At__c, trailheadapp__Trailmix__r.trailheadapp__URL__c, trailheadapp__Trailmix__r.Name, trailheadapp__Status__c
            FROM trailheadapp__User_Trailmix__c
            WHERE trailheadapp__User__c = :UserInfo.getUserId() And trailheadapp__Completed_At__c = null
            ORDER BY trailheadapp__Due_At__c ASC NULLS LAST
            LIMIT :pageSize
            OFFSET :rowOffset];
    }
}