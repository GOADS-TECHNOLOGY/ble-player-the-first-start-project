const recordLogEntry = require("./log.js");
const { spawn, exec } = require("child_process");

const bleno = require("./index");

const cron = require("node-cron");

// import os module
const os = require("os");
// get host name
const hostName = os.hostname();
const networkInterfaces = os.networkInterfaces();
let macAddress = null;
if (networkInterfaces.hasOwnProperty("eth0")) {
  macAddress = networkInterfaces["eth0"][0].mac;
} else if (networkInterfaces.hasOwnProperty("wlan0")) {
  macAddress = networkInterfaces["wlan0"][0].mac;
} else {
  macAddress = fffffffffffffffffffffffffffffff0;
}

const BlenoPrimaryService = bleno.PrimaryService;
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;

const fs = require("fs");
const pathToStoreVideoConfig =
  "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage/config.json";
const pathToStoreVideoLog =
  "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage/logVideo.json";
const pathToStoreVideo =
  "/home/pi3b/Projects/rpi-rgb-led-matrix/testing/testVideoImage";

const videoDurationTime = 15000;

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

  sendLogDataPlayVideoDisconnected() {
    const logDataOffline = readLogRunVideoOffline(pathToStoreVideoLog);

    if (this._updateValueCallback) {
      this._updateValueCallback(
        Buffer.from(JSON.stringify(logDataOffline), "utf-8")
      );

      recordLogEntry(
        "INFO",
        "runPlaylistVideoConnected",
        `Send log data play video when disconnected`
      );

      // DeleteFile(pathToStoreVideoLog);

      recordLogEntry(
        "INFO",
        "runPlaylistVideoConnected",
        `Delete log data play video when disconnected after send to app`
      );
    }
  }

  // runPlaylistVideo() {
  //   this.playVideo(pathToStoreVideoConfig);
  //   this.runIntervalVideo();
  // }

  runPlaylistVideoConnected() {
    this.clearPlaylistVideo();

    this.playVideoConnected(pathToStoreVideoConfig);

    this.playlistInterval = setInterval(() => {
      this.playVideoConnected(pathToStoreVideoConfig);
    }, videoDurationTime);
  }

  runPlaylistVideoDisconnected() {
    this.clearPlaylistVideo();

    this.playVideoDisconnected(pathToStoreVideoConfig);

    this.playlistInterval = setInterval(() => {
      this.playVideoDisconnected(pathToStoreVideoConfig);
    }, videoDurationTime);
  }

  // runIntervalVideo() {
  //   this.playlistInterval = setInterval(() => {
  //     this.playVideo(pathToStoreVideoConfig);
  //   }, videoDurationTime);
  // }

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

  // playVideo(path) {
  //   if (fs.existsSync(path)) {
  //     const rawData = fs.readFileSync(path);
  //     const videoList = JSON.parse(rawData) || [];
  //     if (videoList.length > 0) {
  //       if (this.previousQuantityVideo === videoList.length) {
  //         if (this.currentIndexVideoRunning > videoList.length - 1) {
  //           this.currentIndexVideoRunning = 0;
  //         }

  //         const videoIdWillPlay = videoList[this.currentIndexVideoRunning]?.ID;

  //         recordLogEntry(
  //           "INFO",
  //           "Play Video",
  //           `Index video: ${this.currentIndexVideoRunning} - ID: ${videoIdWillPlay}`
  //         );

  //         this.stopProcess();
  //         // this.clearPlaylistVideo();

  //         const logVideoById = getLogVideoById(
  //           pathToStoreVideoLog,
  //           videoIdWillPlay
  //         );

  //         if (logVideoById) {
  //           const playVideoWithLog = {
  //             ...logVideoById,
  //             label: {
  //               ...logVideoById.label,
  //               displayCount: Number(logVideoById?.label?.displayCount) + 1,
  //               viewCount:
  //                 Number(logVideoById?.label?.viewCount) +
  //                 Math.floor(Math.random() * 30),
  //             },
  //           };

  //           if (this._updateValueCallback) {
  //             this._updateValueCallback(
  //               Buffer.from(JSON.stringify(playVideoWithLog), "utf-8")
  //             );
  //             recordLogEntry(
  //               "INFO",
  //               "sendDataTracking",
  //               JSON.stringify(playVideoWithLog)
  //             );
  //           }

  //           writeLogRunVideoOffline(pathToStoreVideoLog, playVideoWithLog);
  //         } else {
  //           const playVideoWithoutLog = {
  //             ID: videoIdWillPlay,
  //             label: {
  //               person: 1,
  //               car: 3,
  //               motocycle: 4,
  //               timestamp: 131232132131,
  //               displayCount: 1,
  //               viewCount: Math.floor(Math.random() * 30),
  //             },
  //           };

  //           if (this._updateValueCallback) {
  //             this._updateValueCallback(
  //               Buffer.from(JSON.stringify(playVideoWithoutLog), "utf-8")
  //             );
  //             recordLogEntry(
  //               "INFO",
  //               "sendDataTracking",
  //               JSON.stringify(playVideoWithoutLog)
  //             );
  //           }

  //           writeLogRunVideoOffline(pathToStoreVideoLog, playVideoWithoutLog);
  //         }

  //         try {
  //           this.runCommandLine(videoIdWillPlay);
  //         } catch (err) {
  //           if (this._updateValueCallback) {
  //             this._updateValueCallback(
  //               Buffer.from(`Play video error: ${videoIdWillPlay}`, "utf-8")
  //             );
  //             recordLogEntry(
  //               "INFO",
  //               "playVideo",
  //               `Play video error: ${videoIdWillPlay}`
  //             );
  //           }
  //         }

  //         this.currentIndexVideoRunning = this.currentIndexVideoRunning + 1;
  //       } else {
  //         recordLogEntry(
  //           "INFO",
  //           "Play Video",
  //           `Index video: 0 - ID: ${videoList[0]?.ID}`
  //         );

  //         this.previousQuantityVideo = videoList.length;
  //         this.currentIndexVideoRunning = 1;
  //         // this.stopProcess();
  //         this.clearPlaylistVideo();

  //         const logVideoById = getLogVideoById(
  //           pathToStoreVideoLog,
  //           videoList[0]?.ID
  //         );

  //         if (logVideoById) {
  //           const playFirstVideoWithLog = {
  //             ID: videoList[0]?.ID,
  //             label: {
  //               ...logVideoById.label,
  //               displayCount: Number(logVideoById?.label?.displayCount) + 1,
  //               viewCount:
  //                 Number(logVideoById?.label?.viewCount) +
  //                 Math.floor(Math.random() * 30),
  //             },
  //           };
  //           if (this._updateValueCallback) {
  //             this._updateValueCallback(
  //               Buffer.from(JSON.stringify(playFirstVideoWithLog), "utf-8")
  //             );
  //             recordLogEntry(
  //               "INFO",
  //               "sendDataTracking",
  //               JSON.stringify(playFirstVideoWithLog)
  //             );
  //           }

  //           writeLogRunVideoOffline(pathToStoreVideoLog, playFirstVideoWithLog);
  //         } else {
  //           const playFirstVideoWithOutLog = {
  //             ID: videoList[0]?.ID,
  //             label: {
  //               person: 1,
  //               car: 3,
  //               motocycle: 4,
  //               timestamp: 131232132131,
  //               displayCount: 1,
  //               viewCount: Math.floor(Math.random() * 30),
  //             },
  //           };
  //           if (this._updateValueCallback) {
  //             this._updateValueCallback(
  //               Buffer.from(JSON.stringify(playFirstVideoWithOutLog), "utf-8")
  //             );
  //             recordLogEntry(
  //               "INFO",
  //               "sendDataTracking",
  //               JSON.stringify(playFirstVideoWithOutLog)
  //             );
  //           }
  //           writeLogRunVideoOffline(
  //             pathToStoreVideoLog,
  //             playFirstVideoWithOutLog
  //           );
  //         }

  //         this.runCommandLine(videoList[0]?.ID);
  //       }
  //     }
  //   } else {
  //     recordLogEntry("WARNING", "Write config file", `No config.json file`);
  //   }
  // }

  playVideoConnected(path) {
    if (fs.existsSync(path)) {
      const rawListVideoData = fs.readFileSync(path);
      const videoList = JSON.parse(rawListVideoData) || [];
      if (videoList.length > 0) {
        if (this.previousQuantityVideo === videoList.length) {
          if (this.currentIndexVideoRunning > videoList.length - 1) {
            this.currentIndexVideoRunning = 0;
          }

          this.stopProcess();

          let previousIdVideo = null;
          if (this.currentIndexVideoRunning > 0) {
            previousIdVideo = videoList[this.currentIndexVideoRunning - 1]?.ID;
          } else {
            previousIdVideo = videoList[videoList.length - 1]?.ID;
          }

          // current data colleted
          let dataPlayVideoCollected = {
            ID: previousIdVideo, // previous video
            label: {
              person: 1,
              car: 3,
              motocycle: 4,
              timestamp: 131232132131,
              displayCount: 1,
              viewCount: Math.floor(Math.random() * 30),
            },
          };

          const logVideoDisconnectedById = getLogVideoById(
            pathToStoreVideoLog,
            previousIdVideo
          );

          if (logVideoDisconnectedById) {
            // update data play video when disconnected incase has log by id
            dataPlayVideoCollected = {
              ...logVideoDisconnectedById,
              label: {
                ...logVideoDisconnectedById.label,
                displayCount:
                  Number(logVideoDisconnectedById?.label?.displayCount) + 1,
                viewCount:
                  Number(logVideoDisconnectedById?.label?.viewCount) +
                  Number(dataPlayVideoCollected?.label?.viewCount),
              },
            };
          }

          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(JSON.stringify(dataPlayVideoCollected), "utf-8")
            );

            recordLogEntry(
              "INFO",
              "sendDataTracking",
              JSON.stringify(dataPlayVideoCollected)
            );

            if (logVideoDisconnectedById) {
              DeleteLogVideoById(pathToStoreVideoLog, previousIdVideo);
            }
          } else {
            if (logVideoDisconnectedById) {
              writeLogRunVideoOffline(
                pathToStoreVideoLog,
                dataPlayVideoCollected
              );
            }
          }

          // this.clearPlaylistVideo()

          try {
            const videoIdWillPlay =
              videoList[this.currentIndexVideoRunning]?.ID;

            recordLogEntry(
              "INFO",
              "playVideoConnected",
              `Index video: ${this.currentIndexVideoRunning} - ID: ${videoIdWillPlay}`
            );

            this.runCommandLine(videoIdWillPlay);
          } catch (err) {
            if (this._updateValueCallback) {
              this._updateValueCallback(
                Buffer.from(`Play video error: ${videoIdWillPlay}`, "utf-8")
              );
              recordLogEntry(
                "INFO",
                "playVideoConnected",
                `Play video error: ${videoIdWillPlay}`
              );
            }
          }

          this.currentIndexVideoRunning = this.currentIndexVideoRunning + 1;
        } else {
          this.clearPlaylistVideo();

          recordLogEntry(
            "INFO",
            "playVideoConnected",
            `Index video: 0 - ID: ${videoList[0]?.ID}`
          );

          this.runCommandLine(videoList[0]?.ID);

          this.previousQuantityVideo = videoList.length;
          this.currentIndexVideoRunning = 1;
        }
      }
    } else {
      recordLogEntry("WARNING", "playVideoConnected", `No config.json file`);
    }
  }

  playVideoDisconnected(path) {
    if (fs.existsSync(path)) {
      const rawListVideoData = fs.readFileSync(path);
      const videoList = JSON.parse(rawListVideoData) || [];
      if (videoList.length > 0) {
        if (this.previousQuantityVideo === videoList.length) {
          if (this.currentIndexVideoRunning > videoList.length - 1) {
            this.currentIndexVideoRunning = 0;
          }

          this.stopProcess();

          let previousIdVideo = null;
          if (this.currentIndexVideoRunning > 0) {
            previousIdVideo = videoList[this.currentIndexVideoRunning - 1]?.ID;
          } else {
            previousIdVideo = videoList[videoList.length - 1]?.ID;
          }

          const logPreviousVideoById = getLogVideoById(
            pathToStoreVideoLog,
            previousIdVideo
          );

          if (logPreviousVideoById) {
            const playVideoWithLog = {
              ...logPreviousVideoById,
              label: {
                ...logPreviousVideoById.label,
                displayCount:
                  Number(logPreviousVideoById?.label?.displayCount) + 1,
                viewCount:
                  Number(logPreviousVideoById?.label?.viewCount) +
                  Math.floor(Math.random() * 30),
              },
            };

            writeLogRunVideoOffline(pathToStoreVideoLog, playVideoWithLog);
          } else {
            const playVideoWithoutLog = {
              ID: previousIdVideo,
              label: {
                person: 1,
                car: 3,
                motocycle: 4,
                timestamp: 131232132131,
                displayCount: 1,
                viewCount: Math.floor(Math.random() * 30),
              },
            };

            writeLogRunVideoOffline(pathToStoreVideoLog, playVideoWithoutLog);
          }

          try {
            const videoIdWillPlay =
              videoList[this.currentIndexVideoRunning]?.ID;

            recordLogEntry(
              "INFO",
              "playVideoDisconnected",
              `Index video: ${this.currentIndexVideoRunning} - ID: ${videoIdWillPlay}`
            );
            this.runCommandLine(videoIdWillPlay);
          } catch (err) {
            if (this._updateValueCallback) {
              this._updateValueCallback(
                Buffer.from(`Play video error: ${videoIdWillPlay}`, "utf-8")
              );
              recordLogEntry(
                "INFO",
                "playVideoDisconnected",
                `Play video error: ${videoIdWillPlay}`
              );
            }
          }

          this.currentIndexVideoRunning = this.currentIndexVideoRunning + 1;
        } else {
          this.clearPlaylistVideo();

          recordLogEntry(
            "INFO",
            "playVideoDisconnected",
            `Index video: 0 - ID: ${videoList[0]?.ID}`
          );

          this.runCommandLine(videoList[0]?.ID);

          this.previousQuantityVideo = videoList.length;
          this.currentIndexVideoRunning = 1;
        }
      }
    } else {
      recordLogEntry("WARNING", "playVideoDisconnected", `No config.json file`);
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
      "--led-pwm-lsb-nanoseconds=320",
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
      recordLogEntry("INFO", "stopProcess", `Process stopped`);
    }
  }

  clearPlaylistVideo() {
    this.stopProcess();
    this.stopIntervalPlayList();
  }
}

