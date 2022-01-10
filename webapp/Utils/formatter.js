sap.ui.define(["sap/ui/core/format/DateFormat"], function (format) {
    "use strict";
    return {

        formateDate: function (val) {
            var Date1 = new Date(val);
            if(val){
            if(val[2] === "." && (isNaN(Date1.getTime()))){
            var ui = val.split(".");
            var Date12= ui[2] + "-" + ui[1] + "-" + ui[0];
            Date1 = new Date(Date12);
            }
        }
            // jquery.sap.require("sap.ui.core.format.DateFormat");
              var oDateFormat= sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd.MM.yyyy"
			});
            var FormattedDate = oDateFormat.format(Date1);
            return FormattedDate;
        },

        getReqCodingText:function(val){
            var Text = "";
            var data = sap.ui.getCore().getModel("ReqModel").getData();
            data.results.forEach(function(val1,idx){
                  if(val1.ACASIGNCAT === val){
                      Text = val1.ATEXT;
                  }
            });

            return Text;
        },

        formatSno:function(val){
            if(val){
                val = parseInt(val).toString();
            }
            return val;
        },

        formatUploadUrl:function(val){
            var url1 = this.getOwnerComponent().getModel("attachment").sServiceUrl + "/AttachmentSet";
            var url2 =  url1.split("..");
           return url2[1];
        },
       
    };
});