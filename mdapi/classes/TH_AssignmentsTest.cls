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
         
         //Lets Test!
         TH_Assignments.TrailheadEntry[] entries = TH_Assignments.getAllAssignedTrailEntries(Label.th_TrailheadTypeBoth);
         entries = TH_Assignments.getAllAssignedTrailEntries(Label.th_TrailheadTypeBadge);
         entries = TH_Assignments.getAllAssignedTrailEntries(Label.th_TrailheadTypeTrailmix);

        TH_Context_Badge_Recommend__c[] contextBadges = new List<TH_Context_Badge_Recommend__c>();
        
        contextBadges.add(new TH_Context_Badge_Recommend__c(
         Name='test',
         Badge_Id__c = String.valueOf(badge.Id),
         Field_API_Name__c ='name',
         Field_Value__c ='Test Badge',
         Object_API_Name__c ='trailheadapp__Badge__c'));
         
        contextBadges.add(new TH_Context_Badge_Recommend__c(
         Name='test2',
         Badge_Id__c = String.valueOf(mix.Id),
         Field_API_Name__c ='name',
         Field_Value__c ='Test Badge',
         Object_API_Name__c ='trailheadapp__Badge__c'));

        insert(contextBadges);

        entries = TH_Contextual_Badge_Recommend.getRecommendedEntries(badge.Id);
     }
}
