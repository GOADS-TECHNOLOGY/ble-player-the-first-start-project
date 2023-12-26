const recordLogEntry = require("./log.js");

const bleno = require("./index");

const cron = require("node-cron");

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
const pathToStoreVideoLog =
  "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage/logVideo.json";
const pathToStoreVideo =
  "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage";

recordLogEntry(
  "INFO",
  "SYSTEM",
  "---------------------NEW CYCLE--------------------"
);

recordLogEntry("INFO", "BLE", "GoAds BLE Starting");

class IntervalPlayVideo {
  constructor() {
    this._updateValueCallback = null;
    this.child = null;
    this.previousQuantityVideo = 0;
    this.currentIndexVideoRunning = 0;
    this.playlistInterval = null;
  }

  setSendNotify(callback) {
    this._updateValueCallback = callback;
  }

  setIndexPlayVideo(index) {
    this.currentIndexVideoRunning = index;
  }

  runPlaylistVideo() {
    this.playVideo(pathToStoreVideoConfig);
    this.runIntervalVideo();
  }

  runIntervalVideo() {
    this.playlistInterval = setInterval(() => {
      this.playVideo(pathToStoreVideoConfig);
    }, 15000);
  }

  runDefaultVideo() {
    if (fs.existsSync(pathToStoreVideo)) {
      recordLogEntry("INFO", "Play Default Video", "Run default value");

      // this.stopProcess();
      this.clearPlaylistVideo();
      this.runCommandLine("default");
    } else {
      recordLogEntry("WARNING", "Play Default Video", `No default file`);
    }
  }

  playVideo(path) {
    if (fs.existsSync(path)) {
      const rawData = fs.readFileSync(path);
      const videoList = JSON.parse(rawData) || [];

      if (this.previousQuantityVideo === videoList.length) {
        const videoIdWillPlay = videoList[this.currentIndexVideoRunning]?.ID;

        recordLogEntry(
          "INFO",
          "Play Video",
          `Index video: ${this.currentIndexVideoRunning}`
        );

        this.stopProcess();
        // this.clearPlaylistVideo();

        const logVideoById = getLogVideoById(
          pathToStoreVideoLog,
          videoIdWillPlay
        );

        if (logVideoById) {
          const newLogData = {
            ...logVideoById,
            label: {
              ...logVideoById.label,
              displayCount: logVideoById?.label?.displayCount + 1,
              viewCount:
                logVideoById?.label?.viewCount + Math.floor(Math.random() * 30),
            },
          };

          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(JSON.stringify(newLogData), "utf-8")
            );
          }

          writeLogRunVideo(pathToStoreVideoLog, newLogData);
        } else {
          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(
                JSON.stringify({
                  ID: videoIdWillPlay,
                  label: {
                    person: 1,
                    car: 3,
                    motocycle: 4,
                    timestamp: 131232132131,
                    displayCount: logVideoById?.label?.displayCount + 1,
                    viewCount:
                      logVideoById?.label?.viewCount +
                      Math.floor(Math.random() * 30),
                  },
                }),
                "utf-8"
              )
            );
          }

