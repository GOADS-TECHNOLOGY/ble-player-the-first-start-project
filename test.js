const bleno = require("./index");
// import os module
const os = require("os");
// get host name
const hostName = os.hostname();

const BlenoPrimaryService = bleno.PrimaryService;
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;
const { spawn } = require("child_process");
const fs = require("fs");
const pathToStoreVideoConfig =
  "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage/config.json";
const pathToStoreVideo =
  "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage";

console.log("==================");
console.log("GoAds BLE Starting");
console.log("==================");

console.log(bleno.PrimaryService);

class StaticReadOnlyCharacteristic extends BlenoCharacteristic {
  constructor() {
    super({
      uuid: "fffffffffffffffffffffffffffffff1",
      properties: ["read"],
      value: Buffer.from("Hello Kudo!"),
      descriptors: [
        new BlenoDescriptor({
          uuid: "2901",
          value: "user description",
        }),
      ],
    });
  }
}

class DynamicReadOnlyCharacteristic extends BlenoCharacteristic {
  constructor() {
    super({
      uuid: "fffffffffffffffffffffffffffffff2",
      properties: ["read"],
    });
  }

  onReadRequest(offset, callback) {
    let result = this.RESULT_SUCCESS;
    let data = Buffer.from("dynamic value");

    if (offset > data.length) {
      result = this.RESULT_INVALID_OFFSET;
      data = null;
    } else {
      data = data.slice(offset);
    }

    callback(result, data);
  }
}

class LongDynamicReadOnlyCharacteristic extends BlenoCharacteristic {
  constructor() {
    super({
      uuid: "fffffffffffffffffffffffffffffff3",
      properties: ["read"],
    });
  }

  onReadRequest(offset, callback) {
    let result = this.RESULT_SUCCESS;
    let data = Buffer.alloc(512);

    for (let i = 0; i < data.length; i++) {
      data[i] = i % 256;
    }

    if (offset > data.length) {
      result = this.RESULT_INVALID_OFFSET;
      data = null;
    } else {
      data = data.slice(offset);
    }

    callback(result, data);
  }
}

class WriteOnlyCharacteristic extends BlenoCharacteristic {
  constructor() {
    super({
      uuid: "fffffffffffffffffffffffffffffff4",
      properties: ["write", "notify"],
      // properties: ["writeWithoutResponse", "notify"],
    });
    this.writeCount = 0;
    this.completeData = Buffer.alloc(0);
    this.child = null;
    this.isReceivedData = false;
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    this.isReceivedData = false;

    console.log(
      "WriteOnlyCharacteristic write request: " + data.toString("utf-8")
    );
    console.log("Write dataBase64: " + data.toString("base64"));
    console.log("Write request count: " + ++this.writeCount);

    this.completeData = Buffer.concat([this.completeData, data]);

    try {
      const convertObj = JSON.parse(String(data.toString("utf-8")));

      if (convertObj?.Code === 200) {
        const completeDataString = this.completeData.toString("base64");
        console.log("Complete data received: " + completeDataString);
        this.completeData = Buffer.alloc(0);
        this.writeCount = 0;

        // This code is use for testing, in production with be changed to comfortably
        // --------------------------------------------------------------------------------
        const videoID = `goads00${Math.floor(Math.random() * 100) + 1}`;
        // new data will receive from mobile devices and replace
        writeDataToJsonFile(pathToStoreVideoConfig, {
          ID: videoID,
          Code: 200,
          Schedule: {
            time_start: 837248327483,
            time_end: 84883478437584,
          },
        });

        if (this._updateValueCallback) {
          if (this.isReceivedData) {
            this.isReceivedData = false;
          } else {
            this._updateValueCallback(Buffer.from(`${200}`, "utf-8"));
            this.isReceivedData = true;
          }
        }

        this.decodeConvertToFile(completeDataString);

        this.readIdInJSONString(pathToStoreVideoConfig);

        callback(this.RESULT_SUCCESS);
      }
    } catch (error) {
      // console.error(error);
    }
    // --------------------------------------------------------------------------------

    if (data.toString("base64") === "RGVsZXRlQ29uZmln") {
      DeleteFile(pathToStoreVideoConfig);
      if (this._updateValueCallback) {
        this._updateValueCallback(Buffer.from(`${null}`, "utf-8"));
      }
      callback(this.RESULT_CONTINUE);
    } else {
      if (this._updateValueCallback) {
        this._updateValueCallback(Buffer.from(`${null}`, "utf-8"));
      }
      callback(this.RESULT_CONTINUE);
    }
  }

  decodeConvertToFile(dataString) {
    if (!fs.existsSync(pathToStoreVideo)) {
      fs.mkdirSync(pathToStoreVideo, { recursive: true });
    } else {
      const bufferData = Buffer.from(dataString, "base64");
      fs.writeFileSync(
        `${pathToStoreVideo}/output_write.mp4`,
        bufferData,
        "binary"
      );
      console.log("File MP4 has been successfully created.");
      this.runCommandLine();
    }
  }

  runCommandLine() {
    // Terminate any existing process
    if (this.child) {
      this.child.kill("SIGTERM");
    }

    const command = "sudo";
    const args = [
      "/home/pi3b/Projects/rpi-rgb-led-matrix/utils/video-viewer",
      "--led-brightness=70",
      "--led-show-refresh",
      "--led-rows=64",
      "--led-cols=128",
      "--led-parallel=3",
      "--led-pwm-dither-bits=1",
      "-f",
      "-F",
      "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage/output_write.mp4",
      "--led-pwm-bits=9",
      "--led-pwm-lsb-nanoseconds=300",
    ];

    // Spawn the process
    const child = spawn(command, args);

    // Handle output
    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }

