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
         
         //Lets Test!
         TH_Assignments.AssignmentCounts assignCounts = TH_Assignments.getAssignmentCount('Both');
         TH_Assignments.TrailheadEntry[] entries = TH_Assignments.getAssignedTrailEntries(0, 5, 'Both');
         entries = TH_Assignments.getAssignedTrailEntries(0, 5, 'Badge');
         entries = TH_Assignments.getAssignedTrailEntries(0, 5, 'TrailMix');

     }
}