const intervalPlayVideo = new IntervalPlayVideo();

// // Define your task to be executed every minute
// const hourJob = () => {
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
// cron.schedule("0 * * * *", hourJob);

let scheduledTurnOffRasperryJob = null;
let lastKnownTime = new Date().toLocaleTimeString();
let intervalCheckCurrentTimeId = null;
// Define your task to be executed every day at 10:00 PM
const turnOffAt10PM = () => {
  const currentTime = new Date().toLocaleTimeString();
  recordLogEntry(
    "INFO",
    "SYSTEM-TURN-OFF",
    `This raspberry turn offs every day at 10:00 PM! Current time: ${currentTime}`
  );

  // spawn("sudo", ["shutdown ", "-h", "now"]);
  // Execute the shutdown command
  exec("sudo shutdown -h now", (error, stdout, stderr) => {
    if (error) {
      recordLogEntry("ERROR", "SYSTEM-TURN-OFF", `Error: ${error.message}`);
      return;
    }
  });

  // Add your job logic here
};

// Schedule the job to run every day at 10:00 PM
// scheduledTurnOffRasperryJob = cron.schedule("0 22 * * *", turnOffAt10PM);

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
      properties: ["write", "notify", "read"],
      // properties: ["writeWithoutResponse", "notify"],
    });
    this.writeCount = 0;
    this.completeData = Buffer.alloc(0);
    this.child = null;
    this.isReceivedData = false;
    this._updateValueCallback = null;
  }

  async onWriteRequest(data, offset, withoutResponse, callback) {
    this.isReceivedData = false;
    // console.log("Write request count: " + ++this.writeCount);

    try {
      const convertObj = JSON.parse(String(data.toString("utf-8")));

      if (Number(convertObj?.Code) === 100) {
        this.completeData = Buffer.alloc(0);
        this.writeCount = 0;
      }

      if (Number(convertObj?.Code) === 200) {
        const videoID = convertObj?.ID;

        if (!checkIdVideoExistInConfig(videoID, pathToStoreVideoConfig)) {
          const completeDataString = this.completeData.toString("base64");

          // recordLogEntry(
          //   "INFO",
          //   "Received Package Successfully",
          //   "Complete data received: " + completeDataString
          // );

          writeDataConfigVideoToJsonFile(pathToStoreVideoConfig, convertObj);

          this.decodeConvertToFile(completeDataString, videoID);

          if (this._updateValueCallback) {
            if (this.isReceivedData) {
              this.isReceivedData = false;
            } else {
              this._updateValueCallback(Buffer.from(`${200}`, "utf-8"));
              recordLogEntry("INFO", "BLE", "Received video");
              this.isReceivedData = true;
            }
          }

          this.completeData = Buffer.alloc(0);
          this.writeCount = 0;

          intervalPlayVideo.setIndexPlayVideo(0);
          intervalPlayVideo.clearPlaylistVideo();
          intervalPlayVideo.runPlaylistVideo();

          callback(this.RESULT_SUCCESS);
        }
      }

      if (convertObj?.action === "delete") {
        try {
          DeleteVideoById(pathToStoreVideo, convertObj?.ID);
          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(
                JSON.stringify({
                  status: 200,
                  message: "Delete video successfully",
                }),
                "utf-8"
              )
            );
            recordLogEntry(
              "INFO",
              "BLE",
              `Delete video successfully: ${convertObj?.ID}`
            );
          }
        } catch (err) {
          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(
                JSON.stringify({
                  status: 404,
                  message: "Delete video failed",
                  error: err,
                }),
                "utf-8"
              )
            );
            recordLogEntry(
              "INFO",
              "BLE",
              `Delete video failed: ${convertObj?.ID}`
            );
          }
        }
      }

      if (convertObj?.action === "setTimeZone") {
        try {
          setSystemTime(convertObj?.timestamp);

          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(
                JSON.stringify({
                  status: 200,
                  message: "Set time zone successfully",
                }),
                "utf-8"
              )
            );
          }
          recordLogEntry(
            "INFO",
            "BLE",
            `Set time successfully: ${convertObj?.timestamp}`
          );
          // clear previous job and start new job with new time
          handleTurnOffSystemAfterUpdateTime();
        } catch (err) {
          if (this._updateValueCallback) {
            this._updateValueCallback(
              Buffer.from(
                JSON.stringify({
                  status: 404,
                  message: "Set time zone failed",
                  error: err,
                }),
                "utf-8"
              )
            );
            recordLogEntry(
              "INFO",
              "BLE",
              `Set time zone failed: ${err}-${convertObj?.timestamp}`
            );
          }
        }
      }
    } catch (error) {
      this.completeData = Buffer.concat([this.completeData, data]);
      if (this._updateValueCallback) {
        this._updateValueCallback(Buffer.from(`${null}`, "utf-8"));
      }
    }

    // PlayListVideo
    if (data.toString("base64") === "UGxheUxpc3RWaWRlbw==") {
      intervalPlayVideo.setIndexPlayVideo(0);
      intervalPlayVideo.clearPlaylistVideo();
      intervalPlayVideo.runPlaylistVideo();
    }

    // DeleteConfig
    if (data.toString("base64") === "RGVsZXRlQ29uZmln") {
      DeleteFile(pathToStoreVideoConfig);
      if (this._updateValueCallback) {
        this._updateValueCallback(Buffer.from(`${null}`, "utf-8"));
      }
      callback(this.RESULT_CONTINUE);
    }

    callback(this.RESULT_CONTINUE);
  }

  onReadRequest(offset, callback) {
    let data = null;
    // Check file exist
    if (fs.existsSync(pathToStoreVideoConfig)) {
      // If exit, read data from the file
      const rawData = fs.readFileSync(pathToStoreVideoConfig);
      data = JSON.parse(rawData);
    }
    callback(this.RESULT_SUCCESS, Buffer.from(JSON.stringify(data), "utf-8"));
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

      if (this._updateValueCallback) {
        this._updateValueCallback(Buffer.from(`${100}`, "utf-8"));
      }
    }
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    this._updateValueCallback = updateValueCallback;
    intervalPlayVideo.setSendNotify(updateValueCallback);
    // intervalPlayVideo.sendLogDataPlayVideoDisconnected();
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
      uuid: macAddress,
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
    bleno.startAdvertising(hostName, [macAddress]);
    intervalPlayVideo.runPlaylistVideoDisconnected();
  } else {
    bleno.stopAdvertising();
  }
});

