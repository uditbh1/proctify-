let ans = [];
let cards = document.querySelector(".cards");
let quesContent = document.querySelector(".ques-content");
let options = document.querySelector(".options");
let nextBtn = document.querySelector(".next");
const quesElem = document.querySelector('#increment');
const cameraElem = document.querySelector('.camera video');
const cameraCanvas = document.querySelector('.camera canvas');
const mobileCameraElem = document.querySelector('.mobile-camera video');
const mobileCameraCanvas = document.querySelector('.mobile-camera canvas');
const submitBtn = document.querySelector('.submitBtn');
const ques = document.querySelector('.ques');
const examCode = document.querySelector('.examCode');
const timerElem = document.querySelector('.timer');

let noPersonCount = 0;
let detect = true;
let keyCount = 1, tabCount = 1;
let timer = 0;
let timerInterval;

let videoGlobal, canvasGlobal, modelGlobal;
let mobileVideoGlobal, mobileCanvasGlobal, mobileModelGlobal;

const detectionInterval = 500;

let lastDetectionTimeCamera = 0;
let lastDetectionTimeMobileCamera = 0;

let alertActive = false;

(() => {
  timer = Number(timerElem.innerText);
  formatTime(timer);
  timerInterval = setInterval(() => formatTime(timer), 1000);

  data = JSON.parse(ques.innerText);
  startStreaming();
  changeQuestion(0);

  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', handleKeyPress);

  ans = new Array(data.length + 1);
})();

function formatTime(ms) {
  const dateObj = new Date(ms);
  const hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();
  const seconds = dateObj.getSeconds();

  const timeString = hours.toString().padStart(2, '0') + ':' + 
    minutes.toString().padStart(2, '0') + ':' + 
    seconds.toString().padStart(2, '0');

  timerElem.innerText = timeString;
  timer -= 1000;

  if (timer <= 60000 && timer > 59000 && !alertActive) {
    alertActive = true;
    Swal.fire({
      title: 'Only 1 Minute Left',
      html: "Hurry Up !!!",
      icon: 'error',
      heightAuto: false
    }).then(() => {
      alertActive = false;
    });
  }

  if (timer <= 60000) {
    timerElem.style.color = 'red';
  }
  if (timer < 1000) {
    submitExam();
    clearInterval(timerInterval);
  }
}

async function startStreaming() {
  try {
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    const mobileCameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    videoGlobal = cameraElem;
    canvasGlobal = cameraCanvas;
    videoGlobal.srcObject = cameraStream;

    mobileVideoGlobal = mobileCameraElem;
    mobileCanvasGlobal = mobileCameraCanvas;
    mobileVideoGlobal.srcObject = mobileCameraStream;

    videoGlobal.onloadedmetadata = () => {
      videoGlobal.play();
      mobileVideoGlobal.onloadedmetadata = () => {
        mobileVideoGlobal.play();
        cocoSsd.load().then((loadedModel) => {
          modelGlobal = loadedModel;
          mobileModelGlobal = loadedModel;
          detectFrame(videoGlobal, canvasGlobal, modelGlobal, 'front');
          detectFrame(mobileVideoGlobal, mobileCanvasGlobal, mobileModelGlobal, 'mobile');
        });
      };
    };
  } catch (err) {
    await Swal.fire({
      title: 'Enable Camera',
      html: "Enable to continue the exam",
      icon: 'error',
      heightAuto: false
    });
    startStreaming();
  }
}

async function detectFrame(video, canvas, model, cameraType) {
  const currentTime = Date.now();

  if (cameraType === 'front' && currentTime - lastDetectionTimeCamera < detectionInterval) {
    requestAnimationFrame(() => detectFrame(video, canvas, model, cameraType));
    return;
  }

  if (cameraType === 'mobile' && currentTime - lastDetectionTimeMobileCamera < detectionInterval) {
    requestAnimationFrame(() => detectFrame(video, canvas, model, cameraType));
    return;
  }

  if (cameraType === 'front') {
    lastDetectionTimeCamera = currentTime;
  } else if (cameraType === 'mobile') {
    lastDetectionTimeMobileCamera = currentTime;
  }

  const predictions = await model.detect(video);
  const filteredPredictions = predictions.filter(prediction => prediction.score > 0.6);
  renderPredictions(filteredPredictions, canvas);

  requestAnimationFrame(() => detectFrame(video, canvas, model, cameraType));
}

function renderPredictions(predictions, canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = "18px sans-serif";
  ctx.textBaseline = "top";

  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];

    ctx.strokeStyle = "#333399";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "#333399";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt("16px sans-serif", 10);
    ctx.fillRect(x, y, textWidth + 8, textHeight + 8);
  });

  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    ctx.fillStyle = "#FFFFFF";
    if (["person", "cell phone", "book", "laptop"].includes(prediction.class)) {
      ctx.fillText(prediction.class, x, y);
    }
  });

  handleRestrictedItems(predictions);
}

