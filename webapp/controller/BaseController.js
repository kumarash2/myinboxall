
sap.ui.define(
    ["sap/ui/core/mvc/Controller", 'sap/m/MessageBox',
        'sap/m/MessageToast', "sap/ui/core/routing/History", "sap/ui/model/odata/ODataModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/json/JSONModel"],
    function (Controller, MessageBox, MessageToast, History, ODataModel, Filter, FilterOperator, JSONModel) {
        "use strict";
        return Controller.extend("zprcreatenew.controller.BaseController", {
            onWorkflow: function (prno) {
                var RequestContent = {
                    PurchaseRequest: {}
                };
                // var sRequisitionNumber = Context.Request.BAPI_REQUISITION_GETDETAIL.NUMBER;
                RequestContent.PurchaseRequest = { "DocumentId": prno };
                RequestContent.PurchaseRequest.Requestor = { "UniqueId": "pphani@penguinrandomhouse.co.uk", "Email": "pphani@penguinrandomhouse.co.uk", "Name": "Phani Pooja" };//sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                var token;
                var self = this;
                $.ajax({
                    url: self._getRuntimeBaseURL() + "/bpmworkflowruntime/v1/xsrf-token",
                    method: "GET",
                    async: false,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    success: function (result, xhr, data) {
                        token = data.getResponseHeader("X-CSRF-Token");
                        $.ajax({
                            type: "POST",
                            contentType: "application/json",
                            headers: {
                                "X-CSRF-Token": token
                            },
                            url: self._getRuntimeBaseURL() + "/bpmworkflowruntime/v1/workflow-instances",
                            data: JSON.stringify({
                                definitionId: "InitializePurchaseRequisitionApprovalProcess",
                                context: RequestContent
                            }),
                            success: function (result2, xhr2, data2) {
                                // MessageToast.show("Workflow started with success");
                            },
                            error: function (err) {
                                MessageToast.show("Error submiting the request");
                            }
                        });
                    }
                });
            },

            _getRuntimeBaseURL: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var test = "124";
                return appModulePath;
            },

            onValueHelp: function () {
                var ErrCount = 0;
                var valmodel = this.getOwnerComponent().getModel("valuehelp");
                this.getOwnerComponent().errormsg = "";
                var that = this;
                valmodel.attachRequestFailed(function (e) {
                    var cnt = e.getSource().oMessageParser._lastMessages.length;
                    var errmsg = e.getSource().oMessageParser._lastMessages[cnt - 1].message;

                    ErrCount++;
                    if (that.getOwnerComponent().errormsg !== errmsg) {
                        that.getOwnerComponent().errormsg = errmsg;
                        sap.m.MessageBox.error(errmsg, {
                            title: "Error",
                            onClose: function (oAction) {
                                that.getOwnerComponent().errormsg = "";
                                errmsg = "";
                            }
                        });
                        return;
                    }
                });
            },
            onCodingDetail: function (oEvent) {
                if (oEvent.getSource().getProperty("text") === "Enter Coding Detail") {
                    var function1 = "";
                    if (this.getView().byId("PRType").getSelectedKey() !== "CreateMulPr") {
                        function1 = this._fnrequiredinput1();
                    } else {
                        function1 = this._fnrequiredinput();
                    }
                    var valid = this.fnrequiredInputValidation(function1, this);
                    //valid = true;
                    if (!valid) {
                        this.fnMessageBox("ERROR", MessageBox.Icon.ERROR, "Please enter the mandatory fields");
                        //  MessageToast.show("Mandatory fields are missing");
                        return;
                    }
                }
                this.Coding = sap.ui.xmlfragment("zprcreatenew.Fragment.Coding", this);
                this.getView().addDependent(this.Coding);
                this.Coding.open();
                var that = this;
                sap.ui.getCore().byId("idReqItemNo").attachBrowserEvent("click", function (oEvent) {
                    that.getOwnerComponent().lastlinekey = sap.ui.getCore().byId("idReqItemNo").getSelectedKey();
                });
                this.getOwnerComponent().lastlinekey = "";
                this.getOwnerComponent().plants = "";
                this.getOwnerComponent().accountassign = "";
                // this.fnValueHelpDialogOpen1(oEvent, this.Coding, "Coding", this, "x");
                this.onFillLineItemData();
                this.fillReqCoding();
                this.fillcurrency();
                this.fillMeasure();
            },




            fillcurrency: function (oEvent) {
                var oMdl = this.getOwnerComponent().getModel("valuehelp");
                oMdl.read("/CurrencySet", {
                    success: function (oData) {
                        var oModel = new sap.ui.model.json.JSONModel(oData);
                        sap.ui.getCore().setModel(oModel, "CurrModel");
                        this.getView().setModel(oModel, "CurrModel");
                    }.bind(this),
                    error: function (oError) {
                        console.log(oData);
                    }.bind(this)
                });
            },

            fillReqCoding: function (oEvent) {
                var oMdl = this.getOwnerComponent().getModel("valuehelp");
                oMdl.read("/AccountACatSet", {
                    success: function (oData) {
                        var oModel = new sap.ui.model.json.JSONModel(oData);
                        sap.ui.getCore().setModel(oModel, "ReqModel");
                        this.getView().setModel(oModel, "ReqModel");
                    }.bind(this),
                    error: function (oError) {
                        console.log(oData);
                    }.bind(this)
                });
            },

            fillMeasure: function (oEvent) {
                var oMdl = this.getOwnerComponent().getModel("valuehelp");
                oMdl.read("/UOMSet", {
                    success: function (oData) {
                        var oModel = new sap.ui.model.json.JSONModel(oData);
                        sap.ui.getCore().setModel(oModel, "MeasureHelp");
                        this.getView().setModel(oModel, "MeasureHelp");
                    }.bind(this),
                    error: function (oError) {
                        console.log(oData);
                    }.bind(this)
                });
            },

            onAttachment: function (oEvent) {
                //window attachment
                if (!window._AttachPopover) {
                    window._AttachPopover = sap.ui.xmlfragment("zprcreatenew.Fragment.Attachments", this);
                  /*  var oModel = new sap.ui.model.json.JSONModel([]);
                    sap.ui.getCore().setModel(oModel, "PRAttachModel");*/
                }
                var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
                var url2 = url1.split("..");
                var obj = {
                    url: url2[1]
                }
                var oModel = new sap.ui.model.json.JSONModel(obj);
                sap.ui.getCore().setModel(oModel, "AttUrl");
                window._AttachPopover.open();
                if (sap.ui.getCore().byId("UploadCollection1")) {
                    var oUploadCollection1 = sap.ui.getCore().byId("UploadCollection1");
                    oUploadCollection1.setProperty("uploadUrl", url2[1]);

                }
            },

            onAttachment1: function (oEvent) {
                if (window._AttachPopover) {
                    window._AttachPopover.open();
                } else {
                    this.onAttachment();
                }
            },

            onAttClose: function (oEvent) {
                this.Attachment = sap.ui.getCore().byId("UploadCollection");
                window._AttachPopover.close();
                if(this.getOwnerComponent().getRouter().getView("zprcreatenew.view.PRPreview")){
                    this.getOwnerComponent().getRouter().getView("zprcreatenew.view.PRPreview").byId("arrLeft11222").setText(sap.ui.getCore().byId("UploadCollection").getItems().length);
                }
                
            },
            onCheckOpenAttachment: function (oEvent) {
                this.AttDestroy();
                window._AttachPopover = undefined;
            },
            onAttpress: function (oEvent) {
                var data = oEvent.getSource().getBindingContext("PRAttachModel").getObject();
                var filter = '/AttachmentSet(ObjectId=' + "'" + data.ObjectId + "'" + ',ObjectType=' +
                    "'" + data.ObjectType + "'" + ')' + '/$value';
                var URL = "";
                var html = new sap.ui.core.HTML();
                var AttMdl = this.getOwnerComponent().getModel("attachment");
                var w = window.open(this._getRuntimeBaseURL() + "/sap/opu/odata/sap/ZP2P_ATTACHMENT_SRV" + filter, '_blank');

                //   var w = window.open(isProxy + "/sap/opu/odata/sap/ZP2P_ATTACHMENT_SRV/"+filter , '_blank');
                //if (w == null) {
                //MessageBox.warning(oBundle.getText("Error.BlockedPopUp"));
                //}
                //   var AttMdl = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZP2P_ATTACHMENT_SRV/", true);
                AttMdl.read(filter, {
                    success: function (oData, response) {
                        var oA = document.createElement("a");
                        var URL = response.requestUri;
                        //html.setContent("<iframe src=" + URL + " width='700' height='700'></iframe>");
                        //html.placeAt("content");
                        //  html.setContent("<iframe src=" + URL + " width='700' height='700'></iframe>");

                        /*var windows = window.open("", "My PDF", " width='700' height='700'");
                        
                        windows.document.write(html);
                        
                        windows.print();
                        
                        windows.close();*/
                        // var oWindow = window.open(URL, "_blank");
                        /*   oA.href = URL;
                           oA.target = "_blank";
                           oA.style.display = "none";
                           document.body.appendChild(oA);
                           oA.click();
                           document.body.removeChild(oA);*/

                        //window.open(URL);
                    }.bind(this),
                    error: function (oError, data, response) {
                        console.log(oError);
                    }.bind(this)
                });
            },
            onAttDelete: function (oEvent) {
                var data = oEvent.getSource().getBindingContext("PRAttachModel").getObject();
                // var DocumentId = data.DocumentId;
                var AttMdl = this.getOwnerComponent().getModel("attachment");
                var filter = '/AttachmentSet(ObjectId=' + "'" + data.ObjectId + "'" + ',ObjectType=' +
                    "'" + data.ObjectType + "'" + ')' + '/$value';
                AttMdl.remove(filter, {
                    success: function (oData) {
                        var msg = "Attachment has been deleted successfully";
                        sap.m.MessageBox.success(msg, {
                            title: "Success",
                        });
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }.bind(this)
                });
                // var objtype = "ZP2P_PR";
                var aFilters = [];
                aFilters.push(new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, data.DocumentId));
                aFilters.push(new sap.ui.model.Filter("ObjectType", sap.ui.model.FilterOperator.EQ, data.ObjectType));
                var AttMdl = this.getOwnerComponent().getModel("attachment");
                AttMdl.read("/AttachmentSet", {
                    filters: aFilters,
                    success: function (oData) {
                        var oModel = new sap.ui.model.json.JSONModel(oData);
                        if (oData) {
                            if (oData.results) {
                                var cnt = oData.results.length;
                                if (this.getView().byId("arrLeft11222")) {
                                    this.getView().byId("arrLeft11222").setText(cnt);
                                }
                            }
                        }
                        //this.getView().setModel(oModel, "PRPreviewModel");
                        sap.ui.getCore().setModel(oModel, "PRAttachModel");
                    }.bind(this),
                    error: function (oError) {
                        console.log(oData);
                    }.bind(this)
                });
            },
            onDeliveryAddress: function (oEvent) {
                this._DeliveryPopover = sap.ui.xmlfragment("zprcreatenew.Fragment.DeliveryLocation", this);
                this.getView().addDependent(
                    this.__DeliveryPopover);
                this._DeliveryPopover.open();
            },

            onDeliveryClose: function (e) {
                e.getSource().getParent().close();
                e.getSource().getParent().destroy();
                /*this._DeliveryPopover.close();
                this._DeliveryPopover.destroy();*/
            },

            ReqCodingChange: function (oEvent) {
                if (oEvent.getSource().getSelectedKey !== "") {
                    oEvent.getSource().setValueState("None");
                }
                this.getOwnerComponent().accountassign = oEvent.getSource().getSelectedKey();
                this.setCodingVisibility1(oEvent.getSource().getSelectedKey());
            },

            onFillLineItemData: function (type) {
                if (!this.getOwnerComponent().items) {
                    this.getOwnerComponent().items = [];
                }
                var flg = "";
                var oPRLineItemObj = {};
                var oPRHeaderObj = sap.ui.getCore().getModel("PRHeaderModel").getData();
                var that = this;
                if (this.getView().byId("createpage")) {
                    if (sap.ui.getCore().getModel("LineItemModel")) {
                        if (sap.ui.getCore().getModel("LineItemModel").getData().length > 0) {
                            var data = sap.ui.getCore().getModel("LineItemModel").getData();
                            var selectedobj = data.filter(function (oLineItem23) {
                                return oLineItem23.Bnfpo == that.getOwnerComponent().lineno;
                            });

                            if (selectedobj.length > 0) {

                            } else {
                                flg = "X";
                                var ab = this.getOwnerComponent().items.filter(function (oLineItem24) {
                                    return oLineItem24.Bnfpo == that.getOwnerComponent().lineno;
                                });
                                if (ab.length > 0) {

                                } else {
                                    var itemno = { Bnfpo: that.getOwnerComponent().lineno };
                                    that.getOwnerComponent().items.push(itemno);

                                }
                            }
                        }
                    }
                }

                if (this.getView().byId("previewpage")) {
                    if (this.getView().getModel("PRPreviewModel")) {
                        if (this.getView().getModel("PRPreviewModel").getData().HdrToItemNav.results.length > 0) {
                            if (!type) {
                                type = "No";
                            }
                            var data = this.getView().getModel("PRPreviewModel").getData();
                            if (data.Banfn !== "") {
                                if (this.newitem == "X") {
                                    var selectedobj = data.HdrToItemNav.results.filter(function (oLineItem23) {
                                        return oLineItem23.Bnfpo == that.getOwnerComponent().lineno;
                                    });
                                    if (selectedobj.length > 0) {
                                        this.newitem = "";
                                    } else {
                                        flg = "X";
                                    }
                                } else {
                                    var selectedobj = data.HdrToItemNav.results.filter(function (oLineItem23) {
                                        return oLineItem23.Bnfpo == that.getOwnerComponent().lineno;
                                    });
                                    if (selectedobj.length > 0) {

                                        // this.getOwnerComponent().Close =  
                                    } else {
                                        flg = "X";
                                        var ab = this.getOwnerComponent().items.filter(function (oLineItem24) {
                                            return oLineItem24.Bnfpo == that.getOwnerComponent().lineno;
                                        });
                                        if (ab.length > 0) {

                                        } else {
                                            var itemno = { Bnfpo: that.getOwnerComponent().lineno };
                                            that.getOwnerComponent().items.push(itemno);

                                        }

                                    }
                                }
                            } else {
                                var selectedobj = data.HdrToItemNav.results.filter(function (oLineItem23) {
                                    return oLineItem23.Bnfpo == that.getOwnerComponent().lineno;
                                });

                                if (selectedobj.length > 0) {

                                    // this.getOwnerComponent().Close =  
                                } else {
                                    flg = "X";
                                    var ab = this.getOwnerComponent().items.filter(function (oLineItem24) {
                                        return oLineItem24.Bnfpo == that.getOwnerComponent().lineno;
                                    });
                                    if (ab.length > 0) {

                                    } else {
                                        var itemno = { Bnfpo: that.getOwnerComponent().lineno };
                                        that.getOwnerComponent().items.push(itemno);

                                    }

                                }
                            }
                        }
                    }
                }

                if (this.getOwnerComponent().Close !== "X") {
                    if (flg !== "X") {
                        if (this.getView().byId("PRType").getSelectedKey() !== "CreateMulPr") {
                            if (sap.ui.getCore().getModel("PRLineItemModel")) {
                                var oPRItemObj = sap.ui.getCore().getModel("PRLineItemModel").getData();
                                if (oPRItemObj.length === "0") {
                                    this.getOwnerComponent().lineno = "10";
                                    LineArr = [];
                                } else {
                                    this.getOwnerComponent().lineno = parseInt(this.getOwnerComponent().lineno) + parseInt(10);
                                    // this.getOwnerComponent().lineno = LineItemPRLineModelNo.toString();
                                    if (!type) {
                                        if (isNaN(this.getOwnerComponent().lineno) === true || this.getOwnerComponent().lineno === "10") {

                                        } else {
                                            type = "No";
                                        }


                                    }
                                    this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                                    if (!this.getOwnerComponent().items) {
                                        this.getOwnerComponent().items = [];
                                    }
                                }
                            } else {
                                if (this.getOwnerComponent().lineno === "") {
                                    this.getOwnerComponent().lineno = "10";
                                    this.getOwnerComponent().items = [];
                                } else {
                                    this.getOwnerComponent().lineno = parseInt(this.getOwnerComponent().lineno) + parseInt(10);
                                    this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                                }
                            }
                            this.getOwnerComponent().items.push(oPRLineItemObj);
                        } else {
                            //  this.getOwnerComponent().lineno = "10";
                            if (sap.ui.getCore().getModel("PRLineItemModel")) {
                                var oPRItemObj = sap.ui.getCore().getModel("PRLineItemModel").getData();

                                if (oPRItemObj.length === "0") {
                                    this.getOwnerComponent().lineno = "10";
                                    //LineArr = [];
                                } else {
                                    this.getOwnerComponent().lineno = parseInt(this.getOwnerComponent().lineno) + parseInt(10);
                                    this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                                    var selectedobj = this.getOwnerComponent().items.filter(function (oLineItem) {
                                        return oLineItem.Bnfpo == that.getOwnerComponent().lineno;
                                    });
                                    if (selectedobj.length > 0) {
                                        // this.getOwnerComponent().items = [];
                                    } else {
                                        var obj = {};
                                        obj.Bnfpo = this.getOwnerComponent().lineno;
                                        that.getOwnerComponent().items.push(obj);
                                    }
                                }

                            } else {
                                this.getOwnerComponent().lineno = "10";
                                // this.getOwnerComponent().items = [];
                            }
                        }
                        if (this.getOwnerComponent().lineitem === "" || this.getOwnerComponent().lineitem === "0.00") {
                            if (oPRHeaderObj.Menge && oPRHeaderObj.Preis) {
                                oPRHeaderObj.Rlwrt = oPRHeaderObj.Menge * oPRHeaderObj.Preis;
                                oPRHeaderObj.Rlwrt = parseFloat(oPRHeaderObj.Rlwrt).toFixed(2);
                                if (isNaN(oPRHeaderObj.Rlwrt) === true) {
                                    oPRHeaderObj.Rlwrt = 0;
                                }
                            }
                            this.getOwnerComponent().lineitem = oPRHeaderObj.Rlwrt;
                        } else {
                            oPRHeaderObj.Rlwrt = this.getOwnerComponent().lineitem;
                        }
                        if (oPRHeaderObj.HdrToItemNav && this.getOwnerComponent().lineno === "10") {
                            if (oPRHeaderObj.HdrToItemNav.results.length > 0) {
                                this.getOwnerComponent().lineno = parseInt(this.getOwnerComponent().lineno) + parseInt(10);
                                this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                            }
                        }

                        if (this.getOwnerComponent().lineno === 'NaN') {
                            this.getOwnerComponent().lineno = "10";
                        }
                    }
                    if (type === "No") {
                        oPRLineItemObj.Text = oPRHeaderObj.Text;
                        oPRLineItemObj.Elifn = oPRHeaderObj.Elifn;
                        oPRLineItemObj.Waers = oPRHeaderObj.Waers;
                        oPRLineItemObj.Bnfpo = this.getOwnerComponent().lineno;
                        oPRLineItemObj.Txz01 = "";
                        oPRLineItemObj.Text1 = "";
                        oPRLineItemObj.Menge = "";
                        oPRLineItemObj.Land1 = "";
                        oPRLineItemObj.Meins = "";
                        oPRLineItemObj.Preis = "";
                        oPRLineItemObj.Lfdat = "";
                        oPRLineItemObj.Knttp = "";;
                        oPRLineItemObj.Kostl = "";
                        oPRLineItemObj.Aufnr = "";
                        oPRLineItemObj.Prctr = "";
                        oPRLineItemObj.Bkgrp = "";
                        oPRLineItemObj.Zzempno = "";
                        oPRLineItemObj.Isbn = "";
                        oPRLineItemObj.Batch = "";
                        oPRLineItemObj.Matkl = "";
                        oPRLineItemObj.Banfn = "";
                        oPRLineItemObj.Rlwrt = oPRHeaderObj.Rlwrt;
                        oPRLineItemObj.Building = "";
                        oPRLineItemObj.Name1 = "";
                        oPRLineItemObj.Street = "";
                        oPRLineItemObj.PostCode = "";
                        oPRLineItemObj.City = "";
                        oPRLineItemObj.Land1 = "";
                        oPRLineItemObj.DelvAdrTyp = 0;
                        oPRLineItemObj.Sakto = "";
                        oPRLineItemObj.Werks = "";
                    } else {
                        oPRLineItemObj.Text = oPRHeaderObj.Text;
                        oPRLineItemObj.Elifn = oPRHeaderObj.Elifn;
                        // oPRLineItemObj.VendorName = oPRHeaderObj.VendorName;
                        oPRLineItemObj.Waers = oPRHeaderObj.Waers;
                        oPRLineItemObj.Bnfpo = this.getOwnerComponent().lineno;
                        oPRLineItemObj.Txz01 = oPRHeaderObj.Txz01;
                        oPRLineItemObj.Text1 = oPRHeaderObj.Text1;
                        oPRLineItemObj.Menge = oPRHeaderObj.Menge;
                        oPRLineItemObj.Land1 = oPRHeaderObj.Land1;
                        oPRLineItemObj.Meins = oPRHeaderObj.Meins;
                        oPRLineItemObj.Preis = oPRHeaderObj.Preis;
                        oPRLineItemObj.Lfdat = oPRHeaderObj.Lfdat;
                        oPRLineItemObj.Knttp = oPRHeaderObj.Knttp;
                        oPRLineItemObj.Kostl = "";
                        oPRLineItemObj.Aufnr = "";
                        oPRLineItemObj.Prctr = "";
                        oPRLineItemObj.Bkgrp = oPRHeaderObj.Bkgrp;
                        oPRLineItemObj.Zzempno = "";
                        oPRLineItemObj.Isbn = "";
                        oPRLineItemObj.Batch = "";
                        oPRLineItemObj.Matkl = oPRHeaderObj.Matkl;
                        oPRLineItemObj.Banfn = "";
                        oPRLineItemObj.Rlwrt = oPRHeaderObj.Rlwrt;
                        oPRLineItemObj.Building = oPRHeaderObj.Building;
                        oPRLineItemObj.Name1 = oPRHeaderObj.Name1;
                        oPRLineItemObj.Street = oPRHeaderObj.Street;
                        oPRLineItemObj.PostCode = oPRHeaderObj.PostCode;
                        oPRLineItemObj.City = oPRHeaderObj.City;
                        oPRLineItemObj.Land1 = oPRHeaderObj.Land1;
                        oPRLineItemObj.Werks = "";
                        oPRLineItemObj.DelvAdrTyp = 0;
                        /*  oPRLineItemObj.BkgrpDescr = oPRHeaderObj.BkgrpDescr;
                          oPRLineItemObj.MatklDescr = oPRHeaderObj.MatklDescr;
                          oPRHeaderObj.KostlDescr = "";
                          oPRLineItemObj.SaktoDescr = oPRHeaderObj.SaktoDescr;
                          oPRLineItemObj.PrctrDescr = "";
                          oPRLineItemObj.IsbnDescr = "";*/

                        if (oPRHeaderObj.Sakto === "") {
                            oPRHeaderObj.Sakto = this.getOwnerComponent().GLAccount;
                        }
                        oPRLineItemObj.Sakto = oPRHeaderObj.Sakto;
                    }
                    var oModel = new sap.ui.model.json.JSONModel(oPRLineItemObj);
                    sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                    this.getView().setModel(oModel, "PRLineItemModel");
                    this.getView().getModel("PRLineItemModel").refresh(true);
                    this.getView().getModel("PRHeaderModel").refresh(true);
                    this.setCodingInputFilters(oPRLineItemObj);
                    this.getOwnerComponent().accountassign = oPRLineItemObj.Knttp;
                    this.getOwnerComponent().plants = oPRLineItemObj.Werks;
                    // this.getOwnerComponent().plants = oPRLineItemObj.Bukrs;
                    var uniqIds = {};
                    var filtered = this.getOwnerComponent().items.filter(obj => !uniqIds[obj.Bnfpo] && (uniqIds[obj.Bnfpo] = true));
                    this.getOwnerComponent().items = filtered;
                    var oModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().items);
                    this.getView().setModel(oModel, "PRLineModel");
                    sap.ui.getCore().setModel(oModel, "PRLineModel");

                    //if (oPRLineItemObj.Knttp) {
                    this.setCodingVisibility(oPRLineItemObj.Knttp);
                    // }
                } else {
                    if (sap.ui.getCore().getModel("PRLineItemModel")) {
                        var oPRItemObj = sap.ui.getCore().getModel("PRLineItemModel").getData();
                        this.setCodingInputFilters(oPRItemObj);
                        this.setCodingVisibility(oPRItemObj.Knttp);
                        this.getOwnerComponent().plants = oPRItemObj.Werks;
                        //  this.getOwnerComponent().plants = oPRLineItemObj.Bukrs;
                        this.getOwnerComponent().accountassign = oPRItemObj.Knttp;
                        sap.ui.getCore().getModel("PRLineItemModel").refresh(true);
                    }
                }
            },

            /*dialogClose: function () {
                this.Coding.close();
                this.Coding.destroy();
 
            },
 
            handleIntOrderHelp: function (oevent) {
                this._internalHelp = sap.ui.xmlfragment("zprcreatenew.Fragment.InternalOrderHelp", this);
                this.getView().addDependent(this._internalHelp);
                this._internalHelp.open();
            },
 
            handleVendorHelp: function (oevent) {
                this._VendorHelp = sap.ui.xmlfragment("zprcreatenew.Fragment.VendorHelp", this);
                this.getView().addDependent(this._VendorHelp);
                this._VendorHelp.open();
            },
 
            handleMeasureHelp: function (oevent) {
                this.MeasureHelp = sap.ui.xmlfragment("zprcreatenew.Fragment.MeasureHelp", this);
                this.getView().addDependent(this.MeasureHelp);
                this.MeasureHelp.open();
            },
 
            handleCurrencyHelp: function (oevent) {
                this.CurrencyHelp = sap.ui.xmlfragment("zprcreatenew.Fragment.CurrencyHelp", this);
                this.getView().addDependent(this.CurrencyHelp);
                this.CurrencyHelp.open();
            },
 
            handleCodingReqHelp: function (oevent) {
                this.CodingReqHelp = sap.ui.xmlfragment("zprcreatenew.Fragment.ReqCodingHelp", this);
                this.getView().addDependent(this.CodingReqHelp);
                this.CodingReqHelp.open();
            },*/

            handlenoofitems: function (oEvent, val) {
                if (oEvent.getSource().getValue() > 0) {
                    this.getOwnerComponent().items = [];
                    var noofitems = "";
                    if (val) {
                        noofitems = val;
                    } else {
                        noofitems = oEvent.getSource().getValue();
                        if (oEvent.getSource().getValue !== "") {
                            oEvent.getSource().setValueState("None");
                        }
                    }
                    this.getOwnerComponent().lineno = 0;
                    if (noofitems !== 0) {
                        for (var i = 0; i < noofitems; i++) {
                            this.getOwnerComponent().lineno = parseInt(this.getOwnerComponent().lineno) + parseInt(10);
                            this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                            var obj = {};
                            obj.Bnfpo = this.getOwnerComponent().lineno;
                            if (!this.getOwnerComponent().items) {
                                this.getOwnerComponent().items = [];
                            }
                            this.getOwnerComponent().items.push(obj);
                        }
                        var oModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().items);
                        this.getView().setModel(oModel, "PRLineModel");
                        sap.ui.getCore().setModel(oModel, "PRLineModel");
                    }
                } else {
                    oEvent.getSource().setValue("");
                    sap.m.MessageBox.information("Zero and Negative values are not allowed", {
                        title: "information",
                    });
                }
            },

            handleIntOrderHelp: function (oevent) {
                this._internalHelp = sap.ui.xmlfragment("zprcreatenew.Fragment.InternalOrderHelp", this);
                this.getView().addDependent(this._internalHelp);
                this._internalHelp.open();
            },

            handleVendorHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oevent, octrl._VendorHelp, "VendorHelp", octrl, "x");
            },

            handlePRMatValueHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                if (octrl.getOwnerComponent().accountassign !== "") {

                    this.fnValueHelpDialogOpen(oevent, octrl.MaterialGroup, "MaterialGroup", octrl, "x");
                    /*  var aFilters = [new Filter("KNTTP", FilterOperator.EQ, this.getOwnerComponent().accountassign)];  
                       sap.ui.getCore().byId("idTableVHSMat").getBinding('items').filter(aFilters, "Application");
                   */
                } else {
                    sap.m.MessageBox.information("Please select requisition coding type", {
                        title: "Information",
                    });
                }
            },
            handleCostCenterValueHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oevent, octrl.SearchCostCenter, "SearchCostCenter", octrl, "x");
            },
            handleIntOrderHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oevent, octrl.InternalOrder, "InternalOrder", octrl, "x");
            },
            handleIsbnBatchValueHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oevent, octrl.SearchBatch, "SearchBatch", octrl, "x");
            },
            handleIsbnISBNValueHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oevent, octrl.SearchBatch, "SearchBatch", octrl, "x");
            },
            handleVendorHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oevent, octrl.VendorHelp, "VendorHelp", octrl, "x");
            },
            handleMeasureHelp: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oevent, octrl.MeasureHelp, "MeasureHelp", octrl, "x");
                sap.ui.getCore().byId("idTableVHSUOM1").setVisible(true);
                sap.ui.getCore().byId("idTableVHSUOM").setVisible(false);
                // this.MeasureHelp = sap.ui.xmlfragment("zprcreatenew.Fragment.MeasureHelp", this);
                // this.getView().addDependent(this.MeasureHelp);
                // this.MeasureHelp.open();
            },

            handleCurrencyHelp: function (oEvent) {
                this.fnValueHelpDialogOpen(oEvent, this._Currency, "CurrencyHelp", this);
                sap.ui.getCore().byId("idTableVHSCURRENCY1").setVisible(true);
                sap.ui.getCore().byId("idTableVHSCURRENCY").setVisible(false);
            },

            handleProfitCenterHelp: function (oEvent) {
                this.fnValueHelpDialogOpen(oEvent, this._ProfitCenter, "ProfitCentre", this);
            },
            handleEmployeeNoHelp: function (oEvent) {
                this.fnValueHelpDialogOpen(oEvent, this._EmployeeNo, "EmployeeNo", this);
            },
            handlePurchaseGroupHelp: function (oEvent) {
                this.fnValueHelpDialogOpen(oEvent, this._PurchaseGroup, "PurchaseGroupValuehelp", this);
            },
            handleCodingReqHelp: function (oEvent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                this.fnValueHelpDialogOpen(oEvent, octrl.CodingRequ, "ReqCodingHelp", octrl, "x");
            },
            fnValueHelpDialogOpen: function (oEvent, d, fName, octrl, flg) {
                if (!d) {
                    d = sap.ui.xmlfragment("zprcreatenew.Fragment." + fName, octrl);
                    octrl.getView().addDependent(d);
                }
                var mdlName = flg == "x" ? oEvent.getParameter("id") : oEvent.getSource().getProperty('name') === "" ? "PRHeaderModel" : "PRLineItemModel";
                let mdl = new JSONModel({ mdlName: mdlName, id: oEvent.getParameter("id") });
                d.setModel(mdl, "HImdl");
                d.open();
            },
            setCodingVisibility: function (val) {
                if (sap.ui.getCore().byId("CostCenterFrag")) {
                    sap.ui.getCore().byId("CostCenterFrag").setEditable(false);
                    sap.ui.getCore().byId("IntOrderFrag").setEditable(false);
                    sap.ui.getCore().byId("IsbnFrag").setEditable(false);
                    sap.ui.getCore().byId("BatchFrag").setEditable(false);
                    sap.ui.getCore().byId("ProfitCenterFrag").setEditable(false);
                    if (val) {
                        val = val.toLocaleUpperCase();
                        if (val === "K") {
                            sap.ui.getCore().byId("CostCenterFrag").setEditable(true);

                        } else if (val === "F") {
                            sap.ui.getCore().byId("IntOrderFrag").setEditable(true);

                        } else if (val === "8") {
                            sap.ui.getCore().byId("ProfitCenterFrag").setEditable(true);

                        } else if (val === "9") {
                            sap.ui.getCore().byId("IsbnFrag").setEditable(true);
                            sap.ui.getCore().byId("BatchFrag").setEditable(true);

                        }
                    }
                }
            },

            setCodingVisibility1: function (val) {
                if (sap.ui.getCore().byId("CostCenterFrag")) {
                    sap.ui.getCore().byId("CostCenterFrag").setEditable(false);
                    sap.ui.getCore().byId("IntOrderFrag").setEditable(false);
                    sap.ui.getCore().byId("IsbnFrag").setEditable(false);
                    sap.ui.getCore().byId("BatchFrag").setEditable(false);
                    sap.ui.getCore().byId("ProfitCenterFrag").setEditable(false);
                    if (val) {
                        val = val.toLocaleUpperCase();
                        if (val === "K") {
                            sap.ui.getCore().byId("CostCenterFrag").setEditable(true);
                            sap.ui.getCore().byId("IntOrderFrag").setValue("");
                            sap.ui.getCore().byId("IsbnFrag").setValue("");
                            sap.ui.getCore().byId("BatchFrag").setValue("");
                            sap.ui.getCore().byId("ProfitCenterFrag").setValue("");
                        } else if (val === "F") {
                            sap.ui.getCore().byId("IntOrderFrag").setEditable(true);
                            sap.ui.getCore().byId("CostCenterFrag").setValue("");
                            // sap.ui.getCore().byId("IntOrderFrag").setValue("");
                            sap.ui.getCore().byId("IsbnFrag").setValue("");
                            sap.ui.getCore().byId("BatchFrag").setValue("");
                            sap.ui.getCore().byId("ProfitCenterFrag").setValue("");
                        } else if (val === "8") {
                            sap.ui.getCore().byId("ProfitCenterFrag").setEditable(true);
                            sap.ui.getCore().byId("CostCenterFrag").setValue("");
                            sap.ui.getCore().byId("IntOrderFrag").setValue("");
                            sap.ui.getCore().byId("IsbnFrag").setValue("");
                            sap.ui.getCore().byId("BatchFrag").setValue("");
                            sap.ui.getCore().byId("ProfitCenterFrag").setValue("");
                        } else if (val === "9") {
                            sap.ui.getCore().byId("IsbnFrag").setEditable(true);
                            sap.ui.getCore().byId("BatchFrag").setEditable(true);
                            sap.ui.getCore().byId("CostCenterFrag").setValue("");
                            sap.ui.getCore().byId("IntOrderFrag").setValue("");
                            sap.ui.getCore().byId("ProfitCenterFrag").setValue("");
                        }
                    }
                }
            },


            onValueHelpLineItemPress: function (oEvent) {
                var field = oEvent.getSource().data().field,
                    sObj = oEvent.getSource().getBindingContext().getObject();
                sap.ui.getCore().getModel("PRLineItemModel").setProperty("/" + field, sObj[field]);
            },
            onValueHelpPGLineItemPress: function (e) {
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();

                sap.ui.getCore().getModel(mdl).setProperty('/Bkgrp', sObj.EKGRP);
                if (this.getView().getModel(mdl)) {
                    this.getView().getModel(mdl).setProperty('/Bkgrp', sObj.EKGRP);
                    //   this.getView().getModel(mdl).setProperty('/BkgrpDescr', sObj.EKNAM);
                }
                var aFilters = new Filter("EKGRP", FilterOperator.EQ, sObj.EKGRP.toUpperCase());
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBinding("suggestionItems").filter(aFilters);
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setSelectedKey(sObj.EKGRP);
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                this.fnDialogClose(e);
            },

            onValueHelpCurrencyLineItemPress: function (e) {
                var mdl = e.getSource().data().mdl;
                if (e.getSource().getBindingContext('valuehelp')) {
                    var sObj = e.getSource().getBindingContext('valuehelp').getObject();
                } else {
                    var sObj = e.getSource().getBindingContext('CurrModel').getObject();
                }
                sap.ui.getCore().getModel(mdl).setProperty('/Waers', sObj.WAERS);
                if (this.getView().getModel(mdl)) {
                    this.getView().getModel(mdl).setProperty('/Waers', sObj.WAERS);
                }
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                sap.ui.getCore().getModel(mdl).refresh(true);
                this.fnDialogClose(e);
            },
            onValueHelpEmployeeLineItemPress: function (e) {
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();
                sap.ui.getCore().getModel(mdl).setProperty('/Zzempno', sObj.AUFNR);
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                this.fnDialogClose(e);
            },
            onValueHelpReqCodingLineItemPress: function (e) {
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();
                sap.ui.getCore().byId(mdl).setValue(sObj.ACASIGNCAT);
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                if (sObj.ACASIGNCAT !== "") {
                    this.setCodingVisibility(sObj.ACASIGNCAT);
                }
                //  sap.ui.getCore().getModel(mdl).setProperty('/',sObj.ACASIGNCAT);
                this.fnDialogClose(e);
            },
            onValueHelpProfitCenterLineItemPress: function (e) {
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();
                this.getOwnerComponent().plants = sObj.BUKRS;
                this.onFetchPlantDetails(sObj.BUKRS);
                sap.ui.getCore().getModel(mdl).setProperty('/Prctr', sObj.PRCTR);
                if (this.getView().getModel(mdl)) {
                    this.getView().getModel(mdl).setProperty('/Prctr', sObj.PRCTR);
                }
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValue(sObj.PRCTR);
                // sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("value").binding.getModel().setProperty('/PrctrDescr', sObj.LTEXT);
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                this.fnDialogClose(e);
            },
            onValueHelpVendorLineItemPress: function (e, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();
                sap.ui.getCore().byId(mdl).setValue(sObj.LIFNR);
                octrl.getOwnerComponent().VendorName = sObj.NAME1;

                var aFilters = new Filter("LIFNR", FilterOperator.EQ, sObj.LIFNR.toUpperCase());
                if (sap.ui.getCore().byId(mdl).getBinding("suggestionItems")) {
                    sap.ui.getCore().byId(mdl).getBinding("suggestionItems").filter(aFilters);
                    sap.ui.getCore().byId(mdl).setSelectedKey(sObj.LIFNR);
                } else {
                    sap.ui.getCore().byId(mdl).setValue(sObj.LIFNR);
                }

                if (octrl.getView().byId("Currency")) {
                    octrl.getView().byId("Currency").setValue(sObj.WAERS);
                    octrl.getView().byId("idCurrency").setValue(sObj.WAERS);
                    //  octrl.getView().byId("VendorName").setText(sObj.NAME1);
                }
                if (sap.ui.getCore().byId("Waers")) {
                    sap.ui.getCore().byId("Waers").setValue(sObj.WAERS);
                }
                /* if(this.getView().getModel(mdl)){
                    this.getView().getModel(mdl).setProperty('/Prctr', sObj.PRCTR);
                }*/
                if (octrl.getView().getModel("PRPreviewModel")) {
                    octrl.getView().getModel("PRPreviewModel").setProperty('/Name1', sObj.NAME1);
                } else if ((octrl.getView().getModel("PRHeaderModel"))) {
                    octrl.getView().getModel("PRHeaderModel").setProperty('/Name1', sObj.NAME1);
                }
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                var sobj = {
                    "Elifn" :sObj.LIFNR,
                }
                this.setCodingInputFilters1(sobj,octrl);
                // sap.ui.getCore().getModel(mdl).setProperty('/Prctr',sObj.LIFNR);
                this.fnDialogClose(e);
            },
            onValueHelpMatLineItemPress: function (e, octrl) {
                var aFilters = [];
                if (!octrl) {
                    octrl = this;
                }
                var that = this;
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject(),
                    fieldid = e.getSource().getModel("HImdl").getData().id;

                that.fnDialogClose(e);
                Promise.all([octrl.getGlAccount(sObj.MATKL, sObj, e)
                ]).then(function (result) {
                    if (octrl.getOwnerComponent().GLAccount !== "") {
                        sap.ui.getCore().byId(mdl).setValue(sObj.MATKL);
                        if (sap.ui.getCore().getModel("PRLineItemModel")) {
                            sap.ui.getCore().getModel("PRLineItemModel").setProperty("/Sakto", octrl.getOwnerComponent().GLAccount);
                        }
                        /*   sap.ui.getCore().byId(mdl).getBindingInfo("selectedKey").binding.getModel().setProperty('/SaktoDescr', octrl.getOwnerComponent().GLAccountDesc);
                           sap.ui.getCore().byId(mdl).getBindingInfo("selectedKey").binding.getModel().setProperty('/MatklDescr', sObj.WGBEZ);*/
                        /*  if(octrl.getView().getModel(mdl)){               
                            //  octrl.getView().getModel(mdl).setProperty('/MatklDescr', sObj.WGBEZ);
                          }*/
                        aFilters = new Filter("MATKL", FilterOperator.EQ, sObj.MATKL.toUpperCase());
                        sap.ui.getCore().byId(fieldid).getBinding("suggestionItems").filter(aFilters);
                        sap.ui.getCore().byId(mdl).setSelectedKey(sObj.MATKL);
                        sap.ui.getCore().byId(fieldid).setValueState("None");
                    } else {
                        sap.ui.getCore().byId(mdl).setValue("");
                        sap.ui.getCore().byId(mdl).setSelectedKey("");
                        sap.m.MessageBox.error("G/L Account is not found for selected material group", {
                            title: "Error",
                        });
                    }
                    // sap.ui.getCore().getModel(mdl).setProperty('/Prctr',sObj.LIFNR);
                });
            },

            getGlAccount: function (matkl, sObj, e) {
                var that = this;
                return new Promise(
                    function (resolve, reject) {
                        var aFilters = [];
                        aFilters.push(new Filter("MATKL", FilterOperator.EQ, matkl.toUpperCase()));
                        aFilters.push(new Filter("KNTTP", FilterOperator.EQ, that.getOwnerComponent().accountassign));
                        var oMdl = that.getOwnerComponent().getModel("valuehelp");
                        oMdl.read("/MaterialGroupSet", {
                            filters: aFilters,
                            success: function (oData) {
                                that.getOwnerComponent().GLAccount = oData.results[0].SAKNR;
                                that.getOwnerComponent().GLAccountDesc = oData.results[0].WGBEZ;
                                //return oData.results[0].SAKNR;

                                resolve(oData);
                            }.bind(this),
                            error: function (oError) {
                                console.log(oError);
                                reject(oError);
                            }.bind(this)
                        });
                    });
            },

            onValueHelpCostLineItemPress: function (e, octrl) {
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();
                sap.ui.getCore().byId(mdl).setValue(sObj.KOSTL);
                if (!octrl) {
                    octrl = this;
                }
                octrl.getOwnerComponent().plants = sObj.BUKRS;
                octrl.onFetchPlantDetails(sObj.BUKRS);
                if (sap.ui.getCore().byId("ProfitCenterFrag")) {
                    sap.ui.getCore().byId("ProfitCenterFrag").setValue(sObj.PRCTR);
                    //   sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("value").binding.getModel().setProperty('/PrctrDescr', sObj.PRCTR_TXT);
                }

                //  sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValue(sObj.KOSTL);
                // sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                // sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("selectedKey").binding.getModel().setProperty('/KostlDescr', sObj.LTEXT);
                // sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("value").binding.getModel().setProperty('/KostlDescr', sObj.LTEXT);       
                // sap.ui.getCore().getModel(mdl).setProperty('/Prctr',sObj.LIFNR);
                this.fnDialogClose(e);
            },
            onValueHelpInternalLineItemPress: function (e, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();
                sap.ui.getCore().byId(mdl).setValue(sObj.AUFNR);
                if (octrl.getView().getModel("PRLineItemModel")) {
                    octrl.getView().getModel("PRLineItemModel").setProperty("/Aufnr", sObj.AUFNR);
                    octrl.getOwnerComponent().plants = sObj.BUKRS;
                    octrl.onFetchPlantDetails(sObj.BUKRS);
                }
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                //  sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("value").binding.getModel().setProperty('/AufnrDescr', sObj.KTEXT);
                // sap.ui.getCore().getModel(mdl).setProperty('/Prctr',sObj.LIFNR);
                if (sap.ui.getCore().byId("ProfitCenterFrag")) {
                    sap.ui.getCore().byId("ProfitCenterFrag").setValue(sObj.PRCTR);
                    //   sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("value").binding.getModel().setProperty('/PrctrDescr', sObj.PRCTR_TXT);
                }

                /*if( sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id)){
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValue(sObj.AUFNR);
                }*/
                this.fnDialogClose(e);
            },
            onValueHelpISBNLineItemPress: function (e, octrl) {
                let mdl = e.getSource().data().mdl,
                    sObj = e.getSource().getBindingContext('valuehelp').getObject();
                sObj.ZISBN = parseInt(sObj.ZISBN).toString();
                //  sObj.ZIMP = parseInt(sObj.ZIMP).toString();
                if (!octrl) {
                    octrl = this;
                }
                octrl.getOwnerComponent().plants = sObj.BUKRS;
                octrl.onFetchPlantDetails(sObj.BUKRS);
                sap.ui.getCore().byId(mdl).setValue(sObj.ZISBN);
                if (sap.ui.getCore().byId("IsbnFrag")) {
                    sap.ui.getCore().byId("IsbnFrag").setValue(sObj.ZISBN);
                    sap.ui.getCore().getModel("PRLineItemModel").setProperty('/Isbn', sObj.ZISBN);
                    sap.ui.getCore().byId("BatchFrag").setValue(sObj.ZIMP);
                    sap.ui.getCore().byId("BatchFrag").setValueState("None");
                }
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");
                //  sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("value").binding.getModel().setProperty('/IsbnDescr', sObj.MAKTG); 
                // sap.ui.getCore().getModel(mdl).setProperty('/Prctr',sObj.LIFNR);
                if (sap.ui.getCore().byId("ProfitCenterFrag")) {
                    sap.ui.getCore().byId("ProfitCenterFrag").setValue(sObj.PRCTR);
                    //   sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).getBindingInfo("value").binding.getModel().setProperty('/PrctrDescr', sObj.PRCTR_TXT);
                }

                this.fnDialogClose(e);
            },
            onValueHelpUOMLineItemPress: function (e, octrl) {
                let mdl = e.getSource().data().mdl;
                if (e.getSource().getBindingContext('valuehelp')) {
                    var sObj = e.getSource().getBindingContext('valuehelp').getObject();
                } else {
                    var sObj = e.getSource().getBindingContext('MeasureHelp').getObject();
                }
                if (!octrl) {
                    octrl = this;
                }
                // var sObj = e.getSource().getBindingContext('valuehelp').getObject();
                sap.ui.getCore().byId(mdl).setValue(sObj.MSEHI);
                sap.ui.getCore().byId(e.getSource().getModel("HImdl").getData().id).setValueState("None");

                // sap.ui.getCore().getModel(mdl).setProperty('/Prctr',sObj.LIFNR);
                this.fnDialogClose(e);
            },
            fnDialogClose: function (e) {
                e.getSource().getParent().getParent().close();
                e.getSource().getParent().getParent().destroy();
            },
            OnCloseDialog: function (e) {
                e.getSource().getParent().close();
                e.getSource().getParent().destroy();
            },

            dialogClose: function () {
                //   if(this.Coding){
                this.Coding.close();
                this.Coding.destroy()
                //  }
            },
            /*End of Change by Ashok*/


            onNumberValidation: function (oEvent) {
                var oInput = oEvent.getSource(),
                    val = oInput.getValue();
                val = val.replace(/[^\d]/g, '');
                oInput.setValue(val);
                oInput.setValueState('None');
            },

            _fnrequiredinput: function () {
                //  return ["idBnfo", "idPurchaseGroup", "idMaterialGroup", "idVendor", "idCurrency", "idDeliveryDate", "idReqCodingType"];
                return ["idBnfo", "idVendor", "idCurrency", "idDeliveryDate"];
            },

            _fnrequiredinput1: function () {
                // return ["ItemDesc", "Currency", "Vendor", "Quantity", "UOM", "DeliveryDate", "ReqCoding", "PurGroup", "MatGroup", "Price"];
                return ["ItemDesc", "Currency", "Vendor", "Quantity", "UOM", "DeliveryDate", "Price"];
            },

            onPRDetailCancel: function () {

                sap.m.MessageBox.show(
                    "All data will be lost upon cancel. Are you sure you want to continue? ", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    title: "Warning",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === 'YES') {
                            window.location.reload(true);
                        }
                    }
                }
                )
            },

            dialogClose12: function () {
                var that = this;
                sap.m.MessageBox.show(
                    "All data will be lost upon cancel. Are you sure you want to continue? ", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    title: "Warning",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === 'YES') {
                            that.getOwnerComponent().Close = "X";
                            that.Coding.close();
                            that.Coding.destroy();
                        }
                    }
                }
                )
            },

            fnrequiredInputValidation: function (inputs, self) {
                var valid = true;
                inputs.forEach(function (input) {
                    var sInput = self.getView().byId(input);
                    if (sInput.getValue() == "" || sInput.getValue() == undefined) {
                        valid = false;
                        sInput.setValueState("Error");
                    }
                    else {
                        sInput.setValueState("None");
                    }
                });
                return valid;
            },

            fnMessageBox: function (title, icon, msg) {
                MessageBox.show(
                    msg, {
                    icon: icon,
                    title: title,
                    actions: [MessageBox.Action.OK]
                }
                );
            },

            onInputChange: function (oEvent) {
                if (oEvent.getSource().getValue() !== "") {
                    oEvent.getSource().setValueState('None');
                }
            },

            /*Filter Search for F4 Help - Ashok*/
            onSearch: function (oEvent) {
                let fBar = oEvent.getSource(),
                    table = sap.ui.getCore().byId(oEvent.getSource().data().id),
                    fItems = fBar.getFilterGroupItems(),
                    aFilters = [];
                var CurrFlag = "";
                var AccFlag = "";
                var UOMFlag = "";
                $.each(fItems, function (i, ele) {
                    let key = ele.getProperty('groupName'),
                        control = fBar.determineControlByFilterItem(ele),
                        oFilter = null;
                    if (key === "WAERS" || key === "KTEXT") {
                        CurrFlag = "X";
                    }
                    if (key === "MSEHI" || key === "MSEHL") {
                        UOMFlag = "X";
                    }
                    /* if(key === "MATKL"){
                         AccFlag = "X";
                     }*/
                    if (control.getMetadata().getName() === 'sap.m.Input' && control.getValue() !== '') {
                        oFilter = new Filter(key, FilterOperator.EQ, control.getValue());
                    } else if (control.getMetadata().getName() === 'sap.m.DatePicker' && control.getValue() !== '') {

                    }
                    if (oFilter !== null)
                        aFilters.push(oFilter);
                });
                /*if(AccFlag === "X"){
                    var oFilter1 = new Filter("KNTTP", FilterOperator.EQ, this.getOwnerComponent().accountassign);                   
                    aFilters.push(oFilter1);
                }*/
                if (UOMFlag === "X") {
                    if (sap.ui.getCore().byId("idTableVHSUOM1")) {
                        sap.ui.getCore().byId("idTableVHSUOM1").setVisible(false);
                        sap.ui.getCore().byId("idTableVHSUOM").setVisible(true);
                    }
                }

                if (CurrFlag === "X") {
                    if (sap.ui.getCore().byId("idTableVHSCURRENCY1")) {
                        sap.ui.getCore().byId("idTableVHSCURRENCY1").setVisible(false);
                        sap.ui.getCore().byId("idTableVHSCURRENCY").setVisible(true);
                    }
                }
                table.getBinding('items').filter(aFilters, "Application");

            },
            onStartUpload: function () {
                var that = this;
                if (!this.Attachment) {
                    this.Attachment = sap.ui.getCore().byId("UploadCollection");
                }
                if (this.Attachment) {
                    // var oUploadCollection = this.getView().byId("UploadCollection");
                    /*var oUploadCollection = this.Attachment;
                    var cFiles = this.Attachment.getItems().length;*/
                    var oUploadCollection = sap.ui.getCore().byId("UploadCollection");
                    if (oUploadCollection) {
                        var cFiles = oUploadCollection.getItems().length;
                        //   var cFiles = this.Attachment.aItems.length;
                        var uploadInfo = cFiles + " file(s)";
                        if (cFiles > 0) {
                            oUploadCollection.upload();
                        } else {
                            this.AttDestroy();
                            return;
                        }
                        this.AttDestroy();
                    } else {
                        return;
                    }
                }
            },

            AttDestroy: function (oEvent) {
                if (window._AttachPopover) {
                    window._AttachPopover.destroy();
                }
            },

            onCheck: function (oEvent) {
                this.onSelectionChange("", "CreatePr");
            },
            onBeforeUploadStarts: function (oEvent) {
                //  var oUploadCollection = this.getView().byId("UploadCollection");
                var oUploadCollection = sap.ui.getCore().byId("UploadCollection");
                var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
                var url2 = url1.split("..");
                oUploadCollection.setUploadUrl(url2[1]);
                oUploadCollection.setProperty("uploadUrl", url2[1]);
                //  oUploadCollection.setProperty("uploadUrl", "/sap/opu/odata/sap/ZP2P_ATTACHMENT_SRV/AttachmentSet");
                var filename = oEvent.getParameter("fileName");
                if (!this.PRNum) {
                    this.PRNum = this.getOwnerComponent().PRNum;
                }
                var oCustomHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: "ZP2P_PR" + "/" + this.PRNum + "/" + filename
                });
                oEvent.getParameters().addHeaderParameter(oCustomHeaderSlug);
            },

            /*  onPRDetailCancel: function (oEvent) {
                  this.PRNum = "5400000090";
                  this.onStartUpload("5400000090");
  
              },*/
            uplchange: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
                var url2 = url1.split("..");
                oUploadCollection.setProperty("uploadUrl", url2[1]);
                var secModel = this.getOwnerComponent().getModel("attachment");
                var oCustomeHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: secModel.getSecurityToken()
                });
                oUploadCollection.addHeaderParameter(oCustomeHeaderToken);
            },

            //pratik changes
            onChangeError: function (evt) {
                // this.dateCheck(evt);
                if (evt.getSource().getSelectedKey !== "") {
                    evt.getSource().setValueState("None");
                }
            },

            /* dialogClose: function (evt) {
                 var tat = this;
                 if (evt) {
                     if (evt.getParameters().id === "prCancel") {
                         this.onPRDetailCancel();
                     }
                 }
                 else {
                     this.Coding.close();
                     this.Coding.destroy()
                 }
 
             },*/

            dateCheck: function (evt) {
                if (evt) {
                    evt.getSource().setValueState('None');
                    //if(evt.getSource().getDateValue()){
                    // if (evt.getParameters().id === "idDelDate" || evt.getParameters().id === "idDeliveryDate" || evt.getParameters().id === "DeliveryDate" ) {
                    var x = evt.getParameters().value;
                    var a = new Date(x);
                    var dateOld = a.getTime() + (1 * 24 * 60 * 60 * 1000);
                    var currDate = new Date().getTime();
                    if (dateOld < currDate) {
                        evt.getSource().setValue("");
                        MessageBox.warning(
                            "Delivery date cannot be less than today's date",
                            {
                                icon: MessageBox.Icon.WARNING,
                                actions: [MessageBox.Action.CANCEL],
                                initialFocus: MessageBox.Action.CANCEL,
                                onClose: function (sAction) {
                                    //sap.ui.getCore().byId("idDelDate").setValue();
                                }
                            }
                        );
                    }
                    //}

                }
            },
            _fnrequiredinput2: function () {
                //  return ["idItemdesc", "idCurr", "PurchaseFrag", "idDelDate", "idReqType", "idVenReq", "idItemQnt", "idUOM", "idUnitPrc", "idMatgrp"];
                return ["idItemdesc", "idCurr", "idDelDate", "idVenReq", "idItemQnt", "idUOM", "idUnitPrc"];
            },
            fnrequiredInputValidation1: function (inputs, self) {
                var valid = true;
                inputs.forEach(function (input) {
                    var sInput = sap.ui.getCore().byId(input);
                    if (sInput.getValue() == "" || sInput.getValue() == undefined) {
                        valid = false;
                        sInput.setValueState("Error");
                    }
                    else {
                        sInput.setValueState("None");
                    }
                });
                return valid;
            },

            onInputChange1: function (oEvent) {
                if (oEvent.getSource().getValue() === 0 || oEvent.getSource().getValue() === "0") {
                    oEvent.getSource().setValue("");
                } else {
                    oEvent.getSource().setValueState("None");
                }
            },

            onSaveSubmitPrew: function (evt) {
                var function1 = "";
                function1 = this._fnrequiredinput2();
                /* if (sap.ui.getCore().byId("idReqType").getSelectedKey() === "K") {
                     function1 = function1.concat(["CostCenterFrag"]);
                 } else if (sap.ui.getCore().byId("idReqType").getSelectedKey() === "F") {
                     function1 = function1.concat(["IntOrderFrag"]);
                 } else if (sap.ui.getCore().byId("idReqType").getSelectedKey() === "8") {
                     function1 = function1.concat(["ProfitCenterFrag"]);
                 } else if (sap.ui.getCore().byId("idReqType").getSelectedKey() === "9") {
                     function1 = function1.concat(["IsbnFrag", "BatchFrag"]);
                 } else {
                     function1 = this._fnrequiredinput2();
                 }*/
                var valid = this.fnrequiredInputValidation1(function1, this);
                if (!valid) {
                    this.fnMessageBox("ERROR", MessageBox.Icon.ERROR, "Please enter the mandatory fields");
                    //  MessageToast.show("Mandatory fields are missing");
                    return "a";
                }
                if (evt) {
                    if (evt.getParameters().id === "prSave23") {
                        this.onLineItemSave();
                        this.dialogClose();
                        this.getOwnerComponent().getRouter().navTo("PRPreview", {
                            PRPreview: "X",
                            PRCopy: "0"
                        }, true);
                    } else if (evt.getParameters().id === "arrLeft") {
                        this.setSubFlag("");
                        this.onLineItemSave();
                        this.dialogClose();
                        if (this.getView().byId("createpage")) {
                            this.onSubmit();
                        }
                    } else if (evt.getParameters().id === "arrLef3t") {
                        this.onLineItemSave();
                        this.onSubmitPR("frag");
                        
                        // this.setSubFlag("X");
                        // SubmitFlag = "X";
                        //this.onSubmit();
                    }
                }
            },

            onLineSubmit: function (oEvent) {
                // this.dialogClose();
                this.onLineItemSave1();
                SubmitFlag = "X";
                this.onSubmit();
            },
            setCodingInputFilters1:function(sObj,ocntrl){
                if (sObj.Elifn) {
                    if (sObj.Elifn !== " ") {
                        var aFilters = new Filter("LIFNR", FilterOperator.EQ, sObj.Elifn);
                        if( ocntrl.getView().byId("Vendor")){
                        ocntrl.getView().byId("Vendor").getBinding("suggestionItems").filter(aFilters);
                        }
                        if( ocntrl.getView().byId("idVendor")){
                        ocntrl.getView().byId("idVendor").getBinding("suggestionItems").filter(aFilters);
                        }
                    }
                }
            },
            setCodingInputFilters: function (sObj) {
                if (sObj.Elifn) {
                    if (sObj.Elifn !== " ") {
                        var aFilters = new Filter("LIFNR", FilterOperator.EQ, sObj.Elifn);
                        sap.ui.getCore().byId("idVenReq").getBinding("suggestionItems").filter(aFilters);
                    }
                }
                if (sObj.Bkgrp) {
                    if (sObj.Bkgrp !== " ") {
                        var aFilters = new Filter("EKGRP", FilterOperator.EQ, sObj.Bkgrp);
                        sap.ui.getCore().byId("PurchaseFrag").getBinding("suggestionItems").filter(aFilters);
                    }
                }
                if (sObj.Matkl) {
                    if (sObj.Matkl !== " ") {
                        var aFilters = new Filter("MATKL", FilterOperator.EQ, sObj.Matkl);
                        sap.ui.getCore().byId("idMatgrp").getBinding("suggestionItems").filter(aFilters);
                    }
                }
            },


            onSetDeliveryLocation: function (array, editable) {
                array.forEach(function (val, idx) {
                    sap.ui.getCore().byId(val.id).setEditable(editable);
                });
            },

            onMsgDisplay: function () {
                this.MsgPopup = sap.ui.xmlfragment("zprcreatenew.Fragment.ErrorMsg", this);
                this.MsgPopup.open();
            },

            onclearlineitem: function (oLineItem) {
                if (oLineItem) {
                    oLineItem.Txz01 = "";
                    oLineItem.Text1 = "";
                    oLineItem.Menge = "";
                    oLineItem.Land1 = "";
                    oLineItem.Meins = "";
                    oLineItem.Preis = "";
                    oLineItem.Lfdat = "";
                    oLineItem.Knttp = "";;
                    oLineItem.Kostl = "";
                    oLineItem.Aufnr = "";
                    oLineItem.Prctr = "";
                    oLineItem.Bkgrp = "";
                    oLineItem.Zzempno = "";
                    oLineItem.Isbn = "";
                    oLineItem.Batch = "";
                    oLineItem.Matkl = "";
                    oLineItem.Banfn = "";
                    oLineItem.Building = "";
                    oLineItem.Name1 = "";
                    oLineItem.Street = "";
                    oLineItem.PostCode = "";
                    oLineItem.City = "";
                    oLineItem.Land1 = "";
                    oLineItem.DelvAdrTyp = 0;
                    oLineItem.Sakto = "";
                    oLineItem.Werks = "";
                }
            },


            onErrMsgCancel: function (e) {
                e.getSource().getParent().close();
                e.getSource().getParent().destroy();
            },

            formatprice: function (oEvent) {
                var yu = oEvent.getSource().getValue();
                var oFormatOptions = {
                    minIntegerDigits: 0,
                    maxIntegerDigits: 5,
                    minFractionDigits: 0,
                    maxFractionDigits: 2
                };

                var NumberFormat = sap.ui.core.format.NumberFormat;

                // "NumberFormat" required from module "sap/ui/core/format/NumberFormat"
                var oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
                // oFloatFormat.format(1.1); // returns 001.10
                var abc = oFloatFormat.format(yu);
                var ui1 = oFloatFormat.parse(abc);
                oEvent.getSource().setValue(ui1);
            },

            liveChange: function (oEvent) {
                oEvent.getSource().setValueState('None');
                var sNumber = "";
                var value = oEvent.getSource().getValue();
                var bNotnumber = isNaN(value);
                if (bNotnumber == false) {
                    var Val = parseFloat(value).toFixed(2);
                    Val = Val.toString();
                    //  oEvent.getSource().setValue(Val);
                }
                else {
                    oEvent.getSource().setValue(sNumber);

                }
            },

            liveChange1: function (oEvent) {
                oEvent.getSource().setValueState('None');
                var sNumber = "";
                var value = oEvent.getSource().getValue();
                var bNotnumber = isNaN(value);
                if (bNotnumber == false) {
                    sNumber = value;
                    //  var Val =  Math.round(value).toFixed(3);
                    // oEvent.getSource().setValue(Val);
                }
                else {
                    oEvent.getSource().setValue(sNumber);

                }
            },

            onFetchPlantDetails: function (plant) {
                var tat = this;
                this.oModel = this.getOwnerComponent().getModel("valuehelp");
                if (this.getView().getModel("PRLineItemModel")) {
                    var dat1 = this.getView().getModel("PRLineItemModel").getData();
                    dat1.Werks = plant;
                    var oFilter = [new sap.ui.model.Filter("WERKS", sap.ui.model.FilterOperator.EQ, plant)];
                    this.getView().setBusy(true);
                    this.oModel.read("/DeliveryAddrSet", {
                        filters: oFilter,
                        success: function (odata) {
                            var obj = {};
                            if (odata.results) {
                                obj = odata.results[0];
                            }
                            tat.oMod = new sap.ui.model.json.JSONModel(obj);
                            tat.getView().setModel(tat.oMod, "DeliveryAddModel");
                            tat.getView().setBusy(false);
                            var obj1 = tat.getView().getModel("PRLineItemModel").getData();
                            if (obj.LAND1) {
                                obj1.Land1 = obj.LAND1
                                obj1.Building = obj.WERKS;
                                obj1.AdrName = obj.NAME1;
                                obj1.Street = obj.STRAS;
                                obj1.PostCode = obj.PSTLZ;
                                obj1.City = obj.ORT01;
                                obj1.Addrnumber = obj.ADRNR;
                                tat.getView().getModel("PRLineItemModel").refresh(true);
                            }
                        },
                        error: function (e) {
                        }
                    });
                }
            },

            detaildesc: function (title, value, field, entityname, desc) {
                var oMdl = this.getOwnerComponent().getModel("valuehelp");
                var oFilter = [new sap.ui.model.Filter(field, sap.ui.model.FilterOperator.EQ, value)];
                this.fieldname = desc;
                oMdl.read(entityname, {
                    filters: oFilter,
                    success: function (oData) {
                        this.detaildescdialog(title, oData.results[0][this.fieldname]);
                    }.bind(this),
                    error: function (oError) {
                        console.log(oData);
                    }.bind(this)
                });
            },

        });
    });




