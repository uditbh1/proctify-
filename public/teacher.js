const ongoingTest = document.querySelector('.ongoingTest');
const pastTest = document.querySelector('.pastTest');
const futureTest = document.querySelector('.futureTest');
const statusElem = document.querySelector('tbody');
const logoutBtn = document.querySelector('div.logout');
const logoutBtn2 = document.querySelector('button.logout');
const createBtn = document.querySelector('.createBtn');
const students = document.querySelector('table');

(async function init(){
  const res = await axios.get('/api/v1/exam');
  const exams = res.data.data;

  exams.forEach(function(exam, i){
    let currTime = new Date().getTime();
    let examStartTime = new Date(exam.startTime).getTime();
    let examEndTime = new Date(exam.endTime).getTime();
    const htmlElem = `<div class="tests">${exam.examCode}</div>`;

    if(currTime > examEndTime) pastTest.innerHTML += htmlElem;
    else if(currTime >= examStartTime && currTime < examEndTime) ongoingTest.innerHTML += htmlElem;
    else futureTest.innerHTML += htmlElem;
  });
  document.querySelector('.tests').classList.add('test-selected');
  document.querySelector('.tests')?.click();
})();

logoutBtn.addEventListener('click', async (e) => {
  let target = e.target.closest('.logout');
  if(!target) return;
  await axios.post(`/api/v1/user/logout`);
  window.location.href = '/login';
});

logoutBtn2.addEventListener('click', async (e) => {
  let target = e.target.closest('.logout');
  if(!target) return;
  await axios.post(`/api/v1/user/logout`);
  window.location.href = '/login';
});

document.querySelector('.left-side').addEventListener('click', async (e) => {
  let target = e.target.closest('.tests');
  if(!target) return;

  document.querySelector('.test-selected').classList.remove('test-selected');
  target.classList.add('test-selected');

  // Get Status of exam
  let examCode = target.innerText;
  try{
    const res = await axios.get(`/api/v1/status/exam/${examCode}`);
    const statusArr = res.data.data;

    // Fill the table with recieved data
    statusElem.innerHTML = '';
    statusArr.forEach((status, i) => {
      statusElem.innerHTML += `<tr data-email=${status.studentEmail} data-examCode=${examCode}>
          <td>${i+1}</td>
          <td>${status.studentName}</td>
          <td>${status.studentEmail}</td>
          <td>${status.tabSwitchCount}</td>
          <td>${status.faceNotVisible}</td>
          <td>${status.multipleFaceFound}</td>
          <td>${status.mobileFound}</td>
          <td>${status.prohibitedObjectFound}</td>
      </tr>`;
    });

    popupMsg('Students table updated', 'success');
  }
  catch(err){
    statusElem.innerHTML = '';
    popupMsg('No result yet', 'success');
  }
});

students.addEventListener('click', async (e) => {
  let target = e.target.closest('tr');

  const {email, examcode} = target.dataset;
  const result = (await axios.get(`/api/v1/result/${examcode}?email=${email}`)).data?.data;
  if(!result) return;

  const {obtainedMarks, totalMarks} = result;
  Swal.fire({
    title: `${email}`,
    html: `<h1>${obtainedMarks} / ${totalMarks}<h1>`,
    icon: 'success',
    heightAuto: false
  });
})

createBtn.addEventListener('click', async (e) => {

  const { value: file } = await Swal.fire({
    title: '<strong>Upload your file</strong>',
    input: 'file',
    inputLabel: 'File must be in CSV format',
    heightAuto: false
  })
  
  if(file) {
    var reader = new FileReader();
    reader.onload = async () => {
      const data = await csv().fromString(reader.result);
      const quesData = buildQuesData(data);
      Swal.fire({
        heightAuto: false,
        title: '<b>File Uploaded Successfully</b>',
        html: `Questions : ${data.length}<br>
        <h3>Start Time </h3><input id="startTime" class="swal2-input" type="datetime-local">
        <h3>End Time </h3><input id="endTime" class="swal2-input" type="datetime-local">`,
        showCancelButton: true,
        confirmButtonText: 'Create Exam',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          let startTime = document.getElementById('startTime').value;
          let endTime = document.getElementById('endTime').value;
          if(new Date(startTime) >= new Date(endTime)) return Swal.showValidationMessage(`Start time should be less than End time`)
          return axios.post(`/api/v1/exam`, {
              startTime: new Date(document.getElementById('startTime').value).toISOString(),
              endTime: new Date(document.getElementById('endTime').value).toISOString(),
              questions : quesData
            })
            .then(res => {
              if (res.status != 200) {
                throw new Error(res.data.message)
              }
              return res.data;
            })
            .catch(error => {
              Swal.showValidationMessage(
                `Request failed: ${error}`
              )
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(result.value)
          Swal.fire({
            title: `Exam Created Successfully`,
            html: `<b>Exam Code : </b> ${result.value.data.examCode}`,
            icon: 'success',
            heightAuto: false
          })
        }
      })
    };
    reader.readAsText(file);
  }
})

function buildQuesData(data){
  const ans = [];
  data.forEach(ques => {
    const options = [
      ques['Option A'],
      ques['Option B'],
      ques['Option C'],
      ques['Option D']
    ].filter(elem => elem);

    ans.push({
      ques: ques['Question'],
      options,
      correctOption: ques['Correct Option']
    });
  })

  return ans;
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

function popupMsg(msg, status){
  Toast.fire({
    icon: status,
    title: msg
  })  
}