          writeLogRunVideo(pathToStoreVideoLog, {
            ID: videoIdWillPlay,
            label: {
              person: 1,
              car: 3,
              motocycle: 4,
              timestamp: 131232132131,
              displayCount: logVideoById?.label?.displayCount + 1,
              viewCount:
                logVideoById?.label?.viewCount + Math.floor(Math.random() * 30),
            },
          });
        }

        this.runCommandLine(videoIdWillPlay);

        if (this.currentIndexVideoRunning === videoList.length - 1) {
          this.currentIndexVideoRunning = 0;
        } else {
          this.currentIndexVideoRunning = this.currentIndexVideoRunning + 1;
        }
      } else {
        recordLogEntry("INFO", "Play Video", `Index video: 0`);

        this.previousQuantityVideo = videoList.length;
        this.currentIndexVideoRunning = 1;
        // this.stopProcess();
        this.clearPlaylistVideo();

        const logVideoById = getLogVideoById(
          pathToStoreVideoLog,
          videoList[0]?.ID
        );

        if (logVideoById) {
          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(
                JSON.stringify({
                  ID: videoList[0]?.ID,
                  label: {
                    ...logVideoById.label,
                    displayCount: logVideoById?.label?.displayCount + 1,
                    viewCount:
                      logVideoById?.label?.viewCount +
                      Math.floor(Math.random() * 30),
                  },
                }),
                "utf-8"
              )
            );
          }

          writeLogRunVideo(pathToStoreVideoLog, {
            ID: videoList[0]?.ID,
            label: {
              ...logVideoById.label,
              displayCount: logVideoById?.label?.displayCount + 1,
              viewCount:
                logVideoById?.label?.viewCount + Math.floor(Math.random() * 30),
            },
          });
        } else {
          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(
                JSON.stringify({
                  ID: videoList[0]?.ID,
                  label: {
                    person: 1,
                    car: 3,
                    motocycle: 4,
                    timestamp: 131232132131,
                    displayCount: logVideoById?.label?.displayCount + 1,
                    viewCount:
                      logVideoById?.label?.viewCount +
                      Math.floor(Math.random() * 30),
                  },
                }),
                "utf-8"
              )
            );
          }
          writeLogRunVideo(pathToStoreVideoLog, {
            ID: videoList[0]?.ID,
            label: {
              person: 1,
              car: 3,
              motocycle: 4,
              timestamp: 131232132131,
              displayCount: logVideoById?.label?.displayCount + 1,
              viewCount:
                logVideoById?.label?.viewCount + Math.floor(Math.random() * 30),
            },
          });
        }

        this.runCommandLine(videoList[0]?.ID);
      }
    } else {
      recordLogEntry("WARNING", "Write config file", `No config.json file`);
    }
  }

  stopIntervalPlayList() {
    if (this.playlistInterval) {
      clearInterval(this.playlistInterval);
      this.playlistInterval = null;
    }
  }

  runCommandLine(id) {
    // Terminate any existing process
    if (this.child) {
      this.child.kill("SIGTERM");
    }

    const command = "sudo";
    const args = [
      "/home/pi3b/Projects/rpi-rgb-led-matrix/utils/video-viewer",
      "--led-brightness=80",
      "--led-show-refresh",
      "--led-rows=64",
      "--led-cols=128",
      "--led-parallel=3",
      "--led-pwm-dither-bits=1",
      "-f",
      "-F",
      "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage/" +
        id +
        ".mp4",
      "--led-pwm-bits=10",
      "--led-pwm-lsb-nanoseconds=274",
    ];

    // Spawn the process
    this.child = spawn(command, args);

    // Handle output
    this.child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    this.child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    this.child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }

  stopProcess() {
    if (this.child) {
      this.child.kill("SIGTERM"); // Terminate the process
      this.child = null; // Reset the reference
      recordLogEntry("INFO", "Play Video", `Process stopped`);
    }
  }

  clearPlaylistVideo() {
    this.stopProcess();
    this.stopIntervalPlayList();
  }
}

const intervalPlayVideo = new IntervalPlayVideo();

// // Define your task to be executed every minute
// const minuteJob = () => {
//   const currentTime = new Date().toLocaleTimeString();
//   console.log(`This job runs every minute! Current time: ${currentTime}`);
//   intervalPlayVideo.runDefaultVideo();

//   // Record the start time
//   const startTime = new Date().getTime();

//   // Your code inside setTimeout
//   setTimeout(() => {
//     // // Record the end time
//     // const endTime = new Date().getTime();

//     // // Calculate the time elapsed
//     // const elapsedTime = endTime - startTime;

//     // console.log(`Time taken: ${elapsedTime} milliseconds`);
//     console.log(`Stop video and enable previous video`);
//     recordLogEntry("INFO", "Play Default Video", "Clear Defaul Video Job");

