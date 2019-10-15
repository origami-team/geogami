// This Cordova Hook (script) modifies the serve-config.js (app-scripts/dist/dev-server/) 
// It modifes the ANDROID_PLATFORM_PATH assignment to include 'app/src/main'
// The reference to the issue is best described at https://github.com/ionic-team/ionic-app-scripts/issues/1354 
// The authoritive source is found at: https://gist.github.com/SteveKennedy 

module.exports = function (ctx) {

    console.log("Attempting To Modify serve-config.js....")

    // Reference Dependencies
    var fs = ctx.requireCordovaModule('fs'),
        path = ctx.requireCordovaModule('path');

    var serveConfigFilePath = 'node_modules/@ionic/app-scripts/dist/dev-server/serve-config.js';

    modifyAndroidPlatformPath(serveConfigFilePath);

    function modifyAndroidPlatformPath(filePath) {
        // Only Do This Only If Plugin.XML is found for this plugin.
        fs.stat(filePath, function (error, stat) {

            if (error) {
                console.log(error);
                return;
            }

            var fileModifiedSuccessfully = false;

            // Read In That Plugin.XML File
            var data = fs.readFileSync(filePath, 'utf8');

            // Split the Contents of That File Into An Array Of Lines
            var dataArray = data.split('\n');

            // Define Substrings To Eliminate if contained within Each Line
            var sourceFileString = "exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'assets', 'www');";
            var targetFileString = "exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'app/src/main', 'assets', 'www');"

            // Store original length of Array for comparison later
            var originalDataArrayLength = dataArray.length;

            // Loop Through The Lines and Modify the Line/Item if it contains The sourceFileString
            for (var i = dataArray.length - 1; i >= 0; i--) {
                if (dataArray[i].indexOf(sourceFileString) !== -1) {
                    console.log('Modifying line:' + dataArray[i]);
                    dataArray[i] = targetFileString;
                    fileModifiedSuccessfully = true;
                }
            }

            // If Nothing Was Found/Removed/Spliced, No Need To Overwrite.
            if (!fileModifiedSuccessfully) {
                console.log("No Changes to File: " + filePath);
                return;
            }

            // Rejoin the Array Into A String
            var newData = dataArray.join("\r\n");

            // Overwrite the File with Modified Contents
            fs.writeFileSync(filePath, newData, 'utf8');
        });
    }
};