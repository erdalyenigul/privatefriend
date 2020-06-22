<template>
  <div class="container">
    <div class="notify success" v-if="notify">
      <span>{{ notifyMsg }}</span>
      <font-awesome-icon :icon="notifyIcon" />
    </div>
    <div class="modalWrap" v-if="accountPhotoBigModal">
      <div class="modalContent">
        <a class="modalCloseBtn" @click="accountPhotoBigModal = false "><font-awesome-icon icon="times" /></a>
        <div class="showBigPPModal">
          <img :src="accountPhotoBigUrl">
        </div>
      </div>
    </div>
    <div class="uploadAccountPhotoWrap">
      <div class="uploadPhotosWrap">
        <div class="uploadBtn">
          <image-uploader class="imageUploaderWrap" outputFormat="blob" :maxWidth="512" :quality="0.7" :preview=false @input="setImage">
            <label for="fileInput" class="button primaryBtn imageUploaderBtn" slot="upload-label">
              <span class="upload-caption">{{
                hasImage ? "Fotoğraf seç" : "Fotoğraf seç"
              }}</span>
              <font-awesome-icon icon="image" />
            </label>
          </image-uploader>
        </div>
        <div v-if="loading" class="loadingBar"><img src="@/assets/images/loading.gif" alt=""> Fotoğraf yükleniyor, lütfen bekleyin...</div>
        <div class="uploadPreviewPhoto" v-if="previewWrap">
          <img :src="uploadPreviewPhoto" alt="">
        </div>
      </div>
      <div class="accountPhotos">
        <div class="accountUploaded" v-if="accountPhotos.length > 0">Fotoğraf albümü</div>
        <div class="imgsLine">
          <div class="imgWrap" v-for="photo in accountPhotos">
            <div class="imgContent">
              <a class="removePhoto" @click="removePhoto(photo.name)">Sil</a>
              <img :src="photo.url" @click="accountPhotoBig(photo.url)">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  data() {
    return {
      imageFile: '',
      imageFileName: '',
      uploadPreviewPhoto: '',
      userId: '',
      previewWrap: false,
      notify: false,
      notifyMsg: '',
      notifyIcon: '',
      accountPhotos: [],
      accountPhotoBigModal: false,
      accountPhotoBigUrl: false,
      loading: false,
      image: '',
      hasImage: '',
      imageName: '',
      inputWatch: '',
    }
  },
  asyncData({ req, redirect, route }) {
    if (process.server) {
      var user = getUserFromCookie(req);
      if (!user) {
        redirect("/");
      } else {        
        
      }
    }
  },
  mounted() {
    this.userGetAccount();

    const fileInput = document.querySelector('#fileInput');
    fileInput.addEventListener('change', (event) => {
      console.log('degisti');
      this.loading = true;
    });
  },
  methods: {
    async getPhotos() {
      this.accountPhotos = [];
      let self = this;
      let storageRef = firebase.storage().ref(self.userId)
      await storageRef.listAll().then(function(result) {
        result.items.forEach(function(imageRef) {
          displayImage(imageRef)
        });
      }).catch(function(error) {

      });
      function displayImage(imageRef) {
        imageRef.getDownloadURL().then(function(url) {
          var item = {};
          item.url = url;
          item.name = imageRef.name;
          self.accountPhotos.push(item);
        }).catch(function(error) {});
        var item = {};
      }
    },
    async userGetAccount(){
      let self = this;
      await firebase.auth().onAuthStateChanged(user => {
        if (user) {
          self.userId = user.uid;
          self.getPhotos();          
        }
      })
    },
    setImage(blob) {
      this.hasImage = true;
      this.image = blob;
      this.imageName = document.querySelector('#fileInput').value;
      this.imageName = this.imageName.replace(/.*[\/\\]/, '');
      this.updatePhoto();
    },
    async updatePhoto() {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + time;

      var self = this;
      let storageRef = firebase.storage().ref(self.userId).child(self.imageName + dateTime)
      let uploadTask = storageRef.put(this.image);
      await uploadTask.then(function() {
        self.previewWrap = false;
        document.querySelector('.imageUploaderWrap img').src = "";
        self.notify = true;
        self.notifyMsg = 'Fotoğraf başarıyla yüklendi';
        self.notifyIcon = 'check';
        setTimeout(() => {
          self.notify = false;
        }, 5000);
        self.image = false;
        self.hasImage = false;
        self.loading = false;
        self.getPhotos();
      },error => {
        console.log(error.message);
      });
    },
    accountPhotoBig(photoUrl) {
      this.accountPhotoBigModal = true;
      this.accountPhotoBigUrl = photoUrl
    },
    removePhoto(photo) {
      var self = this;
      let storageRef = firebase.storage().ref(self.userId).child(photo)
      storageRef.delete().then(function() {
        self.getPhotos();
      }).catch(function(error) {
        console.log(error)
      });
    }
  }
}
</script>