// Linux only events /////////////////
bleno.on("accept", function (clientAddress) {
  recordLogEntry("INFO", "BLE", "on -> accept, client: " + clientAddress);
  bleno.updateRssi();
  intervalPlayVideo.runPlaylistVideoConnected();
});

bleno.on("disconnect", function (clientAddress) {
  recordLogEntry("INFO", "BLE", "on -> disconnect, client: " + clientAddress);
  intervalPlayVideo.runPlaylistVideoDisconnected();
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

const writeLogRunVideoOffline = (path, newLog) => {
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
      "writeLogRunVideoOffline",
      "File log đã được cập nhật"
    );
  } else {
    // If file is not exist, create and add data to it
    fs.writeFileSync(path, JSON.stringify([newLog]));

    recordLogEntry(
      "INFO",
      "writeLogRunVideoOffline",
      "File log mới đã được tạo và thêm dữ liệu"
    );
  }
};

const readLogRunVideoOffline = (path) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);

    const currentData = JSON.parse(rawData) || [];
    return currentData;
  } else {
    return undefined;
  }
};

const getLogVideoById = (path, id) => {
  // Check file exist
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);

    const currentData = JSON.parse(rawData) || [];

    const logVideoById = currentData.find((element) => element.ID === id);

    return logVideoById;
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
    recordLogEntry("INFO", "DeleteFile", "File đã được xóa.");
  }
};

