public with sharing class TH_Report_to_TEs {
    @AuraEnabled(cacheable=false)
    public static TH_Assignments.TrailheadEntry[] getReportEntries(string badgeReportName, string trailmixReportName) {
        /** varible setup **/
        TH_Assignments.TrailheadEntry[] results = new TH_Assignments.TrailheadEntry[]{};
        Id badgeReportId=null;
        Id trailmixReportId=null;
        Reports.ReportResults bResults;
        Reports.ReportResults tResults;
        Set<Id> Badges = new Set<Id>();
        Set<Id> Trailmixes = new Set<Id>();
       
       try{
            /** Query for Report Ids **/
            for(Report r : [SELECT  Id,  DeveloperName FROM Report WHERE DeveloperName =: badgeReportName or DeveloperName =: trailmixReportName ]){
                if (r.DeveloperName == badgeReportName) badgeReportId = r.id;
                if (r.DeveloperName == trailmixReportName) trailmixReportId = r.id;
            }
            
            /** Run Reports **/
            if(badgeReportId != null) bResults = Reports.ReportManager.runReport(badgeReportId, true);
            if(trailmixReportId != null) tResults = Reports.ReportManager.runReport(trailmixReportId, true);
            
            /** Get Badge Ids **/
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
            System.debug('Badges Found: ' + Badges.size());
            }
            /** Get Trailmix Ids **/
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
            System.debug('Trailmixes Found: ' + Trailmixes.size());     
            }

            /** Use helper to turn Id lists into TEs **/
            results = TH_Assignments.determineEntriesByTrailheadId(Badges, Trailmixes, UserInfo.getUserId());         
            System.debug('Results: ' + results);

        } catch (Exception ex) {
            System.debug(ex);
        }

        return results;
    }
    
}