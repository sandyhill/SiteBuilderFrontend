define(["require", "exports"], function (require, exports) {
    "use strict";
    var FilePicker;
    (function (FilePicker) {
        var Dropbox = window["Dropbox"] || {};
        var upload;
        (function (upload) {
            function transferFromDropbox(extensions) {
                if (extensions === void 0) { extensions = []; }
                Dropbox.choose({
                    success: function () { },
                    cancel: function () { },
                    linkType: "direct",
                    multiselect: true,
                    extensions: extensions
                });
            }
        })(upload || (upload = {}));
    })(FilePicker || (FilePicker = {}));
    exports.__esModule = true;
    exports["default"] = FilePicker;
});
