//0x0d28 microbit vendorID
//0x0204
var device;
let button;

function setup() {
    button = select("#test");
    button.mousePressed(connectUSB);
}
function connectUSB() {
    navigator.usb
      .requestDevice({ filters: [{ vendorId: 0x0d28 }] }) // mircrobit vendorID, productID: 0x0204
      .then(device => {
        port = device;
       
        console.log(device.productName);
        console.log(device.manufacturerName);
        //버튼 활성화 Button Activated!
        return port.open();
      })
      .then(() => port.selectConfiguration(1))
      .then(() => port.claimInterface(port.configuration.interfaces[0].interfaceNumber))
      .then(() =>
        port.controlTransferOut({
          requestType: "standard",
          recipient: "interface",
          request: 0x22,
          value: 0x01,
          index: 0x02
        })
      )
      .then(() => port.transferIn(4, 64))
      .then(result => {
        let decoder = new TextDecoder();
        console.log("Recieved: " + decoder.decode(result.data));
      })
      .catch(error => {
        //deviceP.html(error);
        console.log(error);
      });
  }