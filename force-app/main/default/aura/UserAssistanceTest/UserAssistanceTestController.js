({
    backToHome: function(component, event, helper){
        $A.get('e.force:refreshView').fire();
    },
    
    fetchLicenseList: function(component, event, helper){
        var action = component.get('c.getLicenseList');
        action.setParams({});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                result.forEach(function(item){
                item.remainingLicense= item.TotalLicenses-item.UsedLicenses;
                });
                console.log(result);
                component.set('v.licenceListData', result);
            }
            component.set('v.globalSpinner', false);
        });
        $A.enqueueAction(action);
    },
    
    onClickNewUserButton: function(component, event, helper){
        component.set('v.homePage', false);
		component.set('v.newUsersPage', true);        
    },

    getAlias: function(component,event,helper){
        var firstName= component.get("v.FirstName");
        var lastName= component.get("v.LastName");       
        var alias = helper.getAliashelper(firstName,lastName);        
        component.set("v.Alias",alias);
    },
    
    getNick: function(component,event,helper){
        var firstName= component.get("v.FirstName");
        var nick= helper.getNicknamehelper(firstName);
        component.set("v.CommunityNickname",nick);
    },

    submitDetails : function(component, event, helper) {
        component.set('v.isCloneTrue', true);
        component.set('v.isback',true);
        component.set("v.isLicenseList",false);
    },
    
    handleSuccess : function(component, event, helper) {
        var recordId = event.getParam('response').id;
        helper.openUserDetailsTab(component,recordId);
        helper.showToastMessage(component,"Record has been created.","Success!","success");
        $A.get('e.force:refreshView').fire();
    },
    
    handleError: function(component,event,helper){
        var error = event.getParams();
        console.log("Error : "+JSON.stringify(error));
        var errorMessage = event.getParam("detail");
        helper.showToastMessage(component,errorMessage,"Error!","error");
    },
    
    submitForm: function(component, event, helper){
        event.preventDefault();
        var emailValue= component.find('Email').get('v.value');
        var aliasValue= component.find('Alias').get('v.value');
        var lastNameValue= component.find('lastName').get('v.value');
        var nicknameValue= component.find('CommunityNickname').get('v.value');
        var profileIdValue= component.find('ProfileId').get('v.value');
        var usernameValue= component.find('Username').get('v.value');
        var encodingValue= component.find('EmailEncodingKey').get('v.value');
        if(emailValue==null ||aliasValue==null||lastNameValue==null||nicknameValue==null||profileIdValue==null||usernameValue==null||encodingValue==null){
            helper.showToastMessage(component,"Provide input For required fields.","Error!","error");
        }else{
            component.find("recordEditform").submit();
        }
    },
    
    closeModal: function(component, event, helper) {
        component.set('v.homePage', true);
        component.set('v.newUsersPage', false);
        
    },
    
    onClickCloneUserButton: function(component, event, helper){
        component.set('v.homePage', false);
        component.set('v.cloneUsersPage', true);
        component.set('v.cloneUsersPage', true);
        
    },
    
    searchExistingUser: function(component, event, helper){
        var searchKey = component.find("cloneUserSearchField").get("v.value");
        component.set("v.FirstName",null);
        component.set("v.LastName",null);
        component.set("v.Email",null);
        component.set("v.Username",null);
        component.set("v.CommunityNickname",null);
        component.set("v.Alias",null);
        if(searchKey==""||searchKey==null){
            helper.showToastMessage(component,"Please enter email.","Error!","error");
           
        }else if(searchKey!=null){
            
            var isCorrect = false;
            const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isCorrect=emailCheck.test(searchKey);
            if(isCorrect==false){
                helper.showToastMessage(component,"Please enter valid email.","Error!","error");
            }else{
                //component.set("v.searchkeywordValue",searchKey);
                var action= component.get("c.fetchUserToClone");
                action.setParams({
                    'searchKeyword': searchKey
                });
            }
        }
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                //component.set("v.goforClonesearch",false);
                var storeResponse = response.getReturnValue();
                console.log(storeResponse);
                if(storeResponse.length == 0){
                    helper.showToastMessage(component,"No record found.","Error!","error");
                }else if(storeResponse.length >= 1){
                    //component.set("v.TotalNumberOfRecord", storeResponse.length);
                    //component.set("v.searchResult",storeResponse );
                    component.set("v.hasRecord",true);
                    component.set("v.Profilename",storeResponse[0].Profile.Name);
                    component.set("v.EmailEncodingKey",storeResponse[0].EmailEncodingKey);
                    component.set("v.ProfileId",storeResponse[0].ProfileId);
                    component.set("v.IsActive",storeResponse[0].IsActive);
                    component.set("v.TimeZoneSidKey",storeResponse[0].TimeZoneSidKey);
                    component.set("v.LocaleSidKey",storeResponse[0].LocaleSidKey);
                    component.set("v.LanguageLocaleKey",storeResponse[0].LanguageLocaleKey);
                    component.set("v.UserRoleId",storeResponse[0].UserRoleId);
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    cloneUserButton: function(component, event, helper){
        let cUser={};
        cUser.FirstName=component.get("v.FirstName");
        cUser.LastName= component.get("v.LastName");
        cUser.Email= component.get("v.Email");
        cUser.Username= component.get("v.Username");
        cUser.CommunityNickname= component.get("v.CommunityNickname");
        cUser.Alias= component.get("v.Alias");
        cUser.EmailEncodingKey= component.get("v.EmailEncodingKey");
        cUser.ProfileId= component.get("v.ProfileId");
        cUser.TimeZoneSidKey= component.get("v.TimeZoneSidKey");
        cUser.LocaleSidKey= component.get("v.LocaleSidKey");
        cUser.LanguageLocaleKey= component.get("v.LanguageLocaleKey");
        cUser.UserRoleId=component.get("v.UserRoleId");
        var searchKey = component.find("cloneUserSearchField").get('v.value');
        console.log("print"+JSON.stringify(cUser));
        
        if(cUser.LastName == undefined ||cUser.Email == undefined ||cUser.Username == undefined||cUser.CommunityNickname == undefined){
            helper.showToastMessage(component,"Fill the required fields.","Error!","error");
        }else if(cUser.Alias == undefined){
            helper.showToastMessage(component,"Alias is required.","Error!","error");
        }else{
            var action= component.get("c.updatePermissionset");
            action.setParams({
                userWrapper:JSON.stringify(cUser),
                'searchKeyword': searchKey
            });
            //component.set("v.goforClone",true);
            var spinner = component.find("mySpinner");
            $A.util.toggleClass(spinner, "slds-hide");
            action.setCallback(this,function(response){
                var state = response.getState();
                if(state === "SUCCESS"){
                    //component.set("v.goforClone",false);
                    //component.set('v.isCloneTrue',false);
                    var Responseval = response.getReturnValue();
                    if(Responseval=="0"){
                        helper.showToastMessage(component,"Username or Nickname already exist.","Error!","error");
                    }else{
                        var recordId=Responseval;
                        helper.openUserDetailsTab(component,recordId);
                        helper.showToastMessage(component,"User successfully cloned.","Success!","success");
                        $A.get('e.force:refreshView').fire();
                    }
                }else if(state==="ERROR"){
                    //component.set("v.isConfirm",false);
                    //component.set("v.goforClone",false);
                    var errors = response.getError();
                    var messages=errors[0].message;
                    var msg;
                    if(messages.includes('The username already exists in this or another Salesforce organization')){
                        msg='The username already exists in this or another Salesforce organization';
                    }else if(messages.includes('LICENSE_LIMIT_EXCEEDED')){
                        msg='LICENSE_LIMIT_EXCEEDED';
                    }else if(messages.includes('FIELD_INTEGRITY_EXCEPTION')){
                        msg='FIELD_INTEGRITY_EXCEPTION, Inactive User';
                    }
                    helper.showToastMessage(component,msg,"Error!","error");
                }
                
            });
            $A.enqueueAction(action);
        }
    },
    
    closeModalCloneUser: function(component, event, helper){
        component.set('v.hasRecord', false);
    },
    
    onClickDeactivateUserButton: function(component, event, helper){
        component.set('v.globalSpinner', true);
        var action = component.get('c.getActiveUsers');
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var activeUsers=response.getReturnValue();
                activeUsers=response.getReturnValue();
                activeUsers.forEach(function(user) {
                    user.IsActive = user.IsActive ? 'Active' : 'Inactive';
                });
            }
            component.set('v.activeUsersList', activeUsers);
            component.set('v.globalSpinner', false);
        });
        $A.enqueueAction(action);
        component.set('v.deactivateUsersPage', true);
        component.set('v.homePage', false);
    },
    
    //When back button of deactivate users is clicked
    backButtonDeactivatePage: function(component, event, helper){
        component.set('v.deactivateUsersPage', false);
        component.set('v.homePage', true);
    },
    
    searchByLoggedInMonth: function(component, event, helper){
        component.set('v.isRenderPieChart', false);
        component.set('v.isClickActiveUsers', false);
        component.set('v.isClickDormantUsers', false);
        component.set('v.showRelatedList', false);
        var selectedOption = component.find("notLoggedInOptions").get('v.value');

        var action = component.get('c.getDormantUsers');
        action.setParams({selectedMonth : selectedOption});
        action.setCallback(this,function(response){
            var state = response.getState();
            var users=[];
            if(state === "SUCCESS"){
                users=response.getReturnValue();
                users.forEach(function(user) {
                    user.IsActive = user.IsActive ? 'Active' : 'Inactive';
                });
            }
            console.log(users);
            component.set('v.dormantUsersList', users);
            component.set('v.isRenderPieChart', true);
        });
        $A.enqueueAction(action);      
    },
    

    renderChart : function(component, event, helper) { 
        var dormantUsers = component.get("v.dormantUsersList").length;
        var activeUsers = component.get("v.activeUsersList").length;
        var temp = [];
        temp.push(activeUsers);
        temp.push(dormantUsers);
        helper.createPieChart(component, temp);
    },
    
    selectedRowsData: function(component, event, helper){
        component.set('v.hideDeactivateMain', false);
        component.set('v.showRelatedList', false);
        var dormantUserCurr = component.get('v.dormantUsersList');
        var selectedRowDataCurr = event.getParam('selectedRows');
        console.log(selectedRowDataCurr[0].Id);
        for(var each in dormantUserCurr){
            console.log(dormantUserCurr[each].Id);
        }
        var dormantPrevious = component.get('v.dormantPreviousLength');
        var selectedRowDataPrev = component.get('v.selectedDormantUsers');
        component.set('v.selectedDormantUsers', selectedRowDataCurr); 
        if(dormantUserCurr.length < dormantPrevious){
            component.set('v.isRenderPieChart', true);
            if(selectedRowDataCurr.length == selectedRowDataPrev.length){
                component.set('v.isClickDormantUsers', false);
                component.set('v.dormantPreviousLength', dormantUserCurr.length);
                component.set('v.hideDeactivateMain', true);
            }
            else if(selectedRowDataCurr.length < selectedRowDataPrev.length){
                component.set('v.hideDeactivateMain', true);
            	component.set('v.showRelatedList', true);
            }
            component.set('v.isClickDormantUsers', true);
        }
        
        if(selectedRowDataCurr.length == 0){
            component.set('v.hideDeactivateMain', true);
            component.set('v.showRelatedList', false);
        }
    },
    
    onClickDeactivateButton : function(component, event, helper){
		var selectedDormantUsers = component.get('v.selectedDormantUsers');
        var dormantUsers = component.get('v.dormantUsersList');
        component.set('v.dormantPreviousLength', dormantUsers.length);
        const dormantUserMap = new Map();
        for(var each in selectedDormantUsers){
			dormantUserMap.set(selectedDormantUsers[each].Id, selectedDormantUsers[each].Name);
        }
        const obj = Object.fromEntries(dormantUserMap);
        const json = JSON.stringify(obj);
        var action = component.get('c.displayRelatedRecords');
        action.setParams({dormantUserMap: json});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state==="SUCCESS"){
                var result=response.getReturnValue();
                var keys = [];
                for(var key in result){
                    keys.push(key);
                }
                if(dormantUserMap.size > keys.length){
                    
                    for(var each in keys){
                        dormantUserMap.delete(keys[each]);
                    }
                    
                    for(var each in dormantUsers){
                        if (dormantUserMap.has(dormantUsers[each].Id)) {
                            dormantUsers.splice(each, 1);
                        }
                    }
                    component.set('v.isRenderPieChart', false);
                    component.set('v.dormantUsersList', dormantUsers);
                    var userString = '';
                    for(var each of dormantUserMap.values()){
                        userString += each;
                        userString +=',';
                    }
                    userString.slice(0, userString.length-1);
                    var msg = "User " + userString + "have been deactivated successfully";
                    helper.toastMessage(component,"Success!", msg, "success", "dismissible", "2000ms");
                }
            }
            //Setting all the required variables in the aura component...
            component.set('v.relatedRecordsColumns', [{label: 'Owner Name', fieldName: 'OwnerName', type: 'text', initialWidth: 460},
                                                      {label: 'Object Name', fieldName: 'ObjectName', type: 'text', initialWidth: 250},
                                                      {label: 'Active Record', fieldName: 'RecordCount', type: 'text', initialWidth: 250},
                                                      {label: 'Change Owner', type: 'button', initialWidth: 250, typeAttributes:
                                                       {label: 'Change Owner', name: 'view_details', title: 'Click here to Change the Owner', disabled:{fieldName:'disabled'}}}]);
            var currentKey = keys[0];
            component.set('v.currentKeyIndex', 0);
            component.set('v.keysList', keys);
            helper.disableOwnerChangeButton(component, result);
            component.set('v.usersWithRelatedRecords', result);
            component.set('v.showRelatedList', true);
            component.set('v.hideDeactivateMain', true);
            console.log(component.get('v.showRelatedList'));
            component.set('v.disableNext', keys.length-1);
        });
        $A.enqueueAction(action);        
    },
    
    previousRecord: function(component, event, helper){
        var keys=component.get('v.keysList');
        var newKeyIndex = component.get('v.currentKeyIndex')-1
        var newKey = keys[newKeyIndex];
        var usersList = component.get('v.usersWithRelatedRecords');
        usersList = usersList[0];
        component.set('v.currentKeyIndex', newKeyIndex);
        helper.disableOwnerChangeButton(component, usersList);
    },
    
    nextRecord: function(component, event, helper){
        var keys=component.get('v.keysList');
        var newKeyIndex = component.get('v.currentKeyIndex')+1
        var newKey = keys[newKeyIndex];
        var usersList = component.get('v.usersWithRelatedRecords');
        usersList = usersList[0];
        component.set('v.currentKeyIndex', newKeyIndex);
        helper.disableOwnerChangeButton(component, usersList);
    },
    
    bulkOwnerChangeCheckBox: function(component, event, helper){
        component.set('v.bulkOwnerChangeConfirm', true);
    },
    
    handleBulkOwnerChange: function(component, event, helper){
        component.set('v.bulkOwnerChangeConfirm', false);
        var newOwner = component.get('v.ownerBulk');
        component.set('v.ownerBulk', null);
        var users = [];
        var currentUserRecord = component.get('v.currentUserRelated');
        users.push(currentUserRecord[0].OwnerId);
        users.push(newOwner);
        component.set('v.bulkOnwerChangeBox', false);
        var action=component.get('c.changeOwnerAllObjects');
        action.setParams({userLists: users});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state==="SUCCESS"){
                helper.refreshTable(component);
                var msg = "The ownership of the records has changed successfully."                
                helper.toastMessage(component, "Success!", msg, "success", "dismissible", "2000ms");
            }
        });
        $A.enqueueAction(action);
    },
    
    closeBulkOwnerChange: function(component, event, helper){
        component.set('v.bulkOwnerChangeConfirm', false);
    },
	
    bulkOwnerChangeDeactivate: function(component, event, helper){
        var currentUserRecord = component.get('v.currentUserRelated');
        var currentUserId = currentUserRecord[0].OwnerId;
        var dormantUsersList = component.get('v.dormantUsersList');
        component.set('v.dormantPreviousLength', dormantUsersList.length);
        var idList = [];
        idList.push(currentUserId);
        component.set('v.showRelatedList', false);
        var action = component.get('c.deactivateUser');
        action.setParams({userIds: idList});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state==="SUCCESS"){
                var result = response.getReturnValue();
                var keys=component.get('v.keysList');
                var index = component.get('v.currentKeyIndex');
                console.log(index);
                var usersList = component.get('v.usersWithRelatedRecords');
                usersList = usersList[0];
                delete usersList[keys[index]];
                component.set('v.isRenderPieChart', false);
                keys.splice(index, 1);
                console.log('keys', keys);
                dormantUsersList.splice(index,1);
                component.set('v.keysList', keys);
                component.set('v.usersWithRelatedRecords', usersList);
                component.set('v.dormantUsersList', dormantUsersList);
                console.log(dormantUsersList);
                if(keys.length == 0){
                    component.set('v.showRelatedList', false);
                }
                else{
                    component.set('v.currentUserRelated', usersList[keys[index]]);
                    
                    console.log('line 450', usersList[keys[index]]);
                    
                    component.set('v.showRelatedList', true);
                    component.set('v.disableNext', keys.length-1);
                }
                
            }
            //IF THE OWNER IS SYSTEM ADMIN...
            else if(state==="ERROR"){
                var errors = response.getError();
                if(errors && errors[0] && errors[0].message){
                    var showError=errors[0].message;
                    helper.showToastMessage(component,"Change Owner Operation is not valid for this user type.","Error!","error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    individualOwnerChangeRowAction: function(component, event, helper){
        var row = event.getParam('row');
        component.set("v.rowActionVar", row);
        component.set('v.individualChangeBox', true);
    },
    
    individualOwnerChangeCheck: function(component, event, helper){
        var newOwnerId = component.find("ownerNameIndividual").get("v.value");
        component.set('v.newOwnerId', newOwnerId);
        component.set('v.individualCheckBox', true);
        component.set('v.individualChangeBox', false);
    },
    
    individualOwnerChangeYes: function(component, event, helper){
        console.log("in changeOwnerIndividuallyYes");
        var row = component.get('v.rowActionVar');
        var newOwnerId = component.get('v.newOwnerId');
        var dormantUsers = component.get('v.dormantUsersList');
        var users = component.get('v.usersWithRelatedRecords');
        var passingValue = [];
        var currentRelated = component.get('v.currentUserRelated');
        passingValue.push(JSON.stringify(newOwnerId));
        passingValue.push(JSON.stringify(row[0].OwnerId));
        passingValue.push(row[0].ObjectName);
        var action = component.get("c.individualObjectOwnerChange");
        action.setParams({changeOwnerList : passingValue});
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log(state);
            component.set('v.individualCheckBox', false);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                helper.showToastMessage(component,"Owner of records of " + row[0].ObjectName + " object changed successfully","Success!","success");
                component.set('v.showRelatedList', false);
                helper.refreshTable(component);  
                component.set('v.showRelatedList', true);
            }
            else if(state === "ERROR"){
                helper.showToastMessage(component,"Change Owner Operation is not valid for this user type.","Error!","error");
            }
        });
        $A.enqueueAction(action);
    },
    
    closeModalEachChange: function(component, event, helper){
        component.set('v.individualCheckBox', false);
        component.set('v.individualChangeBox', false);
    },
    
     // Pagination functions starts here...
    previousPage: function(component, event, helper){
        var pageNumber = component.get("v.pageNumber");
        if(pageNumber > 1){
            component.set("v.pageNumber", pageNumber - 1);
            helper.updatePagination(component);
        }
    },
    
    nextPage: function(component, event, helper){
        var pageNumber = component.get("v.pageNumber");
        var totalPages = component.get("v.totalPages");
        if(pageNumber < totalPages){
            component.set("v.pageNumber", pageNumber + 1);
            helper.updatePagination(component);
        }
    },
    
    handleChangeRecordSize: function(component, event, helper){
        var selectedValue = component.find('recordsPerPage').get('v.value');
        component.set("v.pageSize", selectedValue);
        helper.updatePagination(component);
    },
    
    downloadDataActiveUsers: function(component, event, helper){
        var activeData = component.get("v.activeUsersList");
        var csv = helper.convertCsvActiveUsers(component,activeData); 
        if (csv == null){
            return;
        }
        // ####--code for create a temp. <a> html tag [link tag] for download the CSV file--####     
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_self'; // 
        hiddenElement.download = 'Active Users.csv';
        document.body.appendChild(hiddenElement); // Required for FireFox browser
        hiddenElement.click(); // using click() js function to download csv file
    },
    
    downloadDataDormantUsers: function(component, event, helper){
        var dormantData = component.get("v.dormantUsersList");
        var csv = helper.convertCsvActiveUsers(component,dormantData); 
        if (csv == null){
            return;
        }
        // ####--code for create a temp. <a> html tag [link tag] for download the CSV file--####     
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_self'; // 
        hiddenElement.download = 'Dormant Users.csv';
        document.body.appendChild(hiddenElement); // Required for FireFox browser
        hiddenElement.click(); // using click() js function to download csv file
    },
    
    getSuggestion: function(component, event, helper){
        component.set('v.suggestionBoxColumns', [
            {label:'Owner',fieldName: 'Name',type:'text'},
            {label: 'Select', type: 'button', initialWidth: 135, typeAttributes: { label: 'Select', name: 'Select', title: 'Click to View Details'}}
            
        ]);
        var activeUsers=component.get("v.activeUsersList");
       	var getSelected=component.get("v.rowActionVar");
        var selectedOwnerId = JSON.stringify(getSelected[0].OwnerId);
        var objectName = JSON.stringify(getSelected[0].ObjectName);
        var toPass = [];
        toPass.push(selectedOwnerId);
        toPass.push(objectName);
        console.log(toPass);
        var action = component.get('c.getSuggestedUsers');
        action.setParams({dormantUserDetail : toPass});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(response.getState()=== "SUCCESS"){
                var result=response.getReturnValue();
                if(result.length>0){
                    component.set("v.suggestionBoxData",response.getReturnValue());
                    component.set("v.suggestionBox",true);
                }
                else{
                    component.set("v.suggestionBox",false);
                    helper.showToastMessage(component,"There is no other User having same R&R. Please select from the Select Owner search.","Warning!","warning");
                    
                }
            }
        });
        $A.enqueueAction(action);
        
        
    },
    suggestionBoxRowAction: function(component, event, helper) {
        var row = event.getParam('row');
        var inputField = component.find('ownerNameIndividual');
        inputField.set('v.value', row.Id);
        component.set("v.suggestionBox",false);
    },
        
    closeSuggestionBox:function(component,event,helper){
        component.set("v.suggestionBox",false);
    },
    
})