const DeleteVideoById = (path, id) => {
  const pathToVideo = `${path}/${id}.mp4`;
  // Check file exist
  if (fs.existsSync(pathToVideo)) {
    // Delete file
    fs.unlinkSync(pathToVideo);
    recordLogEntry("INFO", "DeleteVideoById", "Video đã được xóa.");
  }

  if (fs.existsSync(pathToStoreVideoConfig)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(pathToStoreVideoConfig);
    const configVideoData = JSON.parse(rawData);
    const newConfigVideoData = configVideoData.filter(
      (video) => video.ID !== id
    );

    // Write new data to the file
    fs.writeFileSync(
      pathToStoreVideoConfig,
      JSON.stringify(newConfigVideoData)
    );

    recordLogEntry(
      "INFO",
      "DeleteVideoById",
      "Danh sách cấu hình video đã được cập nhật."
    );
  }
};

const DeleteLogVideoById = (path, id) => {
  if (fs.existsSync(path)) {
    // If exit, read data from the file
    const rawData = fs.readFileSync(path);
    const configVideoData = JSON.parse(rawData);
    const newConfigVideoData = configVideoData.filter(
      (video) => video.ID !== id
    );

    // Write new data to the file
    fs.writeFileSync(path, JSON.stringify(newConfigVideoData));

    recordLogEntry("INFO", "DeleteLogVideoById", `Đã xóa log của video ${id}.`);
  }
};

