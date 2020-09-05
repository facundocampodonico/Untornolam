/*global requirejs cprequire cpdefine chilipeppr THREE*/
// ignore this errormessage:

// ChiliPeppr Widget/Element Javascript

requirejs.config({
    /*
    Dependencies can be defined here. ChiliPeppr uses require.js so
    please refer to http://requirejs.org/docs/api.html for info.
    
    Most widgets will not need to define Javascript dependencies.
    
    Make sure all URLs are https and http accessible. Try to use URLs
    that start with // rather than http:// or https:// so they simply
    use whatever method the main page uses.
    
    Also, please make sure you are not loading dependencies from different
    URLs that other widgets may already load like jquery, bootstrap,
    three.js, etc.
    
    You may slingshot content through ChiliPeppr's proxy URL if you desire
    to enable SSL for non-SSL URL's. ChiliPeppr's SSL URL is
    https://i2dcui.appspot.com which is the SSL equivalent for
    http://chilipeppr.com
    */
    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
    }
});

cprequire_test(["inline:com-chilipeppr-widget-cam"], function(myWidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    console.log("test running of " + myWidget.id);

    $('body').prepend('<div id="testDivForFlashMessageWidget"></div>');

    chilipeppr.load(
        "#testDivForFlashMessageWidget",
        "http://fiddle.jshell.net/chilipeppr/90698kax/show/light/",
        function() {
            console.log("mycallback got called after loading flash msg module");
            cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                //console.log("inside require of " + fm.id);
                fm.init();
            });
        }
    );

    //deactivate cuz of mixed ssl and non ssl content

    // load spjs widget so we can test
    //http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/
    $('body').append('<div id="testDivForSpjsWidget"></div>');
    chilipeppr.load(
        "#testDivForSpjsWidget",
        //"http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/",
        "http://raw.githubusercontent.com/chilipeppr/widget-spjs/master/auto-generated-widget.html",
        function() {
            console.log("mycallback got called after loading spjs module");
            cprequire(["inline:com-chilipeppr-widget-serialport"], function(spjs) {
                //console.log("inside require of " + fm.id);
                spjs.init();
                spjs.consoleToggle();
                
                // init my widget
                myWidget.init();

                $('#' + myWidget.id).css('margin', '10px');
                $('#testDivForSpjsWidget').css('margin', '10px');

            });
        }
    );
    
    
    $('title').html(myWidget.name);
    // myWidget.init();
} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-chilipeppr-widget-cam", ["chilipeppr_ready", /* other dependencies here */ ], function() {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "com-chilipeppr-widget-cam", // Make the id the same as the cpdefine id
        name: "Widget / Cam", // The descriptive name of your widget.
        desc: "This widget loads a webcam view in ChiliPeppr via WebRTC.", // A description of what your widget does
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        /**
         * Define pubsub signals below. These are basically ChiliPeppr's event system.
         * ChiliPeppr uses amplify.js's pubsub system so please refer to docs at
         * http://amplifyjs.com/api/pubsub/
         */
        /**
         * Define the publish signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        publish: {
            // Define a key:value pair here as strings to document what signals you publish.
            // '/onExampleGenerate': 'Example: Publish this signal when we go to generate gcode.'
        },
        /**
         * Define the subscribe signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        subscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // so other widgets can publish to this widget to have it do something.
            // '/onExampleConsume': 'Example: This widget subscribe to this signal so other widgets can send to us and we'll do something with it.'
        },
        /**
         * Document the foreign publish signals, i.e. signals owned by other widgets
         * or elements, that this widget/element publishes to.
         */
        foreignPublish: {
            // Define a key:value pair here as strings to document what signals you publish to
            // that are owned by foreign/other widgets.
            // '/jsonSend': 'Example: We send Gcode to the serial port widget to do stuff with the CNC controller.'
        },
        /**
         * Document the foreign subscribe signals, i.e. signals owned by other widgets
         * or elements, that this widget/element subscribes to.
         */
        foreignSubscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // that are owned by foreign/other widgets.
            // '/com-chilipeppr-elem-dragdrop/ondropped': 'Example: We subscribe to this signal at a higher priority to intercept the signal. We do not let it propagate by returning false.'
        },
        /**
         * All widgets should have an init method. It should be run by the
         * instantiating code like a workspace or a different widget.
         */
        init: function() {
            console.log("I am being initted. Thanks.");

            this.setupUiFromLocalStorage();
            this.btnSetup();
            this.forkSetup();
            
            //this.initCam();
            setTimeout(this.initCheckForCam.bind(this), 2000);
            
            this.setupPubSubForSpjsConnect();
            //this.subscribeToLowLevelSerial();
            
            // setup the install div buttons
            this.uv4lSetupInstall();

            // this.getMyLocalIp();
            this.scanForSpjsServers();
            
            console.log("I am done being initted.");
        },
        /**
         * When this widget is activated
         */
        activate: function() {
            this.initCheckForCam();
        },
        /**
         * When this widget is deactivated
         */
        deactivate: function() {
            
        },
        
        // Scan for SPJS servers and cameras since the use case
        // we are after is multiple Raspberry Pi's serving multiple
        // cameras.
        
        /**
         * Scan for SPJS's much like the SPJS widget does it.
         */
        scanForSpjsServers: function() {
        
            // figure out my ip and thus my subnet
            this.getMyLocalIp(function(data) {
                console.log("got my ip. data:", data);
                
            })
        },
        
        // ---------------
        // Cam check/install region
        // ---------------
        
        /** When this widget is activated, we need to do a few things:
         * 1. Check if there is a stored setting of what cam to connect to
         *    because this could be a different host than what SPJS is running
         *    on.
         * If no setting:
         * 1. Check if we are SPJS connected
         * 2. Check if we are on a Raspberry Pi
         * 3. If so, then see if uv4l is installed
         * 4. If so, then launch it
         * 5. Connect
         * If not Raspi, show error.
         * If no uv4l, go into install process.
         */
        isRunningInitCheckForCam: false,
        initCheckForCam: function() {
            
            // check settings and see if there is a stored ip addr to connect to
            console.log("initCheckForCam. initting check for cam");
            
            if (this.isRunningInitCheckForCam) {
                console.warn("we are currently running initCheckForCam. Exiting.");
                return;
            }
            
            this.isRunningInitCheckForCam = true;
            
            // lets ensure all our install msg divs are hidden
            $('#' + this.id + " .install-msg").addClass("hidden");
            
            //debugger;
            
            var that = this;
            
            // let's take an approach where we first try to connect to the webrtc server
            this.webRtcGo(function(obj) {
                console.log("webRtcGo result. obj:", obj);
                if (obj.isSuccess) {
                    // cool, it worked
                    $('#' + that.id + " .isrunning").removeClass("hidden");
                    
                } else {
                    
                    // we were not able to get webrtc as our 1st step
            
                    // else just try to see if spjs host is raspi, and has cam
                    this.checkIfSpjsConnected(function(results) {
                        if (results.connected) {
                            
                            // great, we're connected, lets' do next step
                            $('#' + that.id + " .notconnected").addClass("hidden");
                            
                            // check if we are on linux
                            that.checkIfLinux(function(status) {
                                
                                console.log("initCheckForCam. got callback from checking if linux. status:", status);
                                
                                if (status.OS.match(/linux/i)) {
                                    
                                    if (status.Arch.match(/arm/i)) {
                                        
                                        // check if allowexec
                                        that.checkIfAllowExec(function(status) {
                                            if (status.isAllowExec) {
                                                
                                                that.checkIfRaspberryPi(function(status) {
                                                    
                                                    // when we get here, we get back a status to determine
                                                    // if we're on a raspi or not
                                                    console.log("initCheckForCam. we got back from checkIfRaspberryPi. status:", status);
                                                    
                                                    if (status.isRaspberryPi) {
                                                
                                                        // awesome. we are raspi. 
                                                        // we can install
                                                        that.isRunningInitCheckForCam = false;
                                                        
                                                        that.uv4lCheckIfInstalled(function(data) {
                                                            console.log("initCheckForCam. got check complete for uv4l. data:", data);
                                                            if (data.isInstalled) {
                                                                
                                                                
                                                                // let's see if it is running
                                                                that.checkIfUv4lIsRunning(function(results) {
                                                                    if (results.isRunning) {
                                                                        
                                                                        that.webRtcGo(function(payload) {
                                                                            if (payload.result == "success") {
                                                                                // cool, good to go
                                                                                $('#' + that.id + " .isrunning").removeClass("hidden");
                                                                            } else {
                                                                                // got error
                                                                                $('#' + that.id + " .isinstalled").removeClass("hidden");
                                                                            }
                                                                        });
                                                                        
                                                                    } else {
                                                                        // it is not running, let's launch it for them
                                                                        $('#' + that.id + " .isinstalled").removeClass("hidden");
                                                                    }
                                                                })
                                                                
                                                            } else {
                                                                // not installed but eligible
                                                                $('#' + that.id + " .eligible").removeClass("hidden");
                                                                that.isRunningInitCheckForCam = false;
                                                                
                                                            }
                                                        });
                                                                
                                                    } else {
                                                        console.log("initCheckForCam. at least is linux. show error");
                                                        $('#' + that.id + " .linux").removeClass("hidden");
                                                        that.isRunningInitCheckForCam = false;
                                                    }  
                                                       
                                                });
                                                
                                            } else {
                                                // not allowed, ask to restart spjs
                                                // with cmd line switch
                                                $('#' + that.id + " .allowexec").removeClass("hidden");
                                                that.isRunningInitCheckForCam = false;
                                                
                                            } 
                                            
                                        });
                                          
                                    } else {
                                        console.log("initCheckForCam. at least is linux. show error");
                                        $('#' + that.id + " .linux").removeClass("hidden");
                                        that.isRunningInitCheckForCam = false;
                                    }
                                    
                                } else {
                                    console.log("initCheckForCam. We are not Linux, so giving up. Show error"); 
                                    var os = status.OS.charAt(0).toUpperCase() + status.OS.slice(1);
                                    $('#' + that.id + " .bados .os").text(os);
                                    $('#' + that.id + " .bados").removeClass("hidden");
                                    that.isRunningInitCheckForCam = false;
                                }
                            });
                            
                        } else {
                            // not connected, show error
                            $('#' + that.id + " .notconnected").removeClass("hidden");
                            that.isRunningInitCheckForCam = false;
                        }
                    });

                }
            });

        },
        
        // WEBRTC CONNECTION METHODS
        
        webRtcCallback: null,
        /**
         * Use this as your main entry point. You need to provide a callback which
         * will be told success or error.
         */
        webRtcGo: function(callback) {
            this.webRtcCallback = callback;
            this.webRtcInit();
            this.webRtcStart();
            
            // bind button click events
            $('#com-chilipeppr-widget-cam .btn-startstreaming').click(this.onBtnStartClick.bind(this));
            $('#com-chilipeppr-widget-cam .btn-stopstreaming').click(this.onBtnStopClick.bind(this));

        },
        onBtnStartClick: function(evt) {
            // hide popover
            $('#' + this.id + " .btn-startstreaming").popover('hide');
            this.webRtcStart();
        },
        onBtnStopClick: function(evt) {
            // hide popover
            $('#' + this.id + " .btn-stopstreaming").popover('hide');
            this.webRtcStop();
        },
        /**
         * Called after successfully streaming remote video
         */
        onWebRtcSuccess: function(stream) {
            this.webRtcCallback({isSuccess: true, result:"success", stream: stream});
            
            // get the video tag and print debug
            var vidEl = $('#com-chilipeppr-widget-cam-remote-video');
            console.log("vidEl:", vidEl);
            console.log("video:", vidEl[0]);
        },
        /**
         * Called if failure connecting and streaming.
         */
        onWebRtcError: function(errMsg) {
            this.webRtcCallback({isSuccess: false, result:"error", msg:errMsg});
        },
        
        /**
         * Trigger the initial check of whether WebRTC is running on the server.
         */
        webRtcInit: function() {
            
            // chech that we have an spjs ip addr
            if (this.ipAddrForSpjs && this.ipAddrForSpjs.length > 0)
                this.webRtcSignallingServerAddress = this.ipAddrForSpjs + ':8080';
            else {
                this.onWebRtcError("No IP address for SPJS.");
                return;
            }
            this.webRtcWs = null;
            this.webRtcPc;
            // this.webRtcAudioVideoStream;
            this.webRtcRemoteStream = null;
            this.pcConfig = {"iceServers": [
                    {"urls": ["stun:stun.l.google.com:19302", "stun:" + this.ipAddrForSpjs + ":3478"]}
                ]};
            this.pcOptions = {
                optional: [
                    {DtlsSrtpKeyAgreement: true}
                ]
            };
            this.mediaConstraints = {
                optional: [],
                mandatory: {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                }
            };

            this.URL =  window.URL || window.webkitURL;
            this.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            this.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
            this.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
            navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

            // actually start the connection
            // this.webRtcStart();
        },
        webRtcCeatePeerConnection: function() {
            try {
                var pcConfig = this.pcConfig;
                
                console.log(JSON.stringify(pcConfig));
                this.webRtcPc = new this.RTCPeerConnection(pcConfig, this.pcOptions);
                this.webRtcPc.onicecandidate = this.onWebRtcIceCandidate.bind(this);
                this.webRtcPc.onaddstream = this.onWebRtcRemoteStreamAdded.bind(this);
                this.webRtcPc.onremovestream = this.onWebRtcRemoteStreamRemoved.bind(this);
                console.log("peer connection successfully created!");
            } catch (e) {
                console.log("createPeerConnection() failed");
                this.onWebRtcError("createPeerConnection() failed");
                return false;
            }
            return true;
        },
        onWebRtcIceCandidate: function(event) {
            if (event.candidate) {
                var candidate = {
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    sdpMid: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                };
                var command = {
                    command_id: "addicecandidate",
                    data: JSON.stringify(candidate)
                };
                this.webRtcWs.send(JSON.stringify(command));
            } else {
                console.log("End of candidates.");
            }
        },
        onWebRtcRemoteStreamAdded: function(event) {
            console.log("onWebRtcRemoteStreamAdded. event:", event);
            console.log("Remote stream added:", this.URL.createObjectURL(event.stream));
            var remoteVideoElement = document.getElementById('com-chilipeppr-widget-cam-remote-video');
            remoteVideoElement.src = this.URL.createObjectURL(event.stream);
            remoteVideoElement.play();
            event.stream.onaddtrack = this.onWebRtcOnAddTrack.bind(this);
            event.stream.onactive = this.onWebRtcOnActive.bind(this);
            this.webRtcRemoteStream = event.stream;
            // call success function
            this.onWebRtcSuccess(event.stream);
            this.webRtcPrintVideoInfo();
        },
        onWebRtcOnAddTrack: function(event) {
            console.log("onWebRtcTrackAdded. event:", event);
        },
        onWebRtcOnActive: function(event) {
            console.log("onWebRtcOnActive. event:", event);
        },
        onWebRtcRemoteStreamRemoved: function(event) {
            var remoteVideoElement = document.getElementById('com-chilipeppr-widget-cam-remote-video');
            remoteVideoElement.src = '';
        },
        webRtcOffer: function(stream) {
            this.webRtcCeatePeerConnection();
            if (stream) {
                this.webRtcPc.addStream(stream);
            }
            var command = {
                command_id: "offer",
                options: {
                    force_hw_vcodec: $('#' + this.id + ' .remote_hw_vcodec').is(':checked'), //document.getElementById("remote_hw_vcodec").checked,
                    vformat: $('#' + this.id + ' .remote_vformat').val() //document.getElementById("remote_vformat").value
                }
            };
            this.webRtcWs.send(JSON.stringify(command));
            console.log("offer(), command=" + JSON.stringify(command));
        },
        webRtcStart: function() {
            var that = this;
            if ("WebSocket" in window) {
                $('#com-chilipeppr-widget-cam .btn-stopstreaming').prop('disabled', false);
                $('#com-chilipeppr-widget-cam .btn-startstreaming').prop('disabled', true);
                
                // document.getElementById("stop").disabled = false;
                // document.getElementById("start").disabled = true;
                // document.documentElement.style.cursor ='wait';
                //server = document.getElementById("signalling_server").value.toLowerCase();
                var server = this.webRtcSignallingServerAddress;
                
                var protocol = "ws:"; //location.protocol === "https:" ? "wss:" : "ws:";
                this.webRtcWs = new WebSocket(protocol + '//' + server + '/stream/webrtc');

                this.webRtcWs.onopen = function () {
                    console.log("onopen()");

                    // that.audio_video_stream = null;
                    
                    that.webRtcOffer();
                    
                };

                this.webRtcWs.onmessage = function (evt) {
                    var msg = JSON.parse(evt.data);
                    //console.log("message=" + msg);
                    console.log("type=" + msg.type);

                    switch (msg.type) {
                        case "offer":
                            that.webRtcPc.setRemoteDescription(new that.RTCSessionDescription(msg),
                                function onRemoteSdpSuccess() {
                                    console.log('onRemoteSdpSucces()');
                                    that.webRtcPc.createAnswer(function(sessionDescription) {
                                        that.webRtcPc.setLocalDescription(sessionDescription);
                                        var command = {
                                            command_id: "answer",
                                            data: JSON.stringify(sessionDescription)
                                        };
                                        that.webRtcWs.send(JSON.stringify(command));
                                        console.log(command);

                                    }, function (error) {
                                        alert("Failed to createAnswer: " + error);

                                    }, that.mediaConstraints);
                                },
                                function onRemoteSdpError(event) {
                                    alert('Failed to set remote description (unsupported codec on this browser?): ' + event);
                                    that.webRtcStop();
                                }
                            );

                            var command = {
                                command_id: "geticecandidate"
                            };
                            console.log(command);
                            that.webRtcWs.send(JSON.stringify(command));
                            break;

                        case "answer":
                            break;

                        case "message":
                            alert(msg.data);
                            break;

                        case "geticecandidate":
                            var candidates = JSON.parse(msg.data);
                            for (var i = 0; candidates && i < candidates.length; i++) {
                                var elt = candidates[i];
                                var candidate = new that.RTCIceCandidate({sdpMLineIndex: elt.sdpMLineIndex, candidate: elt.candidate});
                                that.webRtcPc.addIceCandidate(candidate,
                                    function () {
                                        console.log("IceCandidate added: " + JSON.stringify(candidate));
                                    },
                                    function (error) {
                                        console.log("addIceCandidate error: " + error);
                                    }
                                );
                            }
                            // document.documentElement.style.cursor ='default';
                            // that.webRtcPrintVideoInfo();
                            break;
                    }
                };

                that.webRtcWs.onclose = function (evt) {
                    if (that.webRtcPc) {
                        that.webRtcPc.close();
                        that.webRtcPc = null;
                    }
                    $('#com-chilipeppr-widget-cam .btn-stopstreaming').prop('disabled', true);
                    $('#com-chilipeppr-widget-cam .btn-startstreaming').prop('disabled', false);

                    // document.getElementById("stop").disabled = true;
                    // document.getElementById("start").disabled = false;
                    // document.documentElement.style.cursor ='default';
                };

                that.webRtcWs.onerror = function (evt) {
                    //alert("An error has occurred!");
                    if (that.webRtcWs) that.webRtcWs.close();
                    that.onWebRtcError("Error with websocket. Likely that UV4l server is not running.");
                };

            } else {
                alert("Sorry, this browser does not support WebSockets.");
                this.onWebRtcError("No websocket support. How old is your browser?");
            }
        },
        webRtcPrintVideoInfo: function() {
            if (this.webRtcRemoteStream) {
                console.log("track info:");
                for (var i = 0; i < this.webRtcRemoteStream.getTracks().length; i++) {
                    var track = this.webRtcRemoteStream.getTracks()[i];
                    console.log(track);
                    // console.log("track settings:", track.getSettings());
                    // console.log("track capability:", track.getCapabilities());
                    // console.log("track constraints:", track.constraints());
                }
            
            }    
        },
        webRtcStop: function() {
            /* Don't need this section cuz for local video
            if (this.audio_video_stream) {
                try {
                    this.audio_video_stream.stop();
                } catch (e) {
                    for (var i = 0; i < this.audio_video_stream.getTracks().length; i++)
                        this.audio_video_stream.getTracks()[i].stop();
                }
                this.audio_video_stream = null;
            } */
            
            // CONTINUE HERE...
            document.getElementById('com-chilipeppr-widget-cam-remote-video').src = '';
            // document.getElementById('local-video').src = '';
            if (this.webRtcPc) {
                this.webRtcPc.close();
                this.webRtcPc = null;
            }
            if (this.webRtcWs) {
                this.webRtcWs.close();
                this.webRtcWs = null;
            }
            // document.getElementById("stop").disabled = true;
            // document.getElementById("start").disabled = false;
            // document.documentElement.style.cursor ='default';
            $('#' + this.id + " .btn-stopstreaming").prop('disabled', true);
            $('#' + this.id + " .btn-startstreaming").prop('disabled', false);
            console.log("stopped webrtc");
        },
        // END WEBRTC CONNECTION METHODS
        
        /**
         * Subscribe to connect/disconnect events for SPJS so we can pivot off
         * of it for detection.
         */
        setupPubSubForSpjsConnect: function() {
           chilipeppr.subscribe('/com-chilipeppr-widget-serialport/ws/onconnect', this, this.onSpjsConnect); 
           chilipeppr.subscribe('/com-chilipeppr-widget-serialport/ws/ondisconnect', this, this.onSpjsDisconnect); 
        },
        ipAddrForSpjs: null,
        onSpjsConnect: function(payload, more) {
            console.log("onSpjsConnect. payload:", payload, "more:", more);
            // "ws://192.168.1.34:8989/ws"
            var websocket = more.websocket;
            if (websocket && websocket.url && websocket.url.match(/wss{0,1}:\/\/(.*):/)) {
                this.ipAddrForSpjs = RegExp.$1;
                console.log("onSpjsConnect. got ip of websocket conn. ip:", this.ipAddrForSpjs);
            }
            // check for cam 1 sec later
            setTimeout(this.initCheckForCam.bind(this), 1000);
        },
        onSpjsDisconnect: function() {
            this.initCheckForCam();
        },
        /**
         * Send the execruntime command to the currently running SPJS to see what
         * OS is running.
         */
        sendExecRuntime: function() {
            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "execruntime");  
        },
        /**
         * Send a terminal command to the currently running SPJS.
         */
        send: function(cmd) {
            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "exec " + cmd);  
        },
        isInSendSyncMode: false,
        sendSyncCallback: null,
        sendSyncIdNum: 0,
        /**
         * Send synchronously with callback as if you were right at the command line
         */
        sendSync: function(cmd, callback) {
            
            if (this.isInSendSyncMode) {
                console.error("Cannot sendSync twice while waiting for response from prev request.");
                return;
            }
            
            // this method makes sure we are subscribed only once
            this.subscribeToLowLevelSerial();
            
            this.isInSendSyncMode = true;
            this.sendSyncCallback = callback;
            
            this.sendSyncActiveId = "cam-install-" + this.sendSyncIdNum;
            this.sendSyncIdNum++;
            var spjsCmd = "exec";
            spjsCmd += " id:" + this.sendSyncActiveId;
            if (this.isUseLogin) spjsCmd += " user:" + this.user + " pass:" + this.pass;
            spjsCmd += " " + cmd;
            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", spjsCmd);  
            console.log("just did sendSync. sendSyncActiveId:", this.sendSyncActiveId);
        },
        onSendSyncWsRecv: function(msg) {
            console.log("onSendSyncWsRecv. msg:", msg, "sendSyncActiveId:", this.sendSyncActiveId);
            
            if (msg.match(/^\{/)) {
                // it's json
                var data = $.parseJSON(msg);
                //console.log("got json for onSendSyncWsRecv. data:", data);
                if ('ExecStatus' in data) {
                    // this is what we were waiting for
                    //console.log("onSendSyncWsRecv we have ExecStatus so good. is it our id?", this.sendSyncActiveId);
                    
                    if (data.ExecStatus == "Progress") {
                        // just stick in the terminal window
                        this.appendToOutput(data.Output);
                    } else {
                    
                        // we get an ExecStatus of Done or Error here
                        // see if it's the id we want
                        if (data.Id == this.sendSyncActiveId) {
                            console.log("response was for sendSyncActiveId:", this.sendSyncActiveId);
                            
                            // it is the cmd we expect, awesome
                            //chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/ws/recv", this.onSendSyncWsRecv);
                            this.unsubscribeFromLowLevelSerial();
                            this.isInSendSyncMode = false;
                            
                            //console.log("it was our id. we are doing the sendSync callback now with data:", data);
                            this.sendSyncActiveId = null;
                            this.sendSyncCallback(data);
                            //this.sendSyncCallback = null;
                            
                        }
                    }
                }
            }
        },
        isAreWeSubscribedToLowLevel: false,
        subscribeToLowLevelSerial: function() {
            // subscribe to websocket events
            if (this.isAreWeSubscribedToLowLevel == false) {
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.onWsRecv);
            } else {
                console.log("we were asked to subscribe to low-level /ws/recv but already were");
            }
        },
        unsubscribeFromLowLevelSerial: function() {
            // unsubscribe to websocket events
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/ws/recv", this.onWsRecv);
            this.isAreWeSubscribedToLowLevel = false;
            
        },
        onWsRecv: function(msg) {
            if (msg.match(/^\{/)) {
                // it's json
                var data = $.parseJSON(msg);
                console.log("got json for onWsRecv. data:", data);
                
                if ('ExecStatus' in data) {
                    //this.appendLog(data.Output + "\n");      
                    /*if (this.isInRaspiCheckMode) {
                        this.checkIfRaspberryPiCallback(data);
                    } else */
                    if (this.isInSendSyncMode) {
                        this.onSendSyncWsRecv(msg);
                    }
                } else if ('ExecRuntimeStatus' in data) {
                    this.onExecRuntimeStatus(data);
                }
            }
        },
        isInRaspiCheckMode: false,
        raspiCapture: "",
        isRaspberryPi: false,
        checkRaspiUserCallback: null,
        checkIfRaspberryPi: function(callback) {
            this.checkRaspiUserCallback = callback;
            // this.isInRaspiCheckMode = true;
            // this.subscribeToLowLevelSerial();
            // we potentially have a raspi candidate. send actual cmd line and parse that
            var that = this;
            this.sendSync('cat /etc/os-release', function(data) {
                console.log("got done with 1st step of checkIfRaspberryPi. data:", data);
                this.raspiCapture = data.Output;
                that.sendSync('echo "done-with-cat-etc-release"', that.checkIfRaspberryPiCallback.bind(that));
            });
        },
        checkIfRaspberryPiCallback: function(payload) {
            
            // analyze what's coming back
            if (payload.Output.match(/done-with-cat-etc-release/)) {
                // we are done capturing
                // this.isInRaspiCheckMode = false;
                // this.unsubscribeFromLowLevelSerial();
                
                console.log("done capturing");
                //this.appendLog('We captured\n<span style="color:red">' + this.raspiCapture + '</span>');
                
                var status = {
                    isRaspberryPi: false
                };
                
                if (this.raspiCapture.match(/raspbian/i)) {
                    // looks like we're on a raspi
                    //this.appendLog("You are running SPJS on a Raspberry Pi.\n");
                    //this.showAsRaspi();
                    status.isRaspberryPi = true;
                } else {
                    // It's not raspi
                    //this.resetAsRaspi();
                    
                }
                
                if (this.checkRaspiUserCallback) this.checkRaspiUserCallback(status);
                
                this.raspiCapture = "";
            } else {
                this.raspiCapture += payload.Output;
                
            }
        },
        isInCheckLinuxMode: false,
        checkLinuxCallback: null,
        checkIfLinux: function(callback) {
            // we can check if linux by asking for an execruntime status
            // subscribe to low-level callback
            this.checkLinuxCallback = callback;
            this.isInCheckLinuxMode = true;
            this.subscribeToLowLevelSerial();
            this.sendExecRuntime();
        },
        execruntime: null,
        onExecRuntimeStatus: function(json) {
            console.log("got onExecRuntimeStatus. json:", json);
            //this.appendLog(JSON.stringify(json) + "\n");
            
            this.execruntime = json;
            
            this.unsubscribeFromLowLevelSerial();
            
            this.isInCheckLinuxMode = false;

            if (this.checkLinuxCallback) this.checkLinuxCallback(json);
            this.checkLinuxCallback = null;
            
            /*
            if (json.OS.match(/linux/i) && json.Arch.match(/arm/i)) {
                this.execruntime = json;
                //this.checkIfRaspberryPi();
                //setTimeout(this.askForPwd.bind(this), 1000);
            }
            */
        },
        isSpjsStatusInitted: false,
        statusCallback: null,
        checkIfSpjsConnected: function(callback) {
            this.statusCallback = callback;
            this.requestSpjsStatus();
        },
        requestSpjsStatus: function() {
            // we need to ask spjs to get a version back
            if (this.isSpjsStatusInitted == false) {
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvStatus", this, this.onRequestSpjsStatusCallback);
                this.isSpjsStatusInitted = true;
            }
            
            // wait about 2 seconds just to wait a bit for connecting
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/requestStatus");
            }, 1000);
            
        },
        onRequestSpjsStatusCallback: function(payload) {
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/recvStatus", this.onRequestSpjsStatusCallback);
            this.isSpjsStatusInitted = false;
            this.statusCallback(payload);
        },
        /**
         * Attach all events to the install div to enable everything to work.
         */
        uv4lSetupInstall: function() {
            $('#' + this.id + " .btn-install").click(this.uv4lInstall.bind(this));
            $('#' + this.id + " .btn-login").click(this.onHostLogin.bind(this));
        },
        isUseLogin: false, // if set to true then use login
        user: null,
        pass: null,
        onHostLogin: function() {
            console.log("onHostLogin");
            this.isUseLogin = true;
            this.user = $('#' + this.id + " .username").val(); 
            this.pass = $('#' + this.id + " .password").val(); 
            console.log("user:", this.user, "pass:", this.pass);
            this.initCheckForCam();
        },
        /**
         * Check if uv4l is installed
         */
        uv4lCheckIfInstalled: function(callback) {
            // if you have verified if this is linux/raspi this will check
            // if installed
            this.sendSync("uv4l -i", function(data) {
                // when we get here, we have our response from uv4l
                console.log("got check for uv4l back. data:", data);
                if (data.Output.match(/Userspace Video4Linux/i)) {
                    // uv4l is installed
                    callback({isInstalled: true});
                } else {
                    // uv4l not installed
                    callback({isInstalled: false});
                }
            });
        },
        
        /**
         * Check if -allowexec is in play
         */
        checkIfAllowExec: function(callback) {
            console.log("checking if allowexec is in play")
            // we see if we can exec a command. just send any command.
            this.sendSync('echo "chilipeppr"', function(data) {
                // when we get here, we have our response from uv4l
                console.log("got check for exec allow back. data:", data);
                if (data.Output.match(/chilipeppr/i)) {
                    // allowexec good
                    callback({isAllowExec: true});
                } else {
                    // not allowed
                    callback({isAllowExec: false});
                }
            });
        },
        
        getMyLocalIp: function(callback) {
            window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
            var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
            pc.createDataChannel("");    //create a bogus data channel
            pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
            pc.onicecandidate = function(ice){  //listen for candidate events
                if(!ice || !ice.candidate || !ice.candidate.candidate) {
                    if (callback) callback({isSuccess: false, err: "Could not get IceCandidate"});
                    return;
                }
                var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
                console.log('my IP: ', myIP);
                if (callback) callback({isSuccess: true, Ip: myIP});
                pc.onicecandidate = noop;
            };  
        },
        /**
         * We actually do the install here
         */
        uv4lInstall: function() {
            
            // let's show commands and results in terminal pre div
            var termEl = $('#' + this.id + ' .terminal');
            termEl.text("");
            
            // first step is
            // curl http://www.linux-projects.org/listing/uv4l_repo/lrkey.asc | sudo apt-key add -
            var cmd = "bash -c \"curl http://www.linux-projects.org/listing/uv4l_repo/lrkey.asc | sudo apt-key add -\"";
            this.appendToOutput("> " + cmd);
            
            this.sendSync(cmd, function(data) {
                // this.appendToOutput(data.Output);
                
                if (data.ExecStatus == "Error") {
                    this.appendToOutput("Ran into error. Please try install again.");
                    return;
                }
                
                // next step add deb to /etc/apt/sources.list
                cmd = "sudo sed -i '$ a deb http://www.linux-projects.org/listing/uv4l_repo/raspbian/ wheezy main' /etc/apt/sources.list";
                this.appendToOutput("> " + cmd);
                this.sendSync(cmd, function(data) {
                    // this.appendToOutput(data.Output);

                    if (data.ExecStatus == "Error") {
                        this.appendToOutput("Ran into error. Please try install again.");
                        return;
                    }
                    
                    // next
                    cmd = "sudo apt-get -y update; sudo apt-get -y install uv4l uv4l-raspicam uv4l-raspicam-extras uv4l-webrtc uv4l-server uv4l-uvc uv4l-mjpegstream";
                    this.appendToOutput("> " + cmd);
                    this.sendSync(cmd, function(data) {
                        // this.appendToOutput(data.Output);
                        
                        if (data.ExecStatus == "Error") {
                            this.appendToOutput("Ran into error. Please try install again.");
                            return;
                        }

                        // next
                        cmd = "sudo service uv4l_raspicam restart; sudo service uv4l_raspicam status";
                        this.appendToOutput("> " + cmd);
                        this.sendSync(cmd, function(data) {
                            // this.appendToOutput(data.Output);

                            if (data.ExecStatus == "Error") {
                                this.appendToOutput("Ran into error. Please try install again.");
                                return;
                            }
                            
                            // we are ready to show a preview of the video stream
                            this.appendToOutput("Ready to show video stream.");
                            
                        });
                    });
                });
            });
        },
        checkIfUv4lIsRunning: function(callback) {
            var results = {isRunning: false};
            // we can see if uv4l is running from the command
            // sudo service uv4l_raspicam status
            this.sendSync("sudo service uv4l_raspicam status", function(data) {
                console.log("checkIfUv4lIsRunning. data:", data);
                if (data.Output.match(/Active: active/)) {
                    // it is running
                    results.isRunning = true;
                }
                if (callback) callback(results);
            })
        },
        appendToOutput: function(txt) {
            var termEl = $('#' + this.id + ' .terminal');
            termEl.text(termEl.text() + txt + "\n");
            
            termEl.scrollTop(termEl[0].scrollHeight - termEl.height());
        },
        
        // ---------------
        // End Cam check/install region
        // ---------------
        


        mute: function() {
            var remoteVideo = document.getElementById("remote-video");
            remoteVideo.muted = !remoteVideo.muted;
        },

        pause: function() {
            var remoteVideo = document.getElementById("remote-video");
            if (remoteVideo.paused)
                remoteVideo.play();
            else
                remoteVideo.pause();
        },

        fullscreen: function() {
            var remoteVideo = document.getElementById("remote-video");
            if(remoteVideo.requestFullScreen){
                remoteVideo.requestFullScreen();
            } else if(remoteVideo.webkitRequestFullScreen){
                remoteVideo.webkitRequestFullScreen();
            } else if(remoteVideo.mozRequestFullScreen){
                remoteVideo.mozRequestFullScreen();
    	    }
        },

        singleselection: function(name, id) {
            var old = document.getElementById(id).checked;
            var elements = document.getElementsByName(name);
            for(var i = 0; i < elements.length; i++) {
                elements[i].checked = false;
            }
            document.getElementById(id).checked = old ? true : false;
        },

        /**
         * Call this method from init to setup all the buttons when this widget
         * is first loaded. This basically attaches click events to your 
         * buttons. It also turns on all the bootstrap popovers by scanning
         * the entire DOM of the widget.
         */
        btnSetup: function() {

            // Chevron hide/show body
            var that = this;
            $('#' + this.id + ' .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#' + that.id + ' .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                }
                else {
                    // hide
                    that.hideBody(evt);
                }
            });

            // Ask bootstrap to scan all the buttons in the widget to turn
            // on popover menus
            $('#' + this.id + ' .btn').popover({
                delay: 1000,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });

            $('#' + that.id + ' .btn-preferences').click(
                this.showOptionsModal.bind(this)
            );
            
            // options
            var el = $('#' + that.id);
            el.find('.mjpeg-url').change(function(evt) {
                console.log("evt:", evt);
                that.options.mjpegurl = evt.currentTarget.value;
                el.find('.mjpeg-image').attr("src", that.options.mjpegurl);
                console.log("options:", that.options);
                that.saveOptionsLocalStorage();
            });
            if(that.options.mjpegurl !== undefined){
                el.find('.mjpeg-image').attr("src", that.options.mjpegurl);
                el.find('.mjpeg-url').val(that.options.mjpegurl);
            }
        },
        showOptionsModal: function() {
            $('#' + this.id + ' .preferences-window').modal('show');
        },
        /**
         * User options are available in this property for reference by your
         * methods. If any change is made on these options, please call
         * saveOptionsLocalStorage()
         */
        options: null,
        /**
         * Call this method on init to setup the UI by reading the user's
         * stored settings from localStorage and then adjust the UI to reflect
         * what the user wants.
         */
        setupUiFromLocalStorage: function() {

            // Read vals from localStorage. Make sure to use a unique
            // key specific to this widget so as not to overwrite other
            // widgets' options. By using this.id as the prefix of the
            // key we're safe that this will be unique.

            // Feel free to add your own keys inside the options 
            // object for your own items

            var options = localStorage.getItem(this.id + '-options');
            if (options) {
                options = $.parseJSON(options);
                console.log("just evaled options: ", options);
            }
            else {
                options = {
                    showBody: true,
                    tabShowing: 1,
                    customParam1: null,
                    customParam2: 1.0
                };
            }

            this.options = options;
            console.log("options:", options);

            // show/hide body
            if (options.showBody) {
                this.showBody();
            }
            else {
                this.hideBody();
            }

        },
        /**
         * When a user changes a value that is stored as an option setting, you
         * should call this method immediately so that on next load the value
         * is correctly set.
         */
        saveOptionsLocalStorage: function() {
            // You can add your own values to this.options to store them
            // along with some of the normal stuff like showBody
            var options = this.options;

            var optionsStr = JSON.stringify(options);
            console.log("saving options:", options, "json.stringify:", optionsStr);
            // store settings to localStorage
            localStorage.setItem(this.id + '-options', optionsStr);
        },
        /**
         * Show the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        showBody: function(evt) {
            $('#' + this.id + ' .panel-body').removeClass('hidden');
            $('#' + this.id + ' .panel-footer').removeClass('hidden');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-down');
            // $('#' + this.id + ' .overlayWrapper').removeClass('hidden');
            if (!(evt == null)) {
                this.options.showBody = true;
                this.saveOptionsLocalStorage();
            }
        },
        /**
         * Hide the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        hideBody: function(evt) {
            $('#' + this.id + ' .panel-body').addClass('hidden');
            $('#' + this.id + ' .panel-footer').addClass('hidden');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-down');
            // $('#' + this.id + ' .overlayWrapper').addClass('hidden');
            if (!(evt == null)) {
                this.options.showBody = false;
                this.saveOptionsLocalStorage();
            }
        },
        /**
         * This method loads the pubsubviewer widget which attaches to our 
         * upper right corner triangle menu and generates 3 menu items like
         * Pubsub Viewer, View Standalone, and Fork Widget. It also enables
         * the modal dialog that shows the documentation for this widget.
         * 
         * By using chilipeppr.load() we can ensure that the pubsubviewer widget
         * is only loaded and inlined once into the final ChiliPeppr workspace.
         * We are given back a reference to the instantiated singleton so its
         * not instantiated more than once. Then we call it's attachTo method
         * which creates the full pulldown menu for us and attaches the click
         * events.
         */
        forkSetup: function() {
            var topCssSelector = '#' + this.id;

            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 1000,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            var that = this;
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown-menu'), that);
                });
            });

        },

    }
});