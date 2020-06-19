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
          <input type="file" ref="uploadPP" @change="previewPhoto($event)" class="uploadPPInput">
          <a @click="$refs.uploadPP.click()" class="button primaryBtn">
            Fotoğraf seç <font-awesome-icon icon="image" />
          </a>
          <a v-if="previewWrap" class="button primaryBtn savePhotoBtn" @click="updatePhoto">
            Yükle <font-awesome-icon icon="cloud-upload-alt" />
          </a>
        </div>
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
    previewPhoto(e) {
      if(e.target.files[0]) {
        this.previewWrap = true;
        this.imageFile = e.target.files[0];
        this.imageFileName = e.target.files[0].name;
        this.uploadPreviewPhoto = URL.createObjectURL(this.imageFile);
      }
    },
    async updatePhoto(e) {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + time;

      var self = this;
      let storageRef = firebase.storage().ref(self.userId).child(self.imageFileName + dateTime)
      let uploadTask = storageRef.put(this.imageFile);
      await uploadTask.on("state_changed", snapshot => {
        self.previewWrap = false;

        self.notify = true;
        self.notifyMsg = 'Fotoğraf başarıyla yüklendi';
        self.notifyIcon = 'check';
        setTimeout(() => {
          self.notify = false;
        }, 5000);

        self.accountPhotos = [];
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