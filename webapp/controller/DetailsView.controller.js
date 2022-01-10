sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,Filter,FilterOperator,Fragment) {
        "use strict";

        return Controller.extend("zinboxall.controller.DetailsView", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("RouteDetailView").attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched:function(oEvent){
                var args = oEvent.getParameter("arguments").key,
                    // data = Object.assign({}, args.split("_")),
                     oView = this.getView();
                  //  mdl = new JSONModel(data);
                    //this.getView().setModel(mdl,'CMdl');
                   // oView.byId("idTab").setSelectedKey(data[0]);
                  // oView.byId("idTab").setSelectedKey(args);

            },
            onSearch: function(oEvent) {
				var fBar = oEvent.getSource(),
					table = oEvent.getSource().data().id,
					fItems = fBar.getFilterGroupItems(),
					aFilters = [];
                    $.each(fItems, function(i, ele) {
                        var key = ele.getProperty('groupName'),
                            control = fBar.determineControlByFilterItem(ele),
                            oFilter = null;
                        if (control.getMetadata().getName() === 'sap.m.Input' && control.getValue() !== '') {
                            oFilter = new Filter(key, FilterOperator.EQ, control.getValue());
                        } else if (control.getMetadata().getName() === 'sap.m.DatePicker' && control.getValue() !== '') {
    
                        }
                        if (oFilter !== null)
                            aFilters.push(oFilter);
                    });
				table.getBinding('items').filter(aFilters, "Application");

			},
			/*Begin of F4 Help*/
			onPrNumberValueHelpRequest: function(oEvent) {
				this.fnCallFragment(oEvent, this._PRNumber, "PRnumberValueHelp");
			},
			onVendorValueHelpRequest: function(oEvent) {
				this.fnCallFragment(oEvent, this._Vendor, "VendorValueHelp");
			},
			fnCallFragment: function(oEvent, d, fName) {
				var oView = this.getView();
				if (!d) {
					d = Fragment.load({
						id: oView.getId(),
						name: "zinboxreq.Fragments." + fName,
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}

				d.then(function(oDialog) {
					oDialog.open();
				});
			},
            onValueHelpLineItemPress:function(oEvent){
                var  src = oEvent.getSource(),
                     id = src.data().id.split("_"),
                     sObj = src.getBindingContext("valuehelp").getObject();
                this.byId(id[0]).setValue(sObj[id[1]]);
                oEvent.getSource().getParent().getParent().close();
            },
		/*	onSearch: function(oEvent) {
                // var sValue = oEvent.getParameter("value");
                // this.fnCommonSearch(oEvent,sValue,[""]);
                var fBar = oEvent.getSource(),
					table = this.byId(oEvent.getSource().data().id),
					fItems = fBar.getFilterGroupItems(),
					aFilters = [];
				$.each(fItems, function(i, ele) {
					var key = ele.getProperty('groupName'),
						control = fBar.determineControlByFilterItem(ele),
						oFilter = null;
                      
					if (control.getMetadata().getName() === 'sap.m.Input' && control.getValue() !== '') {
						oFilter = new Filter(key, FilterOperator.EQ, control.getValue());
					} else if (control.getMetadata().getName() === 'sap.m.DatePicker' && control.getValue() !== '' && control.getValue() !== null ) {
                        oFilter = new Filter(key, FilterOperator.EQ, control.getValue());
					}
					if (oFilter !== null)
						aFilters.push(oFilter);
				});
				table.getBinding('items').filter(aFilters);
			},*/
          
			/* End of F4 Help*/
           

			/*Begin of Cross App Navigation*/
			
            onPrLink:function(oEvent){
                    var Banfn = oEvent.getSource().getBindingContext().getObject().Banfn,
                        tab = oEvent.getSource().data().tab;
					//this.fnCrossnavigation("ZPurchaseReq", "Create", Banfn,'A');                   
                    this.getOwnerComponent().getRouter().navTo("PRPreview", {
                        PRPreview: Banfn,//"sPoNumber",
                        PRCopy: "A"
                    }, true);
            },			
			onINVAItemPress: function(oEvent) {
				var PRNumber = oEvent.getParameter("listItem").getBindingContext().getObject().PRNumber;
					this.fnCrossnavigation("ZPurchaseReq", "Create", PRNumber);
			},
		
			onCredAItemPress: function(oEvent) {
				var PRNumber = oEvent.getParameter("listItem").getBindingContext().getObject().PRNumber;
					this.fnCrossnavigation("ZPurchaseReq", "Create", PRNumber);
			},
			fnCrossnavigation: function(s, a, v,secValue) {
				
                      var value = (secValue !== null && secValue)?v+','+secValue:v;
                       var crnavi = sap.ushell.Container.getService("CrossApplicationNavigation");
					var hashUrl = (sap.ushell && sap.ushell.Container &&
						sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({
							target: {
								semanticObject: s,
								action: a
							}
                        })) || "",
                        url = hashUrl+"?sap-ui-app-id-hint=saas_approuter_zprcreatenew&/PRPreview/"+value;
                       // crnavi.toExternal({target:hashUrl})
                       sap.m.URLHelper.redirect(url,false);
				},
				/* End of Cross App Navigation*/
                OnCloseDialog:function(e){
                        e.getSource().getParent().close();
                },
                onNumberValidation:function(oEvent){
                    var _oInput = oEvent.getSource();
                    var val = _oInput.getValue();
                    val = val.replace(/[^\d]/g, '');
                    _oInput.setValue(val);
                }
        });
    });