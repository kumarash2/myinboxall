sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("zinboxall.controller.InitialView", {
            onInit: function () {
             
                var self = this;
                $.ajax({
                   // url: self._getRuntimeBaseURL() + "/TaskCollection/v1/xsrf-token",
                 //  url: self._getRuntimeBaseURL() + "workflow-service/odata/v1/tcm/TaskCollection/$count?$filter=Status eq 'READY' or Status eq 'RESERVED'",
                  url:  self._getRuntimeBaseURL() +"bpmworkflowruntime/odata/v1/tcm/TaskCollection/$count/?$filter=((Status eq 'READY' or Status eq 'RESERVED' or Status eq 'IN_PROGRESS' or Status eq 'EXECUTED')",
                 method: "GET",
                    async: false,
                    // headers: {
                    //     "X-CSRF-Token": "Fetch"
                    // },
                    
                    success: function (result, xhr, data) {
                        debugger;
                       // token = data.getResponseHeader("X-CSRF-Token");
                        // $.ajax({
                        //     type: "POST",
                        //     contentType: "application/json",
                        //     headers: {
                        //         "X-CSRF-Token": token
                        //     },
                        //     url: self._getRuntimeBaseURL() + "/bpmworkflowruntime/v1/workflow-instances",
                        //     data: JSON.stringify({
                        //         definitionId: "InitializePurchaseRequisitionApprovalProcess",
                        //         context: RequestContent
                        //     }),
                        //     success: function (result2, xhr2, data2) {
                        //         // MessageToast.show("Workflow started with success");
                        //     },
                        //     error: function (err) {
                        //         MessageToast.show("Error submiting the request");
                        //     }
                        // });
                    }
                });

            },
            _getRuntimeBaseURL: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
               // var test = "124";
                return appModulePath;
            },
            press:function(oEvent){

                var key = oEvent.getSource().data().key,
                oRouter = sap.ui.core.UIComponent.getRouterFor(this);               
                oRouter.navTo("RouteDetailView",{key:key});
            }
        });
    });
