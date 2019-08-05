/**
 * Class that supports sharing of trailhead trails and modules
 */
public with sharing class TH_ShareUtil {
    
    /**
     * Attempts to find users based on some form of search criteria.
     * @param userSearch (String) - the search string to look for users.
     * @return UserMatchOption[]
     */
    @AuraEnabled(cacheable=true)
    public static UserMatchOption[] findMatchingUsers(string userSearch) {
        UserMatchOption[] results = new UserMatchOption[]{};
        UserMatchOption option;

        for (User matchingUser : [
            SELECT id, name
            FROM user
            WHERE name like :userSearch
        ]){
            option = new UserMatchOption(
                matchingUser.id, matchingUser.name
            );
            results.add(option);
        }
        return results;
    }

    /**
     * Note that SelectOption does not have the @AuraEnabled annotation,
     * and will otherwise give the error:
     * `AuraEnabled methods do not support return type of List<System.SelectOption>`
     * So we make a custom class instead.
     **/
    public class UserMatchOption {
        /** the label of the option */
        @AuraEnabled
        public string label {get;set;}
        /** the value of the option */
        @AuraEnabled
        public string value {get;set;}

        public UserMatchOption(String value, String label){
            this.value = value;
            this.label = label;
        }
    }
}
