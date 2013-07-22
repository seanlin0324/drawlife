
'use strict';
var os = require('os');

/**
 * Auto Get IP Address List
 */
exports.getAddresses = function() {
    var interfaces = os.networkInterfaces(),
        addresses = [],
        address,
        iface,
        iface_length,
        i;

    for (iface in interfaces) {
        if (interfaces.hasOwnProperty(iface)) {

            iface = interfaces[iface];
            iface_length = iface.length;

            for (i = 0; i < iface_length; i += 1) {

                address = iface[i];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
    }
    return addresses;
};


/**
 * Get CPU Nums
 */
exports.getCpus = function () {
    var cpus = os.cpus().length;
    return cpus;
};