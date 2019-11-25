@isTest
public class TH_AssignmentsTest {
	 @isTest static void TestTH_Assignments() {
         //Create Test Data
         trailheadapp__Trailmix__c mix = new trailheadapp__Trailmix__c();
         mix.name = 'Test Mix';
         mix.trailheadapp__URL__c = 'https://trailhead.salesforce.com/';
         mix.trailheadapp__Slug__c = 'Test-Mix';
         mix.trailheadapp__External_Id__c = '000001111';
         mix.trailheadapp__Created_By_Profile__c = 'https://trailhead.salesforce.com/';
         mix.trailheadapp__Creator_TH_SFID__c = 'SomeText';
         Insert(mix);
         trailheadapp__Badge__c badge = new trailheadapp__Badge__c();
         badge.name = 'Test Badge';
         badge.trailheadapp__Description__c = 'test';
         badge.trailheadapp__URL__c = 'https://trailhead.salesforce.com/';
         badge.trailheadapp__Icon__c = 'https://trailhead.salesforce.com/'; 
         badge.trailheadapp__API_Name__c = '000001112';
         badge.trailheadapp__Namespace__c ='namespace';  
         Insert(badge);
         trailheadapp__User_Trailmix__c uMix = new trailheadapp__User_Trailmix__c();
         uMix.trailheadapp__Trailmix__c = mix.Id;
         uMix.trailheadapp__User__c  = UserInfo.getUserId();
         uMix.trailheadapp__Due_At__c  = DateTime.Now();
         Insert(uMix);
         trailheadapp__User_Badge__c uBadge = new trailheadapp__User_Badge__c();
         uBadge.trailheadapp__Badge__c  = badge.Id;
         uBadge.trailheadapp__User__c = UserInfo.getUserId();
         uBadge.trailheadapp__Status__c	  = 'Assigned';
         uBadge.trailheadapp__Due_Date__c   = DateTime.now().AddDays(1);
         Insert(uBadge);
         TH_Recommendation__c thr = new TH_Recommendation__c();
         thr.Badge__c = badge.id;
         thr.Trailmix__c = mix.id;
         Insert(thr);
         
         //Lets Test!
         TH_Assignments.TrailheadEntry[] entries = TH_Assignments.getAllAssignedTrailEntries(Label.th_TrailheadTypeBoth);
         entries = TH_Assignments.getAllAssignedTrailEntries(Label.th_TrailheadTypeBadge);
         entries = TH_Assignments.getAllAssignedTrailEntries(Label.th_TrailheadTypeTrailmix);
         entries = TH_Recommendations.getRecommendedEntries(null);

         TH_Assignments.addTrailheadModuleAssignment(badge.id,DateTime.Now(),UserInfo.getUserId() );
         TH_Assignments.addTrailmixAssignment(mix.id,DateTime.Now(),UserInfo.getUserId() );

     }
    
    @isTest(SeeAllData=true)
    public static void Test_TH_Report_to_TEs(){
        TH_Report_to_TEs.getReportEntries('New_Badges_Last_90_Days', 'Assigned_Trailmixes11121');
    }
}