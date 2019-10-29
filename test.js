//0x0d28 microbit vendorID
//0x0204
var device;

navigator.usb.requestDevice({ filters: [{ vendorId: 0x0d28 }] })
    .then(selectedDevice => {
        device = selectedDevice
        console.log(device.productName);      // "Arduino Micro"
        console.log(device.manufacturerName); // "Arduino LLC"
        return device.open();
    })
    .then(() => device)
    .catch(error => { console.log(error); });