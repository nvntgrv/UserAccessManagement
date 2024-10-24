public class UserAssistanceController {
    
    @AuraEnabled
    public static List<UserLicense> getLicenseList(){
    	List<UserLicense> userLicenseList=[SELECT Id, Name, Status, TotalLicenses, UsedLicenses from UserLicense LIMIT 50000];
        return userLicenseList;
    }
    
        @AuraEnabled
    public static String updatePermissionset(string userWrapper,String searchKeyword){
        UserObj cUser = (UserObj)JSON.deserialize(userWrapper,UserObj.class);
        List<User> UserList=[select id,Username,CommunityNickname from User where Username =:cUser.Username ];
        if(UserList.size()>0){
            return '0';
        }
        User cloneUser= new User();
        try{
            
            cloneUser.FirstName=cUser.FirstName;
            cloneUser.LastName=cUser.LastName;
            cloneUser.Alias=cUser.Alias;
            cloneUser.Email=cUser.Email;
            cloneUser.Username=cUser.Username;
            cloneUser.CommunityNickname=cUser.CommunityNickname;
            cloneUser.TimeZoneSidKey =cUser.TimeZoneSidKey;
            cloneUser.LocaleSidKey=cUser.LocaleSidKey;
            cloneUser.EmailEncodingKey=cUser.EmailEncodingKey;
            cloneUser.ProfileId=cUser.ProfileId;
            cloneUser.LanguageLocaleKey=cUser.LanguageLocaleKey;
            cloneUser.IsActive=true;
            if(cUser.UserRoleId!=null){
                cloneUser.UserRoleId=cUser.UserRoleId;
            }
            insert cloneUser;
        }catch(DmlException e){
            System.debug(e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        
        String recordId = cloneUser.Id;
        List<PermissionSetAssignment> UpdatelistOfPermissions = new List<PermissionSetAssignment>();
        List<PermissionSetAssignment>listOfPermissions =[select id,PermissionSetId,AssigneeId from PermissionSetAssignment 
                                                         where Assignee.Email =:searchKeyword and PermissionSet.ProfileId=null ];
        for(PermissionSetAssignment p:listOfPermissions){
            PermissionSetAssignment permissions = new PermissionSetAssignment(PermissionSetId=p.PermissionSetId,AssigneeId=recordId);
            UpdatelistOfPermissions.add(permissions);
        }
        if(UpdatelistOfPermissions.size()>0){
            insert UpdatelistOfPermissions;
        }
        return recordId; 
    }
    
        @AuraEnabled
    public static List<User> fetchUserToClone(String searchKeyword){
        List<User> listOfUser = [SELECT id,FirstName, LastName,name, Email, Username, CommunityNickname, Alias,
                              EmailEncodingKey, ProfileId,Profile.Name,Profile.id, IsActive, TimeZoneSidKey, LocaleSidKey, LanguageLocaleKey,UserRoleId
                              FROM User WHERE Email =:searchKeyWord LIMIT 1];
        return listOfUser;
    }
    
    @AuraEnabled
    public static List<User> getAllUsers(){
        List<User> allUsers=[SELECT Id, FirstName, LastName, Email, Username, IsActive, Alias FROM User WHERE IsActive = true];
        return allUsers;
    }
       
    @AuraEnabled
    public static List<User> getDormantUsers(String selectedMonth){
        String query = 'SELECT Id, FirstName, LastName, Email, Name, Username, LastLoginDate, IsActive FROM User ';
        String dateCondition = '';
                
        if(selectedMonth == 'moreThanOne'){
            dateCondition = 'WHERE IsActive = true AND LastLoginDate < LAST_N_DAYS:30';
        }
        else if(selectedMonth == 'oneToThree'){
            dateCondition = 'WHERE IsActive = true AND LastLoginDate < LAST_N_DAYS:30 AND LastLoginDate >= LAST_N_DAYS:90';
        }
        else if(selectedMonth == 'threeToSix'){
			dateCondition = 'WHERE IsActive = true AND LastLoginDate < LAST_N_DAYS:90 AND LastLoginDate >= LAST_N_DAYS:180';                       
        }
        else if(selectedMonth == 'sixToNine'){
            dateCondition = 'WHERE IsActive = true AND LastLoginDate < LAST_N_DAYS:180 AND LastLoginDate >= LAST_N_DAYS:270';
        }
        else if(selectedMonth=='12months'){
           dateCondition = 'WHERE IsActive = true AND LastLoginDate < LAST_N_DAYS:365';
        }
        
        query += dateCondition;
        List<User> dormantUsers = Database.query(query);
        
        Date today = Date.today();
        for (User u : dormantUsers) {
            Date lastLoginDate = (u.LastLoginDate != null) ? u.LastLoginDate.date() : null;
            Integer inactiveDays = (lastLoginDate != null) ? today.daysBetween(lastLoginDate) : null;
            u.put('InactiveDays__c', -1*inactiveDays);
        }
        return dormantUsers;
    }
    
    @AuraEnabled
    public static List<User> getActiveUsers(){
        List<User> activeUserLists = new List<User>([SELECT Id, FirstName, LastName, Email, LastLoginDate, IsActive FROM USER WHERE (LastLoginDate = THIS_MONTH OR LastLoginDate = null) AND IsActive = true]);
        return activeUserLists;
    }
    
    @AuraEnabled
    public static Map<Id, List<RecordCountWrapper>> displayRelatedRecords(String dormantUserMap){
        //All the Variables used in the method...
        Map<Id, String> mappedDormantUsers = (Map<Id, String>)JSON.deserialize(dormantUserMap,Map<Id, String>.class);
        Set<Id> userIds = mappedDormantUsers.keySet();
        Map<Id, List<RecordCountWrapper>> toPass = new Map<Id, List<RecordCountWrapper>>();
        Set<Id> calledUsers = new Set<Id>();
        
        //Adding the objects to query in the list...
        List<String> objectsList = new List<String>();
        objectsList.add('Account');
        objectsList.add('Opportunity');
        objectsList.add('Lead');
        objectsList.add('Task');
        objectsList.add('Event');
        for(String objectName: objectsList){
            String query = 'SELECT OwnerId, COUNT(Id)recordCount FROM ' + objectName + ' WHERE OwnerId IN :userIds GROUP BY OwnerId';
            Map<String, Integer> initialMap = new Map<String, Integer>();
            
            //For merging the Task and Event object into Activity...
            for(Id eachUserId : userIds){
                RecordCountWrapper tempRecord = new RecordCountWrapper();
                if(objectName == 'Task'){
                    tempRecord.ObjectName = 'Activity';
                }
                else if(objectName == 'Event'){
                    continue;
                }
                else{
                    tempRecord.ObjectName = objectName;
                }
                tempRecord.OwnerId = eachUserId;
                tempRecord.RecordCount = 0;
                tempRecord.OwnerName = mappedDormantUsers.get(eachUserId);
                if(!toPass.containsKey(eachUserId)){
					List<RecordCountWrapper> newTempList = new List<RecordCountWrapper>();
                	newTempList.add(tempRecord);  
                    toPass.put(eachUserId, newTempList);
                }
                else{
                    List<RecordCountWrapper> tempList = toPass.get(eachUserId);
                    tempList.add(tempRecord);
                    toPass.put(eachUserId, tempList);
                }
            }
			//Quering the data for checking if the user has any records on the above objects...
            for(AggregateResult ar: Database.query(query)){
                calledUsers.add((Id)ar.get('OwnerId'));
                List<RecordCountWrapper> currentList = toPass.get((Id)ar.get('OwnerId'));
                if(objectName=='Task' || objectName=='Event'){
                    currentList[currentList.size()-1].RecordCount += (Integer)ar.get('RecordCount');
                }
                else{
                	currentList[currentList.size()-1].RecordCount = (Integer)ar.get('RecordCount');
                }
    		}
        }
        if(!userIds.equals(calledUsers)){
            userIds.removeAll(calledUsers);
            for(Id each: userIds){
                toPass.remove(each);
            }
            List<Id> deactivateUsersId = new List<Id>();
            deactivateUsersId.addAll(userIds);
            deactivateUser(deactivateUsersId);
        }
        return toPass;
    }
      
    @AuraEnabled
    public static void deactivateUser(List<Id> userIds){
        System.debug('Inside deactivateUser' + '' + userIds);
        List<User> usersToDeactivate = new List<User>([SELECT Id, IsActive FROM USER WHERE Id IN :userIds]);
        for(User each: usersToDeactivate){
            each.IsActive = false;
        }
        update usersToDeactivate;
        
    }
    
    @AuraEnabled
    public static void changeOwnerAllObjects(List<String> userLists){
        try{
            String currentUserId = userLists[0];
            String newUserId = userLists[1];
            Map<String, String> result = new Map<String, String>();
            List<String> objectsList = new List<String>();
            objectsList.add('Account');
            objectsList.add('Opportunity');
            objectsList.add('Lead');
            objectsList.add('Task');
            objectsList.add('Event');
            
            List<SObject> recordsToUpdate = new List<SObject>();
            for(String eachObject : objectsList){
                String query = 'SELECT Id, OwnerId FROM ' + eachObject + ' WHERE OwnerId = :currentUserId';
                recordsToUpdate.addAll(getRecordsToUpdate(eachObject, currentUserId));
            }
            for(Sobject eachRecord : recordsToUpdate){
                eachRecord.put('OwnerId', newUserId);
            }
            update recordsToUpdate;
        }
        catch(DmlException e){
            throw new AuraHandledException('An unexpected error occurred: ' + e.getMessage());
        }
    }
    
    private static List<SObject> getRecordsToUpdate(String objectName, String currentUserId) {
        String query = 'SELECT Id FROM ' + objectName + ' WHERE OwnerId = :currentUserId';
        return Database.query(query);
    }
    
    @AuraEnabled
    public static void individualObjectOwnerChange(List<String> changeOwnerList){
        try{
            Id newOwner = (Id)JSON.deserialize(changeOwnerList[0] , Id.class);
            Id currentOwner =(Id)JSON.deserialize(changeOwnerList[1], Id.class);
            String objectName = changeOwnerList[2];
            List<SObject> recordsList = new List<SObject>();
            if(objectName == 'Activity'){
                List<Task> taskRecords = [SELECT Id, OwnerId FROM Task WHERE OwnerId =: currentOwner];
                List<Event> eventRecords = [SELECT Id,OwnerId FROM Event WHERE OwnerId =: currentOwner];
                recordsList.addAll(taskRecords);
                recordsList.addAll(eventRecords);
            }
            else{
               recordsList.addAll(Database.query('SELECT Id, OwnerId FROM ' + objectName + ' WHERE OwnerId =: currentOwner'));
            }
            for(SObject eachRecord : recordsList){
                eachRecord.put('OwnerId', newOwner);
            }
            update recordsList;
        }
        catch(DmlException e){
            throw new AuraHandledException('An unexpected error occurred: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
	public static Map<Id, List<RecordCountWrapper>> refreshRecordsTable(String dormantUserMap){
        //All the Variables used in the method...
        Map<Id, String> mappedDormantUsers = (Map<Id, String>)JSON.deserialize(dormantUserMap,Map<Id, String>.class);
        Set<Id> userIds = mappedDormantUsers.keySet();
        Map<Id, List<RecordCountWrapper>> toPass = new Map<Id, List<RecordCountWrapper>>();
        Set<Id> calledUsers = new Set<Id>();
        
        //Adding the objects to query in the list...
        List<String> objectsList = new List<String>();
        objectsList.add('Account');
        objectsList.add('Opportunity');
        objectsList.add('Lead');
        objectsList.add('Task');
        objectsList.add('Event');
        for(String objectName: objectsList){
            String query = 'SELECT OwnerId, COUNT(Id)recordCount FROM ' + objectName + ' WHERE OwnerId IN :userIds GROUP BY OwnerId';
            Map<String, Integer> initialMap = new Map<String, Integer>();
            
            //For merging the Task and Event object into Activity...
            for(Id eachUserId : userIds){
                RecordCountWrapper tempRecord = new RecordCountWrapper();
                if(objectName == 'Task'){
                    tempRecord.ObjectName = 'Activity';
                }
                else if(objectName == 'Event'){
                    continue;
                }
                else{
                    tempRecord.ObjectName = objectName;
                }
                tempRecord.OwnerId = eachUserId;
                tempRecord.RecordCount = 0;
                tempRecord.OwnerName = mappedDormantUsers.get(eachUserId);
                if(!toPass.containsKey(eachUserId)){
					List<RecordCountWrapper> newTempList = new List<RecordCountWrapper>();
                	newTempList.add(tempRecord);  
                    toPass.put(eachUserId, newTempList);
                }
                else{
                    List<RecordCountWrapper> tempList = toPass.get(eachUserId);
                    tempList.add(tempRecord);
                    toPass.put(eachUserId, tempList);
                }
            }  
            
			//Quering the data for checking if the user has any records on the above objects...
            for(AggregateResult ar: Database.query(query)){
                calledUsers.add((Id)ar.get('OwnerId'));
                List<RecordCountWrapper> currentList = toPass.get((Id)ar.get('OwnerId'));
                if(objectName=='Task' || objectName=='Event'){
                    currentList[currentList.size()-1].RecordCount += (Integer)ar.get('RecordCount');
                }
                else{
                	currentList[currentList.size()-1].RecordCount = (Integer)ar.get('RecordCount');
                }
    		}
        }
        return toPass;
    }
    
    @AuraEnabled
    public static List<User> getSuggestedUsers(List<String> dormantUserDetail){
        System.debug(dormantUserDetail);
        Id dormantUserId  = (Id)JSON.deserialize(dormantUserDetail[0] , Id.class);
        User dormantUser = [SELECT ProfileId FROM User WHERE Id =: dormantUserId LIMIT 1];
        List<User> suggestedUsers = [SELECT Name FROM User WHERE IsActive = true AND  ProfileId =: dormantUser.ProfileId];
        return suggestedUsers;
    }
    
    public class RecordCountWrapper{
        @AuraEnabled
        public Id OwnerId{get; set;}
        @AuraEnabled
        public String OwnerName{get; set;}
        @AuraEnabled
        public String ObjectName{get; set;}
        @AuraEnabled
        public Integer RecordCount{get; set;}
    }
      
    
        public class UserObj{
        @AuraEnabled public String FirstName;
        @AuraEnabled public String LastName;
        @AuraEnabled public string Username;
        @AuraEnabled public string Email;
        @AuraEnabled public String Alias;
        @AuraEnabled public String ProfileId;
        @AuraEnabled public String CommunityNickname;
        @AuraEnabled public String UserRoleId;
        @AuraEnabled public String TimeZoneSidKey;
        @AuraEnabled public String LocaleSidKey;
        @AuraEnabled public String EmailEncodingKey;
        @AuraEnabled public String LanguageLocaleKey;
    }
}