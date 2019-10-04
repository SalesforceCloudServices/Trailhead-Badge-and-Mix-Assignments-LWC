public with sharing class TH_Report_to_TEs {
    @AuraEnabled(cacheable=false)
    public static TH_Assignments.TrailheadEntry[] getReportEntries(Id badgeReportId, Id trailmixReportId) {
        TH_Assignments.TrailheadEntry[] results = new TH_Assignments.TrailheadEntry[]{};
        Reports.ReportResults bResults;
        Reports.ReportResults tResults;
        
        /** collection of ids for all the badges & trailmixes in the reports */
        Set<Id> Badges = new Set<Id>();
        Set<Id> Trailmixes = new Set<Id>();
       
       try{
            if(badgeReportId != null) bResults = Reports.ReportManager.runReport(badgeReportId, true);
            if(trailmixReportId != null) tResults = Reports.ReportManager.runReport(trailmixReportId, true);
            
            if(bResults != null) {
                for(Reports.ReportFact rf: bResults.getFactMap().values()){
                    Reports.ReportFactWithDetails rfwd = (Reports.ReportFactWithDetails)rf;
                    for(Reports.ReportDetailRow detailRow : rfwd.getRows()){
                        for(Reports.ReportDataCell dataCell : detailRow.getDataCells()){
                            if(dataCell.getValue() instanceOf Id ) {
                                Id cellId = (Id)dataCell.getValue();
                                if(cellId.getSObjectType() == Schema.trailheadapp__Badge__c.getSObjectType()) Badges.add(cellId);
                            }
                        }
                    }
                }
            System.debug(Badges);
            }
            
            if(tResults != null) {
                for(Reports.ReportFact rf: tResults.getFactMap().values()){
                    Reports.ReportFactWithDetails rfwd = (Reports.ReportFactWithDetails)rf;
                    for(Reports.ReportDetailRow detailRow : rfwd.getRows()){
                        for(Reports.ReportDataCell dataCell : detailRow.getDataCells()){
                            if(dataCell.getValue() instanceOf Id ) {
                                Id cellId = (Id)dataCell.getValue();
                                if(cellId.getSObjectType() == Schema.trailheadapp__Trailmix__c.getSObjectType()) Trailmixes.add(cellId);
                            }
                        }
                    }
                }
            System.debug(Trailmixes);     
            }          
            
        } catch (Exception ex) {
            System.debug(ex);
        }

        return results;
    }


    // Not Used    
    private static Reports.ReportFactWithDetails getfactDetails(Reports.ReportResults results){
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_analytics_report_data.htm
        // Get the first down-grouping in the report
        Reports.Dimension dim = results.getGroupingsDown();
        Reports.GroupingValue groupingVal = dim.getGroupings()[0];
        System.debug('Key: ' + groupingVal.getKey());
        System.debug('Label: ' + groupingVal.getLabel());
        System.debug('Value: ' + groupingVal.getValue());

        // Construct a fact map key, using the grouping key value
        String factMapKey = groupingVal.getKey() + '!T';

        // Get the report metadata
        Reports.ReportMetadata rm = results.getReportMetadata();
        // Get detail columns
        System.debug('Detail columns: ' + rm.getDetailColumns());
        System.debug('Index of ' + rm.getDetailColumns().indexOf('CUST_NAME'));
        

        // Get the fact map from the report results
        return (Reports.ReportFactWithDetails)results.getFactMap().get(factMapKey);
    }
}