const logoutBtn = document.querySelector('.main-header .logout');
const logoutBtn2 = document.querySelector('.logout');
const joinBtn = document.querySelector('.joinBtn');
const exams = document.querySelector('.apps-card');

logoutBtn.addEventListener('click', async (e) => {
  await axios.post(`/api/v1/user/logout`);
  window.location.href = '/login';
});

logoutBtn2.addEventListener('click', async (e) => {
  await axios.post(`/api/v1/user/logout`);
  window.location.href = '/login';
});

joinBtn.addEventListener('click', async () => {
  const { value: examCode } = await Swal.fire({
    title: 'Enter Exam Code',
    input: 'text',
    inputLabel: 'Exam Code',
    showCancelButton: true,
    heightAuto: false,
    inputValidator: (value) => {
      if (!value || value.length != 5) {
        return 'Please enter valid exam code'
      }
    }
  });

  if (examCode) {
    try {
      const res = await axios.post(`/api/v1/status`, { examCode });
      if (res.status === 200) {
        let windowurl = window.location.href;

        // Remove 'dashboard' from the URL
        windowurl = windowurl.replace('dashboard', '');

        // Construct the new URL
        const qrCodeData = windowurl + 'mobilecam/exam/' + examCode;
        console.log(window.location.href)
        console.log(qrCodeData)

        Swal.fire({
          title: 'Scan the QR Code',
          html: `<div id="qrCode" style="display: flex; justify-content: center; margin-top: 20px;"></div>`,
          heightAuto: false,
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: 'OK',
          didRender: () => {
            new QRCode(document.getElementById("qrCode"), {
              text: qrCodeData,
              width: 128,
              height: 128,
            });
          }
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/exam/' + examCode;
          }
        });
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          window.location.href = '/exam/' + examCode;
        } else if (err.response.status === 404) {
          popupMsg(err.response.data.message, 'error');
        }
      } else {
        console.log(err);
      }
    }
  }
});

exams.addEventListener('click', async (e) => {
  let target = e.target.closest('.result-button');
  if (!target) return;

  const { examcode } = target.dataset;
  const result = (await axios.get(`/api/v1/result/${examcode}`)).data?.data;
  if (!result) return;

  const { obtainedMarks, totalMarks } = result;
  Swal.fire({
    title: `Here is your Result`,
    html: `<h1>${obtainedMarks} / ${totalMarks}<h1>`,
    icon: 'success',
    heightAuto: false
  });
});

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

function popupMsg(msg, status) {
  Toast.fire({
    icon: status,
    title: msg
  });
}