const setSystemTime = async (time) => {
  const command = "sudo";
  // Spawn the process

  if (time) {
    await runCommand(command, ["timedatectl", "set-ntp", "0"]);
    await runCommand(command, [
      "timedatectl",
      "set-timezone",
      "Asia/Ho_Chi_Minh",
    ]);

    await runCommand(command, ["date", "+%s", "-s", `@${time}`]);
  }
};

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);

    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
}

const handleTurnOffSystemAfterUpdateTime = () => {
  // Check for time changes every minute
  intervalCheckCurrentTimeId = setInterval(() => {
    const currentHour = new Date().getHours();
    const currentTime = new Date().toLocaleTimeString();

    if (currentTime !== lastKnownTime) {
      // Time has changed, destroy the existing job and reschedule it at 10:00 PM
      lastKnownTime = currentTime;

      // stop previous run new job
      if (scheduledTurnOffRasperryJob) {
        scheduledTurnOffRasperryJob.stop();

        scheduledTurnOffRasperryJob = cron.schedule(
          "0 22 * * *",
          turnOffAt10PM
        );
        recordLogEntry(
          "INFO",
          "SYSTEM-TURN-OFF",
          `Run turn off job again at: ${currentTime}`
        );
        clearInterval(intervalCheckCurrentTimeId);
      }
    }

    // // Check if the current time is between 10:00 PM and 6:00 AM
    // if (currentHour >= 22 || currentHour < 6) {
    //   recordLogEntry(
    //     "INFO",
    //     "SYSTEM-TURN-OFF",
    //     `Current time is between 10:00 PM and 6:00 AM - Turn off job again at: ${currentTime}`
    //   );

    //   exec("sudo shutdown -h now", (error, stdout, stderr) => {
    //     if (error) {
    //       recordLogEntry("ERROR", "SYSTEM-TURN-OFF", `Error: ${error.message}`);
    //       return;
    //     }
    //   });
    // }
  }, 5000); // Check every 5 second for time changes
};
