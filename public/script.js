const sendBtn = document.querySelector('.send');

sendBtn.addEventListener('click', async () => {
    let res;
    try {
        res = await axios.post('/api/v1/user/contact', {
            name: document.querySelector('input.name').value,
            email: document.querySelector('input.email').value,
            message: document.querySelector('textarea.message').value
        });

        if(res.status == 200) {
            Swal.fire({
                title: 'We have received your query',
                html: "Will Get back to you soon",
                icon: 'success',
                heightAuto: false
            });
        }
        else {
            throw new Error('Err');
        }
    }
    catch(err) {
        Swal.fire({
            title: 'Oops, looks like a mistake',
            html: 'Please fill all the fields',
            icon: 'error',
            heightAuto: false
        });
    }
})