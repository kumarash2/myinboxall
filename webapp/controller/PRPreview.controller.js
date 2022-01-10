sap.ui.define([
    "zinboxall/controller/BaseController",
    "zinboxall/Utils/formatter",
    "sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, formatter,MessageBox) {
        "use strict";
        var aLineItemArr = [], SubmitFlag = ""; var DeleteArray = [], TotArr = [], PRNo, PRCopy, checkArr = [];
        return Controller.extend("zinboxall.controller.PRPreview", {
            formatter: formatter,
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("PRPreview").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {

                PRNo = oEvent.getParameter("arguments").PRPreview;
                PRCopy = oEvent.getParameter("arguments").PRCopy;
                this.getOwnerComponent().lastlinekey = "";
                DeleteArray = [];
                this.fillReqCoding();
                this.onValueHelp();
                this.fillMeasure();
                this.getView().byId("chckbox").setSelected(false);
                this.getView().byId("CodingDetails").setVisible(false);
                var oModel = new sap.ui.model.json.JSONModel();
                // this.getOwnerComponent().items = [];
                SubmitFlag = "";
                this.onAttClose1();
                this.AttDestroy1();
                this.getView().setModel(oModel, "QuantityModel");
                //if (!sap.ui.getCore().getModel("ReqModel")) {

                // }
                if (PRNo !== "X") {
                    /* this.getView().byId("Date1").setVisible(false);
                     this.getView().byId("Date2").setVisible(true);*/
                    this.onCheckOpenAttachment();

                    this.getOwnerComponent().lineitem = "";
                    this.getOwnerComponent().items = [];
                    this.getOwnerComponent().lineno = "";
                    this.getOwnerComponent().plants = "";
                    this.getOwnerComponent().accountassign = "";
                    this.getOwnerComponent().GLAccount = "";
                    this.getOwnerComponent().Close = "";
                    this.getOwnerComponent().VendorName = "";
                    this.getOwnerComponent().PRNum = "";
                    var that = this;
                    var that1 = this;
                    var aFilters = [];

                    var oMdl = this.getOwnerComponent().getModel();
                    var AttMdl = this.getOwnerComponent().getModel("attachment");
                    var Entityset = "/PRHeaderSet('" + PRNo + "')";
                    oMdl.read(Entityset, {
                        urlParameters: {
                            "$expand": "HdrToItemNav"
                        },
                        success: function (oData) {
                            aLineItemArr = oData;
                            aLineItemArr.flg = PRCopy; // +Ashok
                            checkArr = oData;
                            this.setPreviewData(aLineItemArr);
                            var oModel = new sap.ui.model.json.JSONModel(aLineItemArr);
                            this.setButtonVisible(aLineItemArr);
                            // this.getOwnerComponent().items = aLineItemArr.HdrToItemNav.results;
                            this.handlenoofitemspreview(aLineItemArr);
                            this.getView().setModel(oModel, "PRPreviewModel");
                            this.getView().setModel(oModel, "PRHeaderModel");
                            sap.ui.getCore().setModel(oModel, "PRHeaderModel");
                        }.bind(this),
                        error: function (oError) {
                            console.log(oError);
                        }.bind(this)
                    });
                    var objtype = "ZP2P_PR";
                    //   var aFilters=[];
                    aFilters.push(new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, PRNo));
                    aFilters.push(new sap.ui.model.Filter("ObjectType", sap.ui.model.FilterOperator.EQ, objtype));

                    AttMdl.read("/AttachmentSet", {
                        filters: aFilters,
                        success: function (oData) {
                            var oModel = new sap.ui.model.json.JSONModel(oData);
                            //this.getView().setModel(oModel, "PRPreviewModel");
                            if (oData) {
                                if (oData.results) {
                                    var cnt = oData.results.length;
                                    this.getView().byId("arrLeft11222").setText(cnt);
                                }
                            }
                            sap.ui.getCore().setModel(oModel, "PRAttachModel");
                        }.bind(this),
                        error: function (oError) {
                            console.log(oData);
                        }.bind(this)
                    });

                } else {
                    /*this.getView().byId("Date1").setVisible(true);
                   this.getView().byId("Date2").setVisible(false);*/
                    var aHeaderData = sap.ui.getCore().getModel("PRHeaderModel").getData();
                    var aLineItemData = sap.ui.getCore().getModel("LineItemModel").getData();
                    var afinalData = aHeaderData;
                    var LineItem = [];
                    LineItem.results = aLineItemData;
                    afinalData.HdrToItemNav = LineItem;
                    aLineItemArr = afinalData;
                    //this.handlenoofitemspreview(aLineItemArr);
                    afinalData.flg = PRCopy; // +Ashok
                    var oModel = new sap.ui.model.json.JSONModel(afinalData);
                    this.getView().setModel(oModel, "PRPreviewModel");
                    sap.ui.getCore().setModel(oModel, "PRHeaderModel");
                    this.getView().setModel(oModel, "PRHeaderModel");
                    if(sap.ui.getCore().byId("UploadCollection")){
                        var items = sap.ui.getCore().byId("UploadCollection").getItems();
                        if(items.length){
                            this.getView().byId("arrLeft11222").setText(items.length);
                        }
                    }else{
                        this.getView().byId("arrLeft11222").setText(0);
                    }
                }
            },

            onAttachmentPress: function (oEvent) {
                if (PRNo !== "X") {
                    //this.onCheckOpenAttachment();
                    this.onPrevAttachment();
                    // this.onAttachment();
                } else {
                    this.onAttachment1();
                }
            },
            onPrevAttachment: function () {
                var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
                var url2 = url1.split("..");
                var obj = {
                    url: url2[1]
                }
                var oModel = new sap.ui.model.json.JSONModel(obj);
                sap.ui.getCore().setModel(oModel, "AttUrl");
                if (!this.prevwattachment) {
                    this.prevwattachment = sap.ui.xmlfragment("zinboxall.Fragments.PrevwAttachments", this);
                    // this.getView().addDependent(
                    //    this.__AttachPopover);
                }
                this.prevwattachment.open();
                if (sap.ui.getCore().byId("UploadCollection1")) {
                    var oUploadCollection1 = sap.ui.getCore().byId("UploadCollection1");
                    var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
                    var url2 = url1.split("..");
                    //  oUploadCollection1.setUploadUrl(url2[1]);
                    oUploadCollection1.setProperty("uploadUrl", url2[1]);

                }
            },
            onAttClose1: function () {
                if (this.prevwattachment) {
                    this.prevwattachment.close();
                }
                //this.
            },
            onAttachSave1: function (oEvent) {
                var oUploadCollection1 = sap.ui.getCore().byId("UploadCollection1");
                var cFiles = oUploadCollection1.getItems().length;
                var uploadInfo = cFiles + " file(s)";
                if (cFiles > 0) {
                    oUploadCollection1.upload();
                } else {
                    this.onAttClose1();
                    this.AttDestroy1();
                    return;
                }
            },
            AttDestroy1: function (oEvent) {
                if (this.prevwattachment) {
                    this.prevwattachment.destroy();
                    this.prevwattachment = null;
                }
            },
            uplchange1: function (oEvent) {
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

            onBeforeUploadStarts1: function (oEvent) {
                //  var oUploadCollection = this.getView().byId("UploadCollection");
                var oUploadCollection = sap.ui.getCore().byId("UploadCollection1");
                // var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
                //oUploadCollection.setProperty("uploadUrl", "/sap/opu/odata/sap/ZP2P_ATTACHMENT_SRV/AttachmentSet");
                //  oUploadCollection.setProperty("uploadUrl", url1);
                var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
                var url2 = url1.split("..");
                oUploadCollection.setUploadUrl(url2[1]);
                oUploadCollection.setProperty("uploadUrl", url2[1]);
                var filename = oEvent.getParameter("fileName");
                this.PRNum = this.getView().getModel("PRPreviewModel").getData().Banfn;
                var oCustomHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: "ZP2P_PR" + "/" + this.PRNum + "/" + filename
                });
                oEvent.getParameters().addHeaderParameter(oCustomHeaderSlug);
            },
            onUploadComplete1: function (oEvent) {
                var objtype = "ZP2P_PR";
                var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
               // sap.ui.getCore().byId("UploadCollection1").removeAllItems();
              // sap.ui.getCore().byId("UploadCollection1").unbindItems();
                var aFilters = [];
                var oUploadCollection = sap.ui.getCore().byId("UploadCollection1");
				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}
                aFilters.push(new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, PRNo));
                aFilters.push(new sap.ui.model.Filter("ObjectType", sap.ui.model.FilterOperator.EQ, objtype));
                var AttMdl = this.getOwnerComponent().getModel("attachment");
                AttMdl.read("/AttachmentSet", {
                    filters: aFilters,
                    success: function (oData) {
                        var oModel = new sap.ui.model.json.JSONModel(oData);
                        if (oData) {
                            if (oData.results) {
                                var cnt = oData.results.length;
                                this.getView().byId("arrLeft11222").setText(cnt);
                            }
                        }
                        sap.ui.getCore().setModel(oModel, "PRAttachModel");
                    }.bind(this),
                    error: function (oError) {
                        console.log(oData);
                    }.bind(this)
                });
            },
            setPreviewData: function (data) {
                TotArr = data.HdrToItemNav.results;
                var values = data.HdrToItemNav.results.map(val => val.Bnfpo);
                var max = Math.max.apply(null, values);
                this.getOwnerComponent().lineno = max;
                aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                    if (PRCopy === "X") {
                        val.Banfn = "";
                        data.Banfn = "";
                        data.Zestak = "";
                        val.Zestak = "";
                    }
                    //if (val.Loekz === "X") {
                    //   aLineItemArr.HdrToItemNav.results.splice(idx, 1);
                    // }
                });

                var filtereddata = aLineItemArr.HdrToItemNav.results.filter(function (oLineItem2) {
                    return oLineItem2.Loekz !== "X";
                });

                aLineItemArr.HdrToItemNav.results = filtereddata;
            },

            onPRPrevCancel: function () {
                var that = this;
                sap.m.MessageBox.show(
                    "All data will be lost upon cancel. Are you sure you want to continue? ", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    title: "Warning",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === 'YES') {
                            that.onBack();
                        }
                    }
                }
                )
            },


            onBack1: function (oEvent) {
                var PrPreData = this.getView().getModel('PRPreviewModel').getData();
                if (PRNo === "X") {
                    this.onPRPrevCancel();

                } else if (PrPreData.flg === 'A' || PrPreData.flg === 'R') {
                    this.getOwnerComponent().history.go(-1);
                } else {
                    this.getOwnerComponent().getRouter().navTo("PRDisplay", {
                        Display: "sPoNumber"
                    }, true);
                }
            },


            onBack: function (oEvent) {
                /*        var crnavi = sap.ushell.Container.getService("CrossApplicationNavigation");
                        var hashUrl = (sap.ushell && sap.ushell.Container &&
                            sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({
                                target: {
                                    semanticObject: "Myinbox",
                                    action: "Requisition"
                                }
                            })) || "",
                            url = hashUrl + "?sap-ui-app-id-hint=saas_approuter_zinboxreq&/DetailView/PRCoding";
                     
                        sap.m.URLHelper.redirect(url, false);*/
                // this.getOwnerComponent().history.go(-1);
                var PrPreData = this.getView().getModel('PRPreviewModel').getData();
                if (PRNo === "X") {
                    var that = this;
                    that.getOwnerComponent().getRouter().navTo("RoutePRCreation");
                } else if (PrPreData.flg === 'A' || PrPreData.flg === 'R') {
                    //this.getOwnerComponent().history.go(-1);
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent().getRouter().navTo("PRDisplay", {
                        Display: "sPoNumber"
                    }, true);
                }
            },

            onAddLineItemData: function (oEvent) {
                var valid = this.onSaveSubmitPrew();
                if (valid !== "a") {
                    var oModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().items);
                    this.getView().setModel(oModel, "PRLineModel");
                    sap.ui.getCore().setModel(oModel, "PRLineModel");
                    this.getOwnerComponent().lastlinekey = "";
                    // this.newitem = "";
                    this.onLineItemSave();
                    this.getOwnerComponent().plants = "";
                    this.getOwnerComponent().accountassign = "";
                    this.onFillLineItemData("No");
                }
            },
            handlenoofitemspreview: function (data) {
                var arr = [];
                var LastNo = "";
                data.HdrToItemNav.results.forEach(function (val, idx) {
                    var obj = {};
                    val.Bnfpo = parseInt(val.Bnfpo).toString();
                    obj.Bnfpo = val.Bnfpo;
                    LastNo = val.Bnfpo;
                    arr.push(obj);
                    // this.getOwnerComponent().items.push(obj);
                });
                if (this.getOwnerComponent().lineno === "") {
                    this.getOwnerComponent().lineno = LastNo;
                }
                this.getOwnerComponent().items = arr;
                var oModel = new sap.ui.model.json.JSONModel(arr);
                this.getView().setModel(oModel, "PRLineModel");
                sap.ui.getCore().setModel(oModel, "PRLineModel");
            },

            onPREdit: function (oEvent) {
                if (this.getView().byId("PRPreviewTable").getSelectedItem()) {
                    this.Coding = sap.ui.xmlfragment("zinboxall.Fragments.Coding", this);
                    this.getView().addDependent(this.Coding);
                    this.getOwnerComponent().lastlinekey = "";
                    var PRData = this.getView().byId("PRPreviewTable").getSelectedItem().getBindingContext("PRPreviewModel").getObject();
                    this.Coding.open();
                    var that = this;
                    sap.ui.getCore().byId("idReqItemNo").attachBrowserEvent("click", function (oEvent) {
                        that.getOwnerComponent().lastlinekey = sap.ui.getCore().byId("idReqItemNo").getSelectedKey();
                    });
                    var oPRLineItemObj = {};
                    var oPRHeaderObj = this.getView().getModel("PRPreviewModel").getData();
                    //var headerobj = sap.ui.getCore().getModel("PRHeaderModel").getData();
                    if (PRData.Lfdat !== "") {
                        var Date1 = new Date(PRData.Lfdat);
                        if (PRData.Lfdat) {
                            if (PRData.Lfdat[2] === "." && (isNaN(Date1.getTime()))) {
                                var ui = PRData.Lfdat.split(".");
                                var Date12 = ui[2] + "-" + ui[1] + "-" + ui[0];
                                Date1 = new Date(Date12);
                            }
                        }
                        // jquery.sap.require("sap.ui.core.format.DateFormat");
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                            pattern: "dd.MM.yyyy"
                        });
                        PRData.Lfdat = oDateFormat.format(Date1);
                    }
                    oPRLineItemObj.Text = oPRHeaderObj.Text;
                    oPRLineItemObj.Elifn = oPRHeaderObj.Elifn;
                    oPRLineItemObj.Waers = oPRHeaderObj.Waers;
                    oPRLineItemObj.Bnfpo = PRData.Bnfpo;
                    oPRLineItemObj.Txz01 = PRData.Txz01;
                    oPRLineItemObj.Text1 = PRData.Text;
                    oPRLineItemObj.Menge = PRData.Menge;
                    oPRLineItemObj.Land1 = PRData.Land1;
                    oPRLineItemObj.Meins = PRData.Meins;
                    oPRLineItemObj.Preis = PRData.Preis;
                    oPRLineItemObj.Lfdat = PRData.Lfdat;
                    oPRLineItemObj.Knttp = PRData.Knttp;
                    oPRLineItemObj.Kostl = PRData.Kostl;
                    oPRLineItemObj.Aufnr = PRData.Aufnr;
                    oPRLineItemObj.Prctr = PRData.Prctr;
                    oPRLineItemObj.Bkgrp = PRData.Bkgrp;
                    oPRLineItemObj.Zzempno = PRData.Zzempno;
                    oPRLineItemObj.Isbn = PRData.Isbn;
                    oPRLineItemObj.Batch = PRData.Batch;
                    oPRLineItemObj.Matkl = PRData.Matkl;
                    oPRLineItemObj.Sakto = PRData.Sakto;
                    oPRLineItemObj.Zestak = PRData.Zestak;
                    oPRLineItemObj.Werks = PRData.Werks;
                    if (this.getOwnerComponent().lineitem !== "") {
                        oPRLineItemObj.Rlwrt = this.getOwnerComponent().lineitem;
                    } else {
                        oPRLineItemObj.Rlwrt = oPRHeaderObj.Rlwrt;
                    }
                    if (oPRLineItemObj.Knttp !== "") {
                        this.setCodingVisibility(oPRLineItemObj.Knttp);
                        this.getOwnerComponent().accountassign = oPRLineItemObj.Knttp;
                        this.getOwnerComponent().plants = oPRLineItemObj.Werks;
                    }


                    oPRLineItemObj.Building = PRData.Building;
                    oPRLineItemObj.Name1 = PRData.Name1;
                    oPRLineItemObj.Street = PRData.Street;
                    oPRLineItemObj.PostCode = PRData.PostCode;
                    oPRLineItemObj.City = PRData.City;
                    oPRLineItemObj.Land1 = PRData.Land1;
                    oPRLineItemObj.DelvAdrTyp = PRData.DelvAdrTyp;
                    // headerobj.DelvAdrTyp = PRData.DelvAdrTyp;
                    oPRHeaderObj.Land1 = PRData.Land1;

                    var obj1 = PRData;
                    var obj = {};
                    obj.LAND1 = obj1.Land1;
                    obj.WERKS = obj1.Building;
                    obj.NAME1 = obj1.AdrName;
                    obj.STRAS = obj1.Street;
                    obj.PSTLZ = obj1.PostCode;
                    obj.ORT01 = obj1.City;
                    obj.ADRNR = obj1.Addrnumber;
                    //headerobj.DelvAdrTyp = obj1.DelvAdrTyp;
                    var oModel1 = new sap.ui.model.json.JSONModel(obj);
                    this.getView().setModel(oModel1, "DeliveryAddModel");

                    var oModel = new sap.ui.model.json.JSONModel(oPRLineItemObj);
                    sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                    this.getView().setModel(oModel, "PRLineItemModel");

                    this.setCodingInputFilters(oPRLineItemObj);
                    this.getOwnerComponent().accountassign = oPRLineItemObj.Knttp;
                    this.getOwnerComponent().plants = oPRLineItemObj.Werks;
                    // sap.ui.getCore().getModel("PRHeaderModel").refresh();
                    /*var oModel1 = new sap.ui.model.json.JSONModel(headerobj);
                    sap.ui.getCore().setModel(oModel1, "PRHeaderModel");
                    sap.ui.getCore().getModel("PRHeaderModel").refresh(true);*/
                    //this.getView().setModel(oModel, "PRLineItemModel");
                    var oModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().items);
                    this.getView().setModel(oModel, "PRLineModel");
                    sap.ui.getCore().setModel(oModel, "PRLineModel");
                } else {
                    sap.m.MessageBox.information("Please select atleast one line item to edit", {
                        title: "Information",
                    });
                }
            },

            onLineItemSave1: function (oEvent) {
                this.onLineItemSave();
                this.dialogClose();
            },

            onLineItemSave: function (oEvent, key) {
                var indx = "";
                var oLineItem = sap.ui.getCore().getModel("PRLineItemModel").getData();
                if (this.getView().getModel("PRPreviewModel")) {
                    var oLineItem1 = this.getView().getModel("PRPreviewModel").getData();
                    aLineItemArr = oLineItem1;
                    if (key) {
                        var SelectedKey = key;
                        oLineItem.Bnfpo = key;
                    } else {
                        var SelectedKey = oLineItem.Bnfpo;
                    }
                    // var SelectedKey = oLineItem.Bnfpo;
                    var selectedobj = oLineItem1.HdrToItemNav.results.filter(function (oLineItem2, idx) {
                        if (oLineItem2.Bnfpo == SelectedKey) {
                            indx = idx;
                        }
                        return oLineItem2.Bnfpo == SelectedKey;
                    });
                    if (selectedobj.length > 0) {
                        aLineItemArr.HdrToItemNav.results[indx] = oLineItem;
                        selectedobj = oLineItem;

                    } else {
                        aLineItemArr.HdrToItemNav.results.push(oLineItem);
                    }
                } else {
                    aLineItemArr.HdrToItemNav.results.push(oLineItem);
                }
                var finalValue = "0";
                aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                    var itemValue = val.Menge * val.Preis;
                    if (isNaN(itemValue) === true) {
                        itemValue = 0;
                    }
                    itemValue = parseFloat(itemValue).toFixed(2);
                    val.Gswrt = itemValue.toString();
                    finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                });
                // HeaderData.Rlwrt = finalValue;
                if (isNaN(finalValue) === true) {
                    finalValue = 0;
                }
                finalValue = parseFloat(finalValue).toFixed(2);
                this.getOwnerComponent().lineitem = finalValue;
                var oLineItemModel = new sap.ui.model.json.JSONModel(aLineItemArr);
                this.getView().setModel(oLineItemModel, "PRPreviewModel");
                this.getView().getModel("PRPreviewModel").setProperty("/Rlwrt", finalValue);
                //this.getView().getModel("PRPreviewModel").refresh(true);
                this.getView().getModel("PRPreviewModel").refresh(true);

                this.getOwnerComponent().Close = "";
                //this.dialogClose();
            },

            onCodingSelect: function (oEvent) {
                if (oEvent.getSource().getSelected() === true) {
                    this.getView().byId("CodingDetails").setVisible(true);
                } else {
                    this.getView().byId("CodingDetails").setVisible(false);
                }

            },

            onSubmitPR: function (flag) {
                var chkflag = "";
                var msg = "Please fill mandatory field values for line item";
                var FinalData = this.getView().getModel("PRPreviewModel").getData();
                FinalData.HdrToItemNav.results.forEach(function (val, index) {
                    var itemflg = "";
                    if (val.Bkgrp === "") {
                        chkflag = "X";
                        itemflg = "X";
                    }

                    if (val.Matkl === "") {
                        chkflag = "X";
                        itemflg = "X";
                    }

                    if (val.Knttp === "9") {
                        if (val.Isbn === "") {
                            chkflag = "X";
                            itemflg = "X";
                        }

                    } else if (val.Knttp === "K") {
                        if (val.Kostl === "") {
                            chkflag = "X";
                            itemflg = "X";
                        }
                    } else if (val.Knttp === "F") {
                        if (val.Aufnr === "") {
                            chkflag = "X";
                            itemflg = "X";
                        }
                    } else if (val.Knttp === "8") {
                        if (val.Prctr === "") {
                            chkflag = "X";
                            itemflg = "X";
                        }
                    } else {
                        chkflag = "X";
                        itemflg = "X";
                    }

                    if (itemflg === "X") {
                        msg = msg + " " + val.Bnfpo + ",";
                    }
                    //itemflg = val.Bnfpo;
                    // }
                });
                if (chkflag === "") {
                    SubmitFlag = "X";
                    if (flag === "frag") {
                        this.dialogClose();
                    }
                    this.onSubmit();
                } else {
                    //    var msg = "Please fill mandatory field values for line item" + "  " + itemflg;
                    sap.m.MessageBox.error(msg, {
                        title: "Error",
                    });
                }
            },

            onQuanUpdate: function (oEvent) {
                this._oConfirmPopover = sap.ui.xmlfragment("zinboxall.Fragments.UpdateQuantity", this);
                this.getView().addDependent(
                    this._oConfirmPopover);
                this._oConfirmPopover.open();
                sap.ui.getCore().byId("idCTV1").setValue("");
                sap.ui.getCore().byId("idCDV1").setValue("");
                sap.ui.getCore().byId("idCTV2").setValue("");
                sap.ui.getCore().byId("idCDV2").setValue("");
            },

            onQuanClose: function (oEvent) {
                this._oConfirmPopover.close();
                this._oConfirmPopover.destroy();
            },

            onQuanSubmit: function (oEvent) {
                this.getView().setBusy(true);
                var Data = this.getView().getModel("QuantityModel").getData();
                var FinalData = this.getView().getModel("PRPreviewModel").getData().HdrToItemNav.results;
                var Quantity = "", Price = "", operation = "";
                var finalValue = "0";
                var flag = "";
                var that = this;
                if (Data.quantity || Data.quantity1 || Data.price || Data.price1) {

                    if (Data.quantity !== "" || Data.quantity1 !== "" || Data.price !== "" || Data.price1 !== "") {
                        flag = "";
                    } else {
                        flag = "X";
                    }
                } else {
                    flag = "X";
                }
                if (flag === "X") {
                    this.getView().setBusy(false);
                    this.fnMessageBox("ERROR", sap.m.MessageBox.Icon.ERROR, "Please enter atleast one value");
                    return;
                }
                FinalData.forEach(function (val, idx) {
                    if (Data.quantity) {
                        if (Data.quantity !== "") {
                            Quantity = val.Menge * Data.quantity / 100;
                            val.Menge = parseFloat(val.Menge) + parseFloat(Quantity);
                            val.Menge = parseFloat(val.Menge).toFixed(2);
                        }
                    }
                    if (Data.quantity1) {
                        if (Data.quantity1 !== "") {
                            Quantity = val.Menge * Data.quantity1 / 100;
                            val.Menge = parseFloat(val.Menge) - parseFloat(Quantity);
                            val.Menge = parseFloat(val.Menge).toFixed(2);
                        }

                    }
                    if (Data.price) {
                        if (Data.price !== "") {
                            Price = val.Preis * Data.price / 100;
                            val.Preis = parseFloat(val.Preis) + parseFloat(Price);
                            val.Preis = parseFloat(val.Preis).toFixed(2);
                        }
                    }
                    if (Data.price1) {
                        if (Data.price1 !== "") {
                            Price = val.Preis * Data.price1 / 100;
                            val.Preis = parseFloat(val.Preis) - parseFloat(Price);
                            val.Preis = parseFloat(val.Preis).toFixed(2);
                        }
                    }

                    var itemValue = val.Menge * val.Preis;
                    val.Gswrt = parseFloat(itemValue).toFixed(2);
                    val.Gswrt = val.Gswrt.toString();
                    finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                    if (isNaN(finalValue) === true) {
                        finalValue = 0;
                    }
                    finalValue = parseFloat(finalValue).toFixed(2);
                    that.getOwnerComponent().lineitem = finalValue;
                });

                this.onQuanClose();
                this.getView().getModel("PRPreviewModel").setProperty("/Rlwrt", finalValue);
                this.getView().getModel("PRPreviewModel").refresh(true);


                this.getView().setBusy(false);
            },

            onIncQuanChange: function (oEvent) {
                var Data = this.getView().getModel("QuantityModel").getData();
                if (oEvent.getSource().getValue() > 0) {

                } else {
                    oEvent.getSource().setValue("");
                    sap.m.MessageBox.error("Value can't contain negative values or can't be zero", {
                        title: "Error",
                    });
                }
                Data.quantity1 = "";
            },

            onDecQuanChange: function (oEvent) {
                var Data = this.getView().getModel("QuantityModel").getData();
                if (oEvent.getSource().getValue() > 0 && oEvent.getSource().getValue() <= 99) {
                } else {
                    oEvent.getSource().setValue("");
                    sap.m.MessageBox.error("Value can't contain negative values or can't be zero or can't be greater than 99", {
                        title: "Error",
                    });
                }
                Data.quantity = "";
                // if(oEvent.getSource().getValue())
            },

            onIncPriceChange: function (oEvent) {
                var Data = this.getView().getModel("QuantityModel").getData();
                if (oEvent.getSource().getValue() > 0) {

                } else {
                    oEvent.getSource().setValue("");
                    sap.m.MessageBox.error("Value can't contain negative values or can't be zero", {
                        title: "Error",
                    });
                }
                Data.price1 = "";
            },

            onDecPriceChange: function (oEvent) {
                var Data = this.getView().getModel("QuantityModel").getData();
                if (oEvent.getSource().getValue() > 0 && oEvent.getSource().getValue() <= 99) {
                } else {
                    oEvent.getSource().setValue("");
                    sap.m.MessageBox.error("Value can't contain negative values or can be zero or can't be greater than 99", {
                        title: "Error",
                    });
                }
                Data.price = "";
            },

            onPRLineDelete: function (oEvent) {
                var that = this;
                sap.m.MessageBox.show(
                    "Do you want to delete the line item? ", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    title: "Warning",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === 'YES') {
                            that.onPRLineDelete1(oEvent);
                        }
                    }
                }
                )
              
            },

            onPRLineDelete1: function (oEvent) {
                this.getOwnerComponent().Close = "";
                var Bnfpo = this.getView().byId("PRPreviewTable").getSelectedItem().getBindingContext("PRPreviewModel").getObject().Bnfpo;
                var oLineItem1 = this.getView().getModel("PRPreviewModel").getData();
                var SelectedKey = Bnfpo;
                var Array = this.getOwnerComponent().items;
                var flag = "";
                var that = this;
                oLineItem1.HdrToItemNav.results.forEach(function (val, idx) {
                    if (val.Bnfpo === SelectedKey) {
                        oLineItem1.HdrToItemNav.results.splice(idx, 1);
                        flag = "X";
                        if (val.Zestak === "Saved") {
                            val.Loekz = "X";
                            DeleteArray.push(val);
                        } else {
                            // that.newitem = "X";
                        }
                        Array.splice(idx, 1);
                    }
                });

                if (flag === "X") {
                    var finalValue = "0";
                    aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                        var itemValue = val.Menge * val.Preis;

                        if (isNaN(itemValue) === true) {
                            itemValue = 0;
                        }
                        itemValue = parseFloat(itemValue).toFixed(2);
                        val.Gswrt = itemValue.toString();
                        //   val.Gswrt = itemValue.toString();
                        finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                    });
                    // HeaderData.Rlwrt = finalValue;
                    if (isNaN(finalValue) === true) {
                        finalValue = 0;
                    }
                    finalValue = parseFloat(finalValue).toFixed(2);
                    this.getOwnerComponent().lineitem = finalValue;
                    this.getView().getModel("PRPreviewModel").setProperty("/Rlwrt", this.getOwnerComponent().lineitem);
                    this.getView().getModel("PRPreviewModel").refresh(true);
                    //  this.dialogClose();
                    TotArr = [];
                    TotArr = TotArr.concat(aLineItemArr.HdrToItemNav.results, DeleteArray);
                    var odata1 = {};
                    TotArr.forEach(function (val, idx) {
                        odata1 = val;
                    })
                    if (odata1.Bnfpo) {
                        this.getOwnerComponent().lineno = parseInt(odata1.Bnfpo) + parseInt(10);
                        this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                        //  this.getOwnerComponent().lineno =  + 10;
                    };
                    sap.m.MessageBox.success("Data has been deleted", {
                        title: "Success",
                    });
                }
            },

            onPRCodingDetail: function (oEvent) {
                // this.getOwnerComponent().Close = "";
                this.onCodingDetail(oEvent);
            },
            handleRemovePress: function (oEvent) {
                var that = this;
                sap.m.MessageBox.show(
                    "Do you want to delete the line item? ", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    title: "Warning",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === 'YES') {
                            that.handleRemovePress1(oEvent);
                        }
                    }
                }
                )
              
            },
            handleRemovePress1: function (oEvent) {
                this.getOwnerComponent().Close = "";
                var finalValue = "0";
                if (PRNo === "X") {
                    var oLineItem = sap.ui.getCore().getModel("PRLineItemModel").getData();
                    var Array = this.getOwnerComponent().items;
                    var index = "";
                    if (this.getView().getModel("PRPreviewModel")) {
                        var oLineItem1 = this.getView().getModel("PRPreviewModel").getData();
                        var SelectedKey = oLineItem.Bnfpo;
                        var flag = "";
                        oLineItem1.HdrToItemNav.results.forEach(function (val, idx) {
                            if (val.Bnfpo === SelectedKey) {
                                if (val.Zestak === "Saved") {
                                    val.Loekz = "X";
                                    DeleteArray.push(val);
                                }
                                oLineItem1.HdrToItemNav.results.splice(idx, 1);
                                Array.splice(idx, 1);
                                flag = "X";
                            }
                        });

                        if (flag === "X") {
                            var finalValue = "0";
                            aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                                var itemValue = val.Menge * val.Preis;

                                if (isNaN(itemValue) === true) {
                                    itemValue = 0;
                                }
                                itemValue = parseFloat(itemValue).toFixed(2);
                                val.Gswrt = itemValue.toString();
                                // val.Gswrt = itemValue.toString();
                                finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                            });
                            // HeaderData.Rlwrt = finalValue;
                            if (isNaN(finalValue) === true) {
                                finalValue = 0;
                            }
                            finalValue = parseFloat(finalValue).toFixed(2);
                            this.getOwnerComponent().lineitem = finalValue;
                            this.getView().getModel("PRPreviewModel").setProperty("/Rlwrt", this.getOwnerComponent().lineitem);
                            this.getView().getModel("PRPreviewModel").refresh(true);
                            // this.dialogClose();
                            sap.m.MessageBox.success("Data has been deleted", {
                                title: "Success",
                            });
                            var data = {};
                            aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                                data = val;
                            });

                            oLineItem = data;

                            if (data.Bnfpo) {
                                this.getOwnerComponent().lineno = data.Bnfpo;
                            }

                            //this.getOwnerComponent().lineno = this.getOwnerComponent().lineno - 10;

                            if (this.getOwnerComponent().items.length === 0) {
                                this.getOwnerComponent().lineno = "10";
                                var obj = { Bnfpo: this.getOwnerComponent().lineno }
                                this.getOwnerComponent().items.push(obj);
                                var typ = "No";
                                this.onclearlineitem(oLineItem);
                                this.getOwnerComponent().Close = "X";

                                this.onFillLineItemData(typ);
                            } else {
                                var oModel = new sap.ui.model.json.JSONModel(oLineItem);
                                this.getView().setModel(oModel, "PRLineItemModel");
                                sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                                if (oLineItem) {
                                    if (oLineItem.Knttp) {
                                        this.setCodingVisibility(oLineItem.Knttp);
                                    }
                                    this.setCodingInputFilters(oLineItem);
                                    this.getOwnerComponent().accountassign = oLineItem.Knttp;
                                    this.getOwnerComponent().plants = oLineItem.Werks;
                                    this.getView().getModel("PRLineModel").refresh(true);
                                   

                                }
                            }

                            var oModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().items);
                            this.getView().setModel(oModel, "PRLineModel");
                            sap.ui.getCore().setModel(oModel, "PRLineModel");
                            sap.ui.getCore().getModel("PRLineModel").refresh(true);
                        } else {
                            var data = {};
                            aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                                data = val;
                            });



                            oLineItem = data;

                            Array.forEach(function (val, idx) {
                                if (val.Bnfpo === SelectedKey) {
                                    index = idx;
                                    Array.splice(idx, 1);
                                }
                            });

                            this.getOwnerComponent().Close = "X";
                            if (data.Bnfpo) {
                                this.getOwnerComponent().lineno = data.Bnfpo;
                            }

                            if (this.getOwnerComponent().items.length === 0) {
                                this.getOwnerComponent().lineno = "10";
                                var obj = { Bnfpo: this.getOwnerComponent().lineno }
                                this.getOwnerComponent().items.push(obj);
                                var typ = "No";
                                this.onclearlineitem(oLineItem);
                                this.onFillLineItemData(typ);
                            } else {
                                oLineItem = data;
                                var oModel = new sap.ui.model.json.JSONModel(oLineItem);
                                this.getView().setModel(oModel, "PRLineItemModel");
                                sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                                if (oLineItem) {
                                    if (oLineItem.Knttp) {
                                        this.setCodingVisibility(oLineItem.Knttp);
                                    }
                                    this.setCodingInputFilters(oLineItem);
                                    this.getOwnerComponent().accountassign = oLineItem.Knttp;
                                    this.getOwnerComponent().plants = oLineItem.Werks;
                                    this.getView().getModel("PRLineModel").refresh(true);


                                }
                            }


                        }
                    } else {
                        sap.m.MessageBox.information("Line Item can't be deleted", {
                            title: "Information",
                        });
                    }
                } else {
                    var oLineItem = sap.ui.getCore().getModel("PRLineItemModel").getData();
                    var Array = this.getOwnerComponent().items;
                    if (this.getView().getModel("PRPreviewModel")) {
                        var oLineItem1 = this.getView().getModel("PRPreviewModel").getData();
                        var SelectedKey = oLineItem.Bnfpo;
                        var flag = "";
                        oLineItem1.HdrToItemNav.results.forEach(function (val, idx) {
                            if (val.Bnfpo === SelectedKey) {
                                if (val.Zestak === "Saved") {
                                    val.Loekz = "X";
                                    DeleteArray.push(val);
                                }
                                oLineItem1.HdrToItemNav.results.splice(idx, 1);
                                Array.splice(idx, 1);
                                flag = "X";
                            }
                        });

                        if (flag === "X") {
                            var finalValue = "0";
                            aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                                var itemValue = val.Menge * val.Preis;

                                if (isNaN(itemValue) === true) {
                                    itemValue = 0;
                                }
                                itemValue = parseFloat(itemValue).toFixed(2);
                                val.Gswrt = itemValue.toString();
                                // val.Gswrt = itemValue.toString();
                                finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                            });
                            // HeaderData.Rlwrt = finalValue;
                            if (isNaN(finalValue) === true) {
                                finalValue = 0;
                            }
                            finalValue = parseFloat(finalValue).toFixed(2);
                            this.getOwnerComponent().lineitem = finalValue;
                            this.getView().getModel("PRPreviewModel").setProperty("/Rlwrt", this.getOwnerComponent().lineitem);
                            this.getView().getModel("PRPreviewModel").refresh(true);
                            //this.dialogClose();

                            var data = {};
                            aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                                data = val;
                            });

                            oLineItem = data;
                            TotArr = [];
                            TotArr = TotArr.concat(aLineItemArr.HdrToItemNav.results, DeleteArray);
                            /* var odata1 = {};
                             TotArr.forEach(function(val,idx){
                                 odata1 = val;
                             })*/
                            var values = TotArr.map(val => val.Bnfpo);
                            var max = Math.max.apply(null, values);
                            if (max) {
                                this.getOwnerComponent().lineno = parseInt(max) + parseInt(10);
                                this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                            }
                            /*   this.getOwnerComponent().lineno = max;
                               
                               if(odata1.Bnfpo){
                                   this.getOwnerComponent().lineno = parseInt(odata1.Bnfpo) + parseInt(10);
                                   this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                             //  this.getOwnerComponent().lineno =  + 10;
                               };*/
                            var oModel = new sap.ui.model.json.JSONModel(oLineItem);
                            this.getView().setModel(oModel, "PRLineItemModel");
                            sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                            if (oLineItem) {
                                if (oLineItem.Knttp) {
                                    this.setCodingVisibility(oLineItem.Knttp);
                                }
                                this.setCodingInputFilters(oLineItem);
                                this.getOwnerComponent().accountassign = oLineItem.Knttp;
                                this.getOwnerComponent().plants = oLineItem.Werks;


                            }
                            var oModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().items);
                            this.getView().setModel(oModel, "PRLineModel");
                            sap.ui.getCore().setModel(oModel, "PRLineModel");
                            sap.ui.getCore().getModel("PRLineModel").refresh(true);
                            var oModel = new sap.ui.model.json.JSONModel(oLineItem);
                            this.getView().setModel(oModel, "PRLineItemModel");
                            sap.ui.getCore().setModel(oModel, "PRLineItemModel");

                            var oModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().items);
                            this.getView().setModel(oModel, "PRLineModel");
                            sap.ui.getCore().setModel(oModel, "PRLineModel");
                            sap.ui.getCore().getModel("PRLineModel").refresh(true);
                            this.newitem = "";
                            sap.m.MessageBox.success("Data has been deleted", {
                                title: "Success",
                            });
                        } else {
                            var data = {};
                            aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                                data = val;
                            });

                            oLineItem = data;
                            TotArr = [];
                            TotArr = TotArr.concat(aLineItemArr.HdrToItemNav.results, DeleteArray);
                            var values = TotArr.map(val => val.Bnfpo);
                            var max = Math.max.apply(null, values);
                            if (max) {
                                this.getOwnerComponent().lineno = parseInt(max) + parseInt(10);
                                this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                            }
                            /*  var odata1 = {};
                              TotArr.forEach(function(val,idx){
                                  odata1 = val;
                              })
                              if(odata1.Bnfpo){
                                  this.getOwnerComponent().lineno = parseInt(odata1.Bnfpo) + parseInt(10);
                                  this.getOwnerComponent().lineno = this.getOwnerComponent().lineno.toString();
                            //  this.getOwnerComponent().lineno =  + 10;
                              };*/

                            /*\\  Array.forEach(function (val, idx) {
                                  if (val.Bnfpo === SelectedKey) {
                                      index = idx;
                                      Array.splice(idx, 1);
                                  }
                              });*/
                            this.getOwnerComponent().Close = "X";
                            this.newitem = "X";
                            var oModel = new sap.ui.model.json.JSONModel(oLineItem);
                            this.getView().setModel(oModel, "PRLineItemModel");
                            sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                            if (oLineItem) {
                                if (oLineItem.Knttp) {
                                    this.setCodingVisibility(oLineItem.Knttp);
                                }
                                this.setCodingInputFilters(oLineItem);
                                this.getOwnerComponent().accountassign = oLineItem.Knttp;
                                this.getOwnerComponent().plants = oLineItem.Werks;
                                this.getView().getModel("PRLineModel").refresh(true);

                            }


                        }
                    } else {
                        sap.m.MessageBox.information("Line Item can't be deleted", {
                            title: "Information",
                        });
                    }

                }
            },
            onLineSubmit: function (oEvent) {
                // this.dialogClose();
                this.onLineItemSave1();
                SubmitFlag = "X";
                this.onSubmit();
            },

            setSubFlag: function (type) {
                SubmitFlag = type;
            },

            onSubmit1: function (oEvent) {
                SubmitFlag = "";
                this.onSubmit(oEvent);
            },
            onSubmit: function (oEvent) {
                this.getView().setBusy(true);
                var oMdl = this.getOwnerComponent().getModel();
                var that = this;
                var FinalData = this.getView().getModel("PRPreviewModel").getData();
                var oPRHeaderObj = aLineItemArr;
                if (this.getOwnerComponent().lineitem === "" || Number.isNaN(this.getOwnerComponent().lineitem) === true) {
                    this.getOwnerComponent().lineitem = oPRHeaderObj.Rlwrt;
                }
                var Status = "Saved";
                var LineStatus = "Saved";
                if (SubmitFlag === "X") {
                    Status = "Submitted";
                    LineStatus = "In Progress"
                }
                var oFinalObj = {};
                var Banfn = "";
                if (oPRHeaderObj.Banfn) {
                    Banfn = oPRHeaderObj.Banfn;
                }
                oFinalObj.Banfn = Banfn;
                oFinalObj.Text = oPRHeaderObj.Text;
                oFinalObj.Elifn = oPRHeaderObj.Elifn;
                oFinalObj.Waers = oPRHeaderObj.Waers;
                oFinalObj.Zestak = Status;
                oFinalObj.Rlwrt = this.getOwnerComponent().lineitem.toString();
                oFinalObj.Erfdate = oPRHeaderObj.Erfdate;
                if (oPRHeaderObj.Name1) {
                    if (oPRHeaderObj.Name1 !== "") {
                        oFinalObj.Name1 = oPRHeaderObj.Name1;
                    } else {
                        oFinalObj.Name1 = this.getOwnerComponent().VendorName;
                    }
                } else {
                    oFinalObj.Name1 = this.getOwnerComponent().VendorName;
                }
                // oFinalObj.Gswrt = oPRHeaderObj.Gswrt;
                FinalData.HdrToItemNav.results = FinalData.HdrToItemNav.results.concat(DeleteArray);
                if (FinalData.HdrToItemNav.results.length === 0 && PRNo === "X") {
                    var linearr = [];
                    if (sap.ui.getCore().getModel("PRLineItemModel")) {
                        var obj = sap.ui.getCore().getModel("PRLineItemModel").getData();
                        linearr.push((obj));
                        FinalData.HdrToItemNav.results = linearr;
                    } else {
                        var oPRLineItemObj = {};
                        oPRLineItemObj.Text = oPRHeaderObj.Text;
                        oPRLineItemObj.Elifn = oPRHeaderObj.Elifn;
                        oPRLineItemObj.Waers = oPRHeaderObj.Waers;
                        oPRLineItemObj.Bnfpo = "10";
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
                        oPRLineItemObj.DelvAdrTyp = 0;
                        var itemValue = oPRLineItemObj.Menge * oPRLineItemObj.Preis;
                        if (isNaN(itemValue) === true) {
                            itemValue = 0;
                        }
                        itemValue = parseFloat(itemValue).toFixed(2);
                        oPRLineItemObj.Gswrt = itemValue.toString();
                        linearr.push(oPRLineItemObj);
                        FinalData.HdrToItemNav.results = linearr;
                    }
                }
                FinalData.HdrToItemNav.results.forEach(function (val, index) {
                    val.Banfn = Banfn;
                    val.Elifn = oFinalObj.Elifn;
                    if (val.Lfdat !== "") {
                        var Date1 = new Date(val.Lfdat);
                        if (val.Lfdat) {
                            if (val.Lfdat[2] === "." && (isNaN(Date1.getTime()))) {
                                var ui = val.Lfdat.split(".");
                                var Date12 = ui[2] + "-" + ui[1] + "-" + ui[0];
                                Date1 = new Date(Date12);
                            }
                        }
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                            pattern: "yyyy-MM-dd"
                        });
                        var FormattedDate = oDateFormat.format(Date1);
                        //   if (val.Lfdat.includes("T00:00:00") !== true) {
                        val.Lfdat = FormattedDate + "T00:00:00";
                        // }

                    } else {
                        val.Lfdat = null;
                    }
                    val.Zestak = LineStatus;
                    if (val.Menge === "") {
                        val.Menge = "0";
                    } else {
                        val.Menge = val.Menge.toString();
                    }
                    if (val.Preis === "") {
                        val.Preis = "0";
                    } else {
                        val.Preis = val.Preis.toString();
                    }

                    if (val.Gswrt === "") {
                        val.Gswrt = "0";
                    }
                    if (val.Text1) {
                        val.Text = val.Text1;
                    }
                    delete val.Rlwrt;
                    delete val.Text1;
                    //delete val.DelvAdrTyp;
                });

                oFinalObj.HdrToItemNav = FinalData.HdrToItemNav.results;
                oMdl.create("/PRHeaderSet", oFinalObj, {
                    success: function (oData) {
                        var aPRList = [];
                        var sAlert = "PR has been successfully created";
                        sap.m.MessageBox.success(sAlert, {
                            title: "Success",
                            actions: [sap.m.MessageBox.Action.OK],
                            onClose: function (oAction) {
                                that.onBack();
                            }
                        });
                        // this.onBack();

                    }.bind(this),
                    error: function (oError) {
                        var sAlert = JSON.parse(oError.responseText).error.message.value;
                        var MsgType = "";
                        var arr = [];
                        //var MsgType = JSON.parse(oError.responseText).error.innererror.errordetails[0].severity;
                        if (JSON.parse(oError.responseText).error.innererror.errordetails[0]) {
                            arr = JSON.parse(oError.responseText).error.innererror.errordetails;
                            MsgType = JSON.parse(oError.responseText).error.innererror.errordetails[0].severity;
                        }
                        if (MsgType === "success") {
                            if (SubmitFlag !== "X") {
                                if (arr.length > 1) {
                                    sAlert = arr[0].message;
                                }
                                var split1 = sAlert.split("is");
                                var split2 = split1[0].split(".");
                                this.PRNum = split2[1].trim();
                                this.getOwnerComponent().PRNum = this.PRNum;
                            } else {
                                var Msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                                sAlert = Msg;
                                var split1 = Msg.split("Purchase Requisition");
                                var split2 = split1[1].split("is");
                                this.PRNum = split2[0].trim();
                                this.getOwnerComponent().PRNum = this.PRNum;
                            }
                            if (PRNo === "X") {
                                this.onStartUpload(this.PRNum);
                            }
                            this.getView().setBusy(false);
                            if (SubmitFlag === "X") {
                                 this.onWorkflow(this.getOwnerComponent().PRNum);
                            }
                            sap.m.MessageBox.success(sAlert, {
                                title: "Success",
                                actions: [sap.m.MessageBox.Action.OK],
                                onClose: function (oAction) {
                                    that.onBack();
                                }
                            });

                        } else {
                            this.getView().setBusy(false);
                            if (arr.length > 0) {
                                this.onMsgDisplay();
                                var oModel = new sap.ui.model.json.JSONModel(arr);
                                sap.ui.getCore().setModel(oModel, "ErrorMsgModel");
                                this.getView().setModel(oModel, "ErrorMsgModel");
                            } else {
                                sap.m.MessageBox.error(sAlert, {
                                    title: "Error",
                                });
                            }
                        }
                    }.bind(this)
                });
            },

            handleDeliveryLoc: function (oevent, octrl) {
                if (!octrl) {
                    octrl = this;
                }
                // octrl.DelLoc();
                var Lineobj = sap.ui.getCore().getModel("PRLineItemModel").getData();
                var flag = false;
                if (Lineobj.DelvAdrTyp === 1) {
                    flag = true
                } else {
                    if (this.getOwnerComponent().plants !== "") {
                        this.onDelLoc();
                    } else {
                        sap.m.MessageBox.information("Company Code is not found for selected requisition type", {
                            title: "Information",
                        });
                        return;
                    }
                }
                this.fnValueHelpDialogOpen(oevent, octrl._DeliveryLocation, "DeliveryLocation", octrl, "x");
                if (sap.ui.getCore().byId("rbg3")) {
                    sap.ui.getCore().byId("rbg3").setSelectedIndex(Lineobj.DelvAdrTyp);
                }
                this.onSetDeliveryLocation([Name, Buiding, Street, City, PostalCode, Country], flag);
                //this.getView().setModel(this.oMod,"DeliveryAddModel")

                //this.onDelLoc();
            },
            onDeliverySubmit: function (evt) {
                //  var obj=evt.getSource().getModel("DeliveryAddModel").getData().results[0];
                var obj = evt.getSource().getModel("DeliveryAddModel").getData();
                //   var heaadMod = sap.ui.getCore().getModel("PRHeaderModel").getData();
                var PrevData = sap.ui.getCore().getModel("PRLineItemModel").getData();
                var ar = obj.LAND1, a1 = obj.WERKS, a2 = obj.NAME1, a3 = obj.STRAS, a4 = obj.PSTLZ, a5 = obj.ORT01,a6 = obj.ADRNR;
             
                if (sap.ui.getCore().getModel("PRLineItemModel")) {
                    var Fragdata = sap.ui.getCore().getModel("PRLineItemModel").getData();
                    Fragdata.Land1 = ar;
                    Fragdata.Building = a1;
                    Fragdata.AdrName = a2;
                    Fragdata.Street = a3;
                    Fragdata.PostCode = a4;
                    Fragdata.City = a5;
                    Fragdata.Addrnumber = a6;
                    Fragdata.DelvAdrTyp = sap.ui.getCore().byId("rbg3").getSelectedIndex();
                }
                /*   PrevData.Land1 = ar;
                   PrevData.Building = a1;
                   PrevData.Name1 = a2;
                   PrevData.Street = a3;
                   PrevData.PostCode = a4;
                   PrevData.City = a5;
                   PrevData.DelvAdrTyp = sap.ui.getCore().byId("rbg3").getSelectedIndex();*/
                //heaadMod.DelvAdrTyp = sap.ui.getCore().byId("rbg3").getSelectedIndex();
                // heaadMod.Land1 = ar;
                //evt.getSource().getModel("DeliveryAddModel").setData(heaadMod);
                this.OnCloseDialog(evt);
                /* var oMode1 = new sap.ui.model.json.JSONModel(Fragdata);
                 this.getView().setModel(oMode1,"PRLineItemModel");*/
                sap.ui.getCore().getModel("PRHeaderModel").refresh();
                sap.ui.getCore().getModel("PRLineItemModel").refresh();
            },
            onDelLoc: function () {
                if (this.getOwnerComponent().plants !== "") {
                    var tat = this;
                    this.oModel = this.getOwnerComponent().getModel("valuehelp");
                    var oFilter = [new sap.ui.model.Filter("WERKS", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().plants)];
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
                        },
                        error: function (e) {
                        }

                    });
                } else {
                    sap.m.MessageBox.information("Company Code is not found for selected requisition type", {
                        title: "Information",
                    });
                }
            },

            onSelectAddress: function (evt) {
                var oBtn = evt.getParameters().selectedIndex;
                if (oBtn === 1) {
                    evt.getSource().getParent().getContent()[1].getModel("DeliveryAddModel").getData().results = ""
                    evt.getSource().getParent().getContent()[1].getModel("DeliveryAddModel").refresh();
                    this.onSetDeliveryLocation([Name, Buiding, Street, City, PostalCode, Country], true);
                } else {
                    this.onDelLoc();
                    this.onSetDeliveryLocation([Name, Buiding, Street, City, PostalCode, Country], false);
                    //this.getView().setModel(this.oMod,"DeliveryAddModel");
                }
            },

            onLineItemSelect: function (oEvent) {
                /*    var SelectedKey = oEvent.getSource().getSelectedKey();
                    // var HeaderMod = sap.ui.getCore().getModel("PRHeaderModel").getData();
                    if (this.getView().getModel("PRPreviewModel")) {
                        var oLineItem = this.getView().getModel("PRPreviewModel").getData();
                        var selectedobj = oLineItem.HdrToItemNav.results.filter(function (oLineItem) {
                            return oLineItem.Bnfpo == SelectedKey;
                        });
                        var PRData = selectedobj[0];
                        if (PRData.Lfdat !== "") {
                            var Date1 = new Date(PRData.Lfdat);
                            if (PRData.Lfdat) {
                                if (PRData.Lfdat[2] === "." && (isNaN(Date1.getTime()))) {
                                    var ui = PRData.Lfdat.split(".");
                                    var Date12 = ui[2] + "-" + ui[1] + "-" + ui[0];
                                    Date1 = new Date(Date12);
                                }
                            }
                            // jquery.sap.require("sap.ui.core.format.DateFormat");
                            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                                pattern: "dd.MM.yyyy"
                            });
                            PRData.Lfdat = oDateFormat.format(Date1);
                        }
     
                        var obj1 = selectedobj[0];
                        var obj = {};
                        obj.LAND1 = obj1.Land1;
                        obj.WERKS = obj1.Building;
                        obj.NAME1 = obj1.Name1;
                        obj.STRAS = obj1.Street;
                        obj.PSTLZ = obj1.PostCode;
                        obj.ORT01 = obj1.City;
                        // HeaderMod.DelvAdrTyp = obj1.DelvAdrTyp;
                        var oModel1 = new sap.ui.model.json.JSONModel(obj);
                        this.getView().setModel(oModel1, "DeliveryAddModel");
     
     
                        var oModel = new sap.ui.model.json.JSONModel(selectedobj[0]);
                        this.getView().setModel(oModel, "PRLineItemModel");
                        sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                        if (selectedobj[0].Knttp) {
                            this.setCodingVisibility(selectedobj[0].Knttp);
                        }
                    }*/
                var that = this;
                var SelectedKey = oEvent.getSource().getSelectedKey();
                /* if(this.getOwnerComponent().lastlinekey === ""){
                     var ui = sap.ui.getCore().byId("idReqItemNo").getDomRef();
                     var op = ui.innerText;
                     var yu = op.split("\n");
                     this.getOwnerComponent().lastlinekey = yu[0];
                    }*/
                var valid = this.onSaveSubmitPrew();
                if (valid !== "a") {

                    // this.onFillLineItemData();

                    var SelectedKey = this.getOwnerComponent().lastlinekey;
                    // var HeaderMod = sap.ui.getCore().getModel("PRHeaderModel").getData();
                    if (this.getView().getModel("PRPreviewModel")) {
                        var oLineItem = this.getView().getModel("PRPreviewModel").getData();
                        var selectedobj = oLineItem.HdrToItemNav.results.filter(function (oLineItem) {
                            return oLineItem.Bnfpo == SelectedKey;
                        });

                        var PRData = selectedobj[0];
                        if (PRData) {
                            if (PRData.Lfdat) {
                                if (PRData.Lfdat !== "") {
                                    var Date1 = new Date(PRData.Lfdat);
                                    if (PRData.Lfdat) {
                                        if (PRData.Lfdat[2] === "." && (isNaN(Date1.getTime()))) {
                                            var ui = PRData.Lfdat.split(".");
                                            var Date12 = ui[2] + "-" + ui[1] + "-" + ui[0];
                                            Date1 = new Date(Date12);
                                        }
                                    }

                                    // jquery.sap.require("sap.ui.core.format.DateFormat");
                                    var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                                        pattern: "dd.MM.yyyy"
                                    });
                                    PRData.Lfdat = oDateFormat.format(Date1);
                                }
                            }
                        }
                        if (selectedobj[0]) {

                        }
                        this.onLineItemSave("", SelectedKey);
                        var Selkey = oEvent.getSource().getSelectedKey();
                        var oLineItem = this.getView().getModel("PRPreviewModel").getData();
                        var selectedobj = oLineItem.HdrToItemNav.results.filter(function (oLineItem) {
                            return oLineItem.Bnfpo == Selkey;
                        });
                        if (selectedobj[0]) {
                            if (selectedobj[0].Knttp) {
                                this.setCodingVisibility(selectedobj[0].Knttp);
                            }
                        }


                        if (selectedobj[0]) {
                            var obj1 = selectedobj[0];
                            if (obj1.Text) {
                                obj1.Text1 = obj1.Text;
                            }
                            var obj = {};
                            if (obj1.Land1) {
                                obj.LAND1 = obj1.Land1;
                                obj.WERKS = obj1.Building;
                                obj.NAME1 = obj1.AdrName;
                                obj.STRAS = obj1.Street;
                                obj.PSTLZ = obj1.PostCode;
                                obj.ORT01 = obj1.City;
                                obj.ADRNR = obj1.Addrnumber;
                            }
                            //  var PRData = selectedobj[0];
                            if (selectedobj[0]) {
                                if (selectedobj[0].Lfdat) {
                                    if (selectedobj[0].Lfdat !== "") {
                                        var Date1 = new Date(selectedobj[0].Lfdat);
                                        if (selectedobj[0].Lfdat) {
                                            if (selectedobj[0].Lfdat[2] === "." && (isNaN(Date1.getTime()))) {
                                                var ui = selectedobj[0].Lfdat.split(".");
                                                var Date12 = ui[2] + "-" + ui[1] + "-" + ui[0];
                                                Date1 = new Date(Date12);
                                            }
                                        }

                                        // jquery.sap.require("sap.ui.core.format.DateFormat");
                                        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                                            pattern: "dd.MM.yyyy"
                                        });
                                        selectedobj[0].Lfdat = oDateFormat.format(Date1);
                                    }
                                }
                            }
                            // HeaderMod.DelvAdrTyp = obj1.DelvAdrTyp;
                            var oModel1 = new sap.ui.model.json.JSONModel(obj);
                            this.getView().setModel(oModel1, "DeliveryAddModel");


                            var oModel = new sap.ui.model.json.JSONModel(selectedobj[0]);
                            this.getView().setModel(oModel, "PRLineItemModel");
                            this.getView().setModel(oModel, "PRLineietmModel");
                            sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                            this.getView().getModel("PRLineItemModel").refresh(true);
                            sap.ui.getCore().getModel("PRLineItemModel").refresh(true);
                            this.setCodingInputFilters(selectedobj[0]);

                            this.getOwnerComponent().accountassign = selectedobj[0].Knttp;
                            this.getOwnerComponent().plants = selectedobj[0].Werks;
                        } else {
                            if (Selkey - this.getOwnerComponent().lastlinekey === 10) {
                                var oPRHeaderObj = sap.ui.getCore().getModel("PRHeaderModel").getData();
                                var oPRLineItemObj = {};
                                oPRLineItemObj.Text = oPRHeaderObj.Text;
                                oPRLineItemObj.Elifn = oPRHeaderObj.Elifn;
                                oPRLineItemObj.Waers = oPRHeaderObj.Waers;
                                oPRLineItemObj.Bnfpo = Selkey;
                                oPRLineItemObj.Txz01 = "";
                                oPRLineItemObj.Text1 = "";
                                oPRLineItemObj.Menge = "";
                                oPRLineItemObj.Land1 = "";
                                oPRLineItemObj.Meins = "";
                                oPRLineItemObj.Preis = "";
                                oPRLineItemObj.Lfdat = "";
                                oPRLineItemObj.Knttp = "";
                                oPRLineItemObj.Kostl = "";
                                oPRLineItemObj.Aufnr = "";
                                oPRLineItemObj.Prctr = "";
                                oPRLineItemObj.Bkgrp = "";
                                oPRLineItemObj.Zzempno = "";
                                oPRLineItemObj.Isbn = "";
                                oPRLineItemObj.Batch = "";
                                oPRLineItemObj.Matkl = "";
                                oPRLineItemObj.Banfn = "";
                                oPRLineItemObj.Rlwrt = "";
                                oPRLineItemObj.Building = "";
                                oPRLineItemObj.Name1 = "";
                                oPRLineItemObj.Street = "";
                                oPRLineItemObj.PostCode = "";
                                oPRLineItemObj.City = "";
                                oPRLineItemObj.Land1 = "";
                                oPRLineItemObj.DelvAdrTyp = 0;
                                oPRLineItemObj.Sakto = "";
                              /*  oPRLineItemObj.SaktoDescr = "";
                                oPRLineItemObj.BkgrpDescr = "";
                                oPRLineItemObj.MatklDescr = "";*/
                                oPRLineItemObj.Werks = "";

                                var oModel = new sap.ui.model.json.JSONModel(oPRLineItemObj);
                                this.getView().setModel(oModel, "PRLineItemModel");
                                this.getView().setModel(oModel, "PRLineietmModel");
                                sap.ui.getCore().setModel(oModel, "PRLineItemModel");
                                this.getView().getModel("PRLineItemModel").refresh(true);
                                sap.ui.getCore().getModel("PRLineItemModel").refresh(true);
                                this.setCodingInputFilters(oPRLineItemObj);

                                this.getOwnerComponent().accountassign = oPRLineItemObj.Knttp;
                                this.getOwnerComponent().plants = oPRLineItemObj.Werks;

                                this.getOwnerComponent().lineno = Selkey;
                            } else {
                                sap.m.MessageBox.error("Please select the sequential order");
                            }
                        }
                    }
                    // }
                } else {
                    oEvent.getSource().setSelectedKey("");
                    oEvent.getSource().setSelectedKey(this.getOwnerComponent().lastlinekey);
                    //    oEvent.getSource().setSelectedItem(this.getOwnerComponent().lastlinekey);
                    //  var last = oEvent.getSource().getLastItem();
                    //  oEvent.getSource().setSelectedItem(last);


                }
                //    this.getOwnerComponent().lastlinekey = Selkey;
            },

            onApprovalDialog: function () {
                    var that =  this;
                MessageBox.show(

                    "Do you want to Approve? ", {

                    title: "Approve",

                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],

                    emphasizedAction: MessageBox.Action.YES,

                    onClose: function (oAction) {

                        if (oAction === 'YES') {

                                that.fnApprove();

                        }

                    }

                }

                );

            },      
            setButtonVisible: function (data) {
                var butnarr = ["prSave", "prSaveSubmit", "prSaveSubmit23", "prSaveSubmit222", "arrLeft11222", "Addpr", "editpr", "delpr"];
                var visible = true;
                if (data.Zestak === "Submitted" && PRCopy !== "X" || data.Zestak === "In Progress" && PRCopy !== "X") {
                    visible = false;
                }
                var that = this;
                butnarr.forEach(function (val, idx) {
                    that.getView().byId(val).setVisible(visible);
                });
            },

            afterchange2: function (oEvent) {
                var sNumber = "";
                var value = oEvent.getSource().getValue();
                var value1 = parseFloat(value);
                var bNotnumber = isNaN(value);
                if (bNotnumber == false && value !== 0 && value1 > 0) {
                    var Val = parseFloat(value).toFixed(2);
                    if (Val !== "0.00") {
                        Val = Val.toString();
                        oEvent.getSource().setValue(Val);
                        var finalValue = "0";
                        var key1 = this.getView().getModel("PRLineItemModel").getData().Bnfpo;
                        aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                            if (key1 !== val.Bnfpo) {
                                var itemValue = val.Menge * val.Preis;

                                if (isNaN(itemValue) === true) {
                                    itemValue = 0;
                                }
                                itemValue = parseFloat(itemValue).toFixed(2);
                                val.Gswrt = itemValue.toString();
                                //val.Gswrt = itemValue.toString();
                                finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                            }
                        });
                        if (sap.ui.getCore().byId("idUnitPrc")) {

                            var Menge = sap.ui.getCore().byId("idItemQnt").getValue();
                            var Price = sap.ui.getCore().byId("idUnitPrc").getValue();
                            var itemValue = Menge * Price;

                            if (isNaN(itemValue) === true) {
                                itemValue = 0;
                            }
                            itemValue = parseFloat(itemValue).toFixed(2);
                            //val.Gswrt = itemValue.toString();
                            //val.Gswrt = itemValue.toString();
                            finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                        }
                        finalValue = parseFloat(finalValue).toFixed(2);
                        if (isNaN(finalValue) === true) {
                            finalValue = 0;
                        }
                        this.getOwnerComponent().lineitem = finalValue;
                        this.getView().getModel("PRHeaderModel").setProperty("/Rlwrt", this.getOwnerComponent().lineitem);
                        this.getView().getModel("PRPreviewModel").setProperty("/Rlwrt", this.getOwnerComponent().lineitem);
                    } else {
                        oEvent.getSource().setValue(sNumber);
                    }
                }

                else {
                    oEvent.getSource().setValue(sNumber);
                }
            },
            afterchange1: function (oEvent) {
                var sNumber = "";
                var value = oEvent.getSource().getValue();
                var value1 = parseFloat(value);
                var bNotnumber = isNaN(value);
                if (bNotnumber == false && value1 !== 0 && value1 > 0) {
                    var Val = parseFloat(value).toFixed(3);
                    if (Val !== "0.000") {
                        Val = Val.toString();
                        oEvent.getSource().setValue(Val);
                        var finalValue = "0";
                        var key1 = this.getView().getModel("PRLineItemModel").getData().Bnfpo;
                        aLineItemArr.HdrToItemNav.results.forEach(function (val, idx) {
                            if (key1 !== val.Bnfpo) {
                                var itemValue = val.Menge * val.Preis;
                                val.Gswrt = itemValue.toString();
                                finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                            }
                        });
                        if (sap.ui.getCore().byId("idUnitPrc")) {

                            var Menge = sap.ui.getCore().byId("idItemQnt").getValue();
                            var Price = sap.ui.getCore().byId("idUnitPrc").getValue();
                            var itemValue = Menge * Price;

                            //val.Gswrt = itemValue.toString();
                            finalValue = parseFloat(finalValue) + parseFloat(itemValue);
                        }
                        finalValue = parseFloat(finalValue).toFixed(2);
                        if (isNaN(finalValue) === true) {
                            finalValue = 0;
                        }

                        //HeaderData.Rlwrt = finalValue;
                        this.getOwnerComponent().lineitem = finalValue;
                        this.getView().getModel("PRHeaderModel").setProperty("/Rlwrt", this.getOwnerComponent().lineitem);
                        this.getView().getModel("PRPreviewModel").setProperty("/Rlwrt", this.getOwnerComponent().lineitem);
                    } else {
                        oEvent.getSource().setValue(sNumber);
                    }
                }
                else {
                    oEvent.getSource().setValue(sNumber);
                }
            },
            onItemdesc: function (oEvent) {
                var data = oEvent.getSource().getBindingContext("PRPreviewModel").getObject();
                var itemdesc = "";
                if (data.Text1) {
                    itemdesc = data.Text1;
                } else {
                    itemdesc = data.Text;
                }
                this.detaildescdialog("Item Description", itemdesc);

            },
            detaildescdialog: function (text, value) {
                this.DesDialog = new sap.m.Dialog({
                    //type: DialogType.Message,
                    title: text,
                    content: new sap.m.Text({ text: value }),
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: "OK",
                        press: function () {
                            this.DesDialog.close();
                        }.bind(this)
                    })
                });
                this.DesDialog.open();
            },

            onViewCountryDetail: function (oEvent) {
                var data = oEvent.getSource().getBindingContext("PRPreviewModel").getObject();
                this.DelLoc1 = sap.ui.xmlfragment("zinboxall.Fragments.DeliveryLocationDisp", this);
                this.DelLoc1.open();
                var oModel = new sap.ui.model.json.JSONModel(data);
                sap.ui.getCore().setModel(oModel, "DelDispModel");
            },

            OnCloseDelDialg: function (oEvent) {
                this.DelLoc1.close();
                this.DelLoc1.destroy();
            },

            onMatdesc: function (oEvent) {
                this.detaildesc("Material Description", oEvent.getSource().getText(),"MATKL","/MaterialGroupSet","WGBEZ");
            },

            onPurchdesc: function (oEvent) {
              //  var BkgrpDescr = oEvent.getSource().getBindingContext("PRPreviewModel").getObject().BkgrpDescr;
                this.detaildesc("Purchase Group Description",oEvent.getSource().getText(),"EKGRP","/PurchaseGroupSet","EKNAM");
            },

            onKostldesc: function (oEvent) {
              //  var KostlDescr = oEvent.getSource().getBindingContext("PRPreviewModel").getObject().KostlDescr;
                this.detaildesc("Cost Center Description", oEvent.getSource().getText(),"KOSTL","/CostCenterSet","MCTXT");
            },

            onAufnrdesc: function (oEvent) {
             //   var AufnrDescr = oEvent.getSource().getBindingContext("PRPreviewModel").getObject().AufnrDescr;
                this.detaildesc("Internal Order Description", oEvent.getSource().getText(),"AUFNR","/InternalControlOrderSet","KTEXT");
            },

            onPrctrdesc: function (oEvent) {
               // var PrctrDescr = oEvent.getSource().getBindingContext("PRPreviewModel").getObject().PrctrDescr;
                this.detaildesc("Profit Center Description", oEvent.getSource().getText(),"PRCTR","/ProfitCenterSet","LTEXT");
            },

            onSaktodesc: function (oEvent) {
             //   var SaktoDescr = oEvent.getSource().getBindingContext("PRPreviewModel").getObject().SaktoDescr;
                this.detaildesc("G/L Description", oEvent.getSource().getText(),"SAKNR","/GLAccountSet","TXT50");
            },

            onIsbndesc: function (oEvent) {
               // var IsbnDescr = oEvent.getSource().getBindingContext("PRPreviewModel").getObject().IsbnDescr;
                this.detaildesc("ISBN Description", oEvent.getSource().getText(),"ZISBN","/ISBNBatchSet","MAKTG");
            },
            /*Begin of Changes by Ashok - 30-12-2021*/
           
        onComments:function(oEvent){
            this._oRejectDialog.getBeginButton().setEnabled(oEvent.getParameter("value").length > 0);
        },
        onRejectDialog:function(){
                if (!this._oRejectDialog) {
                        this._oRejectDialog = sap.ui.xmlfragment ("zinboxall.Fragments.Reject" ,this);
                        this.getView().addDependent(this._oRejectDialog);
                }
            this._oRejectDialog.open();
        },
        onReject:function(){
            var RequestContent = {
                PurchaseRequest: {                    
                    "RoleName": "Reject",
                    "BusinessKey": "5400000506 00010",
                    "Requestor":{
                        "UniqueId": "pphani@penguinrandomhouse.co.uk",
                        "Email": "pphani@penguinrandomhouse.co.uk",
                        "Name": "Phani Pooja"
                    }
                }
            };
            this._oRejectDialog.close();
            this.fnWorkflow(RequestContent);
        },
        onCancel:function(){
            this._oRejectDialog.close();
        },
        fnWorkflow:function(RequestContent){
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
                            definitionId: "approve_lineitem",
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
        fnApprove:function(){
            var RequestContent = {
                PurchaseRequest: {                    
                    "RoleName": "Approver",
                    "BusinessKey": "5400000506 00010",
                    "Requestor":{
                        "UniqueId": "pphani@penguinrandomhouse.co.uk",
                        "Email": "pphani@penguinrandomhouse.co.uk",
                        "Name": "Phani Pooja"
                    }
                }
            };
            this.fnWorkflow(RequestContent);
            
        },

        _getRuntimeBaseURL: function () {
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            var test = "124";
            return appModulePath;
        },


        });
    });
