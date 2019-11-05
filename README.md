# teachable-arm

Teachable Arm project inspired by Teachable Machine from Google A.I. Experiment.

This program made for STEAM program understanding how A.I. works and making A.I. Robotic Art.




function() {
                    var matchesFilters = function(iface) {
                        var a0 = iface.alternates[0];
                        for (var _i = 0, filters_1 = usb.filters; _i < filters_1.length; _i++) {
                            var f = filters_1[_i];
                            if (f.classCode == null || a0.interfaceClass === f.classCode) {
                                if (f.subclassCode == null || a0.interfaceSubclass === f.subclassCode) {
                                    if (f.protocolCode == null || a0.interfaceProtocol === f.protocolCode) {
                                        if (a0.endpoints.length == 0)
                                            return true;
                                        if (a0.endpoints.length == 2 && a0.endpoints.every(function(e) {
                                            return e.packetSize == 64;
                                        }))
                                            return true;
                                    }
                                }
                            }
                        }
                        return false;
                    };
                    _this.log("got " + dev.configurations[0].interfaces.length + " interfaces");
                    var iface = dev.configurations[0].interfaces.filter(matchesFilters)[0];