function handleRestrictedItems(predictions) {
  const persons = predictions.filter(prediction => prediction.class === 'person');
  
  if (persons.length === 0 && noPersonCount < 50) {
    noPersonCount++;
  } else if (persons.length === 0 && !alertActive) {
    noPersonCount = 0;
    detect = false;
    alertActive = true;
    report({ faceNotVisible: true });
    Swal.fire({
      title: 'No Face Detected',
      html: 'This action has been recorded',
      icon: 'error',
      heightAuto: false
    }).then(() => {
      detect = true;
      alertActive = false;
      restartAllDetections();
    });
  }

  const restrictedItems = ['cell phone', 'book', 'laptop', 'Multiple faces'];
  let facesCount = 0;

  predictions.forEach(prediction => {
    if (prediction.class === 'person') facesCount++;
    if (facesCount > 1) prediction.class = 'Multiple faces';

    if (restrictedItems.includes(prediction.class) && !alertActive) {
      detect = false;
      alertActive = true;
      if (prediction.class === 'cell phone') {
        report({ mobileFound: true });
      } else if (prediction.class === 'Multiple faces') {
        report({ multipleFaceFound: true });
      } else {
        report({ prohibitedObjectFound: true });
      }
      Swal.fire({
        title: `${prediction.class} detected`,
        html: 'This action has been recorded',
        icon: 'error',
        heightAuto: false
      }).then(() => {
        detect = true;
        alertActive = false;
        restartAllDetections();
      });
    }
  });
}

function restartAllDetections() {
  detectFrame(videoGlobal, canvasGlobal, modelGlobal, 'front');
  detectFrame(mobileVideoGlobal, mobileCanvasGlobal, mobileModelGlobal, 'mobile');
}


function changeQuestion(selectIdx){
  if(selectIdx > data.length-1) return;

  const idx = quesElem.dataset.ques - 1;
  document.querySelectorAll('.app-card')[idx].classList.remove('clicked');
  document.querySelectorAll('.app-card')[selectIdx].classList.add('clicked');

  quesElem.innerText = `Question No. ${selectIdx+1}`;
  quesElem.setAttribute('data-ques', selectIdx+1);

  quesContent.innerText = data[selectIdx].ques;

  options.innerHTML = ``;
  data[selectIdx].options.forEach((optionText, idx) => options.innerHTML += `<div class="option" data-no='${idx+1}'>${optionText}</div>`);

  const quesNo = selectIdx+1;
  const optionNo = ans[quesNo];
  optionNo != null ? options.children[optionNo-1].classList.add('clicked') : undefined;
}

function handleOptionClick(quesNo, optionNo){
  const prevOptionNo = ans[quesNo];
  prevOptionNo != null ? options.children[prevOptionNo-1].classList.remove('clicked') : undefined;

  options.children[optionNo-1].classList.add('clicked');
  document.querySelector('.clicked').classList.add('selected');
  ans[quesNo] = optionNo;
}

function handleKeyPress(e){
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    report({keyPressCount : keyCount});
    keyCount++;
    Swal.fire({
      title: 'Modifier Key Pressed',
      html: "Action has been Recorded",
      icon: 'error',
      heightAuto: false
    });
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    report({tabSwitchCount : tabCount});
    tabCount++;
    Swal.fire({
      title: "Changed Tab Detected",
      html: "Action has been Recorded",
      icon: 'error',
      heightAuto: false
    });
  }
}


nextBtn.onclick = () => changeQuestion(quesElem.dataset.ques*1);
submitBtn.onclick = submitExam;

cards.onclick = function(e) {
  let target = e.target.closest('.app-card');
  if(!target) return;

  const selectIdx = target.dataset.ques - 1;
  changeQuestion(selectIdx);
}

options.onclick = function(e){
  let target = e.target.closest(".option");
  if(target==null) return;

  handleOptionClick(quesElem.dataset.ques*1, target.dataset.no*1);
}

async function submitExam (){
  const res = await axios.post('/api/v1/result', {
    examCode: examCode.innerText,
    ans: ans.slice(1)
  });

  if(res.status == 200){
    setTimeout(() => window.location.href='/dashboard', 2000);
    await Swal.fire({
      title: `Exam Submitted`,
      html: `You will be redirected to dashboard`,
      icon: 'success',
      heightAuto: false
    })
    window.location.href='/dashboard';
  }
  else{
    window.location.href='/dashboard';
  }
}

function report(data){
  axios.patch('/api/v1/status', {
    examCode: examCode.innerText,
    ...data
  }).then().catch((err) => {console.log(err)})
}