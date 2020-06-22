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
    <div class="headline">Fotoğraflar</div>
    <div class="uploadAccountPhotoWrap">
      <div class="accountPhotos">
        <div class="accountUploaded" v-if="accountPhotos.length > 0">Fotoğraf albümü</div>
        <div class="accountUploaded" v-if="accountPhotos.length == 0">Fotoğraf albümü boş.</div>
        <div class="imgsLine">
          <div class="imgWrap" v-for="photo in accountPhotos">
            <div class="imgContent">
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
      friendID: '',
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
    this.friendID = this.$route.params.friendPhotos;
    this.getPhotos();
  },
  methods: {
    async getPhotos() {
      this.accountPhotos = [];
      let self = this;
      let storageRef = firebase.storage().ref(self.friendID)
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
          self.accountPhotos.push(item);
        }).catch(function(error) {});
        var item = {};
      }
    },
    accountPhotoBig(photoUrl) {
      this.accountPhotoBigModal = true;
      this.accountPhotoBigUrl = photoUrl
    },
  }
}
</script>