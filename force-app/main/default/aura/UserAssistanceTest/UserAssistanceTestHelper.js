({
createPieChart : function(component, temp) {
        Chart.register(ChartDataLabels);
		var label = ['Active Users', 'Dormant Users'];
        var firstValue = [];
        var secondValue = ['rgba(70,130,180)', 'orange'];
        for(var a=0; a<temp.length; a++){
            if(temp[a] != 0){
            	firstValue.push(temp[a]);
            }
            else{
                firstValue.push(null);
            }
        }
        this.updatePagination(component);
        var el = component.find('pieChart').getElement();
        var ctx = el.getContext('2d');
        var pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: label,
                datasets: [{
                    label: 'Users',
                    data: firstValue,
                    backgroundColor: secondValue,
                    borderColor: 'white',
                    borderWidth: function(context){
                        if(context.dataset.data[1]){
                            return 1;
                        }
                        else{
                            return 0;
                        }
                    }
                }]
            },
            options:{
                layout:{
                    padding:{
                        right: 50,
                    }
                },
                plugins: {
                    legend:{
                        display: true,
                        position: 'right',
                        labels:{
                            boxWidth: 20,
                            padding: 15,
                            }
                    },
                    datalabels :{
                    	color: 'white',
                        font: {
                            weight: 'bold'
                        },
                        anchor: function(context){
                            if(context.dataset.data[1]){
                                return 'center';
                            }
                            else{
                                return 'start';
                            }
                        },
                	}
                },               
                onClick: function(event){
                    var activePoints = pieChart.getElementsAtEventForMode(event, 'nearest', {intersect: true}, true);
                    if(activePoints.length > 0){
                        var clickedElementIndex = activePoints[0];
                        var datasetIndex = clickedElementIndex.index;
                        var index = clickedElementIndex.index;
                        var label = pieChart.data.labels[index];
                        if(label == 'Dormant Users'){
                            component.set('v.isClickDormantUsers', true);
                            component.set('v.isClickActiveUsers', false);
                        }
                        else if(label == 'Active Users'){
                            component.set('v.isClickActiveUsers', true);
                            component.set('v.isClickDormantUsers', false);
                            component.set('v.showRelatedList', false);
                            
                        }
                        
                    }
            	},
            },
        });
	},
    
    toastMessage:function(component, title, message, mode, type, duaration){
    	var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": title,
                "message": message,
                "mode": mode,
                "type": type,
                "duaration": duaration,
            });
            toastEvent.fire();
	},
    
    openUserDetailsTab:function(component,recordId){
        var url='/lightning/r/User/'+recordId +'/view/';
		window.open(url,'_blank');
    },
    
    getAliashelper: function(firstName,lastName){
        console.log("in helper");
        var alias='';
        if(firstName && lastName){
            alias=(firstName.substring(0,3)+lastName.substring(0,2)).toLowerCase();
            console.log("in helper if");
            while(alias.length<6){
                alias += String.fromCharCode(97+Math.floor(Math.random()*26));
            }
        }
        return alias;
    },
    
    getNicknamehelper: function(firstName){
        console.log("in helper");
        var nickname='';
        if(firstName){
            nickname=firstName+Math.floor(Math.random()*26);
        }
        return nickname;
    },
    
    showToastMessage:function(component,msg,title,type){
    	var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": title,
                "type":type,
                "message": msg
            });
            toastEvent.fire();
	},
    
    refreshTable: function(component){
        var dormantUsers = component.get('v.selectedDormantUsers');
        const dormantUserMap = new Map();
        for(var each in dormantUsers){
			dormantUserMap.set(dormantUsers[each].Id, dormantUsers[each].Name);
        }
        const obj = Object.fromEntries(dormantUserMap);
        const json = JSON.stringify(obj);
        var action = component.get('c.refreshRecordsTable');
        action.setParams({dormantUserMap: json});
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state==="SUCCESS"){
                var result=response.getReturnValue();
                this.disableOwnerChangeButton(component, result);
                component.set('v.usersWithRelatedRecords', result);
            }
        });
        $A.enqueueAction(action);
    },
    
    disableOwnerChangeButton: function(component, result){
        var keys = component.get('v.keysList');
        var currentKey = keys[component.get('v.currentKeyIndex')];
        component.set('v.bulkOnwerChangeBox', false);
        result[currentKey].forEach(function(row){
            if(row.RecordCount == 0){
                row.disabled= true;
            }
            else{
                component.set('v.bulkOnwerChangeBox', true);
            }
        });
        component.set('v.currentUserRelated', result[currentKey]);
    },
    
    refreshPieChart: function(component){
        
    },
     
    updatePagination: function(component){
        var totalRecords = component.get("v.activeUsersList");
        var pageNumber = component.get("v.pageNumber");
        var pageSize = component.get("v.pageSize");       
        var totalPages = Math.ceil(totalRecords.length / pageSize);
        component.set("v.totalPages", totalPages);
        var startIndex = (pageNumber - 1) * pageSize;
        var endIndex = pageNumber * pageSize;
        var paginatedRecords = totalRecords.slice(startIndex, endIndex);
        component.set("v.paginatedActiveUsers", paginatedRecords);
    },
    
        // CSV of Active Users
    convertCsvActiveUsers: function(component, objectRecords){
        var csvStringResult, counter, keys, columnDivider, lineDivider;
        if (objectRecords == null || !objectRecords.length) {
            return null;
        }
        columnDivider = ',';
        lineDivider =  '\n'; 
        keys = ['FirstName', 'LastName', 'Email', 'LastLoginDate', 'Status', 'InactiveDays'];
        csvStringResult = '';
        csvStringResult += keys.join(columnDivider);
        csvStringResult += lineDivider;
        for(var i=0; i < objectRecords.length; i++){   
            counter = 0;
            
            for(var sTempkey in keys) {
                var skey = keys[sTempkey] ;
                if(counter > 0){ 
                    csvStringResult += columnDivider; 
                }
                csvStringResult += '"'+ objectRecords[i][skey]+'"'; 
                counter++;
            }
            csvStringResult += lineDivider;
        } 
        return csvStringResult;        
    },
    
})