import API from './api.js';
const api = new API('http://localhost:5000');

document.getElementById('register').addEventListener("click", registerForm)
document.getElementById('login').addEventListener("click", login)
window.addEventListener("load", load_login)
document.getElementById('error_jpg').addEventListener("click", closeError)

let at_end = false;
let current_page = 0;

let myProfile = document.getElementsByClassName('nav-item')[0]
myProfile.addEventListener('click', userInfo.bind(null,"", true))

window.onscroll = function(ev)
{
    if (!at_end && (window.innerHeight + window.scrollY) >= document.body.scrollHeight)
    {
        fetchPost(current_page,5)
    }
};
function load_login()
{
    cleanLoad()
    let url = 'http://localhost:5000/user/';
    const response = fetch(url, {
        method: "GET",
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('loginToken')
        },
        body: JSON.stringify(login)
    }).then(r => {
        if(r.status == 200)
        {
            successLogin();
        }
        else
        {
            notLogin();
        }
    }).catch((error) => {
        notLogin();
    });
}
function notLogin()
{
    let box = document.getElementsByClassName('login_box')
    for (let i = 0; i < box.length; i++)
    {
        box[i].style.display = 'flex';
    }
}
function cleanLoad()
{
    let load = document.getElementsByClassName('loading')
    for (let i = 0; i < load.length; i++)
    {
        load[i].style.display = 'none';
    }
}

function registerForm()
{
    document.getElementById("login_form").reset();
    document.getElementById('login').value = "Cancel Register"
    document.getElementById('login').removeEventListener("click", login)
    document.getElementById('login').addEventListener("click", cancelRegister)
    document.getElementById('register').value = "Register Now"
    document.getElementById('register').removeEventListener("click", registerForm)
    document.getElementById('register').addEventListener("click", register)
    let regForm = document.getElementsByClassName('reg')
    for(let i=0; i<regForm.length; i++) {
        regForm[i].style.display = 'flex'
    }
    let button = document.getElementsByClassName('button1')[0]
    button.style.background = 'coral'
    button.style.color = 'white'
}

function cancelRegister()
{
    document.getElementById("login_form").reset();
    document.getElementById('login').value = "Login"
    document.getElementById('login').removeEventListener("click", cancelRegister)
    document.getElementById('login').addEventListener("click", login)
    document.getElementById('register').value = "New User? Register!"
    document.getElementById('register').removeEventListener("click", register)
    document.getElementById('register').addEventListener("click", registerForm)
    let regForm = document.getElementsByClassName('reg')
    for(let i=0; i<regForm.length; i++) {
        regForm[i].style.display = 'none';
        let button = document.getElementsByClassName('button1')[0]
        button.style.background = 'aquamarine'
        button.style.color = 'black'
    }
}

function login()
{
    closeError();
    let user = document.getElementById('username').value
    let pw = document.getElementById('password').value
    let pc = document.getElementById('passconf').value
    if(document.getElementById('username').value && document.getElementById('password').value)
    {
        if(pc != pw)
        {
            showError("Password do not match! Please double check");
            document.getElementById('password').value = ""
            document.getElementById('passconf').value = ""
        }
        else
        {
            const login = {
                "username":user,
                "password":pw,
            };
            let url = 'http://localhost:5000/auth/login';
            const response = fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'Application/json',
                    'Content-type': 'Application/json'
                },
                body: JSON.stringify(login)
            }).then(r =>{
                if(r.status === 403)
                {
                    showError("Wrong username or password! If you forget it, reset")
                    document.getElementById('password').value = ""
                    document.getElementById('passconf').value = ""
                }
                else if(r.status === 200)
                {
                    r.json().then(r => {
                        write_token(r['token']);
                        successLogin()
                    });
                }
                else
                {
                    showError("Unknown error:" + r.status)
                }
            }).catch((err) =>{
                showError("Unknown error: " + err + "\nPlease check if you have connected to the internet")
            });
        }
    }
    else
    {
        showError("Please enter both username and password!")
    }

}

