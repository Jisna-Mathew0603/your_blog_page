function upload() {
    // Get your image
    var image = document.getElementById("image").files[0];
    // Get your blog text
    var post = document.getElementById("post").value;
    // Get image name
    var imageName = image.name;
    // Firebase storage reference
    var storageRef = firebase.storage().ref("images/" + imageName);
    // Upload image to selected storage reference
    var uploadTask = storageRef.put(image);
    
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("upload is " + progress + " done");
      },
      function (error) {
        console.log(error.message);
      },
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          // Push data to database
          firebase.database().ref("blogs/").push().set(
            {
              text: post,
              imageURL: downloadURL,
            },
            function (error) {
              if (error) {
                alert("Error while uploading");
              } else {
                alert("Successfully uploaded");
                document.getElementById("post-form").reset();
                getdata();
              }
            }
          );
        });
      }
    );
}

window.onload = function () {
    getdata();
};

function getdata() {
    firebase.database().ref("blogs/").once("value").then(function (snapshot) {
        var posts_div = document.getElementById("posts");
        posts_div.innerHTML = "";
        var data = snapshot.val();
        console.log(data);
        
        for (let [key, value] of Object.entries(data)) {
            posts_div.innerHTML +=
                "<div class='col-sm-4 mt-2 mb-1'>" +
                "<div class='card'>" +
                "<img src='" + value.imageURL + "' style='height:250px;'>" +
                "<div class='card-body'>" +
                "<p class='card-text'>" + value.text + "</p>" +
                "<button class='btn btn-warning' id='" + key + "' onclick='edit_post(this.id)'>Edit</button>" + 
                "<button class='btn btn-danger' id='" + key + "' onclick='delete_post(this.id)'>Delete</button>" +
                "</div></div></div>";
        }
    });
}

function edit_post(key) {
    // Get the post to edit
    firebase.database().ref("blogs/" + key).once("value").then(function(snapshot) {
        var post = snapshot.val();
        document.getElementById("post").value = post.text; // Set the post text in textarea
        document.getElementById("image").value = ""; // Clear the file input
        // Optionally, you could store the key somewhere to use it during the update
        document.getElementById("post-form").setAttribute("data-edit-key", key);
    });
}

function update_post() {
    // Get the edit key from the form
    var key = document.getElementById("post-form").getAttribute("data-edit-key");
    var post = document.getElementById("post").value;

    // Update the post in Firebase
    firebase.database().ref("blogs/" + key).update({
        text: post,
    }).then(function() {
        alert("Post updated successfully");
        document.getElementById("post-form").reset();
        getdata();
    }).catch(function(error) {
        alert("Error updating post: " + error.message);
    });
}

function delete_post(key) {
    firebase.database().ref("blogs/" + key).remove().then(function() {
        alert("Post deleted successfully");
        getdata();
    });
}
