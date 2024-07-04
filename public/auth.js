const authHandler = async (url, data) => {
  try{
    const res = await axios({ url, method: 'POST', data, withCredentials: true });
    console.log('Login successful, redirecting to dashboard');
    if (res.status === 200) {
      console.log('Login successful, redirecting to dashboard');
      window.location.href = '/dashboard';
    }
    else {
      console.log('Login failed:', res);
    }
  }
  catch(err){
    console.log('Error:', err);
    // Send error to the server for logging
    axios.post('/log-error', { error: err.message });
    Swal.fire("Note",  err.response.data.message,  'error').then(() => {
    });
  }
}

document.forms[0].addEventListener('submit', async (e) => {
  e.preventDefault();
  if(e.target.dataset.route == 'signup'){
    authHandler(e.target.action, {
      name: document.querySelector('input[name="name"]').value,
      email: document.querySelector('input[name="email"]').value,
      password: document.querySelector('input[name="pass"]').value,
      confirmPassword: document.querySelector('input[name="cnfmPass"]').value,
      role: document.querySelector('input[name="role"]').checked ? 'teacher' : undefined
    });
  }
  else{
    authHandler(e.target.action, {
      email: document.querySelector('input[name="email"]').value,
      password: document.querySelector('input[name="pass"]').value
    });
  }
})

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