  stopProcess() {
    if (this.child) {
      this.child.kill("SIGTERM"); // Terminate the process
      this.child = null; // Reset the reference
      console.log("Process stopped");
    }
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    this._updateValueCallback = updateValueCallback;
  }

  readIdInJSON(fileName) {
    // Read file JSON
    const fs = require("fs");
    // const fileName = '/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage/';
    fs.readFile(fileName, "utf8", (err, data) => {
      if (err) {
        console.error("Error occurred while reading the file:", err);
        return;
      }

      try {
        // Parse JSON content into a JavaScript object
        const jsonObject = JSON.parse(data);

        // Get ID from JSON object
        const id = jsonObject.id;

        // Print the ID to the screen or perform other operations with the ID
        console.log("ID from JSON file:", id);
      } catch (jsonError) {
        console.error(
          "Error occurred while parsing the JSON content:",
          jsonError
        );
      }
    });
  }
}

module.exports = WriteOnlyCharacteristic;

class NotifyOnlyCharacteristic extends BlenoCharacteristic {
  constructor() {
    super({
      uuid: "fffffffffffffffffffffffffffffff5",
      properties: ["notify"],
    });
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("NotifyOnlyCharacteristic subscribe");

    this.counter = 0;
    this.changeInterval = setInterval(
      function () {
        const data = Buffer.alloc(4);
        data.writeUInt32LE(this.counter, 0);

        console.log("NotifyOnlyCharacteristic update value: " + this.counter);
        updateValueCallback(data);
        this.counter++;
      }.bind(this),
      5000
    );
  }

  onUnsubscribe() {
    console.log("NotifyOnlyCharacteristic unsubscribe");

    if (this.changeInterval) {
      clearInterval(this.changeInterval);
      this.changeInterval = null;
    }
  }

  onNotify() {
    console.log("NotifyOnlyCharacteristic on notify");
  }
}

class IndicateOnlyCharacteristic extends BlenoCharacteristic {
  constructor() {
    super({
      uuid: "fffffffffffffffffffffffffffffff6",
      properties: ["indicate"],
    });
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log("IndicateOnlyCharacteristic subscribe");

    this.counter = 0;
    this.changeInterval = setInterval(
      function () {
        const data = Buffer.alloc(4);
        data.writeUInt32LE(this.counter, 0);

        console.log("IndicateOnlyCharacteristic update value: " + this.counter);
        updateValueCallback(data);
        this.counter++;
      }.bind(this),
      1000
    );
  }

  onUnsubscribe() {
    console.log("IndicateOnlyCharacteristic unsubscribe");

    if (this.changeInterval) {
      clearInterval(this.changeInterval);
      this.changeInterval = null;
    }
  }

  onIndicate() {
    console.log("IndicateOnlyCharacteristic on indicate");
  }
}

class SampleService extends BlenoPrimaryService {
  constructor() {
    super({
      uuid: "fffffffffffffffffffffffffffffff0",
      characteristics: [
        new StaticReadOnlyCharacteristic(),
        new DynamicReadOnlyCharacteristic(),
        new LongDynamicReadOnlyCharacteristic(),
        new WriteOnlyCharacteristic(),
        new NotifyOnlyCharacteristic(),
        new IndicateOnlyCharacteristic(),
      ],
    });
  }
}

bleno.on("stateChange", function (state) {
  console.log("on -> stateChange: " + state + ", address = " + bleno.address);

  if (state === "poweredOn") {
    bleno.startAdvertising(hostName, ["fffffffffffffffffffffffffffffff0"]);
  } else {
    bleno.stopAdvertising();
  }
});

// Linux only events /////////////////
bleno.on("accept", function (clientAddress) {
  console.log("on -> accept, client: " + clientAddress);

  bleno.updateRssi();
});

bleno.on("disconnect", function (clientAddress) {
  console.log("on -> disconnect, client: " + clientAddress);
});

bleno.on("rssiUpdate", function (rssi) {
  console.log("on -> rssiUpdate: " + rssi);
});
//////////////////////////////////////

bleno.on("mtuChange", function (mtu) {
  console.log("on -> mtuChange: " + mtu);
});

bleno.on("advertisingStart", function (error) {
  console.log(
    "on -> advertisingStart: " + (error ? "error " + error : "success")
  );

  if (!error) {
    bleno.setServices([new SampleService()]);
  }
});

bleno.on("advertisingStop", function () {
  console.log("on -> advertisingStop");
});

bleno.on("servicesSet", function (error) {
  console.log("on -> servicesSet: " + (error ? "error " + error : "success"));
});

const writeDataToJsonFile = (path, data) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);

    const currentData = JSON.parse(rawData) || [];
    // Add new data
    const newData = [...currentData, data];
    // Update new data to the file
    fs.writeFileSync(path, JSON.stringify(newData));
    console.log("Dữ liệu đã được cập nhật vào file.");
  } else {
    // If file is not exist, create and add data to it
    fs.writeFileSync(path, JSON.stringify([data]));
    console.log("File mới đã được tạo và dữ liệu đã được thêm vào.");
  }
};

const DeleteFile = (path) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // Delete file
    fs.unlinkSync(path);
    console.log("Dữ liệu đã được xóa khỏi file.");
  }
};
