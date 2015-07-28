var Client = function(token) {
    var metrics = {};

    metrics.config = {
        test: false,
        debug: false,
        endpoint_path: "http://api.digitwalk.com/gw/track"
    };

    metrics.token = token;

    var generateUUID = function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    var cookie = function(k){return(document.cookie.match('(^|; )'+k+'=([^;]*)')||0)[2]};
    var _mh = cookie('_mh');
    if (!_mh) {
        _mh = generateUUID();
        document.cookie = '_mh=' + _mh;
    }
    metrics.userIdentifier = _mh;

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
            xhr.setRequestHeader('Content-Type', 'text/plain');
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

    metrics.mergeObject = function(obj1, obj2) {
        for (var k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                obj1[k] = obj2[k];
            }
        }
    };

    metrics.register = function(properties) {
        metrics.properties = metrics.properties || {};
        metrics.mergeObject(metrics.properties, properties);
    };

    metrics.identify = function(uid) {
        metrics.userIdentifier = uid;
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
        if (!metrics.properties) { metrics.properties = {}; }
        if (!properties) { properties = {}; }
        properties.time = get_unixtime();

        var merged_properties = JSON.parse(JSON.stringify(metrics.properties));
        metrics.mergeObject(merged_properties, properties);

        var data = {
            'event' : event,
            'projectToken' : metrics.token,
            'properties' : merged_properties
        };
        if (metrics.userIdentifier) { data.userIdentifier = metrics.userIdentifier; }

        if(metrics.config.debug) {
            console.log("Sending the following event to Maihoo:");
            console.log(data);
        }

        metrics.send_request(data,callback);
    };

    /**
     * track link
     */
    metrics.track_links = function(query, event, properties) {
        var els = Array.prototype.slice.call(document.querySelectorAll(query), 0);
        els.forEach(function (e) {
            e.removeEventListener();
            e.addEventListener('click', function () {
                metrics.track(event, properties);
            });
        });
    };

    /**
     set_config(config)
     ---
     Modifies the maihoo config

     config:object       an object with properties to override in the
     maihoo client config
     */
    metrics.set_config = function(config) {
        metrics.mergeObject(metrics.config, config);
    };

    return metrics;
};