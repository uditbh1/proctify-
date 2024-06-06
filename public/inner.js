let ans = [];

// ********************
// **** Selectors *****
// ********************

let cards = document.querySelector(".cards");
let quesContent = document.querySelector(".ques-content");
let options = document.querySelector(".options");
let nextBtn = document.querySelector(".next");
const quesElem = document.querySelector('#increment');
const cameraElem = document.querySelector('video');
const submitBtn = document.querySelector('.submitBtn');
const ques = document.querySelector('.ques');
const examCode = document.querySelector('.examCode');
const timerElem = document.querySelector('.timer');

let noPersonCount = 0;
let detect = true;
let keyCount = 1, tabCount = 1;
let timer = 0;
let timerInterval;

(() => {
  timer = Number(timerElem.innerText);
  formatTime(timer);
  timerInterval = setInterval(() => formatTime(timer), 1000);

  data = JSON.parse(ques.innerText);
  startStreaming();
  changeQuestion(0);

  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown',handleKeyPress);

  ans = new Array(data.length+1);
})();

function formatTime(ms){
  dateObj = new Date(ms);
  hours = dateObj.getUTCHours();
  minutes = dateObj.getUTCMinutes();
  seconds = dateObj.getSeconds();

  timeString = hours.toString().padStart(2, '0') + ':' + 
  minutes.toString().padStart(2, '0') + ':' + 
  seconds.toString().padStart(2, '0');

  timerElem.innerText = timeString;
  timer -= 1000;

  if (timer <= 60000 && timer > 59000) {
    Swal.fire({
      title: 'Only 1 Minute Left',
      html: "Hurry Up !!!",
      icon: 'error',
      heightAuto: false
    });
  }
  if( timer <= 60000){
    timerElem.style.color = 'red';
  }
  if( timer < 1000){
    submitExam();
    clearInterval(timerInterval);
  }
}

// Functions
let model;
async function startStreaming(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({
        video : true,
        audio: false
    });
    cameraElem.srcObject = stream;

    model = await cocoSsd.load();
    detectFrame(cameraElem, model); 
  }
  catch(err){
    await Swal.fire({
      title: 'Enable Camera',
      html: "Enable to continue the exam",
      icon: 'error',
      heightAuto: false
    });
    startStreaming();
  }
}

async function detectFrame(video=cameraElem, model){
// console.log('Detecting frame');
const predictions = await model.detect(video);
// console.log(predictions);
renderPredictions(predictions);

if(detect){
  requestAnimationFrame(() => {
    detectFrame(video, model);
  });
}
}

function renderPredictions(predictions){
// setting up the canvas for drawing rectangles and printing 
// prediction text
const ctx = document.querySelector('canvas').getContext("2d");
ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
ctx.font = "18px sans-serif";
ctx.textBaseline = "top";

// looping on predictions and drawing the bounding box for each object
// and the text label background
predictions.forEach(prediction => {
  const x = prediction.bbox[0];
  const y = prediction.bbox[1];
  const width = prediction.bbox[2];
  const height = prediction.bbox[3];

  // Draw the bounding circle.
  ctx.strokeStyle = "#333399";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Draw the label background.
  ctx.fillStyle = "#333399";
  const textWidth = ctx.measureText(prediction.class).width;
  const textHeight = parseInt("16px sans-serif", 10); // base 10
  ctx.fillRect(x, y, textWidth + 8, textHeight + 8);
});

 // Looping over all predictions and drawing text (prediction class)
 predictions.forEach(prediction => {
  const x = prediction.bbox[0];
  const y = prediction.bbox[1];
  
  ctx.fillStyle = "#FFFFFF";

  // Draw the text last to ensure it's on top.
  if (prediction.class === "person" || prediction.class === "cell phone" || prediction.class === "book" || prediction.class === "laptop") {
    ctx.fillText(prediction.class, x, y);
  }
});

// if face is not visible till 50 consecutive frames, face is missing, throw an error
const persons = predictions.filter(prediction => prediction.class == 'person');
if (persons.length === 0 && noPersonCount < 50){
  noPersonCount++;
}
else if (persons.length === 0) {
  noPersonCount = 0;
  detect = false;
  report({faceNotVisible: true});
  Swal.fire({
    title: `No face Detected`,
    html: `This action has been recorded`,
    icon: 'error',
    heightAuto: false
  }).then(() => {
    detect = true;
    detectFrame(cameraElem, model);
  });
}

// loop over all predictions and check if restricted items are present
const restrictedItems = ['cell phone', 'book', 'laptop', 'Multiple faces'];

let faces = 0;
predictions.forEach(prediction => {
  if(prediction.class == 'person') faces++;
  if(faces > 1) prediction.class = 'Multiple faces';

  if(restrictedItems.includes(prediction.class)){
    const item = restrictedItems.find(item => item == prediction.class);

    detect = false;
    if(item == 'cell phone') report({mobileFound: true});
    else if(item == 'Multiple faces') report({multipleFaceFound: true});
    else report({prohibitedObjectFound: true});
    Swal.fire({
      title: `${item} Detected`,
      html: `This action has been recorded`,
      icon: 'error',
      heightAuto: false
    }).then(() => {
      detect = true;
      detectFrame(cameraElem, model);
    });
  }
})
};

// ********************
// **** Event Callback Functions *****
// ********************

function changeQuestion(selectIdx){
  if(selectIdx > data.length-1) return;

  // Removing and adding clicked class
  const idx = quesElem.dataset.ques - 1;
  document.querySelectorAll('.app-card')[idx].classList.remove('clicked');
  document.querySelectorAll('.app-card')[selectIdx].classList.add('clicked');

  // Question No. Update
  quesElem.innerText = `Question No. ${selectIdx+1}`;
  quesElem.setAttribute('data-ques', selectIdx+1);

  // Question Update
  quesContent.innerText = data[selectIdx].ques;

  // Options Update
  options.innerHTML = ``;
  data[selectIdx].options.forEach((optionText, idx) => options.innerHTML += `<div class="option" data-no='${idx+1}'>${optionText}</div>`);

  // Select option if answered
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

// ********************
// **** EVENTS *****
// ********************

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