function write_token(token)
{
    let store = window.localStorage;
    let local_token = token;
    store.setItem('loginToken', local_token)

}

function register()
{
    closeError();
    let user = document.getElementById('username').value
    let pw = document.getElementById('password').value
    let pc = document.getElementById('passconf').value
    if(document.getElementById('username').value && document.getElementById('password').value)
    {
        if(pc != pw)
        {
            showError("Password do not match! Please double check")
            document.getElementById('password').value = ""
            document.getElementById('passconf').value = ""
        }
        else
        {
            if(document.getElementById("name").value && document.getElementById("mail").value)
            {
                let name = document.getElementById("name").value
                let email = document.getElementById("mail").value
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(re.test(String(email).toLowerCase()))
                {
                    let reg = {
                        "username": user,
                        "password": pw,
                        "email": email,
                        "name": name
                    }
                    let url = 'http://localhost:5000/auth/signup';
                    const response = fetch(url, {
                        method: "POST",
                        headers: {
                            'Accept': 'Application/json',
                            'Content-type': 'Application/json'
                        },
                        body: JSON.stringify(reg)
                    }).then(r =>{
                        if(r.status === 200)
                        {
                            r.json().then(r => {
                                write_token(r['token']);
                                cancelRegister()
                                successLogin()
                            });
                        }
                        else if(r.status === 409)
                        {
                            showError("Your username has been registered by someone else!")
                            document.getElementById('username').value = ""
                            document.getElementById('password').value = ""
                            document.getElementById('passconf').value = ""
                            document.getElementById('name').value = ""
                            document.getElementById('mail').value = ""
                        }
                        else
                        {
                            showError("Unknown error:" + r.status)
                        }
                    }).catch((err) =>{
                        showError("Unknown error: " + err + "\nPlease check if you have connected to the internet")
                    });
                }
                else
                {
                    showError("Please enter a valid email address!")
                    document.getElementById('mail').value = ""
                }
            }
            else
            {
                showError("Please enter your name and email!")
                document.getElementById('name').value = ""
                document.getElementById('mail').value = ""
            }
        }
    }
    else
    {
        showError("Please enter both username and password!")
    }
}
function showError(s)
{
    let error = document.createElement('div');
    let node = document.getElementById("popup");
    error.setAttribute("id", 'error_msg');
    let text = document.createTextNode(s)
    error.appendChild(text)
    node.style.display = 'flex';
    node.appendChild(error)
}
function closeError()
{
    let node = document.getElementById("popup");
    let element = document.getElementById('error_msg')
    if(typeof(element) != 'undefined' && element != null)
    {
        node.removeChild(element)
    }
    node.style.display = 'none';
}
function successLogin()
{
    let loginBox = document.getElementsByClassName('login_box')
    for(let i=0; i<loginBox.length; i++)
    {
        loginBox[i].style.display = 'none';
    }
    document.getElementById('posts').style.display = 'flex';
    let top = document.getElementById('user_info')
    top.style.display = 'flex';
    let url = 'http://localhost:5000/user/';
    fetch(url, {
        method: "GET",
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('loginToken')
        },
        body: JSON.stringify(login)
    }).then(r => {
        r.json().then(r => {
            let displayName = r['name']
            top.innerText = "Welcome, " + displayName + "!"
        })
    })
    let nav = document.getElementsByClassName('nav')[0]
    let exit = document.createElement('li');
    exit.setAttribute('id', 'logout')
    exit.addEventListener("click", logout)
    exit.innerText = "Logout"
    nav.appendChild(exit)
    fetchPost(0, 5)
}
function logout()
{
    localStorage.clear()
    location.reload()
}
function likePost(postId)
{
    let url = 'http://localhost:5000/post/like?id=' + postId
    const r = fetch(url, {
        method: "PUT",
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('loginToken')
        },
    }).then(() =>
        {
            location.reload()
        }
    )
}
const info = document.getElementById("info");
const close = document.getElementsByClassName("close")[0];
const win = document.getElementById("info-content")
function userInfo(uid, isSelf)
{
    let url = ""
    if(!isSelf)
    {
        url = 'http://localhost:5000/user?username=' + uid
    }
    else
    {
        url = 'http://localhost:5000/user'
    }
    const r = fetch(url,{
        method: "GET",
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('loginToken')
        },
    }).then(r => {
        r.json().then(s => {
            info.style.display = 'flex'
            const infos = document.createElement('span')
            infos.setAttribute('class', 'infos')
            win.appendChild(infos)

            const user = document.createElement('div')
            user.setAttribute('class', 'post_user')
            user.innerText = s.username
            infos.appendChild(user)

            const nam = document.createElement('div')
            nam.setAttribute('class', 'infor')
            nam.innerText = "Name\n" + s.name
            infos.appendChild(nam)

            const email = document.createElement('div')
            email.setAttribute('class', 'infor')
            email.innerText = "Email\n" + s.email
            infos.appendChild(email)

            const follower = document.createElement('div')
            follower.setAttribute('class', 'infor')
            follower.innerText = "Follower\n"+ s.followed_num
            infos.appendChild(follower)

            const following = document.createElement('div')
            following.setAttribute('class', 'infor')
            if(!isSelf)
            {
                following.innerText = "Following\n"+ s.following.length
            }
            else
            {
                following.innerText = "Following\n"+ s.following.length
            }
            infos.appendChild(following)
            if(!isSelf)

            {
                const follow = document.createElement('div')
                follow.setAttribute('class', 'follow')
                follow.innerText = "Follow"
                follow.addEventListener("click", fll.bind(null, s.name))
                infos.appendChild(follow)
            }
            const ps = s.posts

            ps.map(pst => {
                let url = 'http://localhost:5000/post?id=' + pst
                fetch(url,{
                    method: "GET",
                    headers: {
                        'Authorization': 'Token ' + localStorage.getItem('loginToken')
                    },
                }).then(s => {
                    s.json().then(t => {
                        let postbox = win
                        const post = document.createElement('div')
                        post.setAttribute('class', 'post_content')
                        post.setAttribute('data-postid', t.id)
                        postbox.appendChild(post)

                        const time = document.createElement('div')
                        time.setAttribute('class', 'post_user')
                        let s = parseInt(t.meta.published) * 1000
                        time.innerText = new Date(s).toLocaleString()
                        post.appendChild(time)

                        const image = document.createElement('img')
                        image.setAttribute('src',`data:image/jpeg;base64,${t.thumbnail}`)
                        image.setAttribute('alt','failed to load')
                        image.setAttribute('class','post_image')
                        post.appendChild(image)

                        const text = document.createElement('div')
                        text.setAttribute('class', 'post_text')
                        text.innerText = t.meta.description_text
                        post.appendChild(text)

                        const like = document.createElement('div')
                        like.setAttribute('class', 'comment')
                        like.addEventListener("click", likePost.bind(null, t.id))
                        let li = t.meta.likes
                        if(li.length>0)
                        {
                            let likes = ""
                            li.map(nl => {
                                let url = 'http://localhost:5000/user?id=' + nl
                                const r = fetch(url, {
                                    method: "GET",
                                    headers: {
                                        'Authorization': 'Token ' + localStorage.getItem('loginToken'),
                                    },
                                }).then(uss => {
                                    uss.json().then(r =>{
                                        likes = likes + r.username + ", "
                                    }).then(() => {
                                        like.innerText = "💚 " + likes.slice(0, -2) + " liked this post"
                                    })
                                })
                            })
                        }
                        else
                        {
                            like.innerText = "💚 Like"
                        }
                        post.appendChild(like)

                        let cmt = t.comments
                        if(cmt.length>0)
                        {
                            cmt.map(comt => {
                                const comment = document.createElement('div')
                                comment.setAttribute('class', 'user_comment')
                                let s = parseInt(comt.published) * 1000
                                let time = new Date(s).toLocaleString()
                                comment.innerText = "💬 " + comt.author + " commented: " + comt.comment + " at " + time
                                post.appendChild(comment)
                            })
                            const comment = document.createElement('div')
                            comment.setAttribute('class', 'comment')
                            comment.innerText = "💬 Comment"
                            post.appendChild(comment)
                        }
                        else
                        {
                            const comment = document.createElement('div')
                            comment.setAttribute('class', 'comment')
                            comment.innerText = "💬 Comment"
                            post.appendChild(comment)
                        }
                    })
                })
            })
        })
    })
}
close.onclick = function() {
    info.style.display = "none";
    while (win.childNodes.length > 2) {
        win.removeChild(win.lastChild);
    }
}
window.onclick = function(event) {
    if (event.target == info) {
        info.style.display = "none";
    }
}
function fetchPost(post, len)
{
    let url = 'http://localhost:5000/user/feed?p=' + post + "&n=" + len
    const postbox = document.getElementById('posts')
    const r = fetch(url,{
        method: "GET",
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('loginToken')
        },
    }).then(r => {
        r.json().then(data => {
            const posts = data['posts']
            if(posts.length < 5)
            {
                at_end=true;
            }
            current_page+=5;
            posts.map(pst => {
                const post = document.createElement('div')
                post.setAttribute('class', 'post_content')
                post.setAttribute('data-postid', pst.id)
                postbox.appendChild(post)

                const author = document.createElement('div')
                author.setAttribute('class', 'post_user')
                author.innerText = pst.meta.author
                author.setAttribute('cursor', 'pointer')
                author.addEventListener("click", userInfo.bind(null, pst.meta.author, false))
                post.appendChild(author)

                const time = document.createElement('div')
                time.setAttribute('class', 'post_time')
                let s = parseInt(pst.meta.published) * 1000
                time.innerText = new Date(s).toLocaleString()
                post.appendChild(time)

                const image = document.createElement('img')
                image.setAttribute('src',`data:image/jpeg;base64,${pst.thumbnail}`)
                image.setAttribute('alt','failed to load')
                image.setAttribute('class','post_image')
                post.appendChild(image)

                const text = document.createElement('div')
                text.setAttribute('class', 'post_text')
                text.innerText = pst.meta.description_text
                post.appendChild(text)

                const like = document.createElement('div')
                like.setAttribute('class', 'comment')
                like.addEventListener("click", likePost.bind(null, pst.id))
                let li = pst.meta.likes
                if(li.length>0)
                {
                    let likes = ""
                    li.map(nl => {
                        let url = 'http://localhost:5000/user?id=' + nl
                        const r = fetch(url, {
                            method: "GET",
                            headers: {
                                'Authorization': 'Token ' + localStorage.getItem('loginToken'),
                            },
                            }).then(uss => {
                            uss.json().then(r =>{
                                likes = likes + r.username + ", "
                            }).then(() => {
                                like.innerText = "💚 " + likes.slice(0, -2) + " liked this post"
                            })
                        })
                    })
                }
                else
                {
                    like.innerText = "💚 Like"
                }
                post.appendChild(like)

                let cmt = pst.comments
                if(cmt.length>0)
                {
                    cmt.map(comt => {
                        const comment = document.createElement('div')
                        comment.setAttribute('class', 'user_comment')
                        let s = parseInt(comt.published) * 1000
                        let time = new Date(s).toLocaleString()
                        comment.innerText = "💬 " + comt.author + " commented: " + comt.comment + " at " + time
                        post.appendChild(comment)
                    })
                    const comment = document.createElement('div')
                    comment.setAttribute('class', 'comment')
                    comment.innerText = "💬 Comment"
                    post.appendChild(comment)
                }
                else
                {
                    const comment = document.createElement('div')
                    comment.setAttribute('class', 'comment')
                    comment.innerText = "💬 Comment"
                    post.appendChild(comment)
                }

            })
        })
    })
}
function fll(username)
{
    let url = 'http://localhost:5000/post/follow?username=' + username
    const r = fetch(url, {
        method: "PUT",
        headers: {
            'Authorization': 'Token ' + localStorage.getItem('loginToken')
        },
    }).then(() =>
        {
            location.reload()
        }
    )
}