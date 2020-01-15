const config = {
    apiKey: "AIzaSyDzziLKhKX2k5yAE-bfABRfw9Vpdv2qlSw",
    authDomain: "form-b69bf.firebaseapp.com",
    databaseURL: "https://form-b69bf.firebaseio.com",
    projectId: "form-b69bf",
    storageBucket: "form-b69bf.appspot.com",
    messagingSenderId: "263941002458",
    appId: "1:263941002458:web:386fb832bd21c3648bc1e3",
    measurementId: "G-JR5B3VZ2XB"
};

firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById("logout-div").style.display = "block";
        document.getElementById("login-div").style.display = "none";

        const user = firebase.auth().currentUser;

        if (user != null) {
            document.getElementById("user-email").innerHTML = user.email;
            // firebase.database().ref('firebase_auths/' + user.uid).set({ email: user.email });
        }

        const imgRef = firebase.storage().ref(`uploaded_images/${user.uid}`);

        imgRef.listAll().then(async function (res) {
            const files = [];
            for (const item of res.items) {
                files.push(`<li><a href="${await getDownloadURL(item.fullPath)}" target="_blank">${item.name}</a></li>`);
            }
            if (files.length) {
                document.getElementById("files").innerHTML = files.join(' ');
            } else {
                document.getElementById("gallery").style.display = "none";
                document.getElementById("files").style.display = "none";
            }
        }).catch(function (error) {
            console.log(error);
        });

    } else {
        document.getElementById("logout-div").style.display = "none";
        document.getElementById("login-div").style.display = "block";
    }
});

const getDownloadURL = path => new Promise(resolve => {
    firebase.storage().ref(path).getDownloadURL().then(function(url) {
        return resolve(url);
    });
});

function login() {
    const userEmail = document.getElementById("emailId").value;
    const userPass = document.getElementById("passcode").value;

    return firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
        console.log(error.message, error.code);
        window.alert(error.message, error.code);
    });
}

function register() {
    const userEmail = document.getElementById("emailId").value;
    const userPass = document.getElementById("passcode").value;

    return firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).catch(function (error) {
        console.log(error.message);
        window.alert(error.message, error.code);
    });
}

function logout() {
    return firebase.auth().signOut();
}

const uploader = document.getElementById("uploader");
const fileButton = document.getElementById("file-btn");

fileButton.addEventListener('change', e => {
    const file = e.target.files[0];
    const user = firebase.auth().currentUser

    const ref = firebase.storage().ref(`uploaded_images/${user.uid}/${file.name}`);
    const task = ref.put(file);
    task.on('state_changed',
        function progress(snapshot) {
            const percentage = (snapshot.bytesTransferred /
                snapshot.totalBytes) * 100;

            uploader.value = percentage;
            document.getElementById("progress").innerHTML = percentage.toFixed() + "%";
        },
        function error(err) {
            console.log(err);
        },
        function complete() {
            console.log("Uploaded!");
            location.reload();
        }
    );
});
