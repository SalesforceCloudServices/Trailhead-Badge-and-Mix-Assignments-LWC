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
            WHERE name like :userSearch or email like :userSearch
        ]){
            option = new UserMatchOption(
                matchingUser.id, matchingUser.name
            );
            results.add(option);
        }
        return results;
    }

    /**
     * Share a chatter post @mentioning a trailhead trail
     * @param targetUserId {Id} - the Id of the user to target
     * @param trailheadURL {string} - the url of the trailhead entry (either module or trail)
     * @param message {string} - the message to include in the chatter post.
     * @returns {boolean} - whether successful (true) or not (false)
     **/
    @AuraEnabled
    public static Boolean mentionTrailheadToUser(Id targetUserId, String trailheadURL, String message){
        Boolean results = false;

        //-- see here for more
        //-- https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/connectapi_examples_post_feed_element_mention.htm

        ConnectApi.FeedItemInput feedItemInput = new ConnectApi.FeedItemInput();
        ConnectApi.MentionSegmentInput mentionSegmentInput = new ConnectApi.MentionSegmentInput();
        ConnectApi.MessageBodyInput messageBodyInput = new ConnectApi.MessageBodyInput();
        ConnectApi.TextSegmentInput textSegmentInput = new ConnectApi.TextSegmentInput();

        messageBodyInput.messageSegments = new List<ConnectApi.MessageSegmentInput>();

        mentionSegmentInput.id = targetUserId;
        messageBodyInput.messageSegments.add(mentionSegmentInput);

        textSegmentInput.text = ' ' + message + '\n' + trailheadURL;
        messageBodyInput.messageSegments.add(textSegmentInput);

        feedItemInput.body = messageBodyInput;
        feedItemInput.feedElementType = ConnectApi.FeedElementType.FeedItem;
        feedItemInput.subjectId = targetUserId;

        ConnectApi.FeedElement feedElement = ConnectApi.ChatterFeeds.postFeedElement(Network.getNetworkId(), feedItemInput);

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