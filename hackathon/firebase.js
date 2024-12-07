

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, set, ref, get, remove, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyArOIWskOtGYShlEN51YewdA2bzApdbLvc",
    authDomain: "hackathon-1d9c5.firebaseapp.com",
    projectId: "hackathon-1d9c5",
    storageBucket: "hackathon-1d9c5.appspot.com",
    messagingSenderId: "347826779812",
    appId: "1:347826779812:web:be294e92ceebba1771d831",
    measurementId: "G-PF00BFZ6GG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Redirect to sign-in page
function redirectToSignin() {
    window.location.href = "signin.html";
}

document.addEventListener('DOMContentLoaded', function () {
    const signindirect = document.getElementById('signindirect');
    if (signindirect) {
        signindirect.addEventListener('click', redirectToSignin);
    }

    // Sign-up logic
    const signup = document.getElementById('signup');
    if (signup) {
        signup.addEventListener('click', signupuser);
    }

    // Sign-in logic
    const signinButton = document.getElementById('signin');
    if (signinButton) {
        signinButton.addEventListener('click', signInUser);
    }

    // Sign-out logic
    const signOutButton = document.getElementById('signoutButton');
    if (signOutButton) {
        signOutButton.addEventListener('click', signOutUser);
    }
});

// Sign-up function
function signupuser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User signed up:", userCredential.user.uid);
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Error: ", error.message);
            alert("Sign-up failed: " + error.message);
        });
}

// Sign-in function
function signInUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User signed in:", userCredential.user.uid);
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Error: ", error.message);
            alert("Sign-in failed. Please check your credentials.");
        });
}

// Sign-out function
function signOutUser() {
    signOut(auth)
        .then(() => {
            alert("You have signed out successfully!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Sign-out error:", error.message);
            alert("Sign-out failed. Please try again.");
        });
}

console.log("Firebase initialized successfully.");

// Reference to notify div and post button
const notify = document.querySelector('.notify');
const addpostbtn = document.querySelector('#post_btn');

// Add post function
function AddPost() {
  const title = document.querySelector('#title').value;
  const postcontent = document.querySelector('#post_content').value;

  if (title === '' || postcontent === '') {
    notify.innerHTML = "Title and Post content are required.";
    return;
  }

  const id = Math.floor(Math.random() * 10000);

  set(ref(db, 'posts/' + id), {
    title: title,
    postcontent: postcontent
  }).then(() => {
    notify.innerHTML = "Post added successfully!";
    document.querySelector('#title').value = "";
    document.querySelector('#post_content').value = "";
  }).catch((error) => {
    notify.innerHTML = `Error: ${error.message}`;
  });
}

// Event listener for the Post button
addpostbtn.addEventListener('click', AddPost);

// Get data from Firebase
function getpostdata() {
  const user_ref = ref(db, 'posts/');
  get(user_ref).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      let html = "";
      const table = document.querySelector('table');

      for (const key in data) {
        const { title, postcontent } = data[key];
        html += `
          <tr>
            <td>${title}</td>
            <td>${postcontent}</td>
            <td><button class="delete" onclick="deletedata('${key}')">Delete</button></td>
            <td><button class="update" onclick="updatedata('${key}')">Update</button></td>
          </tr>
        `;
      }
      table.innerHTML = html;
    } else {
      notify.innerHTML = "No data available";
    }
  }).catch((error) => {
    notify.innerHTML = `Error: ${error.message}`;
  });
}

// Fetch and display posts on initial load
getpostdata();

// Real-time listener for updates to the posts
const user_ref = ref(db, 'posts/');
onValue(user_ref, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    let html = "";
    const table = document.querySelector('table');

    for (const key in data) {
      const { title, postcontent } = data[key];
      html += `
        <tr>
          <td>${title}</td>
          <td>${postcontent}</td>
          <td><button class="delete" onclick="deletedata('${key}')">Delete</button></td>
          <td><button class="update" onclick="updatedata('${key}')">Update</button></td>
        </tr>
      `;
    }
    table.innerHTML = html;
  } else {
    notify.innerHTML = "No data available";
  }
});

// Function to delete post
window.deletedata = function(key) {
  remove(ref(db, 'posts/' + key))
    .then(() => {
      notify.innerHTML = "Post deleted successfully!";
    })
    .catch((error) => {
      notify.innerHTML = `Error: ${error.message}`;
    });
};

// Function to update post
window.updatedata = function(key) {
  const user_ref = ref(db, `posts/${key}`);
  get(user_ref).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.querySelector('#title').value = data.title;
      document.querySelector('#post_content').value = data.postcontent;

      const update_btn = document.querySelector('.update_btn');
      update_btn.classList.add('show');
      document.querySelector('.post_btn').classList.add('hide');

      const post_btn = document.querySelector('.post_btn');

      const updateForm = function updateform() {
        const title = document.querySelector('#title').value;
        const postcontent = document.querySelector('#post_content').value;

        update(ref(db, `posts/${key}`), {
          title: title,
          postcontent: postcontent
        }).then(() => {
          document.querySelector('#title').value = "";
          document.querySelector('#post_content').value = "";
          update_btn.classList.remove('show');
          post_btn.classList.remove('hide');
          notify.innerHTML = "Post updated successfully!";
        }).catch((error) => {
          notify.innerHTML = `Error: ${error.message}`;
        });
      };

      update_btn.removeEventListener('click', updateForm);
      update_btn.addEventListener('click', updateForm);
    }
  }).catch((error) => {
    notify.innerHTML = `Error: ${error.message}`;
  });
};