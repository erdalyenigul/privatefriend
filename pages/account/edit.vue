<template>
  <div class="container">
    <div class="errorMsg emailVerified" v-if="email_verified">
      E-posta adresiniz onaylanmadı, lütfen e-postanıza gidin ve onaylayın. <br> Onayladıktan sonra sayfayı yenileyin.
    </div>
    <div class="modalWrap" v-if="showBigPPModal">
      <div class="modalContent">
        <a class="modalCloseBtn" @click="showBigPPModal = false "><font-awesome-icon icon="times" /></a>
        <div class="showBigPPModal">
          <img :src="account.pPhoto" :alt="account.name">
        </div>
      </div>
    </div>
    <div class="profileWrap" v-if="!email_verified && setData">
      <div class="profileInfoHead">
        <div v-if="loading" class="loadingBar"><img src="@/assets/images/loading.gif" alt=""> Fotoğraf yükleniyor, lütfen bekleyin...</div>
        <div class="profilPhoto">
          <img v-if="account.pPhoto" :src="account.pPhoto" :alt="account.name" @click="showBigPP">
        </div>
        <ul>
          <li class="fullName">{{ account.name }} {{ account.surname }}</li>
          <li class="email">{{ account.email }}</li>
          <li class="complateProfileBtn">
            <image-uploader :preview=false outputFormat="blob" :maxWidth="512" :quality="0.7" @input="setImage">
              <label for="fileInput" class="button primaryBtn imageUploaderBtn" slot="upload-label">
                <span class="upload-caption">{{
                  hasImage ? "Profil fotoğrafı yükle" : "Profil fotoğrafı yükle"
                }}</span>
                <font-awesome-icon icon="image" />
              </label>
            </image-uploader>
            <nuxt-link to="profile" class="button">
              Profilimi gör <font-awesome-icon icon="angle-right" />
            </nuxt-link>
          </li>
          <li v-if="account.pPhoto">
            <a class="removePphoto" @click="removePphoto">Profil fotoğrafımı kaldır</a>
          </li>
        </ul>
      </div>
      <form @submit.prevent="saveProfile">
        <div class="profileDetail">
          <div class="pdLine textarea">
            <div class="pdHead">Biyografi* <span>{{ charactersLeft }}</span></div>
            <span class="textareaWrap">
              <textarea v-model="account.person.biography" placeholder="En az 80 karakter"></textarea>
            </span>
          </div>
          <div class="pdLine mb40">
            <div class="uiLineLeft">Şehir*</div>
            <div class="uiLineRight"><input required v-model="account.person.city" type="text" name="" placeholder="Şehir"></div>
          </div> 
          <div class="pdLine">
            <div class="uiLineLeft">İş</div>
            <div class="uiLineRight">
              <input v-model="account.other.job" type="text" name="" placeholder="İş">
            </div>
          </div>
          <div class="pdLine">
            <div class="uiLineLeft">Eğitim</div>
            <div class="uiLineRight">
              <input v-model="account.other.education" type="text" name="" placeholder="Eğitim">
            </div>
          </div>
          <div class="pdLine longMB">
            <div class="uiLineLeft">Burç</div>
            <div class="uiLineRight">
              <input v-model="account.other.zodiac_sign" type="text" name="" placeholder="Burç">
            </div>
          </div>
          <div class="pdLine textarea">
            <div class="pdHead">İlgi alanları</div>
            <span class="textareaWrap">
              <textarea v-model="account.other.interest"></textarea>
            </span>
          </div>
          <div class="pdLine textarea">
            <div class="pdHead">Sevdiği filmler</div>
            <span class="textareaWrap">
              <textarea v-model="account.other.movies"></textarea>
            </span>
          </div>
          <div class="pdLine textarea">
            <div class="pdHead">Sevdiği müzik grupları/sanatçılar</div>
            <span class="textareaWrap">
              <textarea v-model="account.other.music"></textarea>
            </span>
          </div>
          <div class="notify success" v-if="notify">
            <span>{{ notifyMsg }}</span>
            <font-awesome-icon :icon="notifyIcon" />
          </div>
        </div>
        <div class="bottomBtns">
          <button class="button primaryBtn saveBtn" type="submit">Kaydet <font-awesome-icon icon="save" /></button>
          <nuxt-link to="profile" class="button secondaryBtn backToProfile">
            Vazgeç <font-awesome-icon icon="angle-right" />
          </nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  data() {
    return {
      lang: {
        formatLocale: {
          firstDayOfWeek: 1,
          months: ['Ocak', 'Şubat', 'March', 'April', 'May', 'Haziran', 'July', 'August', 'September', 'October', 'November', 'December'],
        },
      },
      emailVerified: false,
      user: '',
      email_verified: false,     
      ppImage: false,
      ppImageFile: '',
      userID: '',
      notify: false,
      notifyMsg: '',
      notifyIcon: '',
      setData: false,
      showBigPPModal: false,
      checkUserPP: '',
      loading: false,
      image: '',
      hasImage: '',

      account: {
        pPhoto: '',
        name: '',
        surname: '',
        email: '',
        person : {
          biography: '',
          gender:'',
          age:'',
          birthday:'',
          city:'',
        },
        other: {
          interest: '',
          job: '',
          education: '',
          zodiac_sign: '',
          movies: '',
          music: '',
        }
      }
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
  computed: {
    charactersLeft() {
        var char = this.account.person.biography.length,
        limit = 80;
        return (limit - char) + " / " + limit + " karakter kaldı.";
      }
  },
  methods: {
    async userGetAccount(){
      let self = this;
      await firebase.auth().onAuthStateChanged(user => {
        if (user) {
          self.userID = user.uid;
          if(user.emailVerified) {
            this.email_verified = false;
            firebase.firestore().collection("profiles").where("uid", "==", self.userID).get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                self.account = doc.data().account;
              });
              self.checkUserPP = firebase.storage().ref('profiles/' + this.userID).name;
              self.setData = true;
            });

            firebase.storage().ref('profiles/' + self.userID).getDownloadURL()
            .then(function(url) {
              self.ppImage = url;
            })
            .catch(function(error) {
              console.log(error.message);
            });
          } else {
            this.email_verified = true;
          }
        }
      });
    },
    saveProfile() {
      let self = this;
      if(this.account.person.biography.length >= 80) {
        firebase.firestore().collection("profiles").doc(self.userID).set({
          account: self.account
        }, { merge: true })
        .then(function() {
          self.notify = true;
          self.notifyMsg = 'Profil başarıyla güncellendi';
          self.notifyIcon = 'check';
          setTimeout(() => {
            self.notify = false;
          }, 5000);
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
      } else { 
        self.notify = true;
        self.notifyIcon = 'exclamation-circle';
        self.notifyMsg = 'Biyografi en az 80 karakter olmalı.';
        setTimeout(() => {
          this.notify = false;
        }, 5000);
      }
    },
    setImage(blob) {
      self.loading = true;
      this.hasImage = true;
      this.image = blob;
      this.updatePP();
    },
    async updatePP() {
      var self = this;

      let storageRef = firebase.storage().ref('profiles/' + self.userID);
      if(storageRef){
        storageRef.delete().then(function() {}).catch(function(error) {});
      }
      
      let uploadTask = storageRef.put(this.image);
      await uploadTask.then(function() {        

        firebase.storage().ref('profiles/' + self.userID).getDownloadURL()
        .then(function(url) {
          self.account.pPhoto = url;
          firebase.firestore().collection("profiles").doc(self.userID).set({
            account: {
              pPhoto: url
            }
          }, { merge: true })
          .then(function() {
            self.loading = false;
            self.notify = true;
            self.notifyMsg = 'Profil fotoğrafı yüklendi';
            self.notifyIcon = 'check';
            setTimeout(() => {
              self.notify = false;
            }, 5000);
          })
          .catch(function(error) {
            console.error("Error writing document: ", error);
          });

        })
        .catch(function(error) {
          console.log(error.message);
        });
      },error => {
        console.log(error.message);
      });
    },
    showBigPP() {
      this.showBigPPModal = true;
    },
    removePphoto() {
      var self = this;

      firebase.storage().ref('profiles/' + self.userID).delete().then(function() {
        self.account.pPhoto = false;

        firebase.firestore().collection('profiles').doc(self.userID).set({
          account: {
            pPhoto: self.account.pPhoto
          }
        }, { merge: true })
        .then(function() {
          self.notify = true;
          self.notifyMsg = 'Profil fotoğrafı silindi';
          self.notifyIcon = 'check';
          setTimeout(() => {
            self.notify = false;
          }, 5000);
        }).catch(function(error) {
          console.log(error)
        });
        
        
      }).catch(function(error) {
        console.log(error)
      });
    }
  }
}
</script>