//     intervalPlayVideo.clearPlaylistVideo();
//     recordLogEntry("INFO", "Play Default Video", "Continue Playlist");

//     intervalPlayVideo.runPlaylistVideo();

//     // Your code here
//   }, 2 * 60 * 1000); // 1000 milliseconds (1 second) delay in this example

//   // Add your job logic here
// };

// // Schedule the job to run every minute
// cron.schedule("0 * * * *", minuteJob);

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

    console.log("Write request count: " + ++this.writeCount);

    this.completeData = Buffer.concat([this.completeData, data]);

    try {
      const convertObj = JSON.parse(String(data.toString("utf-8")));

      if (convertObj?.Code === 200) {
        const videoID = convertObj?.ID;

        if (!checkIdVideoExistInConfig(videoID, pathToStoreVideoConfig)) {
          const completeDataString = this.completeData.toString("base64");

          // recordLogEntry(
          //   "INFO",
          //   "Received Package Successfully",
          //   "Complete data received: " + completeDataString
          // );

          this.completeData = Buffer.alloc(0);
          this.writeCount = 0;

          writeDataConfigVideoToJsonFile(pathToStoreVideoConfig, convertObj);

          if (this._updateValueCallback) {
            if (this.isReceivedData) {
              this.isReceivedData = false;
            } else {
              this._updateValueCallback(Buffer.from(`${200}`, "utf-8"));
              this.isReceivedData = true;
            }

            intervalPlayVideo.setSendNotify(this._updateValueCallback);
          }

          this.decodeConvertToFile(completeDataString, videoID);

          intervalPlayVideo.setIndexPlayVideo(0);
          intervalPlayVideo.clearPlaylistVideo();
          intervalPlayVideo.runPlaylistVideo();

          callback(this.RESULT_SUCCESS);
        }
      }
    } catch (error) {}

    if (data.toString("base64") === "UGxheUxpc3RWaWRlbw==") {
      if (this._updateValueCallback) {
        intervalPlayVideo.setSendNotify(this._updateValueCallback);
      }
      intervalPlayVideo.setIndexPlayVideo(0);
      intervalPlayVideo.clearPlaylistVideo();
      intervalPlayVideo.runPlaylistVideo();
    }

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

  onReadRequest(offset, callback) {
    let data = null;
    // Check file exist
    if (fs.existsSync(pathToStoreVideoLog)) {
      // If exit, read data from the file
      const rawData = fs.readFileSync(pathToStoreVideoLog);
      data = rawData;

      console.log("Gửi dữ liệu.");
    }
    console.log("log data: ", JSON.stringify(data));
    callback(
      this.RESULT_SUCCESS,
      Buffer.from(JSON.stringify(data).toString("utf-8"))
    );
    // callback(this.RESULT_SUCCESS, JSON.stringify(data));
  }

  decodeConvertToFile(dataString, id) {
    if (!fs.existsSync(pathToStoreVideo)) {
      fs.mkdirSync(pathToStoreVideo, { recursive: true });
    } else {
      const bufferData = Buffer.from(dataString, "base64");
      fs.writeFileSync(`${pathToStoreVideo}/${id}.mp4`, bufferData, "binary");

      recordLogEntry(
        "INFO",
        "decodeConvertToFile",
        `${id}-File MP4 has been successfully created`
      );
    }
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    this._updateValueCallback = updateValueCallback;
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
  recordLogEntry(
    "INFO",
    "BLE",
    "on -> stateChange: " + state + ", address = " + bleno.address
  );

  if (state === "poweredOn") {
    bleno.startAdvertising(hostName, ["fffffffffffffffffffffffffffffff0"]);
    intervalPlayVideo.runPlaylistVideo();
  } else {
    bleno.stopAdvertising();
  }
});

