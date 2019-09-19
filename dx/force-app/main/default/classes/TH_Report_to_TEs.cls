public with sharing class TH_Report_to_TEs {
    @AuraEnabled(cacheable=false)
    public static TH_Assignments.TrailheadEntry[] getReportEntries(Id badgeReportId, Id trailmixReportId) {
        TH_Assignments.TrailheadEntry[] results = new TH_Assignments.TrailheadEntry[]{};
        Reports.ReportResults bResults;
        Reports.ReportResults tResults;
       
       try{
            if(badgeReportId != null) bResults = Reports.ReportManager.runReport(badgeReportId, true);
            if(trailmixReportId != null) tResults = Reports.ReportManager.runReport(trailmixReportId, true);
            System.debug(getfactDetails(bResults));
            System.debug(tResults);
        } catch (Exception ex) {
            System.debug(ex);
        }

        return results;
    }

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