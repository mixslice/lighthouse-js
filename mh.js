/*
 Heavily inspired by the original js library copyright Mixpanel, Inc.
 (http://mixpanel.com/)

 Modifications by Carl Sverre
 */

var Client = function(token) {
    var metrics = {};

    metrics.config = {
        test: false,
        debug: false,
        endpoint_path: "http://api.digitwalk.com/gw/track"
    };

    metrics.token = token;

    // private utility function
    var get_unixtime = function() {
        return parseInt(new Date().getTime().toString().substring(0,10), 10);
    };

    /**
     send_request(data)
     ---
     this function sends an async GET request to mixpanel

     data:object                     the data to send in the request
     callback:function(err:Error)    callback is called when the request is
     finished or an error occurs
     */
    metrics.send_request = function(data, callback) {
        var request_data = JSON.parse(JSON.stringify(data));

        if (metrics.config.test) { request_data.test = 1; }

        var request_url = metrics.config.endpoint_path;

        var ajax = function(url, success, failure){

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        success(this.responseText);
                    } else {
                        failure(this.statusText);
                    }
                }

            };
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.send(JSON.stringify(request_data));

        };

        ajax(request_url, function(data){
            // Got some data
            if(callback !== undefined) {
                var e = (data != '1') ? new Error("Maihoo Server Error") : undefined;
                callback(e);
            }
        }, function (e) {
            if(metrics.config.debug) {
                console.log("Got Error: " + e.message);
            }
            if(callback !== undefined) {
                callback(e);
            }
        });
    };

    /**
     track(event, properties, callback)
     ---
     this function sends an event to mixpanel

     event:string                    the event name
     properties:object               additional event properties to send
     callback:function(err:Error)    callback is called when the request is
     finished or an error occurs
     */
    metrics.track = function(event, properties, callback) {
        if (!properties) { properties = {}; }
        properties.time = get_unixtime();

        var data = {
            'event' : event,
            'projectToken' : metrics.token,
            'properties' : properties
        };
        if (metrics.userIdentifier) { data.userIdentifier = metrics.userIdentifier; }

        if(metrics.config.debug) {
            console.log("Sending the following event to Maihoo:");
            console.log(data);
        }

        metrics.send_request(data,callback);
    };

    /**
     set_config(config)
     ---
     Modifies the maihoo config

     config:object       an object with properties to override in the
     maihoo client config
     */
    metrics.set_config = function(config) {
        for (var c in config) {
            if (config.hasOwnProperty(c)) {
                metrics.config[c] = config[c];
            }
        }
    };

    return metrics;
};