// Linux only events /////////////////
bleno.on("accept", function (clientAddress) {
  recordLogEntry("INFO", "BLE", "on -> accept, client: " + clientAddress);

  bleno.updateRssi();
});

bleno.on("disconnect", function (clientAddress) {
  recordLogEntry("INFO", "BLE", "on -> disconnect, client: " + clientAddress);
});

bleno.on("rssiUpdate", function (rssi) {
  recordLogEntry("INFO", "BLE", "on -> rssiUpdate: " + rssi);
});
//////////////////////////////////////

bleno.on("mtuChange", function (mtu) {
  recordLogEntry("INFO", "BLE", "on -> mtuChange: " + mtu);
});

bleno.on("advertisingStart", function (error) {
  recordLogEntry(
    "INFO",
    "BLE",
    "on -> advertisingStart: " + (error ? "error " + error : "success")
  );

  if (!error) {
    bleno.setServices([new SampleService()]);
  }
});

bleno.on("advertisingStop", function () {
  recordLogEntry("INFO", "BLE", "on -> advertisingStop");
});

bleno.on("servicesSet", function (error) {
  recordLogEntry(
    "INFO",
    "BLE",
    "on -> servicesSet: " + (error ? "error " + error : "success")
  );
});

const writeDataConfigVideoToJsonFile = (path, data) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);

    const currentData = JSON.parse(rawData) || [];

    const arrayCheckDuplicateID = currentData?.filter(
      (video) => video.ID === data.ID
    );
    if (arrayCheckDuplicateID.length === 0) {
      // Add new data
      const newData = [...currentData, data];
      // Update new data to the file
      fs.writeFileSync(path, JSON.stringify(newData));
      recordLogEntry(
        "INFO",
        "writeDataConfigVideoToJsonFile",
        "Dữ liệu đã được cập nhật vào file."
      );
    }
  } else {
    // If file is not exist, create and add data to it
    fs.writeFileSync(path, JSON.stringify([data]));

    recordLogEntry(
      "INFO",
      "writeDataConfigVideoToJsonFile",
      "File mới đã được tạo và dữ liệu đã được thêm vào"
    );
  }
};

const writeLogRunVideo = (path, newLog) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);

    const currentData = JSON.parse(rawData) || [];

    const arrayCheckDuplicateID = currentData?.filter(
      (video) => video.ID === newLog.ID
    );
    if (arrayCheckDuplicateID.length === 0) {
      // Add new data
      const newData = [...currentData, newLog];
      // Update new data to the file
      fs.writeFileSync(path, JSON.stringify(newData));
    } else {
      const newLogData = currentData.map((element) => {
        if (element.ID === newLog.ID) {
          return {
            ...element,
            ...newLog,
          };
        } else {
          return element;
        }
      });
      fs.writeFileSync(path, JSON.stringify(newLogData));
    }

    recordLogEntry(
      "INFO",
      "writeDataConfigVideoToJsonFile",
      "File log đã được cập nhật"
    );
  } else {
    // If file is not exist, create and add data to it
    fs.writeFileSync(path, JSON.stringify([newLog]));

    recordLogEntry(
      "INFO",
      "writeDataConfigVideoToJsonFile",
      "File log mới đã được tạo và thêm dữ liệu"
    );
  }
};

const getLogVideoById = (path, id) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);

    const currentData = JSON.parse(rawData) || [];
    return currentData.find((element) => element.ID === id);
  } else {
    return undefined;
  }
};

const checkIdVideoExistInConfig = (id, path) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);

    const currentData = JSON.parse(rawData) || [];

    const arrayCheckDuplicateID = currentData?.filter(
      (video) => video.ID === id
    );
    if (arrayCheckDuplicateID.length === 0) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

const DeleteFile = (path) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // Delete file
    fs.unlinkSync(path);
    recordLogEntry(
      "INFO",
      "writeDataConfigVideoToJsonFile",
      "Dữ liệu đã được xóa khỏi file."
    );
  }
};
