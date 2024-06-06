const inputs = document.querySelectorAll(".input");

function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}

inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});

document.forms[0].addEventListener('submit', async (e) => {
  e.preventDefault();

  try{
    const res = await axios({
      url: '/api/v1/user/signup',
      method: 'POST',
      data: {
        name: document.querySelector('input[name="name"]').value,
        email: document.querySelector('input[name="email"]').value,
        password: document.querySelector('input[name="pass"]').value,
        confirmPassword: document.querySelector('input[name="cnfmPass"]').value,
        role: document.querySelector('input[name="role"]').checked ? 'teacher' : undefined
      }
    });
  
    if(res.status === 200){
      window.location.href = '/dashboard';
    }
  }
  catch(err){
    console.log(err);
    
    Swal.fire("Note",  err.response.data.message,  'error').then(() => {
      detect = true;
      detectFrame(cameraElem, model);
    });
  }
})